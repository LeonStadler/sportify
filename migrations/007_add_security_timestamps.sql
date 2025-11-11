-- Migration: Add security-related timestamp columns
-- Adds two_factor_enabled_at and password_changed_at to track security events

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS two_factor_enabled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Backfill two_factor_enabled_at for users who already have 2FA enabled
-- Use updated_at as approximation if 2FA is enabled but no timestamp exists
UPDATE users
SET two_factor_enabled_at = updated_at
WHERE has_2fa = true 
  AND two_factor_enabled_at IS NULL
  AND updated_at IS NOT NULL;

-- Backfill password_changed_at for existing users
-- Use created_at as initial password creation time
UPDATE users
SET password_changed_at = created_at
WHERE password_changed_at IS NULL
  AND created_at IS NOT NULL;

