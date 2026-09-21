package com.aadhiraksha.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class QuoteDto {

    @Data
    public static class InquiryRequest {
        @NotBlank(message = "Category slug is required")
        private String categorySlug;

        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Phone number is required")
        private String phoneNumber;

        private String secondaryPhone;
        private String email;
        private String city;
        private String planDetails; // JSON string or text summary
    }

    @Data
    public static class POSPApplicationRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Phone number is required")
        private String phoneNumber;

        @NotBlank(message = "PAN Number is required")
        private String panNumber;

        private String aadhaarNumber;
        private String city;
        private String state;
        private Integer experienceYears;
        private String password;
    }

    @Data
    public static class ClaimRequest {
        @NotBlank(message = "Policy number is required")
        private String policyNumber;

        @NotBlank(message = "Claimant name is required")
        private String claimantName;

        @NotBlank(message = "Contact phone is required")
        private String contactPhone;

        @NotBlank(message = "Claim type is required")
        private String claimType;

        private String hospitalOrGarage;
        private String incidentDate;
        private String description;
    }
}
