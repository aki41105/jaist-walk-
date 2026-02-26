-- Point Exchange / Rewards system

CREATE TABLE IF NOT EXISTS rewards (
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

CREATE TABLE IF NOT EXISTS exchanges (
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

CREATE INDEX IF NOT EXISTS idx_exchanges_user ON exchanges(user_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_code ON exchanges(exchange_code);

-- RPC: execute_exchange
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
  -- Lock user row
  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  -- Lock reward row
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

  -- Generate exchange code: EX-XXXXXX
  v_exchange_code := 'EX-' || upper(substr(md5(random()::text), 1, 6));

  -- Deduct points
  v_points_after := v_user.points - v_reward.required_points;
  UPDATE users SET points = v_points_after WHERE id = p_user_id;

  -- Decrease stock
  UPDATE rewards SET stock = stock - 1 WHERE id = p_reward_id;

  -- Create exchange record
  INSERT INTO exchanges (user_id, reward_id, points_spent, exchange_code)
  VALUES (p_user_id, p_reward_id, v_reward.required_points, v_exchange_code)
  RETURNING id INTO v_exchange_id;

  -- Record point transaction
  INSERT INTO point_transactions (user_id, amount, reason, balance_after)
  VALUES (p_user_id, -v_reward.required_points, v_reward.name_ja || ' 交換', v_points_after);

  RETURN json_build_object(
    'exchange_id', v_exchange_id,
    'exchange_code', v_exchange_code,
    'points_after', v_points_after
  );
END;
$$;

-- Seed: drink reward
INSERT INTO rewards (name_ja, name_en, description_ja, description_en, required_points, stock)
VALUES ('ドリンク交換', 'Drink Exchange', 'お好きなドリンク1本と交換', 'Exchange for one drink of your choice', 1000, 50)
ON CONFLICT DO NOTHING;
