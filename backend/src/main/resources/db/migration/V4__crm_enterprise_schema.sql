-- V4: Enterprise Insurance Sales CRM, User Hierarchy, Follow-ups, Meetings & Audit Trail

-- 1. Insert New Enterprise Roles
INSERT INTO roles (name) VALUES 
('ROLE_SUPER_ADMIN'),
('ROLE_MANAGER'),
('ROLE_ADVISOR')
ON CONFLICT (name) DO NOTHING;

-- 2. Alter Users table to support hierarchy & employment details
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Insurance Sales';
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_code ON users(employee_code);

-- 3. Clients / Leads Master Table
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    company_name VARCHAR(150),
    phone_number VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20),
    email VARCHAR(120),
    dob DATE,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    insurance_type VARCHAR(80),
    existing_insurer VARCHAR(120),
    policy_expiry_date DATE,
    sum_insured VARCHAR(50),
    estimated_premium NUMERIC(12,2),
    lead_source VARCHAR(60) DEFAULT 'WEB_INQUIRY',
    stage VARCHAR(40) DEFAULT 'NEW_LEAD',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    assigned_advisor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_assigned_advisor ON clients(assigned_advisor_id);
CREATE INDEX IF NOT EXISTS idx_clients_manager_id ON clients(manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_stage ON clients(stage);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone_number);
CREATE INDEX IF NOT EXISTS idx_clients_expiry ON clients(policy_expiry_date);

-- 4. Call Logs & Dispositions Table
CREATE TABLE IF NOT EXISTS call_logs (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    advisor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_result VARCHAR(50) NOT NULL,
    call_duration_seconds INT DEFAULT 0,
    call_notes TEXT,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_call_logs_client ON call_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_advisor ON call_logs(advisor_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);

-- 5. Follow-Up Tasks & Reminders
CREATE TABLE IF NOT EXISTS follow_up_tasks (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    advisor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_milestone VARCHAR(30) DEFAULT 'EXACT',
    channel VARCHAR(30) DEFAULT 'PHONE_CALL',
    status VARCHAR(30) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_followup_advisor_status ON follow_up_tasks(advisor_id, status);
CREATE INDEX IF NOT EXISTS idx_followup_scheduled ON follow_up_tasks(scheduled_datetime);

-- 6. Client Meetings (with Google Meet / In-Person)
CREATE TABLE IF NOT EXISTS client_meetings (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    advisor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    purpose VARCHAR(200),
    product VARCHAR(100),
    meeting_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    google_meet_url VARCHAR(255),
    google_calendar_event_id VARCHAR(255),
    meeting_type VARCHAR(30) DEFAULT 'GOOGLE_MEET',
    location VARCHAR(200),
    status VARCHAR(30) DEFAULT 'SCHEDULED',
    outcome_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meetings_advisor ON client_meetings(advisor_id);
CREATE INDEX IF NOT EXISTS idx_meetings_datetime ON client_meetings(meeting_datetime);

-- 7. Multi-Insurer Quotation Proposals
CREATE TABLE IF NOT EXISTS quotation_proposals (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    advisor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    comparison_data JSONB,
    status VARCHAR(30) DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Client Documents Locker & KYC
CREATE TABLE IF NOT EXISTS client_documents (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    document_type VARCHAR(60) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Enterprise Audit Trail Log
CREATE TABLE IF NOT EXISTS audit_trail (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(60) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(30) NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    performed_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    performed_by_name VARCHAR(120),
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_trail(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON audit_trail(performed_by_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_trail(timestamp);
