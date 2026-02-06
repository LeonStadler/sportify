ALTER TABLE workout_templates
    ADD COLUMN IF NOT EXISTS source_template_root_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL;

ALTER TABLE workouts
    ADD COLUMN IF NOT EXISTS source_template_root_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL;

-- Backfill root ids for templates using recursive traversal
WITH RECURSIVE roots AS (
    SELECT id, source_template_id, id AS root_id
    FROM workout_templates
    WHERE source_template_id IS NULL
    UNION ALL
    SELECT t.id, t.source_template_id, r.root_id
    FROM workout_templates t
    JOIN roots r ON r.id = t.source_template_id
)
UPDATE workout_templates t
SET source_template_root_id = r.root_id
FROM roots r
WHERE t.id = r.id;

-- Fallback for templates whose parent is missing
UPDATE workout_templates
SET source_template_root_id = source_template_id
WHERE source_template_root_id IS NULL
  AND source_template_id IS NOT NULL;

-- Backfill workouts with root id derived from templates
UPDATE workouts w
SET source_template_root_id = COALESCE(t.source_template_root_id, w.source_template_id)
FROM workout_templates t
WHERE w.source_template_id = t.id
  AND w.source_template_root_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_workout_templates_root_id
    ON workout_templates (source_template_root_id);

CREATE INDEX IF NOT EXISTS idx_workouts_source_template_root_id
    ON workouts (source_template_root_id);
