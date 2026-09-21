-- Migration: V13__sanitize_phone_numbers.sql
-- Description: Standardizes phone numbers across quote_inquiries, clients, and users.
-- Removes leading zeroes, non-digit characters, and ensures clean 10-digit Indian phone numbers.

-- 1. quote_inquiries: phone_number & secondary_phone
UPDATE quote_inquiries
SET phone_number = CASE
    WHEN regexp_replace(phone_number, '\D', '', 'g') ~ '^0' THEN substring(regexp_replace(phone_number, '\D', '', 'g') from 2)
    WHEN regexp_replace(phone_number, '\D', '', 'g') ~ '^91[6-9]\d{9}$' THEN substring(regexp_replace(phone_number, '\D', '', 'g') from 3)
    ELSE regexp_replace(phone_number, '\D', '', 'g')
END
WHERE phone_number IS NOT NULL AND phone_number <> '';

UPDATE quote_inquiries
SET secondary_phone = CASE
    WHEN regexp_replace(secondary_phone, '\D', '', 'g') ~ '^0' THEN substring(regexp_replace(secondary_phone, '\D', '', 'g') from 2)
    WHEN regexp_replace(secondary_phone, '\D', '', 'g') ~ '^91[6-9]\d{9}$' THEN substring(regexp_replace(secondary_phone, '\D', '', 'g') from 3)
    ELSE regexp_replace(secondary_phone, '\D', '', 'g')
END
WHERE secondary_phone IS NOT NULL AND secondary_phone <> '';

-- 2. clients: phone_number & whatsapp_number
UPDATE clients
SET phone_number = CASE
    WHEN regexp_replace(phone_number, '\D', '', 'g') ~ '^0' THEN substring(regexp_replace(phone_number, '\D', '', 'g') from 2)
    WHEN regexp_replace(phone_number, '\D', '', 'g') ~ '^91[6-9]\d{9}$' THEN substring(regexp_replace(phone_number, '\D', '', 'g') from 3)
    ELSE regexp_replace(phone_number, '\D', '', 'g')
END
WHERE phone_number IS NOT NULL AND phone_number <> '';

UPDATE clients
SET whatsapp_number = CASE
    WHEN regexp_replace(whatsapp_number, '\D', '', 'g') ~ '^0' THEN substring(regexp_replace(whatsapp_number, '\D', '', 'g') from 2)
    WHEN regexp_replace(whatsapp_number, '\D', '', 'g') ~ '^91[6-9]\d{9}$' THEN substring(regexp_replace(whatsapp_number, '\D', '', 'g') from 3)
    ELSE regexp_replace(whatsapp_number, '\D', '', 'g')
END
WHERE whatsapp_number IS NOT NULL AND whatsapp_number <> '';

-- 3. users: phone_number
UPDATE users
SET phone_number = CASE
    WHEN regexp_replace(phone_number, '\D', '', 'g') ~ '^0' THEN substring(regexp_replace(phone_number, '\D', '', 'g') from 2)
    WHEN regexp_replace(phone_number, '\D', '', 'g') ~ '^91[6-9]\d{9}$' THEN substring(regexp_replace(phone_number, '\D', '', 'g') from 3)
    ELSE regexp_replace(phone_number, '\D', '', 'g')
END
WHERE phone_number IS NOT NULL AND phone_number <> '';
