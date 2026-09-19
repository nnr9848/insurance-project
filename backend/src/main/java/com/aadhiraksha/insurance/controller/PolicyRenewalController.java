package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.PolicyRenewalDto;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.UserRepository;
import com.aadhiraksha.insurance.service.PolicyRenewalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/renewals")
@RequiredArgsConstructor
@Tag(name = "Policy Renewal Engine", description = "Automated policy renewal reminder and pipeline management APIs")
public class PolicyRenewalController {

    private final PolicyRenewalService policyRenewalService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get policy renewal analytics & milestone bucket metrics")
    public ResponseEntity<PolicyRenewalDto.RenewalSummaryResponse> getRenewalSummary(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(policyRenewalService.getRenewalSummary(user));
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get list of expiring policies filtered by urgency bucket")
    public ResponseEntity<List<PolicyRenewalDto.RenewalItemResponse>> getRenewalList(
            @RequestParam(value = "bucket", required = false, defaultValue = "ALL") String bucket,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(policyRenewalService.getRenewalList(user, bucket));
    }

    @PostMapping("/send-reminder")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Dispatch or record a policy renewal reminder")
    public ResponseEntity<PolicyRenewalDto.SendReminderResponse> sendRenewalReminder(
            @RequestBody PolicyRenewalDto.SendReminderRequest request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(policyRenewalService.sendRenewalReminder(request, user));
    }

    @PostMapping("/trigger-scan")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Manually trigger background renewal scan job (Admin only)")
    public ResponseEntity<String> triggerRenewalScan() {
        policyRenewalService.executeAutomatedRenewalMilestoneScan();
        return ResponseEntity.ok("Policy Renewal Milestone scan executed successfully.");
    }
}
