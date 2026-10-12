-- V26: Add Policy Type (Fresh, Renewal, Portability) and Porting metadata to Clients master
ALTER TABLE clients ADD COLUMN IF NOT EXISTS policy_type VARCHAR(40) DEFAULT 'FRESH';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS existing_policy_number VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS porting_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_clients_policy_type ON clients(policy_type);
