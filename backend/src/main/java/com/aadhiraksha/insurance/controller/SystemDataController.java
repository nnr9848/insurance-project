package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.service.SystemDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/crm/system")
@RequiredArgsConstructor
@Tag(name = "CRM System & Sandbox Operations", description = "On-demand data seeding and clean purge operations for Super Admin")
public class SystemDataController {

    private final SystemDataService systemDataService;

    @PostMapping("/seed-demo-data")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Seed realistic enterprise demo data across all CRM modules on-demand")
    public ResponseEntity<Map<String, Object>> seedDemoData() {
        return ResponseEntity.ok(systemDataService.seedRealisticDemoData());
    }

    @PostMapping("/purge-demo-data")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "Purge all demo leads, quotations, documents, and approvals cleanly without affecting core accounts")
    public ResponseEntity<Map<String, Object>> purgeDemoData() {
        return ResponseEntity.ok(systemDataService.purgeDemoData());
    }
}
