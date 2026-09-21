package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.model.QuoteInquiry;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.QuoteInquiryRepository;
import com.aadhiraksha.insurance.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crm/lead-inquiries")
@RequiredArgsConstructor
@Tag(name = "Web Lead Inquiries", description = "Endpoints for managing incoming quote inquiries / web leads")
public class LeadInquiryController {

    private final QuoteInquiryRepository quoteInquiryRepository;
    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get all incoming web quote inquiries / leads")
    public ResponseEntity<List<QuoteInquiry>> getAllInquiries() {
        return ResponseEntity.ok(quoteInquiryRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get a specific web quote inquiry / lead by ID")
    public ResponseEntity<QuoteInquiry> getInquiryById(@PathVariable Long id) {
        QuoteInquiry inquiry = quoteInquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found with ID: " + id));
        return ResponseEntity.ok(inquiry);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Update web inquiry triage status (NEW, CONTACTED, QUALIFIED, ARCHIVED)")
    public ResponseEntity<QuoteInquiry> updateInquiryStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        QuoteInquiry inquiry = quoteInquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found with ID: " + id));
        String oldStatus = inquiry.getStatus();
        String newStatus = body.get("status");
        if (newStatus != null && !newStatus.isBlank()) {
            inquiry.setStatus(newStatus.toUpperCase());
            QuoteInquiry saved = quoteInquiryRepository.save(inquiry);

            User performedBy = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                performedBy = (User) authentication.getPrincipal();
            }

            auditService.logAction(
                    "LEAD_INQUIRY",
                    id,
                    "STATUS_CHANGE",
                    "status",
                    oldStatus,
                    newStatus.toUpperCase(),
                    performedBy,
                    "Updated web inquiry status"
            );
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.ok(inquiry);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Update web lead inquiry details")
    public ResponseEntity<QuoteInquiry> updateInquiry(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        QuoteInquiry inquiry = quoteInquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found with ID: " + id));

        if (body.containsKey("fullName") && body.get("fullName") != null) inquiry.setFullName((String) body.get("fullName"));
        if (body.containsKey("phoneNumber") && body.get("phoneNumber") != null) inquiry.setPhoneNumber((String) body.get("phoneNumber"));
        if (body.containsKey("secondaryPhone")) inquiry.setSecondaryPhone((String) body.get("secondaryPhone"));
        if (body.containsKey("email")) inquiry.setEmail((String) body.get("email"));
        if (body.containsKey("city")) inquiry.setCity((String) body.get("city"));
        if (body.containsKey("categorySlug") && body.get("categorySlug") != null) inquiry.setCategorySlug((String) body.get("categorySlug"));
        if (body.containsKey("status") && body.get("status") != null) inquiry.setStatus((String) body.get("status"));
        if (body.containsKey("planDetails")) inquiry.setPlanDetails((String) body.get("planDetails"));

        QuoteInquiry saved = quoteInquiryRepository.save(inquiry);

        User performedBy = null;
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            performedBy = (User) authentication.getPrincipal();
        }

        auditService.logAction(
                "LEAD_INQUIRY",
                id,
                "UPDATE",
                "details",
                null,
                "Updated details for " + saved.getFullName(),
                performedBy,
                "Manual quick edit in CRM triage"
        );

        return ResponseEntity.ok(saved);
    }
}
