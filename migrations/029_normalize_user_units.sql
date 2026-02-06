UPDATE users
SET preferences = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(preferences, '{}'::jsonb),
      '{units,distance}',
      to_jsonb(
        CASE
          WHEN (preferences->'units'->>'distance') IN ('miles', 'mi') THEN 'miles'
          WHEN (preferences->'units'->>'distance') IN ('yards', 'yard', 'yd') THEN 'miles'
          WHEN (preferences->'units'->>'distance') IN ('m', 'meter', 'meters', 'metre', 'metres') THEN 'km'
          WHEN (preferences->'units'->>'distance') IN ('km', 'kilometer', 'kilometers', 'kilometre', 'kilometres') THEN 'km'
          ELSE 'km'
        END
      ),
      true
    ),
    '{units,weight}',
    to_jsonb(
      CASE
        WHEN (preferences->'units'->>'weight') IN ('lb', 'lbs', 'pound', 'pounds') THEN 'lbs'
        ELSE 'kg'
      END
    ),
    true
  ),
  '{units,temperature}',
  to_jsonb(
    CASE
      WHEN (preferences->'units'->>'temperature') IN ('fahrenheit', 'f') THEN 'fahrenheit'
      ELSE 'celsius'
    END
  ),
  true
);
