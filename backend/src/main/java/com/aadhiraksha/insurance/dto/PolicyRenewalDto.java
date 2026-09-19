package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PolicyRenewalDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RenewalSummaryResponse {
        private long totalExpiringPolicies;
        private long dueIn45Days;
        private long dueIn30Days;
        private long dueIn15Days;
        private long dueIn7Days;
        private long expiredLapsed;
        private BigDecimal totalRenewalPremiumAtRisk;
        private double renewalRetentionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RenewalItemResponse {
        private Long clientId;
        private String clientCode;
        private String fullName;
        private String phoneNumber;
        private String whatsappNumber;
        private String email;
        private String city;
        private String insuranceType;
        private String existingInsurer;
        private LocalDate policyExpiryDate;
        private long daysUntilExpiry; // Negative if already expired
        private String urgencyBucket; // 45_DAYS, 30_DAYS, 15_DAYS, 7_DAYS, TODAY, EXPIRED
        private String sumInsured;
        private BigDecimal estimatedPremium;
        private String stage;
        private Long assignedAdvisorId;
        private String assignedAdvisorName;
        private Long managerId;
        private String managerName;
        private String lastFollowUpNotes;
        private String recommendedWhatsAppTemplate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendReminderRequest {
        private Long clientId;
        private String channel; // WHATSAPP, EMAIL, SMS
        private String customMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendReminderResponse {
        private boolean success;
        private String channel;
        private String message;
        private String recipientPhone;
        private String recipientEmail;
        private String previewText;
    }
}
