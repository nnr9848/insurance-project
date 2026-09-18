package com.aadhiraksha.insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "call_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CallLog {

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

    @Column(name = "call_result", nullable = false, length = 50)
    private String callResult; // ANSWERED, NOT_ANSWERED, INTERESTED, NOT_INTERESTED, CALL_BACK, QUOTE_REQUESTED, DOCS_REQUESTED, MEETING_REQUESTED, WRONG_NUMBER, CONVERTED, LOST

    @Builder.Default
    @Column(name = "call_duration_seconds")
    private Integer callDurationSeconds = 0;

    @Column(name = "call_notes", columnDefinition = "TEXT")
    private String callNotes;

    @Column(name = "next_follow_up_date")
    private LocalDateTime nextFollowUpDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
