CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT 'de',
    ADD COLUMN IF NOT EXISTS totp_secret TEXT,
    ADD COLUMN IF NOT EXISTS totp_confirmed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS weekly_goals JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS country VARCHAR(100),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Entferne bestehenden gender Check-Constraint falls vorhanden und füge neuen hinzu
DO $$
BEGIN
    -- Entferne bestehenden Constraint falls vorhanden
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_gender_check' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_gender_check;
    END IF;
    
    -- Füge neuen Constraint hinzu, der male, female, diverse oder NULL erlaubt
    ALTER TABLE users ADD CONSTRAINT users_gender_check 
        CHECK (gender IS NULL OR gender IN ('male', 'female', 'diverse'));
END $$;

-- Backfill existing NULL values in weekly_goals
UPDATE users
SET weekly_goals = '{}'::jsonb
WHERE weekly_goals IS NULL;

-- Add NOT NULL constraint after backfill
ALTER TABLE users
    ALTER COLUMN weekly_goals SET NOT NULL;

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

-- Migration: Füge fehlende Spalten zu invitations Tabelle hinzu, falls sie nicht existieren
DO $$
BEGIN
    -- Füge token_hash hinzu, falls fehlend
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invitations' 
        AND column_name = 'token_hash'
    ) THEN
        ALTER TABLE invitations ADD COLUMN token_hash TEXT;
    END IF;
    
    -- Füge used hinzu, falls fehlend
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invitations' 
        AND column_name = 'used'
    ) THEN
        ALTER TABLE invitations ADD COLUMN used BOOLEAN DEFAULT false;
    END IF;
    
    -- Füge used_at hinzu, falls fehlend
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invitations' 
        AND column_name = 'used_at'
    ) THEN
        ALTER TABLE invitations ADD COLUMN used_at TIMESTAMPTZ;
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

-- Migration: Stelle sicher, dass alle Foreign Keys zu users ON DELETE CASCADE haben
-- Dies stellt sicher, dass beim Löschen eines Users alle zugehörigen Daten gelöscht werden
DO $$
DECLARE
    constraint_record RECORD;
    table_name_var TEXT;
    column_name_var TEXT;
    user_id_type_var TEXT;
    workout_id_type_var TEXT;
    constraint_name_var TEXT;
    drop_constraint_sql TEXT;
    add_constraint_sql TEXT;
