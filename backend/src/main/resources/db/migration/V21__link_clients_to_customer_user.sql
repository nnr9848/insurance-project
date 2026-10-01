-- V21__link_clients_to_customer_user.sql
-- Link master client records to portal registered user accounts

ALTER TABLE clients ADD COLUMN IF NOT EXISTS customer_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clients_customer_user_id ON clients(customer_user_id);

-- Match existing clients to registered customer users by phone number or email
UPDATE clients c
SET customer_user_id = u.id
FROM users u
WHERE c.customer_user_id IS NULL
  AND (
    (c.email IS NOT NULL AND LOWER(c.email) = LOWER(u.email))
    OR (c.phone_number IS NOT NULL AND RIGHT(REPLACE(REPLACE(c.phone_number, '+91', ''), ' ', ''), 10) = RIGHT(REPLACE(REPLACE(u.phone_number, '+91', ''), ' ', ''), 10))
  );
