-- V9: Enhanced Document Collection, Verification Status & File Metadata

ALTER TABLE client_documents ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0;
ALTER TABLE client_documents ADD COLUMN IF NOT EXISTS file_type VARCHAR(100) DEFAULT 'application/pdf';
ALTER TABLE client_documents ADD COLUMN IF NOT EXISTS verification_status VARCHAR(40) DEFAULT 'PENDING_REVIEW'; -- PENDING_REVIEW, VERIFIED, REJECTED
ALTER TABLE client_documents ADD COLUMN IF NOT EXISTS verified_by BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE client_documents ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE client_documents ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_client_docs_verification ON client_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_client_docs_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_docs_doc_type ON client_documents(document_type);

-- Insert Sample KYC & Proposal Documents for Client #1 (if client #1 exists)
INSERT INTO client_documents (client_id, document_type, file_name, file_url, file_size_bytes, file_type, verification_status, uploaded_by)
SELECT 
    d.client_id, d.document_type, d.file_name, d.file_url, d.file_size_bytes, d.file_type, d.verification_status, d.uploaded_by
FROM (
    VALUES
    (1, 'AADHAAR', 'Aadhaar_Card_AhmedAli_Verified.pdf', 'https://storage.googleapis.com/aadhiraksha-kyc/sample-aadhaar.pdf', 1245000, 'application/pdf', 'VERIFIED', 3),
    (1, 'PAN', 'PAN_Card_AhmedAli.pdf', 'https://storage.googleapis.com/aadhiraksha-kyc/sample-pan.pdf', 980000, 'application/pdf', 'VERIFIED', 3),
    (1, 'PREVIOUS_POLICY', 'Star_Health_Optima_2025_Policy.pdf', 'https://storage.googleapis.com/aadhiraksha-kyc/sample-policy.pdf', 2480000, 'application/pdf', 'VERIFIED', 3),
    (1, 'MEDICAL_RECORD', 'Annual_Health_Checkup_Discharge_Summary.pdf', 'https://storage.googleapis.com/aadhiraksha-kyc/sample-medical.pdf', 3150000, 'application/pdf', 'PENDING_REVIEW', 3)
) AS d(client_id, document_type, file_name, file_url, file_size_bytes, file_type, verification_status, uploaded_by)
WHERE EXISTS (SELECT 1 FROM clients WHERE id = 1);
