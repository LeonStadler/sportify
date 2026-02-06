DO $$
DECLARE
    column_data_type text;
    column_udt_name text;
BEGIN
    SELECT data_type, udt_name
    INTO column_data_type, column_udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workout_activities'
      AND column_name = 'activity_type'
    LIMIT 1;

    IF column_data_type = 'USER-DEFINED' OR column_udt_name = 'activity_type' THEN
        EXECUTE '
            ALTER TABLE workout_activities
            ALTER COLUMN activity_type TYPE VARCHAR(100)
            USING activity_type::text
        ';
    END IF;
END $$;
