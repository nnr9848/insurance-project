package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.BusinessProfile;
import com.aadhiraksha.insurance.repository.BusinessProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * Enterprise Service for Twilio Verify API (v2).
 * Twilio Verify handles OTP lifecycle, delivery, carrier routes, and fraud prevention
 * without triggering Indian TRAI DLT international long-code blocks.
 * 
 * Channels supported: "sms" and "whatsapp".
 */
@Service
@Slf4j
public class TwilioVerifyService {

    private final BusinessProfileRepository businessProfileRepository;
    private final com.aadhiraksha.insurance.repository.CommunicationDeliveryLogRepository deliveryLogRepository;
    private final RestTemplate restTemplate;

    public TwilioVerifyService(
            BusinessProfileRepository businessProfileRepository,
            com.aadhiraksha.insurance.repository.CommunicationDeliveryLogRepository deliveryLogRepository) {
        this.businessProfileRepository = businessProfileRepository;
        this.deliveryLogRepository = deliveryLogRepository;
        this.restTemplate = new RestTemplate();
    }

    @Value("${twilio.account-sid:}")
    private String envAccountSid;

    @Value("${twilio.api-key-sid:}")
    private String envApiKeySid;

    @Value("${twilio.api-key-secret:}")
    private String envApiKeySecret;

    @Value("${twilio.verify-service-sid:}")
    private String envVerifyServiceSid;

    public record VerifyDispatchResult(boolean success, String channel, String errorMessage, String errorCode) {}

    /**
     * Sends an OTP verification code using Twilio Verify v2 API.
     * @param recipientPhone 10-digit Indian phone or E.164 phone
     * @param channel "sms" or "whatsapp"
     * @return VerifyDispatchResult containing status and explicit error details if failed
     */
    public VerifyDispatchResult sendVerification(String recipientPhone, String channel) {
        String cleanPhone = sanitizeToE164(recipientPhone);
        if (cleanPhone.isEmpty()) {
            return new VerifyDispatchResult(false, channel, "Invalid recipient phone number", "INVALID_PHONE");
        }

        String accountSid = getAccountSid();
        String apiKeySid = getApiKeySid();
        String apiKeySecret = getApiKeySecret();
        String verifySid = getVerifyServiceSid();

        if (accountSid.isBlank() || apiKeySid.isBlank() || apiKeySecret.isBlank() || verifySid.isBlank()) {
            return new VerifyDispatchResult(false, channel, "Twilio Verify Service SID or API Key missing", "CREDENTIALS_MISSING");
        }

        String targetChannel = (channel != null && channel.equalsIgnoreCase("whatsapp")) ? "whatsapp" : "sms";
        String url = String.format("https://verify.twilio.com/v2/Services/%s/Verifications", verifySid);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (apiKeySid + ":" + apiKeySecret).getBytes(StandardCharsets.UTF_8)
            );
            headers.set("Authorization", authHeader);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("To", cleanPhone);
            requestBody.add("Channel", targetChannel);
            requestBody.add("riskCheck", "disable");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

