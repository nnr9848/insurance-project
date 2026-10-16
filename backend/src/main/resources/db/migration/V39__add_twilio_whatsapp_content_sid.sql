-- V39__add_twilio_whatsapp_content_sid.sql
-- Add twilio_whatsapp_content_sid to business_profile for Meta WhatsApp Content API template dispatches (HX...)

ALTER TABLE business_profile
ADD COLUMN IF NOT EXISTS twilio_whatsapp_content_sid VARCHAR(100);

COMMENT ON COLUMN business_profile.twilio_whatsapp_content_sid IS 'Twilio WhatsApp Content Template SID (e.g. HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx)';
