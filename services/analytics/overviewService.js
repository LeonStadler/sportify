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
            COALESCE(AVG(w.duration), 0) as avg_workout_duration
        FROM workouts w
        LEFT JOIN workout_activities wa ON w.id = wa.workout_id
        WHERE w.user_id = $1
    `;

    const periodQuery = `
        SELECT
            COALESCE(SUM(wa.points_earned), 0) as period_points,
            COUNT(DISTINCT w.id) as period_workouts
        FROM workouts w
        LEFT JOIN workout_activities wa ON w.id = wa.workout_id
        WHERE w.user_id = $1
          AND ${periodCondition}
    `;

    const activityQuery = `
        SELECT
            wa.activity_type,
            COALESCE(SUM(wa.points_earned), 0) as total_points,
            COALESCE(SUM(wa.points_earned) FILTER (WHERE ${periodCondition}), 0) as period_points,
            COALESCE(SUM(wa.reps), 0) as total_reps,
            COALESCE(SUM(wa.reps) FILTER (WHERE ${periodCondition}), 0) as period_reps,
            COALESCE(SUM(wa.duration), 0) as total_duration,
            COALESCE(SUM(wa.duration) FILTER (WHERE ${periodCondition}), 0) as period_duration,
            COALESCE(SUM(wa.distance), 0) as total_distance,
            COALESCE(SUM(wa.distance) FILTER (WHERE ${periodCondition}), 0) as period_distance,
            ex.name as exercise_name,
            ex.measurement_type,
            ex.supports_time,
            ex.supports_distance
        FROM workouts w
        LEFT JOIN workout_activities wa ON w.id = wa.workout_id
        LEFT JOIN exercises ex ON ex.id = wa.activity_type
        WHERE w.user_id = $1
        GROUP BY wa.activity_type, ex.name, ex.measurement_type, ex.supports_time, ex.supports_distance
        ORDER BY period_points DESC NULLS LAST, total_points DESC NULLS LAST
        LIMIT 10
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

    const [totalResult, periodResult, rankResult, activityResult] = await Promise.all([
        pool.query(totalQuery, [userId]),
        pool.query(periodQuery, [userId]),
        pool.query(rankQuery, [userId]),
        pool.query(activityQuery, [userId])
    ]);

    const totalStats = toCamelCase(totalResult.rows[0] || {});
    const periodStats = toCamelCase(periodResult.rows[0] || {});
    const rankData = rankResult.rows[0] || { rank: 1, total_users: 1 };

    const activities = (activityResult.rows || []).map((row) => ({
        id: row.activity_type,
        name: row.exercise_name || row.activity_type,
        measurementType: row.measurement_type,
        supportsTime: row.supports_time,
        supportsDistance: row.supports_distance,
        totalPoints: toNumber(row.total_points),
        periodPoints: toNumber(row.period_points),
        totalReps: toNumber(row.total_reps),
        periodReps: toNumber(row.period_reps),
        totalDuration: toNumber(row.total_duration),
        periodDuration: toNumber(row.period_duration),
        totalDistance: toNumber(row.total_distance),
        periodDistance: toNumber(row.period_distance),
    }));

    return {
        totalPoints: toNumber(totalStats.totalPoints),
        periodPoints: toNumber(periodStats.periodPoints),
        totalWorkouts: toNumber(totalStats.totalWorkouts),
        periodWorkouts: toNumber(periodStats.periodWorkouts),
        userRank: toNumber(rankData.rank || 1),
        totalUsers: toNumber(rankData.total_users || 1),
        period: window.period,
        activities
    };
};
