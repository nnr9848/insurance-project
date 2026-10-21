-- V45: Add domain mailbox aliases to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain_mailbox_aliases TEXT;
