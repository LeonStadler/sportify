import { randomUUID } from 'crypto';
import { addDays } from 'date-fns';
import {
    DEFAULT_MONTHLY_POINT_CHALLENGE,
    DEFAULT_WEEKLY_POINT_CHALLENGE,
    DEFAULT_WEEKLY_POINTS_GOAL,
} from '../config/badges.js';
import { badgeService } from './badgeService.js';
import { grantLeaderboardAward, grantMonthlyChampionAward } from './awardService.js';
import { queueEmailSummary } from './emailQueueService.js';
import {
    buildFriendAdjacency,
    computeDirectLeaderboard,
    evaluateWeeklyGoals,
    parseWeeklyGoals,
    resolveMonthlyWindow,
    resolveWeeklyWindow,
} from './eventUtils.js';

const OFFSET_ENV_KEYS = ['EVENTS_UTC_OFFSET_MINUTES', 'EVENTS_TIMEZONE_OFFSET_MINUTES'];

const parseNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getOffsetMinutes = () => {
    for (const key of OFFSET_ENV_KEYS) {
        if (process.env[key] !== undefined) {
            return parseNumber(process.env[key], 0);
        }
    }
    return 0;
};

const toISODate = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);

const ensureJobRun = async (pool, jobName, scheduledFor, { force = false, metadata = {} } = {}) => {
    const { rows } = await pool.query(
        `INSERT INTO job_runs (id, job_name, scheduled_for, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (job_name, scheduled_for)
         DO NOTHING
         RETURNING id`,
        [randomUUID(), jobName, scheduledFor, JSON.stringify(metadata)]
    );

    if (rows.length > 0) {
        return { id: rows[0].id, skipped: false };
    }

    if (!force) {
        return { id: null, skipped: true };
    }

    const { rows: existing } = await pool.query(
        `SELECT id FROM job_runs WHERE job_name = $1 AND scheduled_for = $2`,
        [jobName, scheduledFor]
    );

    if (existing.length === 0) {
        return { id: null, skipped: false };
    }

    await pool.query(
        `UPDATE job_runs
         SET status = 'running', started_at = NOW(), metadata = $2
         WHERE id = $1`,
        [existing[0].id, JSON.stringify(metadata)]
    );

    return { id: existing[0].id, skipped: false };
};

const finalizeJobRun = async (pool, jobRunId, { status = 'completed', metadata = {} } = {}) => {
    if (!jobRunId) return;
    await pool.query(
        `UPDATE job_runs
         SET status = $2, completed_at = NOW(), metadata = $3
         WHERE id = $1`,
        [jobRunId, status, JSON.stringify(metadata)]
    );
};

