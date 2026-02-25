-- Add yellow_jaileon and blue_jaileon to outcome constraints

-- Update daily_qr_outcomes CHECK constraint
ALTER TABLE daily_qr_outcomes DROP CONSTRAINT IF EXISTS daily_qr_outcomes_outcome_check;
ALTER TABLE daily_qr_outcomes ADD CONSTRAINT daily_qr_outcomes_outcome_check
  CHECK (outcome IN ('jaileon', 'yellow_jaileon', 'blue_jaileon', 'rainbow_jaileon', 'bird'));

-- Update scans CHECK constraint
ALTER TABLE scans DROP CONSTRAINT IF EXISTS scans_outcome_check;
ALTER TABLE scans ADD CONSTRAINT scans_outcome_check
  CHECK (outcome IN ('jaileon', 'yellow_jaileon', 'blue_jaileon', 'rainbow_jaileon', 'bird'));
