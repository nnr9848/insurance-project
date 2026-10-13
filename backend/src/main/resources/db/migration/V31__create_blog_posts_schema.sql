-- V31: Create blog_posts table for organic SEO marketing and educational articles

CREATE TABLE IF NOT EXISTS blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(350) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Health Insurance',
    cover_image_url VARCHAR(600),
    author_name VARCHAR(120) DEFAULT 'Aadhiraksha Research Desk',
    read_time_minutes INT DEFAULT 5,
    is_published BOOLEAN DEFAULT true,
    meta_title VARCHAR(300),
    meta_description TEXT,
    view_count BIGINT DEFAULT 0,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (is_published);

-- Seed Initial High-Intent SEO Pillar Articles
INSERT INTO blog_posts (title, slug, summary, content, category, cover_image_url, author_name, read_time_minutes, is_published, meta_title, meta_description)
VALUES
(
    'How to Port Your Health Insurance Policy Without Losing Waiting Period Credits',
    'how-to-port-health-insurance-policy-guide',
    'A step-by-step IRDAI regulatory guide to transferring your existing health plan to a new insurer while preserving all cumulative bonus and pre-existing disease continuity.',
    '## Why Port Your Health Insurance Policy?

Many policyholders assume that if their current health insurance company increases renewal premiums or provides sub-par claim service, they are stuck forever. Fortunately, under IRDAI guidelines, every insured citizen has the legal right to **port their policy to any insurer of choice** without restarting their waiting periods.

### What Continuity Benefits Transfer When You Port?
1. **Pre-Existing Disease (PED) Waiting Period**: If you have already completed 3 or 4 years under your current policy, the new insurer must recognize those years. You do not start at Year 1 again.
2. **Specific Illness Waiting Period**: 2-year waiting periods for treatments like cataract, hernia, joint replacement, or kidney stones carry over.
3. **Cumulative Bonus (No-Claim Bonus)**: Your accrued bonus can be mapped into higher sum insured slabs.

### The 45-Day IRDAI Rule You Must Know
You must submit your porting application at least **45 days prior to your policy renewal date**. If you apply later than this window, the insurer may decline the porting request or mandate fresh underwriting checkups.

### Checklist of Documents Required:
* Current Policy Certificate (Previous 3-4 years continuous coverage documents)
* Age proof and KYC documents (Aadhaar / PAN)
* Detailed claim history statements (if any claims were filed)
* Medical discharge summaries for any past hospitalizations

### How Aadhiraksha Manages Porting For You
At Aadhiraksha, our dedicated Porting Desk handles the insurer coordination, medical documentation audit, and IRDAI portal upload with zero commission surcharges.',
    'Health Insurance',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=630&q=80',
    'Aadhiraksha Advisory Team',
    6,
    true,
    'How to Port Health Insurance in India | IRDAI Porting Guide 2026',
    'Learn how to port your health insurance policy smoothly under IRDAI rules without losing your pre-existing disease waiting period and cumulative bonus.'
),
(
    'Cashless vs Reimbursement Hospital Claims: Which Saves You More Stress?',
    'cashless-vs-reimbursement-hospital-claims-explained',
    'Understand how instant TPA pre-authorization works during medical emergencies versus reimbursement filing, and how to avoid claim deduction surprises.',
    '## The Financial Realities of Hospital Billing

When medical emergencies strike, the last thing any family wants to handle is settling five-figure hospital bills out of pocket and chasing insurers for reimbursement months later.

### Cashless Hospitalization: How It Works
In a cashless admission, the insurance company or Third-Party Administrator (TPA) settles eligible medical expenses directly with the network hospital. 

* **Step 1 - Pre-Authorization**: The hospital insurance desk submits a pre-auth form with estimated costs to the insurer.
* **Step 2 - Initial Approval**: Under IRDAI circulars, initial approval is issued within 60 minutes for planned admissions and immediate priority for emergency cases.
* **Step 3 - Final Discharge**: Upon discharge, the final medical summary is audited and settled directly.

### Reimbursement: When Is It Necessary?
If you are treated at a hospital outside your insurer’s empanelled network, you must pay upfront and submit original bills, discharge summaries, pharmacy vouchers, and diagnostic reports within 15 to 30 days of discharge.

### Top Reasons Why Reimbursement Claims Get Delayed:
1. Missing doctor prescriptions matching pharmacy receipts.
2. Unclear discharge summaries omitting exact onset dates of illness.
3. Non-medical consumable deductions (gloves, PPE kits, admission kits).

### How Aadhiraksha Concierge Protects You
We maintain direct contact lines with TPA desks across thousands of network hospitals in India to guarantee zero out-of-pocket stress.',
    'Claims & Cashless',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&h=630&q=80',
    'Claims Concierge Desk',
    5,
    true,
    'Cashless vs Reimbursement Health Insurance Claims Explained',
    'Compare cashless and reimbursement claim settlement processes. Discover how cashless pre-auth works and how to avoid claim deduction deductions.'
),
(
    'Comprehensive vs Zero Depreciation Car Insurance: Why Bumper-to-Bumper Matters',
    'zero-depreciation-vs-comprehensive-car-insurance',
    'Discover why standard car insurance covers only 50% of plastic and fiber replacement costs, and how Zero Dep add-on pays 100% of body repair bills.',
    '## Why Standard Motor Insurance Can Leave You With Heavy Repair Bills

Many vehicle owners believe having a "comprehensive" policy means the insurer pays 100% of accident repair bills. However, standard policies enforce steep depreciation deductions on replacement parts under Indian Motor Tariff norms.

### How Depreciation Affects Your Claim Payout
* **Rubber, Nylon, Plastic Parts & Batteries**: 50% depreciation deduction.
* **Fiberglass Components**: 30% depreciation deduction.
* **Glass Parts**: 0% deduction.
* **Metal Parts**: Scales from 5% up to 50% depending on the vehicle age.

### The Zero Depreciation (Bumper-to-Bumper) Shield
With a **Zero Depreciation add-on cover**, the insurer waives all depreciation deductions on replaced parts. You only pay the mandatory statutory compulsory deductible (typically ₹1,000 for private cars up to 1500cc, ₹2,000 above 1500cc).

### Recommended Add-ons for New & Premium Vehicles:
1. **Engine & Gearbox Protector**: Essential for waterlogging and hydrostatic lock damage during monsoons.
2. **Consumables Cover**: Covers engine oil, nuts, bolts, coolant, and grease which are otherwise excluded.
3. **Return to Invoice (RTI)**: Pays the full original ex-showroom price plus road tax in case of total loss or theft.

### Get Instant Quotes Across Top Insurers
Aadhiraksha lets you compare Digit, HDFC ERGO, ICICI Lombard, and Tata AIG with instant quotes and paperless inspection.',
    'Motor Insurance',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&h=630&q=80',
    'Motor Advisory Desk',
    4,
    true,
    'Zero Depreciation vs Comprehensive Car Insurance Comparison 2026',
    'Find out why Zero Dep bumper-to-bumper car insurance saves you thousands during accident repairs compared to standard comprehensive policies.'
),
(
    'Term Life Insurance in Your 20s vs 30s: The Hidden Cost of Delaying',
    'term-life-insurance-cost-of-delay-20s-vs-30s',
    'Why locking in your pure term insurance cover early guarantees the lowest fixed premium for 40 years and protects your family against sudden life risks.',
    '## The Math Behind Term Insurance Premiums

Pure term insurance is the most cost-effective way to secure high financial coverage for your dependents. Unlike ULIPs or endowment schemes, 100% of your premium goes toward risk protection.

### Why Buying at Age 25 vs 35 Makes a Huge Difference
* A healthy 25-year-old non-smoker can lock in a ₹1 Crore term plan up to age 65 for approximately **₹600 to ₹750 per month**.
* Waiting until age 35 for the exact same coverage increases premiums to **₹1,200 to ₹1,600 per month**.
* Over a 30-year policy term, delaying by just 10 years results in paying **over ₹2.5 to ₹3 Lakhs more** in lifetime premiums for the exact same ₹1 Crore cover.

### The Critical Medical Underwriting Factor
In your 20s, you are statistically least likely to have lifestyle conditions such as hypertension, elevated blood sugar, or thyroid irregularities. Once diagnosed, insurers may:
* Impose permanent premium loadings (25% to 50% extra cost).
* Exclude specific critical illnesses.
* Or outright reject the proposal.

### Essential Riders to Attach to Your Term Policy:
1. **Critical Illness Rider**: Lumpsum payout upon diagnosis of 30+ major ailments including heart attack, cancer, and stroke.
2. **Accidental Total & Permanent Disability Rider**: Waives future premiums while continuing active coverage.

Speak to an Aadhiraksha certified life advisor today to calculate your ideal Human Life Value (HLV).',
    'Life & Savings',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&h=630&q=80',
    'Life & Financial Planning Desk',
    5,
    true,
    'Term Life Insurance in 20s vs 30s: Complete Cost of Delay Guide',
    'Understand why buying term life insurance in your 20s locks in the lowest lifetime premiums and protects your family against financial uncertainties.'
)
ON CONFLICT (slug) DO NOTHING;
