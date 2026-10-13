-- V30: Add photo_url and secondary_phone (Internal Emergency Contact) to network_hospitals

ALTER TABLE network_hospitals 
ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(30);

-- Populate secondary_phone (Emergency 24x7 desk) for existing premier hospital records if null
UPDATE network_hospitals 
SET secondary_phone = '+91 821 256 8999' 
WHERE hospital_name LIKE 'Apollo BGS%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 80 2502 4499' 
WHERE hospital_name LIKE 'Manipal Hospital%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 80 6621 4499' 
WHERE hospital_name LIKE 'Fortis Hospital%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 80 7122 2299' 
WHERE hospital_name LIKE 'Narayana Institute%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 80 4344 0499' 
WHERE hospital_name LIKE 'Aster CMI%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 40 2360 7799' 
WHERE hospital_name LIKE 'Apollo Hospitals Jubilee%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 40 4488 5099' 
WHERE hospital_name LIKE 'KIMS Hospitals%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 40 4567 4599' 
WHERE hospital_name LIKE 'Yashoda Hospitals%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 40 6165 6599' 
WHERE hospital_name LIKE 'Care Hospitals%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 40 4244 4299' 
WHERE hospital_name LIKE 'AIG Hospitals%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 22 4269 6999' 
WHERE hospital_name LIKE 'Kokilaben%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 11 2651 5099' 
WHERE hospital_name LIKE 'Max Super Speciality%' AND (secondary_phone IS NULL OR secondary_phone = '');

UPDATE network_hospitals 
SET secondary_phone = '+91 124 414 1499' 
WHERE hospital_name LIKE 'Medanta%' AND (secondary_phone IS NULL OR secondary_phone = '');