BEGIN
    -- Hole den Datentyp der users.id Spalte
    SELECT format_type(atttypid, atttypmod)
    INTO user_id_type_var
    FROM pg_attribute
    WHERE attrelid = 'users'::regclass
      AND attname = 'id'
      AND NOT attisdropped;

    IF user_id_type_var IS NULL THEN
        user_id_type_var := 'uuid';
    END IF;

    -- Finde alle Foreign Key Constraints zu users, die KEINE CASCADE haben
    FOR constraint_record IN
        SELECT
            tc.table_name,
            kcu.column_name,
            tc.constraint_name
        FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints AS rc
              ON rc.constraint_name = tc.constraint_name
              AND rc.constraint_schema = tc.table_schema
        WHERE
            tc.constraint_type = 'FOREIGN KEY'
            AND ccu.table_name = 'users'
            AND ccu.column_name = 'id'
            AND tc.table_schema = 'public'
            AND rc.delete_rule != 'CASCADE'
            -- Überspringe invitations.invited_by (sollte SET NULL bleiben)
            AND NOT (tc.table_name = 'invitations' AND kcu.column_name = 'invited_by')
            -- Überspringe exercises.created_by falls vorhanden (sollte SET NULL bleiben)
            AND NOT (tc.table_name = 'exercises' AND kcu.column_name = 'created_by')
    LOOP
        table_name_var := constraint_record.table_name;
        column_name_var := constraint_record.column_name;
        constraint_name_var := constraint_record.constraint_name;

        -- Lösche den alten Constraint
        drop_constraint_sql := format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', table_name_var, constraint_name_var);
        EXECUTE drop_constraint_sql;

        -- Erstelle den neuen Constraint mit CASCADE
        add_constraint_sql := format(
            'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES users(id) ON DELETE CASCADE',
            table_name_var,
            constraint_name_var,
            column_name_var
        );
        EXECUTE add_constraint_sql;

        RAISE NOTICE 'Geändert: % auf CASCADE für Tabelle %.%', constraint_name_var, table_name_var, column_name_var;
    END LOOP;

    -- Stelle sicher, dass workouts.user_id CASCADE hat
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workouts') THEN
        -- Prüfe ob workouts.user_id einen Foreign Key hat
        IF EXISTS (
            SELECT 1
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'workouts'
              AND kcu.column_name = 'user_id'
              AND ccu.table_name = 'users'
        ) THEN
            -- Constraint existiert, ändere es falls nötig
            FOR constraint_record IN
                SELECT tc.constraint_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                JOIN information_schema.referential_constraints AS rc
                  ON rc.constraint_name = tc.constraint_name
                WHERE tc.table_name = 'workouts'
                  AND kcu.column_name = 'user_id'
                  AND ccu.table_name = 'users'
                  AND rc.delete_rule != 'CASCADE'
            LOOP
                drop_constraint_sql := format('ALTER TABLE workouts DROP CONSTRAINT IF EXISTS %I', constraint_record.constraint_name);
                EXECUTE drop_constraint_sql;
                add_constraint_sql := format(
                    'ALTER TABLE workouts ADD CONSTRAINT %I FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
                    constraint_record.constraint_name
                );
                EXECUTE add_constraint_sql;
                RAISE NOTICE 'Geändert: workouts.user_id auf CASCADE';
            END LOOP;
        ELSE
            -- Constraint existiert nicht, erstelle es
            BEGIN
                add_constraint_sql := format(
                    'ALTER TABLE workouts ADD CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
                );
                EXECUTE add_constraint_sql;
                RAISE NOTICE 'Erstellt: workouts.user_id Foreign Key mit CASCADE';
            EXCEPTION WHEN others THEN
                RAISE NOTICE 'Konnte workouts.user_id Constraint nicht erstellen: %', SQLERRM;
            END;
        END IF;
    END IF;

    -- Stelle sicher, dass workout_activities.workout_id CASCADE zu workouts hat
    -- Dies stellt sicher, dass beim Löschen eines Workouts die zugehörigen Aktivitäten gelöscht werden
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_activities') THEN
        IF EXISTS (
            SELECT 1
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'workout_activities'
              AND kcu.column_name = 'workout_id'
              AND ccu.table_name = 'workouts'
        ) THEN
            -- Constraint existiert, ändere es falls nötig
            FOR constraint_record IN
                SELECT tc.constraint_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                JOIN information_schema.referential_constraints AS rc
                  ON rc.constraint_name = tc.constraint_name
                WHERE tc.table_name = 'workout_activities'
                  AND kcu.column_name = 'workout_id'
                  AND ccu.table_name = 'workouts'
                  AND rc.delete_rule != 'CASCADE'
            LOOP
                drop_constraint_sql := format('ALTER TABLE workout_activities DROP CONSTRAINT IF EXISTS %I', constraint_record.constraint_name);
                EXECUTE drop_constraint_sql;
                
                -- Hole workout_id Typ
                SELECT format_type(atttypid, atttypmod)
                INTO workout_id_type_var
                FROM pg_attribute
                WHERE attrelid = 'workouts'::regclass
                  AND attname = 'id'
                  AND NOT attisdropped;
                  
                IF workout_id_type_var IS NULL THEN
                    workout_id_type_var := user_id_type_var;
                END IF;
                
                add_constraint_sql := format(
                    'ALTER TABLE workout_activities ADD CONSTRAINT %I FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE',
                    constraint_record.constraint_name
                );
                EXECUTE add_constraint_sql;
                RAISE NOTICE 'Geändert: workout_activities.workout_id auf CASCADE';
            END LOOP;
        ELSE
            -- Constraint existiert nicht, erstelle es
            BEGIN
                SELECT format_type(atttypid, atttypmod)
                INTO workout_id_type_var
                FROM pg_attribute
                WHERE attrelid = 'workouts'::regclass
                  AND attname = 'id'
                  AND NOT attisdropped;
                  
                IF workout_id_type_var IS NULL THEN
                    workout_id_type_var := user_id_type_var;
                END IF;
                
                add_constraint_sql := format(
                    'ALTER TABLE workout_activities ADD CONSTRAINT workout_activities_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE'
                );
                EXECUTE add_constraint_sql;
                RAISE NOTICE 'Erstellt: workout_activities.workout_id Foreign Key mit CASCADE';
            EXCEPTION WHEN others THEN
                RAISE NOTICE 'Konnte workout_activities.workout_id Constraint nicht erstellen: %', SQLERRM;
            END;
        END IF;
    END IF;
    
    RAISE NOTICE 'Migration abgeschlossen: Alle Foreign Keys haben jetzt CASCADE DELETE';
