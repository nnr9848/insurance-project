package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClientDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateClientRequest {
        private String fullName;
        private String companyName;
        private String phoneNumber;
        private String whatsappNumber;
        private String email;
        private LocalDate dob;
        private String city;
        private String state;
        private String pincode;
        private String insuranceType;
        private String existingInsurer;
        private LocalDate policyExpiryDate;
        private String sumInsured;
        private BigDecimal estimatedPremium;
        private String leadSource;
        private String stage;
        private String priority;
        private Long assignedAdvisorId;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientResponse {
        private Long id;
        private String clientCode;
        private String fullName;
        private String companyName;
        private String phoneNumber;
        private String whatsappNumber;
        private String email;
        private LocalDate dob;
        private String city;
        private String state;
        private String pincode;
        private String insuranceType;
        private String existingInsurer;
        private LocalDate policyExpiryDate;
        private String sumInsured;
        private BigDecimal estimatedPremium;
        private String leadSource;
        private String stage;
        private String priority;
        private Long assignedAdvisorId;
        private String assignedAdvisorName;
        private Long managerId;
        private String managerName;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long callCount;
        private Long pendingFollowUpCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReassignClientRequest {
        private Long targetAdvisorId;
        private String reassignmentReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStageRequest {
        private String stage;
        private String notes;
    }
}
