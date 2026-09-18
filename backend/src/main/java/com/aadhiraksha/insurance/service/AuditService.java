package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.AuditLog;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void logAction(String entityName, Long entityId, String action, String fieldName, 
                          String oldValue, String newValue, User performedBy, String ipAddress) {
        try {
            AuditLog audit = AuditLog.builder()
                    .entityName(entityName)
                    .entityId(entityId)
                    .action(action)
                    .fieldName(fieldName)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .performedBy(performedBy)
                    .performedByName(performedBy != null ? performedBy.getFullName() : "SYSTEM")
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.error("Failed to persist audit log for entity: {}, id: {}", entityName, entityId, e);
        }
    }
}
