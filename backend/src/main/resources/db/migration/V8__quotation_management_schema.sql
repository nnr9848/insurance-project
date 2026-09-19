-- V8: Multi-Insurer Quotations, Comparative Matrix & Revisions Engine

CREATE TABLE IF NOT EXISTS quotations (
    id BIGSERIAL PRIMARY KEY,
    quote_number VARCHAR(60) UNIQUE NOT NULL,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_by_advisor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    insurance_type VARCHAR(80) NOT NULL,
    insurer_name VARCHAR(120) NOT NULL,
    plan_name VARCHAR(150) NOT NULL,
    plan_variant VARCHAR(100),
    sum_insured VARCHAR(50) NOT NULL,
    policy_tenure_years INT DEFAULT 1,
    base_premium NUMERIC(12,2) NOT NULL,
    tax_gst NUMERIC(12,2) NOT NULL,
    total_premium NUMERIC(12,2) NOT NULL,
    ncb_discount_percent NUMERIC(5,2) DEFAULT 0.00,
    room_rent_limit VARCHAR(100) DEFAULT 'No Cap / Single Private Room',
    copay_percentage VARCHAR(50) DEFAULT '0%',
    restoration_benefit VARCHAR(100) DEFAULT '100% Unlimited Recharge',
    pre_post_hospitalization VARCHAR(100) DEFAULT '60 Days Pre / 180 Days Post',
    maternity_covered BOOLEAN DEFAULT FALSE,
    opd_covered BOOLEAN DEFAULT FALSE,
    status VARCHAR(40) DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
    version_number INT DEFAULT 1,
    notes TEXT,
    brochure_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_advisor_id ON quotations(created_by_advisor_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_insurer ON quotations(insurer_name);

-- Seed Sample Industry-Standard Comparative Quotations for Initial Clients
INSERT INTO quotations (
    quote_number, client_id, created_by_advisor_id, insurance_type, insurer_name, plan_name, plan_variant, 
    sum_insured, policy_tenure_years, base_premium, tax_gst, total_premium, ncb_discount_percent, 
    room_rent_limit, copay_percentage, restoration_benefit, pre_post_hospitalization, 
    maternity_covered, opd_covered, status, version_number, notes
) VALUES
('QT-2026-00101', 1, 3, 'HEALTH_INSURANCE', 'Star Health and Allied Insurance', 'Comprehensive Insurance Plan', 'Gold Floater', '₹10,00,000', 1, 14200.00, 2556.00, 16756.00, 20.00, 'Single Private AC Room', '0%', '100% Once per year', '60 Days / 90 Days', TRUE, FALSE, 'SENT', 1, 'Preferred choice for maternity & OPD cover with wide hospital network in Bangalore.'),
('QT-2026-00102', 1, 3, 'HEALTH_INSURANCE', 'Care Health Insurance', 'Care Supreme', 'Standard Option', '₹10,00,000', 1, 12800.00, 2304.00, 15104.00, 50.00, 'No Room Rent Capping', '0%', 'Unlimited Automatic Recharge', '60 Days / 180 Days', FALSE, FALSE, 'SENT', 1, 'Maximum cumulative bonus up to 500% NCB with zero sub-limits.'),
('QT-2026-00103', 1, 3, 'HEALTH_INSURANCE', 'HDFC ERGO General Insurance', 'Optima Secure', 'Global Plus', '₹10,00,000', 1, 15600.00, 2808.00, 18408.00, 0.00, 'Any Room Category', '0%', '2X Cover from Day 1 (20 Lakhs Effective)', '60 Days / 180 Days', FALSE, TRUE, 'DRAFT', 1, 'Includes 4X coverage in 3 years with comprehensive consumable protector.');
