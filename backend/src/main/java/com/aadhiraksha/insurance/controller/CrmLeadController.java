package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.*;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.CrmLeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm")
@RequiredArgsConstructor
@Tag(name = "Insurance Sales CRM Operations", description = "Endpoints for Leads, Calls, Follow-ups, and Meetings")
public class CrmLeadController {

    private final CrmLeadService crmLeadService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    // 1. Leads Master
    @GetMapping("/leads")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get clients/leads visible to the current authenticated user")
    public ResponseEntity<List<ClientLeadDto.LeadResponse>> getLeads(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.getLeadsForUser(user));
    }

    @PostMapping("/leads")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Create a new client lead entry")
    public ResponseEntity<ClientLeadDto.LeadResponse> createLead(@RequestBody ClientLeadDto.CreateLeadRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.createLead(request, user));
    }

    @PostMapping("/leads/bulk-import")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Bulk import multiple client leads from Excel/CSV")
    public ResponseEntity<List<ClientLeadDto.LeadResponse>> bulkImportLeads(@RequestBody List<ClientLeadDto.CreateLeadRequest> requests, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.bulkImportLeads(requests, user));
    }

    @PutMapping("/leads/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Update client lead record")
    public ResponseEntity<ClientLeadDto.LeadResponse> updateLead(@PathVariable Long id, @RequestBody ClientLeadDto.CreateLeadRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.updateLead(id, request, user));
    }

    @PostMapping("/leads/{id}/reassign")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Reassign a client lead to a new advisor")
    public ResponseEntity<ClientLeadDto.LeadResponse> reassignLead(@PathVariable Long id, @RequestBody ClientLeadDto.ReassignLeadRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.reassignLead(id, request.getTargetAdvisorId(), request.getReassignmentReason(), user));
    }

    // 2. Daily Call Logging
    @PostMapping("/calls")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Log call disposition result with notes and next follow-up date")
    public ResponseEntity<CallLogDto.CallLogResponse> logCall(@RequestBody CallLogDto.LogCallRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.logCall(request, user));
    }

    // 3. Meeting Scheduling (Google Meet / In-Person)
    @PostMapping("/meetings")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Schedule a client meeting with Google Meet link generation")
    public ResponseEntity<MeetingDto.MeetingResponse> scheduleMeeting(@RequestBody MeetingDto.ScheduleMeetingRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.scheduleMeeting(request, user));
    }

    @GetMapping("/meetings/upcoming")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get upcoming scheduled meetings")
    public ResponseEntity<List<MeetingDto.MeetingResponse>> getUpcomingMeetings(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.getUpcomingMeetings(user));
    }

    // 4. Follow-Up Reminders
    @GetMapping("/followups/due-today")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get follow-ups scheduled for today")
    public ResponseEntity<List<FollowUpDto.FollowUpResponse>> getDueTodayFollowUps(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.getDueTodayFollowUps(user));
    }

    @GetMapping("/followups/overdue")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get overdue follow-up tasks")
    public ResponseEntity<List<FollowUpDto.FollowUpResponse>> getOverdueFollowUps(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmLeadService.getOverdueFollowUps(user));
    }
}
