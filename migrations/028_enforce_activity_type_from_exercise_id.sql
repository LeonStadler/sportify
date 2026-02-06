-- Ensure activity_type mirrors exercise_id whenever exercise_id is present
CREATE OR REPLACE FUNCTION enforce_activity_type_from_exercise_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.exercise_id IS NOT NULL THEN
    NEW.activity_type := NEW.exercise_id::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing rows to keep data consistent
UPDATE workout_activities
SET activity_type = exercise_id
WHERE exercise_id IS NOT NULL
  AND activity_type IS DISTINCT FROM exercise_id;

UPDATE workout_template_activities
SET activity_type = exercise_id
WHERE exercise_id IS NOT NULL
  AND activity_type IS DISTINCT FROM exercise_id;

-- Triggers to enforce on future writes
DROP TRIGGER IF EXISTS workout_activities_activity_type_sync ON workout_activities;
CREATE TRIGGER workout_activities_activity_type_sync
BEFORE INSERT OR UPDATE OF exercise_id, activity_type
ON workout_activities
FOR EACH ROW
EXECUTE FUNCTION enforce_activity_type_from_exercise_id();

DROP TRIGGER IF EXISTS workout_template_activities_activity_type_sync ON workout_template_activities;
CREATE TRIGGER workout_template_activities_activity_type_sync
BEFORE INSERT OR UPDATE OF exercise_id, activity_type
ON workout_template_activities
FOR EACH ROW
EXECUTE FUNCTION enforce_activity_type_from_exercise_id();
