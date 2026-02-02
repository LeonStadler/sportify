CREATE TABLE IF NOT EXISTS workout_templates (
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
    category TEXT,
    discipline TEXT,
    movement_pattern TEXT,
    movement_patterns TEXT[],
    source_template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure movement_pattern exists on previously created tables
ALTER TABLE workout_templates
    ADD COLUMN IF NOT EXISTS movement_pattern TEXT;

CREATE INDEX IF NOT EXISTS idx_workout_templates_user_updated
    ON workout_templates (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_templates_visibility
    ON workout_templates (visibility);
CREATE INDEX IF NOT EXISTS idx_workout_templates_source_template_id
    ON workout_templates (source_template_id);

CREATE TABLE IF NOT EXISTS workout_template_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
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
);

CREATE INDEX IF NOT EXISTS idx_workout_template_activities_template_id
    ON workout_template_activities (template_id);

-- Ensure legacy column exists for migration compatibility
ALTER TABLE workouts
    ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;

-- Drop FK to workouts for source_template_id because templates now live in workout_templates.
ALTER TABLE workouts
    DROP CONSTRAINT IF EXISTS workouts_source_template_id_fkey;

-- Migrate template workouts (id is preserved to keep existing links intact).
INSERT INTO workout_templates (
    id,
    user_id,
    title,
    description,
    start_time,
    duration,
    use_end_time,
    difficulty,
    session_type,
    rounds,
    rest_between_sets_seconds,
    rest_between_activities_seconds,
    rest_between_rounds_seconds,
    category,
    discipline,
    movement_pattern,
    movement_patterns,
    source_template_id,
    visibility,
    created_at,
    updated_at
)
SELECT
    w.id,
    w.user_id,
    w.title,
    w.description,
    w.start_time,
    w.duration,
    w.use_end_time,
    w.difficulty,
    w.session_type,
    COALESCE(w.rounds, 1),
    w.rest_between_sets_seconds,
    w.rest_between_activities_seconds,
    w.rest_between_rounds_seconds,
    w.category,
    w.discipline,
    w.movement_pattern,
    w.movement_patterns,
    w.source_template_id,
    COALESCE(w.visibility, 'private'),
    w.created_at,
    w.updated_at
FROM workouts w
WHERE COALESCE(w.is_template, false) = true
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_template_activities (
    id,
    template_id,
    activity_type,
    exercise_id,
    measurement_type,
    quantity,
    points_earned,
    reps,
    weight,
    distance,
    duration,
    notes,
    order_index,
    sets_data,
    unit,
    rest_between_sets_seconds,
    rest_after_seconds,
    effort,
    superset_group,
    created_at
)
SELECT
    wa.id,
    wa.workout_id,
    wa.activity_type::varchar,
    wa.exercise_id,
    wa.measurement_type,
    wa.quantity,
    wa.points_earned,
    wa.reps,
    wa.weight,
    wa.distance,
    wa.duration,
    wa.notes,
    wa.order_index,
    wa.sets_data,
    wa.unit,
    wa.rest_between_sets_seconds,
    wa.rest_after_seconds,
    wa.effort,
    wa.superset_group,
    wa.created_at
FROM workout_activities wa
JOIN workouts w ON w.id = wa.workout_id
WHERE COALESCE(w.is_template, false) = true
ON CONFLICT (id) DO NOTHING;

-- Remove templates from workouts table to keep clear separation.
DELETE FROM workouts
WHERE COALESCE(is_template, false) = true;
