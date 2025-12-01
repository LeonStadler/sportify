import { toCamelCase } from '../../utils/helpers.js';

export const toNumber = (value, fallback = 0) => {
    if (value === null || value === undefined) {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};

export const toNumberOrNull = (value) => {
    if (value === null || value === undefined) {
        return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

export const roundNumber = (value, precision = 2) => {
    if (value === null || value === undefined) {
        return null;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return null;
    }
    return Number(numeric.toFixed(precision));
};

export const computeChange = (current, previous) => {
    const currentValue = Number(current ?? 0);
    const previousValue = Number(previous ?? 0);
    const difference = currentValue - previousValue;

    if (!previousValue) {
        return {
            difference,
            percent: previousValue === 0 ? null : roundNumber((difference / previousValue) * 100, 1)
        };
    }

    return {
        difference,
        percent: roundNumber((difference / previousValue) * 100, 1)
    };
};

export const computeNullableChange = (current, previous) => {
    if (current === null || current === undefined || previous === null || previous === undefined) {
        return null;
    }
    return computeChange(current, previous);
};

export const calculateReadinessScore = ({ energy, focus, sleep, soreness, exertion, hydration }) => {
    const weights = {
        energy: 0.25,
        focus: 0.15,
        sleep: 0.2,
        soreness: 0.15,
        exertion: 0.15,
        hydration: 0.1
    };

    let score = 0;
    let weightSum = 0;

    if (energy !== null && energy !== undefined) {
        score += energy * weights.energy;
        weightSum += weights.energy;
    }

    if (focus !== null && focus !== undefined) {
        score += focus * weights.focus;
        weightSum += weights.focus;
    }

    if (sleep !== null && sleep !== undefined) {
        score += sleep * weights.sleep;
        weightSum += weights.sleep;
    }

    if (soreness !== null && soreness !== undefined) {
        score += (10 - soreness) * weights.soreness;
        weightSum += weights.soreness;
    }

    if (exertion !== null && exertion !== undefined) {
        score += (10 - exertion) * weights.exertion;
        weightSum += weights.exertion;
    }

    if (hydration !== null && hydration !== undefined) {
        score += hydration * weights.hydration;
        weightSum += weights.hydration;
    }

    if (weightSum === 0) {
        return null;
    }

    const normalized = score / weightSum;
    return Math.max(0, Math.min(100, Math.round(normalized * 10)));
};

export const mapWorkoutSummary = (row) => {
    const data = toCamelCase(row || {});
    return {
        workouts: toNumber(data.workoutCount),
        durationMinutes: toNumber(data.totalDuration),
        points: toNumber(data.totalPoints),
        pullups: toNumber(data.pullups),
        pushups: toNumber(data.pushups),
        running: toNumber(data.running),
        cycling: toNumber(data.cycling),
        situps: toNumber(data.situps),
        activeDays: toNumber(data.activeDays)
    };
};

export const mapWorkoutTimeline = (rows) =>
    rows.map((row) => {
        const item = toCamelCase(row);
        return {
            date: item.day,
            pullups: toNumber(item.pullups),
            pushups: toNumber(item.pushups),
            running: toNumber(item.running),
            cycling: toNumber(item.cycling),
            situps: toNumber(item.situps),
            points: toNumber(item.points),
            workouts: toNumber(item.workouts),
            durationMinutes: toNumber(item.durationMinutes)
        };
    });

export const mapRecoverySummary = (row) => {
    const data = toCamelCase(row || {});
    return {
        entries: toNumber(data.totalEntries),
        avgEnergy: roundNumber(data.avgEnergyLevel, 1),
        avgFocus: roundNumber(data.avgFocusLevel, 1),
        avgSleep: roundNumber(data.avgSleepQuality, 1),
        avgSoreness: roundNumber(data.avgSorenessLevel, 1),
        avgExertion: roundNumber(data.avgPerceivedExertion, 1),
        avgSleepDuration: roundNumber(data.avgSleepDuration, 1),
        avgRestingHeartRate: roundNumber(data.avgRestingHeartRate, 0),
        avgHydration: roundNumber(data.avgHydrationLevel, 1)
    };
};

export const mapRecoveryTimeline = (rows) =>
    rows.map((row) => {
        const item = toCamelCase(row);
        return {
            date: item.entryDate,
            entries: toNumber(item.entryCount),
            avgEnergy: toNumberOrNull(item.avgEnergyLevel),
            avgFocus: toNumberOrNull(item.avgFocusLevel),
            avgSleep: toNumberOrNull(item.avgSleepQuality),
            avgSoreness: toNumberOrNull(item.avgSorenessLevel),
            avgExertion: toNumberOrNull(item.avgPerceivedExertion),
            avgSleepDuration: toNumberOrNull(item.avgSleepDuration),
            avgRestingHeartRate: toNumberOrNull(item.avgRestingHeartRate),
            avgHydration: toNumberOrNull(item.avgHydrationLevel),
            mood: item.dominantMood || null
        };
    });

export const mapMoodDistribution = (rows) => {
    const moodRows = rows.map((row) => toCamelCase(row));
    const totalMoodEntries = moodRows.reduce((sum, row) => sum + toNumber(row.count), 0);
    return moodRows.map((row) => ({
        mood: row.mood,
        count: toNumber(row.count),
        percentage: totalMoodEntries ? roundNumber((toNumber(row.count) / totalMoodEntries) * 100, 1) : 0
    }));
};

export const mapLongestWorkout = (row) => {
    if (!row) {
        return null;
    }
    const item = toCamelCase(row);
    return {
        id: item.id,
        title: item.title,
        startTime: item.startTime,
        durationMinutes: toNumber(item.durationMinutes)
    };
};
