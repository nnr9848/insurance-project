package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.ApprovalDto;
import com.aadhiraksha.insurance.service.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/approvals")
@RequiredArgsConstructor
@Tag(name = "CRM Manager Approvals", description = "Workflows for Discounts, Reassignments, HNW Policies & Exceptions")
public class ApprovalController {

    private final ApprovalService approvalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Submit an approval request to the Branch Manager")
    public ResponseEntity<ApprovalDto.Response> submitRequest(
            @Valid @RequestBody ApprovalDto.SubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(approvalService.submitApprovalRequest(request, userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Get approval requests scoped to current user hierarchy")
    public ResponseEntity<List<ApprovalDto.Response>> getApprovals(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(approvalService.getApprovals(userDetails.getUsername()));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Get approval requests associated with a specific client")
    public ResponseEntity<List<ApprovalDto.Response>> getClientApprovals(
            @PathVariable Long clientId
    ) {
        return ResponseEntity.ok(approvalService.getClientApprovals(clientId));
    }

    @PatchMapping("/{approvalId}/review")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Manager decision: Approve or Reject a submitted workflow request")
    public ResponseEntity<ApprovalDto.Response> reviewApproval(
            @PathVariable Long approvalId,
            @Valid @RequestBody ApprovalDto.ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(approvalService.reviewApproval(approvalId, request, userDetails.getUsername()));
    }
}
