package com.aadhiraksha.insurance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "business_profile")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessProfile {

    @Id
    @Builder.Default
    private Long id = 1L;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "tagline")
    private String tagline;

    @Column(name = "primary_phone", nullable = false, length = 50)
    private String primaryPhone;

    @Column(name = "secondary_phone", length = 50)
    private String secondaryPhone;

    @Column(name = "whatsapp_number", length = 50)
    private String whatsappNumber;

    @Column(name = "support_email", nullable = false, length = 150)
    private String supportEmail;

    @Column(name = "claims_email", length = 150)
    private String claimsEmail;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "office_address_line1", nullable = false)
    private String officeAddressLine1;

    @Column(name = "office_address_line2", nullable = false)
    private String officeAddressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "business_hours", length = 150)
    private String businessHours;

    @Column(name = "irdai_registration_no", length = 100)
    private String irdaiRegistrationNo;

    // Meta WhatsApp Cloud API Integration Settings
    @Builder.Default
    @Column(name = "whatsapp_enabled")
    private Boolean whatsappEnabled = false;

    @Builder.Default
    @Column(name = "whatsapp_api_url")
    private String whatsappApiUrl = "https://graph.facebook.com/v19.0";

    @Column(name = "whatsapp_phone_number_id", length = 100)
    private String whatsappPhoneNumberId;

    @Column(name = "whatsapp_access_token", columnDefinition = "TEXT")
    private String whatsappAccessToken;

    @Column(name = "whatsapp_business_account_id", length = 100)
    private String whatsappBusinessAccountId;

    @Builder.Default
    @Column(name = "notify_leads_on_whatsapp")
    private Boolean notifyLeadsOnWhatsapp = true;

    @Builder.Default
    @Column(name = "notify_claims_on_whatsapp")
    private Boolean notifyClaimsOnWhatsapp = true;

    @Builder.Default
    @Column(name = "notify_docs_on_whatsapp")
    private Boolean notifyDocsOnWhatsapp = true;

    // Google Firebase Phone Auth Settings
    @Builder.Default
    @Column(name = "firebase_enabled")
    private Boolean firebaseEnabled = true;

    @Builder.Default
    @Column(name = "firebase_project_id", length = 100)
    private String firebaseProjectId = "aadhiraksha-insurance";

    @Column(name = "firebase_api_key", length = 150)
    private String firebaseApiKey;

    @Column(name = "firebase_auth_domain", length = 150)
    private String firebaseAuthDomain;

    @Column(name = "firebase_app_id", length = 150)
    private String firebaseAppId;

    // Twilio SMS OTP Gateway Integration Settings
    @Builder.Default
    @Column(name = "twilio_sms_enabled")
    private Boolean twilioSmsEnabled = false;

    @Column(name = "twilio_account_sid", length = 100)
    private String twilioAccountSid;

    @Column(name = "twilio_auth_token", columnDefinition = "TEXT")
    private String twilioAuthToken;

    @Column(name = "twilio_from_number", length = 50)
    private String twilioFromNumber;

    // Twilio WhatsApp Messaging & Promotional Broadcast Settings
    @Builder.Default
    @Column(name = "twilio_whatsapp_enabled")
    private Boolean twilioWhatsappEnabled = false;

    @Builder.Default
    @Column(name = "twilio_whatsapp_from_number", length = 60)
    private String twilioWhatsappFromNumber = "whatsapp:+14155238886";

    @Column(name = "firebase_storage_bucket", length = 150)
    private String firebaseStorageBucket;

    @Column(name = "firebase_messaging_sender_id", length = 50)
    private String firebaseMessagingSenderId;

    // Google Maps & Reviews Links
    @Builder.Default
    @Column(name = "google_maps_url", columnDefinition = "TEXT")
    private String googleMapsUrl = "https://maps.google.com/?q=Mytri+Constructions+ECIL+Hyderabad";

    @Builder.Default
    @Column(name = "google_review_url", columnDefinition = "TEXT")
    private String googleReviewUrl = "https://maps.google.com/?q=Aadhiraksha+Insurance+Marketing+ECIL+Hyderabad";

    // Social Media Links
    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "youtube_url")
    private String youtubeUrl;

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "facebook_url")
    private String facebookUrl;

    @Column(name = "x_twitter_url")
    private String xTwitterUrl;

    // Corporate Impact Milestones
    @Builder.Default
    @Column(name = "claims_settled_amount", length = 100)
    private String claimsSettledAmount = "₹50+ Cr";

    @Builder.Default
    @Column(name = "families_protected_count", length = 100)
    private String familiesProtectedCount = "25,000+";

    @Builder.Default
    @Column(name = "certified_advisors_count", length = 100)
    private String certifiedAdvisorsCount = "1,200+";

    @Builder.Default
    @Column(name = "settlement_ratio", length = 50)
    private String settlementRatio = "98.8%";

    // About Us Content & Story
    @Builder.Default
    @Column(name = "about_hero_title", columnDefinition = "TEXT")
    private String aboutHeroTitle = "India’s Most Dependable Bridge Between Families, Protection & Financial Freedom";

    @Builder.Default
    @Column(name = "about_hero_description", columnDefinition = "TEXT")
    private String aboutHeroDescription = "At Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd, we believe every Indian family deserves unbiased, transparent, and prompt insurance advisory with zero hidden catches. Rooted in Hyderabad with a pan-regional network of over 1,200 certified advisors, we don't just sell policies — we stand beside you during claim settlements.";

    @Builder.Default
    @Column(name = "about_mission_statement", columnDefinition = "TEXT")
    private String aboutMissionStatement = "To democratize transparent insurance advisory across India, ensuring zero out-of-pocket surprise rejections and 100% cashless hospitalization concierge.";

    @Builder.Default
    @Column(name = "about_vision_statement", columnDefinition = "TEXT")
    private String aboutVisionStatement = "To become the nation's most trusted insurance marketing firm, empowering families and businesses through ethical advisory and swift claim resolution.";

    @Builder.Default
    @Column(name = "about_gallery_photos_json", columnDefinition = "TEXT")
    private String aboutGalleryPhotosJson = "[]";

    // Dynamic Company Pages Content
    @Builder.Default
    @Column(name = "posp_page_headline", columnDefinition = "TEXT")
    private String pospPageHeadline = "Empower Your Career as a Certified POSP Insurance Advisor";

    @Builder.Default
    @Column(name = "posp_page_subheadline", columnDefinition = "TEXT")
    private String pospPageSubheadline = "Join Telangana & AP's fastest-growing insurtech partner network with zero initial capital, 100% digital onboarding, and direct multi-insurer quotes.";

    @Builder.Default
    @Column(name = "claims_page_headline", columnDefinition = "TEXT")
    private String claimsPageHeadline = "24/7 Cashless Claims Assistance & Emergency Concierge";

    @Builder.Default
    @Column(name = "claims_page_subheadline", columnDefinition = "TEXT")
    private String claimsPageSubheadline = "File your cashless hospitalization or motor damage intimation in under 60 seconds with dedicated claim managers.";

    @Builder.Default
    @Column(name = "legal_grievance_officer_name")
    private String legalGrievanceOfficerName = "Customer Care Head";

    @Builder.Default
    @Column(name = "legal_grievance_email")
    private String legalGrievanceEmail = "grievance@aadhirakshainsurance.com";

    @Builder.Default
    @Column(name = "legal_grievance_phone")
    private String legalGrievancePhone = "+91 8367415156";

    // Dynamic Comparison / Why Choose Us Section
    @Builder.Default
    @Column(name = "why_us_badge", length = 100)
    private String whyUsBadge = "Why We Are Better";

    @Builder.Default
    @Column(name = "why_us_title")
    private String whyUsTitle = "Traditional Agents vs. Aadhiraksha InsurTech";

    @Builder.Default
    @Column(name = "why_us_subtitle", columnDefinition = "TEXT")
    private String whyUsSubtitle = "Experience complete transparency, real-time comparisons, and zero bias.";

    @Builder.Default
    @Column(name = "why_us_traditional_badge", length = 100)
    private String whyUsTraditionalBadge = "TRADITIONAL AGENT";

    @Builder.Default
    @Column(name = "why_us_traditional_title")
    private String whyUsTraditionalTitle = "Single-Brand Bias & Manual Delays";

    @Builder.Default
    @Column(name = "why_us_traditional_points_json", columnDefinition = "TEXT")
    private String whyUsTraditionalPointsJson = "[\"Only sells 1 company plans with high commissions\",\"Heavy paper forms and 3-5 days policy delivery\",\"Hard to compare hidden room rent and copay sub-limits\",\"No claim assistance when admitted late at night\",\"Forfeits your NCB bonus if you switch companies\"]";

    @Builder.Default
    @Column(name = "why_us_aadhiraksha_badge", length = 100)
    private String whyUsAadhirakshaBadge = "AADHIRAKSHA INSURTECH";

    @Builder.Default
    @Column(name = "why_us_aadhiraksha_title")
    private String whyUsAadhirakshaTitle = "Unbiased Choice & Fast-Track Claims";

    @Builder.Default
    @Column(name = "why_us_aadhiraksha_ribbon", length = 100)
    private String whyUsAadhirakshaRibbon = "RECOMMENDED";

    @Builder.Default
    @Column(name = "why_us_aadhiraksha_points_json", columnDefinition = "TEXT")
    private String whyUsAadhirakshaPointsJson = "[\"Instant side-by-side comparison of 30+ top IRDAI insurers\",\"100% digital KYC with policy on WhatsApp in 2 minutes\",\"Zero room rent sub-limits & 100% restoration guarantee\",\"Dedicated on-ground Claims Desk for 30-min cashless pre-auth\",\"Seamless policy porting with accumulated waiting credits preserved\"]";

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Explicit getters and setters for guaranteed compatibility
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getPrimaryPhone() { return primaryPhone; }
    public void setPrimaryPhone(String primaryPhone) { this.primaryPhone = primaryPhone; }

    public String getSecondaryPhone() { return secondaryPhone; }
    public void setSecondaryPhone(String secondaryPhone) { this.secondaryPhone = secondaryPhone; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getSupportEmail() { return supportEmail; }
    public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }

    public String getClaimsEmail() { return claimsEmail; }
    public void setClaimsEmail(String claimsEmail) { this.claimsEmail = claimsEmail; }

    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    public String getOfficeAddressLine1() { return officeAddressLine1; }
    public void setOfficeAddressLine1(String officeAddressLine1) { this.officeAddressLine1 = officeAddressLine1; }

    public String getOfficeAddressLine2() { return officeAddressLine2; }
    public void setOfficeAddressLine2(String officeAddressLine2) { this.officeAddressLine2 = officeAddressLine2; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getBusinessHours() { return businessHours; }
    public void setBusinessHours(String businessHours) { this.businessHours = businessHours; }

    public String getIrdaiRegistrationNo() { return irdaiRegistrationNo; }
    public void setIrdaiRegistrationNo(String irdaiRegistrationNo) { this.irdaiRegistrationNo = irdaiRegistrationNo; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
