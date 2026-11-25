package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.BusinessProfile;
import com.aadhiraksha.insurance.model.CommunicationDeliveryLog;
import com.aadhiraksha.insurance.repository.BusinessProfileRepository;
import com.aadhiraksha.insurance.repository.CommunicationDeliveryLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

/** Server-side MSG91 client for OTP and approved WhatsApp templates. */
@Service
@Slf4j
public class Msg91Service {
    private static final String API_ROOT = "https://control.msg91.com/api/v5";
    private final BusinessProfileRepository profileRepository;
    private final CommunicationDeliveryLogRepository deliveryLogRepository;
    private final RestTemplate restTemplate = createRestTemplate();

    @Value("${msg91.authkey:}") private String envAuthkey;
    @Value("${msg91.otp-template-id:}") private String envOtpTemplateId;
    @Value("${msg91.otp-enabled:false}") private boolean envOtpEnabled;
    @Value("${msg91.whatsapp-enabled:false}") private boolean envWhatsAppEnabled;
    @Value("${msg91.whatsapp-integrated-number:}") private String envWhatsAppNumber;
    @Value("${msg91.whatsapp-template-name:}") private String envWhatsAppTemplate;
    @Value("${msg91.whatsapp-otp-template-name:}") private String envWhatsAppOtpTemplate;
    @Value("${msg91.whatsapp-language:en}") private String envWhatsAppLanguage;

    public Msg91Service(BusinessProfileRepository profileRepository,
                        CommunicationDeliveryLogRepository deliveryLogRepository) {
        this.profileRepository = profileRepository;
        this.deliveryLogRepository = deliveryLogRepository;
    }

    public boolean isOtpEnabled() {
        return (envOtpEnabled || profile().map(p -> Boolean.TRUE.equals(p.getMsg91OtpEnabled())).orElse(false))
                && !authkey().isBlank() && !otpTemplateId().isBlank();
    }

    public boolean isWhatsAppEnabled() {
        return (envWhatsAppEnabled || profile().map(p -> Boolean.TRUE.equals(p.getMsg91WhatsappEnabled())).orElse(false))
                && !authkey().isBlank() && !whatsAppNumber().isBlank() && !whatsAppTemplate().isBlank();
    }

