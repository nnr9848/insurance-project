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

        // WhatsApp Meta Cloud API settings
        if (updateReq.getWhatsappEnabled() != null) {
            profile.setWhatsappEnabled(updateReq.getWhatsappEnabled());
        }
        if (updateReq.getWhatsappApiUrl() != null && !updateReq.getWhatsappApiUrl().trim().isEmpty()) {
            profile.setWhatsappApiUrl(updateReq.getWhatsappApiUrl().trim());
        }
        if (updateReq.getWhatsappPhoneNumberId() != null) {
            profile.setWhatsappPhoneNumberId(updateReq.getWhatsappPhoneNumberId().trim());
        }
        if (updateReq.getWhatsappAccessToken() != null && !updateReq.getWhatsappAccessToken().trim().isEmpty()) {
            profile.setWhatsappAccessToken(updateReq.getWhatsappAccessToken().trim());
        }
        if (updateReq.getWhatsappBusinessAccountId() != null) {
            profile.setWhatsappBusinessAccountId(updateReq.getWhatsappBusinessAccountId().trim());
        }
        if (updateReq.getNotifyLeadsOnWhatsapp() != null) {
            profile.setNotifyLeadsOnWhatsapp(updateReq.getNotifyLeadsOnWhatsapp());
        }
        if (updateReq.getNotifyClaimsOnWhatsapp() != null) {
            profile.setNotifyClaimsOnWhatsapp(updateReq.getNotifyClaimsOnWhatsapp());
        }
        if (updateReq.getNotifyDocsOnWhatsapp() != null) {
            profile.setNotifyDocsOnWhatsapp(updateReq.getNotifyDocsOnWhatsapp());
        }

        profile.setUpdatedAt(LocalDateTime.now());

        BusinessProfile saved = repository.save(profile);
        log.info("Business profile and contact details updated by admin: primaryPhone={}, supportEmail={}, whatsappEnabled={}", 
                saved.getPrimaryPhone(), saved.getSupportEmail(), saved.getWhatsappEnabled());

        return ResponseEntity.ok(saved);
    }

    /**
     * Admin endpoint: Send instant live test WhatsApp message to verify Meta API credentials
     */
    @PostMapping("/admin/settings/whatsapp/test")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Send Test WhatsApp Message", description = "Dispatches a live test message to verify Meta credentials")
    public ResponseEntity<java.util.Map<String, Object>> testWhatsAppDispatch(
            @RequestBody java.util.Map<String, String> requestBody,
            @org.springframework.beans.factory.annotation.Autowired com.aadhiraksha.insurance.service.WhatsAppNotificationService whatsAppService) {
        
        String testPhone = requestBody.get("testPhone");
        if (testPhone == null || testPhone.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "success", false,
                "message", "Recipient phone number is required"
            ));
        }

        String message = String.format(
            "🔔 *Aadhiraksha WhatsApp Integration Test*\n\nYour Meta WhatsApp Cloud API credentials have been successfully connected and verified!\nTimestamp: %s\n\nPlatform: https://www.aadhirakshainsurance.com",
            LocalDateTime.now()
        );

        boolean dispatched = whatsAppService.sendTextMessage(testPhone.trim(), message);

        if (dispatched) {
            return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Test WhatsApp message dispatched successfully! Check phone: " + testPhone
            ));
        } else {
            return ResponseEntity.status(400).body(java.util.Map.of(
                "success", false,
                "message", "Failed to dispatch test message. Please verify Phone Number ID and Access Token."
            ));
        }
    }
}
