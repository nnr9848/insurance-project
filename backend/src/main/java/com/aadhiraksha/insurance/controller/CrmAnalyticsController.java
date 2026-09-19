package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.ManagerAnalyticsDto;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.CrmAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/analytics")
@RequiredArgsConstructor
@Tag(name = "CRM Analytics & Management Cockpit", description = "Endpoints for Manager and Admin analytical dashboards")
public class CrmAnalyticsController {

    private final CrmAnalyticsService crmAnalyticsService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @GetMapping("/manager-summary")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get analytical dashboard metrics and advisor performance breakdown for Manager/Admin")
    public ResponseEntity<ManagerAnalyticsDto.ManagerDashboardResponse> getManagerDashboardSummary(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmAnalyticsService.getManagerDashboardAnalytics(user));
    }

    @GetMapping("/superadmin-summary")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Get executive company-wide analytics and cross-branch performance for Super Admin")
    public ResponseEntity<com.aadhiraksha.insurance.dto.AdminAnalyticsDto.SuperAdminDashboardResponse> getSuperAdminSummary(Authentication auth) {
        return ResponseEntity.ok(crmAnalyticsService.getSuperAdminExecutiveAnalytics());
    }

    @GetMapping("/advisor-summary")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF', 'ROLE_POSP_AGENT')")
    @Operation(summary = "Get daily call counts, follow-ups, upcoming meetings, and pipeline telemetry for logged-in employee/advisor")
    public ResponseEntity<com.aadhiraksha.insurance.dto.AdvisorAnalyticsDto.AdvisorDashboardResponse> getAdvisorDashboardSummary(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmAnalyticsService.getAdvisorDashboardAnalytics(user));
    }
}