END $$;

-- Zusätzliche Migration: Stelle sicher, dass 'used' und 'used_at' Spalten in invitations Tabelle existieren
-- Dies ist eine robustere Version, die auch dann funktioniert, wenn die vorherige Migration fehlgeschlagen ist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invitations'
    ) THEN
        -- Füge 'used' Spalte hinzu, falls sie nicht existiert
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'invitations' 
            AND column_name = 'used'
        ) THEN
            ALTER TABLE invitations ADD COLUMN used BOOLEAN DEFAULT false;
            -- Setze NOT NULL nach dem Hinzufügen
            ALTER TABLE invitations ALTER COLUMN used SET NOT NULL;
            RAISE NOTICE '[Migration] Spalte "used" zur invitations Tabelle hinzugefügt';
        ELSE
            -- Stelle sicher, dass der Standardwert gesetzt ist
            ALTER TABLE invitations ALTER COLUMN used SET DEFAULT false;
            -- Setze NULL Werte auf false
            UPDATE invitations SET used = false WHERE used IS NULL;
            -- Setze NOT NULL, wenn alle Werte gesetzt sind
            BEGIN
                ALTER TABLE invitations ALTER COLUMN used SET NOT NULL;
            EXCEPTION WHEN others THEN
                RAISE NOTICE '[Migration] Konnte NOT NULL für "used" nicht setzen: %', SQLERRM;
            END;
            RAISE NOTICE '[Migration] Spalte "used" existiert bereits in invitations Tabelle';
        END IF;
        
        -- Füge 'used_at' Spalte hinzu, falls sie nicht existiert
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'invitations' 
            AND column_name = 'used_at'
        ) THEN
            ALTER TABLE invitations ADD COLUMN used_at TIMESTAMPTZ;
            RAISE NOTICE '[Migration] Spalte "used_at" zur invitations Tabelle hinzugefügt';
        ELSE
            RAISE NOTICE '[Migration] Spalte "used_at" existiert bereits in invitations Tabelle';
        END IF;
    ELSE
        RAISE NOTICE '[Migration] Tabelle "invitations" existiert nicht, Migration wird übersprungen';
    END IF;
END $$;

-- Migration: Bereinige workouts Tabelle und ändere start_time zu TIMESTAMPTZ
-- Diese Migration:
-- 1. Ändert start_time direkt zu TIMESTAMPTZ (ohne workout_date, da es nicht mehr existiert)
-- 2. Setzt start_time auf NOT NULL mit DEFAULT NOW()
-- 3. Entfernt ungenutzte Spalten: preferences, end_time, status, verified_by, verified_at

DO $$
DECLARE
    start_time_type text;
    has_workout_date boolean;
