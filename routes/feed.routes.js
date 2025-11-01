import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { toCamelCase } from '../utils/helpers.js';

export const createFeedRouter = (pool, ensureFriendInfrastructure) => {
    const router = express.Router();

    // GET /api/feed - Activity feed
    router.get('/', authMiddleware, async (req, res) => {
        try {
            await ensureFriendInfrastructure();

            const { page = 1, limit: limitQuery } = req.query;
            const limit = Math.max(1, Math.min(parseInt(limitQuery, 10) || 20, 50));
            const currentPage = Math.max(1, parseInt(page, 10) || 1);
            const offset = (currentPage - 1) * limit;

            const query = `
                WITH friend_ids AS (
                    SELECT CASE WHEN user_one_id = $1 THEN user_two_id ELSE user_one_id END AS friend_id
                    FROM friendships
                    WHERE user_one_id = $1 OR user_two_id = $1
                )
                SELECT
                    wa.id,
                    wa.activity_type,
                    wa.quantity as amount,
                    COALESCE(wa.points_earned, 0) as points,
                    COALESCE(wa.created_at, w.created_at) as created_at,
                    w.title as workout_title,
                    u.first_name,
                    u.last_name,
                    u.nickname,
                    u.display_preference,
                    u.avatar_url
                FROM workout_activities wa
                JOIN workouts w ON wa.workout_id = w.id
                JOIN users u ON w.user_id = u.id
                WHERE w.user_id = $1 OR w.user_id IN (SELECT friend_id FROM friend_ids)
                ORDER BY COALESCE(wa.created_at, w.created_at) DESC
                LIMIT $2 OFFSET $3
            `;

            const { rows } = await pool.query(query, [req.user.id, limit, offset]);

            const activities = rows.map(row => {
                const activity = toCamelCase(row);

                let displayName = activity.firstName || activity.nickname || 'Athlet';
                if (activity.displayPreference === 'nickname' && activity.nickname) {
                    displayName = activity.nickname;
                } else if (activity.displayPreference === 'fullName') {
                    const fullName = [activity.firstName, activity.lastName].filter(Boolean).join(' ').trim();
                    displayName = fullName || displayName;
                }

                return {
                    id: activity.id,
                    userName: displayName,
                    userAvatar: activity.avatarUrl || null,
                    userFirstName: activity.firstName,
                    userLastName: activity.lastName,
                    activityType: activity.activityType,
                    amount: activity.amount ?? 0,
                    points: activity.points ?? 0,
                    workoutTitle: activity.workoutTitle,
                    createdAt: activity.createdAt || activity.workoutDate
                };
            });

            res.json({ activities });
        } catch (error) {
            console.error('Activity feed error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden des Activity Feeds.' });
        }
    });

    return router;
};

