-- V37: Persistent Audit Log for Outbound Marketing Broadcasts & Contests
CREATE TABLE IF NOT EXISTS broadcast_campaign_logs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'TWILIO_WHATSAPP',
    recipients_count INT NOT NULL DEFAULT 0,
    sent_by VARCHAR(120),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_broadcast_logs_created_at ON broadcast_campaign_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcast_logs_channel ON broadcast_campaign_logs(channel);
