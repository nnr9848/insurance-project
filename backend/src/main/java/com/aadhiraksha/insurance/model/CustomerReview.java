package com.aadhiraksha.insurance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Column(name = "customer_phone", nullable = false, length = 50)
    private String customerPhone;

    @Column(name = "policy_type", nullable = false, length = 100)
    @Builder.Default
    private String policyType = "Health Insurance";

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "review_title", length = 200)
    private String reviewTitle;

    @Column(name = "review_text", nullable = false, columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "city", length = 100)
    @Builder.Default
    private String city = "Hyderabad";

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PUBLISHED"; // 'PUBLISHED', 'INTERNAL_ESCALATION', 'PENDING_REVIEW', 'REJECTED'

    @Column(name = "is_verified_buyer", nullable = false)
    @Builder.Default
    private Boolean isVerifiedBuyer = true;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_staff_id")
    private User resolvedByStaff;

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
