ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS points_source VARCHAR(20) NOT NULL DEFAULT 'auto';

CREATE INDEX IF NOT EXISTS idx_exercises_points_source
ON exercises(points_source);
