package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class CallLogDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LogCallRequest {
        private Long clientId;
        private String callResult; // ANSWERED, NOT_ANSWERED, INTERESTED, NOT_INTERESTED, CALL_BACK, QUOTE_REQUESTED, DOCS_REQUESTED, MEETING_REQUESTED, WRONG_NUMBER, CONVERTED, LOST
        private Integer callDurationSeconds;
        private String callNotes;
        private LocalDateTime nextFollowUpDate;
        private String updateStageTo; // Optional stage update
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CallLogResponse {
        private Long id;
        private Long clientId;
        private String clientName;
        private String clientPhone;
        private Long advisorId;
        private String advisorName;
        private String callResult;
        private Integer callDurationSeconds;
        private String callNotes;
        private LocalDateTime nextFollowUpDate;
        private LocalDateTime createdAt;
    }
}
