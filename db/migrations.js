import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const MIGRATION_LOCK_KEY = 942783472; // Stable lock key to serialize migrations across instances

const ensureExtension = async (pool) => {
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    } catch (error) {
        console.warn('[Migration] Konnte pgcrypto Extension nicht erzwingen:', error.message);
    }
};

const ensureCoreSchema = async (pool) => {
    await ensureExtension(pool);

    // Basis-Workout-Tabelle (wird von vielen Migrationen erwartet)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS workouts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            duration INTEGER,
            use_end_time BOOLEAN NOT NULL DEFAULT false,
            difficulty INTEGER,
            session_type VARCHAR(50),
            rounds INTEGER NOT NULL DEFAULT 1,
            rest_between_sets_seconds INTEGER,
            rest_between_activities_seconds INTEGER,
            rest_between_rounds_seconds INTEGER,
            category VARCHAR(50),
            discipline VARCHAR(50),
            movement_pattern VARCHAR(50),
            movement_patterns TEXT[],
            visibility VARCHAR(20) NOT NULL DEFAULT 'private',
            is_template BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_workouts_user_start ON workouts(user_id, start_time DESC)'
    );

    await pool.query(`
        CREATE TABLE IF NOT EXISTS workout_activities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
            activity_type VARCHAR(50) NOT NULL,
            exercise_id VARCHAR(50),
            measurement_type VARCHAR(20),
            quantity NUMERIC,
            points_earned NUMERIC,
            reps INTEGER,
            weight DECIMAL(8, 2),
            distance DECIMAL(10, 2),
            duration INTEGER,
            notes TEXT,
            order_index INTEGER,
            sets_data JSONB,
            unit VARCHAR(20),
            rest_between_sets_seconds INTEGER,
            rest_after_seconds INTEGER,
            effort INTEGER,
            superset_group VARCHAR(50),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_workout_activities_workout_id ON workout_activities(workout_id)'
    );

    // Legacy schema compatibility: some databases still have activity_type as enum.
    // We need text/varchar to store DB exercise UUIDs as activity identifiers.
    try {
        const { rows: activityTypeRows } = await pool.query(`
            SELECT data_type, udt_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'workout_activities'
              AND column_name = 'activity_type'
            LIMIT 1
        `);
        const activityTypeColumn = activityTypeRows[0];
        if (
            activityTypeColumn &&
            (String(activityTypeColumn.data_type).toUpperCase() === 'USER-DEFINED' ||
                activityTypeColumn.udt_name === 'activity_type')
        ) {
            await pool.query(`
                ALTER TABLE workout_activities
                ALTER COLUMN activity_type TYPE VARCHAR(100)
                USING activity_type::text
            `);
        }
    } catch (error) {
        console.warn(
            '[Migration] Konnte workout_activities.activity_type nicht auf VARCHAR migrieren:',
            error.message
        );
    }

    // Übungen/Konfiguration
    await pool.query(`
        CREATE TABLE IF NOT EXISTS exercises (
            id VARCHAR(50) PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            slug TEXT,
            category VARCHAR(50),
            discipline VARCHAR(50),
            movement_pattern VARCHAR(50),
            measurement_type VARCHAR(20),
            points_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
            points_source VARCHAR(20) NOT NULL DEFAULT 'auto',
            unit TEXT NOT NULL DEFAULT 'Wiederholungen',
            has_weight BOOLEAN DEFAULT false,
            has_set_mode BOOLEAN DEFAULT true,
            requires_weight BOOLEAN DEFAULT false,
            allows_weight BOOLEAN DEFAULT false,
            supports_sets BOOLEAN DEFAULT true,
            supports_time BOOLEAN DEFAULT false,
            supports_distance BOOLEAN DEFAULT false,
            supports_grade BOOLEAN DEFAULT false,
            difficulty_tier INTEGER,
            muscle_groups TEXT[],
            equipment TEXT[],
            unit_options JSONB DEFAULT '[]'::jsonb,
            status VARCHAR(20) DEFAULT 'pending',
            created_by UUID REFERENCES users(id) ON DELETE SET NULL,
            approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
            merged_into VARCHAR(50),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (id)
        )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises (is_active)');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug_unique ON exercises (slug) WHERE slug IS NOT NULL');
    await pool.query(`
        INSERT INTO exercises (
            id,
            name,
            slug,
            points_per_unit,
            unit,
            has_weight,
            has_set_mode,
            requires_weight,
            allows_weight,
            supports_sets,
            supports_time,
            supports_distance,
            supports_grade,
            category,
            discipline,
            measurement_type,
            unit_options,
            status,
            is_active
        )
        VALUES
            ('pullups', 'Klimmzüge', 'pullups', 3.0, 'Wiederholungen', false, true, false, true, true, false, false, false, 'strength', 'calisthenics', 'reps', '[{\"value\": \"Wiederholungen\", \"label\": \"Wiederholungen\", \"multiplier\": 1}]'::jsonb, 'approved', true),
            ('pushups', 'Liegestütze', 'pushups', 1.0, 'Wiederholungen', false, true, false, true, true, false, false, false, 'strength', 'calisthenics', 'reps', '[{\"value\": \"Wiederholungen\", \"label\": \"Wiederholungen\", \"multiplier\": 1}]'::jsonb, 'approved', true),
            ('situps', 'Sit-ups', 'situps', 1.0, 'Wiederholungen', false, true, false, true, true, false, false, false, 'strength', 'calisthenics', 'reps', '[{\"value\": \"Wiederholungen\", \"label\": \"Wiederholungen\", \"multiplier\": 1}]'::jsonb, 'approved', true),
            ('running', 'Laufen', 'running', 10.0, 'km', false, false, false, false, false, true, true, false, 'endurance', 'cardio', 'distance', '[{\"value\": \"km\", \"label\": \"Kilometer\", \"multiplier\": 1}, {\"value\": \"m\", \"label\": \"Meter\", \"multiplier\": 0.001}, {\"value\": \"Meilen\", \"label\": \"Meilen\", \"multiplier\": 1.609}]'::jsonb, 'approved', true),
            ('cycling', 'Radfahren', 'cycling', 5.0, 'km', false, false, false, false, false, true, true, false, 'endurance', 'cardio', 'distance', '[{\"value\": \"km\", \"label\": \"Kilometer\", \"multiplier\": 1}, {\"value\": \"m\", \"label\": \"Meter\", \"multiplier\": 0.001}, {\"value\": \"Meilen\", \"label\": \"Meilen\", \"multiplier\": 1.609}]'::jsonb, 'approved', true),
            ('other', 'Sonstiges', 'other', 1.0, 'Einheiten', false, true, false, false, true, false, false, false, 'strength', 'strength', 'reps', '[{\"value\": \"Einheiten\", \"label\": \"Einheiten\", \"multiplier\": 1}]'::jsonb, 'approved', true)
        ON CONFLICT (id) DO NOTHING
    `);

    // Badges/Leaderboards (werden bei Workout-Erstellung benötigt)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS badges (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            slug TEXT NOT NULL,
            category TEXT NOT NULL,
            level INTEGER,
            label TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (slug, level)
        )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_badges_slug ON badges (slug)');
    await pool.query(
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_slug_level_unique ON badges (slug, COALESCE(level, 0))'
    );

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_badge_progress (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            badge_slug TEXT NOT NULL,
            counter INTEGER NOT NULL DEFAULT 0,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_id, badge_slug)
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_badges (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
            earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            context JSONB NOT NULL DEFAULT '{}'::jsonb,
            UNIQUE (user_id, badge_id)
        )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges (user_id)');

    await pool.query(`
        CREATE TABLE IF NOT EXISTS weekly_results (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            week_start DATE NOT NULL,
            week_end DATE NOT NULL,
            total_points INTEGER NOT NULL DEFAULT 0,
            total_workouts INTEGER NOT NULL DEFAULT 0,
            total_exercises INTEGER NOT NULL DEFAULT 0,
            goal_exercises_met BOOLEAN NOT NULL DEFAULT FALSE,
            goal_points_met BOOLEAN NOT NULL DEFAULT FALSE,
            challenge_points_met BOOLEAN NOT NULL DEFAULT FALSE,
            badges_awarded JSONB NOT NULL DEFAULT '[]'::jsonb,
            awards_awarded JSONB NOT NULL DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_id, week_start)
        )
    `);
    await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_weekly_results_week_start ON weekly_results (week_start)'
    );

    await pool.query(`
        CREATE TABLE IF NOT EXISTS monthly_results (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            month_start DATE NOT NULL,
            month_end DATE NOT NULL,
            total_points INTEGER NOT NULL DEFAULT 0,
            challenge_points_met BOOLEAN NOT NULL DEFAULT FALSE,
            badges_awarded JSONB NOT NULL DEFAULT '[]'::jsonb,
            awards_awarded JSONB NOT NULL DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_id, month_start)
        )
    `);
    await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_monthly_results_month_start ON monthly_results (month_start)'
    );

    await pool.query(`
        CREATE TABLE IF NOT EXISTS leaderboard_results (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            week_start DATE NOT NULL,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            rank INTEGER NOT NULL,
            total_points INTEGER NOT NULL DEFAULT 0,
            participant_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (week_start, user_id)
        )
    `);
    await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_leaderboard_results_week ON leaderboard_results (week_start)'
    );

    // Benachrichtigungen / Push
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            payload JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            read_at TIMESTAMPTZ
        )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id)');
    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_notifications_unread 
        ON notifications (user_id, read_at) WHERE read_at IS NULL
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            endpoint TEXT NOT NULL,
            expiration_time TIMESTAMPTZ,
            keys JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_used_at TIMESTAMPTZ,
            UNIQUE (endpoint)
        )
    `);
    await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id)'
    );
};

/**
 * Prüft ob eine Tabelle existiert
 */
const tableExists = async (pool, tableName) => {
    try {
        const result = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )`,
            [tableName]
        );
        return result.rows[0].exists;
    } catch (error) {
        console.error(`[Migration] Fehler beim Prüfen der Tabelle ${tableName}:`, error);
        return false;
    }
};

