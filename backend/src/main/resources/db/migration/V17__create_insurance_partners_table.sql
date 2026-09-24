-- V17__create_insurance_partners_table.sql
-- Master Table for Insurance Partners & Redirection Engine (Admin-Configurable)

CREATE TABLE IF NOT EXISTS insurance_partners (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- 'health', 'life', 'general'
    logo_url TEXT,
    logo_key VARCHAR(80), -- Fallback key to local bundled assets (e.g. 'starHealth', 'hdfcErgo')
    redirect_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_insurance_partners_active_order ON insurance_partners (is_active, display_order);

-- Seed Initial 20 Leading IRDAI Insurers
INSERT INTO insurance_partners (name, category, logo_key, redirect_url, display_order, is_active)
VALUES
    ('Star Health Insurance', 'health', 'starHealthLogo', 'https://www.starhealth.in/', 1, TRUE),
    ('HDFC ERGO', 'general', 'hdfcErgoLogo', 'https://www.hdfcergo.com/', 2, TRUE),
    ('ICICI Lombard', 'general', 'iciciLombardLogo', 'https://www.icicilombard.com/', 3, TRUE),
    ('Care Health Insurance', 'health', 'careHealthLogo', 'https://www.careinsurance.com/', 4, TRUE),
    ('TATA AIG Insurance', 'general', 'tataAigLogo', 'https://www.tataaig.com/', 5, TRUE),
    ('Bajaj Allianz', 'general', 'bajajAllianzLogo', 'https://www.bajajallianz.com/', 6, TRUE),
    ('Niva Bupa Health', 'health', 'nivaBupaLogo', 'https://www.nivabupa.com/', 7, TRUE),
    ('SBI General Insurance', 'general', 'sbiGeneralLogo', 'https://www.sbigeneral.in/', 8, TRUE),
    ('Life Insurance Corporation (LIC)', 'life', 'licLogo', 'https://licindia.in/', 9, TRUE),
    ('Max Life Insurance', 'life', 'axisMaxLogo', 'https://www.maxlifeinsurance.com/', 10, TRUE),
    ('Aditya Birla Capital', 'life', 'adityaBirlaLogo', 'https://www.adityabirlacapital.com/', 11, TRUE),
    ('Reliance General Insurance', 'general', 'relianceGeneralLogo', 'https://www.reliancegeneral.co.in/', 12, TRUE),
    ('Digit Insurance', 'general', 'digitLogo', 'https://www.godigit.com/', 13, TRUE),
    ('Kotak General Insurance', 'general', 'kotakGeneralLogo', 'https://www.kotakgeneral.com/', 14, TRUE),
    ('ManipalCigna Health', 'health', 'manipalCignaLogo', 'https://www.manipalcigna.com/', 15, TRUE),
    ('Chola MS General Insurance', 'general', 'cholaMsLogo', 'https://www.cholainsurance.com/', 16, TRUE),
    ('Future Generali', 'general', 'futureGeneraliLogo', 'https://general.futuregenerali.in/', 17, TRUE),
    ('Magma HDI General', 'general', 'magmaHdiLogo', 'https://www.magmahdi.com/', 18, TRUE),
    ('National Insurance', 'general', 'nationalInsuranceLogo', 'https://nationalinsurance.nic.co.in/', 19, TRUE),
    ('Oriental Insurance', 'general', 'orientalInsuranceLogo', 'https://orientalinsurance.org.in/', 20, TRUE)
ON CONFLICT (name) DO NOTHING;
