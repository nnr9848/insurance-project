package com.aadhiraksha.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ApprovalDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitRequest {
        @NotBlank(message = "Request type is required")
        private String requestType; // SPECIAL_DISCOUNT, LEAD_REASSIGNMENT, HIGH_SUM_INSURED, POLICY_CANCELLATION, CLIENT_ARCHIVE

        private Long clientId;
        private String currentValue;
        private String proposedValue;
        private BigDecimal discountPercent;
        private Long targetAdvisorId;

        @NotBlank(message = "Reason is required")
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewRequest {
        @NotBlank(message = "Status is required")
        private String status; // APPROVED, REJECTED

        private String reviewNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String requestType;
        private Long clientId;
        private String clientName;
        private String clientPhone;
        private Long requestedById;
        private String requestedByName;
        private Long managerId;
        private String managerName;
        private String currentValue;
        private String proposedValue;
        private BigDecimal discountPercent;
        private Long targetAdvisorId;
        private String targetAdvisorName;
        private String status;
        private String reason;
        private String managerReviewNotes;
        private LocalDateTime reviewedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
