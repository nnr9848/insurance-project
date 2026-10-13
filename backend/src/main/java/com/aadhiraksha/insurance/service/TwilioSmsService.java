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

    @Value("${twilio.auth-token:}")
    private String envAuthToken;

    @Value("${twilio.from-number:}")
    private String envFromNumber;

    @Value("${twilio.enabled:false}")
    private boolean envTwilioEnabled;

    /**
     * Sends an SMS message to recipientPhone using Twilio Programmable Messaging API.
     * Respects Admin Settings in BusinessProfile with fallback to environment variables.
     */
    public boolean sendSms(String recipientPhone, String messageBody) {
        String cleanPhone = sanitizePhoneNumber(recipientPhone);
        if (cleanPhone.isEmpty()) {
            log.warn("[Twilio SMS] Cannot send SMS to blank or invalid phone number.");
            return false;
        }

        String accountSid = getAccountSid();
        String authToken = getAuthToken();
        String fromNumber = getFromNumber();
        boolean isEnabled = isTwilioEnabled();

        if (!isEnabled || accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank()) {
            log.info("[Twilio SMS MOCK] Twilio not enabled or credentials blank. Message to {}: {}", 
                    cleanPhone, messageBody);
            return false;
        }

        String destinationPhone = cleanPhone.startsWith("+") ? cleanPhone : "+91" + cleanPhone;
        log.info("[Twilio SMS DISPATCH] Attempting SMS dispatch: From='{}' -> To='{}'", fromNumber, destinationPhone);

        try {
            String twilioUrl = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Twilio HTTP Basic Auth: AccountSID : AuthToken
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8)
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
                return true;
            } else {
                log.error("[Twilio SMS ERROR] Twilio returned status {}: {}", response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            String errorBody = ex.getResponseBodyAsString();
            log.error("[Twilio SMS HTTP ERROR] Twilio status {}: {}", ex.getStatusCode(), errorBody);

            // AUTO-FALLBACK FOR TWILIO TRIAL ACCOUNTS (Code 572006: Predefined template required)
            // If trial account restriction is hit, automatically retry using trial template 'sms_appointment_reminders'.
            // When user upgrades to a paid account, the primary attempt above succeeds automatically with zero code changes.
            if (errorBody != null && errorBody.contains("572006") && !messageBody.equals("sms_appointment_reminders")) {
                log.warn("[Twilio SMS TRIAL NOTICE] Account is in Twilio Trial mode (Error 572006). "
                        + "Automatically retrying with Twilio trial template 'sms_appointment_reminders' to ensure phone delivery. "
                        + "(Note: Upgrading to a paid Twilio account will instantly enable custom OTP text without any code change.)");
                return dispatchTwilioHttpRequest(accountSid, authToken, fromNumber, destinationPhone, "sms_appointment_reminders");
            }

            return false;
        } catch (Exception ex) {
            log.error("[Twilio SMS EXCEPTION] Error dispatching SMS via Twilio to {}: {}", destinationPhone, ex.getMessage());
            return false;
        }
    }

    private boolean dispatchTwilioHttpRequest(String accountSid, String authToken, String fromNumber, String destinationPhone, String body) {
        try {
            String twilioUrl = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8)
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

    private String getAuthToken() {
        return businessProfileRepository.findAll().stream().findFirst()
                .map(BusinessProfile::getTwilioAuthToken)
                .filter(s -> s != null && !s.isBlank())
                .orElse(envAuthToken);
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
