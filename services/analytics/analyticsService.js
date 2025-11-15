import { getPeriodWindowExpressions } from '../../utils/helpers.js';
import {
    buildRangeQuery,
    buildWorkoutSummaryQuery,
    buildWorkoutTimelineQuery,
    buildLongestWorkoutQuery,
    buildRecoverySummaryQuery,
    buildRecoveryTimelineQuery,
    buildMoodDistributionQuery
} from './queries.js';
import {
    calculateReadinessScore,
    computeChange,
    computeNullableChange,
    mapLongestWorkout,
    mapMoodDistribution,
    mapRecoverySummary,
    mapRecoveryTimeline,
    mapWorkoutSummary,
    mapWorkoutTimeline,
    roundNumber
} from './utils.js';

const buildActivityBreakdown = (summary) => ({
    pullups: summary.pullups,
    pushups: summary.pushups,
    running: summary.running,
    cycling: summary.cycling,
    situps: summary.situps
});

const buildWorkoutHighlights = (timeline, summary, longestWorkoutRow) => {
    const longestWorkout = mapLongestWorkout(longestWorkoutRow);
    const peakDay = timeline.reduce((current, entry) => {
        if (!current || entry.points > current.points) {
            return entry;
        }
        return current;
    }, null);

    return {
        longestWorkout,
        peakDay,
        activeDays: summary.activeDays
    };
};

const buildBalanceDaily = (workoutTimeline, recoveryTimeline) => {
    const recoveryByDate = new Map(recoveryTimeline.map((entry) => [entry.date, entry]));

    return workoutTimeline.map((entry) => {
        const recoveryEntry = recoveryByDate.get(entry.date);
        const readinessScore = recoveryEntry
            ? calculateReadinessScore({
                  energy: recoveryEntry.avgEnergy,
                  focus: recoveryEntry.avgFocus,
                  sleep: recoveryEntry.avgSleep,
                  soreness: recoveryEntry.avgSoreness,
                  exertion: recoveryEntry.avgExertion,
                  hydration: recoveryEntry.avgHydration
              })
            : null;

        return {
            date: entry.date,
            points: entry.points,
            workouts: entry.workouts,
            durationMinutes: entry.durationMinutes,
            avgEnergy: recoveryEntry?.avgEnergy ?? null,
            avgSleep: recoveryEntry?.avgSleep ?? null,
            avgSoreness: recoveryEntry?.avgSoreness ?? null,
            readinessScore
        };
    });
};

const buildWorkoutsComparison = (current, previous) => ({
    points: { current: current.points, previous: previous.points, change: computeChange(current.points, previous.points) },
    workouts: {
        current: current.workouts,
        previous: previous.workouts,
        change: computeChange(current.workouts, previous.workouts)
    },
    durationMinutes: {
        current: current.durationMinutes,
        previous: previous.durationMinutes,
        change: computeChange(current.durationMinutes, previous.durationMinutes)
    }
});

