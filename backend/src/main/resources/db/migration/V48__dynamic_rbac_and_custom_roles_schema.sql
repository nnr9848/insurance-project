-- V48: Granular RBAC Schema, Permissions Catalog, and Dynamic Role Management
-- Enforces clean enterprise-grade role definitions and permission mapping

-- 1. Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    label VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enhance roles table with metadata
ALTER TABLE roles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 3. Create role_permissions join table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Mark existing default roles as system roles and update labels
UPDATE roles SET display_name = 'Super Administrator', description = 'Full unconstrained platform control, audits, roles, and settings', is_system = TRUE WHERE name = 'ROLE_SUPER_ADMIN';
UPDATE roles SET display_name = 'Administrator', description = 'Enterprise operations management, user onboarding, and CRM governance', is_system = TRUE WHERE name = 'ROLE_ADMIN';
UPDATE roles SET display_name = 'Branch Manager', description = 'Team lead oversight, quote/renewal approvals, and sales pipeline management', is_system = TRUE WHERE name = 'ROLE_MANAGER';
UPDATE roles SET display_name = 'Insurance Advisor', description = 'Direct customer advisory, quotes generation, CRM lead management, and POSP partner creation', is_system = TRUE WHERE name = 'ROLE_ADVISOR';
UPDATE roles SET display_name = 'Support Staff', description = 'Internal CRM desk operations, client servicing, and inquiry triage', is_system = TRUE WHERE name = 'ROLE_STAFF';
UPDATE roles SET display_name = 'POSP Partner', description = 'External insurance agent partner, leads pipeline, and commission tracking', is_system = TRUE WHERE name = 'ROLE_POSP_AGENT';
UPDATE roles SET display_name = 'Customer', description = 'End-consumer portal account for personal policies, claims, and inquiries', is_system = TRUE WHERE name = 'ROLE_USER';

-- 5. Seed Atomic Permissions Catalog
INSERT INTO permissions (code, module, label, description) VALUES
    -- Leads & Inquiries
    ('leads:read', 'LEADS', 'View Leads & Inquiries', 'Access CRM incoming lead inquiries and customer submissions'),
    ('leads:write', 'LEADS', 'Create & Edit Leads', 'Capture new leads, modify inquiry statuses, and reassign leads'),
    ('leads:delete', 'LEADS', 'Delete Leads', 'Permanently remove lead records or junk submissions'),
    ('leads:export', 'LEADS', 'Export Leads', 'Download inquiries list to CSV/Excel reports'),

    -- Clients & 360 CRM
    ('clients:read', 'CLIENTS', 'View Client Portfolio', 'Search and review customer profiles, policies, and timelines'),
    ('clients:write', 'CLIENTS', 'Manage Client Records', 'Create clients, log meetings, register call notes, and schedule tasks'),
    ('clients:delete', 'CLIENTS', 'Delete Clients', 'Remove client entries from the system database'),

    -- Quotations & Proposals
    ('quotes:read', 'QUOTES', 'View Quotations', 'Inspect generated quotes, proposals, and comparison sheets'),
    ('quotes:create', 'QUOTES', 'Create & Send Quotes', 'Generate new insurance quotes, dispatch emails, and share via WhatsApp'),
    ('quotes:delete', 'QUOTES', 'Revoke / Delete Quotes', 'Cancel or remove generated customer quotations'),

    -- Policy Renewals & Porting
    ('renewals:read', 'RENEWALS', 'View Renewal Desks', 'Track expiring policies, lapse alerts, and porting pipeline'),
    ('renewals:write', 'RENEWALS', 'Process Renewals', 'Send reminders, record payment receipts, and submit renewals'),

    -- Manager Approvals
    ('approvals:request', 'APPROVALS', 'Submit Approval Requests', 'Request senior manager approval on discounts or exceptions'),
    ('approvals:decide', 'APPROVALS', 'Approve / Reject Requests', 'Review, accept, or reject pending approval tickets'),

    -- User & Agent Governance
    ('users:read', 'USERS', 'View Staff & Agents', 'Access staff directory, hierarchy, and agent KYC records'),
    ('users:create', 'USERS', 'Onboard Employees & Partners', 'Provision new team members and assign credentials'),
    ('users:manage', 'USERS', 'Manage Users & Security', 'Deactivate accounts, reset passwords, and reassign reporting managers'),
    ('roles:manage', 'USERS', 'Manage Roles & Permissions', 'Create dynamic roles, customize permission matrices, and assign access'),

    -- Documents & Claims
    ('documents:read', 'DOCUMENTS', 'View Document Locker', 'Inspect KYC IDs, policy documents, and customer attachments'),
    ('documents:manage', 'DOCUMENTS', 'Manage Document Locker', 'Upload, verify, approve, or delete client and agent documents'),
    ('claims:manage', 'CLAIMS', 'Manage Claims Intimations', 'Track hospital intimations, TPA claims, and settlement workflows'),

    -- CMS, Website & System Settings
    ('cms:manage', 'CMS', 'Manage Website Content & CMS', 'Edit business profiles, blog posts, reviews, and legal policies'),
    ('partners:manage', 'CMS', 'Manage Insurance Partners', 'Update partnered insurers, logos, brochures, and plan details'),
    ('hospitals:manage', 'CMS', 'Manage Network Hospitals', 'Maintain cashless hospital directory and map coordinates'),
    ('integrations:manage', 'SETTINGS', 'Manage API Integrations', 'Configure Twilio SMS/WhatsApp, email mailboxes, and Firebase'),
    ('audit:read', 'AUDIT', 'View Audit Trail & Activity', 'Inspect comprehensive compliance audit trail logs and analytics')
ON CONFLICT (code) DO NOTHING;

-- 6. Link Default Permissions to System Roles
-- Super Admin: receives ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin: receives all except super-exclusive security role alterations if segregated
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Branch Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_MANAGER'
  AND p.code IN (
      'leads:read', 'leads:write', 'leads:export',
      'clients:read', 'clients:write',
      'quotes:read', 'quotes:create',
      'renewals:read', 'renewals:write',
      'approvals:decide', 'approvals:request',
      'users:read', 'users:create',
      'documents:read', 'documents:manage',
      'claims:manage', 'audit:read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Insurance Advisor
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_ADVISOR'
  AND p.code IN (
      'leads:read', 'leads:write',
      'clients:read', 'clients:write',
      'quotes:read', 'quotes:create',
      'renewals:read', 'renewals:write',
      'approvals:request',
      'users:read', 'users:create',
      'documents:read', 'documents:manage',
      'claims:manage'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Support Staff
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_STAFF'
  AND p.code IN (
      'leads:read', 'leads:write',
      'clients:read', 'clients:write',
      'quotes:read',
      'renewals:read',
      'documents:read',
      'claims:manage'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- POSP Partner
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_POSP_AGENT'
  AND p.code IN (
      'leads:read', 'leads:write',
      'clients:read', 'clients:write',
      'quotes:read', 'quotes:create',
      'documents:read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
