-- Create workout_reactions table for emoji reactions on workouts
CREATE TABLE IF NOT EXISTS workout_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workout_id, user_id)
);

CREATE INDEX IF NOT EXISTS workout_reactions_workout_id_idx
    ON workout_reactions (workout_id);
CREATE INDEX IF NOT EXISTS workout_reactions_user_id_idx
    ON workout_reactions (user_id);
CREATE INDEX IF NOT EXISTS workout_reactions_workout_user_idx
    ON workout_reactions (workout_id, user_id);
