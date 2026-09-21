package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class MeetingDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleMeetingRequest {
        private Long clientId;
        private String title;
        private String purpose;
        private String product;
        private LocalDateTime meetingDatetime;
        private LocalDateTime endDatetime;
        private String meetingType; // GOOGLE_MEET, IN_PERSON, PHONE
        private String googleMeetUrl;
        private String location;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateMeetingOutcomeRequest {
        private String status; // SCHEDULED, COMPLETED, RESCHEDULED, CANCELLED
        private String outcomeNotes;
        private String nextStage; // Optional update to client stage e.g. QUOTATION, DOCUMENTS
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingResponse {
        private Long id;
        private Long clientId;
        private String clientCode;
        private String clientName;
        private String clientEmail;
        private String clientPhone;
        private Long advisorId;
        private String advisorName;
        private String title;
        private String purpose;
        private String product;
        private LocalDateTime meetingDatetime;
        private LocalDateTime endDatetime;
        private String googleMeetUrl;
        private String googleCalendarEventId;
        private String meetingType;
        private String location;
        private String status;
        private String outcomeNotes;
        private LocalDateTime createdAt;
    }
}
