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
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class TwilioSmsService {

    private final BusinessProfileRepository businessProfileRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${twilio.account-sid:}")
    private String envAccountSid;

    @Value("${twilio.api-key-sid:}")
    private String envApiKeySid;

    @Value("${twilio.api-key-secret:}")
    private String envApiKeySecret;

    @Value("${twilio.from-number:}")
    private String envFromNumber;

    @Value("${twilio.enabled:false}")
    private boolean envTwilioEnabled;

    public record SmsDispatchResult(boolean success, String errorMessage, String errorCode) {}

    /**
     * Sends an SMS message to recipientPhone using Twilio Programmable Messaging API.
     * Uses enterprise API Key SID (SK...) and API Key Secret for HTTP Basic Authentication on behalf of Account SID.
     */
    public boolean sendSms(String recipientPhone, String messageBody) {
        return sendSmsDetailed(recipientPhone, messageBody).success();
    }

    /**
     * Sends an SMS message and returns detailed status with provider feedback.
     */
    public SmsDispatchResult sendSmsDetailed(String recipientPhone, String messageBody) {
        String cleanPhone = sanitizePhoneNumber(recipientPhone);
        if (cleanPhone.isEmpty()) {
            log.warn("[Twilio SMS] Cannot send SMS to blank or invalid phone number.");
            return new SmsDispatchResult(false, "Cannot send SMS to blank or invalid phone number", "INVALID_PHONE");
        }

        String accountSid = getAccountSid();
        String apiKeySid = getApiKeySid();
        String apiKeySecret = getApiKeySecret();
        String fromNumber = getFromNumber();
        boolean isEnabled = isTwilioEnabled();

        if (!isEnabled || accountSid.isBlank() || apiKeySid.isBlank() || apiKeySecret.isBlank() || fromNumber.isBlank()) {
            log.info("[Twilio SMS MOCK] Twilio not enabled or API Key credentials blank. Message to {}: {}", 
                    cleanPhone, messageBody);
            return new SmsDispatchResult(false, "SMS provider is not configured or disabled in system settings.", "PROVIDER_NOT_CONFIGURED");
        }

        String destinationPhone = cleanPhone.startsWith("+") ? cleanPhone : "+91" + cleanPhone;
        log.info("[Twilio SMS DISPATCH] Attempting SMS dispatch: From='{}' -> To='{}'", fromNumber, destinationPhone);

        try {
            String twilioUrl = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Twilio HTTP Basic Auth with API Key: ApiKeySID (SK...) : ApiKeySecret
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (apiKeySid + ":" + apiKeySecret).getBytes(StandardCharsets.UTF_8)
            );
            headers.set("Authorization", authHeader);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("To", destinationPhone);
            requestBody.add("From", fromNumber);
            requestBody.add("Body", messageBody);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(twilioUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[Twilio SMS SUCCESS] Dispatched SMS to {} (HTTP {})", destinationPhone, response.getStatusCode());
                return new SmsDispatchResult(true, null, null);
            } else {
                log.error("[Twilio SMS ERROR] Twilio returned status {}: {}", response.getStatusCode(), response.getBody());
                return new SmsDispatchResult(false, "Twilio dispatch returned status " + response.getStatusCode(), "TWILIO_ERROR");
            }

        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            String errorBody = ex.getResponseBodyAsString();
            log.error("[Twilio SMS HTTP ERROR] Twilio status {}: {}", ex.getStatusCode(), errorBody);

            // AUTO-FALLBACK FOR TWILIO TRIAL ACCOUNTS (Code 572006: Predefined template required)
            if (errorBody != null && errorBody.contains("572006") && !messageBody.equals("sms_appointment_reminders")) {
                log.warn("[Twilio SMS TRIAL NOTICE] Account is in Twilio Trial mode (Error 572006). "
                        + "Automatically retrying with Twilio trial template 'sms_appointment_reminders' to ensure phone delivery.");
                boolean retrySuccess = dispatchTwilioHttpRequest(accountSid, apiKeySid, apiKeySecret, fromNumber, destinationPhone, "sms_appointment_reminders");
                if (retrySuccess) {
                    return new SmsDispatchResult(true, null, null);
                }
            }

            String humanMsg = "SMS delivery blocked by provider: ";
            String errCode = "TWILIO_" + ex.getStatusCode().value();

            if (errorBody != null && (errorBody.contains("21211") || errorBody.contains("invalid 'To' Phone Number"))) {
                humanMsg += "The recipient phone number is invalid or not accepted by Twilio.";
                errCode = "TWILIO_21211_INVALID_NUMBER";
            } else if (errorBody != null && (errorBody.contains("21608") || errorBody.contains("unverified"))) {
                humanMsg += "Trial account restriction: This phone number is not verified in your Twilio Console.";
                errCode = "TWILIO_21608_UNVERIFIED_NUMBER";
            } else if (errorBody != null && (errorBody.contains("21408") || errorBody.contains("Permission to send an SMS has not been enabled"))) {
                humanMsg += "Geo-permissions blocked: Twilio SMS to India (+91) is not enabled in your Twilio Console.";
                errCode = "TWILIO_21408_GEO_RESTRICTED";
            } else if (errorBody != null && errorBody.contains("60238")) {
                humanMsg += "Twilio Fraud Guard has blocked SMS to this destination.";
                errCode = "TWILIO_60238_FRAUD_RESTRICTED";
            } else if (errorBody != null && errorBody.contains("message")) {
                // Extract Twilio message field if available
                humanMsg += "Twilio rejected message dispatch (HTTP " + ex.getStatusCode().value() + ").";
            } else {
                humanMsg += "HTTP " + ex.getStatusCode().value();
            }

            return new SmsDispatchResult(false, humanMsg, errCode);
        } catch (Exception ex) {
            log.error("[Twilio SMS EXCEPTION] Error dispatching SMS via Twilio to {}: {}", destinationPhone, ex.getMessage());
            return new SmsDispatchResult(false, "Error dispatching SMS: " + ex.getMessage(), "DISPATCH_EXCEPTION");
        }
    }

    private boolean dispatchTwilioHttpRequest(String accountSid, String apiKeySid, String apiKeySecret, String fromNumber, String destinationPhone, String body) {
        try {
            String twilioUrl = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (apiKeySid + ":" + apiKeySecret).getBytes(StandardCharsets.UTF_8)
            );
            headers.set("Authorization", authHeader);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("To", destinationPhone);
            requestBody.add("From", fromNumber);
            requestBody.add("Body", body);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(twilioUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[Twilio SMS TRIAL SUCCESS] Dispatched trial template '{}' to {} (HTTP {})", body, destinationPhone, response.getStatusCode());
                return true;
            } else {
                log.error("[Twilio SMS TRIAL ERROR] Status {}: {}", response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (Exception retryEx) {
            log.error("[Twilio SMS TRIAL EXCEPTION] Failed to dispatch trial template: {}", retryEx.getMessage());
            return false;
        }
    }

    public boolean isTwilioEnabled() {
        return businessProfileRepository.findAll().stream().findFirst()
                .map(profile -> profile.getTwilioSmsEnabled() != null ? profile.getTwilioSmsEnabled() : envTwilioEnabled)
                .orElse(envTwilioEnabled);
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

    private String getFromNumber() {
        String num = businessProfileRepository.findAll().stream().findFirst()
                .map(BusinessProfile::getTwilioFromNumber)
                .filter(s -> s != null && !s.isBlank())
                .orElse(envFromNumber);
        if (num != null && !num.isBlank()) {
            num = num.trim();
            // If it is an E.164 number without leading +, prepend +
            if (num.matches("^[0-9]{10,15}$")) {
                num = "+" + num;
            }
        }
        return num != null ? num : "";
    }

    private String sanitizePhoneNumber(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("[^0-9+]", "");
        return digits;
    }
}
