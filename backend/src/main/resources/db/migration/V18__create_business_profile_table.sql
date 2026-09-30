-- V18__create_business_profile_table.sql
-- Single-row Company Profile & Business Settings (Admin-Manageable)

CREATE TABLE IF NOT EXISTS business_profile (
    id BIGINT PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(255) NOT NULL DEFAULT 'Aadhiraksha Insurance & Financial Services Pvt Ltd',
    tagline VARCHAR(255) DEFAULT 'IRDAI Registered Insurance Marketing & Advisory Partner',
    primary_phone VARCHAR(50) NOT NULL DEFAULT '+91 8367415156',
    secondary_phone VARCHAR(50),
    whatsapp_number VARCHAR(50) DEFAULT '+91 8367415156',
    support_email VARCHAR(150) NOT NULL DEFAULT 'info@aadhirakshainsurance.com',
    claims_email VARCHAR(150) DEFAULT 'claims@aadhirakshainsurance.com',
    website_url VARCHAR(255) DEFAULT 'https://www.aadhirakshainsurance.com',
    office_address_line1 VARCHAR(255) NOT NULL DEFAULT '4th Floor, Mytri Constructions,',
    office_address_line2 VARCHAR(255) NOT NULL DEFAULT 'Opp: ECIL Busstop, ECIL, Hyderabad.',
    city VARCHAR(100) DEFAULT 'Hyderabad',
    state VARCHAR(100) DEFAULT 'Telangana',
    postal_code VARCHAR(20) DEFAULT '500062',
    business_hours VARCHAR(150) DEFAULT 'Mon - Sat, 9:30 AM to 6:30 PM',
    irdai_registration_no VARCHAR(100) DEFAULT 'IRDAI/IMF/TS/2026/00482',
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Seed canonical initial company profile record
INSERT INTO business_profile (
    id, 
    company_name, 
    primary_phone, 
    whatsapp_number, 
    support_email, 
    claims_email,
    website_url, 
    office_address_line1, 
    office_address_line2, 
    city, 
    state, 
    postal_code, 
    business_hours, 
    irdai_registration_no
) VALUES (
    1,
    'Aadhiraksha Insurance & Financial Services Pvt Ltd',
    '+91 8367415156',
    '+91 8367415156',
    'info@aadhirakshainsurance.com',
    'claims@aadhirakshainsurance.com',
    'https://www.aadhirakshainsurance.com',
    '4th Floor, Mytri Constructions,',
    'Opp: ECIL Busstop, ECIL, Hyderabad.',
    'Hyderabad',
    'Telangana',
    '500062',
    'Mon - Sat, 9:30 AM to 6:30 PM',
    'IRDAI/IMF/TS/2026/00482'
) ON CONFLICT (id) DO NOTHING;
