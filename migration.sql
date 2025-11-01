CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT 'de',
    ADD COLUMN IF NOT EXISTS totp_secret TEXT,
    ADD COLUMN IF NOT EXISTS totp_confirmed BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_language_preference ON users (language_preference);

ALTER TABLE workouts ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE workout_activities ADD COLUMN IF NOT EXISTS sets_data JSONB;

CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (requester_id, target_id)
);

CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY,
    user_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_one_id, user_two_id)
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

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

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id %s NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT false,
            used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ', user_id_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
            id SERIAL PRIMARY KEY,
            user_id %s NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT false,
            used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ', user_id_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS invitations (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            invited_by %s REFERENCES users(id) ON DELETE SET NULL,
            token_hash TEXT NOT NULL,
            status TEXT DEFAULT ''pending'',
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT false,
            used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE (email, status)
        );
    ', user_id_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS user_backup_codes (
            id SERIAL PRIMARY KEY,
            user_id %s NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            code_hash TEXT NOT NULL,
            used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ', user_id_type);

    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_backup_codes_user_id ON user_backup_codes(user_id)';
END $$;

CREATE TABLE IF NOT EXISTS outbound_emails (
    id SERIAL PRIMARY KEY,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Migration: Füge sent_at Spalte hinzu, falls sie nicht existiert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'outbound_emails' 
        AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE outbound_emails ADD COLUMN sent_at TIMESTAMPTZ;
    END IF;
END $$;

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

-- Exercises table for managing exercise types and point values
CREATE TABLE IF NOT EXISTS exercises (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    points_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
    unit TEXT NOT NULL DEFAULT 'Wiederholungen',
    has_weight BOOLEAN DEFAULT false,
    has_set_mode BOOLEAN DEFAULT true,
    unit_options JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id)
);

CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises (is_active);

-- Insert default exercises if they don't exist
INSERT INTO exercises (id, name, points_per_unit, unit, has_weight, has_set_mode, unit_options, is_active)
VALUES
    ('pullups', 'Klimmzüge', 3.0, 'Wiederholungen', false, true, '[{"value": "Wiederholungen", "label": "Wiederholungen", "multiplier": 1}]'::jsonb, true),
    ('pushups', 'Liegestütze', 1.0, 'Wiederholungen', false, true, '[{"value": "Wiederholungen", "label": "Wiederholungen", "multiplier": 1}]'::jsonb, true),
    ('situps', 'Sit-ups', 1.0, 'Wiederholungen', false, true, '[{"value": "Wiederholungen", "label": "Wiederholungen", "multiplier": 1}]'::jsonb, true),
    ('running', 'Laufen', 10.0, 'km', false, false, '[{"value": "km", "label": "Kilometer", "multiplier": 1}, {"value": "m", "label": "Meter", "multiplier": 0.001}, {"value": "Meilen", "label": "Meilen", "multiplier": 1.609}]'::jsonb, true),
    ('cycling', 'Radfahren', 5.0, 'km', false, false, '[{"value": "km", "label": "Kilometer", "multiplier": 1}, {"value": "m", "label": "Meter", "multiplier": 0.001}, {"value": "Meilen", "label": "Meilen", "multiplier": 1.609}]'::jsonb, true),
    ('other', 'Sonstiges', 1.0, 'Einheiten', false, true, '[{"value": "Einheiten", "label": "Einheiten", "multiplier": 1}]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
