-- Migration: Datenbank-Bereinigung - Entfernung ungenutzter Tabellen
-- Diese Migration entfernt Tabellen die nicht mehr verwendet werden und bereinigt Daten

DO $$
BEGIN
    -- 1. Bereinige password_reset_tokens: Setze used_at für alle Einträge mit used=true aber used_at IS NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens'
    ) THEN
        -- Setze used_at auf created_at für alle Einträge die used=true haben aber kein used_at
        UPDATE password_reset_tokens 
        SET used_at = COALESCE(created_at, NOW())
        WHERE used = true 
        AND used_at IS NULL;
        
        RAISE NOTICE '[Bereinigung] password_reset_tokens: used_at für % Einträge gesetzt', 
            (SELECT COUNT(*) FROM password_reset_tokens WHERE used = true AND used_at IS NOT NULL);
    END IF;

    -- 2. Entferne ungenutzte Tabellen (alle sind leer)
    
    -- friends (wird nicht verwendet, nur friendships wird verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'friends'
    ) THEN
        DROP TABLE IF EXISTS friends CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "friends" entfernt (wird nicht verwendet, nur friendships wird verwendet)';
    END IF;

    -- leaderboards (wird nicht verwendet, Scoreboard wird dynamisch berechnet)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'leaderboards'
    ) THEN
        DROP TABLE IF EXISTS leaderboards CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "leaderboards" entfernt (wird nicht verwendet, Scoreboard wird dynamisch berechnet)';
    END IF;

    -- notifications (wird nicht verwendet, Route existiert aber macht nichts)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
    ) THEN
        DROP TABLE IF EXISTS notifications CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "notifications" entfernt (wird nicht verwendet, Route ist TODO)';
    END IF;

    -- two_factor_codes (wird nicht verwendet, 2FA wird in users.totp_secret gespeichert)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'two_factor_codes'
    ) THEN
        DROP TABLE IF EXISTS two_factor_codes CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "two_factor_codes" entfernt (wird nicht verwendet, 2FA wird in users.totp_secret gespeichert)';
    END IF;

    -- point_settings (wird nicht verwendet, Punkte werden in exercises.points_per_unit gespeichert)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'point_settings'
    ) THEN
        DROP TABLE IF EXISTS point_settings CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "point_settings" entfernt (wird nicht verwendet, Punkte werden in exercises.points_per_unit gespeichert)';
    END IF;

    -- user_sessions (wird nicht verwendet, JWT wird verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_sessions'
    ) THEN
        DROP TABLE IF EXISTS user_sessions CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "user_sessions" entfernt (wird nicht verwendet, JWT wird verwendet)';
    END IF;

    -- verification_tokens (wird nicht verwendet, email_verification_tokens wird verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_tokens'
    ) THEN
        DROP TABLE IF EXISTS verification_tokens CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "verification_tokens" entfernt (wird nicht verwendet, email_verification_tokens wird verwendet)';
    END IF;

    -- achievements (wird nicht verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'achievements'
    ) THEN
        DROP TABLE IF EXISTS achievements CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "achievements" entfernt (wird nicht verwendet)';
    END IF;

    -- user_achievements (wird nicht verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_achievements'
    ) THEN
        DROP TABLE IF EXISTS user_achievements CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "user_achievements" entfernt (wird nicht verwendet)';
    END IF;

    -- activity_configs (wird nicht verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'activity_configs'
    ) THEN
        DROP TABLE IF EXISTS activity_configs CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "activity_configs" entfernt (wird nicht verwendet)';
    END IF;

    -- app_settings (wird nicht verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'app_settings'
    ) THEN
        DROP TABLE IF EXISTS app_settings CASCADE;
        RAISE NOTICE '[Bereinigung] Tabelle "app_settings" entfernt (wird nicht verwendet)';
    END IF;

    -- 3. Entferne org Schema (wird nicht verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'org'
    ) THEN
        -- Lösche zuerst die Tabellen im Schema
        DROP TABLE IF EXISTS org.memberships CASCADE;
        DROP TABLE IF EXISTS org.organizations CASCADE;
        
        -- Lösche dann das Schema selbst
        DROP SCHEMA IF EXISTS org CASCADE;
        
        RAISE NOTICE '[Bereinigung] Schema "org" entfernt (wird nicht verwendet)';
    END IF;

    RAISE NOTICE '[Bereinigung] Datenbank-Bereinigung abgeschlossen';
END $$;

