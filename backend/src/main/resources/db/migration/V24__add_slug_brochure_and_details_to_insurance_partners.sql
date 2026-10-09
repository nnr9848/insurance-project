-- V24__add_slug_brochure_and_details_to_insurance_partners.sql
-- Add slug, brochure_url, description, and key_highlights for on-platform brochure hub

ALTER TABLE insurance_partners
    ADD COLUMN IF NOT EXISTS slug VARCHAR(120) UNIQUE,
    ADD COLUMN IF NOT EXISTS brochure_url TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS key_highlights TEXT;

CREATE INDEX IF NOT EXISTS idx_insurance_partners_slug ON insurance_partners (slug);

-- Generate deterministic clean slugs for existing seeded partners
UPDATE insurance_partners SET 
    slug = 'star-health-insurance',
    description = 'Star Health and Allied Insurance is India’s premier standalone health insurer offering specialized cardiac, diabetes, and comprehensive family health floater policies with a vast cashless hospital network.',
    key_highlights = 'Over 14,000+ Cashless Hospitals,No Pre-Policy Medical Checkup Up to 50 Yrs,Dedicated In-House Claim Settlement,Lifetime Renewability Assured'
WHERE name = 'Star Health Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'hdfc-ergo',
    description = 'HDFC ERGO General Insurance offers comprehensive motor, health, travel, and home insurance coverage backed by innovative digital servicing and rapid cashless claim clearances.',
    key_highlights = '1.5 Cr+ Happy Customers,Zero-Depreciation Car Add-ons,13,000+ Cashless Healthcare Network,Instant Digital Policy Delivery'
WHERE name = 'HDFC ERGO' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'icici-lombard',
    description = 'ICICI Lombard General Insurance provides market-leading comprehensive motor, corporate, and health protection with instant paperless claim endorsements and door-step surveyor support.',
    key_highlights = 'Instant Motor Spot Claims,11,000+ Cashless Garages & Hospitals,Complete Hospital Cash Benefits,24/7 Roadside Assistance'
WHERE name = 'ICICI Lombard' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'care-health-insurance',
    description = 'Care Health Insurance specializes in high-sum-insured health plans, comprehensive critical illness covers, and senior citizen floater schemes with automatic sum insured recharge.',
    key_highlights = 'Unlimited Automatic Recharge of Sum Insured,No Claim Bonus Super up to 500%,Annual Health Check-up for All Insured Members,2-Hour Cashless Processing'
WHERE name = 'Care Health Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'tata-aig-insurance',
    description = 'TATA AIG Insurance combines trust, global expertise, and robust general insurance products protecting families, automobiles, SMEs, and overseas business travel.',
    key_highlights = '98.5% General Claim Settlement Ratio,7,500+ Cashless Garages,Emergency Abroad Travel & Medical Assistance,Zero Deductible Options'
WHERE name = 'TATA AIG Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'bajaj-allianz',
    description = 'Bajaj Allianz General Insurance provides seamless motor, health, and commercial policies powered by quick on-the-spot claim settlement features like Motor OTS.',
    key_highlights = 'Motor OTS Claim Clearance in 30 Mins,Global Health Hospitalization Options,Comprehensive Fire & Burglary Business Packs,10,000+ Network Hospitals'
WHERE name = 'Bajaj Allianz' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'niva-bupa-health',
    description = 'Niva Bupa Health Insurance (formerly Max Bupa) is celebrated for its ReAssure 2.0 plans with lock-the-clock entry age premiums and unlimited claim recharges.',
    key_highlights = 'ReAssure Unlimited Sum Insured Re-trigger,Lock-the-Age Premium Advantage,Direct 30-Minute Cashless Claim Processing,OPD Consultation Coverage'
WHERE name = 'Niva Bupa Health' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'sbi-general-insurance',
    description = 'SBI General Insurance leverages the solid foundation of India’s largest banking brand to provide accessible, affordable, and dependable life, motor, and health protection.',
    key_highlights = 'Affordable High-Coverage Premium Tiers,Simple Paperless Issuance,Nationwide Branch & Network Support,Comprehensive Personal Accident Plans'
WHERE name = 'SBI General Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'lic-of-india',
    description = 'Life Insurance Corporation of India (LIC) is the nation’s most revered public-sector life insurer offering sovereign-backed endowment, pension, term, and child education policies.',
    key_highlights = 'Sovereign Guarantee on Sum Assured & Bonus,Unmatched Pan-India Claim Settlement Track Record,Lifelong Guaranteed Income & Pension Schemes,High Loan Value on Policies'
