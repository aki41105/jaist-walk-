-- Add password_hash column (NULL for existing users who haven't set a password yet)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update outcome CHECK constraint on daily_qr_outcomes to new character IDs
ALTER TABLE daily_qr_outcomes DROP CONSTRAINT IF EXISTS daily_qr_outcomes_outcome_check;
ALTER TABLE daily_qr_outcomes ADD CONSTRAINT daily_qr_outcomes_outcome_check
  CHECK (outcome IN (
    'jai01_front', 'jai02_greeting', 'jai11_basic', 'jai13_call', 'jai14_megaphone',
    'jai04_smile', 'jai06_mask', 'jai07_disinfection', 'jai09_ventilation', 'jai16_pointer', 'jai23_walk',
    'jai05_crying', 'jai15_experiment', 'jai17_pc', 'jai22_reading', 'jai18_think',
    'jai10_back', 'jai19_wall', 'jai20_globe', 'jai21_rest',
    'morning_jai23', 'bird',
    -- Legacy values for existing data
    'jaileon', 'yellow_jaileon', 'blue_jaileon', 'rainbow_jaileon', 'golden_jaileon'
  ));

-- Update outcome CHECK constraint on scans
ALTER TABLE scans DROP CONSTRAINT IF EXISTS scans_outcome_check;
ALTER TABLE scans ADD CONSTRAINT scans_outcome_check
  CHECK (outcome IN (
    'jai01_front', 'jai02_greeting', 'jai11_basic', 'jai13_call', 'jai14_megaphone',
    'jai04_smile', 'jai06_mask', 'jai07_disinfection', 'jai09_ventilation', 'jai16_pointer', 'jai23_walk',
    'jai05_crying', 'jai15_experiment', 'jai17_pc', 'jai22_reading', 'jai18_think',
    'jai10_back', 'jai19_wall', 'jai20_globe', 'jai21_rest',
    'morning_jai23', 'bird',
    -- Legacy values for existing data
    'jaileon', 'yellow_jaileon', 'blue_jaileon', 'rainbow_jaileon', 'golden_jaileon'
  ));

-- Add new badge types
INSERT INTO badges (id, name_ja, name_en, description_ja, description_en, icon, sort_order)
VALUES
  ('super_rare_catch', '超レアゲット', 'Super Rare Catch', '超レアジャイレオンを捕獲した', 'Caught a Super Rare Jaileon', '💎', 40),
  ('morning_catch', '早起きゲット', 'Morning Catch', '早起きジャイレオンを捕獲した', 'Caught an Early Bird Jaileon', '🌅', 41)
ON CONFLICT (id) DO NOTHING;

-- Remove old badges if they exist (rainbow_catch, golden_catch)
-- Don't delete - just leave them for users who already earned them
