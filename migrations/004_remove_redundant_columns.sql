-- Migration: Entferne redundante Spalten aus users Tabelle
-- - is_admin: wird durch role ersetzt
-- - is_active: wird nicht verwendet
-- - birthdate: wird nicht verwendet (birth_date wird verwendet)

DO $$
BEGIN
    -- Setze role für alle User, die is_admin = true haben, auf 'admin'
    -- (falls role noch nicht gesetzt ist)
    UPDATE users
    SET role = 'admin'
    WHERE is_admin = true AND (role IS NULL OR role = 'user');

    -- Entferne is_admin Spalte
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE users DROP COLUMN is_admin;
    END IF;

    -- Entferne is_active Spalte (wird nicht verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users DROP COLUMN is_active;
    END IF;

    -- Entferne birthdate Spalte (birth_date wird verwendet)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'birthdate'
    ) THEN
        ALTER TABLE users DROP COLUMN birthdate;
    END IF;

    -- Stelle sicher, dass role einen Default-Wert hat
    ALTER TABLE users 
    ALTER COLUMN role SET DEFAULT 'user';
    
    -- Stelle sicher, dass role NOT NULL ist
    UPDATE users SET role = 'user' WHERE role IS NULL;
    ALTER TABLE users ALTER COLUMN role SET NOT NULL;
END $$;

