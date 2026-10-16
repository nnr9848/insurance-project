-- V41: Add Complete Legal & Compliance CMS fields for all tabs and page hero to business_profile
ALTER TABLE business_profile
    -- Page Hero Header
    ADD COLUMN IF NOT EXISTS legal_page_badge VARCHAR(100) DEFAULT 'Legal & Regulatory Governance',
    ADD COLUMN IF NOT EXISTS legal_page_hero_title TEXT DEFAULT 'Trust, Transparency & Compliance',
    ADD COLUMN IF NOT EXISTS legal_page_hero_subtitle TEXT DEFAULT 'Aadhiraksha Insurance & Financial Services Pvt Ltd adheres strictly to the regulations and consumer protection guidelines established by the Insurance Regulatory and Development Authority of India (IRDAI).',

    -- Tab 1: Privacy Policy
    ADD COLUMN IF NOT EXISTS legal_privacy_last_updated VARCHAR(100) DEFAULT 'January 2026 | Effective immediately',
    ADD COLUMN IF NOT EXISTS legal_privacy_sec1_heading VARCHAR(255) DEFAULT '1. Commitment to Privacy',
    ADD COLUMN IF NOT EXISTS legal_privacy_sec1_body TEXT DEFAULT 'At Aadhiraksha Insurance & Financial Services Pvt Ltd ("Aadhiraksha", "we", "us", or "our"), we respect your privacy and are committed to protecting the personal data and financial information you share with us through our website, mobile interface, POSP portal, and client assistance desks.',
    ADD COLUMN IF NOT EXISTS legal_privacy_sec2_heading VARCHAR(255) DEFAULT '2. Information We Collect',
    ADD COLUMN IF NOT EXISTS legal_privacy_sec2_body TEXT DEFAULT 'To provide accurate insurance quotes, process policy issuance, execute renewals, and manage claim intimations, we collect personal identity details, vehicle specs, and lifestyle metrics.',
    ADD COLUMN IF NOT EXISTS legal_privacy_sec3_heading VARCHAR(255) DEFAULT '3. How Your Information is Used',
    ADD COLUMN IF NOT EXISTS legal_privacy_sec3_body TEXT DEFAULT 'Your data is strictly utilized to generate real-time comparison quotes from our empanelled IRDAI-licensed insurance partners, verify eligibility, transmit necessary underwriting information for policy binding, facilitate cashless hospitalizations/garage approvals, and deliver automated policy renewal reminders.',
    ADD COLUMN IF NOT EXISTS legal_privacy_sec4_heading VARCHAR(255) DEFAULT '4. Zero-Spam & Data Security Guarantee',
    ADD COLUMN IF NOT EXISTS legal_privacy_sec4_body TEXT DEFAULT 'We do not sell, rent, or trade your personal information to third-party marketing brokers. All database transmissions are encrypted using enterprise-grade SSL/TLS protocols with role-based cryptographic access controls.',

    -- Tab 2: Terms of Service
    ADD COLUMN IF NOT EXISTS legal_terms_last_updated VARCHAR(100) DEFAULT 'Agreement for Platform Usage & Quote Inquiries',
    ADD COLUMN IF NOT EXISTS legal_terms_sec1_heading VARCHAR(255) DEFAULT '1. Acceptance of Terms',
    ADD COLUMN IF NOT EXISTS legal_terms_sec1_body TEXT DEFAULT 'By accessing, browsing, or submitting quotation/claim forms on the Aadhiraksha portal, you agree to be bound by these Terms of Service, applicable laws, and regulatory guidelines set forth by the IRDAI.',
    ADD COLUMN IF NOT EXISTS legal_terms_sec2_heading VARCHAR(255) DEFAULT '2. Role of Aadhiraksha Insurance',
    ADD COLUMN IF NOT EXISTS legal_terms_sec2_body TEXT DEFAULT 'Aadhiraksha functions as a licensed insurance intermediary facilitating price comparison, pre-sales advisory, and post-sales claims assistance. The contract of insurance is strictly between the insured customer and the respective insurance underwriter (e.g., Star Health, HDFC ERGO, ICICI Lombard, TATA AIG, LIC, etc.).',
    ADD COLUMN IF NOT EXISTS legal_terms_sec3_heading VARCHAR(255) DEFAULT '3. Accuracy of Declarations (Utmost Good Faith)',
    ADD COLUMN IF NOT EXISTS legal_terms_sec3_body TEXT DEFAULT 'Insurance contracts in India operate under the doctrine of Uberrima Fides (Utmost Good Faith). It is the sole responsibility of the policyholder to provide true, complete, and accurate declarations regarding pre-existing medical conditions, vehicle modifications, prior claims, and age. Any misrepresentation or suppression of material facts may result in rejection of claims by the insurer under Section 45 of the Insurance Act, 1938.',

    -- Tab 3: IRDAI Statutory Disclaimers
    ADD COLUMN IF NOT EXISTS legal_disclaimer_subtitle VARCHAR(255) DEFAULT 'Mandated Public Disclosures under Insurance Act, 1938',
    ADD COLUMN IF NOT EXISTS legal_disclaimer_sec41_title VARCHAR(255) DEFAULT '⚠️ Section 41 of the Insurance Act, 1938 (Prohibition of Rebates):',
    ADD COLUMN IF NOT EXISTS legal_disclaimer_sec41_body TEXT DEFAULT '(1) No person shall allow or offer to allow, either directly or indirectly, as an inducement to any person to take out or renew or continue an insurance in respect of any kind of risk relating to lives or property in India, any rebate of the whole or part of the commission payable or any rebate of the premium shown on the policy, nor shall any person taking out or renewing or continuing a policy accept any rebate, except such rebate as may be allowed in accordance with the published prospectuses or tables of the insurer.\n\n(2) Any person making default in complying with the provisions of this section shall be liable for a penalty which may extend to ten lakh rupees.',
    ADD COLUMN IF NOT EXISTS legal_disclaimer_solicitation_text TEXT DEFAULT 'Product information, premiums, discounts, and benefits displayed on this platform are indicative and based on data provided by respective insurance companies. Please read the policy sales brochure and wording carefully before concluding any sale.',
    ADD COLUMN IF NOT EXISTS legal_disclaimer_tax_text TEXT DEFAULT 'Tax deductions under Section 80C, 80D, and exemptions under Section 10(10D) of the Income Tax Act, 1961 are subject to prevailing provisions and amendments in tax laws. Clients are advised to consult their qualified tax advisor.';
