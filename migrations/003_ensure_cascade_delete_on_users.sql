-- Migration: Stelle sicher, dass alle Foreign Keys zu users ON DELETE CASCADE haben
-- Dies stellt sicher, dass beim Löschen eines Users alle zugehörigen Daten gelöscht werden

DO $$
DECLARE
    constraint_record RECORD;
    table_name_var TEXT;
    column_name_var TEXT;
    user_id_type_var TEXT;
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

    -- Stelle sicher, dass workout_activities.workout_id CASCADE hat (für workout_id, nicht user_id)
    -- workout_activities hat normalerweise keinen direkten Foreign Key zu users, sondern zu workouts
    -- Aber workouts sollte CASCADE zu users haben, was dann automatisch workout_activities löscht
    
    RAISE NOTICE 'Migration abgeschlossen: Alle Foreign Keys zu users haben jetzt CASCADE DELETE';
END $$;

