package com.aadhiraksha.insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "posp_commissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PospCommission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posp_agent_id", nullable = false)
    @JsonIgnoreProperties({"password", "manager", "roles"})
    private User pospAgent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"assignedAdvisor", "manager"})
    private Client client;

    @Column(name = "policy_number", length = 100)
    private String policyNumber;

    @Column(name = "insurer_name", nullable = false, length = 120)
    private String insurerName;

    @Column(name = "product_type", nullable = false, length = 100)
    private String productType;

    @Column(name = "gross_premium", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossPremium;

    @Builder.Default
    @Column(name = "commission_rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionRatePercent = new BigDecimal("15.00");

    @Column(name = "commission_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal commissionAmount;

    @Builder.Default
    @Column(name = "tds_deducted", precision = 12, scale = 2)
    private BigDecimal tdsDeducted = BigDecimal.ZERO;

    @Column(name = "net_payout", nullable = false, precision = 12, scale = 2)
    private BigDecimal netPayout;

    @Builder.Default
    @Column(name = "payout_status", nullable = false, length = 40)
    private String payoutStatus = "PENDING"; // PENDING, PROCESSED, PAID

    @Column(name = "payout_utr_ref", length = 100)
    private String payoutUtrRef;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