WHERE name = 'Life Insurance Corporation (LIC)' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'max-life-insurance',
    description = 'Max Life Insurance delivers top-tier pure protection term life plans with critical illness riders and whole-life financial security for Indian families.',
    key_highlights = '99.5% Term Claim Settlement Ratio,Fast-Track InstaClaim Approval within 1 Day,Critical Illness & Disability Rider Options,Special Premium Rates for Non-Smokers'
WHERE name = 'Max Life Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'aditya-birla-capital',
    description = 'Aditya Birla Health & Life Insurance features modern wellness-driven policies with up to 100% premium return through active health tracking.',
    key_highlights = 'Earn While You Stay Healthy - Up to 100% Premium Back,Day-1 Cover for Pre-Existing Conditions (selected plans),Mental Health & Wellness Counseling Support,Comprehensive Critical Illness Shield'
WHERE name = 'Aditya Birla Capital' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'reliance-general-insurance',
    description = 'Reliance General Insurance offers extensive motor, health, and commercial property policies with comprehensive digital servicing and paperless renewals.',
    key_highlights = 'Instant Free Pick-up & Drop for Motor Claims,Special Discounts for Safe Drivers,Worldwide Emergency Medical Assistance,Easy 3-Step Online Claim Filing'
WHERE name = 'Reliance General Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'digit-insurance',
    description = 'Digit Insurance re-imagines insurance with zero jargon, 100% digital paperless self-inspection, and super-fast reimbursement settlement.',
    key_highlights = '100% Smartphone Audio/Video Self-Inspection,Zero Hardcopy Paperwork Required,Customizable Vehicle Idv Values,Zero Deductible Glass & Bumper Shield'
WHERE name = 'Digit Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'kotak-general-insurance',
    description = 'Kotak Mahindra General Insurance delivers customized retail health, motor, and SME insurance tailored to dynamic financial protection requirements.',
    key_highlights = 'Pay As You Drive Motor Insurance Feature,Comprehensive Critical Illness Add-ons,Swift Hospital Cash Approvals,Cashless Repair Across 4,500+ Garages'
WHERE name = 'Kotak General Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'manipalcigna-health',
    description = 'ManipalCigna Health Insurance blends healthcare expertise with international insurance rigor for comprehensive lifelong medical coverage.',
    key_highlights = 'Non-Medical Expense Hospitalization Protection,Global Emergency Cover Included,Domestic Air Ambulance Subsidies,Multi-Individual Health Rewards'
WHERE name = 'ManipalCigna Health' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'chola-ms-general-insurance',
    description = 'Cholamandalam MS General Insurance provides robust motor, commercial transit, fire, and health insurance backed by Murugappa Group and Mitsui Sumitomo.',
    key_highlights = 'Trusted Joint-Venture Reliability,Seamless Rural & Urban Cashless Network,Tailored Commercial Fleet Coverage,Simple 24/7 Claim Assistance Desk'
WHERE name = 'Chola MS General Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'future-generali',
    description = 'Future Generali India Insurance offers retail and commercial solutions focused on speed, transparency, and high customer satisfaction ratios.',
    key_highlights = 'Fast Cashless Hospitalization Approvals,Zero-Dep Car Shield with Engine Protector,Instant Online Renewal without Break-in Penalties,Custom Business Property Protection'
WHERE name = 'Future Generali' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'magma-hdi-general',
    description = 'Magma HDI General Insurance provides dependable motor, commercial liability, and health solutions with transparent claim documentation.',
    key_highlights = 'Affordable Motor Third-Party & Comprehensive Packs,Prompt Spot Survey for Vehicle Accidents,Over 4,000+ Cashless Network Workshops,Dedicated Grievance Escalation Mechanism'
WHERE name = 'Magma HDI General' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'national-insurance',
    description = 'National Insurance Company Ltd is one of India’s pioneering public-sector insurers trusted for over a century across motor, health, and rural insurance.',
    key_highlights = 'Over 115 Years of Trusted Heritage,Sovereign Public Sector Trust,Massive Nationwide Hospital & Garage Reach,Low-Cost Government Compliant Policies'
WHERE name = 'National Insurance' AND slug IS NULL;

UPDATE insurance_partners SET 
    slug = 'oriental-insurance',
    description = 'The Oriental Insurance Company is a prominent public sector non-life insurer specializing in large-scale commercial, motor, and family healthcare covers.',
    key_highlights = 'Government of India Enterprise Trust,Comprehensive Family Mediclaim Plans,Extensive Regional Branch Network Across India,Special Concessions for Senior Citizens'
WHERE name = 'Oriental Insurance' AND slug IS NULL;

-- Fallback for any unmapped or future partners to auto-populate slug from name
UPDATE insurance_partners 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
