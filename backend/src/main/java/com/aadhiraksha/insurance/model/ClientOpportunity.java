package com.aadhiraksha.insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "client_opportunities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ClientOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties({"opportunities", "hibernateLazyInitializer", "handler"})
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private QuoteInquiry inquiry;

    @Column(name = "category_slug", nullable = false, length = 60)
    @Builder.Default
    private String categorySlug = "HEALTH";

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "coverage_amount", length = 60)
    private String coverageAmount;

    @Column(name = "estimated_premium", precision = 12, scale = 2)
    private BigDecimal estimatedPremium;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String stage = "NEW_LEAD";

    @Column(length = 20)
    @Builder.Default
    private String priority = "MEDIUM";

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_advisor_id")
    @JsonIgnoreProperties({"passwordHash", "roles", "hibernateLazyInitializer", "handler"})
    private User assignedAdvisor;

    @Column(columnDefinition = "text")
    private String specs;

    @Column(columnDefinition = "text")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
