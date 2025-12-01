const buildRangeQuery = ({ start, end, previousStart, previousEnd }) => `
    SELECT
        (${start})::date AS start_date,
        ((${end}) - INTERVAL '1 day')::date AS end_date,
        (${previousStart})::date AS previous_start_date,
        ((${previousEnd}) - INTERVAL '1 day')::date AS previous_end_date
`;

const buildWorkoutSummaryQuery = (startExpr, endExpr) => `
WITH period AS (
    SELECT (${startExpr})::timestamptz AS start_ts,
           (${endExpr})::timestamptz AS end_ts
),
period_workouts AS (
    SELECT w.id, w.title, w.start_time, w.duration
    FROM workouts w, period
    WHERE w.user_id = $1
      AND w.start_time >= period.start_ts
      AND w.start_time < period.end_ts
),
activity_totals AS (
    SELECT
        wa.workout_id,
        SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'pullups') AS pullups,
        SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'pushups') AS pushups,
        SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'running') AS running,
        SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'cycling') AS cycling,
        SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'situps') AS situps,
        SUM(wa.points_earned) AS points
    FROM workout_activities wa
    WHERE wa.workout_id IN (SELECT id FROM period_workouts)
    GROUP BY wa.workout_id
)
SELECT
    COUNT(*)::int AS workout_count,
    COALESCE(SUM(pw.duration), 0)::int AS total_duration,
    COALESCE(SUM(at.points), 0)::numeric AS total_points,
    COALESCE(SUM(at.pullups), 0)::numeric AS pullups,
    COALESCE(SUM(at.pushups), 0)::numeric AS pushups,
    COALESCE(SUM(at.running), 0)::numeric AS running,
    COALESCE(SUM(at.cycling), 0)::numeric AS cycling,
    COALESCE(SUM(at.situps), 0)::numeric AS situps,
    COUNT(DISTINCT pw.start_time::date)::int AS active_days
FROM period_workouts pw
LEFT JOIN activity_totals at ON at.workout_id = pw.id;
`;

const buildWorkoutTimelineQuery = (startExpr, endExpr) => `
WITH period AS (
    SELECT (${startExpr})::timestamptz AS start_ts,
           (${endExpr})::timestamptz AS end_ts
),
date_range AS (
    SELECT generate_series(start_ts::date, (end_ts - INTERVAL '1 day')::date, '1 day') AS day
    FROM period
),
period_workouts AS (
    SELECT w.id, w.start_time, w.duration
    FROM workouts w, period
    WHERE w.user_id = $1
      AND w.start_time >= period.start_ts
      AND w.start_time < period.end_ts
),
activity_agg AS (
    SELECT
        w.start_time::date AS day,
        COALESCE(SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'pullups'), 0) AS pullups,
        COALESCE(SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'pushups'), 0) AS pushups,
        COALESCE(SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'running'), 0) AS running,
        COALESCE(SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'cycling'), 0) AS cycling,
        COALESCE(SUM(wa.quantity) FILTER (WHERE wa.activity_type = 'situps'), 0) AS situps,
        COALESCE(SUM(wa.points_earned), 0) AS points
    FROM period_workouts w
    LEFT JOIN workout_activities wa ON wa.workout_id = w.id
    GROUP BY w.start_time::date
),
daily_stats AS (
    SELECT
        start_time::date AS day,
        COUNT(*)::int AS workout_count,
        SUM(COALESCE(duration, 0))::int AS total_duration
    FROM period_workouts
    GROUP BY start_time::date
)
SELECT
    d.day,
    COALESCE(a.pullups, 0)::numeric AS pullups,
    COALESCE(a.pushups, 0)::numeric AS pushups,
    COALESCE(a.running, 0)::numeric AS running,
    COALESCE(a.cycling, 0)::numeric AS cycling,
    COALESCE(a.situps, 0)::numeric AS situps,
    COALESCE(a.points, 0)::numeric AS points,
    COALESCE(ds.workout_count, 0)::int AS workouts,
    COALESCE(ds.total_duration, 0)::int AS duration_minutes
FROM date_range d
LEFT JOIN activity_agg a ON a.day = d.day
LEFT JOIN daily_stats ds ON ds.day = d.day
ORDER BY d.day;
`;

const buildLongestWorkoutQuery = (startExpr, endExpr) => `
WITH period AS (
    SELECT (${startExpr})::timestamptz AS start_ts,
           (${endExpr})::timestamptz AS end_ts
)
SELECT
    w.id,
    w.title,
    w.start_time,
    COALESCE(w.duration, 0)::int AS duration_minutes
FROM workouts w, period
WHERE w.user_id = $1
  AND w.start_time >= period.start_ts
  AND w.start_time < period.end_ts
ORDER BY COALESCE(w.duration, 0) DESC, w.start_time DESC
LIMIT 1;
`;

