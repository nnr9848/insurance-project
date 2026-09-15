-- V3: Seed Comprehensive Demo Network Hospitals matching aadhirakshainsurance.com directory

INSERT INTO network_hospitals (hospital_name, address, city, state, pincode, contact_number, cashless_available, specialties) VALUES
-- Karnataka
('Apollo BGS Hospitals', 'Adichunchanagiri Road, Kuvempunagar', 'Mysore', 'Karnataka', '570023', '+91 821 256 8888', true, 'Cardiology, Neurosciences, Nephrology, Emergency 24/7'),
('Manipal Hospital Old Airport Rd', '98, HAL Old Airport Rd, Kodihalli', 'Bangalore', 'Karnataka', '560017', '+91 80 2502 4444', true, 'Multi-specialty, Oncology, Gastro Sciences, Organ Transplant'),
('Fortis Hospital Bannerghatta', '154/9, Bannerghatta Main Rd, Opposite IIM-B', 'Bangalore', 'Karnataka', '560076', '+91 80 6621 4444', true, 'Interventional Cardiology, Spine Surgery, Urology, Orthopedics'),
('Narayana Institute of Cardiac Sciences', '258/A, Bommasandra Industrial Area, Anekal Taluk', 'Bangalore', 'Karnataka', '560099', '+91 80 7122 2222', true, 'Cardiac Surgery, Pediatric Cardiology, Vascular Surgery'),
('Aster CMI Hospital', 'No. 43/42, NH 44, Sahakar Nagar, Hebbal', 'Bangalore', 'Karnataka', '560092', '+91 80 4344 0400', true, 'Robotic Surgery, Liver Care, Neurology, Pulmonology'),
('Columbia Asia Referral Hospital', '26/4, Brigade Gateway, Malleshwaram West', 'Bangalore', 'Karnataka', '560055', '+91 80 3989 8969', true, 'Obstetrics & Gynecology, Bariatric Surgery, ENT'),

-- Telangana
('Apollo Hospitals Jubilee Hills', 'Jubilee Hills, Road No 72, Film Nagar', 'Hyderabad', 'Telangana', '500033', '+91 40 2360 7777', true, 'Cardiology, Oncology, Orthopedics, Critical Care 24/7'),
('KIMS Hospitals Secunderabad', '1-8-31/1, Minister Rd, Krishna Nagar Colony, Begumpet', 'Hyderabad', 'Telangana', '500003', '+91 40 4488 5000', true, 'Neurosciences, Organ Transplant, Nephrology, Trauma'),
('Yashoda Hospitals Somajiguda', 'Raj Bhavan Rd, Matha Nagar, Somajiguda', 'Hyderabad', 'Telangana', '500082', '+91 40 4567 4567', true, 'Multi-specialty, Robotic Surgery, Pulmonology, Cancer Institute'),
('Care Hospitals Banjara Hills', 'Road No 1, Prem Nagar, Banjara Hills', 'Hyderabad', 'Telangana', '500034', '+91 40 6165 6565', true, 'Pediatrics, Emergency Care, Cardiac Sciences, Dermatology'),
('Continental Hospitals', 'Plot No. 3, Road No. 2, IT & Financial District, Nanakramguda, Gachibowli', 'Hyderabad', 'Telangana', '500032', '+91 40 6700 0000', true, 'Critical Care, Gastroenterology, Oncology, Joint Replacement'),
('AIG Hospitals Gachibowli', '1-66/AIG/1 to 4, Mindspace Rd, Gachibowli', 'Hyderabad', 'Telangana', '500032', '+91 40 4244 4222', true, 'Medical Gastroenterology, Hepatology, GI Oncology'),

-- Andhra Pradesh
('Apollo Hospitals Visakhapatnam', 'Waltair Main Road, Maharanipeta', 'Visakhapatnam', 'Andhra Pradesh', '530002', '+91 891 272 7272', true, 'Cardiology, Emergency, Neurology, Orthopedics'),
('Care Hospitals Ram Nagar', 'AS Raja Complex, Waltair Main Rd, Ram Nagar', 'Visakhapatnam', 'Andhra Pradesh', '530002', '+91 891 304 1444', true, 'Cardiology, General Surgery, Nephrology, Urology'),
('Manipal Hospital Vijayawada', 'Kanakadurga Varadhi, Tadepalli, Guntur Rd', 'Vijayawada', 'Andhra Pradesh', '522501', '+91 866 249 9999', true, 'Cardiac Sciences, Renal Sciences, Critical Care, Trauma'),
('Ramesh Hospitals Guntur', 'Collector Office Road, Nagarampalem', 'Guntur', 'Andhra Pradesh', '522004', '+91 863 237 7777', true, 'Cardiology, Cardiothoracic Surgery, Emergency'),
('Apollo Hospitals Nellore', '16/111/1133, Muttukur Road, Ramamurthy Nagar', 'Nellore', 'Andhra Pradesh', '524003', '+91 861 234 4444', true, 'Trauma & Orthopedics, Cardiology, General Medicine'),

-- Maharashtra
('Kokilaben Dhirubhai Ambani Hospital', 'Rao Saheb, Achutrao Patwardhan Marg, Four Bungalows, Andheri West', 'Mumbai', 'Maharashtra', '400053', '+91 22 4269 6969', true, 'Robotic Surgery, Childrens Heart Centre, Neuro Sciences'),
('Fortis Hospital Mulund', 'Mulund Goregaon Link Rd, Nahur West, Industrial Area, Mulund West', 'Mumbai', 'Maharashtra', '400078', '+91 22 4365 4365', true, 'Heart Transplants, Emergency, Oncology, Orthopedics'),
('Ruby Hall Clinic', '40, Sassoon Road, Sangamvadi', 'Pune', 'Maharashtra', '411001', '+91 20 6645 5100', true, 'Cardiology, Neurology, Organ Transplant, Oncology'),
('Jupiter Hospital Baner', 'Near Prathamesh Park, Pune-Bangalore Highway, Baner', 'Pune', 'Maharashtra', '411045', '+91 20 2799 2200', true, 'Multi-Specialty, Pediatric Cardiac, Bone & Joint'),

-- Tamil Nadu
('Apollo Hospitals Greams Road', '21, Greams Lane, Off Greams Road, Thousand Lights', 'Chennai', 'Tamil Nadu', '600006', '+91 44 2829 0200', true, 'Cardiology, Oncology, Organ Transplants, Orthopedics'),
('Gleneagles Global Health City', '439, Cheran Nagar, Perumbakkam', 'Chennai', 'Tamil Nadu', '600100', '+91 44 4477 7000', true, 'Liver Transplant, HPB Surgery, Neuro Sciences, Cardiac Care'),
('G. Kuppuswamy Naidu Memorial Hospital', 'Post Box No. 6327, Nethaji Road, Pappanaickenpalayam', 'Coimbatore', 'Tamil Nadu', '641037', '+91 422 432 3800', true, 'Cardiology, Oncology, Pediatrics, Nephrology'),

-- Delhi NCR
('Max Super Speciality Hospital Saket', '1, 2, Press Enclave Marg, Saket', 'New Delhi', 'Delhi', '110017', '+91 11 2651 5050', true, 'Cancer Care, Cardiac Sciences, Neurosciences, Orthopedics'),
('Medanta - The Medicity', 'CH Bakhtawar Singh Rd, Near Rajiv Chowk, Sector 38', 'Gurugram', 'Haryana', '122001', '+91 124 414 1414', true, 'Heart Institute, Kidney & Urology, Bone & Joint, Cancer Institute')
ON CONFLICT DO NOTHING;
