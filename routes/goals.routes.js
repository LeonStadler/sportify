import express from 'express';
import authMiddleware from '../authMiddleware.js';

export const createGoalsRouter = (pool) => {
    const router = express.Router();

    // GET /api/goals - User goals
    router.get('/', authMiddleware, async (req, res) => {
        try {
            // Get user goals from database or use defaults
            const userQuery = `
                SELECT weekly_goals FROM users WHERE id = $1
            `;
            const { rows: userRows } = await pool.query(userQuery, [req.user.id]);
            const userWeeklyGoals = userRows[0]?.weekly_goals || null;

            // Default goals if not set
            const defaultGoals = {
                pullups: { target: 100, current: 0 },
                pushups: { target: 400, current: 0 },
                running: { target: 25, current: 0 },
                cycling: { target: 100, current: 0 }
            };

            const goals = userWeeklyGoals ? { ...defaultGoals, ...userWeeklyGoals } : defaultGoals;

            // Get current progress for current week (Monday to Sunday)
            const query = `
                SELECT 
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as current_pullups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as current_pushups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as current_running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as current_cycling
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1 
                    AND w.start_time::date >= DATE_TRUNC('week', CURRENT_DATE)
                    AND w.start_time::date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
            `;

            const { rows } = await pool.query(query, [req.user.id]);
            const progress = rows[0];

            goals.pullups.current = parseInt(progress.current_pullups) || 0;
            goals.pushups.current = parseInt(progress.current_pushups) || 0;
            goals.running.current = parseInt(progress.current_running) || 0;
            goals.cycling.current = parseInt(progress.current_cycling) || 0;

            res.json(goals);
        } catch (error) {
            console.error('Goals error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Ziele.' });
        }
    });

    // PUT /api/goals - Update user goals
    router.put('/', authMiddleware, async (req, res) => {
        try {
            const { pullups, pushups, running, cycling } = req.body;

            // Validate input
            if (typeof pullups?.target !== 'number' || pullups.target < 0 ||
                typeof pushups?.target !== 'number' || pushups.target < 0 ||
                typeof running?.target !== 'number' || running.target < 0 ||
                typeof cycling?.target !== 'number' || cycling.target < 0) {
                return res.status(400).json({ error: 'Ungültige Zielwerte. Alle Ziele müssen nicht-negative Zahlen sein.' });
            }

            const weeklyGoals = {
                pullups: { target: pullups.target },
                pushups: { target: pushups.target },
                running: { target: running.target },
                cycling: { target: cycling.target }
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
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as current_pullups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as current_pushups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as current_running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as current_cycling
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1 
                    AND w.start_time::date >= DATE_TRUNC('week', CURRENT_DATE)
                    AND w.start_time::date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
            `;

            const { rows } = await pool.query(getQuery, [req.user.id]);
            const progress = rows[0];

            const response = {
                pullups: { target: pullups.target, current: parseInt(progress.current_pullups) || 0 },
                pushups: { target: pushups.target, current: parseInt(progress.current_pushups) || 0 },
                running: { target: running.target, current: parseInt(progress.current_running) || 0 },
                cycling: { target: cycling.target, current: parseInt(progress.current_cycling) || 0 }
            };

            res.json(response);
        } catch (error) {
            console.error('Update goals error:', error);
            res.status(500).json({ error: 'Serverfehler beim Speichern der Ziele.' });
        }
    });

    return router;
};