            log.info("[Twilio Verify DISPATCH] Triggering {} OTP to {} via Service SID {}", targetChannel, cleanPhone, verifySid);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            String channelTag = "whatsapp".equalsIgnoreCase(targetChannel) ? "TWILIO_VERIFY_WHATSAPP" : "TWILIO_VERIFY_SMS";

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[Twilio Verify SUCCESS] Dispatched to {}", cleanPhone);
                saveDeliveryLog(channelTag, cleanPhone, "OTP_VERIFICATION", "DELIVERED", "200", null, "Twilio Verify OTP generated and dispatched via carrier route.");
                return new VerifyDispatchResult(true, targetChannel, null, null);
            }

            saveDeliveryLog(channelTag, cleanPhone, "OTP_VERIFICATION", "FAILED", String.valueOf(response.getStatusCode().value()), "Unexpected response from Twilio", null);
            return new VerifyDispatchResult(false, targetChannel, "Unexpected response from Twilio: " + response.getStatusCode(), "TWILIO_ERROR");

        } catch (HttpStatusCodeException ex) {
            String body = ex.getResponseBodyAsString();
            log.error("[Twilio Verify HTTP ERROR] Twilio status {}: {}", ex.getStatusCode(), body);

            String humanMsg = "Unable to dispatch verification OTP";
            String errCode = "TWILIO_" + ex.getStatusCode().value();
            String status = "FAILED";

            if (body != null && body.contains("60238")) {
                humanMsg = "SMS dispatch to this destination is blocked by Twilio Fraud Guard or Geo-Permissions. Check Twilio Console > Verify Fraud Guard or try WhatsApp.";
                errCode = "TWILIO_60238_RESTRICTED";
                status = "BLOCKED_BY_PROVIDER";
            } else if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                humanMsg = "Twilio authentication failed. Please verify Twilio API Key credentials in CRM settings.";
                errCode = "TWILIO_AUTH_FAILED";
            }

            String channelTag = "whatsapp".equalsIgnoreCase(targetChannel) ? "TWILIO_VERIFY_WHATSAPP" : "TWILIO_VERIFY_SMS";
            saveDeliveryLog(channelTag, cleanPhone, "OTP_VERIFICATION", status, String.valueOf(ex.getStatusCode().value()), humanMsg, body);

            return new VerifyDispatchResult(false, targetChannel, humanMsg, errCode);
        } catch (Exception ex) {
            log.error("[Twilio Verify EXCEPTION] Failed dispatching OTP to {}: {}", cleanPhone, ex.getMessage());
            String channelTag = "whatsapp".equalsIgnoreCase(targetChannel) ? "TWILIO_VERIFY_WHATSAPP" : "TWILIO_VERIFY_SMS";
            saveDeliveryLog(channelTag, cleanPhone, "OTP_VERIFICATION", "FAILED", "EXCEPTION", ex.getMessage(), null);
            return new VerifyDispatchResult(false, targetChannel, ex.getMessage(), "EXCEPTION");
        }
    }

    private void saveDeliveryLog(String channel, String recipient, String purpose, String status, String providerCode, String failureReason, String rawBody) {
        try {
            String preview = rawBody != null ? (rawBody.length() > 250 ? rawBody.substring(0, 247) + "..." : rawBody) : null;
            com.aadhiraksha.insurance.model.CommunicationDeliveryLog logEntry = com.aadhiraksha.insurance.model.CommunicationDeliveryLog.builder()
                    .channel(channel)
                    .recipient(recipient)
                    .purpose(purpose)
                    .status(status)
                    .providerCode(providerCode)
                    .failureReason(failureReason)
                    .payloadSummary(preview)
                    .build();
            deliveryLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("[Twilio Verify] Failed to persist delivery log entry: {}", e.getMessage());
        }
    }

    public boolean sendVerificationOtp(String recipientPhone, String channel) {
        return sendVerification(recipientPhone, channel).success();
    }

    /**
     * Verifies the OTP code entered by the user against Twilio Verify v2 API.
     * @param recipientPhone 10-digit Indian phone or E.164 phone
     * @param code 6-digit verification code entered by user
     * @return true if code is approved
     */
    public boolean checkVerificationOtp(String recipientPhone, String code) {
        String cleanPhone = sanitizeToE164(recipientPhone);
        if (cleanPhone.isEmpty() || code == null || code.trim().isEmpty()) {
            return false;
        }

        String accountSid = getAccountSid();
        String apiKeySid = getApiKeySid();
        String apiKeySecret = getApiKeySecret();
        String verifySid = getVerifyServiceSid();

        if (accountSid.isBlank() || apiKeySid.isBlank() || apiKeySecret.isBlank() || verifySid.isBlank()) {
            log.warn("[Twilio Verify MOCK] Credentials missing for verification check.");
            return false;
        }

        String url = String.format("https://verify.twilio.com/v2/Services/%s/VerificationCheck", verifySid);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (apiKeySid + ":" + apiKeySecret).getBytes(StandardCharsets.UTF_8)
            );
            headers.set("Authorization", authHeader);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("To", cleanPhone);
            requestBody.add("Code", code.trim());

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

            log.info("[Twilio Verify CHECK] Validating OTP code for {}", cleanPhone);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object status = response.getBody().get("status");
                boolean approved = "approved".equalsIgnoreCase(String.valueOf(status));
                log.info("[Twilio Verify CHECK RESULT] Status for {}: approved={}", cleanPhone, approved);
                return approved;
            }

            return false;

        } catch (HttpStatusCodeException ex) {
            log.error("[Twilio Verify CHECK HTTP ERROR] Status {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return false;
        } catch (Exception ex) {
            log.error("[Twilio Verify CHECK EXCEPTION] Failed verifying code for {}: {}", cleanPhone, ex.getMessage());
            return false;
        }
    }

    /**
     * Checks if Twilio Verify is configured and active.
     */
    public boolean isVerifyEnabled() {
        return getVerifyServiceSid() != null && !getVerifyServiceSid().isBlank();
    }

    public String getVerifyServiceSid() {
        return businessProfileRepository.findAll().stream().findFirst()
                .map(BusinessProfile::getTwilioVerifyServiceSid)
                .filter(s -> s != null && !s.isBlank())
                .orElse(envVerifyServiceSid);
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

    private String sanitizeToE164(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+")) return digits;
        if (digits.length() == 10) return "+91" + digits;
        return digits;
    }
}
