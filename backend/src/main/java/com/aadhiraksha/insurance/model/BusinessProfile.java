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
