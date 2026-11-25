package com.aadhiraksha.insurance.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpVerificationService {

    private static final int OTP_EXPIRY_SECONDS = 300; // 5 minutes
    private static final int TOKEN_EXPIRY_SECONDS = 600; // 10 minutes
    private final Msg91Service msg91Service;
    private final SecureRandom secureRandom = new SecureRandom();

    // Map: normalized phone -> OtpSession
    private final Map<String, OtpSession> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, String> otpChannels = new ConcurrentHashMap<>();

    // Map: verificationToken -> TokenSession
    private final Map<String, TokenSession> verifiedTokens = new ConcurrentHashMap<>();

    public record OtpSession(String otp, Instant expiresAt, int attempts) {}
    public record TokenSession(String phoneNumber, Instant expiresAt) {}

    public String generateAndSendOtp(String rawPhone) {
        return generateAndSendOtp(rawPhone, "sms");
    }

    public String generateAndSendOtp(String rawPhone, String channel) {
        String phone = normalizePhone(rawPhone);
        if (phone.length() != 10) {
            throw new IllegalArgumentException("Mobile number must be a valid 10-digit Indian phone number.");
        }

        String targetChannel = "whatsapp".equalsIgnoreCase(channel) ? "whatsapp" : "sms";
        String e164Phone = "+91" + phone;
        if (targetChannel.equals("sms")) {
            if (!msg91Service.isOtpEnabled()) throw new IllegalStateException("MSG91 OTP is not configured. Configure an Authkey and approved OTP template.");
            msg91Service.sendSmsOtp(e164Phone);
        } else {
            int code = 100000 + secureRandom.nextInt(900000);
            String otp = String.valueOf(code);
            otpStorage.put(phone, new OtpSession(otp, Instant.now().plusSeconds(OTP_EXPIRY_SECONDS), 0));
            if (!msg91Service.sendWhatsAppOtp(e164Phone, otp)) {
                otpStorage.remove(phone);
                throw new IllegalStateException("Unable to send WhatsApp OTP. Configure an approved MSG91 WhatsApp OTP template.");
            }
        }
        otpChannels.put(phone, targetChannel);
        log.info("[OTP SERVICE] OTP dispatched to +91 {} through MSG91 ({})", phone, targetChannel);
        return "OTP sent successfully to +91 " + phone;
    }

    public String verifyOtp(String rawPhone, String inputOtp) {
        String phone = normalizePhone(rawPhone);
        if (inputOtp == null || inputOtp.trim().isEmpty()) {
            throw new IllegalArgumentException("OTP code is required.");
        }

        String sanitizedOtp = inputOtp.trim();

        String channel = otpChannels.getOrDefault(phone, "sms");
        if (channel.equals("sms")) {
            if (msg91Service.verifySmsOtp("+91" + phone, sanitizedOtp)) {
                otpChannels.remove(phone);
                return createVerificationToken(phone);
            }
            throw new IllegalArgumentException("Invalid or expired OTP code. Please check and try again.");
        }

        OtpSession session = otpStorage.get(phone);
        if (session == null) {
            throw new IllegalArgumentException("No active OTP request found for this number. Please request a new OTP.");
        }

        if (Instant.now().isAfter(session.expiresAt())) {
            otpStorage.remove(phone);
            throw new IllegalArgumentException("OTP has expired. Please request a new code.");
        }

        if (session.attempts() >= 5) {
            otpStorage.remove(phone);
            throw new IllegalArgumentException("Too many incorrect attempts. Please request a new OTP.");
        }

        if (!session.otp().equals(sanitizedOtp)) {
            otpStorage.put(phone, new OtpSession(session.otp(), session.expiresAt(), session.attempts() + 1));
            throw new IllegalArgumentException("Invalid OTP code. Please check and try again.");
        }

        // OTP Match: Consume session and issue verification token
        otpStorage.remove(phone);
        otpChannels.remove(phone);
        return createVerificationToken(phone);
    }

    public String verifyWidgetToken(String rawPhone, String widgetAccessToken) {
        String phone = normalizePhone(rawPhone);
        if (widgetAccessToken == null || widgetAccessToken.isBlank()) {
            throw new IllegalArgumentException("Widget access token is required.");
        }
        if (msg91Service.verifyWidgetToken(widgetAccessToken, phone)) {
            return createVerificationToken(phone);
        }
        throw new IllegalArgumentException("Invalid or expired verification token from MSG91.");
    }

    public boolean isTokenValid(String token, String rawPhone) {
        if (token == null || token.isBlank()) return false;
        
        TokenSession tokenSession = verifiedTokens.get(token);
        if (tokenSession == null) return false;

        if (Instant.now().isAfter(tokenSession.expiresAt())) {
            verifiedTokens.remove(token);
            return false;
        }

        String phone = normalizePhone(rawPhone);
        return tokenSession.phoneNumber().equals(phone);
    }

    public void consumeToken(String token) {
        if (token != null) {
            verifiedTokens.remove(token);
        }
    }

    private String createVerificationToken(String phone) {
        String token = "vtoken_" + UUID.randomUUID().toString().replace("-", "");
        verifiedTokens.put(token, new TokenSession(phone, Instant.now().plusSeconds(TOKEN_EXPIRY_SECONDS)));
        return token;
    }

    private String normalizePhone(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() > 10) {
            return digits.substring(digits.length() - 10);
        }
        return digits;
    }
}
