-- V40: Add Full Grievance Redressal and Compliance Content fields to business_profile
ALTER TABLE business_profile
    ADD COLUMN IF NOT EXISTS legal_grievance_address TEXT DEFAULT '4th Floor, Mytri Constructions, Opp: ECIL Busstop, ECIL, Hyderabad.',
    ADD COLUMN IF NOT EXISTS legal_grievance_timing VARCHAR(100) DEFAULT 'Mon - Sat, 9:30 AM to 6:30 PM',
    ADD COLUMN IF NOT EXISTS legal_grievance_level1_intro TEXT DEFAULT 'For any service deficiency, delay in policy delivery, or assistance in claim disputes, customers may reach out to our Principal Grievance Officer:',
    ADD COLUMN IF NOT EXISTS legal_grievance_level2_text TEXT DEFAULT 'If the response from our desk is unsatisfactory within 14 working days, you can lodge a formal complaint directly with the Grievance Redressal Officer (GRO) of the respective underwriting insurance company.',
    ADD COLUMN IF NOT EXISTS legal_grievance_level3_text TEXT DEFAULT 'You may also register complaints with the IRDAI''s Integrated Grievance Management System (Bima Bharosa):',
    ADD COLUMN IF NOT EXISTS legal_grievance_ombudsman_helpline VARCHAR(100) DEFAULT '155255 / 1800 4254 732',
    ADD COLUMN IF NOT EXISTS legal_grievance_ombudsman_portal VARCHAR(255) DEFAULT 'https://bimabharosa.irdai.gov.in';
