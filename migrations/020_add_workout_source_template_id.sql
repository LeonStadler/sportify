ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS source_template_id UUID REFERENCES workouts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workouts_source_template_id
ON workouts(source_template_id);
