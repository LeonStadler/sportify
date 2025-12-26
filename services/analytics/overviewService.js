import { buildPeriodCondition, toCamelCase } from '../../utils/helpers.js';
import { toNumber } from './utils.js';

export const getOverviewStats = async (pool, userId, requestedPeriod) => {
    const { condition: periodCondition, window } = buildPeriodCondition('w.start_time', requestedPeriod, {
        isTimestamp: true
    });

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

    const periodQuery = `
        SELECT
            COALESCE(SUM(wa.points_earned), 0) as period_points,
            COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as period_pullups,
            COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as period_pushups,
            COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as period_running,
            COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as period_cycling,
            COALESCE(SUM(CASE WHEN wa.activity_type = 'situps' THEN wa.quantity ELSE 0 END), 0) as period_situps,
            COUNT(DISTINCT w.id) as period_workouts
        FROM workouts w
        LEFT JOIN workout_activities wa ON w.id = wa.workout_id
        WHERE w.user_id = $1
          AND ${periodCondition}
    `;

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

    const [totalResult, periodResult, rankResult] = await Promise.all([
        pool.query(totalQuery, [userId]),
        pool.query(periodQuery, [userId]),
        pool.query(rankQuery, [userId])
    ]);

    const totalStats = toCamelCase(totalResult.rows[0] || {});
    const periodStats = toCamelCase(periodResult.rows[0] || {});
    const rankData = rankResult.rows[0] || { rank: 1, total_users: 1 };

    return {
        totalPoints: toNumber(totalStats.totalPoints),
        periodPoints: toNumber(periodStats.periodPoints),
        totalWorkouts: toNumber(totalStats.totalWorkouts),
        periodWorkouts: toNumber(periodStats.periodWorkouts),
        userRank: toNumber(rankData.rank || 1),
        totalUsers: toNumber(rankData.total_users || 1),
        period: window.period,
        activities: {
            pullups: {
                total: toNumber(totalStats.totalPullups),
                period: toNumber(periodStats.periodPullups)
            },
            pushups: {
                total: toNumber(totalStats.totalPushups),
                period: toNumber(periodStats.periodPushups)
            },
            situps: {
                total: toNumber(totalStats.totalSitups),
                period: toNumber(periodStats.periodSitups)
            },
            running: {
                total: toNumber(totalStats.totalRunning),
                period: toNumber(periodStats.periodRunning)
            },
            cycling: {
                total: toNumber(totalStats.totalCycling),
                period: toNumber(periodStats.periodCycling)
            }
        }
    };
};
