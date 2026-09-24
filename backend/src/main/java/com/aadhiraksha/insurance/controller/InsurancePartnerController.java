package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.model.InsurancePartner;
import com.aadhiraksha.insurance.model.User;
import com.aadhiraksha.insurance.repository.InsurancePartnerRepository;
import com.aadhiraksha.insurance.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Insurance Partners", description = "Public & Admin APIs for managing partner insurance companies, logos & redirection links")
public class InsurancePartnerController {

    private final InsurancePartnerRepository partnerRepository;
    private final AuditService auditService;

    public InsurancePartnerController(InsurancePartnerRepository partnerRepository, AuditService auditService) {
        this.partnerRepository = partnerRepository;
        this.auditService = auditService;
    }

    // Public Endpoint: Retrieve active insurance partners for homepage grid
    @GetMapping("/partners")
    @Operation(summary = "Get all active insurance partners for the public portal")
    public ResponseEntity<List<InsurancePartner>> getActivePartners() {
        return ResponseEntity.ok(partnerRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }

    // Admin Endpoint: List all partners (including inactive)
    @GetMapping("/admin/partners")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all insurance partners including inactive (Admin/Manager only)")
    public ResponseEntity<List<InsurancePartner>> getAllPartnersAdmin() {
        return ResponseEntity.ok(partnerRepository.findAllByOrderByDisplayOrderAsc());
    }

    // Admin Endpoint: Create new partner
    @PostMapping("/admin/partners")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Create a new insurance partner with redirect link & logo")
    public ResponseEntity<InsurancePartner> createPartner(
            @RequestBody InsurancePartner partner,
            Authentication authentication
    ) {
        if (partner.getName() == null || partner.getName().isBlank()) {
            throw new IllegalArgumentException("Partner name is required");
        }
        if (partner.getRedirectUrl() == null || partner.getRedirectUrl().isBlank()) {
            throw new IllegalArgumentException("Redirect URL is required");
        }
        if (partner.getCategory() == null || partner.getCategory().isBlank()) {
            partner.setCategory("general");
        }
        if (partner.getDisplayOrder() == null) {
            partner.setDisplayOrder(0);
        }
        if (partner.getIsActive() == null) {
            partner.setIsActive(true);
        }

        InsurancePartner saved = partnerRepository.save(partner);

        User performedBy = (authentication != null && authentication.getPrincipal() instanceof User)
                ? (User) authentication.getPrincipal() : null;

        auditService.logAction(
                "INSURANCE_PARTNER",
                saved.getId(),
                "CREATE",
                "partner",
                null,
                "Created partner " + saved.getName(),
                performedBy,
                "Added new insurance partner via Admin Panel"
        );

        return ResponseEntity.ok(saved);
    }

    // Admin Endpoint: Update partner details (URL, Logo, Category, Display Order)
    @PutMapping("/admin/partners/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Update an existing partner's redirection URL, logo, or category")
    public ResponseEntity<InsurancePartner> updatePartner(
            @PathVariable Long id,
            @RequestBody InsurancePartner payload,
            Authentication authentication
    ) {
        InsurancePartner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Partner not found with ID: " + id));

        if (payload.getName() != null && !payload.getName().isBlank()) partner.setName(payload.getName().trim());
        if (payload.getCategory() != null && !payload.getCategory().isBlank()) partner.setCategory(payload.getCategory().trim().toLowerCase());
        if (payload.getRedirectUrl() != null && !payload.getRedirectUrl().isBlank()) partner.setRedirectUrl(payload.getRedirectUrl().trim());
        if (payload.getLogoUrl() != null) partner.setLogoUrl(payload.getLogoUrl().trim());
        if (payload.getLogoKey() != null) partner.setLogoKey(payload.getLogoKey().trim());
        if (payload.getDisplayOrder() != null) partner.setDisplayOrder(payload.getDisplayOrder());
        if (payload.getIsActive() != null) partner.setIsActive(payload.getIsActive());

        InsurancePartner updated = partnerRepository.save(partner);

        User performedBy = (authentication != null && authentication.getPrincipal() instanceof User)
                ? (User) authentication.getPrincipal() : null;

        auditService.logAction(
                "INSURANCE_PARTNER",
                id,
                "UPDATE",
                "details",
                null,
                "Updated details & links for " + updated.getName(),
                performedBy,
                "Admin updated partner configuration"
        );

        return ResponseEntity.ok(updated);
    }

    // Admin Endpoint: Toggle Active/Inactive status
    @PatchMapping("/admin/partners/{id}/toggle-status")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Toggle partner active/inactive status")
    public ResponseEntity<InsurancePartner> togglePartnerStatus(
            @PathVariable Long id,
            Authentication authentication
    ) {
        InsurancePartner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Partner not found with ID: " + id));

        boolean newStatus = !Boolean.TRUE.equals(partner.getIsActive());
        partner.setIsActive(newStatus);
        InsurancePartner saved = partnerRepository.save(partner);

        User performedBy = (authentication != null && authentication.getPrincipal() instanceof User)
                ? (User) authentication.getPrincipal() : null;

        auditService.logAction(
                "INSURANCE_PARTNER",
                id,
                "STATUS_CHANGE",
                "isActive",
                String.valueOf(!newStatus),
                String.valueOf(newStatus),
                performedBy,
                (newStatus ? "Activated" : "Deactivated") + " partner " + saved.getName()
        );

        return ResponseEntity.ok(saved);
    }

    // Admin Endpoint: Batch reorder partners
    @PutMapping("/admin/partners/reorder")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Batch reorder insurance partners display order")
    public ResponseEntity<List<InsurancePartner>> reorderPartners(
            @RequestBody List<Long> orderedIds,
            Authentication authentication
    ) {
        if (orderedIds == null || orderedIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<InsurancePartner> allPartners = partnerRepository.findAll();
        Map<Long, InsurancePartner> map = new java.util.HashMap<>();
        for (InsurancePartner p : allPartners) {
            map.put(p.getId(), p);
        }

        List<InsurancePartner> toUpdate = new java.util.ArrayList<>();
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            InsurancePartner partner = map.get(id);
            if (partner != null) {
                partner.setDisplayOrder(i + 1);
                toUpdate.add(partner);
            }
        }

        List<InsurancePartner> saved = partnerRepository.saveAll(toUpdate);

        User performedBy = (authentication != null && authentication.getPrincipal() instanceof User)
                ? (User) authentication.getPrincipal() : null;

        auditService.logAction(
                "INSURANCE_PARTNER",
                0L,
                "REORDER",
                "displayOrder",
                null,
                "Batch reordered " + toUpdate.size() + " insurance partners",
                performedBy,
                "Admin reordered partner cards"
        );

        return ResponseEntity.ok(partnerRepository.findAllByOrderByDisplayOrderAsc());
    }

    // Admin Endpoint: Reset to factory default 20 partners catalog
    @PostMapping("/admin/partners/reset-defaults")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Reset insurance partners to clean default catalog (clears duplicates)")
    public ResponseEntity<List<InsurancePartner>> resetToDefaults(
            Authentication authentication
    ) {
        partnerRepository.deleteAll();

        String[][] defaults = new String[][] {
            {"Star Health Insurance", "health", "starHealthLogo", "https://www.starhealth.in/"},
            {"HDFC ERGO", "general", "hdfcErgoLogo", "https://www.hdfcergo.com/"},
            {"ICICI Lombard", "general", "iciciLombardLogo", "https://www.icicilombard.com/"},
            {"Care Health Insurance", "health", "careHealthLogo", "https://www.careinsurance.com/"},
            {"TATA AIG Insurance", "general", "tataAigLogo", "https://www.tataaig.com/"},
            {"Bajaj Allianz", "general", "bajajAllianzLogo", "https://www.bajajallianz.com/"},
            {"Niva Bupa Health", "health", "nivaBupaLogo", "https://www.nivabupa.com/"},
            {"SBI General Insurance", "general", "sbiGeneralLogo", "https://www.sbigeneral.in/"},
            {"Life Insurance Corporation (LIC)", "life", "licLogo", "https://licindia.in/"},
            {"Max Life Insurance", "life", "axisMaxLogo", "https://www.maxlifeinsurance.com/"},
            {"Aditya Birla Capital", "health", "adityaBirlaLogo", "https://www.adityabirlacapital.com/"},
            {"Reliance General Insurance", "general", "relianceGeneralLogo", "https://www.reliancegeneral.co.in/"},
            {"Digit Insurance", "general", "digitLogo", "https://www.godigit.com/"},
            {"Kotak General Insurance", "general", "kotakGeneralLogo", "https://www.kotakgeneral.com/"},
            {"ManipalCigna Health", "health", "manipalCignaLogo", "https://www.manipalcigna.com/"},
            {"Chola MS General Insurance", "general", "cholaMsLogo", "https://www.cholainsurance.com/"},
            {"Future Generali", "general", "futureGeneraliLogo", "https://general.futuregenerali.in/"},
            {"Magma HDI General", "general", "magmaHdiLogo", "https://www.magmahdi.com/"},
            {"National Insurance", "general", "nationalInsuranceLogo", "https://nationalinsurance.nic.co.in/"},
            {"Oriental Insurance", "general", "orientalInsuranceLogo", "https://orientalinsurance.org.in/"}
        };

        List<InsurancePartner> cleanList = new java.util.ArrayList<>();
        for (int i = 0; i < defaults.length; i++) {
            String[] row = defaults[i];
            InsurancePartner p = new InsurancePartner();
            p.setName(row[0]);
            p.setCategory(row[1]);
            p.setLogoKey(row[2]);
            p.setRedirectUrl(row[3]);
            p.setDisplayOrder(i + 1);
            p.setIsActive(true);
            cleanList.add(p);
        }

        partnerRepository.saveAll(cleanList);

        User performedBy = (authentication != null && authentication.getPrincipal() instanceof User)
                ? (User) authentication.getPrincipal() : null;

        auditService.logAction(
                "INSURANCE_PARTNER",
                0L,
                "RESET_DEFAULTS",
                "catalog",
                null,
                "Reset partners catalog to factory defaults",
                performedBy,
                "Admin executed factory reset on partner integrations"
        );

        return ResponseEntity.ok(partnerRepository.findAllByOrderByDisplayOrderAsc());
    }

    // Admin Endpoint: Delete partner
    @DeleteMapping("/admin/partners/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Delete an insurance partner")
    public ResponseEntity<Map<String, String>> deletePartner(
            @PathVariable Long id,
            Authentication authentication
    ) {
        InsurancePartner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Partner not found with ID: " + id));

        partnerRepository.delete(partner);

        User performedBy = (authentication != null && authentication.getPrincipal() instanceof User)
                ? (User) authentication.getPrincipal() : null;

        auditService.logAction(
                "INSURANCE_PARTNER",
                id,
                "DELETE",
                "partner",
                partner.getName(),
                null,
                performedBy,
                "Deleted partner " + partner.getName()
        );

        return ResponseEntity.ok(Map.of("message", "Partner deleted successfully"));
    }
}
