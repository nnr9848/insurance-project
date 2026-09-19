-- V10: Enterprise Manager Approvals & Governance Engine Schema

CREATE TABLE IF NOT EXISTS approval_requests (
    id BIGSERIAL PRIMARY KEY,
    request_type VARCHAR(60) NOT NULL, -- SPECIAL_DISCOUNT, LEAD_REASSIGNMENT, HIGH_SUM_INSURED, POLICY_CANCELLATION, CLIENT_ARCHIVE
    client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
    requested_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    current_value VARCHAR(255),
    proposed_value VARCHAR(255),
    discount_percent NUMERIC(5,2),
    target_advisor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(40) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reason TEXT NOT NULL,
    manager_review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_manager_id ON approval_requests(manager_id);
CREATE INDEX IF NOT EXISTS idx_approval_requested_by ON approval_requests(requested_by_id);
CREATE INDEX IF NOT EXISTS idx_approval_client_id ON approval_requests(client_id);

-- Seed Sample Pending Approvals for Manager review
INSERT INTO approval_requests (
    request_type, client_id, requested_by_id, manager_id, current_value, proposed_value, discount_percent, status, reason
) VALUES
('SPECIAL_DISCOUNT', 1, 3, 2, '₹16,756 (Base Quote)', '₹14,500 (15% Corporate Partner Discount)', 15.00, 'PENDING', 'High-net-worth client with 3 active policies in family. Requesting 15% special corporate discount.'),
('HIGH_SUM_INSURED', 2, 3, 2, 'Standard Cover (10L)', 'Ultra HNW Cover (1 Crore Sum Insured)', NULL, 'PENDING', 'Client requested Star Health Premier 1 Crore coverage. Requires Branch Manager sign-off before proposal issuance.'),
('LEAD_REASSIGNMENT', 3, 3, 2, 'Advisor: Suresh Verma', 'Advisor: Rajesh Kumar', NULL, 'PENDING', 'Suresh is on medical leave. Reassigning high-priority motor portfolio to Rajesh Kumar.');
