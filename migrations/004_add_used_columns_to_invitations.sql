-- Migration: Füge fehlende Spalten 'used' und 'used_at' zur invitations Tabelle hinzu
-- Diese Migration stellt sicher, dass die Spalten existieren, auch wenn sie vorher fehlten

DO $$
BEGIN
    -- Prüfe ob die invitations Tabelle existiert
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
            RAISE NOTICE 'Spalte "used" zur invitations Tabelle hinzugefügt';
        ELSE
            RAISE NOTICE 'Spalte "used" existiert bereits in invitations Tabelle';
        END IF;
        
        -- Füge 'used_at' Spalte hinzu, falls sie nicht existiert
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'invitations' 
            AND column_name = 'used_at'
        ) THEN
            ALTER TABLE invitations ADD COLUMN used_at TIMESTAMPTZ;
            RAISE NOTICE 'Spalte "used_at" zur invitations Tabelle hinzugefügt';
        ELSE
            RAISE NOTICE 'Spalte "used_at" existiert bereits in invitations Tabelle';
        END IF;
        
        -- Stelle sicher, dass der Standardwert für 'used' korrekt ist
        -- Setze alle NULL Werte auf false
        UPDATE invitations SET used = false WHERE used IS NULL;
        
        -- Stelle sicher, dass die Spalte NOT NULL ist (nachdem wir NULL Werte gesetzt haben)
        -- Aber nur wenn es keine NULL Werte mehr gibt
        IF NOT EXISTS (
            SELECT 1 FROM invitations WHERE used IS NULL
        ) THEN
            BEGIN
                ALTER TABLE invitations ALTER COLUMN used SET NOT NULL;
                ALTER TABLE invitations ALTER COLUMN used SET DEFAULT false;
            EXCEPTION WHEN others THEN
                RAISE NOTICE 'Konnte NOT NULL Constraint für "used" nicht setzen: %', SQLERRM;
            END;
        END IF;
    ELSE
        RAISE NOTICE 'Tabelle "invitations" existiert nicht, Migration wird übersprungen';
    END IF;
END $$;

