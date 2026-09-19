package com.aadhiraksha.insurance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String quoteNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private ClientLead client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_advisor_id")
    private User createdByAdvisor;

    @Column(nullable = false, length = 80)
    private String insuranceType;

    @Column(nullable = false, length = 120)
    private String insurerName;

    @Column(nullable = false, length = 150)
    private String planName;

    @Column(length = 100)
    private String planVariant;

    @Column(nullable = false, length = 50)
    private String sumInsured;

    @Builder.Default
    @Column(name = "policy_tenure_years")
    private Integer policyTenureYears = 1;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal basePremium;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal taxGst;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPremium;

    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal ncbDiscountPercent = BigDecimal.ZERO;

    @Builder.Default
    @Column(length = 100)
    private String roomRentLimit = "No Cap / Single Private Room";

    @Builder.Default
    @Column(length = 50)
    private String copayPercentage = "0%";

    @Builder.Default
    @Column(length = 100)
    private String restorationBenefit = "100% Unlimited Recharge";

    @Builder.Default
    @Column(length = 100)
    private String prePostHospitalization = "60 Days Pre / 180 Days Post";

    @Builder.Default
    private Boolean maternityCovered = false;

    @Builder.Default
    private Boolean opdCovered = false;

    @Builder.Default
    @Column(length = 40)
    private String status = "DRAFT"; // DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED

    @Builder.Default
    @Column(name = "version_number")
    private Integer versionNumber = 1;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 500)
    private String brochureUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
