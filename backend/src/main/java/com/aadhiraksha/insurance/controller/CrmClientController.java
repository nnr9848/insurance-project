package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.*;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.CrmClientService;
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
@Tag(name = "Insurance Sales CRM Operations", description = "Endpoints for Master Clients, Calls, Follow-ups, and Meetings")
public class CrmClientController {

    private final CrmClientService crmClientService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return userRepository.findByRoleName("ROLE_SUPER_ADMIN").stream().findFirst().orElse(null);
        }
        return userRepository.findByEmail(auth.getName())
                .or(() -> userRepository.findByPhoneNumber(auth.getName()))
                .orElseGet(() -> userRepository.findByRoleName("ROLE_SUPER_ADMIN").stream().findFirst().orElse(null));
    }

    // 1. Clients Master & Individual Profile
    @GetMapping({"/clients", "/leads"})
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get clients visible to the current authenticated user")
    public ResponseEntity<List<ClientDto.ClientResponse>> getClients(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.getClientsForUser(user));
    }

    @GetMapping({"/clients/{id}", "/leads/{id}"})
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get single client master profile by ID")
    public ResponseEntity<ClientDto.ClientResponse> getClientById(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.getClientById(id, user));
    }

    @PostMapping({"/clients", "/leads"})
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Create a new client entry")
    public ResponseEntity<ClientDto.ClientResponse> createClient(@RequestBody ClientDto.CreateClientRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.createClient(request, user));
    }

    @PostMapping({"/clients/bulk-import", "/leads/bulk-import"})
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Bulk import multiple clients from Excel/CSV")
    public ResponseEntity<List<ClientDto.ClientResponse>> bulkImportClients(@RequestBody List<ClientDto.CreateClientRequest> requests, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.bulkImportClients(requests, user));
    }

    @PutMapping({"/clients/{id}", "/leads/{id}"})
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Update client master record")
    public ResponseEntity<ClientDto.ClientResponse> updateClient(@PathVariable Long id, @RequestBody ClientDto.CreateClientRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.updateClient(id, request, user));
    }

    @PostMapping({"/clients/{id}/reassign", "/leads/{id}/reassign"})
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Reassign a client to a new advisor")
    public ResponseEntity<ClientDto.ClientResponse> reassignClient(@PathVariable Long id, @RequestBody ClientDto.ReassignClientRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.reassignClient(id, request.getTargetAdvisorId(), request.getReassignmentReason(), user));
    }

    // 2. Daily Call Logging & Telephony History
    @PostMapping("/calls")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Log call disposition result with notes and next follow-up date")
    public ResponseEntity<CallLogDto.CallLogResponse> logCall(@RequestBody CallLogDto.LogCallRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.logCall(request, user));
    }

    @GetMapping("/calls/history")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get historical call logs scoped to current user hierarchy")
    public ResponseEntity<List<CallLogDto.CallLogResponse>> getCallHistory(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.getCallHistory(user));
    }

    @GetMapping("/calls/client/{clientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get call logs for a specific client")
    public ResponseEntity<List<CallLogDto.CallLogResponse>> getClientCallLogs(@PathVariable Long clientId) {
        return ResponseEntity.ok(crmClientService.getCallLogsForClient(clientId));
    }

    // 3. Meeting Scheduling (Google Meet / In-Person)
    @PostMapping("/meetings")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Schedule a client meeting with Google Meet link generation")
    public ResponseEntity<MeetingDto.MeetingResponse> scheduleMeeting(@RequestBody MeetingDto.ScheduleMeetingRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.scheduleMeeting(request, user));
    }

    @GetMapping("/meetings/upcoming")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get upcoming scheduled meetings")
    public ResponseEntity<List<MeetingDto.MeetingResponse>> getUpcomingMeetings(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.getUpcomingMeetings(user));
    }

    @PatchMapping("/meetings/{meetingId}/outcome")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Log outcome for a meeting (Completed, Rescheduled, Cancelled)")
    public ResponseEntity<MeetingDto.MeetingResponse> updateMeetingOutcome(
            @PathVariable Long meetingId,
            @RequestBody MeetingDto.UpdateMeetingOutcomeRequest request,
            Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.updateMeetingOutcome(meetingId, request, user));
    }

    // 4. Follow-Up Reminders & Callback Scheduling
    @PostMapping("/followups")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Schedule a client follow-up callback or task")
    public ResponseEntity<FollowUpDto.FollowUpResponse> createFollowUp(@RequestBody FollowUpDto.CreateFollowUpRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.createFollowUp(request, user));
    }

    @GetMapping("/followups/due-today")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get follow-ups scheduled for today")
    public ResponseEntity<List<FollowUpDto.FollowUpResponse>> getDueTodayFollowUps(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.getDueTodayFollowUps(user));
    }

    @GetMapping("/followups/overdue")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get overdue follow-up tasks")
    public ResponseEntity<List<FollowUpDto.FollowUpResponse>> getOverdueFollowUps(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(crmClientService.getOverdueFollowUps(user));
    }
}
