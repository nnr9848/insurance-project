-- V7: Soft-Delete Support for Network Hospitals and Data Integrity Standard
ALTER TABLE network_hospitals ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index for high performance active hospital search
CREATE INDEX IF NOT EXISTS idx_hospitals_is_active ON network_hospitals(is_active);
CREATE INDEX IF NOT EXISTS idx_hospitals_city_active ON network_hospitals(city, is_active);
