-- Migration: V49__update_default_linkedin_and_office_address.sql
-- Description: Update canonical corporate address and default LinkedIn URL to West Marredpally location

UPDATE business_profile
SET 
    office_address_line1 = 'Plot No.1, 2nd Floor, Sarva Sukhi Colony,',
    office_address_line2 = 'West Marredpally, Hyderabad, Telangana.',
    postal_code = '500026',
    legal_grievance_address = 'Plot No.1, 2nd Floor, Sarva Sukhi Colony, West Marredpally, Hyderabad, Telangana. 500026',
    google_maps_url = 'https://maps.google.com/?q=Plot+No.1+Sarva+Sukhi+Colony+West+Marredpally+Hyderabad+500026',
    google_review_url = 'https://maps.google.com/?q=Aadhiraksha+Insurance+Marketing+West+Marredpally+Hyderabad',
    linkedin_url = 'https://www.linkedin.com/in/aadhiraksha-insurance-b45215410/'
WHERE id = 1;

ALTER TABLE business_profile 
    ALTER COLUMN office_address_line1 SET DEFAULT 'Plot No.1, 2nd Floor, Sarva Sukhi Colony,',
    ALTER COLUMN office_address_line2 SET DEFAULT 'West Marredpally, Hyderabad, Telangana.',
    ALTER COLUMN postal_code SET DEFAULT '500026',
    ALTER COLUMN linkedin_url SET DEFAULT 'https://www.linkedin.com/in/aadhiraksha-insurance-b45215410/';

