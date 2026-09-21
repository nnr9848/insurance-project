package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.dto.DocumentDto;
import com.aadhiraksha.insurance.service.DocumentService;
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
@RequestMapping("/api/crm/documents")
@RequiredArgsConstructor
@Tag(name = "CRM Document Collection", description = "Digital KYC, Proposal Documents & Verification Engine")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Upload and attach a KYC / Policy document to a client")
    public ResponseEntity<DocumentDto.Response> uploadDocument(
            @Valid @RequestBody DocumentDto.UploadRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(documentService.uploadDocument(request, userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get all documents scoped to user role & hierarchy")
    public ResponseEntity<List<DocumentDto.Response>> getDocuments(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(documentService.getDocuments(userDetails.getUsername()));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Get all documents for a specific client")
    public ResponseEntity<List<DocumentDto.Response>> getDocumentsForClient(
            @PathVariable Long clientId
    ) {
        return ResponseEntity.ok(documentService.getClientDocuments(clientId));
    }

    @PatchMapping("/{docId}/verify")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')")
    @Operation(summary = "Verify or reject a client KYC document")
    public ResponseEntity<DocumentDto.Response> verifyDocument(
            @PathVariable Long docId,
            @Valid @RequestBody DocumentDto.VerifyRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(documentService.verifyDocument(docId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{docId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    @Operation(summary = "Delete an attached client document")
    public ResponseEntity<Map<String, Object>> deleteDocument(
            @PathVariable Long docId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        documentService.deleteDocument(docId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("success", true, "message", "Document deleted successfully"));
    }

    @PostMapping("/client/{clientId}/request-checklist")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ADVISOR')")
    @Operation(summary = "Generate 1-tap WhatsApp document checklist request")
    public ResponseEntity<DocumentDto.DocumentRequestLink> requestDocumentsWhatsApp(
            @PathVariable Long clientId,
            @RequestBody(required = false) Map<String, List<String>> requestBody,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<String> docTypes = requestBody != null ? requestBody.get("docTypes") : null;
        return ResponseEntity.ok(documentService.generateWhatsAppDocumentRequest(clientId, docTypes, userDetails.getUsername()));
    }
}
