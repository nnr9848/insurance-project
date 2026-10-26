package com.aadhiraksha.insurance.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "communication_delivery_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunicationDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel", length = 40, nullable = false)
    private String channel; // 'TWILIO_VERIFY_SMS', 'TWILIO_VERIFY_WHATSAPP', 'TWILIO_SMS', 'SMTP_EMAIL'

    @Column(name = "recipient", length = 120, nullable = false)
    private String recipient;

    @Column(name = "purpose", length = 80, nullable = false)
    private String purpose;

    @Column(name = "status", length = 30, nullable = false)
    private String status; // 'DELIVERED', 'FAILED', 'BLOCKED_BY_PROVIDER'

    @Column(name = "provider_code", length = 50)
    private String providerCode;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "payload_summary", length = 255)
    private String payloadSummary;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
