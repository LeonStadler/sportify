import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { USER_DISPLAY_NAME_SQL, WEEK_WINDOW_CONDITION, weeklyChallengeTargets } from '../utils/helpers.js';

export const createChallengesRouter = (pool) => {
    const router = express.Router();

    const getWeeklyWindow = async () => {
        // PostgreSQL's date_trunc('week', ...) startet standardmäßig am Montag (ISO 8601)
        // Um explizit Montag bis Sonntag zu gewährleisten:
        const windowQuery = `
            SELECT
                date_trunc('week', CURRENT_DATE)::date AS start_date,
                (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date AS end_date
        `;

        const { rows } = await pool.query(windowQuery);
        return rows[0];
    };

    router.get('/weekly', authMiddleware, async (req, res) => {
        try {
            const { start_date: weekStart, end_date: weekEnd } = await getWeeklyWindow();

            const progressQuery = `
                SELECT
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) AS pullups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) AS pushups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) AS running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) AS cycling,
                    COALESCE(SUM(wa.points_earned), 0) AS total_points,
                    COUNT(DISTINCT w.id) AS workouts_completed
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE w.user_id = $1
                  AND ${WEEK_WINDOW_CONDITION}
            `;

            const leaderboardQuery = `
                SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} AS display_name,
                    u.avatar_url,
                    COALESCE(SUM(wa.points_earned), 0) AS total_points,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) AS total_running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) AS total_pullups
                FROM users u
                LEFT JOIN workouts w ON u.id = w.user_id
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE ${WEEK_WINDOW_CONDITION}
                GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
                HAVING COALESCE(SUM(wa.points_earned), 0) > 0
                ORDER BY total_points DESC
                LIMIT 10
            `;

            const userStandingQuery = `
                WITH ranked AS (
                    SELECT
                        u.id,
                        ${USER_DISPLAY_NAME_SQL} AS display_name,
                        u.avatar_url,
                        COALESCE(SUM(wa.points_earned), 0) AS total_points,
                        COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) AS total_running,
                        COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) AS total_pullups,
                        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(wa.points_earned), 0) DESC) AS position
                    FROM users u
                    LEFT JOIN workouts w ON u.id = w.user_id
                    LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                    WHERE ${WEEK_WINDOW_CONDITION}
                    GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
                )
                SELECT * FROM ranked WHERE id = $1 AND total_points > 0
            `;

            const [progressResult, leaderboardResult, userStandingResult] = await Promise.all([
                pool.query(progressQuery, [req.user.id]),
                pool.query(leaderboardQuery),
                pool.query(userStandingQuery, [req.user.id])
            ]);

            const progressRow = progressResult.rows[0] || {};
            const totalPoints = Number(progressRow.total_points) || 0;
            const userProgress = {
                pullups: Number(progressRow.pullups) || 0,
                pushups: Number(progressRow.pushups) || 0,
                running: Number(progressRow.running) || 0,
                cycling: Number(progressRow.cycling) || 0,
                workoutsCompleted: Number(progressRow.workouts_completed) || 0,
                totalPoints
            };

            const leaderboard = leaderboardResult.rows.map((row, index) => ({
                id: row.id,
                displayName: row.display_name || 'Athlet',
                avatarUrl: row.avatar_url,
                totalPoints: Number(row.total_points) || 0,
                totalRunning: Number(row.total_running) || 0,
                totalPullups: Number(row.total_pullups) || 0,
                rank: index + 1,
                isCurrentUser: row.id === req.user.id
            }));

            const userOnLeaderboard = leaderboard.some(entry => entry.isCurrentUser);
            const userStandingRow = userStandingResult.rows[0];

            if (!userOnLeaderboard && userStandingRow) {
                leaderboard.push({
                    id: userStandingRow.id,
                    displayName: userStandingRow.display_name || 'Athlet',
                    avatarUrl: userStandingRow.avatar_url,
                    totalPoints: Number(userStandingRow.total_points) || 0,
                    totalRunning: Number(userStandingRow.total_running) || 0,
                    totalPullups: Number(userStandingRow.total_pullups) || 0,
                    rank: Number(userStandingRow.position) || leaderboard.length + 1,
                    isCurrentUser: true
                });
            }

            const now = new Date();
            const endDate = new Date(weekEnd);
            endDate.setHours(23, 59, 59, 999);
            const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

            const activityProgress = {
                pullups: {
                    target: weeklyChallengeTargets.pullups,
                    current: userProgress.pullups,
                    percentage: Math.min((userProgress.pullups / weeklyChallengeTargets.pullups) * 100, 100)
                },
                pushups: {
                    target: weeklyChallengeTargets.pushups,
                    current: userProgress.pushups,
                    percentage: Math.min((userProgress.pushups / weeklyChallengeTargets.pushups) * 100, 100)
                },
                running: {
                    target: weeklyChallengeTargets.running,
                    current: userProgress.running,
                    percentage: Math.min((userProgress.running / weeklyChallengeTargets.running) * 100, 100)
                },
                cycling: {
                    target: weeklyChallengeTargets.cycling,
                    current: userProgress.cycling,
                    percentage: Math.min((userProgress.cycling / weeklyChallengeTargets.cycling) * 100, 100)
                }
            };

            const totalCompletion = Math.min((totalPoints / weeklyChallengeTargets.points) * 100, 100);

            res.json({
                week: {
                    start: weekStart,
                    end: weekEnd,
                    daysRemaining
                },
                targets: { ...weeklyChallengeTargets },
                progress: {
                    ...userProgress,
                    completionPercentage: totalCompletion
                },
                activities: activityProgress,
                leaderboard
            });
        } catch (error) {
            console.error('Weekly challenge error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Wochen-Challenge.' });
        }
    });

    return router;
};

