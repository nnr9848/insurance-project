-- V11: Alter quote_inquiries plan_details column to TEXT to support structured summaries and JSON strings seamlessly

ALTER TABLE quote_inquiries ALTER COLUMN plan_details TYPE TEXT;
