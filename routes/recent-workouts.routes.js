import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { toCamelCase } from '../utils/helpers.js';

export const createRecentWorkoutsRouter = (pool) => {
    const router = express.Router();

    // GET /api/recent-workouts - Recent workouts
    router.get('/', authMiddleware, async (req, res) => {
        try {
            const { limit: limitQuery } = req.query;
            const limit = Math.max(1, Math.min(parseInt(limitQuery, 10) || 5, 50));

            const query = `
                SELECT
                    w.id,
                    w.created_at,
                    w.notes,
                    ARRAY_AGG(
                        JSON_BUILD_OBJECT(
                            'activityType', wa.activity_type,
                            'amount', wa.quantity,
                            'unit', wa.unit,
                            'points', wa.points_earned
                        )
                        ORDER BY wa.order_index, wa.id
                    ) FILTER (WHERE wa.id IS NOT NULL) as activities
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1
                GROUP BY w.id, w.created_at, w.notes
                ORDER BY w.created_at DESC
                LIMIT $2
            `;

            const { rows } = await pool.query(query, [req.user.id, limit]);

            const workouts = rows.map(row => {
                const camelRow = toCamelCase(row);
                const activities = Array.isArray(camelRow.activities)
                    ? camelRow.activities.map(activity => ({
                        activityType: activity.activityType,
                        amount: activity.amount ?? activity.quantity ?? 0,
                        unit: activity.unit ?? null,
                        points: activity.points ?? null
                    }))
                    : [];

                return {
                    id: camelRow.id,
                    createdAt: camelRow.createdAt,
                    notes: camelRow.notes,
                    activities
                };
            });

            res.json(workouts);
        } catch (error) {
            console.error('Recent workouts error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der letzten Workouts.' });
        }
    });

    return router;
};

