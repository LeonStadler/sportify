import { getPeriodWindowExpressions } from '../../utils/helpers.js';
import {
    buildRangeQuery,
    buildWorkoutSummaryQuery,
    buildWorkoutTimelineQuery,
    buildLongestWorkoutQuery,
    buildActivityBreakdownQuery,
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

const buildActivityBreakdown = (rows) => {
    const totals = rows.map((row) => ({
        activityId: row.activity_id,
        label: row.activity_label,
        measurementType: row.measurement_type,
        supportsTime: row.supports_time,
        supportsDistance: row.supports_distance,
        total: Number(row.total_points) || 0
    }));

    const grandTotal = totals.reduce((sum, entry) => sum + (entry.total ?? 0), 0);

    return totals.map((entry) => ({
        activityId: entry.activityId,
        label: entry.label,
        measurementType: entry.measurementType,
        supportsTime: entry.supportsTime,
        supportsDistance: entry.supportsDistance,
        total: entry.total,
        percentage: grandTotal ? roundNumber(((entry.total ?? 0) / grandTotal) * 100, 1) : 0
    }));
};

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
            avgExertion: recoveryEntry?.avgExertion ?? null,
            avgHydration: recoveryEntry?.avgHydration ?? null,
            avgRestingHeartRate: recoveryEntry?.avgRestingHeartRate ?? null,
            avgSleepDuration: recoveryEntry?.avgSleepDuration ?? null,
            avgFocus: recoveryEntry?.avgFocus ?? null,
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

const computePearsonCorrelation = (pairs) => {
    if (!Array.isArray(pairs) || pairs.length < 2) {
        return null;
    }

    const n = pairs.length;
    const sumX = pairs.reduce((acc, { x }) => acc + x, 0);
    const sumY = pairs.reduce((acc, { y }) => acc + y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    pairs.forEach(({ x, y }) => {
        const dx = x - meanX;
        const dy = y - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    });

    if (denomX === 0 || denomY === 0) {
        return null;
    }

    return roundNumber(numerator / Math.sqrt(denomX * denomY), 3);
};

const buildCorrelationPairs = (dailyEntries, trainingKey, recoveryKey) =>
    dailyEntries
        .map((entry) => ({
            date: entry.date,
            x: Number(entry[trainingKey]),
            y: Number(entry[recoveryKey])
        }))
        .filter(({ x, y }) => Number.isFinite(x) && Number.isFinite(y));

const buildCorrelationInsights = (balanceDaily) => {
    const trainingMetrics = ['points', 'durationMinutes', 'workouts'];
    const recoveryMetrics = [
        'avgEnergy',
        'avgFocus',
        'avgSleep',
        'avgSoreness',
        'avgExertion',
        'avgHydration',
        'avgRestingHeartRate',
        'avgSleepDuration'
    ];

    const correlations = [];

    trainingMetrics.forEach((trainingMetric) => {
        recoveryMetrics.forEach((recoveryMetric) => {
            const pairs = buildCorrelationPairs(balanceDaily, trainingMetric, recoveryMetric);
            const correlation = computePearsonCorrelation(pairs);
            if (correlation !== null) {
                correlations.push({
                    trainingMetric,
                    recoveryMetric,
                    correlation,
                    sampleSize: pairs.length
                });
            }
        });
    });

    const sortedCorrelations = correlations
        .filter((entry) => entry.sampleSize >= 2)
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    const primaryCorrelation = sortedCorrelations[0] || null;
    const primaryPairs = primaryCorrelation
        ? buildCorrelationPairs(balanceDaily, primaryCorrelation.trainingMetric, primaryCorrelation.recoveryMetric)
        : [];

    const readinessDrivers = recoveryMetrics
        .map((metric) => {
            const pairs = buildCorrelationPairs(balanceDaily, 'readinessScore', metric);
            const correlation = computePearsonCorrelation(pairs);
            return correlation !== null
                ? { metric, correlation, sampleSize: pairs.length }
                : null;
        })
        .filter(Boolean)
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
        .slice(0, 5);

    return {
        correlations: sortedCorrelations.slice(0, 8),
        primaryCorrelation: primaryCorrelation
            ? { ...primaryCorrelation, pairs: primaryPairs.slice(0, 50) }
            : null,
        readinessDrivers
    };
};

export const getAnalyticsForPeriod = async (pool, userId, requestedPeriod, { startDate, endDate } = {}) => {
    const window = getPeriodWindowExpressions(requestedPeriod, { startDate, endDate });
    const { period, start, end, previousStart, previousEnd } = window;

    const [
        rangeResult,
        workoutTimelineResult,
        workoutSummaryResult,
        workoutPreviousSummaryResult,
        longestWorkoutResult,
        activityBreakdownResult,
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
        pool.query(buildActivityBreakdownQuery(start, end), [userId]),
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

    const activityBreakdown = buildActivityBreakdown(activityBreakdownResult.rows || []);
    const activityMetrics = activityBreakdown.map((entry) => ({
        key: entry.activityId,
        label: entry.label,
        measurementType: entry.measurementType,
        supportsTime: entry.supportsTime,
        supportsDistance: entry.supportsDistance
    }));

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
    const insights = buildCorrelationInsights(balanceDaily);

    return {
        period,
        range,
        workouts: {
            totals: workoutsTotals,
            timeline: workoutTimeline,
            activityBreakdown,
            activityMetrics,
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
        },
        insights
    };
};
