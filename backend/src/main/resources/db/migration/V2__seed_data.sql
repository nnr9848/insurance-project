-- V2: Seed Data for Roles, Insurance Categories, and Sample Network Hospitals

INSERT INTO roles (name) VALUES 
('ROLE_USER'),
('ROLE_POSP_AGENT'),
('ROLE_STAFF'),
('ROLE_ADMIN')
ON CONFLICT (name) DO NOTHING;

INSERT INTO insurance_categories (slug, name, description, icon_name, is_active) VALUES
('life-insurance', 'Life Insurance', 'Comprehensive family financial protection and high-value term plans.', 'ShieldCheck', true),
('health-insurance', 'Health Insurance', '100% cashless hospitalization across 10,000+ empanelled healthcare centers.', 'HeartPulse', true),
('vehicle-insurance', 'Vehicle / Motor Insurance', 'Zero-depreciation instant repairs and 24x7 roadside assistance.', 'Car', true),
('business-insurance', 'Business & SME Insurance', 'Corporate asset shield, marine cargo, and group health policies.', 'Briefcase', true),
('travel-insurance', 'Travel Insurance', 'Global coverage for overseas trips, baggage loss, and medical emergencies.', 'Plane', true),
('loans', 'Loans & Financial Services', 'Instant approvals on Personal, Home, MSME, and Loan Against Property.', 'Banknote', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO network_hospitals (hospital_name, address, city, state, pincode, contact_number, cashless_available, specialties) VALUES
('Apollo Hospitals Jubilee Hills', 'Road No 72, Film Nagar, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', '+91 40 2360 7777', true, 'Cardiology, Oncology, Orthopedics, Critical Care'),
('KIMS Hospitals Secunderabad', '1-8-31/1, Minister Rd, Krishna Nagar Colony, Begumpet', 'Hyderabad', 'Telangana', '500003', '+91 40 4488 5000', true, 'Neurosciences, Organ Transplant, Nephrology'),
('Yashoda Hospitals Somajiguda', 'Raj Bhavan Rd, Matha Nagar, Somajiguda', 'Hyderabad', 'Telangana', '500082', '+91 40 4567 4567', true, 'Multi-specialty, Robotic Surgery, Pulmonology'),
('Care Hospitals Banjara Hills', 'Road No 1, Prem Nagar, Banjara Hills', 'Hyderabad', 'Telangana', '500034', '+91 40 6165 6565', true, 'Pediatrics, Emergency Care, Cardiac Sciences'),
('Manipal Hospital Old Airport Rd', '98, HAL Old Airport Rd, Kodihalli', 'Bangalore', 'Karnataka', '560017', '+91 80 2502 4444', true, 'Multi-specialty, Oncology, Gastro Sciences'),
('Fortis Hospital Bannerghatta', '154/9, Bannerghatta Main Rd, Opposite IIM-B', 'Bangalore', 'Karnataka', '560076', '+91 80 6621 4444', true, 'Interventional Cardiology, Spine Surgery, Urology')
ON CONFLICT DO NOTHING;
