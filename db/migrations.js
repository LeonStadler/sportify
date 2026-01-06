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
            quantity NUMERIC,
            points_earned NUMERIC,
            notes TEXT,
            order_index INTEGER,
            sets_data JSONB,
            unit VARCHAR(20),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_workout_activities_workout_id ON workout_activities(workout_id)'
    );

    // Übungen/Konfiguration
    await pool.query(`
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
        )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises (is_active)');
    await pool.query(`
        INSERT INTO exercises (id, name, points_per_unit, unit, has_weight, has_set_mode, unit_options, is_active)
        VALUES
            ('pullups', 'Klimmzüge', 3.0, 'Wiederholungen', false, true, '[{"value": "Wiederholungen", "label": "Wiederholungen", "multiplier": 1}]'::jsonb, true),
            ('pushups', 'Liegestütze', 1.0, 'Wiederholungen', false, true, '[{"value": "Wiederholungen", "label": "Wiederholungen", "multiplier": 1}]'::jsonb, true),
            ('situps', 'Sit-ups', 1.0, 'Wiederholungen', false, true, '[{"value": "Wiederholungen", "label": "Wiederholungen", "multiplier": 1}]'::jsonb, true),
            ('running', 'Laufen', 10.0, 'km', false, false, '[{"value": "km", "label": "Kilometer", "multiplier": 1}, {"value": "m", "label": "Meter", "multiplier": 0.001}, {"value": "Meilen", "label": "Meilen", "multiplier": 1.609}]'::jsonb, true),
            ('cycling', 'Radfahren', 5.0, 'km', false, false, '[{"value": "km", "label": "Kilometer", "multiplier": 1}, {"value": "m", "label": "Meter", "multiplier": 0.001}, {"value": "Meilen", "label": "Meilen", "multiplier": 1.609}]'::jsonb, true),
            ('other', 'Sonstiges', 1.0, 'Einheiten', false, true, '[{"value": "Einheiten", "label": "Einheiten", "multiplier": 1}]'::jsonb, true)
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
        'workouts': ['id', 'user_id', 'title', 'start_time', 'duration', 'use_end_time', 'created_at'],
        'workout_activities': ['id', 'workout_id', 'activity_type', 'quantity', 'points_earned', 'order_index'],
        'exercises': ['id', 'name', 'points_per_unit', 'unit', 'is_active'],
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
                    lockAcquired = Boolean(lockResult?.rows?.[0]?.locked);
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
