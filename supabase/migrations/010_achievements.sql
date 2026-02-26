-- Badges / Achievements system

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ja TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- Seed 12 badges
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
