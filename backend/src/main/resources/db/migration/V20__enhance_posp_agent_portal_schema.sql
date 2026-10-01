-- V20__enhance_posp_agent_portal_schema.sql
-- POSP Certification, Commission Ledger, and Policy Booking Schema

-- 1. Enhance agent_profiles with POSP certification code, commission slabs, and bank payout details
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS certificate_number VARCHAR(100);
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS irdai_license_code VARCHAR(100);
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS training_completed BOOLEAN DEFAULT TRUE;
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS exam_score_percentage INT DEFAULT 85;
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS default_commission_rate NUMERIC(5,2) DEFAULT 15.00;
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20);
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);

-- 2. Link clients to POSP agents for attribution
ALTER TABLE clients ADD COLUMN IF NOT EXISTS posp_agent_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clients_posp_agent_id ON clients(posp_agent_id);

-- 3. POSP Commission & Earnings Ledger Table
CREATE TABLE IF NOT EXISTS posp_commissions (
    id BIGSERIAL PRIMARY KEY,
    posp_agent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    policy_number VARCHAR(100),
    insurer_name VARCHAR(120) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    gross_premium NUMERIC(12,2) NOT NULL,
    commission_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    commission_amount NUMERIC(12,2) NOT NULL,
    tds_deducted NUMERIC(12,2) DEFAULT 0.00,
    net_payout NUMERIC(12,2) NOT NULL,
    payout_status VARCHAR(40) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSED, PAID
    payout_utr_ref VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_posp_commissions_agent ON posp_commissions(posp_agent_id);
CREATE INDEX IF NOT EXISTS idx_posp_commissions_status ON posp_commissions(payout_status);

-- 4. Update the sample seeded POSP Agent record
UPDATE agent_profiles 
SET certificate_number = 'IRDAI/POSP/2026/00142',
    irdai_license_code = 'IMF-TS-2026-POSP-884',
    training_completed = true,
    exam_score_percentage = 92,
    default_commission_rate = 15.00,
    status = 'APPROVED',
    approved_at = CURRENT_TIMESTAMP
WHERE id = 1 OR user_id = (SELECT id FROM users WHERE email = 'posp@aadhiraksha.com');

-- 5. Seed initial realistic commission records for the demo POSP Agent
INSERT INTO posp_commissions (
    posp_agent_id, policy_number, insurer_name, product_type, gross_premium, 
    commission_rate_percent, commission_amount, tds_deducted, net_payout, payout_status, paid_at, created_at
) 
SELECT 
    u.id, 
    'POL-STAR-2026-9921', 
    'Star Health and Allied Insurance', 
    'Health Insurance', 
    18500.00, 
    15.00, 
    2775.00, 
    138.75, 
    2636.25, 
    'PAID', 
    CURRENT_TIMESTAMP - INTERVAL '5 days', 
    CURRENT_TIMESTAMP - INTERVAL '7 days'
FROM users u WHERE u.email = 'posp@aadhiraksha.com'
ON CONFLICT DO NOTHING;

INSERT INTO posp_commissions (
    posp_agent_id, policy_number, insurer_name, product_type, gross_premium, 
    commission_rate_percent, commission_amount, tds_deducted, net_payout, payout_status, created_at
) 
SELECT 
    u.id, 
    'POL-TATA-2026-8812', 
    'TATA AIG General Insurance', 
    'Car Insurance (Comprehensive)', 
    14200.00, 
    15.00, 
    2130.00, 
    106.50, 
    2023.50, 
    'PROCESSED', 
    CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM users u WHERE u.email = 'posp@aadhiraksha.com'
ON CONFLICT DO NOTHING;

INSERT INTO posp_commissions (
    posp_agent_id, policy_number, insurer_name, product_type, gross_premium, 
    commission_rate_percent, commission_amount, tds_deducted, net_payout, payout_status, created_at
) 
SELECT 
    u.id, 
    'POL-HDFC-2026-7734', 
    'HDFC ERGO General Insurance', 
    'Two Wheeler Insurance', 
    2850.00, 
    15.00, 
    427.50, 
    21.38, 
    406.12, 
    'PENDING', 
    CURRENT_TIMESTAMP - INTERVAL '6 hours'
FROM users u WHERE u.email = 'posp@aadhiraksha.com'
ON CONFLICT DO NOTHING;