/**
 * Prüft ob eine Spalte in einer Tabelle existiert
 */
const columnExists = async (pool, tableName, columnName) => {
    try {
        const result = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1 
                AND column_name = $2
            )`,
            [tableName, columnName]
        );
        return result.rows[0].exists;
    } catch (error) {
        console.error(`[Migration] Fehler beim Prüfen der Spalte ${tableName}.${columnName}:`, error);
        return false;
    }
};

/**
 * Prüft ob alle notwendigen Tabellen existieren und alle Spalten vorhanden sind
 */
export const ensureAllTablesExist = async (pool) => {
    const requiredTables = {
        'users': ['id', 'email', 'password_hash', 'first_name', 'last_name', 'two_factor_enabled_at', 'password_changed_at'],
        'email_verification_tokens': ['id', 'user_id', 'token_hash', 'expires_at', 'used', 'used_at'],
        'password_reset_tokens': ['id', 'user_id', 'token_hash', 'expires_at', 'used', 'used_at'],
        'outbound_emails': ['id', 'recipient', 'subject', 'body', 'sent_at'],
        'invitations': ['id', 'email', 'token_hash', 'expires_at', 'status', 'used', 'used_at'],
        'user_backup_codes': ['id', 'user_id', 'code_hash', 'used_at'],
        'workouts': ['id', 'user_id', 'title', 'start_time', 'duration', 'use_end_time', 'difficulty', 'session_type', 'rounds', 'rest_between_sets_seconds', 'rest_between_activities_seconds', 'rest_between_rounds_seconds', 'category', 'discipline', 'movement_pattern', 'movement_patterns', 'visibility', 'source_template_root_id', 'created_at'],
        'workout_activities': ['id', 'workout_id', 'activity_type', 'quantity', 'points_earned', 'order_index', 'exercise_id', 'measurement_type', 'reps', 'weight', 'distance', 'duration', 'rest_between_sets_seconds', 'rest_after_seconds', 'effort', 'superset_group'],
        'workout_templates': ['id', 'user_id', 'title', 'start_time', 'duration', 'use_end_time', 'difficulty', 'session_type', 'rounds', 'rest_between_sets_seconds', 'rest_between_activities_seconds', 'rest_between_rounds_seconds', 'category', 'discipline', 'movement_pattern', 'movement_patterns', 'visibility', 'source_template_root_id', 'created_at'],
        'workout_template_activities': ['id', 'template_id', 'activity_type', 'quantity', 'points_earned', 'order_index', 'exercise_id', 'measurement_type', 'reps', 'weight', 'distance', 'duration', 'rest_between_sets_seconds', 'rest_after_seconds', 'effort', 'superset_group'],
        'exercises': ['id', 'name', 'slug', 'category', 'measurement_type', 'points_per_unit', 'points_source', 'unit', 'status', 'is_active'],
        'exercise_aliases': ['id', 'exercise_id', 'alias', 'alias_slug', 'created_at'],
        'exercise_favorites': ['id', 'user_id', 'exercise_id', 'created_at'],
        'exercise_reports': ['id', 'exercise_id', 'reported_by', 'reason', 'status', 'created_at'],
        'exercise_edit_requests': ['id', 'exercise_id', 'requested_by', 'change_request', 'status', 'created_at'],
        'notifications': ['id', 'user_id', 'type', 'title', 'message', 'payload', 'created_at'],
        'push_subscriptions': ['id', 'user_id', 'endpoint', 'keys', 'created_at'],
        'badges': ['id', 'slug', 'category', 'label'],
        'user_badges': ['id', 'user_id', 'badge_id', 'earned_at'],
        'user_badge_progress': ['id', 'user_id', 'badge_slug', 'counter'],
        'weekly_results': ['id', 'user_id', 'week_start', 'total_points'],
        'monthly_results': ['id', 'user_id', 'month_start', 'total_points'],
        'leaderboard_results': ['id', 'week_start', 'user_id', 'rank', 'total_points', 'participant_count']
    };

    const missingTables = [];
    const missingColumns = [];

    for (const [tableName, columns] of Object.entries(requiredTables)) {
        const tableExistsResult = await tableExists(pool, tableName);
        if (!tableExistsResult) {
            missingTables.push(tableName);
        } else {
            // Prüfe Spalten
            for (const column of columns) {
                const columnExistsResult = await columnExists(pool, tableName, column);
                if (!columnExistsResult) {
                    missingColumns.push(`${tableName}.${column}`);
                }
            }
        }
    }

    if (missingTables.length > 0) {
        console.error(`[Migration] ❌ Fehlende Tabellen: ${missingTables.join(', ')}`);
        throw new Error(`Folgende Tabellen fehlen: ${missingTables.join(', ')}. Bitte führen Sie die Migrationen aus.`);
    }

    if (missingColumns.length > 0) {
        console.error(`[Migration] ❌ Fehlende Spalten: ${missingColumns.join(', ')}`);
        throw new Error(`Folgende Spalten fehlen: ${missingColumns.join(', ')}. Bitte führen Sie die Migrationen aus.`);
    }
    return true;
};

/**
 * Liest alle Migration-Dateien und führt sie in numerischer Reihenfolge aus
 */
export const createMigrationRunner = (pool) => {
    let migrationPromise;

    return async () => {
        if (!migrationPromise) {
            migrationPromise = (async () => {
                let lockAcquired = false;
                try {
                    const lockResult = await pool.query(
                        'SELECT pg_try_advisory_lock($1) AS locked',
                        [MIGRATION_LOCK_KEY]
                    );
                    const lockValue = lockResult?.rows?.[0]?.locked;
                    lockAcquired = lockValue === undefined ? true : Boolean(lockValue);
                    if (!lockAcquired) {
                        console.log('[Migration] Übersprungen: Lock nicht verfügbar');
                        return;
                    }

                    // Stelle sicher, dass benötigte Extensions vorhanden sind, bevor Migrationen laufen
                    await ensureExtension(pool);

                    // Lese alle Migration-Dateien
                    const files = await fs.readdir(MIGRATIONS_DIR);
                    const migrationFiles = files
                        .filter(file => file.endsWith('.sql'))
                        .sort(); // Sortiere alphabetisch (001, 002, 003, ...)

                    console.log(`[Migration] Gefundene Migrationen: ${migrationFiles.length}`);

                    // Führe jede Migration aus
                    for (const file of migrationFiles) {
                        const migrationPath = path.join(MIGRATIONS_DIR, file);
                        console.log(`[Migration] Führe aus: ${file}`);
                        const sql = await fs.readFile(migrationPath, 'utf-8');
                        await pool.query(sql);
                        console.log(`[Migration] ✅ ${file} erfolgreich ausgeführt`);
                    }

                    // Nach den Migrationen Kern-Tabellen sicherstellen (abhängig von users & Co.)
                    await ensureCoreSchema(pool);
                    
                    // Prüfe ob alle Tabellen existieren
                    await ensureAllTablesExist(pool);
                    console.log('[Migration] ✅ Alle Migrationen erfolgreich ausgeführt');
                } catch (error) {
                    console.error('[Migration] ❌ Fehler beim Ausführen der Migrationen:', error);
                    throw error;
                } finally {
                    if (lockAcquired) {
                        try {
                            await pool.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY]);
                        } catch (unlockError) {
                            console.warn('[Migration] Konnte Advisory Lock nicht freigeben:', unlockError.message);
                        }
                    }
                }
            })();
        }

        return migrationPromise;
    };
};
