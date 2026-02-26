-- Add golden_jaileon (morning-only character) to outcome constraints

ALTER TABLE daily_qr_outcomes DROP CONSTRAINT IF EXISTS daily_qr_outcomes_outcome_check;
ALTER TABLE daily_qr_outcomes ADD CONSTRAINT daily_qr_outcomes_outcome_check
  CHECK (outcome IN ('jaileon', 'yellow_jaileon', 'blue_jaileon', 'rainbow_jaileon', 'bird', 'golden_jaileon'));

ALTER TABLE scans DROP CONSTRAINT IF EXISTS scans_outcome_check;
ALTER TABLE scans ADD CONSTRAINT scans_outcome_check
  CHECK (outcome IN ('jaileon', 'yellow_jaileon', 'blue_jaileon', 'rainbow_jaileon', 'bird', 'golden_jaileon'));
