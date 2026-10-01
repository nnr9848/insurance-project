-- V22__add_whatsapp_integration_settings.sql
-- Add Meta WhatsApp Cloud API credentials, status toggles, and notification trigger switches to business_profile

ALTER TABLE business_profile 
    ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS whatsapp_api_url VARCHAR(255) DEFAULT 'https://graph.facebook.com/v19.0',
    ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
    ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS notify_leads_on_whatsapp BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS notify_claims_on_whatsapp BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS notify_docs_on_whatsapp BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN business_profile.whatsapp_enabled IS 'Master switch for Meta WhatsApp Cloud API notifications';
COMMENT ON COLUMN business_profile.whatsapp_phone_number_id IS 'Meta WhatsApp Cloud API Phone Number ID';
COMMENT ON COLUMN business_profile.whatsapp_access_token IS 'Meta Graph API permanent System User or Bearer access token';
COMMENT ON COLUMN business_profile.notify_leads_on_whatsapp IS 'Send instant quote confirmation on WhatsApp';
COMMENT ON COLUMN business_profile.notify_claims_on_whatsapp IS 'Send instant claim intimation on WhatsApp';
COMMENT ON COLUMN business_profile.notify_docs_on_whatsapp IS 'Send document review alerts on WhatsApp';
