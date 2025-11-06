-- Migration: Entferne end_time Spalte und füge use_end_time Spalte hinzu
-- Diese Migration migriert die workouts Tabelle von end_time zu duration-basiertem System

DO $$
BEGIN
    -- Prüfe ob die workouts Tabelle existiert
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'workouts'
    ) THEN
        -- Migriere alte end_time Daten zu duration, falls start_time vorhanden ist
        -- Dies ist wichtig für bestehende Workouts, die end_time haben
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'end_time'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'start_time'
        ) THEN
            -- Berechne duration aus start_time und end_time für Workouts, die noch keine duration haben
            UPDATE workouts
            SET duration = EXTRACT(EPOCH FROM (end_time - start_time)) / 60
            WHERE end_time IS NOT NULL 
            AND start_time IS NOT NULL 
            AND (duration IS NULL OR duration = 0);
            
            RAISE NOTICE 'Daten von end_time zu duration migriert';
        END IF;
        
        -- Füge use_end_time Spalte hinzu, falls sie nicht existiert
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'use_end_time'
        ) THEN
            ALTER TABLE workouts ADD COLUMN use_end_time BOOLEAN DEFAULT false;
            RAISE NOTICE 'Spalte "use_end_time" zur workouts Tabelle hinzugefügt';
        ELSE
            RAISE NOTICE 'Spalte "use_end_time" existiert bereits in workouts Tabelle';
        END IF;
        
        -- Stelle sicher, dass der Standardwert für use_end_time korrekt ist
        UPDATE workouts SET use_end_time = false WHERE use_end_time IS NULL;
        
        -- Entferne end_time Spalte, falls sie existiert
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'workouts' 
            AND column_name = 'end_time'
        ) THEN
            ALTER TABLE workouts DROP COLUMN end_time;
            RAISE NOTICE 'Spalte "end_time" aus workouts Tabelle entfernt';
        ELSE
            RAISE NOTICE 'Spalte "end_time" existiert nicht in workouts Tabelle';
        END IF;
        
    ELSE
        RAISE NOTICE 'Tabelle "workouts" existiert nicht, Migration wird übersprungen';
    END IF;
END $$;

