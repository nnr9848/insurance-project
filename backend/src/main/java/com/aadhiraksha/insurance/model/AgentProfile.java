package com.aadhiraksha.insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AgentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"password", "manager", "roles"})
    private User user;

    @Column(name = "pan_number", nullable = false, length = 20)
    private String panNumber;

    @Column(name = "aadhaar_number", length = 20)
    private String aadhaarNumber;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Builder.Default
    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Builder.Default
    @Column(length = 30)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "certificate_number", length = 100)
    private String certificateNumber;

    @Column(name = "irdai_license_code", length = 100)
    private String irdaiLicenseCode;

    @Builder.Default
    @Column(name = "training_completed")
    private Boolean trainingCompleted = true;

    @Builder.Default
    @Column(name = "exam_score_percentage")
    private Integer examScorePercentage = 85;

    @Builder.Default
    @Column(name = "default_commission_rate", precision = 5, scale = 2)
    private BigDecimal defaultCommissionRate = new BigDecimal("15.00");

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}
