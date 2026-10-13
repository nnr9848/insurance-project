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
    private final com.aadhiraksha.insurance.service.FileStorageService fileStorageService;
    private final com.aadhiraksha.insurance.service.TwilioSmsService twilioSmsService;
    private final com.aadhiraksha.insurance.service.WhatsAppNotificationService whatsAppService;

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

        // Firebase Phone Auth Settings
        if (updateReq.getFirebaseEnabled() != null) {
            profile.setFirebaseEnabled(updateReq.getFirebaseEnabled());
        }
        if (updateReq.getFirebaseProjectId() != null && !updateReq.getFirebaseProjectId().trim().isEmpty()) {
            profile.setFirebaseProjectId(updateReq.getFirebaseProjectId().trim());
        }
        if (updateReq.getFirebaseApiKey() != null) {
            profile.setFirebaseApiKey(updateReq.getFirebaseApiKey().trim());
        }
        if (updateReq.getFirebaseAuthDomain() != null) {
            profile.setFirebaseAuthDomain(updateReq.getFirebaseAuthDomain().trim());
        }
        if (updateReq.getFirebaseAppId() != null) {
            profile.setFirebaseAppId(updateReq.getFirebaseAppId().trim());
        }
        if (updateReq.getFirebaseStorageBucket() != null) {
            profile.setFirebaseStorageBucket(updateReq.getFirebaseStorageBucket().trim());
        }
        if (updateReq.getFirebaseMessagingSenderId() != null) {
            profile.setFirebaseMessagingSenderId(updateReq.getFirebaseMessagingSenderId().trim());
        }

        // Google Maps & Review Links
        if (updateReq.getGoogleMapsUrl() != null) {
            profile.setGoogleMapsUrl(updateReq.getGoogleMapsUrl().trim());
        }
        if (updateReq.getGoogleReviewUrl() != null) {
            profile.setGoogleReviewUrl(updateReq.getGoogleReviewUrl().trim());
        }

        // Social Media Profiles
        if (updateReq.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(updateReq.getLinkedinUrl().trim());
        }
        if (updateReq.getYoutubeUrl() != null) {
            profile.setYoutubeUrl(updateReq.getYoutubeUrl().trim());
        }
        if (updateReq.getInstagramUrl() != null) {
            profile.setInstagramUrl(updateReq.getInstagramUrl().trim());
        }
        if (updateReq.getFacebookUrl() != null) {
            profile.setFacebookUrl(updateReq.getFacebookUrl().trim());
        }
        if (updateReq.getXTwitterUrl() != null) {
            profile.setXTwitterUrl(updateReq.getXTwitterUrl().trim());
        }

        // Corporate Impact Milestones
        if (updateReq.getClaimsSettledAmount() != null) {
            profile.setClaimsSettledAmount(updateReq.getClaimsSettledAmount().trim());
        }
        if (updateReq.getFamiliesProtectedCount() != null) {
            profile.setFamiliesProtectedCount(updateReq.getFamiliesProtectedCount().trim());
        }
        if (updateReq.getCertifiedAdvisorsCount() != null) {
            profile.setCertifiedAdvisorsCount(updateReq.getCertifiedAdvisorsCount().trim());
        }
        if (updateReq.getSettlementRatio() != null) {
            profile.setSettlementRatio(updateReq.getSettlementRatio().trim());
        }

        // About Us Content & Story
        if (updateReq.getAboutHeroTitle() != null) {
            profile.setAboutHeroTitle(updateReq.getAboutHeroTitle().trim());
        }
        if (updateReq.getAboutHeroDescription() != null) {
            profile.setAboutHeroDescription(updateReq.getAboutHeroDescription().trim());
        }
        if (updateReq.getAboutMissionStatement() != null) {
            profile.setAboutMissionStatement(updateReq.getAboutMissionStatement().trim());
        }
        if (updateReq.getAboutVisionStatement() != null) {
            profile.setAboutVisionStatement(updateReq.getAboutVisionStatement().trim());
        }
        if (updateReq.getAboutGalleryPhotosJson() != null) {
            profile.setAboutGalleryPhotosJson(updateReq.getAboutGalleryPhotosJson());
        }

        // Dynamic Company Pages Content
        if (updateReq.getPospPageHeadline() != null) {
            profile.setPospPageHeadline(updateReq.getPospPageHeadline().trim());
        }
        if (updateReq.getPospPageSubheadline() != null) {
            profile.setPospPageSubheadline(updateReq.getPospPageSubheadline().trim());
        }
        if (updateReq.getClaimsPageHeadline() != null) {
            profile.setClaimsPageHeadline(updateReq.getClaimsPageHeadline().trim());
        }
        if (updateReq.getClaimsPageSubheadline() != null) {
            profile.setClaimsPageSubheadline(updateReq.getClaimsPageSubheadline().trim());
        }
        if (updateReq.getLegalGrievanceOfficerName() != null) {
            profile.setLegalGrievanceOfficerName(updateReq.getLegalGrievanceOfficerName().trim());
        }
        if (updateReq.getLegalGrievanceEmail() != null) {
            profile.setLegalGrievanceEmail(updateReq.getLegalGrievanceEmail().trim());
        }
        if (updateReq.getLegalGrievancePhone() != null) {
            profile.setLegalGrievancePhone(updateReq.getLegalGrievancePhone().trim());
        }

        // Twilio SMS Integration
        if (updateReq.getTwilioSmsEnabled() != null) {
            profile.setTwilioSmsEnabled(updateReq.getTwilioSmsEnabled());
        }
        if (updateReq.getTwilioAccountSid() != null) {
            profile.setTwilioAccountSid(updateReq.getTwilioAccountSid().trim());
        }
        if (updateReq.getTwilioAuthToken() != null) {
            profile.setTwilioAuthToken(updateReq.getTwilioAuthToken().trim());
        }
        if (updateReq.getTwilioFromNumber() != null) {
            profile.setTwilioFromNumber(updateReq.getTwilioFromNumber().trim());
        }

        profile.setUpdatedAt(LocalDateTime.now());

        BusinessProfile saved = repository.save(profile);
        log.info("Business profile and integrations updated by admin: primaryPhone={}, whatsappEnabled={}, twilioSmsEnabled={}, firebaseEnabled={}", 
                saved.getPrimaryPhone(), saved.getWhatsappEnabled(), saved.getTwilioSmsEnabled(), saved.getFirebaseEnabled());

        return ResponseEntity.ok(saved);
    }

    /**
     * Admin endpoint: Send instant test SMS via Twilio to verify credentials
     */
    @PostMapping("/admin/settings/twilio/test")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Send Test Twilio SMS", description = "Dispatches a test SMS to verify Twilio Account SID, Auth Token and From Number")
    public ResponseEntity<java.util.Map<String, Object>> testTwilioSmsDispatch(
            @RequestBody java.util.Map<String, String> requestBody) {
        
        String testPhone = requestBody.get("testPhone");
        if (testPhone == null || testPhone.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "success", false,
                "message", "Recipient phone number is required"
            ));
        }

        // Standard verification format matching Twilio trial template whitelist
        String message = "Your Aadhiraksha verification code is: 123456. Valid for 5 minutes.";

        boolean dispatched = twilioSmsService.sendSms(testPhone.trim(), message);

        if (dispatched) {
            return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Test SMS dispatched successfully via Twilio! Delivered to: " + testPhone
            ));
        } else {
            return ResponseEntity.status(400).body(java.util.Map.of(
                "success", false,
                "message", "Failed to dispatch Twilio SMS. Please verify Account SID, Auth Token, and From Number."
            ));
        }
    }

    /**
     * Admin endpoint: Send instant live test WhatsApp message to verify Meta API credentials
     */
    @PostMapping("/admin/settings/whatsapp/test")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Send Test WhatsApp Message", description = "Dispatches a live test message to verify Meta credentials")
    public ResponseEntity<java.util.Map<String, Object>> testWhatsAppDispatch(
            @RequestBody java.util.Map<String, String> requestBody) {
        
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

    /**
     * Admin endpoint: Upload physical gallery photo image directly from local filesystem
     */
    @PostMapping(value = "/admin/settings/gallery/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Upload Physical Image for Corporate Gallery", description = "Stores photo on server and returns direct view URL")
    public ResponseEntity<java.util.Map<String, Object>> uploadGalleryImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "success", false,
                "message", "File cannot be empty"
            ));
        }

        String storedFileName = fileStorageService.storeFile(file, file.getOriginalFilename());
        String fileUrl = "/api/crm/documents/view-file/" + storedFileName;

        log.info("Uploaded gallery photo successfully: filename={}, url={}", storedFileName, fileUrl);

        return ResponseEntity.ok(java.util.Map.of(
            "success", true,
            "fileName", storedFileName,
            "url", fileUrl
        ));
    }
}

