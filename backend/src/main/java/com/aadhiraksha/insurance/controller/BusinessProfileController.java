package com.aadhiraksha.insurance.controller;

import com.aadhiraksha.insurance.model.BusinessProfile;
import com.aadhiraksha.insurance.repository.BusinessProfileRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Business Profile & Contact Settings", description = "Public & Admin APIs for corporate contact details, hotline, and address")
public class BusinessProfileController {

    private final BusinessProfileRepository repository;

    /**
     * Public endpoint: retrieve canonical company contact, hotline, and communication address
     */
    @GetMapping("/settings/business-profile")
    @Operation(summary = "Get Company Profile & Helpline", description = "Public endpoint used by Header, Footer, and Contact Desks")
    public ResponseEntity<BusinessProfile> getBusinessProfile() {
        BusinessProfile profile = repository.findById(1L).orElseGet(() -> {
            BusinessProfile fallback = new BusinessProfile();
            fallback.setId(1L);
            fallback.setCompanyName("Aadhiraksha Insurance & Financial Services Pvt Ltd");
            fallback.setPrimaryPhone("+91 8367415156");
            fallback.setWhatsappNumber("+91 8367415156");
            fallback.setSupportEmail("info@aadhirakshainsurance.com");
            fallback.setClaimsEmail("claims@aadhirakshainsurance.com");
            fallback.setWebsiteUrl("https://www.aadhirakshainsurance.com");
            fallback.setOfficeAddressLine1("4th Floor, Mytri Constructions,");
            fallback.setOfficeAddressLine2("Opp: ECIL Busstop, ECIL, Hyderabad.");
            fallback.setCity("Hyderabad");
            fallback.setState("Telangana");
            fallback.setPostalCode("500062");
            fallback.setBusinessHours("Mon - Sat, 9:30 AM to 6:30 PM");
            fallback.setIrdaiRegistrationNo("IRDAI/IMF/TS/2026/00482");
            return repository.save(fallback);
        });
        return ResponseEntity.ok(profile);
    }

    /**
     * Admin/Manager endpoint: update corporate contact details, hotline, and communication address
     */
    @PutMapping("/admin/settings/business-profile")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Update Company Profile & Helpline", description = "Updates hotline, WhatsApp, email, and communication address")
    public ResponseEntity<BusinessProfile> updateBusinessProfile(@RequestBody BusinessProfile updateReq) {
        BusinessProfile profile = repository.findById(1L).orElseGet(() -> {
            BusinessProfile p = new BusinessProfile();
            p.setId(1L);
            return p;
        });

        if (updateReq.getCompanyName() != null && !updateReq.getCompanyName().trim().isEmpty()) {
            profile.setCompanyName(updateReq.getCompanyName().trim());
        }
        if (updateReq.getTagline() != null) {
            profile.setTagline(updateReq.getTagline().trim());
        }
        if (updateReq.getPrimaryPhone() != null && !updateReq.getPrimaryPhone().trim().isEmpty()) {
            profile.setPrimaryPhone(updateReq.getPrimaryPhone().trim());
        }
        if (updateReq.getSecondaryPhone() != null) {
            profile.setSecondaryPhone(updateReq.getSecondaryPhone().trim());
        }
        if (updateReq.getWhatsappNumber() != null) {
            profile.setWhatsappNumber(updateReq.getWhatsappNumber().trim());
        }
        if (updateReq.getSupportEmail() != null && !updateReq.getSupportEmail().trim().isEmpty()) {
            profile.setSupportEmail(updateReq.getSupportEmail().trim());
        }
        if (updateReq.getClaimsEmail() != null) {
            profile.setClaimsEmail(updateReq.getClaimsEmail().trim());
        }
        if (updateReq.getWebsiteUrl() != null) {
            profile.setWebsiteUrl(updateReq.getWebsiteUrl().trim());
        }
        if (updateReq.getOfficeAddressLine1() != null && !updateReq.getOfficeAddressLine1().trim().isEmpty()) {
            profile.setOfficeAddressLine1(updateReq.getOfficeAddressLine1().trim());
        }
        if (updateReq.getOfficeAddressLine2() != null && !updateReq.getOfficeAddressLine2().trim().isEmpty()) {
            profile.setOfficeAddressLine2(updateReq.getOfficeAddressLine2().trim());
        }
        if (updateReq.getCity() != null) {
            profile.setCity(updateReq.getCity().trim());
        }
        if (updateReq.getState() != null) {
            profile.setState(updateReq.getState().trim());
        }
        if (updateReq.getPostalCode() != null) {
            profile.setPostalCode(updateReq.getPostalCode().trim());
        }
        if (updateReq.getBusinessHours() != null) {
            profile.setBusinessHours(updateReq.getBusinessHours().trim());
        }
        if (updateReq.getIrdaiRegistrationNo() != null) {
            profile.setIrdaiRegistrationNo(updateReq.getIrdaiRegistrationNo().trim());
        }
        profile.setUpdatedAt(LocalDateTime.now());

        BusinessProfile saved = repository.save(profile);
        log.info("Business profile and contact details updated by admin: primaryPhone={}, supportEmail={}", 
                saved.getPrimaryPhone(), saved.getSupportEmail());

        return ResponseEntity.ok(saved);
    }
}
