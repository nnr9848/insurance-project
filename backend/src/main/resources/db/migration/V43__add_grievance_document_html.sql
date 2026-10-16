-- V43: Add Grievance Redressal Rich Document HTML column to business_profile
ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS legal_grievance_document_html TEXT;
