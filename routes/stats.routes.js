import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { toCamelCase, WEEK_WINDOW_CONDITION } from '../utils/helpers.js';

export const createStatsRouter = (pool) => {
    const router = express.Router();

    // GET /api/stats - User statistics
    router.get('/', authMiddleware, async (req, res) => {
        try {
            // Total statistics
            const totalQuery = `
                SELECT 
                    COUNT(DISTINCT w.id) as total_workouts,
                    COALESCE(SUM(wa.points_earned), 0) as total_points,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as total_pullups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as total_pushups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as total_running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as total_cycling,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'situps' THEN wa.quantity ELSE 0 END), 0) as total_situps,
                    COALESCE(AVG(w.duration), 0) as avg_workout_duration
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1
            `;

            // Weekly statistics
            const weekQuery = `
                SELECT 
                    COALESCE(SUM(wa.points_earned), 0) as week_points,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as week_pullups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as week_pushups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as week_running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as week_cycling
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1
                  AND ${WEEK_WINDOW_CONDITION}
            `;

            // User rank and total users
            const rankQuery = `
                WITH user_points AS (
                    SELECT 
                        u.id,
                        COALESCE(SUM(wa.points_earned), 0) as total_points
                    FROM users u
                    LEFT JOIN workouts w ON u.id = w.user_id
                    LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                    GROUP BY u.id
                ),
                ranked_users AS (
                    SELECT 
                        id,
                        total_points,
                        ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank,
                        COUNT(*) OVER() as total_users
                    FROM user_points
                )
                SELECT rank, total_users
                FROM ranked_users
                WHERE id = $1
            `;

            const [totalResult, weekResult, rankResult] = await Promise.all([
                pool.query(totalQuery, [req.user.id]),
                pool.query(weekQuery, [req.user.id]),
                pool.query(rankQuery, [req.user.id])
            ]);

            const totalStats = toCamelCase(totalResult.rows[0] || {});
            const weekStats = toCamelCase(weekResult.rows[0] || {});
            const rankData = rankResult.rows[0] || { rank: 1, total_users: 1 };

            const response = {
                totalPoints: Number(totalStats.totalPoints) || 0,
                weekPoints: Number(weekStats.weekPoints) || 0,
                totalWorkouts: Number(totalStats.totalWorkouts) || 0,
                userRank: Number(rankData.rank) || 1,
                totalUsers: Number(rankData.total_users) || 1,
                activities: {
                    pullups: {
                        total: Number(totalStats.totalPullups) || 0,
                        week: Number(weekStats.weekPullups) || 0
                    },
                    pushups: {
                        total: Number(totalStats.totalPushups) || 0,
                        week: Number(weekStats.weekPushups) || 0
                    },
                    running: {
                        total: Number(totalStats.totalRunning) || 0,
                        week: Number(weekStats.weekRunning) || 0
                    },
                    cycling: {
                        total: Number(totalStats.totalCycling) || 0,
                        week: Number(weekStats.weekCycling) || 0
                    }
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Stats error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Statistiken.' });
        }
    });

    return router;
};

