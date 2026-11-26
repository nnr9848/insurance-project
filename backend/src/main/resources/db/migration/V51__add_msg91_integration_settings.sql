ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS msg91_otp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS msg91_authkey TEXT,
    ADD COLUMN IF NOT EXISTS msg91_otp_template_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS msg91_whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS msg91_whatsapp_integrated_number VARCHAR(30),
    ADD COLUMN IF NOT EXISTS msg91_whatsapp_template_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS msg91_whatsapp_otp_template_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS msg91_whatsapp_language VARCHAR(20) NOT NULL DEFAULT 'en';

COMMENT ON COLUMN business_profile.msg91_authkey IS 'MSG91 Authkey; must be supplied through a secret manager in production';
