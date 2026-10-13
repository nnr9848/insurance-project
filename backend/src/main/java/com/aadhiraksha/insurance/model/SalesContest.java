package com.aadhiraksha.insurance.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_contests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesContest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "contest_type", nullable = false, length = 50)
    @Builder.Default
    private String contestType = "TRIP"; // TRIP, COMMISSION_BONUS, COLLATERAL_FLYER, RECOGNITION

    @Column(name = "sponsor_insurer", length = 100)
    @Builder.Default
    private String sponsorInsurer = "Aadhiraksha";

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "target_metric_type", length = 50)
    @Builder.Default
    private String targetMetricType = "GWP_AMOUNT"; // GWP_AMOUNT, POLICY_COUNT, OPEN

    @Column(name = "target_value", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal targetValue = BigDecimal.ZERO;

    @Column(name = "reward_description", columnDefinition = "TEXT")
    private String rewardDescription;

    @Column(name = "banner_image_url", columnDefinition = "TEXT")
    private String bannerImageUrl;

    @Column(name = "brochure_doc_url", columnDefinition = "TEXT")
    private String brochureDocUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
