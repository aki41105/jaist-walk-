-- Add missing name column to users table
-- This column is required for registration and login

ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;

-- Set a default value for any existing rows (use id as fallback)
UPDATE users SET name = id WHERE name IS NULL;

-- Now add NOT NULL and UNIQUE constraints
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_name_unique UNIQUE (name);

-- Add index for name lookups (used in login)
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
