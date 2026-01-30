DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workouts') THEN
        ALTER TABLE workouts
            ADD COLUMN IF NOT EXISTS difficulty INTEGER,
            ADD COLUMN IF NOT EXISTS session_type VARCHAR(50),
            ADD COLUMN IF NOT EXISTS rounds INTEGER DEFAULT 1,
            ADD COLUMN IF NOT EXISTS rest_between_sets_seconds INTEGER,
            ADD COLUMN IF NOT EXISTS rest_between_activities_seconds INTEGER,
            ADD COLUMN IF NOT EXISTS rest_between_rounds_seconds INTEGER;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_activities') THEN
        ALTER TABLE workout_activities
            ADD COLUMN IF NOT EXISTS rest_between_sets_seconds INTEGER,
            ADD COLUMN IF NOT EXISTS rest_after_seconds INTEGER,
            ADD COLUMN IF NOT EXISTS effort INTEGER,
            ADD COLUMN IF NOT EXISTS superset_group VARCHAR(50);
    END IF;
END $$;
