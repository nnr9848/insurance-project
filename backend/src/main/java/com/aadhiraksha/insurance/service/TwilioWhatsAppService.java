package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.BusinessProfile;
import com.aadhiraksha.insurance.repository.BusinessProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Enterprise Service for dispatching high-impact promotional broadcasts,
 * offer launches, and notifications via the official Twilio WhatsApp API.
 * 
 * Reuses existing Twilio Account SID & Auth Token credentials.
 * Decoupled and reusable for future transactional or conversational use cases.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TwilioWhatsAppService {

    private final BusinessProfileRepository businessProfileRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${twilio.account-sid:}")
    private String envAccountSid;

    @Value("${twilio.api-key-sid:}")
    private String envApiKeySid;

    @Value("${twilio.api-key-secret:}")
    private String envApiKeySecret;

    @Value("${twilio.whatsapp-from-number:whatsapp:+14155238886}")
    private String envWhatsAppFromNumber;

    @Value("${twilio.whatsapp-content-sid:}")
    private String envWhatsAppContentSid;

    @Value("${twilio.whatsapp-enabled:false}")
    private boolean envWhatsAppEnabled;

    /**
     * Sends a single WhatsApp message via Twilio WhatsApp API.
     * Uses enterprise API Key SID (SK...) and API Key Secret for authentication.
     * Formats numbers to E.164 with the 'whatsapp:' prefix required by Twilio.
     */
    public boolean sendWhatsAppMessage(String recipientPhone, String messageBody) {
        String cleanPhone = sanitizePhoneNumber(recipientPhone);
        if (cleanPhone.isEmpty()) {
            log.warn("[Twilio WhatsApp] Cannot send WhatsApp to blank or invalid phone number.");
            return false;
        }

        String accountSid = getAccountSid();
        String apiKeySid = getApiKeySid();
        String apiKeySecret = getApiKeySecret();
        String fromWhatsApp = getWhatsAppFromNumber();
        boolean isEnabled = isWhatsAppEnabled();

        if (!isEnabled || accountSid.isBlank() || apiKeySid.isBlank() || apiKeySecret.isBlank() || fromWhatsApp.isBlank()) {
            log.info("[Twilio WhatsApp MOCK] Notifications disabled or API Key credentials missing. Message to {}: {}", 
                    cleanPhone, messageBody);
            return false;
        }

        // Twilio requires 'whatsapp:+[E.164]' for both From and To
        String destination = cleanPhone.startsWith("+") ? cleanPhone : "+91" + cleanPhone;
        String formattedTo = destination.startsWith("whatsapp:") ? destination : "whatsapp:" + destination;
        String formattedFrom = fromWhatsApp.startsWith("whatsapp:") ? fromWhatsApp : "whatsapp:" + fromWhatsApp;

        log.info("[Twilio WhatsApp DISPATCH] Attempting WhatsApp dispatch: From='{}' -> To='{}'", formattedFrom, formattedTo);

        String contentSid = getContentSid();

        try {
            String twilioUrl = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Basic Auth: ApiKeySID:ApiKeySecret
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (apiKeySid + ":" + apiKeySecret).getBytes(StandardCharsets.UTF_8)
            );
            headers.set("Authorization", authHeader);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("To", formattedTo);
            requestBody.add("From", formattedFrom);

            // If a Meta approved WhatsApp Content Template (HX...) is configured, use Content API parameters
            if (contentSid != null && !contentSid.isBlank()) {
                requestBody.add("ContentSid", contentSid);
                // Twilio ContentVariables JSON format for placeholders {"1":"...", "2":"..."}
                String cleanBody = messageBody.replaceAll("[\"\\r\\n]", " ").trim();
                requestBody.add("ContentVariables", String.format("{\"1\":\"%s\"}", cleanBody));
            } else {
                requestBody.add("Body", messageBody);
            }

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(twilioUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[Twilio WhatsApp SUCCESS] Dispatched to {} (HTTP {})", formattedTo, response.getStatusCode());
                return true;
            } else {
                log.error("[Twilio WhatsApp ERROR] Twilio status {}: {}", response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            String errorBody = ex.getResponseBodyAsString();
            log.error("[Twilio WhatsApp HTTP ERROR] Twilio status {}: {}", ex.getStatusCode(), errorBody);

            // Handle Error 21654: Meta requires ContentSid for outbound notifications outside 24h window
            if (errorBody != null && errorBody.contains("21654") && (contentSid == null || contentSid.isBlank())) {
                log.warn("[Twilio WhatsApp META NOTICE] WhatsApp outbound initiation requires a pre-approved template (ContentSid). "
                        + "Please configure a WhatsApp Content Template SID (HX...) in CRM Integrations settings.");
            }
            return false;
        } catch (Exception ex) {
            log.error("[Twilio WhatsApp EXCEPTION] Error dispatching WhatsApp to {}: {}", formattedTo, ex.getMessage());
            return false;
        }
    }

    /**
     * Broadcasts an offer or announcement asynchronously to a list of phone numbers.
     */
    @Async
    public void broadcastWhatsAppOffers(List<String> phoneNumbers, String announcementTitle, String announcementBody) {
        if (phoneNumbers == null || phoneNumbers.isEmpty()) return;

        String formattedBroadcast = String.format(
            "🌟 *%s*\n\n%s\n\n_— Aadhiraksha Insurance Leadership Team_\nhttps://www.aadhirakshainsurance.com",
            announcementTitle, announcementBody
        );

        int sent = 0;
        int failed = 0;

        for (String phone : phoneNumbers) {
            boolean success = sendWhatsAppMessage(phone, formattedBroadcast);
            if (success) sent++;
            else failed++;

            // Brief throttle (50ms) to respect rate limits
            try {
                Thread.sleep(50);
            } catch (InterruptedException ignored) {}
        }

        log.info("[Twilio WhatsApp BROADCAST COMPLETE] Title='{}', Sent={}, Failed={}", 
                announcementTitle, sent, failed);
    }

    public boolean isWhatsAppEnabled() {
        return businessProfileRepository.findAll().stream().findFirst()
                .map(profile -> profile.getTwilioWhatsappEnabled() != null ? profile.getTwilioWhatsappEnabled() : envWhatsAppEnabled)
                .orElse(envWhatsAppEnabled);
    }

    public String getWhatsAppFromNumber() {
        String num = businessProfileRepository.findAll().stream().findFirst()
                .map(BusinessProfile::getTwilioWhatsappFromNumber)
                .filter(s -> s != null && !s.isBlank())
                .orElse(envWhatsAppFromNumber);
        if (num != null && !num.isBlank()) {
            num = num.trim();
            if (!num.startsWith("whatsapp:")) {
                num = "whatsapp:" + num;
            }
        }
        return num != null ? num : "whatsapp:+14155238886";
    }

    private String getAccountSid() {
        return businessProfileRepository.findAll().stream().findFirst()
                .map(BusinessProfile::getTwilioAccountSid)
                .filter(s -> s != null && !s.isBlank())
                .orElse(envAccountSid);
    }

    private String getApiKeySid() {
        return businessProfileRepository.findAll().stream().findFirst()
                .map(BusinessProfile::getTwilioApiKeySid)
                .filter(s -> s != null && !s.isBlank())
                .orElse(envApiKeySid);
    }

    private String getApiKeySecret() {
        return businessProfileRepository.findAll().stream().findFirst()
                .map(BusinessProfile::getTwilioApiKeySecret)
                .filter(s -> s != null && !s.isBlank())
                .orElse(envApiKeySecret);
    }

    private String getContentSid() {
        return businessProfileRepository.findAll().stream().findFirst()
                .map(BusinessProfile::getTwilioWhatsappContentSid)
                .filter(s -> s != null && !s.isBlank())
                .orElse(envWhatsAppContentSid);
    }

    private String sanitizePhoneNumber(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("[^0-9+]", "");
    }
}