const buildRecoverySummaryQuery = (startExpr, endExpr) => `
WITH period AS (
    SELECT (${startExpr})::date AS start_date,
           (${endExpr})::date AS end_date
)
SELECT
    COUNT(*)::int AS total_entries,
    ROUND(AVG(energy_level)::numeric, 2) AS avg_energy_level,
    ROUND(AVG(focus_level)::numeric, 2) AS avg_focus_level,
    ROUND(AVG(sleep_quality)::numeric, 2) AS avg_sleep_quality,
    ROUND(AVG(soreness_level)::numeric, 2) AS avg_soreness_level,
    ROUND(AVG(perceived_exertion)::numeric, 2) AS avg_perceived_exertion,
    ROUND(AVG(NULLIF(metrics->>'sleepDurationHours', '')::numeric)::numeric, 2) AS avg_sleep_duration,
    ROUND(AVG(NULLIF(metrics->>'restingHeartRate', '')::numeric)::numeric, 2) AS avg_resting_heart_rate,
    ROUND(AVG(NULLIF(metrics->>'hydrationLevel', '')::numeric)::numeric, 2) AS avg_hydration_level
FROM training_journal_entries tje, period
WHERE tje.user_id = $1
  AND tje.entry_date >= period.start_date
  AND tje.entry_date < period.end_date;
`;

const buildRecoveryTimelineQuery = (startExpr, endExpr) => `
WITH period AS (
    SELECT (${startExpr})::date AS start_date,
           (${endExpr})::date AS end_date
),
date_range AS (
    SELECT generate_series(start_date, end_date - INTERVAL '1 day', '1 day') AS day
    FROM period
),
entry_stats AS (
    SELECT
        tje.entry_date,
        COUNT(*)::int AS entry_count,
        ROUND(AVG(tje.energy_level)::numeric, 2) AS avg_energy_level,
        ROUND(AVG(tje.focus_level)::numeric, 2) AS avg_focus_level,
        ROUND(AVG(tje.sleep_quality)::numeric, 2) AS avg_sleep_quality,
        ROUND(AVG(tje.soreness_level)::numeric, 2) AS avg_soreness_level,
        ROUND(AVG(tje.perceived_exertion)::numeric, 2) AS avg_perceived_exertion,
        ROUND(AVG(NULLIF(tje.metrics->>'sleepDurationHours', '')::numeric)::numeric, 2) AS avg_sleep_duration,
        ROUND(AVG(NULLIF(tje.metrics->>'restingHeartRate', '')::numeric)::numeric, 2) AS avg_resting_heart_rate,
        ROUND(AVG(NULLIF(tje.metrics->>'hydrationLevel', '')::numeric)::numeric, 2) AS avg_hydration_level
    FROM training_journal_entries tje, period
    WHERE tje.user_id = $1
      AND tje.entry_date >= period.start_date
      AND tje.entry_date < period.end_date
    GROUP BY tje.entry_date
),
mood_ranked AS (
    SELECT
        tje.entry_date,
        tje.mood,
        COUNT(*) AS mood_count,
        ROW_NUMBER() OVER (PARTITION BY tje.entry_date ORDER BY COUNT(*) DESC, tje.mood ASC) AS rn
    FROM training_journal_entries tje, period
    WHERE tje.user_id = $1
      AND tje.entry_date >= period.start_date
      AND tje.entry_date < period.end_date
    GROUP BY tje.entry_date, tje.mood
)
SELECT
    d.day AS entry_date,
    es.entry_count,
    es.avg_energy_level,
    es.avg_focus_level,
    es.avg_sleep_quality,
    es.avg_soreness_level,
    es.avg_perceived_exertion,
    es.avg_sleep_duration,
    es.avg_resting_heart_rate,
    es.avg_hydration_level,
    mr.mood AS dominant_mood
FROM date_range d
LEFT JOIN entry_stats es ON es.entry_date = d.day
LEFT JOIN mood_ranked mr ON mr.entry_date = d.day AND mr.rn = 1
ORDER BY d.day;
`;

const buildMoodDistributionQuery = (startExpr, endExpr) => `
WITH period AS (
    SELECT (${startExpr})::date AS start_date,
           (${endExpr})::date AS end_date
)
SELECT mood, COUNT(*)::int AS count
FROM training_journal_entries tje, period
WHERE tje.user_id = $1
  AND tje.entry_date >= period.start_date
  AND tje.entry_date < period.end_date
GROUP BY mood
ORDER BY count DESC;
`;

export {
    buildRangeQuery,
    buildWorkoutSummaryQuery,
    buildWorkoutTimelineQuery,
    buildLongestWorkoutQuery,
    buildRecoverySummaryQuery,
    buildRecoveryTimelineQuery,
    buildMoodDistributionQuery
};
