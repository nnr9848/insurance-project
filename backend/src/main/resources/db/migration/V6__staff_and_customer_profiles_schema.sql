-- V6: Separation of Core Auth Users into Dedicated Staff & Customer Profile Tables

-- 1. Create staff_profiles table (for Internal Employees, Advisors & Managers)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE,
    reporting_manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    designation_id BIGINT REFERENCES designations(id) ON DELETE SET NULL,
    department_name VARCHAR(120),
    designation_name VARCHAR(120),
    must_change_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_manager_id ON staff_profiles(reporting_manager_id);
CREATE INDEX IF NOT EXISTS idx_staff_employee_code ON staff_profiles(employee_code);
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_designation_id ON staff_profiles(designation_id);

-- 2. Create customer_profiles table (for Policyholders / Portal Consumers)
CREATE TABLE IF NOT EXISTS customer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_code VARCHAR(50) UNIQUE,
    dob DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    kyc_status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_code ON customer_profiles(customer_code);

-- 3. Data Migration: Backfill existing staff users into staff_profiles
INSERT INTO staff_profiles (
    user_id,
    employee_code,
    reporting_manager_id,
    department_id,
    designation_id,
    department_name,
    designation_name,
    must_change_password
)
SELECT 
    u.id AS user_id,
    u.employee_code,
    u.manager_id AS reporting_manager_id,
    d.id AS department_id,
    des.id AS designation_id,
    u.department AS department_name,
    u.designation AS designation_name,
    COALESCE(u.must_change_password, FALSE) AS must_change_password
FROM users u
LEFT JOIN departments d ON LOWER(TRIM(d.name)) = LOWER(TRIM(u.department))
LEFT JOIN designations des ON LOWER(TRIM(des.name)) = LOWER(TRIM(u.designation))
WHERE u.employee_code IS NOT NULL 
   OR u.manager_id IS NOT NULL 
   OR u.designation IS NOT NULL
   OR EXISTS (
       SELECT 1 FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.id 
       WHERE ur.user_id = u.id 
         AND r.name IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ADVISOR', 'ROLE_STAFF')
   )
ON CONFLICT (user_id) DO NOTHING;
