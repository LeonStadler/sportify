CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE workouts ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE workout_activities ADD COLUMN IF NOT EXISTS sets_data JSONB;

DO $$
DECLARE
    user_id_type text;
    workout_id_type text;
BEGIN
    SELECT format_type(atttypid, atttypmod)
    INTO user_id_type
    FROM pg_attribute
    WHERE attrelid = 'users'::regclass
      AND attname = 'id'
      AND NOT attisdropped;

    IF user_id_type IS NULL THEN
        user_id_type := 'uuid';
    END IF;

    SELECT format_type(atttypid, atttypmod)
    INTO workout_id_type
    FROM pg_attribute
    WHERE attrelid = 'workouts'::regclass
      AND attname = 'id'
      AND NOT attisdropped;

    IF workout_id_type IS NULL THEN
        workout_id_type := user_id_type;
    END IF;

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS training_journal_entries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id %s NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            workout_id %s REFERENCES workouts(id) ON DELETE SET NULL,
            entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
            mood TEXT NOT NULL CHECK (mood IN (''energized'', ''balanced'', ''tired'', ''sore'', ''stressed'')),
            energy_level SMALLINT CHECK (energy_level BETWEEN 1 AND 10),
            focus_level SMALLINT CHECK (focus_level BETWEEN 1 AND 10),
            sleep_quality SMALLINT CHECK (sleep_quality BETWEEN 1 AND 10),
            soreness_level SMALLINT CHECK (soreness_level BETWEEN 0 AND 10),
            perceived_exertion SMALLINT CHECK (perceived_exertion BETWEEN 1 AND 10),
            notes TEXT,
            tags TEXT[],
            metrics JSONB NOT NULL DEFAULT ''{}''::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    ', user_id_type, workout_id_type);

    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_training_journal_user_date ON training_journal_entries (user_id, entry_date DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_training_journal_mood ON training_journal_entries (mood)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_training_journal_tags ON training_journal_entries USING GIN (tags)';
END $$;
