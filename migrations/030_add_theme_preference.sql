-- Theme in eigener Spalte speichern (konsistent mit language_preference)
-- Backfill aus preferences->>'theme' für bestehende Nutzer.
-- Falls die Spalte bereits als ENUM theme_preference existiert, zu VARCHAR konvertieren.

DO $$
DECLARE
  col_udt text;
BEGIN
  SELECT udt_name INTO col_udt
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'theme_preference';
  IF col_udt = 'theme_preference' THEN
    ALTER TABLE users
      ALTER COLUMN theme_preference TYPE varchar(10) USING theme_preference::text;
  END IF;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10);

UPDATE users
SET theme_preference = (
  CASE
    WHEN preferences->>'theme' IN ('light', 'dark', 'system') THEN (preferences->>'theme')::varchar(10)
    ELSE (COALESCE(theme_preference, 'system'))::varchar(10)
  END
)
WHERE theme_preference IS NULL OR (preferences ? 'theme');

UPDATE users SET theme_preference = 'system'
WHERE theme_preference IS NULL
   OR theme_preference NOT IN ('light', 'dark', 'system');

ALTER TABLE users ALTER COLUMN theme_preference SET DEFAULT 'system';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_theme_preference_check' AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_theme_preference_check
      CHECK (theme_preference IN ('light', 'dark', 'system'));
  END IF;
END $$;
