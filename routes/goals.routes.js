import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { DEFAULT_WEEKLY_POINTS_GOAL } from '../config/badges.js';

export const createGoalsRouter = (pool) => {
    const router = express.Router();

    // GET /api/goals - User goals
    router.get('/', authMiddleware, async (req, res) => {
        try {
            // Get user goals from database or use defaults
            const userQuery = `
                SELECT weekly_goals, preferences FROM users WHERE id = $1
            `;
            const { rows: userRows } = await pool.query(userQuery, [req.user.id]);
            const userWeeklyGoals = userRows[0]?.weekly_goals || null;
            const preferences = userRows[0]?.preferences || {};
            const parsedPreferences =
                typeof preferences === "string" ? JSON.parse(preferences) : preferences;
            const distanceUnit = parsedPreferences?.units?.distance || "km";

            // Default goals if not set
            const defaultGoals = {
                points: { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
                exercises: []
            };

            const normalizedGoals = userWeeklyGoals && typeof userWeeklyGoals === 'object'
                ? userWeeklyGoals
                : {};
            const goals = {
                points: {
                    target: Number(normalizedGoals?.points?.target ?? defaultGoals.points.target),
                    current: 0
                },
                exercises: Array.isArray(normalizedGoals?.exercises) ? normalizedGoals.exercises : []
            };

            // Get current progress for current week (Monday to Sunday)
            const query = `
                SELECT 
                    COALESCE(SUM(wa.points_earned), 0) as current_points
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1 
                    AND w.start_time::date >= DATE_TRUNC('week', CURRENT_DATE)
                    AND w.start_time::date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
            `;

            const [pointsResult, activityTotals] = await Promise.all([
                pool.query(query, [req.user.id]),
                pool.query(
                    `
                    SELECT
                      wa.activity_type,
                      COALESCE(SUM(wa.reps), 0) AS total_reps,
                      COALESCE(SUM(wa.duration), 0) AS total_duration,
                      COALESCE(SUM(wa.distance), 0) AS total_distance
                    FROM workouts w
                    LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                    WHERE w.user_id = $1 
                      AND w.start_time::date >= DATE_TRUNC('week', CURRENT_DATE)
                      AND w.start_time::date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
                    GROUP BY wa.activity_type
                    `,
                    [req.user.id]
                )
            ]);

            const progress = pointsResult.rows[0];
            const totalsMap = new Map(
                activityTotals.rows.map((row) => [
                    row.activity_type,
                    {
                        reps: Number(row.total_reps) || 0,
                        duration: Number(row.total_duration) || 0,
                        distance: Number(row.total_distance) || 0,
                    }
                ])
            );

            goals.points.current = parseInt(progress.current_points) || 0;
            goals.exercises = goals.exercises.map((entry) => ({
                ...entry,
                current: (() => {
                    const totals = totalsMap.get(entry.exerciseId) || { reps: 0, duration: 0, distance: 0 };
                    const unit = entry.unit || "reps";
                    if (unit === "time") {
                        return Math.round((totals.duration || 0) / 60);
                    }
                    if (unit === "distance") {
                        const kmValue = totals.distance || 0;
                        if (distanceUnit === "miles") {
                            return kmValue / 1.60934;
                        }
                        return kmValue;
                    }
                    return totals.reps || 0;
                })()
            }));

            res.json(goals);
        } catch (error) {
            console.error('Goals error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Ziele.' });
        }
    });

    // PUT /api/goals - Update user goals
    router.put('/', authMiddleware, async (req, res) => {
        try {
            const { points, exercises } = req.body;

            if (typeof points?.target !== 'number' || points.target < 0) {
                return res.status(400).json({ error: 'Ungültiges Punkte‑Ziel.' });
            }

            if (exercises && !Array.isArray(exercises)) {
                return res.status(400).json({ error: 'Ungültige Übungsziele.' });
            }

            const normalizedExercises = Array.isArray(exercises)
                ? exercises.slice(0, 5).map((entry) => ({
                    exerciseId: String(entry.exerciseId || ''),
                    target: Number(entry.target) || 0,
                    unit: entry.unit === 'time' || entry.unit === 'distance' || entry.unit === 'reps'
                        ? entry.unit
                        : 'reps'
                }))
                : [];

            const weeklyGoals = {
                points: { target: points.target },
                exercises: normalizedExercises
            };

            // Update user's weekly_goals in database
            const updateQuery = `
                UPDATE users 
                SET weekly_goals = $1::jsonb
                WHERE id = $2
            `;

            await pool.query(updateQuery, [JSON.stringify(weeklyGoals), req.user.id]);

            // Return updated goals with current progress
            const getQuery = `
                SELECT 
                    COALESCE(SUM(wa.points_earned), 0) as current_points
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1 
                    AND w.start_time::date >= DATE_TRUNC('week', CURRENT_DATE)
                    AND w.start_time::date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
            `;

            const [pointsResult, activityTotals] = await Promise.all([
                pool.query(getQuery, [req.user.id]),
                pool.query(
                    `
                    SELECT
                      wa.activity_type,
                      COALESCE(SUM(wa.reps), 0) AS total_reps,
                      COALESCE(SUM(wa.duration), 0) AS total_duration,
                      COALESCE(SUM(wa.distance), 0) AS total_distance
                    FROM workouts w
                    LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                    WHERE w.user_id = $1 
                      AND w.start_time::date >= DATE_TRUNC('week', CURRENT_DATE)
                      AND w.start_time::date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
                    GROUP BY wa.activity_type
                    `,
                    [req.user.id]
                )
            ]);
            const progress = pointsResult.rows[0];
            const { rows: prefRows } = await pool.query(
                `SELECT preferences FROM users WHERE id = $1`,
                [req.user.id]
            );
            const prefValue = prefRows[0]?.preferences || {};
            const parsedPref = typeof prefValue === "string" ? JSON.parse(prefValue) : prefValue;
            const distanceUnit = parsedPref?.units?.distance || "km";

            const totalsMap = new Map(
                activityTotals.rows.map((row) => [
                    row.activity_type,
                    {
                        reps: Number(row.total_reps) || 0,
                        duration: Number(row.total_duration) || 0,
                        distance: Number(row.total_distance) || 0,
                    }
                ])
            );

            const response = {
                points: { target: points.target, current: parseInt(progress.current_points) || 0 },
                exercises: normalizedExercises.map((entry) => ({
                    ...entry,
                    current: (() => {
                        const totals = totalsMap.get(entry.exerciseId) || { reps: 0, duration: 0, distance: 0 };
                        const unit = entry.unit || "reps";
                        if (unit === "time") {
                            return Math.round((totals.duration || 0) / 60);
                        }
                        if (unit === "distance") {
                            const kmValue = totals.distance || 0;
                            if (distanceUnit === "miles") {
                                return kmValue / 1.60934;
                            }
                            return kmValue;
                        }
                        return totals.reps || 0;
                    })()
                }))
            };

            res.json(response);
        } catch (error) {
            console.error('Update goals error:', error);
            res.status(500).json({ error: 'Serverfehler beim Speichern der Ziele.' });
        }
    });

    return router;
};
