-- V44: Add email templates configuration JSON to business_profile
ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS email_templates_config_json TEXT;
