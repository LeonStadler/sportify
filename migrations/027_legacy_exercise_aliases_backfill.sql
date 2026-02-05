-- Legacy exercise aliases for pullups/pushups/situps
WITH aliases AS (
    SELECT 'pullups'::varchar AS exercise_id, unnest(ARRAY[
        'pullup','pullups','pull-up','pull-ups','pull ups',
        'klimmzug','klimmzuege','klimmzüge','klimmzuegen','klimmzügen','klimmzuegen','klimmzuege','klimmzug'
    ]) AS alias
    UNION ALL
    SELECT 'pushups'::varchar, unnest(ARRAY[
        'pushup','pushups','push-up','push-ups','push ups',
        'liegestuetz','liegestuetze','liegestütze','liegestuetzen','liegestützen'
    ])
    UNION ALL
    SELECT 'situps'::varchar, unnest(ARRAY[
        'situp','situps','sit-up','sit-ups','sit ups'
    ])
)
INSERT INTO exercise_aliases (exercise_id, alias, alias_slug)
SELECT
    a.exercise_id,
    a.alias,
    regexp_replace(lower(a.alias), '[^a-z0-9]+', '', 'g') AS alias_slug
FROM aliases a
JOIN exercises e ON e.id = a.exercise_id
ON CONFLICT (exercise_id, alias_slug) DO NOTHING;

-- Backfill workout_activities
WITH matched AS (
    SELECT wa.id, ea.exercise_id
    FROM workout_activities wa
    JOIN exercise_aliases ea
      ON regexp_replace(lower(wa.activity_type), '[^a-z0-9]+', '', 'g') = ea.alias_slug
    WHERE ea.exercise_id IN ('pullups','pushups','situps')
)
UPDATE workout_activities wa
SET exercise_id = matched.exercise_id,
    activity_type = matched.exercise_id
FROM matched
WHERE wa.id = matched.id
  AND (wa.exercise_id IS DISTINCT FROM matched.exercise_id
       OR wa.activity_type IS DISTINCT FROM matched.exercise_id);

-- Backfill workout_template_activities
WITH matched AS (
    SELECT wta.id, ea.exercise_id
    FROM workout_template_activities wta
    JOIN exercise_aliases ea
      ON regexp_replace(lower(wta.activity_type), '[^a-z0-9]+', '', 'g') = ea.alias_slug
    WHERE ea.exercise_id IN ('pullups','pushups','situps')
)
UPDATE workout_template_activities wta
SET exercise_id = matched.exercise_id,
    activity_type = matched.exercise_id
FROM matched
WHERE wta.id = matched.id
  AND (wta.exercise_id IS DISTINCT FROM matched.exercise_id
       OR wta.activity_type IS DISTINCT FROM matched.exercise_id);
