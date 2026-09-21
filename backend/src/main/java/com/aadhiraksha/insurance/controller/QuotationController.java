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
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Create a new multi-insurer quotation for a client")
    public ResponseEntity<QuotationDto.Response> createQuotation(
            @Valid @RequestBody QuotationDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(quotationService.createQuotation(request, userDetails.getUsername()));
    }

    @PutMapping("/{quoteId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Update/revise an existing quotation")
    public ResponseEntity<QuotationDto.Response> updateQuotation(
            @PathVariable Long quoteId,
            @Valid @RequestBody QuotationDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(quotationService.updateQuotation(quoteId, request, userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get quotations scoped to current user role and hierarchy")
    public ResponseEntity<List<QuotationDto.Response>> getQuotations(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(quotationService.getQuotations(userDetails.getUsername()));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get all quotation revisions and comparison options for a specific client")
    public ResponseEntity<List<QuotationDto.Response>> getQuotationsForClient(
            @PathVariable Long clientId
    ) {
        return ResponseEntity.ok(quotationService.getClientQuotations(clientId));
    }

    @PatchMapping("/{quoteId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
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
        return ResponseEntity.ok(quotationService.updateQuoteStatus(quoteId, status, userDetails.getUsername()));
    }

    @PostMapping("/{quoteId}/send")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Dispatch quotation via WhatsApp or Email and mark status as SENT")
    public ResponseEntity<Map<String, Object>> sendQuotation(
            @PathVariable Long quoteId,
            @RequestBody QuotationDto.SendQuoteRequest sendRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(quotationService.sendQuoteDispatch(quoteId, sendRequest, userDetails.getUsername()));
    }
}
