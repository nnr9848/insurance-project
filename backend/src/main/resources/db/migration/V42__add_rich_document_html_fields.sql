-- V42: Add Rich Document HTML/Text fields for Legal & Compliance pages
ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS legal_privacy_document_html TEXT,
    ADD COLUMN IF NOT EXISTS legal_terms_document_html TEXT,
    ADD COLUMN IF NOT EXISTS legal_disclaimer_document_html TEXT;


