-- V33__add_twilio_sms_settings_to_business_profile.sql
-- Adds enterprise configuration columns for Twilio SMS OTP gateway to business_profile

ALTER TABLE business_profile
ADD COLUMN IF NOT EXISTS twilio_sms_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS twilio_account_sid VARCHAR(100),
ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT,
ADD COLUMN IF NOT EXISTS twilio_from_number VARCHAR(50);

COMMENT ON COLUMN business_profile.twilio_sms_enabled IS 'Master toggle for Twilio SMS OTP gateway';
COMMENT ON COLUMN business_profile.twilio_account_sid IS 'Twilio Account SID (e.g. ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)';
COMMENT ON COLUMN business_profile.twilio_auth_token IS 'Twilio Auth Token for REST API authentication';
COMMENT ON COLUMN business_profile.twilio_from_number IS 'Twilio sender phone number (e.g. +1234567890)';
