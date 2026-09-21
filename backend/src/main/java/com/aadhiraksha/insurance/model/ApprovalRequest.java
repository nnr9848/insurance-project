package com.aadhiraksha.insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_type", nullable = false, length = 60)
    private String requestType; // SPECIAL_DISCOUNT, LEAD_REASSIGNMENT, HIGH_SUM_INSURED, POLICY_CANCELLATION, CLIENT_ARCHIVE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"assignedAdvisor", "manager"})
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    @JsonIgnoreProperties({"manager", "roles", "password"})
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"manager", "roles", "password"})
    private User manager;

    @Column(name = "current_value")
    private String currentValue;

    @Column(name = "proposed_value")
    private String proposedValue;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_advisor_id")
    @JsonIgnoreProperties({"manager", "roles", "password"})
    private User targetAdvisor;

    @Builder.Default
    @Column(length = 40)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "manager_review_notes", columnDefinition = "TEXT")
    private String managerReviewNotes;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
