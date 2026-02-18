-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- JW-XXXXXX format
  email TEXT NOT NULL UNIQUE,
  affiliation TEXT NOT NULL CHECK (affiliation IN ('student', 'faculty', 'staff', 'other')),
  research_area TEXT NOT NULL CHECK (research_area IN ('cs', 'is', 'ms', 'other')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  capture_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- QR LOCATIONS TABLE
-- ============================================
CREATE TABLE qr_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(), -- QR code value (UUID v4)
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  location_number INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_locations_code ON qr_locations(code);

-- ============================================
-- DAILY QR OUTCOMES TABLE
-- ============================================
CREATE TABLE daily_qr_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_location_id UUID NOT NULL REFERENCES qr_locations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('jaileon', 'bird')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(qr_location_id, date)
);

CREATE INDEX idx_daily_qr_outcomes_lookup ON daily_qr_outcomes(qr_location_id, date);

-- ============================================
-- SCANS TABLE
-- ============================================
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qr_location_id UUID NOT NULL REFERENCES qr_locations(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('jaileon', 'bird')),
  points_earned INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, qr_location_id, date) -- 1 user, 1 QR, 1 day
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_date ON scans(date);

-- ============================================
-- POINT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive or negative
  reason TEXT NOT NULL,
  balance_after INTEGER NOT NULL,
  admin_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);

-- ============================================
-- PRIVACY SCAN LOG (anonymous statistics)
-- ============================================
CREATE TABLE privacy_scan_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliation TEXT NOT NULL CHECK (affiliation IN ('student', 'faculty', 'staff', 'other')),
  research_area TEXT NOT NULL CHECK (research_area IN ('cs', 'is', 'ms', 'other')),
  location_number INTEGER NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_privacy_scan_log_scanned_at ON privacy_scan_log(scanned_at);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_qr_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_scan_log ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (our API uses service role key)
-- No additional policies needed since we use service_role key server-side
-- RLS is enabled as defense-in-depth; the anon key should not be exposed to client

-- ============================================
-- HELPER FUNCTION: Safe point update
-- ============================================
CREATE OR REPLACE FUNCTION update_user_points(
  p_user_id TEXT,
  p_amount INTEGER,
  p_reason TEXT,
  p_admin_id TEXT DEFAULT NULL
)
RETURNS TABLE(new_points INTEGER, new_balance_after INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_points INTEGER;
  v_new_points INTEGER;
BEGIN
  -- Lock the user row
  SELECT points INTO v_current_points
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  v_new_points := v_current_points + p_amount;

  -- Prevent negative balance
  IF v_new_points < 0 THEN
    RAISE EXCEPTION 'Insufficient points. Current: %, Requested: %', v_current_points, p_amount;
  END IF;

  -- Update user points
  UPDATE users SET points = v_new_points WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO point_transactions (user_id, amount, reason, balance_after, admin_id)
  VALUES (p_user_id, p_amount, p_reason, v_new_points, p_admin_id);

  RETURN QUERY SELECT v_new_points, v_new_points;
END;
$$;
