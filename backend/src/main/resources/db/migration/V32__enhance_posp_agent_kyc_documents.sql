-- ==============================================================================
-- Flyway Migration V32: Enhance POSP Agent Profile with KYC Documents & Photos
-- ==============================================================================

ALTER TABLE agent_profiles
    ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS pan_doc_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS aadhaar_doc_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS education_certificate_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS cancelled_cheque_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS training_certificate_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_agent_profiles_kyc_verified ON agent_profiles(kyc_verified);
