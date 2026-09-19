-- V5: Standardized Departments & Designations Lookup Schema

-- 1. Create Departments Lookup Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    code VARCHAR(60) NOT NULL UNIQUE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Designations Lookup Table
CREATE TABLE IF NOT EXISTS designations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    code VARCHAR(60) NOT NULL UNIQUE,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_designations_department ON designations(department_id);

-- 3. Seed Standard Insurance Brokerage Departments
INSERT INTO departments (name, code, display_order) VALUES
('Retail Sales (Health, Life & Motor)', 'DEPT_RETAIL_SALES', 1),
('Corporate & SME Solutions', 'DEPT_CORP_SME', 2),
('Claims & Hospitalization Assistance', 'DEPT_CLAIMS_DESK', 3),
('POSP Partner Distribution', 'DEPT_POSP_NETWORK', 4),
('Underwriting & Policy Servicing', 'DEPT_UNDERWRITING', 5),
('Customer Support & Grievances', 'DEPT_CUSTOMER_SUPPORT', 6),
('Operations & Management', 'DEPT_OPERATIONS', 7),
('Finance & Accounts', 'DEPT_FINANCE', 8)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order;

-- 4. Seed Standard Insurance Designations
-- Retail Sales
INSERT INTO designations (name, code, department_id, display_order) VALUES
('Insurance Advisor', 'DESIG_ADVISOR', (SELECT id FROM departments WHERE code = 'DEPT_RETAIL_SALES'), 1),
('Senior Insurance Advisor', 'DESIG_SR_ADVISOR', (SELECT id FROM departments WHERE code = 'DEPT_RETAIL_SALES'), 2),
('Branch Manager', 'DESIG_BRANCH_MGR', (SELECT id FROM departments WHERE code = 'DEPT_RETAIL_SALES'), 3),
('Assistant Branch Manager', 'DESIG_ASST_BRANCH_MGR', (SELECT id FROM departments WHERE code = 'DEPT_RETAIL_SALES'), 4)
ON CONFLICT (code) DO NOTHING;

-- Corporate & SME
INSERT INTO designations (name, code, department_id, display_order) VALUES
('Corporate Relationship Manager', 'DESIG_CORP_RM', (SELECT id FROM departments WHERE code = 'DEPT_CORP_SME'), 5),
('SME Business Specialist', 'DESIG_SME_SPEC', (SELECT id FROM departments WHERE code = 'DEPT_CORP_SME'), 6)
ON CONFLICT (code) DO NOTHING;

-- Claims & Hospitalization
INSERT INTO designations (name, code, department_id, display_order) VALUES
('Claims Executive', 'DESIG_CLAIMS_EXEC', (SELECT id FROM departments WHERE code = 'DEPT_CLAIMS_DESK'), 7),
('Claims Manager', 'DESIG_CLAIMS_MGR', (SELECT id FROM departments WHERE code = 'DEPT_CLAIMS_DESK'), 8),
('TPA / Hospital Desk Coordinator', 'DESIG_HOSP_COORD', (SELECT id FROM departments WHERE code = 'DEPT_CLAIMS_DESK'), 9)
ON CONFLICT (code) DO NOTHING;

-- POSP Network
INSERT INTO designations (name, code, department_id, display_order) VALUES
('POSP Channel Manager', 'DESIG_POSP_CHANNEL_MGR', (SELECT id FROM departments WHERE code = 'DEPT_POSP_NETWORK'), 10),
('POSP Onboarding Executive', 'DESIG_POSP_EXEC', (SELECT id FROM departments WHERE code = 'DEPT_POSP_NETWORK'), 11)
ON CONFLICT (code) DO NOTHING;

-- Operations & Support
INSERT INTO designations (name, code, department_id, display_order) VALUES
('Underwriting Specialist', 'DESIG_UNDERWRITER', (SELECT id FROM departments WHERE code = 'DEPT_UNDERWRITING'), 12),
('Customer Support Executive', 'DESIG_SUPPORT_EXEC', (SELECT id FROM departments WHERE code = 'DEPT_CUSTOMER_SUPPORT'), 13),
('Operations Executive', 'DESIG_OPS_EXEC', (SELECT id FROM departments WHERE code = 'DEPT_OPERATIONS'), 14),
('Finance Manager', 'DESIG_FINANCE_MGR', (SELECT id FROM departments WHERE code = 'DEPT_FINANCE'), 15)
ON CONFLICT (code) DO NOTHING;
