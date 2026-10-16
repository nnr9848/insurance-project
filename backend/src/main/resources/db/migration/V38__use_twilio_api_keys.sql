-- V38__use_twilio_api_keys.sql
-- Cleanly transition Twilio integration from legacy root Auth Token to enterprise API Keys (Key SID + Secret)
-- Recommended by Twilio for granular security, instant rotation, and isolated permissions.

ALTER TABLE business_profile
DROP COLUMN IF EXISTS twilio_auth_token;

ALTER TABLE business_profile
ADD COLUMN IF NOT EXISTS twilio_api_key_sid VARCHAR(100),
ADD COLUMN IF NOT EXISTS twilio_api_key_secret TEXT;

COMMENT ON COLUMN business_profile.twilio_api_key_sid IS 'Twilio API Key SID (e.g. SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)';
COMMENT ON COLUMN business_profile.twilio_api_key_secret IS 'Twilio API Key Secret for HTTP Basic Authentication';
