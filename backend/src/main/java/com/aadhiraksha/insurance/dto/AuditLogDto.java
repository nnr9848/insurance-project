package com.aadhiraksha.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private String entityName;
    private Long entityId;
    private String action; // CREATE, UPDATE, DELETE, REASSIGN, CALL_LOG, MEETING_SCHEDULED, STATUS_CHANGE
    private String fieldName;
    private String oldValue;
    private String newValue;
    private Long performedById;
    private String performedByName;
    private String ipAddress;
    private LocalDateTime timestamp;
}