    public void sendSmsOtp(String e164Phone) {
        String phone = digits(e164Phone);
        if (phone.isBlank() || !isOtpEnabled()) throw new IllegalStateException("MSG91 OTP is not configured.");
        String url = UriComponentsBuilder.fromHttpUrl(API_ROOT + "/otp")
                .queryParam("template_id", otpTemplateId()).queryParam("mobile", phone).toUriString();
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(headers()), Map.class);
            Map<?, ?> body = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful() || (body != null && "error".equalsIgnoreCase(String.valueOf(body.get("type"))))) {
                throw new IllegalStateException("MSG91 rejected the OTP request. Check the Authkey, template, and DLT configuration.");
            }
            saveLog("MSG91_OTP_SMS", e164Phone, "OTP_VERIFICATION", "DELIVERED", "200", null, null);
        } catch (RestClientResponseException ex) {
            saveLog("MSG91_OTP_SMS", e164Phone, "OTP_VERIFICATION", "FAILED", String.valueOf(ex.getStatusCode().value()), "MSG91 OTP request failed", ex.getResponseBodyAsString());
            log.warn("MSG91 OTP request failed with HTTP {}", ex.getStatusCode().value());
            throw new IllegalStateException("Unable to send OTP through MSG91. Check MSG91 credentials and template configuration.");
        }
    }

    public boolean verifySmsOtp(String e164Phone, String otp) {
        if (otp == null || otp.isBlank() || !isOtpEnabled()) return false;
        String url = UriComponentsBuilder.fromHttpUrl(API_ROOT + "/otp/verify")
                .queryParam("otp", otp.trim()).queryParam("mobile", digits(e164Phone)).toUriString();
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers()), Map.class);
            Map<?, ?> body = response.getBody();
            return response.getStatusCode().is2xxSuccessful() && body != null
                    && "success".equalsIgnoreCase(String.valueOf(body.get("type")));
        } catch (RestClientResponseException ex) {
            log.warn("MSG91 OTP verification failed with HTTP {}", ex.getStatusCode().value());
            return false;
        }
    }

    public boolean verifyWidgetToken(String token, String expectedPhone) {
        if (token == null || token.isBlank()) return false;
        String key = authkey();
        if (key == null || key.isBlank()) {
            log.warn("MSG91 Authkey is missing, cannot verify widget token");
            return false;
        }

        try {
            String url = API_ROOT + "/widget/verifyAccessToken";
            Map<String, Object> body = Map.of(
                    "access-token", token.trim(),
                    "token", token.trim()
            );
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers()),
                    Map.class
            );
            Map<?, ?> respBody = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && respBody != null) {
                String type = String.valueOf(respBody.get("type"));
                String message = String.valueOf(respBody.get("message"));
                if ("success".equalsIgnoreCase(type) || message.toLowerCase().contains("success")) {
                    log.info("MSG91 widget access token verified successfully for phone {}", expectedPhone);
                    saveLog("MSG91_WIDGET_OTP", expectedPhone, "WIDGET_OTP_VERIFICATION", "VERIFIED", "200", null, null);
                    return true;
                }
            }
            log.warn("MSG91 widget token verification rejected: {}", respBody);
            saveLog("MSG91_WIDGET_OTP", expectedPhone, "WIDGET_OTP_VERIFICATION", "FAILED", String.valueOf(response.getStatusCode().value()), "Token rejected by MSG91", respBody != null ? respBody.toString() : null);
            return false;
        } catch (RestClientResponseException ex) {
            log.warn("MSG91 widget token verification HTTP error {}: {}", ex.getStatusCode().value(), ex.getResponseBodyAsString());
            saveLog("MSG91_WIDGET_OTP", expectedPhone, "WIDGET_OTP_VERIFICATION", "FAILED", String.valueOf(ex.getStatusCode().value()), "MSG91 HTTP error", ex.getResponseBodyAsString());
            return false;
        } catch (Exception ex) {
            log.warn("Failed to verify MSG91 widget token: {}", ex.getMessage());
            return false;
        }
    }

    public boolean sendWhatsAppMessage(String recipientPhone, String message) {
        return sendWhatsAppTemplate(recipientPhone, whatsAppTemplate(), message, "MSG91_WHATSAPP");
    }

    public boolean sendWelcomeWhatsApp(String recipientPhone, String customerName) {
        String template = nonBlank(profile().map(BusinessProfile::getMsg91WhatsappTemplateName).orElse(null), envWhatsAppTemplate);
        if (template.isBlank()) {
            template = "aadhiraksha_welcome";
        }
        String name = customerName != null && !customerName.isBlank() ? customerName.trim() : "Valued Customer";
        Map<String, String> vars = new LinkedHashMap<>();
        vars.put("customer_name", name);
        vars.put("body_1", name);
        return sendWhatsAppNamedTemplate(recipientPhone, template, vars, "MSG91_WHATSAPP_WELCOME");
    }

    public boolean sendWhatsAppOtp(String recipientPhone, String otp) {
        String template = nonBlank(profile().map(BusinessProfile::getMsg91WhatsappOtpTemplateName).orElse(null), envWhatsAppOtpTemplate);
        return sendWhatsAppTemplate(recipientPhone, template, otp, "MSG91_WHATSAPP_OTP");
    }

    private boolean sendWhatsAppNamedTemplate(String recipientPhone, String template, Map<String, String> variables, String channel) {
        String to = digits(recipientPhone);
        if (to.isBlank() || template.isBlank() || !isWhatsAppConfigured()) return false;

        Map<String, Object> components = new LinkedHashMap<>();
        variables.forEach((key, val) -> {
            components.put(key, Map.of("type", "text", "value", Objects.requireNonNullElse(val, "")));
        });

        Map<String, Object> templateBody = new LinkedHashMap<>();
        templateBody.put("name", template);
        templateBody.put("language", Map.of("code", whatsAppLanguage(), "policy", "deterministic"));
        templateBody.put("to_and_components", List.of(Map.of("to", List.of(to), "components", components)));
        Map<String, Object> payload = Map.of(
                "integrated_number", whatsAppNumber(),
                "content_type", "template",
                "payload", Map.of("type", "template", "template", templateBody)
        );

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    API_ROOT + "/whatsapp/whatsapp-outbound-message/bulk",
                    new HttpEntity<>(payload, headers()),
                    Map.class
            );
            Map<?, ?> body = response.getBody();
            boolean success = response.getStatusCode().is2xxSuccessful() && body != null
                    && "success".equalsIgnoreCase(String.valueOf(body.get("status")))
                    && !Boolean.TRUE.equals(body.get("hasError"));
            saveLog(channel, recipientPhone, "WHATSAPP_WELCOME", success ? "DELIVERED" : "FAILED",
                    String.valueOf(response.getStatusCode().value()),
                    success ? null : "MSG91 did not accept the WhatsApp template request",
                    body == null ? null : body.toString());
            if (success) {
                log.info("Sent WhatsApp welcome message to {}", recipientPhone);
            } else {
                log.warn("Failed to send WhatsApp welcome message to {}: {}", recipientPhone, body);
            }
            return success;
        } catch (RestClientResponseException ex) {
            saveLog(channel, recipientPhone, "WHATSAPP_WELCOME", "FAILED",
                    String.valueOf(ex.getStatusCode().value()),
                    "MSG91 WhatsApp template request failed",
                    ex.getResponseBodyAsString());
            log.warn("MSG91 WhatsApp welcome request failed with HTTP {}: {}", ex.getStatusCode().value(), ex.getResponseBodyAsString());
            return false;
        } catch (Exception ex) {
            log.warn("Exception sending WhatsApp welcome message: {}", ex.getMessage());
            return false;
        }
    }

    private boolean sendWhatsAppTemplate(String recipientPhone, String template, String value, String channel) {
        String to = digits(recipientPhone);
        if (to.isBlank() || template.isBlank() || !isWhatsAppConfigured()) return false;
        Map<String, Object> component = Map.of("type", "text", "value", Objects.requireNonNullElse(value, ""));
        Map<String, Object> templateBody = new LinkedHashMap<>();
        templateBody.put("name", template);
        templateBody.put("language", Map.of("code", whatsAppLanguage(), "policy", "deterministic"));
        templateBody.put("to_and_components", List.of(Map.of("to", List.of(to), "components", Map.of("body_1", component))));
        Map<String, Object> payload = Map.of("integrated_number", whatsAppNumber(), "content_type", "template",
                "payload", Map.of("type", "template", "template", templateBody));
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(API_ROOT + "/whatsapp/whatsapp-outbound-message/bulk",
                    new HttpEntity<>(payload, headers()), Map.class);
            Map<?, ?> body = response.getBody();
            boolean success = response.getStatusCode().is2xxSuccessful() && body != null
                    && "success".equalsIgnoreCase(String.valueOf(body.get("status")))
                    && !Boolean.TRUE.equals(body.get("hasError"));
            saveLog(channel, recipientPhone, "WHATSAPP_MESSAGE", success ? "DELIVERED" : "FAILED",
                    String.valueOf(response.getStatusCode().value()), success ? null : "MSG91 did not accept the WhatsApp template request", body == null ? null : body.toString());
            return success;
        } catch (RestClientResponseException ex) {
            saveLog(channel, recipientPhone, "WHATSAPP_MESSAGE", "FAILED", String.valueOf(ex.getStatusCode().value()), "MSG91 WhatsApp template request failed", ex.getResponseBodyAsString());
            log.warn("MSG91 WhatsApp request failed with HTTP {}", ex.getStatusCode().value());
            return false;
        }
    }

    private boolean isWhatsAppConfigured() {
        return (envWhatsAppEnabled || profile().map(p -> Boolean.TRUE.equals(p.getMsg91WhatsappEnabled())).orElse(false))
                && !authkey().isBlank() && !whatsAppNumber().isBlank();
    }

    private HttpHeaders headers() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("authkey", authkey());
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        return headers;
    }

    private Optional<BusinessProfile> profile() { return profileRepository.findAll().stream().findFirst(); }
    private String authkey() { return nonBlank(profile().map(BusinessProfile::getMsg91Authkey).orElse(null), envAuthkey); }
    private String otpTemplateId() { return nonBlank(profile().map(BusinessProfile::getMsg91OtpTemplateId).orElse(null), envOtpTemplateId); }
    private String whatsAppNumber() { return nonBlank(profile().map(BusinessProfile::getMsg91WhatsappIntegratedNumber).orElse(null), envWhatsAppNumber); }
    private String whatsAppTemplate() { return nonBlank(profile().map(BusinessProfile::getMsg91WhatsappTemplateName).orElse(null), envWhatsAppTemplate); }
    private String whatsAppLanguage() { return nonBlank(profile().map(BusinessProfile::getMsg91WhatsappLanguage).orElse(null), envWhatsAppLanguage); }
    private static String nonBlank(String primary, String fallback) { return primary != null && !primary.isBlank() ? primary.trim() : Objects.requireNonNullElse(fallback, "").trim(); }
    private static String digits(String raw) { return raw == null ? "" : raw.replaceAll("\\D", ""); }

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5_000);
        requestFactory.setReadTimeout(10_000);
        return new RestTemplate(requestFactory);
    }

    private void saveLog(String channel, String recipient, String purpose, String status, String providerCode, String failure, String raw) {
        try {
            String summary = raw == null ? null : raw.substring(0, Math.min(raw.length(), 250));
            deliveryLogRepository.save(CommunicationDeliveryLog.builder().channel(channel).recipient(recipient)
                    .purpose(purpose).status(status).providerCode(providerCode).failureReason(failure).payloadSummary(summary).build());
        } catch (Exception ex) { log.warn("Could not store MSG91 delivery log: {}", ex.getMessage()); }
    }
}
