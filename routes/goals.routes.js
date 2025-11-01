import express from 'express';
import authMiddleware from '../authMiddleware.js';

export const createGoalsRouter = (pool) => {
    const router = express.Router();

    // GET /api/goals - User goals (mock data for now)
    router.get('/', authMiddleware, async (req, res) => {
        try {
            // For now, return mock goals - can be enhanced later with database storage
            const goals = {
                pullups: { target: 100, current: 0 },
                pushups: { target: 500, current: 0 },
                running: { target: 50, current: 0 },
                cycling: { target: 100, current: 0 }
            };

            // Get current progress
            const query = `
                SELECT 
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as current_pullups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as current_pushups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as current_running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as current_cycling
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1 AND w.workout_date >= DATE_TRUNC('month', CURRENT_DATE)
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

    return router;
};

