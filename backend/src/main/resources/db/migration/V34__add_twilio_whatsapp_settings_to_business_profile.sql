-- V34__add_twilio_whatsapp_settings_to_business_profile.sql
-- Adds enterprise configuration columns for Twilio WhatsApp messaging and promotional broadcasts

ALTER TABLE business_profile
ADD COLUMN IF NOT EXISTS twilio_whatsapp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS twilio_whatsapp_from_number VARCHAR(60) DEFAULT 'whatsapp:+14155238886';

COMMENT ON COLUMN business_profile.twilio_whatsapp_enabled IS 'Master toggle for Twilio WhatsApp communications and broadcasts';
COMMENT ON COLUMN business_profile.twilio_whatsapp_from_number IS 'Twilio WhatsApp Sender (e.g. whatsapp:+14155238886 for Sandbox, or approved sender number)';
