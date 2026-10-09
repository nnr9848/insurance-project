package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * MailboxProvisioningService
 * Handles automated provisioning and management of domain-based employee mailboxes (@aadhirakshainsurance.com)
 * integrating with the lightweight Stalwart Mail Server REST API on the Hostinger VPS.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailboxProvisioningService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${mailserver.enabled:true}")
    private boolean mailServerEnabled;

    @Value("${mailserver.domain:aadhirakshainsurance.com}")
    private String mailDomain;

    @Value("${mailserver.api-url:http://mailserver:8080/api}")
    private String mailServerApiUrl;

    @Value("${mailserver.api-secret:AadhirakshaMailSecret2026!}")
    private String mailServerApiSecret;

    @Value("${mailserver.webmail-url:https://mail.aadhirakshainsurance.com}")
    private String webmailUrl;

    /**
     * Generate standard username for employee (e.g. "ramesh.kumar" or custom alias)
     */
    public String sanitizeMailboxUsername(String fullName, String customAlias) {
        if (customAlias != null && !customAlias.trim().isEmpty()) {
            return customAlias.trim().toLowerCase().replaceAll("[^a-z0-9._-]", "");
        }
        if (fullName == null || fullName.trim().isEmpty()) {
            return "emp" + System.currentTimeMillis() % 10000;
        }
        String clean = fullName.trim().toLowerCase()
                .replaceAll("\\s+", ".")
                .replaceAll("[^a-z0-9._-]", "");
        if (clean.isEmpty()) {
            return "emp" + System.currentTimeMillis() % 10000;
        }
        return clean;
    }

    /**
     * Provisions a new domain mailbox for the given employee.
     */
    @Transactional
    public Map<String, Object> provisionEmployeeMailbox(Long userId, String customAlias, String initialPassword, User performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        String username = sanitizeMailboxUsername(user.getFullName(), customAlias);
        String fullDomainEmail = username + "@" + mailDomain;

        // Check if another employee already has this mailbox address
        userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(user.getId()) && fullDomainEmail.equalsIgnoreCase(u.getDomainMailboxEmail()))
                .findFirst()
                .ifPresent(conflict -> {
                    throw new IllegalArgumentException("Mailbox address " + fullDomainEmail + " is already assigned to " + conflict.getFullName());
                });

        String mailboxPassword = (initialPassword != null && !initialPassword.trim().isEmpty())
                ? initialPassword.trim()
                : CrmUserService.generateRandomPassword(12);

        // Attempt remote creation on Stalwart Mail Server container via REST API
        boolean remoteCreated = false;
        String providerMessage = "Mailbox registered in CRM directory.";

        try {
            if (mailServerEnabled) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(mailServerApiSecret);

                Map<String, Object> payload = new HashMap<>();
                payload.put("type", "individual");
                payload.put("name", username);
                payload.put("domain", mailDomain);
                payload.put("secret", mailboxPassword);
                payload.put("description", user.getFullName() + " (" + (user.getDesignation() != null ? user.getDesignation() : "Staff") + ")");
                payload.put("quota", 5368709120L); // 5GB in bytes

                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

                // Stalwart management endpoint: POST /api/account
                try {
                    ResponseEntity<String> response = restTemplate.postForEntity(mailServerApiUrl + "/account", requestEntity, String.class);
                    if (response.getStatusCode().is2xxSuccessful()) {
                        remoteCreated = true;
                        providerMessage = "Mailbox successfully created and active on mail." + mailDomain;
                    }
                } catch (Exception ex) {
                    log.warn("Remote mailserver API call failed or mailserver not yet initialized (fallback to DB queue): {}", ex.getMessage());
                    providerMessage = "Provisioned in CRM. Mail server sync scheduled (status: QUEUED).";
                }
            }
        } catch (Exception e) {
            log.error("Error communicating with mailserver container: {}", e.getMessage());
        }

        user.setHasDomainMailbox(true);
        user.setDomainMailboxEmail(fullDomainEmail);
        user.setMailboxStatus(remoteCreated ? "ACTIVE" : "QUEUED");
        user.setMailboxQuotaMb(5120);
        user.setMailboxCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Provisioned corporate domain mailbox {} for user ID: {} by admin: {}", fullDomainEmail, user.getId(), performedBy != null ? performedBy.getFullName() : "SYSTEM");

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("domainEmail", fullDomainEmail);
        result.put("mailboxPassword", mailboxPassword);
        result.put("status", user.getMailboxStatus());
        result.put("message", providerMessage);
        result.put("webmailUrl", webmailUrl);
        result.put("incomingServer", "mail." + mailDomain + " (IMAP SSL Port 993)");
        result.put("outgoingServer", "mail." + mailDomain + " (SMTP TLS Port 587)");
        return result;
    }

    /**
     * Reset password for an existing employee domain mailbox.
     */
    @Transactional
    public Map<String, Object> resetMailboxPassword(Long userId, String newPassword, User performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (!Boolean.TRUE.equals(user.getHasDomainMailbox()) || user.getDomainMailboxEmail() == null) {
            throw new IllegalArgumentException("User does not have an active domain mailbox.");
        }

        String password = (newPassword != null && !newPassword.trim().isEmpty())
                ? newPassword.trim()
                : CrmUserService.generateRandomPassword(12);

        String username = user.getDomainMailboxEmail().split("@")[0];

        try {
            if (mailServerEnabled) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(mailServerApiSecret);

                Map<String, Object> payload = new HashMap<>();
                payload.put("secret", password);

                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
                try {
                    restTemplate.put(mailServerApiUrl + "/account/" + username + "@" + mailDomain + "/secret", requestEntity);
                } catch (Exception ex) {
                    log.warn("Remote mailserver password update warning: {}", ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to update password on mail server container: {}", e.getMessage());
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("domainEmail", user.getDomainMailboxEmail());
        res.put("newPassword", password);
        res.put("webmailUrl", webmailUrl);
        return res;
    }

    /**
     * Returns server connection parameters for Outlook / Apple Mail / Android setup.
     */
    public Map<String, Object> getMailboxSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Map<String, Object> settings = new HashMap<>();
        settings.put("domainEmail", user.getDomainMailboxEmail());
        settings.put("hasMailbox", Boolean.TRUE.equals(user.getHasDomainMailbox()));
        settings.put("status", user.getMailboxStatus());
        settings.put("quotaMb", user.getMailboxQuotaMb());
        settings.put("webmailUrl", webmailUrl);
        settings.put("imapServer", "mail." + mailDomain);
        settings.put("imapPort", 993);
        settings.put("imapSecurity", "SSL/TLS");
        settings.put("smtpServer", "mail." + mailDomain);
        settings.put("smtpPort", 587);
        settings.put("smtpSecurity", "STARTTLS");
        return settings;
    }
}
