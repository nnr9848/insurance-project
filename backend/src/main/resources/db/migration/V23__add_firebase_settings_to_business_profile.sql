-- V23__add_firebase_settings_to_business_profile.sql
-- Add Google Firebase Phone Authentication credentials and settings

ALTER TABLE business_profile 
    ADD COLUMN IF NOT EXISTS firebase_enabled BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS firebase_project_id VARCHAR(100) DEFAULT 'aadhiraksha-insurance',
    ADD COLUMN IF NOT EXISTS firebase_api_key VARCHAR(150),
    ADD COLUMN IF NOT EXISTS firebase_auth_domain VARCHAR(150),
    ADD COLUMN IF NOT EXISTS firebase_app_id VARCHAR(150),
    ADD COLUMN IF NOT EXISTS firebase_storage_bucket VARCHAR(150),
    ADD COLUMN IF NOT EXISTS firebase_messaging_sender_id VARCHAR(50);

COMMENT ON COLUMN business_profile.firebase_enabled IS 'Master toggle for Google Firebase Phone Auth OTP';
COMMENT ON COLUMN business_profile.firebase_project_id IS 'Firebase Project ID';
COMMENT ON COLUMN business_profile.firebase_api_key IS 'Firebase Web API Key';
COMMENT ON COLUMN business_profile.firebase_auth_domain IS 'Firebase Auth Domain';
COMMENT ON COLUMN business_profile.firebase_app_id IS 'Firebase Web App ID';
