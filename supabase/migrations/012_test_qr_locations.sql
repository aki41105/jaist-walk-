-- Add is_test flag to qr_locations for unlimited daily scans
ALTER TABLE qr_locations ADD COLUMN is_test BOOLEAN NOT NULL DEFAULT false;
