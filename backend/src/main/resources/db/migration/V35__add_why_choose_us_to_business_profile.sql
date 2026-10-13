-- V35: Add Dynamic 'Why Choose Us / Comparison' Section Content to Business Profile

ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS why_us_badge VARCHAR(100) DEFAULT 'Why We Are Better',
    ADD COLUMN IF NOT EXISTS why_us_title VARCHAR(255) DEFAULT 'Traditional Agents vs. Aadhiraksha InsurTech',
    ADD COLUMN IF NOT EXISTS why_us_subtitle TEXT DEFAULT 'Experience complete transparency, real-time comparisons, and zero bias.',
    ADD COLUMN IF NOT EXISTS why_us_traditional_badge VARCHAR(100) DEFAULT 'TRADITIONAL AGENT',
    ADD COLUMN IF NOT EXISTS why_us_traditional_title VARCHAR(255) DEFAULT 'Single-Brand Bias & Manual Delays',
    ADD COLUMN IF NOT EXISTS why_us_traditional_points_json TEXT DEFAULT '["Only sells 1 company plans with high commissions","Heavy paper forms and 3-5 days policy delivery","Hard to compare hidden room rent and copay sub-limits","No claim assistance when admitted late at night","Forfeits your NCB bonus if you switch companies"]',
    ADD COLUMN IF NOT EXISTS why_us_aadhiraksha_badge VARCHAR(100) DEFAULT 'AADHIRAKSHA INSURTECH',
    ADD COLUMN IF NOT EXISTS why_us_aadhiraksha_title VARCHAR(255) DEFAULT 'Unbiased Choice & Fast-Track Claims',
    ADD COLUMN IF NOT EXISTS why_us_aadhiraksha_ribbon VARCHAR(100) DEFAULT 'RECOMMENDED',
    ADD COLUMN IF NOT EXISTS why_us_aadhiraksha_points_json TEXT DEFAULT '["Instant side-by-side comparison of 30+ top IRDAI insurers","100% digital KYC with policy on WhatsApp in 2 minutes","Zero room rent sub-limits & 100% restoration guarantee","Dedicated on-ground Claims Desk for 30-min cashless pre-auth","Seamless policy porting with accumulated waiting credits preserved"]';
