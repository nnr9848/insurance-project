package com.aadhiraksha.insurance.service;

import com.aadhiraksha.insurance.model.AuditLog;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.aadhiraksha.insurance.dto.AuditLogDto;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAuditLogsForEntity(String entityName, Long entityId) {
        return auditLogRepository.findByEntityNameAndEntityIdOrderByTimestampDesc(entityName, entityId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getRecentCompanyAuditFeed() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AuditLogDto mapToDto(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .action(log.getAction())
                .fieldName(log.getFieldName())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .performedById(log.getPerformedBy() != null ? log.getPerformedBy().getId() : null)
                .performedByName(log.getPerformedByName() != null ? log.getPerformedByName() : (log.getPerformedBy() != null ? log.getPerformedBy().getFullName() : "SYSTEM"))
                .ipAddress(log.getIpAddress())
                .timestamp(log.getTimestamp())
                .build();
    }
}
