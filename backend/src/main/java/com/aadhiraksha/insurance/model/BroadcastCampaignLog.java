package com.aadhiraksha.insurance.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "broadcast_campaign_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BroadcastCampaignLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Builder.Default
    @Column(length = 50, nullable = false)
    private String channel = "TWILIO_WHATSAPP";

    @Builder.Default
    @Column(name = "recipients_count", nullable = false)
    private Integer recipientsCount = 0;

    @Column(name = "sent_by", length = 120)
    private String sentBy;

    @Builder.Default
    @Column(length = 50, nullable = false)
    private String status = "COMPLETED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
