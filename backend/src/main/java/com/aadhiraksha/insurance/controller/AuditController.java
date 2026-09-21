package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.AuditLogDto;
import com.aadhiraksha.insurance.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/audit")
@RequiredArgsConstructor
@Tag(name = "Enterprise Audit Trail & Compliance", description = "Endpoints for immutable activity tracking & field-level audit logs")
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get historical audit logs for a specific client lead (including pre-conversion inquiry heritage)")
    public ResponseEntity<List<AuditLogDto>> getClientAuditLogs(@PathVariable Long clientId) {
        return ResponseEntity.ok(auditService.getCompositeClientAuditTimeline(clientId));
    }

    @GetMapping("/inquiry/{inquiryId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get historical audit logs for a specific web quote inquiry / lead")
    public ResponseEntity<List<AuditLogDto>> getInquiryAuditLogs(@PathVariable Long inquiryId) {
        return ResponseEntity.ok(auditService.getAuditLogsForEntity("LEAD_INQUIRY", inquiryId));
    }

    @GetMapping("/company-feed")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get recent company-wide activity audit feed for managers & admins")
    public ResponseEntity<List<AuditLogDto>> getCompanyAuditFeed() {
        return ResponseEntity.ok(auditService.getRecentCompanyAuditFeed());
    }
}
