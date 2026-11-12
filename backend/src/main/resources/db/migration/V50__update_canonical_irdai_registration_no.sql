-- Migration: V50__update_canonical_irdai_registration_no.sql
-- Description: Update canonical IRDAI Registration / License number to IMF11120720260994

UPDATE business_profile
SET irdai_registration_no = 'IMF11120720260994'
WHERE id = 1;

ALTER TABLE business_profile 
    ALTER COLUMN irdai_registration_no SET DEFAULT 'IMF11120720260994';

