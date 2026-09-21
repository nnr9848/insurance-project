-- V14__add_inquiry_id_to_quotations.sql
-- Adds dedicated foreign key column inquiry_id to quotations for first-class lead inquiry heritage tracking

ALTER TABLE quotations ADD COLUMN IF NOT EXISTS inquiry_id BIGINT REFERENCES quote_inquiries(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_quotations_inquiry_id ON quotations(inquiry_id);
