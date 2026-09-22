-- V16__alter_client_opportunities_specs_text.sql
-- Alter specs column in client_opportunities to TEXT to align with Hibernate JPA text mapping

ALTER TABLE client_opportunities ALTER COLUMN specs TYPE TEXT;
