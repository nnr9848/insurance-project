-- V36: Create Sales Contests, Campaigns & Sales Kit Schema

CREATE TABLE IF NOT EXISTS sales_contests (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    contest_type VARCHAR(50) NOT NULL DEFAULT 'TRIP', -- TRIP, COMMISSION_BONUS, COLLATERAL_FLYER, RECOGNITION
    sponsor_insurer VARCHAR(100) DEFAULT 'Aadhiraksha', -- Aadhiraksha, HDFC ERGO, Star Health, Tata AIG, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_metric_type VARCHAR(50) DEFAULT 'GWP_AMOUNT', -- GWP_AMOUNT, POLICY_COUNT, OPEN
    target_value NUMERIC(15, 2) DEFAULT 0.00,
    reward_description TEXT,
    banner_image_url TEXT,
    brochure_doc_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_contests_dates ON sales_contests(start_date, end_date, is_active);
CREATE INDEX IF NOT EXISTS idx_sales_contests_type ON sales_contests(contest_type);

-- Seed Sample High-Impact Industry Standard Contests
INSERT INTO sales_contests (
    title, description, contest_type, sponsor_insurer, start_date, end_date, 
    target_metric_type, target_value, reward_description, banner_image_url, is_active
) VALUES 
(
    'Goa Beach Leadership Retreat 2026',
    'Achieve ₹4,50,000 in Gross Written Premium (GWP) across Health and Motor policies to qualify for an all-inclusive 3-Day/2-Night luxury beach resort getaway with leadership masterclasses.',
    'TRIP',
    'Aadhiraksha',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '45 days',
    'GWP_AMOUNT',
    450000.00,
    '3D/2N 5-Star Luxury Resort in South Goa + Roundtrip Airfare + Gala Night Entry',
    '/assets/business_travel_hero-Cawe5Ez4.jpg',
    true
),
(
    'Festive Health Booster: Extra 4% Commission',
    'Sell a minimum of 8 Comprehensive Family Health Floater policies with Star Health or Care Health to unlock an instant 4% commission booster on your standard payout tier.',
    'COMMISSION_BONUS',
    'Star Health Insurance',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'POLICY_COUNT',
    8.00,
    'Flat +4% Additional Payout Bonus credited on monthly reconciliation cycle',
    NULL,
    true
),
(
    'Dubai International Achievers Summit',
    'Exclusive annual international convention for our top 25 POSP partners and staff advisors delivering ₹15 Lakhs+ annual premium portfolio.',
    'TRIP',
    'HDFC ERGO General Insurance',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '75 days',
    'GWP_AMOUNT',
    1500000.00,
    '4D/3N International Dubai Experience + Desert Safari + Awards Banquet',
    '/assets/business_hero-DZQ3SAhf.jpg',
    true
)
ON CONFLICT DO NOTHING;
