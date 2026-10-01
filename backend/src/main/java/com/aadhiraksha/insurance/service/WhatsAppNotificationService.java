package com.aadhiraksha.insurance.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Service for dispatching high-priority transactional and informational notifications 
 * to customers and policyholders via the official Meta WhatsApp Cloud API.
 * 
 * Free Tier includes 1,000 service conversations per month.
 */
@Service
@Slf4j
public class WhatsAppNotificationService {

    @Value("${whatsapp.enabled:false}")
    private boolean enabled;

    @Value("${whatsapp.api-url:https://graph.facebook.com/v19.0}")
    private String apiUrl;

    @Value("${whatsapp.phone-number-id:}")
    private String phoneNumberId;

    @Value("${whatsapp.access-token:}")
    private String accessToken;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send instant confirmation to user when they submit an insurance quote/lead inquiry.
     */
    @Async
    public void sendLeadInquiryConfirmation(String recipientPhone, String customerName, String categoryName) {
        String message = String.format(
            "Hello %s! 👋\n\nThank you for choosing Aadhiraksha Insurance.\nWe have received your inquiry for *%s*.\n\nOur certified IRDAI advisor will connect with you within 15 minutes to share customized, unbiased quotes.\n\nHelpline: +91 8367415156\nPortal: https://www.aadhirakshainsurance.com",
            customerName != null ? customerName : "Valued Customer",
            categoryName != null ? categoryName : "Insurance"
        );
        sendTextMessage(recipientPhone, message);
    }

    /**
     * Send claim status updates & cashless assistance intimations.
     */
    @Async
    public void sendClaimStatusUpdate(String recipientPhone, String claimNumber, String status, String remarks) {
        String message = String.format(
            "🛡️ *Aadhiraksha Claims Desk Update*\n\nClaim Intimation No: *%s*\nCurrent Status: *%s*\nUpdate: %s\n\nOur on-ground claims manager is actively assisting the hospital cashless desk.\nFor emergency assistance call: +91 8367415156",
            claimNumber,
            status,
            remarks != null ? remarks : "Under review with insurer"
        );
        sendTextMessage(recipientPhone, message);
    }

    /**
     * Send document verification or rejection notice to policyholder.
     */
    @Async
    public void sendDocumentStatusAlert(String recipientPhone, String documentName, String status, String feedback) {
        String message = String.format(
            "📄 *Document Verification Notice*\n\nDocument: *%s*\nStatus: *%s*\nRemarks: %s\n\nPlease log in to your Aadhiraksha Vault to review:\nhttps://www.aadhirakshainsurance.com/my-account",
            documentName,
            status,
            feedback != null ? feedback : "Processed successfully"
        );
        sendTextMessage(recipientPhone, message);
    }

    /**
     * Core dispatch mechanism sending formatted text to Meta WhatsApp Cloud API endpoint.
     */
    public boolean sendTextMessage(String rawPhoneNumber, String messageText) {
        if (!enabled) {
            log.info("[WhatsApp MOCK] Notifications disabled in application.yml. Message to {}: {}", rawPhoneNumber, messageText);
            return true;
        }

        if (phoneNumberId == null || phoneNumberId.isBlank() || accessToken == null || accessToken.isBlank()) {
            log.warn("[WhatsApp WARN] Meta WhatsApp Cloud API credentials missing. Check WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN.");
            return false;
        }

        try {
            String cleanPhone = rawPhoneNumber.replaceAll("[^0-9]", "");
            if (cleanPhone.length() == 10) {
                cleanPhone = "91" + cleanPhone; // Prefix Indian country code
            }

            String endpointUrl = String.format("%s/%s/messages", apiUrl, phoneNumberId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("recipient_type", "individual");
            body.put("to", cleanPhone);
            body.put("type", "text");

            Map<String, String> textMap = new HashMap<>();
            textMap.put("preview_url", "true");
            textMap.put("body", messageText);
            body.put("text", textMap);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(endpointUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[WhatsApp SUCCESS] Dispatched notification to {} (Status: {})", cleanPhone, response.getStatusCode());
                return true;
            } else {
                log.error("[WhatsApp ERROR] Failed dispatch to {}. Response: {}", cleanPhone, response.getBody());
                return false;
            }
        } catch (Exception ex) {
            log.error("[WhatsApp EXCEPTION] Error dispatching WhatsApp notification to {}: {}", rawPhoneNumber, ex.getMessage());
            return false;
        }
    }
}
