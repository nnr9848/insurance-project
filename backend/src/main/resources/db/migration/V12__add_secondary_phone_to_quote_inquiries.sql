-- V12: Add secondary_phone column to quote_inquiries table to support dual phone numbers across Leads & CRM

ALTER TABLE quote_inquiries ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(20);
