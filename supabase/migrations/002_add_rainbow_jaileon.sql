-- Add rainbow_jaileon to outcome CHECK constraints

-- Update daily_qr_outcomes outcome constraint
ALTER TABLE daily_qr_outcomes
  DROP CONSTRAINT IF EXISTS daily_qr_outcomes_outcome_check;
ALTER TABLE daily_qr_outcomes
  ADD CONSTRAINT daily_qr_outcomes_outcome_check
  CHECK (outcome IN ('jaileon', 'bird', 'rainbow_jaileon'));

-- Update scans outcome constraint
ALTER TABLE scans
  DROP CONSTRAINT IF EXISTS scans_outcome_check;
ALTER TABLE scans
  ADD CONSTRAINT scans_outcome_check
  CHECK (outcome IN ('jaileon', 'bird', 'rainbow_jaileon'));
