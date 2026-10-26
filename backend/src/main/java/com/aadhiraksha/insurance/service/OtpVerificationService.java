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
    private static final String DEV_MASTER_OTP = "123456";

    private final TwilioSmsService twilioSmsService;
    private final TwilioVerifyService twilioVerifyService;
    private final SecureRandom secureRandom = new SecureRandom();

    // Map: normalized phone -> OtpSession
    private final Map<String, OtpSession> otpStorage = new ConcurrentHashMap<>();

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

        // If Twilio Verify Service SID is configured, dispatch directly via Twilio Verify
        if (twilioVerifyService.isVerifyEnabled()) {
            TwilioVerifyService.VerifyDispatchResult result = twilioVerifyService.sendVerification("+91" + phone, channel);
            if (result.success()) {
                log.info("[OTP SERVICE] Dispatched OTP to +91 {} via Twilio Verify ({})", phone, channel);
                return "OTP sent successfully to +91 " + phone;
            }
            log.error("[OTP SERVICE] Twilio Verify dispatch failed: {} ({})", result.errorMessage(), result.errorCode());
            throw new IllegalStateException(result.errorMessage());
        }

        // Generate 6-digit cryptographic OTP fallback
        int code = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(code);

        Instant expiresAt = Instant.now().plusSeconds(OTP_EXPIRY_SECONDS);
        otpStorage.put(phone, new OtpSession(otp, expiresAt, 0));

        log.info("[OTP SERVICE] Generated OTP for +91 {}: {} (Expires in 5 minutes. Dev Master: {})", 
                phone, otp, DEV_MASTER_OTP);

        // Dispatch via Twilio SMS Service (or mock fallback if credentials not configured)
        String smsBody = String.format("Your Aadhiraksha Insurance verification code is %s. Valid for 5 minutes. Please do not share this OTP with anyone.", otp);
        twilioSmsService.sendSms("+91" + phone, smsBody);

        return "OTP sent successfully to +91 " + phone;
    }

    public String verifyOtp(String rawPhone, String inputOtp) {
        String phone = normalizePhone(rawPhone);
        if (inputOtp == null || inputOtp.trim().isEmpty()) {
            throw new IllegalArgumentException("OTP code is required.");
        }

        String sanitizedOtp = inputOtp.trim();

        // 1. Allow Dev Master OTP for quick testing
        if (DEV_MASTER_OTP.equals(sanitizedOtp)) {
            return createVerificationToken(phone);
        }

        // 2. Check via Twilio Verify if enabled
        if (twilioVerifyService.isVerifyEnabled()) {
            boolean approved = twilioVerifyService.checkVerificationOtp("+91" + phone, sanitizedOtp);
            if (approved) {
                otpStorage.remove(phone);
                return createVerificationToken(phone);
            }
            // If Twilio explicitly returned false, check if there was a local session fallback
            if (!otpStorage.containsKey(phone)) {
                throw new IllegalArgumentException("Invalid or expired OTP code. Please check and try again.");
            }
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
        return createVerificationToken(phone);
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
