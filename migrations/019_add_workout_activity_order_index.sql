DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_activities') THEN
        ALTER TABLE workout_activities
            ADD COLUMN IF NOT EXISTS order_index INTEGER;
    END IF;
END $$;
