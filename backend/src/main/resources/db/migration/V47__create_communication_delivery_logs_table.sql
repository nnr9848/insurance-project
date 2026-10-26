-- V47__create_communication_delivery_logs_table.sql
-- Enterprise Communication & OTP Delivery Logs for real-time diagnostics, carrier tracking, and audit compliance

CREATE TABLE IF NOT EXISTS communication_delivery_logs (
    id BIGSERIAL PRIMARY KEY,
    channel VARCHAR(40) NOT NULL,            -- 'TWILIO_VERIFY_SMS', 'TWILIO_VERIFY_WHATSAPP', 'TWILIO_SMS', 'SMTP_EMAIL'
    recipient VARCHAR(120) NOT NULL,          -- Destination phone number or email address
    purpose VARCHAR(80) NOT NULL,            -- 'PORTAL_LOGIN_OTP', 'QUOTE_INQUIRY_OTP', 'TEST_SMS', 'POLICY_RENEWAL'
    status VARCHAR(30) NOT NULL,             -- 'DELIVERED', 'FAILED', 'BLOCKED_BY_PROVIDER'
    provider_code VARCHAR(50),               -- '200', '60238', '401', '403'
    failure_reason TEXT,                     -- Clear human-readable diagnostic error message
    payload_summary VARCHAR(255),            -- Short preview of message/context without leaking secrets
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comm_logs_created_at ON communication_delivery_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_logs_status ON communication_delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_comm_logs_recipient ON communication_delivery_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_comm_logs_channel ON communication_delivery_logs(channel);

COMMENT ON TABLE communication_delivery_logs IS 'Real-time diagnostic delivery logs for SMS, WhatsApp OTPs, and system communications';
