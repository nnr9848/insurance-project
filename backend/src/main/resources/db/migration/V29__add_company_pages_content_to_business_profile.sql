-- V29: Add Company Pages dynamic CMS fields to BusinessProfile
ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS posp_page_headline TEXT DEFAULT 'Empower Your Career as a Certified POSP Insurance Advisor',
    ADD COLUMN IF NOT EXISTS posp_page_subheadline TEXT DEFAULT 'Join Telangana & AP''s fastest-growing insurtech partner network with zero initial capital, 100% digital onboarding, and direct multi-insurer quotes.',
    ADD COLUMN IF NOT EXISTS claims_page_headline TEXT DEFAULT '24/7 Cashless Claims Assistance & Emergency Concierge',
    ADD COLUMN IF NOT EXISTS claims_page_subheadline TEXT DEFAULT 'File your cashless hospitalization or motor damage intimation in under 60 seconds with dedicated claim managers.',
    ADD COLUMN IF NOT EXISTS legal_grievance_officer_name VARCHAR(255) DEFAULT 'Customer Care Head',
    ADD COLUMN IF NOT EXISTS legal_grievance_email VARCHAR(255) DEFAULT 'grievance@aadhirakshainsurance.com',
    ADD COLUMN IF NOT EXISTS legal_grievance_phone VARCHAR(50) DEFAULT '+91 8367415156';
