package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.QuotationDto;
import com.aadhiraksha.insurance.service.QuotationService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/crm/quotations")
@RequiredArgsConstructor
@Tag(name = "CRM Quotations", description = "Multi-Insurer Quotations, Comparative Matrix & Revision Dispatch")
public class QuotationController {

    private final QuotationService quotationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Create a new multi-insurer quotation for a client")
    public ResponseEntity<QuotationDto.Response> createQuotation(
            @Valid @RequestBody QuotationDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(quotationService.createQuotation(request, userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Get quotations scoped to current user role and hierarchy")
    public ResponseEntity<List<QuotationDto.Response>> getQuotations(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(quotationService.getQuotationsForUser(userDetails.getUsername()));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Get all quotation revisions and comparison options for a specific client")
    public ResponseEntity<List<QuotationDto.Response>> getQuotationsForClient(
            @PathVariable Long clientId
    ) {
        return ResponseEntity.ok(quotationService.getQuotationsForClient(clientId));
    }

    @PatchMapping("/{quoteId}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Update quotation status (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)")
    public ResponseEntity<QuotationDto.Response> updateStatus(
            @PathVariable Long quoteId,
            @RequestBody Map<String, String> statusBody,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String status = statusBody.get("status");
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status cannot be blank");
        }
        return ResponseEntity.ok(quotationService.updateQuotationStatus(quoteId, status, userDetails.getUsername()));
    }

    @PostMapping("/{quoteId}/send")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Dispatch quotation via WhatsApp or Email and mark status as SENT")
    public ResponseEntity<Map<String, Object>> sendQuotation(
            @PathVariable Long quoteId,
            @RequestBody QuotationDto.SendQuoteRequest sendRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(quotationService.sendQuotation(quoteId, sendRequest, userDetails.getUsername()));
    }
}