BEGIN
    -- Prüfe ob die workouts Tabelle existiert
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'workouts'
    ) THEN
        -- Prüfe ob workout_date existiert
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'workout_date'
        ) INTO has_workout_date;
        
        -- Hole den aktuellen Datentyp von start_time
        SELECT data_type INTO start_time_type
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'workouts' 
        AND column_name = 'start_time';
        
        -- Schritt 1: Ändere start_time zu TIMESTAMPTZ, falls nötig
        IF start_time_type IS NOT NULL AND start_time_type != 'timestamp with time zone' THEN
            -- Ändere den Typ zu TIMESTAMPTZ
            IF start_time_type = 'time without time zone' THEN
                -- start_time ist TIME (ohne Datum)
                IF has_workout_date THEN
                    -- workout_date existiert, kombiniere es mit start_time
                    ALTER TABLE workouts 
                    ALTER COLUMN start_time TYPE TIMESTAMPTZ 
                    USING CASE
                        WHEN start_time IS NOT NULL AND workout_date IS NOT NULL 
                            THEN (workout_date::date + start_time::interval)::timestamptz
                        WHEN workout_date IS NOT NULL 
                            THEN workout_date::timestamptz
                        WHEN created_at IS NOT NULL 
                            THEN created_at
                        ELSE NOW()
                    END;
                ELSE
                    -- workout_date existiert nicht, kombiniere start_time mit created_at
                    ALTER TABLE workouts 
                    ALTER COLUMN start_time TYPE TIMESTAMPTZ 
                    USING CASE
                        WHEN start_time IS NOT NULL AND created_at IS NOT NULL 
                            THEN (created_at::date + start_time::interval)::timestamptz
                        WHEN created_at IS NOT NULL 
                            THEN created_at
                        ELSE NOW()
                    END;
                END IF;
            ELSE
                -- Versuche direkte Konvertierung zu TIMESTAMPTZ
                ALTER TABLE workouts 
                ALTER COLUMN start_time TYPE TIMESTAMPTZ 
                USING COALESCE(start_time::timestamptz, created_at, NOW());
            END IF;
            
            RAISE NOTICE 'start_time zu TIMESTAMPTZ geändert';
        ELSIF start_time_type IS NULL THEN
            -- start_time existiert nicht, erstelle es
            ALTER TABLE workouts ADD COLUMN start_time TIMESTAMPTZ NOT NULL DEFAULT NOW();
            RAISE NOTICE 'start_time Spalte erstellt';
        END IF;
        
        -- Schritt 2: Setze start_time auf NOT NULL mit DEFAULT, falls noch nicht gesetzt
        IF start_time_type IS NOT NULL THEN
            -- Setze NULL-Werte auf NOW()
            UPDATE workouts SET start_time = COALESCE(start_time, created_at, NOW()) WHERE start_time IS NULL;
            
            -- Setze DEFAULT
            ALTER TABLE workouts ALTER COLUMN start_time SET DEFAULT NOW();
            
            -- Setze NOT NULL
            BEGIN
                ALTER TABLE workouts ALTER COLUMN start_time SET NOT NULL;
                RAISE NOTICE 'start_time auf NOT NULL gesetzt';
            EXCEPTION WHEN others THEN
                RAISE NOTICE 'Konnte start_time nicht auf NOT NULL setzen: %', SQLERRM;
            END;
        END IF;
        
        -- Schritt 3: Entferne workout_date Spalte, falls vorhanden
        IF has_workout_date THEN
            ALTER TABLE workouts DROP COLUMN IF EXISTS workout_date;
            RAISE NOTICE 'workout_date Spalte entfernt';
        END IF;
        
        -- Schritt 4: Entferne ungenutzte Spalten
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'preferences'
        ) THEN
            ALTER TABLE workouts DROP COLUMN preferences;
            RAISE NOTICE 'preferences Spalte entfernt';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'end_time'
        ) THEN
            ALTER TABLE workouts DROP COLUMN end_time;
            RAISE NOTICE 'end_time Spalte entfernt';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'status'
        ) THEN
            ALTER TABLE workouts DROP COLUMN status;
            RAISE NOTICE 'status Spalte entfernt';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'verified_by'
        ) THEN
            ALTER TABLE workouts DROP COLUMN verified_by;
            RAISE NOTICE 'verified_by Spalte entfernt';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'verified_at'
        ) THEN
            ALTER TABLE workouts DROP COLUMN verified_at;
            RAISE NOTICE 'verified_at Spalte entfernt';
        END IF;
        
    ELSE
        RAISE NOTICE 'Tabelle "workouts" existiert nicht, Migration wird übersprungen';
    END IF;
END $$;

