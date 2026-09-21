package com.aadhiraksha.insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_code", unique = true, nullable = false, length = 50)
    private String clientCode;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(length = 120)
    private String email;

    private LocalDate dob;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String pincode;

    @Column(name = "insurance_type", length = 80)
    private String insuranceType;

    @Column(name = "existing_insurer", length = 120)
    private String existingInsurer;

    @Column(name = "policy_expiry_date")
    private LocalDate policyExpiryDate;

    @Column(name = "sum_insured", length = 50)
    private String sumInsured;

    @Column(name = "estimated_premium", precision = 12, scale = 2)
    private BigDecimal estimatedPremium;

    @Builder.Default
    @Column(name = "lead_source", length = 60)
    private String leadSource = "WEB_INQUIRY";

    @Builder.Default
    @Column(length = 40)
    private String stage = "NEW_LEAD"; // NEW_LEAD, CONTACTED, FOLLOWUP, INTERESTED, QUOTATION, MEETING, DOCUMENTS, PAYMENT, POLICY_ISSUED, CONVERTED, LOST, NOT_INTERESTED

    @Builder.Default
    @Column(length = 20)
    private String priority = "MEDIUM"; // HIGH, MEDIUM, LOW

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_advisor_id")
    @JsonIgnoreProperties({"manager", "roles", "password"})
    private User assignedAdvisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"manager", "roles", "password"})
    private User manager;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
