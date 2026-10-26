-- V46__add_twilio_verify_service_sid.sql
-- Adds enterprise Twilio Verify Service SID configuration column to business_profile
-- Twilio Verify provides high-deliverability SMS and WhatsApp OTPs without DLT blocks.

ALTER TABLE business_profile
ADD COLUMN IF NOT EXISTS twilio_verify_service_sid VARCHAR(100);

COMMENT ON COLUMN business_profile.twilio_verify_service_sid IS 'Twilio Verify Service SID (e.g. VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)';
