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

            // Prüfe ob friendships-Tabelle existiert und ob der Benutzer Freunde hat
            let hasFriends = false;
            let friendIds = [];

            try {
                const friendCheckQuery = `
                    SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END AS friend_id
                    FROM friendships
                    WHERE (requester_id = $1 OR addressee_id = $1)
                    AND status = 'accepted'
                `;
                const friendResult = await pool.query(friendCheckQuery, [req.user.id]);
                friendIds = friendResult.rows.map(row => row.friend_id);
                hasFriends = friendIds.length > 0;
            } catch (error) {
                // Tabelle existiert möglicherweise nicht - setze hasFriends auf false
                console.warn('Could not check friendships:', error.message);
                hasFriends = false;
            }

            let query, queryParams;

            if (hasFriends && friendIds.length > 0) {
                // Nur Aktivitäten von Freunden, nicht die eigenen
                query = `
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
                    WHERE w.user_id = ANY($1::uuid[])
                    ORDER BY COALESCE(wa.created_at, w.created_at) DESC
                    LIMIT $2 OFFSET $3
                `;
                queryParams = [friendIds, limit, offset];
            } else {
                // Keine Freunde - leeres Ergebnis
                query = `
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
                    WHERE 1 = 0
                    LIMIT $1 OFFSET $2
                `;
                queryParams = [limit, offset];
            }

            const { rows } = await pool.query(query, queryParams);

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

            res.json({
                activities,
                hasFriends
            });
        } catch (error) {
            console.error('Activity feed error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden des Activity Feeds.' });
        }
    });

    return router;
};

