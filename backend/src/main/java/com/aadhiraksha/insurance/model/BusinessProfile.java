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

    @Column(name = "twilio_api_key_sid", length = 100)
    private String twilioApiKeySid;

    @Column(name = "twilio_api_key_secret", columnDefinition = "TEXT")
    private String twilioApiKeySecret;

    @Column(name = "twilio_from_number", length = 50)
    private String twilioFromNumber;

    // Twilio WhatsApp Messaging & Promotional Broadcast Settings
    @Builder.Default
    @Column(name = "twilio_whatsapp_enabled")
    private Boolean twilioWhatsappEnabled = false;

    @Builder.Default
    @Column(name = "twilio_whatsapp_from_number", length = 60)
    private String twilioWhatsappFromNumber = "whatsapp:+14155238886";

    @Column(name = "twilio_whatsapp_content_sid", length = 100)
    private String twilioWhatsappContentSid;

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

    @Builder.Default
    @Column(name = "legal_grievance_address", columnDefinition = "TEXT")
    private String legalGrievanceAddress = "4th Floor, Mytri Constructions, Opp: ECIL Busstop, ECIL, Hyderabad.";

    @Builder.Default
    @Column(name = "legal_grievance_timing", length = 100)
    private String legalGrievanceTiming = "Mon - Sat, 9:30 AM to 6:30 PM";

    @Builder.Default
    @Column(name = "legal_grievance_level1_intro", columnDefinition = "TEXT")
    private String legalGrievanceLevel1Intro = "For any service deficiency, delay in policy delivery, or assistance in claim disputes, customers may reach out to our Principal Grievance Officer:";

    @Builder.Default
    @Column(name = "legal_grievance_level2_text", columnDefinition = "TEXT")
    private String legalGrievanceLevel2Text = "If the response from our desk is unsatisfactory within 14 working days, you can lodge a formal complaint directly with the Grievance Redressal Officer (GRO) of the respective underwriting insurance company.";

    @Builder.Default
    @Column(name = "legal_grievance_level3_text", columnDefinition = "TEXT")
    private String legalGrievanceLevel3Text = "You may also register complaints with the IRDAI's Integrated Grievance Management System (Bima Bharosa):";

    @Builder.Default
    @Column(name = "legal_grievance_ombudsman_helpline", length = 100)
    private String legalGrievanceOmbudsmanHelpline = "155255 / 1800 4254 732";

    @Builder.Default
    @Column(name = "legal_grievance_ombudsman_portal")
    private String legalGrievanceOmbudsmanPortal = "https://bimabharosa.irdai.gov.in";

    // Page Hero Header
    @Builder.Default
    @Column(name = "legal_page_badge", length = 100)
    private String legalPageBadge = "Legal & Regulatory Governance";

    @Builder.Default
    @Column(name = "legal_page_hero_title", columnDefinition = "TEXT")
    private String legalPageHeroTitle = "Trust, Transparency & Compliance";

    @Builder.Default
    @Column(name = "legal_page_hero_subtitle", columnDefinition = "TEXT")
    private String legalPageHeroSubtitle = "Aadhiraksha Insurance & Financial Services Pvt Ltd adheres strictly to the regulations and consumer protection guidelines established by the Insurance Regulatory and Development Authority of India (IRDAI).";

    // Tab 1: Privacy Policy
    @Builder.Default
    @Column(name = "legal_privacy_last_updated", length = 100)
    private String legalPrivacyLastUpdated = "January 2026 | Effective immediately";

    @Builder.Default
    @Column(name = "legal_privacy_sec1_heading")
    private String legalPrivacySec1Heading = "1. Commitment to Privacy";

    @Builder.Default
    @Column(name = "legal_privacy_sec1_body", columnDefinition = "TEXT")
    private String legalPrivacySec1Body = "At Aadhiraksha Insurance & Financial Services Pvt Ltd (\"Aadhiraksha\", \"we\", \"us\", or \"our\"), we respect your privacy and are committed to protecting the personal data and financial information you share with us through our website, mobile interface, POSP portal, and client assistance desks.";

    @Builder.Default
    @Column(name = "legal_privacy_sec2_heading")
    private String legalPrivacySec2Heading = "2. Information We Collect";

    @Builder.Default
    @Column(name = "legal_privacy_sec2_body", columnDefinition = "TEXT")
    private String legalPrivacySec2Body = "To provide accurate insurance quotes, process policy issuance, execute renewals, and manage claim intimations, we collect personal identity details, vehicle specs, and lifestyle metrics.";

    @Builder.Default
    @Column(name = "legal_privacy_sec3_heading")
    private String legalPrivacySec3Heading = "3. How Your Information is Used";

    @Builder.Default
    @Column(name = "legal_privacy_sec3_body", columnDefinition = "TEXT")
    private String legalPrivacySec3Body = "Your data is strictly utilized to generate real-time comparison quotes from our empanelled IRDAI-licensed insurance partners, verify eligibility, transmit necessary underwriting information for policy binding, facilitate cashless hospitalizations/garage approvals, and deliver automated policy renewal reminders.";

    @Builder.Default
    @Column(name = "legal_privacy_sec4_heading")
    private String legalPrivacySec4Heading = "4. Zero-Spam & Data Security Guarantee";

    @Builder.Default
    @Column(name = "legal_privacy_sec4_body", columnDefinition = "TEXT")
    private String legalPrivacySec4Body = "We do not sell, rent, or trade your personal information to third-party marketing brokers. All database transmissions are encrypted using enterprise-grade SSL/TLS protocols with role-based cryptographic access controls.";

    // Tab 2: Terms of Service
    @Builder.Default
    @Column(name = "legal_terms_last_updated", length = 100)
    private String legalTermsLastUpdated = "Agreement for Platform Usage & Quote Inquiries";

    @Builder.Default
    @Column(name = "legal_terms_sec1_heading")
    private String legalTermsSec1Heading = "1. Acceptance of Terms";

    @Builder.Default
    @Column(name = "legal_terms_sec1_body", columnDefinition = "TEXT")
    private String legalTermsSec1Body = "By accessing, browsing, or submitting quotation/claim forms on the Aadhiraksha portal, you agree to be bound by these Terms of Service, applicable laws, and regulatory guidelines set forth by the IRDAI.";

    @Builder.Default
    @Column(name = "legal_terms_sec2_heading")
    private String legalTermsSec2Heading = "2. Role of Aadhiraksha Insurance";

    @Builder.Default
    @Column(name = "legal_terms_sec2_body", columnDefinition = "TEXT")
    private String legalTermsSec2Body = "Aadhiraksha functions as a licensed insurance intermediary facilitating price comparison, pre-sales advisory, and post-sales claims assistance. The contract of insurance is strictly between the insured customer and the respective insurance underwriter (e.g., Star Health, HDFC ERGO, ICICI Lombard, TATA AIG, LIC, etc.).";

    @Builder.Default
    @Column(name = "legal_terms_sec3_heading")
    private String legalTermsSec3Heading = "3. Accuracy of Declarations (Utmost Good Faith)";

    @Builder.Default
    @Column(name = "legal_terms_sec3_body", columnDefinition = "TEXT")
    private String legalTermsSec3Body = "Insurance contracts in India operate under the doctrine of Uberrima Fides (Utmost Good Faith). It is the sole responsibility of the policyholder to provide true, complete, and accurate declarations regarding pre-existing medical conditions, vehicle modifications, prior claims, and age. Any misrepresentation or suppression of material facts may result in rejection of claims by the insurer under Section 45 of the Insurance Act, 1938.";

    // Tab 3: IRDAI Statutory Disclaimers
    @Builder.Default
    @Column(name = "legal_disclaimer_subtitle")
    private String legalDisclaimerSubtitle = "Mandated Public Disclosures under Insurance Act, 1938";

    @Builder.Default
    @Column(name = "legal_disclaimer_sec41_title")
    private String legalDisclaimerSec41Title = "⚠️ Section 41 of the Insurance Act, 1938 (Prohibition of Rebates):";

    @Builder.Default
    @Column(name = "legal_disclaimer_sec41_body", columnDefinition = "TEXT")
    private String legalDisclaimerSec41Body = "(1) No person shall allow or offer to allow, either directly or indirectly, as an inducement to any person to take out or renew or continue an insurance in respect of any kind of risk relating to lives or property in India, any rebate of the whole or part of the commission payable or any rebate of the premium shown on the policy, nor shall any person taking out or renewing or continuing a policy accept any rebate, except such rebate as may be allowed in accordance with the published prospectuses or tables of the insurer.\n\n(2) Any person making default in complying with the provisions of this section shall be liable for a penalty which may extend to ten lakh rupees.";

    @Builder.Default
    @Column(name = "legal_disclaimer_solicitation_text", columnDefinition = "TEXT")
    private String legalDisclaimerSolicitationText = "Product information, premiums, discounts, and benefits displayed on this platform are indicative and based on data provided by respective insurance companies. Please read the policy sales brochure and wording carefully before concluding any sale.";

    @Builder.Default
    @Column(name = "legal_disclaimer_tax_text", columnDefinition = "TEXT")
    private String legalDisclaimerTaxText = "Tax deductions under Section 80C, 80D, and exemptions under Section 10(10D) of the Income Tax Act, 1961 are subject to prevailing provisions and amendments in tax laws. Clients are advised to consult their qualified tax advisor.";

    // Full Document Rich HTML/Text Fields (WordPress/Notion Document Style)
    @Column(name = "legal_privacy_document_html", columnDefinition = "TEXT")
    private String legalPrivacyDocumentHtml;

    @Column(name = "legal_terms_document_html", columnDefinition = "TEXT")
    private String legalTermsDocumentHtml;

    @Column(name = "legal_disclaimer_document_html", columnDefinition = "TEXT")
    private String legalDisclaimerDocumentHtml;

    @Column(name = "legal_grievance_document_html", columnDefinition = "TEXT")
    private String legalGrievanceDocumentHtml;

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
