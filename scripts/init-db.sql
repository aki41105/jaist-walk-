-- JAIST Walk - Full Database Schema (combined from all migrations)
-- Run this on a fresh PostgreSQL database

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  affiliation TEXT NOT NULL CHECK (affiliation IN ('student', 'faculty', 'staff', 'other')),
  research_area TEXT NOT NULL CHECK (research_area IN ('cs', 'is', 'ms', 'other')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  capture_count INTEGER NOT NULL DEFAULT 0,
  avatar TEXT NOT NULL DEFAULT 'green',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);

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
  code UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
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
  outcome TEXT NOT NULL CHECK (outcome IN ('jaileon', 'yellow_jaileon', 'blue_jaileon', 'rainbow_jaileon', 'bird', 'golden_jaileon')),
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
  outcome TEXT NOT NULL CHECK (outcome IN ('jaileon', 'yellow_jaileon', 'blue_jaileon', 'rainbow_jaileon', 'bird', 'golden_jaileon')),
  points_earned INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, qr_location_id, date)
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_date ON scans(date);

-- ============================================
-- POINT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  balance_after INTEGER NOT NULL,
  admin_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);

-- ============================================
-- PRIVACY SCAN LOG
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
-- BADGES TABLE
-- ============================================
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ja TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

INSERT INTO badges (id, name_ja, name_en, description_ja, description_en, icon, sort_order) VALUES
  ('first_capture', '初捕獲', 'First Capture', '初めてジャイレオンを捕まえた', 'Caught your first Jaileon', '🎯', 1),
  ('captures_10', '10匹捕獲', '10 Captures', 'ジャイレオンを10匹捕まえた', 'Caught 10 Jaileons', '🏅', 2),
  ('captures_50', '50匹捕獲', '50 Captures', 'ジャイレオンを50匹捕まえた', 'Caught 50 Jaileons', '🏆', 3),
  ('rainbow_catch', '虹色ゲット', 'Rainbow Catch', '虹色ジャイレオンを捕まえた', 'Caught a Rainbow Jaileon', '🌈', 4),
  ('golden_catch', '金色ゲット', 'Golden Catch', '金色ジャイレオンを捕まえた', 'Caught a Golden Jaileon', '✨', 5),
  ('all_locations', '全ロケーション制覇', 'All Locations', '全てのアクティブロケーションを訪問', 'Visited all active locations', '🗺️', 6),
  ('streak_3', '3日連続', '3-Day Streak', '3日連続でスキャン', 'Scanned for 3 days in a row', '🔥', 7),
  ('streak_7', '7日連続', '7-Day Streak', '7日連続でスキャン', 'Scanned for 7 days in a row', '🔥', 8),
  ('streak_14', '14日連続', '14-Day Streak', '14日連続でスキャン', 'Scanned for 14 days in a row', '🔥', 9),
  ('streak_30', '30日連続', '30-Day Streak', '30日連続でスキャン', 'Scanned for 30 days in a row', '🔥', 10),
  ('points_1000', '1000pt達成', '1000 Points', '1000ポイント達成', 'Reached 1000 points', '💰', 11),
  ('points_5000', '5000pt達成', '5000 Points', '5000ポイント達成', 'Reached 5000 points', '💎', 12)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- REWARDS & EXCHANGES
-- ============================================
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ja TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  required_points INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'cancelled')),
  exchange_code TEXT UNIQUE NOT NULL,
  used_at TIMESTAMPTZ,
  admin_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exchanges_user ON exchanges(user_id);
CREATE INDEX idx_exchanges_code ON exchanges(exchange_code);

INSERT INTO rewards (name_ja, name_en, description_ja, description_en, required_points, stock)
VALUES ('ドリンク交換', 'Drink Exchange', 'お好きなドリンク1本と交換', 'Exchange for one drink of your choice', 1000, 50)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_user_points(
  p_user_id TEXT,
  p_amount INTEGER,
  p_reason TEXT,
  p_admin_id TEXT DEFAULT NULL
)
RETURNS TABLE(new_points INTEGER, new_balance_after INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_points INTEGER;
  v_new_points INTEGER;
BEGIN
  SELECT points INTO v_current_points
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  v_new_points := v_current_points + p_amount;

  IF v_new_points < 0 THEN
    RAISE EXCEPTION 'Insufficient points. Current: %, Requested: %', v_current_points, p_amount;
  END IF;

  UPDATE users SET points = v_new_points WHERE id = p_user_id;

  INSERT INTO point_transactions (user_id, amount, reason, balance_after, admin_id)
  VALUES (p_user_id, p_amount, p_reason, v_new_points, p_admin_id);

  RETURN QUERY SELECT v_new_points, v_new_points;
END;
$$;

CREATE OR REPLACE FUNCTION execute_exchange(p_user_id TEXT, p_reward_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_user RECORD;
  v_reward RECORD;
  v_exchange_id UUID;
  v_exchange_code TEXT;
  v_points_after INTEGER;
BEGIN
  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  SELECT * INTO v_reward FROM rewards WHERE id = p_reward_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'REWARD_NOT_FOUND';
  END IF;

  IF NOT v_reward.is_active THEN
    RAISE EXCEPTION 'REWARD_INACTIVE';
  END IF;

  IF v_user.points < v_reward.required_points THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  IF v_reward.stock <= 0 THEN
    RAISE EXCEPTION 'OUT_OF_STOCK';
  END IF;

  v_exchange_code := 'EX-' || upper(substr(md5(random()::text), 1, 6));

  v_points_after := v_user.points - v_reward.required_points;
  UPDATE users SET points = v_points_after WHERE id = p_user_id;

  UPDATE rewards SET stock = stock - 1 WHERE id = p_reward_id;

  INSERT INTO exchanges (user_id, reward_id, points_spent, exchange_code)
  VALUES (p_user_id, p_reward_id, v_reward.required_points, v_exchange_code)
  RETURNING id INTO v_exchange_id;

  INSERT INTO point_transactions (user_id, amount, reason, balance_after)
  VALUES (p_user_id, -v_reward.required_points, v_reward.name_ja || ' 交換', v_points_after);

  RETURN json_build_object(
    'exchange_id', v_exchange_id,
    'exchange_code', v_exchange_code,
    'points_after', v_points_after
  );
END;
$$;
