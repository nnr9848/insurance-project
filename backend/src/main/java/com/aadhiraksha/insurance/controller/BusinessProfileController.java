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
    private final com.aadhiraksha.insurance.service.TwilioWhatsAppService twilioWhatsAppService;
    private final com.aadhiraksha.insurance.repository.BroadcastCampaignLogRepository broadcastCampaignLogRepository;

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
        if (updateReq.getLegalGrievanceAddress() != null) {
            profile.setLegalGrievanceAddress(updateReq.getLegalGrievanceAddress().trim());
        }
        if (updateReq.getLegalGrievanceTiming() != null) {
            profile.setLegalGrievanceTiming(updateReq.getLegalGrievanceTiming().trim());
        }
        if (updateReq.getLegalGrievanceLevel1Intro() != null) {
            profile.setLegalGrievanceLevel1Intro(updateReq.getLegalGrievanceLevel1Intro().trim());
        }
        if (updateReq.getLegalGrievanceLevel2Text() != null) {
            profile.setLegalGrievanceLevel2Text(updateReq.getLegalGrievanceLevel2Text().trim());
        }
        if (updateReq.getLegalGrievanceLevel3Text() != null) {
            profile.setLegalGrievanceLevel3Text(updateReq.getLegalGrievanceLevel3Text().trim());
        }
        if (updateReq.getLegalGrievanceOmbudsmanHelpline() != null) {
            profile.setLegalGrievanceOmbudsmanHelpline(updateReq.getLegalGrievanceOmbudsmanHelpline().trim());
        }
        if (updateReq.getLegalGrievanceOmbudsmanPortal() != null) {
            profile.setLegalGrievanceOmbudsmanPortal(updateReq.getLegalGrievanceOmbudsmanPortal().trim());
        }

        // Legal & Compliance CMS fields
        if (updateReq.getLegalPageBadge() != null) {
            profile.setLegalPageBadge(updateReq.getLegalPageBadge().trim());
        }
        if (updateReq.getLegalPageHeroTitle() != null) {
            profile.setLegalPageHeroTitle(updateReq.getLegalPageHeroTitle().trim());
        }
        if (updateReq.getLegalPageHeroSubtitle() != null) {
            profile.setLegalPageHeroSubtitle(updateReq.getLegalPageHeroSubtitle().trim());
        }
        if (updateReq.getLegalPrivacyLastUpdated() != null) {
            profile.setLegalPrivacyLastUpdated(updateReq.getLegalPrivacyLastUpdated().trim());
        }
        if (updateReq.getLegalPrivacySec1Heading() != null) {
            profile.setLegalPrivacySec1Heading(updateReq.getLegalPrivacySec1Heading().trim());
        }
        if (updateReq.getLegalPrivacySec1Body() != null) {
            profile.setLegalPrivacySec1Body(updateReq.getLegalPrivacySec1Body().trim());
        }
        if (updateReq.getLegalPrivacySec2Heading() != null) {
            profile.setLegalPrivacySec2Heading(updateReq.getLegalPrivacySec2Heading().trim());
        }
        if (updateReq.getLegalPrivacySec2Body() != null) {
            profile.setLegalPrivacySec2Body(updateReq.getLegalPrivacySec2Body().trim());
        }
        if (updateReq.getLegalPrivacySec3Heading() != null) {
            profile.setLegalPrivacySec3Heading(updateReq.getLegalPrivacySec3Heading().trim());
        }
        if (updateReq.getLegalPrivacySec3Body() != null) {
            profile.setLegalPrivacySec3Body(updateReq.getLegalPrivacySec3Body().trim());
        }
        if (updateReq.getLegalPrivacySec4Heading() != null) {
            profile.setLegalPrivacySec4Heading(updateReq.getLegalPrivacySec4Heading().trim());
        }
        if (updateReq.getLegalPrivacySec4Body() != null) {
            profile.setLegalPrivacySec4Body(updateReq.getLegalPrivacySec4Body().trim());
        }
        if (updateReq.getLegalTermsLastUpdated() != null) {
            profile.setLegalTermsLastUpdated(updateReq.getLegalTermsLastUpdated().trim());
        }
        if (updateReq.getLegalTermsSec1Heading() != null) {
            profile.setLegalTermsSec1Heading(updateReq.getLegalTermsSec1Heading().trim());
        }
        if (updateReq.getLegalTermsSec1Body() != null) {
            profile.setLegalTermsSec1Body(updateReq.getLegalTermsSec1Body().trim());
        }
        if (updateReq.getLegalTermsSec2Heading() != null) {
            profile.setLegalTermsSec2Heading(updateReq.getLegalTermsSec2Heading().trim());
        }
        if (updateReq.getLegalTermsSec2Body() != null) {
            profile.setLegalTermsSec2Body(updateReq.getLegalTermsSec2Body().trim());
        }
        if (updateReq.getLegalTermsSec3Heading() != null) {
            profile.setLegalTermsSec3Heading(updateReq.getLegalTermsSec3Heading().trim());
        }
        if (updateReq.getLegalTermsSec3Body() != null) {
            profile.setLegalTermsSec3Body(updateReq.getLegalTermsSec3Body().trim());
        }
        if (updateReq.getLegalDisclaimerSubtitle() != null) {
            profile.setLegalDisclaimerSubtitle(updateReq.getLegalDisclaimerSubtitle().trim());
        }
        if (updateReq.getLegalDisclaimerSec41Title() != null) {
            profile.setLegalDisclaimerSec41Title(updateReq.getLegalDisclaimerSec41Title().trim());
        }
        if (updateReq.getLegalDisclaimerSec41Body() != null) {
            profile.setLegalDisclaimerSec41Body(updateReq.getLegalDisclaimerSec41Body().trim());
        }
        if (updateReq.getLegalDisclaimerSolicitationText() != null) {
            profile.setLegalDisclaimerSolicitationText(updateReq.getLegalDisclaimerSolicitationText().trim());
        }
        if (updateReq.getLegalDisclaimerTaxText() != null) {
            profile.setLegalDisclaimerTaxText(updateReq.getLegalDisclaimerTaxText().trim());
        }
        if (updateReq.getLegalPrivacyDocumentHtml() != null) {
            profile.setLegalPrivacyDocumentHtml(updateReq.getLegalPrivacyDocumentHtml());
        }
        if (updateReq.getLegalTermsDocumentHtml() != null) {
            profile.setLegalTermsDocumentHtml(updateReq.getLegalTermsDocumentHtml());
        }
        if (updateReq.getLegalDisclaimerDocumentHtml() != null) {
            profile.setLegalDisclaimerDocumentHtml(updateReq.getLegalDisclaimerDocumentHtml());
        }
        if (updateReq.getLegalGrievanceDocumentHtml() != null) {
            profile.setLegalGrievanceDocumentHtml(updateReq.getLegalGrievanceDocumentHtml());
        }

        // Twilio SMS Integration
        if (updateReq.getTwilioSmsEnabled() != null) {
            profile.setTwilioSmsEnabled(updateReq.getTwilioSmsEnabled());
        }
        if (updateReq.getTwilioAccountSid() != null) {
            profile.setTwilioAccountSid(updateReq.getTwilioAccountSid().trim());
        }
        if (updateReq.getTwilioApiKeySid() != null) {
            profile.setTwilioApiKeySid(updateReq.getTwilioApiKeySid().trim());
        }
        if (updateReq.getTwilioApiKeySecret() != null) {
            profile.setTwilioApiKeySecret(updateReq.getTwilioApiKeySecret().trim());
        }
        if (updateReq.getTwilioFromNumber() != null) {
            profile.setTwilioFromNumber(updateReq.getTwilioFromNumber().trim());
        }

        // Twilio WhatsApp Integration
        if (updateReq.getTwilioWhatsappEnabled() != null) {
            profile.setTwilioWhatsappEnabled(updateReq.getTwilioWhatsappEnabled());
        }
        if (updateReq.getTwilioWhatsappFromNumber() != null) {
            profile.setTwilioWhatsappFromNumber(updateReq.getTwilioWhatsappFromNumber().trim());
        }
        if (updateReq.getTwilioWhatsappContentSid() != null) {
            profile.setTwilioWhatsappContentSid(updateReq.getTwilioWhatsappContentSid().trim());
        }

        // Dynamic Why Choose Us Comparison Section
        if (updateReq.getWhyUsBadge() != null) {
            profile.setWhyUsBadge(updateReq.getWhyUsBadge().trim());
        }
        if (updateReq.getWhyUsTitle() != null) {
            profile.setWhyUsTitle(updateReq.getWhyUsTitle().trim());
        }
        if (updateReq.getWhyUsSubtitle() != null) {
            profile.setWhyUsSubtitle(updateReq.getWhyUsSubtitle().trim());
        }
        if (updateReq.getWhyUsTraditionalBadge() != null) {
            profile.setWhyUsTraditionalBadge(updateReq.getWhyUsTraditionalBadge().trim());
        }
        if (updateReq.getWhyUsTraditionalTitle() != null) {
            profile.setWhyUsTraditionalTitle(updateReq.getWhyUsTraditionalTitle().trim());
        }
        if (updateReq.getWhyUsTraditionalPointsJson() != null) {
            profile.setWhyUsTraditionalPointsJson(updateReq.getWhyUsTraditionalPointsJson());
        }
        if (updateReq.getWhyUsAadhirakshaBadge() != null) {
            profile.setWhyUsAadhirakshaBadge(updateReq.getWhyUsAadhirakshaBadge().trim());
        }
        if (updateReq.getWhyUsAadhirakshaTitle() != null) {
            profile.setWhyUsAadhirakshaTitle(updateReq.getWhyUsAadhirakshaTitle().trim());
        }
        if (updateReq.getWhyUsAadhirakshaRibbon() != null) {
            profile.setWhyUsAadhirakshaRibbon(updateReq.getWhyUsAadhirakshaRibbon().trim());
        }
        if (updateReq.getWhyUsAadhirakshaPointsJson() != null) {
            profile.setWhyUsAadhirakshaPointsJson(updateReq.getWhyUsAadhirakshaPointsJson());
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
                "message", "Failed to dispatch Twilio SMS. Please verify Account SID, API Key SID, API Key Secret, and From Number."
            ));
        }
    }

    /**
     * Admin endpoint: Send instant live test WhatsApp message via Twilio WhatsApp API
     */
    @PostMapping("/admin/settings/twilio-whatsapp/test")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Send Test Twilio WhatsApp Message", description = "Dispatches a live test WhatsApp message using Twilio WhatsApp API")
    public ResponseEntity<java.util.Map<String, Object>> testTwilioWhatsAppDispatch(
            @RequestBody java.util.Map<String, String> requestBody) {
        
        String testPhone = requestBody.get("testPhone");
        if (testPhone == null || testPhone.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "success", false,
                "message", "Recipient phone number is required"
            ));
        }

        String message = String.format(
            "🔔 *Aadhiraksha WhatsApp System Test*\n\nYour Twilio WhatsApp communications gateway has been successfully connected and verified!\nTimestamp: %s\n\n_Aadhiraksha Insurance Leadership Team_\nhttps://www.aadhirakshainsurance.com",
            LocalDateTime.now()
        );

        boolean dispatched = twilioWhatsAppService.sendWhatsAppMessage(testPhone.trim(), message);

        if (dispatched) {
            return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Test WhatsApp message dispatched successfully via Twilio! Delivered to: " + testPhone
            ));
        } else {
            return ResponseEntity.status(400).body(java.util.Map.of(
                "success", false,
                "message", "Failed to dispatch Twilio WhatsApp message. Ensure your recipient has joined the Twilio WhatsApp sandbox or verify Twilio credentials."
            ));
        }
    }

    /**
     * Admin endpoint: Broadcast promotional announcement / new offer to POSP agents or client groups via Twilio WhatsApp
     */
    @PostMapping("/admin/broadcasts/whatsapp")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Broadcast Twilio WhatsApp Offer", description = "Broadcasts a promotional announcement or offer launch to phone numbers via Twilio WhatsApp")
    public ResponseEntity<java.util.Map<String, Object>> broadcastTwilioWhatsAppOffer(
            @RequestBody java.util.Map<String, Object> requestBody,
            org.springframework.security.core.Authentication authentication) {
        
        String title = (String) requestBody.get("title");
        String message = (String) requestBody.get("message");
        @SuppressWarnings("unchecked")
        java.util.List<String> recipients = (java.util.List<String>) requestBody.get("recipients");

        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "success", false,
                "message", "Campaign title is required."
            ));
        }
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "success", false,
                "message", "Campaign announcement message is required."
            ));
        }
        if (recipients == null || recipients.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "success", false,
                "message", "At least one recipient phone number is required."
            ));
        }

        String dispatcher = authentication != null ? authentication.getName() : "Administrator";

        // 1. Dispatch through Twilio WhatsApp service
        twilioWhatsAppService.broadcastWhatsAppOffers(recipients, title.trim(), message.trim());

        // 2. Persist audit log entry for enterprise traceability
        com.aadhiraksha.insurance.model.BroadcastCampaignLog auditLog = com.aadhiraksha.insurance.model.BroadcastCampaignLog.builder()
                .title(title.trim())
                .message(message.trim())
                .channel("TWILIO_WHATSAPP")
                .recipientsCount(recipients.size())
                .sentBy(dispatcher)
                .status("COMPLETED")
                .build();
        broadcastCampaignLogRepository.save(auditLog);

        return ResponseEntity.ok(java.util.Map.of(
            "success", true,
            "message", String.format("Promotional broadcast '%s' initiated for %d recipient(s) via Twilio WhatsApp.", title, recipients.size()),
            "count", recipients.size()
        ));
    }

    /**
     * Admin/Manager endpoint: Retrieve chronological broadcast audit history
     */
    @GetMapping("/admin/broadcasts/history")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Get Broadcast Campaign History", description = "Chronological audit logs of outbound WhatsApp promotional broadcasts")
    public ResponseEntity<java.util.List<com.aadhiraksha.insurance.model.BroadcastCampaignLog>> getBroadcastHistory() {
        return ResponseEntity.ok(broadcastCampaignLogRepository.findAllByOrderByCreatedAtDesc());
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