export const getAnalyticsForPeriod = async (pool, userId, requestedPeriod) => {
    const window = getPeriodWindowExpressions(requestedPeriod);
    const { period, start, end, previousStart, previousEnd } = window;

    const [
        rangeResult,
        workoutTimelineResult,
        workoutSummaryResult,
        workoutPreviousSummaryResult,
        longestWorkoutResult,
        recoverySummaryResult,
        recoveryPreviousSummaryResult,
        recoveryTimelineResult,
        moodDistributionResult
    ] = await Promise.all([
        pool.query(buildRangeQuery(window)),
        pool.query(buildWorkoutTimelineQuery(start, end), [userId]),
        pool.query(buildWorkoutSummaryQuery(start, end), [userId]),
        pool.query(buildWorkoutSummaryQuery(previousStart, previousEnd), [userId]),
        pool.query(buildLongestWorkoutQuery(start, end), [userId]),
        pool.query(buildRecoverySummaryQuery(start, end), [userId]),
        pool.query(buildRecoverySummaryQuery(previousStart, previousEnd), [userId]),
        pool.query(buildRecoveryTimelineQuery(start, end), [userId]),
        pool.query(buildMoodDistributionQuery(start, end), [userId])
    ]);

    const rangeRow = rangeResult.rows[0] || {};
    const range = {
        start: rangeRow.start_date,
        end: rangeRow.end_date,
        previousStart: rangeRow.previous_start_date,
        previousEnd: rangeRow.previous_end_date
    };

    const workoutTimeline = mapWorkoutTimeline(workoutTimelineResult.rows);
    const workoutSummary = mapWorkoutSummary(workoutSummaryResult.rows[0]);
    const previousWorkoutSummary = mapWorkoutSummary(workoutPreviousSummaryResult.rows[0]);

    const averageDurationPerWorkout = workoutSummary.workouts
        ? roundNumber(workoutSummary.durationMinutes / workoutSummary.workouts, 1)
        : null;
    const averagePointsPerWorkout = workoutSummary.workouts
        ? roundNumber(workoutSummary.points / workoutSummary.workouts, 1)
        : null;

    const activityBreakdown = buildActivityBreakdown(workoutSummary);

    const workoutsTotals = {
        ...workoutSummary,
        averageDurationPerWorkout,
        averagePointsPerWorkout,
        consistency: workoutTimeline.length
            ? roundNumber((workoutSummary.activeDays / workoutTimeline.length) * 100, 1)
            : null
    };

    const workoutHighlights = buildWorkoutHighlights(
        workoutTimeline,
        workoutSummary,
        longestWorkoutResult.rows[0] || null
    );

    const recoverySummary = mapRecoverySummary(recoverySummaryResult.rows[0]);
    const recoveryPreviousSummary = mapRecoverySummary(recoveryPreviousSummaryResult.rows[0]);
    const recoveryTimeline = mapRecoveryTimeline(recoveryTimelineResult.rows);
    const moodDistribution = mapMoodDistribution(moodDistributionResult.rows);

    const recoveryComparison = {
        entries: computeChange(recoverySummary.entries, recoveryPreviousSummary.entries),
        energy: computeNullableChange(recoverySummary.avgEnergy, recoveryPreviousSummary.avgEnergy),
        focus: computeNullableChange(recoverySummary.avgFocus, recoveryPreviousSummary.avgFocus),
        sleep: computeNullableChange(recoverySummary.avgSleep, recoveryPreviousSummary.avgSleep),
        soreness: computeNullableChange(recoverySummary.avgSoreness, recoveryPreviousSummary.avgSoreness),
        exertion: computeNullableChange(recoverySummary.avgExertion, recoveryPreviousSummary.avgExertion),
        hydration: computeNullableChange(recoverySummary.avgHydration, recoveryPreviousSummary.avgHydration)
    };

    const recoverySummaryReadiness = calculateReadinessScore({
        energy: recoverySummary.avgEnergy,
        focus: recoverySummary.avgFocus,
        sleep: recoverySummary.avgSleep,
        soreness: recoverySummary.avgSoreness,
        exertion: recoverySummary.avgExertion,
        hydration: recoverySummary.avgHydration
    });

    const recoveryPreviousReadiness = calculateReadinessScore({
        energy: recoveryPreviousSummary.avgEnergy,
        focus: recoveryPreviousSummary.avgFocus,
        sleep: recoveryPreviousSummary.avgSleep,
        soreness: recoveryPreviousSummary.avgSoreness,
        exertion: recoveryPreviousSummary.avgExertion,
        hydration: recoveryPreviousSummary.avgHydration
    });

    const balanceDaily = buildBalanceDaily(workoutTimeline, recoveryTimeline);
    const readinessValues = balanceDaily
        .map((entry) => entry.readinessScore)
        .filter((value) => value !== null && value !== undefined);
    const readinessAverage = readinessValues.length
        ? roundNumber(readinessValues.reduce((sum, value) => sum + value, 0) / readinessValues.length, 1)
        : null;

    const readinessChange = computeNullableChange(readinessAverage, recoveryPreviousReadiness);

    return {
        period,
        range,
        workouts: {
            totals: workoutsTotals,
            timeline: workoutTimeline,
            activityBreakdown,
            highlights: workoutHighlights,
            comparison: buildWorkoutsComparison(workoutSummary, previousWorkoutSummary)
        },
        recovery: {
            summary: {
                ...recoverySummary,
                avgReadiness: recoverySummaryReadiness,
                dominantMood: moodDistribution.length ? moodDistribution[0].mood : null
            },
            comparison: recoveryComparison,
            timeline: recoveryTimeline,
            moodDistribution
        },
        balance: {
            daily: balanceDaily,
            readiness: {
                average: readinessAverage,
                previousAverage: recoveryPreviousReadiness,
                change: readinessChange
            }
        }
    };
};
