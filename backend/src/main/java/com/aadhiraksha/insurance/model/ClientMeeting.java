package com.aadhiraksha.insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "client_meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ClientMeeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties({"assignedAdvisor", "manager"})
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advisor_id", nullable = false)
    @JsonIgnoreProperties({"manager", "roles", "password"})
    private User advisor;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 200)
    private String purpose;

    @Column(length = 100)
    private String product;

    @Column(name = "meeting_datetime", nullable = false)
    private LocalDateTime meetingDatetime;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDatetime;

    @Column(name = "google_meet_url")
    private String googleMeetUrl;

    @Column(name = "google_calendar_event_id")
    private String googleCalendarEventId;

    @Builder.Default
    @Column(name = "meeting_type", length = 30)
    private String meetingType = "GOOGLE_MEET"; // GOOGLE_MEET, IN_PERSON, PHONE

    @Column(length = 200)
    private String location;

    @Builder.Default
    @Column(length = 30)
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, RESCHEDULED, CANCELLED

    @Column(name = "outcome_notes", columnDefinition = "TEXT")
    private String outcomeNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
