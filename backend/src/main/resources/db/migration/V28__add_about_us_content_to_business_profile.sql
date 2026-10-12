-- V28: Add About Us Story, Mission/Vision, and Gallery Content to BusinessProfile
ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS about_hero_title TEXT DEFAULT 'India’s Most Dependable Bridge Between Families, Protection & Financial Freedom',
    ADD COLUMN IF NOT EXISTS about_hero_description TEXT DEFAULT 'At Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd, we believe every Indian family deserves unbiased, transparent, and prompt insurance advisory with zero hidden catches. Rooted in Hyderabad with a pan-regional network of over 1,200 certified advisors, we don''t just sell policies — we stand beside you during claim settlements.',
    ADD COLUMN IF NOT EXISTS about_mission_statement TEXT DEFAULT 'To democratize transparent insurance advisory across India, ensuring zero out-of-pocket surprise rejections and 100% cashless hospitalization concierge.',
    ADD COLUMN IF NOT EXISTS about_vision_statement TEXT DEFAULT 'To become the nation''s most trusted insurance marketing firm, empowering families and businesses through ethical advisory and swift claim resolution.',
    ADD COLUMN IF NOT EXISTS about_gallery_photos_json TEXT DEFAULT '[]';