const fetchFriendships = async (pool) => {
    const { rows: columns } = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'friendships'`
    );
    const columnNames = columns.map((row) => row.column_name);
    if (columnNames.length === 0) {
        return [];
    }

    let query = '';
    if (columnNames.includes('requester_id') && columnNames.includes('addressee_id')) {
        const hasStatus = columnNames.includes('status');
        query = `SELECT requester_id AS user_one_id, addressee_id AS user_two_id
                 FROM friendships${hasStatus ? " WHERE status = 'accepted'" : ''}`;
    } else {
        const hasStatus = columnNames.includes('status');
        query = `SELECT user_one_id, user_two_id
                 FROM friendships${hasStatus ? " WHERE status = 'accepted'" : ''}`;
    }

    const { rows } = await pool.query(query);
    return rows.map((row) => ({
        userOneId: row.user_one_id,
        userTwoId: row.user_two_id,
    }));
};

const buildActivityTotalsMap = (rows) => {
    const map = new Map();
    for (const row of rows) {
        if (!map.has(row.user_id)) {
            map.set(row.user_id, {});
        }
        const totals = map.get(row.user_id);
        totals[row.activity_type] = parseNumber(row.total_quantity, 0);
    }
    return map;
};

export const processWeeklyEvents = async (pool, { referenceDate = new Date(), force = false } = {}) => {
    const offsetMinutes = getOffsetMinutes();
    const { utcStart: weekStart, utcEnd: weekEndExclusive, localStart } = resolveWeeklyWindow(referenceDate, offsetMinutes);
    const weekEndInclusive = addDays(weekEndExclusive, -1);

    const jobRun = await ensureJobRun(pool, 'weekly-events', weekEndExclusive, {
        force,
        metadata: { weekStart: localStart.toISOString() },
    });
    if (jobRun.skipped) {
        return { skipped: true, reason: 'already-processed' };
    }

    try {
        const summaryQuery = `
            WITH bounds AS (
                SELECT $1::timestamptz AS start_at, $2::timestamptz AS end_at
            ), workouts_in_range AS (
                SELECT w.*
                FROM workouts w
                CROSS JOIN bounds b
                WHERE w.start_time >= b.start_at AND w.start_time < b.end_at
            )
            SELECT
                u.id AS user_id,
                u.email,
                u.first_name,
                u.last_name,
                u.nickname,
                u.display_preference,
                u.weekly_goals,
                COALESCE(SUM(wa.points_earned), 0) AS total_points,
                COUNT(DISTINCT wir.id) AS total_workouts
            FROM users u
            LEFT JOIN workouts_in_range wir ON wir.user_id = u.id
            LEFT JOIN workout_activities wa ON wa.workout_id = wir.id
            GROUP BY u.id
        `;

        const activityTotalsQuery = `
            WITH bounds AS (
                SELECT $1::timestamptz AS start_at, $2::timestamptz AS end_at
            ), workouts_in_range AS (
                SELECT w.*
                FROM workouts w
                CROSS JOIN bounds b
                WHERE w.start_time >= b.start_at AND w.start_time < b.end_at
            )
            SELECT
                wir.user_id,
                wa.activity_type,
                SUM(wa.quantity) AS total_quantity
            FROM workouts_in_range wir
            JOIN workout_activities wa ON wa.workout_id = wir.id
            GROUP BY wir.user_id, wa.activity_type
        `;

        const [{ rows }, activityTotalsResult] = await Promise.all([
            pool.query(summaryQuery, [weekStart, weekEndExclusive]),
            pool.query(activityTotalsQuery, [weekStart, weekEndExclusive]),
        ]);

        const activityTotalsMap = buildActivityTotalsMap(activityTotalsResult.rows);
        const friendships = await fetchFriendships(pool);
        const friendGraph = buildFriendAdjacency(friendships);

        const userPointMap = new Map();
        const weeklyBadgesMap = new Map();
        const weeklyAwardsMap = new Map();
        const goalEvaluationMap = new Map();

        const summaries = rows.map((row) => {
            const totalsByType = activityTotalsMap.get(row.user_id) ?? {};
            const totalPoints = parseNumber(row.total_points, 0);
            const totalWorkouts = parseNumber(row.total_workouts, 0);
            const totalExercises = Object.values(totalsByType).reduce((sum, value) => sum + parseNumber(value, 0), 0);

            return {
                userId: row.user_id,
                email: row.email,
                firstName: row.first_name,
                lastName: row.last_name,
                nickname: row.nickname,
                displayPreference: row.display_preference,
                weeklyGoals: parseWeeklyGoals(row.weekly_goals),
                totalsByType,
                totalPoints,
                totalWorkouts,
                totalExercises,
            };
        });

        for (const summary of summaries) {
            userPointMap.set(summary.userId, summary.totalPoints);

            const evaluation = evaluateWeeklyGoals({
                weeklyGoals: summary.weeklyGoals,
                activityTotals: summary.totalsByType,
                totalPoints: summary.totalPoints,
                defaultPointsGoal: DEFAULT_WEEKLY_POINTS_GOAL,
                challengeThreshold: DEFAULT_WEEKLY_POINT_CHALLENGE,
            });
            goalEvaluationMap.set(summary.userId, evaluation);

            const badgesEarned = [];
            if (evaluation.exerciseGoalsMet) {
                const earned = await badgeService.handleWeeklyProgress(
                    pool,
                    summary.userId,
                    'weekly-goal-exercises',
                    true
                );
                badgesEarned.push(...earned);
            }
            if (evaluation.pointsGoalMet) {
                const earned = await badgeService.handleWeeklyProgress(
                    pool,
                    summary.userId,
                    'weekly-goal-points',
                    true
                );
                badgesEarned.push(...earned);
            }
            if (evaluation.challengeMet) {
                const earned = await badgeService.handleWeeklyProgress(
                    pool,
                    summary.userId,
                    'weekly-challenge-points',
                    true
                );
                badgesEarned.push(...earned);
            }

            weeklyBadgesMap.set(summary.userId, badgesEarned);

            await pool.query(
                `INSERT INTO weekly_results (
                    id, user_id, week_start, week_end, total_points, total_workouts, total_exercises,
                    goal_exercises_met, goal_points_met, challenge_points_met, badges_awarded
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 ON CONFLICT (user_id, week_start)
                 DO UPDATE SET
                    total_points = EXCLUDED.total_points,
                    total_workouts = EXCLUDED.total_workouts,
                    total_exercises = EXCLUDED.total_exercises,
                    goal_exercises_met = EXCLUDED.goal_exercises_met,
                    goal_points_met = EXCLUDED.goal_points_met,
                    challenge_points_met = EXCLUDED.challenge_points_met,
                    badges_awarded = EXCLUDED.badges_awarded,
                    awards_awarded = COALESCE(weekly_results.awards_awarded, '[]'::jsonb),
                    created_at = NOW()`,
                [
                    randomUUID(),
                    summary.userId,
                    toISODate(weekStart),
                    toISODate(weekEndInclusive),
                    summary.totalPoints,
                    summary.totalWorkouts,
                    summary.totalExercises,
                    evaluation.exerciseGoalsMet,
                    evaluation.pointsGoalMet,
                    evaluation.challengeMet,
                    JSON.stringify(badgesEarned),
                ]
            );
        }

        const leaderboardEvaluations = computeDirectLeaderboard(userPointMap, friendGraph);
        const leaderboardAwards = [];

        for (const [userId, leaderboard] of leaderboardEvaluations.entries()) {
            await pool.query(
                `INSERT INTO leaderboard_results (id, week_start, user_id, rank, total_points, participant_count)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (week_start, user_id)
                 DO UPDATE SET
                    rank = LEAST(leaderboard_results.rank, EXCLUDED.rank),
                    total_points = EXCLUDED.total_points,
                    participant_count = EXCLUDED.participant_count,
                    created_at = NOW()`,
                [
                    randomUUID(),
                    toISODate(weekStart),
                    userId,
                    leaderboard.rank,
                    leaderboard.points,
                    leaderboard.participantCount,
                ]
            );

            const effectiveThreshold = Math.min(3, leaderboard.participantCount);
            if (
                leaderboard.rank > 0 &&
                leaderboard.rank <= effectiveThreshold &&
                leaderboard.participantCount >= 2 &&
                leaderboard.points > 0
            ) {
                leaderboardAwards.push({ userId, rank: leaderboard.rank, points: leaderboard.points });
            }
        }

        for (const award of leaderboardAwards) {
            const result = await grantLeaderboardAward(
                pool,
                award.userId,
                award.rank,
                weekStart,
                weekEndInclusive,
                award.points
            );
            if (result) {
                const awards = weeklyAwardsMap.get(award.userId) || [];
                awards.push(result);
                weeklyAwardsMap.set(award.userId, awards);
            }
        }

        for (const [userId, awards] of weeklyAwardsMap.entries()) {
            if (!awards.length) continue;
            await pool.query(
                `UPDATE weekly_results
                 SET awards_awarded = $3
                 WHERE user_id = $1 AND week_start = $2`,
                [userId, toISODate(weekStart), JSON.stringify(awards)]
            );
        }

        const emailPromises = summaries.map(async (summary) => {
            if (!summary.email) return null;
            const badges = weeklyBadgesMap.get(summary.userId) || [];
            const awards = weeklyAwardsMap.get(summary.userId) || [];
            const evaluation = goalEvaluationMap.get(summary.userId);
            const leaderboard = leaderboardEvaluations.get(summary.userId);

            const lines = [
                `Hallo ${summary.firstName ?? 'Athlet'},`,
                '',
                `• Gesamtpunkte der Woche: ${summary.totalPoints}`,
                `• Workouts: ${summary.totalWorkouts}`,
                evaluation.hasExerciseGoals
                    ? `• Wochenziel (Übungen): ${evaluation.exerciseGoalsMet ? 'erreicht' : 'nicht erreicht'}`
                    : '• Wochenziel (Übungen): nicht definiert',
                evaluation.pointsTarget > 0
                    ? `• Wochenziel (Punkte): ${evaluation.pointsGoalMet ? 'erreicht' : 'nicht erreicht'} (${summary.totalPoints}/${evaluation.pointsTarget})`
                    : '• Wochenziel (Punkte): nicht definiert',
                `• Wochen-Challenge (${DEFAULT_WEEKLY_POINT_CHALLENGE} Punkte): ${evaluation.challengeMet ? 'geschafft' : 'offen'}`,
                leaderboard &&
                leaderboard.rank <= Math.min(3, leaderboard.participantCount) &&
                leaderboard.participantCount >= 2
                    ? `• Leaderboard Platz: ${leaderboard.rank} von ${leaderboard.participantCount}`
                    : undefined,
                `• Neue Badges: ${badges.length > 0 ? badges.map((badge) => badge.label).join(', ') : 'keine'}`,
                `• Neue Auszeichnungen: ${awards.length > 0 ? awards.map((award) => award.label).join(', ') : 'keine'}`,
                '',
                'Bleib dran und viel Erfolg für die nächste Woche!',
            ].filter(Boolean);

            const body = lines.join('\n');
            return queueEmailSummary(pool, {
                userId: summary.userId,
                recipient: summary.email,
                subject: 'Deine Wochenbilanz ist da!',
                body,
            });
        });

        await Promise.all(emailPromises);

        await finalizeJobRun(pool, jobRun.id, {
            metadata: {
                processedUsers: summaries.length,
                weekStart: toISODate(weekStart),
            },
        });

        return {
            skipped: false,
            processedUsers: summaries.length,
            weekStart,
            weekEnd: weekEndInclusive,
        };
    } catch (error) {
        await finalizeJobRun(pool, jobRun.id, { status: 'failed', metadata: { error: error.message } });
        throw error;
    }
};

export const processMonthlyEvents = async (pool, { referenceDate = new Date(), force = false } = {}) => {
    const offsetMinutes = getOffsetMinutes();
    const { utcStart: monthStart, utcEnd: monthEndExclusive, localStart } = resolveMonthlyWindow(referenceDate, offsetMinutes);
    const monthEndInclusive = addDays(monthEndExclusive, -1);

    const jobRun = await ensureJobRun(pool, 'monthly-events', monthEndExclusive, {
        force,
        metadata: { monthStart: localStart.toISOString() },
    });
    if (jobRun.skipped) {
        return { skipped: true, reason: 'already-processed' };
    }

    try {
        const summaryQuery = `
            WITH bounds AS (
                SELECT $1::timestamptz AS start_at, $2::timestamptz AS end_at
            ), workouts_in_range AS (
                SELECT w.*
                FROM workouts w
                CROSS JOIN bounds b
                WHERE w.start_time >= b.start_at AND w.start_time < b.end_at
            )
            SELECT
                u.id AS user_id,
                u.email,
                u.first_name,
                u.last_name,
                COALESCE(SUM(wa.points_earned), 0) AS total_points
            FROM users u
            LEFT JOIN workouts_in_range wir ON wir.user_id = u.id
            LEFT JOIN workout_activities wa ON wa.workout_id = wir.id
            GROUP BY u.id
        `;

        const { rows } = await pool.query(summaryQuery, [monthStart, monthEndExclusive]);

        const monthlyAwardsMap = new Map();
        const summaries = rows.map((row) => ({
            userId: row.user_id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            totalPoints: parseNumber(row.total_points, 0),
        }));

        for (const summary of summaries) {
            const challengeMet = summary.totalPoints >= DEFAULT_MONTHLY_POINT_CHALLENGE;

            const awardsGranted = [];
            if (challengeMet) {
                const award = await grantMonthlyChampionAward(
                    pool,
                    summary.userId,
                    monthStart,
                    monthEndInclusive,
                    summary.totalPoints
                );
                if (award) {
                    awardsGranted.push(award);
                }
            }

            monthlyAwardsMap.set(summary.userId, awardsGranted);

            await pool.query(
                `INSERT INTO monthly_results (
                    id, user_id, month_start, month_end, total_points, challenge_points_met, badges_awarded, awards_awarded
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (user_id, month_start)
                 DO UPDATE SET
                    total_points = EXCLUDED.total_points,
                    challenge_points_met = EXCLUDED.challenge_points_met,
                    badges_awarded = EXCLUDED.badges_awarded,
                    awards_awarded = EXCLUDED.awards_awarded,
                    created_at = NOW()`,
                [
                    randomUUID(),
                    summary.userId,
                    toISODate(monthStart),
                    toISODate(monthEndInclusive),
                    summary.totalPoints,
                    challengeMet,
                    JSON.stringify([]),
                    JSON.stringify(awardsGranted),
                ]
            );
        }

        const emailPromises = summaries.map(async (summary) => {
            if (!summary.email) return null;
            const awards = monthlyAwardsMap.get(summary.userId) || [];
            const challengeMet = summary.totalPoints >= DEFAULT_MONTHLY_POINT_CHALLENGE;

            const lines = [
                `Hallo ${summary.firstName ?? 'Athlet'},`,
                '',
                `• Monats-Punktestand: ${summary.totalPoints}`,
                `• Monats-Challenge (${DEFAULT_MONTHLY_POINT_CHALLENGE} Punkte): ${challengeMet ? 'geschafft' : 'offen'}`,
                `• Neue Auszeichnungen: ${awards.length > 0 ? awards.map((award) => award.label).join(', ') : 'keine'}`,
                '',
                'Großartige Arbeit in diesem Monat – weiter so!',
            ];

            const body = lines.join('\n');
            return queueEmailSummary(pool, {
                userId: summary.userId,
                recipient: summary.email,
                subject: 'Dein Monatsabschluss',
                body,
            });
        });

        await Promise.all(emailPromises);

        await finalizeJobRun(pool, jobRun.id, {
            metadata: {
                processedUsers: summaries.length,
                monthStart: toISODate(monthStart),
            },
        });

        return {
            skipped: false,
            processedUsers: summaries.length,
            monthStart,
            monthEnd: monthEndInclusive,
        };
    } catch (error) {
        await finalizeJobRun(pool, jobRun.id, { status: 'failed', metadata: { error: error.message } });
        throw error;
    }
};
