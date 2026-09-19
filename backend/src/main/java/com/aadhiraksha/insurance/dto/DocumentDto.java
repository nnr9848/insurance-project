package com.aadhiraksha.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class DocumentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadRequest {
        @NotNull(message = "Client ID is required")
        private Long clientId;

        @NotBlank(message = "Document type is required")
        private String documentType; // AADHAAR, PAN, RC_BOOK, MEDICAL_RECORD, PREVIOUS_POLICY, PROPOSAL_FORM, SALARY_SLIP, GST_CERTIFICATE, OTHER

        @NotBlank(message = "File name is required")
        private String fileName;

        @NotBlank(message = "File URL is required")
        private String fileUrl;

        private Long fileSizeBytes;
        private String fileType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyRequest {
        @NotBlank(message = "Status is required")
        private String status; // VERIFIED, REJECTED, PENDING_REVIEW

        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long clientId;
        private String clientName;
        private String clientPhone;
        private String documentType;
        private String fileName;
        private String fileUrl;
        private Long fileSizeBytes;
        private String fileType;
        private String verificationStatus;
        private Long verifiedById;
        private String verifiedByName;
        private String verificationNotes;
        private LocalDateTime verifiedAt;
        private Long uploadedById;
        private String uploadedByName;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentRequestLink {
        private String clientName;
        private String clientPhone;
        private String whatsAppUrl;
        private String checklist;
    }
}
