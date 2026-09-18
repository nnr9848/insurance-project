package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class FollowUpDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFollowUpRequest {
        private Long clientId;
        private LocalDateTime scheduledDatetime;
        private String reminderMilestone; // ONE_DAY_BEFORE, ONE_HOUR_BEFORE, FIFTEEN_MIN_BEFORE, EXACT
        private String channel; // PHONE_CALL, WHATSAPP, EMAIL, IN_PERSON_VISIT
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateFollowUpStatusRequest {
        private String status; // PENDING, COMPLETED, OVERDUE, RESCHEDULED, CANCELLED
        private String notes;
        private LocalDateTime rescheduleDatetime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowUpResponse {
        private Long id;
        private Long clientId;
        private String clientCode;
        private String clientName;
        private String clientPhone;
        private String insuranceType;
        private Long advisorId;
        private String advisorName;
        private LocalDateTime scheduledDatetime;
        private String reminderMilestone;
        private String channel;
        private String status;
        private String notes;
        private Boolean isOverdue;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
    }
}
