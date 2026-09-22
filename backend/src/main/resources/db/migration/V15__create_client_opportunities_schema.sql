-- V15__create_client_opportunities_schema.sql
-- Implements Salesforce Financial Services Cloud / Enterprise InsurTech standard multi-product opportunities pipeline

CREATE TABLE IF NOT EXISTS client_opportunities (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    inquiry_id BIGINT REFERENCES quote_inquiries(id) ON DELETE SET NULL,
    category_slug VARCHAR(60) NOT NULL DEFAULT 'HEALTH',
    product_name VARCHAR(150) NOT NULL,
    coverage_amount VARCHAR(60),
    estimated_premium NUMERIC(12, 2),
    stage VARCHAR(40) NOT NULL DEFAULT 'NEW_LEAD',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_advisor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    specs JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opportunities_client_id ON client_opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_inquiry_id ON client_opportunities(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON client_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON client_opportunities(category_slug);
CREATE INDEX IF NOT EXISTS idx_opportunities_advisor ON client_opportunities(assigned_advisor_id);

-- Backfill existing Primary Leads from clients table as primary opportunities if not already present
INSERT INTO client_opportunities (client_id, category_slug, product_name, coverage_amount, estimated_premium, stage, priority, is_primary, assigned_advisor_id, created_at, updated_at)
SELECT 
    c.id AS client_id,
    CASE 
        WHEN LOWER(COALESCE(c.insurance_type, '')) LIKE '%life%' OR LOWER(COALESCE(c.insurance_type, '')) LIKE '%term%' THEN 'LIFE'
        WHEN LOWER(COALESCE(c.insurance_type, '')) LIKE '%vehicle%' OR LOWER(COALESCE(c.insurance_type, '')) LIKE '%car%' OR LOWER(COALESCE(c.insurance_type, '')) LIKE '%bike%' OR LOWER(COALESCE(c.insurance_type, '')) LIKE '%motor%' THEN 'VEHICLE'
        WHEN LOWER(COALESCE(c.insurance_type, '')) LIKE '%loan%' THEN 'LOANS'
        WHEN LOWER(COALESCE(c.insurance_type, '')) LIKE '%business%' OR LOWER(COALESCE(c.insurance_type, '')) LIKE '%sme%' THEN 'BUSINESS'
        WHEN LOWER(COALESCE(c.insurance_type, '')) LIKE '%travel%' THEN 'TRAVEL'
        ELSE 'HEALTH'
    END AS category_slug,
    COALESCE(c.insurance_type, 'Health Insurance') AS product_name,
    c.sum_insured AS coverage_amount,
    c.estimated_premium,
    COALESCE(c.stage, 'NEW_LEAD') AS stage,
    COALESCE(c.priority, 'MEDIUM') AS priority,
    TRUE AS is_primary,
    c.assigned_advisor_id,
    c.created_at,
    c.updated_at
FROM clients c
WHERE NOT EXISTS (
    SELECT 1 FROM client_opportunities co WHERE co.client_id = c.id AND co.is_primary = TRUE
);
