package com.aadhiraksha.insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "follow_up_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FollowUpTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties({"assignedAdvisor", "manager"})
    private ClientLead client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advisor_id", nullable = false)
    @JsonIgnoreProperties({"manager", "roles", "password"})
    private User advisor;

    @Column(name = "scheduled_datetime", nullable = false)
    private LocalDateTime scheduledDatetime;

    @Builder.Default
    @Column(name = "reminder_milestone", length = 30)
    private String reminderMilestone = "EXACT"; // ONE_DAY_BEFORE, ONE_HOUR_BEFORE, FIFTEEN_MIN_BEFORE, EXACT

    @Builder.Default
    @Column(length = 30)
    private String channel = "PHONE_CALL"; // PHONE_CALL, WHATSAPP, EMAIL, IN_PERSON_VISIT

    @Builder.Default
    @Column(length = 30)
    private String status = "PENDING"; // PENDING, COMPLETED, OVERDUE, RESCHEDULED, CANCELLED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
