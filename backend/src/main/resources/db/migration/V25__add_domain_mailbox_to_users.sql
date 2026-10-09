-- V25: Add domain mailbox fields to users table for corporate employee email provisioning
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_domain_mailbox BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain_mailbox_email VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailbox_status VARCHAR(50) DEFAULT 'NOT_PROVISIONED';
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailbox_quota_mb INTEGER DEFAULT 5120; -- 5GB default mailbox quota
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailbox_created_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_domain_mailbox ON users(domain_mailbox_email);
