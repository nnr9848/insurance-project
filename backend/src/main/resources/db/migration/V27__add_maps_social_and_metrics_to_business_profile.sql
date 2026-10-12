-- V27: Add Google Maps URL, Social Media Profiles & Corporate Impact Milestones to BusinessProfile
ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Mytri+Constructions+ECIL+Hyderabad',
    ADD COLUMN IF NOT EXISTS google_review_url TEXT DEFAULT 'https://maps.google.com/?q=Aadhiraksha+Insurance+Marketing+ECIL+Hyderabad',
    ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT 'https://www.linkedin.com/company/aadhiraksha-insurance/',
    ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255) DEFAULT 'https://www.youtube.com/@aadhiraksha-insurance',
    ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255) DEFAULT 'https://www.instagram.com/aadhiraksha_insurance/',
    ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255) DEFAULT 'https://www.facebook.com/aadhirakshainsurance/',
    ADD COLUMN IF NOT EXISTS x_twitter_url VARCHAR(255) DEFAULT 'https://x.com/aadhiraksha_ins',
    ADD COLUMN IF NOT EXISTS claims_settled_amount VARCHAR(100) DEFAULT '₹50+ Cr',
    ADD COLUMN IF NOT EXISTS families_protected_count VARCHAR(100) DEFAULT '25,000+',
    ADD COLUMN IF NOT EXISTS certified_advisors_count VARCHAR(100) DEFAULT '1,200+',
    ADD COLUMN IF NOT EXISTS settlement_ratio VARCHAR(50) DEFAULT '98.8%';
