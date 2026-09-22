package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OpportunityDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOpportunityRequest {
        private Long clientId;
        private Long inquiryId;
        private String categorySlug;
        private String productName;
        private String coverageAmount;
        private BigDecimal estimatedPremium;
        private String stage;
        private String priority;
        private Boolean isPrimary;
        private Long assignedAdvisorId;
        private String specs;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStageRequest {
        private String stage;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpportunityResponse {
        private Long id;
        private Long clientId;
        private String clientCode;
        private String clientName;
        private Long inquiryId;
        private String categorySlug;
        private String productName;
        private String coverageAmount;
        private BigDecimal estimatedPremium;
        private String stage;
        private String priority;
        private Boolean isPrimary;
        private Long assignedAdvisorId;
        private String assignedAdvisorName;
        private String specs;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
