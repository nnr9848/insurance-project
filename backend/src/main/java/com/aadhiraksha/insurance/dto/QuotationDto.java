package com.aadhiraksha.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class QuotationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Client ID is required")
        private Long clientId;
        private Long inquiryId;

        @NotBlank(message = "Insurance type is required")
        private String insuranceType;

        @NotBlank(message = "Insurer name is required")
        private String insurerName;

        @NotBlank(message = "Plan name is required")
        private String planName;

        private String planVariant;

        @NotBlank(message = "Sum insured is required")
        private String sumInsured;

        @Builder.Default
        private Integer policyTenureYears = 1;

        @NotNull(message = "Base premium is required")
        @Positive(message = "Base premium must be positive")
        private BigDecimal basePremium;

        private BigDecimal ncbDiscountPercent;
        private String roomRentLimit;
        private String copayPercentage;
        private String restorationBenefit;
        private String prePostHospitalization;
        private Boolean maternityCovered;
        private Boolean opdCovered;
        private String notes;
        private String brochureUrl;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String quoteNumber;
        private Long clientId;
        private String clientName;
        private String clientPhone;
        private String clientEmail;
        private Long inquiryId;
        private String inquiryCategorySlug;
        private String inquiryStatus;
        private Long createdByAdvisorId;
        private String createdByAdvisorName;
        private String insuranceType;
        private String insurerName;
        private String planName;
        private String planVariant;
        private String sumInsured;
        private Integer policyTenureYears;
        private BigDecimal basePremium;
        private BigDecimal taxGst;
        private BigDecimal totalPremium;
        private BigDecimal ncbDiscountPercent;
        private String roomRentLimit;
        private String copayPercentage;
        private String restorationBenefit;
        private String prePostHospitalization;
        private Boolean maternityCovered;
        private Boolean opdCovered;
        private String status;
        private Integer versionNumber;
        private String notes;
        private String brochureUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendQuoteRequest {
        private String channel; // WHATSAPP, EMAIL, SMS
        private String recipientPhone;
        private String recipientEmail;
        private String customMessage;
    }
}
