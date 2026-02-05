import { addDays, addMonths, startOfMonth, startOfWeek, subWeeks } from 'date-fns';

const toDate = (value) => (value instanceof Date ? new Date(value.getTime()) : new Date(value));

const applyOffset = (date, offsetMinutes) => {
    const base = toDate(date);
    return new Date(base.getTime() + offsetMinutes * 60_000);
};

const revertOffset = (date, offsetMinutes) => {
    const base = toDate(date);
    return new Date(base.getTime() - offsetMinutes * 60_000);
};

export const resolveWeeklyWindow = (referenceDate, offsetMinutes) => {
    const offsetReference = applyOffset(referenceDate, offsetMinutes);
    const currentWeekStartLocal = startOfWeek(offsetReference, { weekStartsOn: 1 });
    const previousWeekStartLocal = subWeeks(currentWeekStartLocal, 1);
    const previousWeekEndLocal = addDays(previousWeekStartLocal, 7);

    return {
        utcStart: revertOffset(previousWeekStartLocal, offsetMinutes),
        utcEnd: revertOffset(previousWeekEndLocal, offsetMinutes),
        localStart: previousWeekStartLocal,
        localEnd: previousWeekEndLocal,
    };
};

export const resolveMonthlyWindow = (referenceDate, offsetMinutes) => {
    const offsetReference = applyOffset(referenceDate, offsetMinutes);
    const evaluationReference = offsetReference.getDate() === 1 ? addDays(offsetReference, -1) : offsetReference;
    const monthStartLocal = startOfMonth(evaluationReference);
    const exclusiveLocalEnd = startOfMonth(addMonths(monthStartLocal, 1));

    return {
        utcStart: revertOffset(monthStartLocal, offsetMinutes),
        utcEnd: revertOffset(exclusiveLocalEnd, offsetMinutes),
        localStart: monthStartLocal,
        localEnd: exclusiveLocalEnd,
    };
};

export const parseWeeklyGoals = (raw) => {
    if (!raw) return {};
    if (typeof raw === 'object' && raw !== null) {
        return raw;
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        return {};
    }
};

export const evaluateWeeklyGoals = ({
    weeklyGoals,
    activityTotals,
    totalPoints,
    defaultPointsGoal,
    challengeThreshold,
    distanceUnit = "km",
}) => {
    const normalized = weeklyGoals && typeof weeklyGoals === 'object' ? weeklyGoals : {};
    const pointsTarget = Number(normalized?.points?.target ?? normalized?.points?.value ?? defaultPointsGoal ?? 0);
    const pointsGoalMet = pointsTarget > 0 && totalPoints >= pointsTarget;
    const challengeMet = challengeThreshold > 0 && totalPoints >= challengeThreshold;

    let hasExerciseGoals = false;
    let exerciseGoalsMet = true;
    const exerciseGoals = Array.isArray(normalized?.exercises) ? normalized.exercises : [];
    for (const goal of exerciseGoals) {
        const exerciseId = goal?.exerciseId;
        const target = Number(goal?.target ?? goal?.value ?? 0);
        if (exerciseId && target > 0) {
            hasExerciseGoals = true;
            const totals = activityTotals?.[exerciseId] || {};
            const unit = goal?.unit || "reps";
            const value =
                unit === "time"
                    ? Number(totals.duration || 0) / 60
                    : unit === "distance"
                      ? distanceUnit === "miles"
                        ? Number(totals.distance || 0) / 1.60934
                        : Number(totals.distance || 0)
                      : Number(totals.reps || 0);

            if (value < target) {
                exerciseGoalsMet = false;
            }
        }
    }

    return {
        pointsTarget,
        pointsGoalMet,
        challengeMet,
        exerciseGoalsMet: hasExerciseGoals && exerciseGoalsMet,
        hasExerciseGoals,
    };
};

export const buildFriendAdjacency = (friendships) => {
    const graph = new Map();
    for (const { userOneId, userTwoId } of friendships) {
        if (!graph.has(userOneId)) graph.set(userOneId, new Set());
        if (!graph.has(userTwoId)) graph.set(userTwoId, new Set());
        graph.get(userOneId).add(userTwoId);
        graph.get(userTwoId).add(userOneId);
    }
    return graph;
};

export const computeDirectLeaderboard = (userPointsMap, friendGraph) => {
    const results = new Map();

    for (const [userId, points] of userPointsMap.entries()) {
        const neighbours = friendGraph.get(userId) ?? new Set();
        const participants = new Set(neighbours);
        participants.add(userId);

        if (participants.size <= 1) {
            results.set(userId, {
                rank: 1,
                points,
                participantCount: 1,
                leaderboard: [{ userId, points }],
            });
            continue;
        }

        const leaderboard = Array.from(participants)
            .map((participantId) => ({
                userId: participantId,
                points: userPointsMap.get(participantId) ?? 0,
            }))
            .sort((a, b) => {
                if (b.points === a.points) {
                    return a.userId.localeCompare(b.userId);
                }
                return b.points - a.points;
            });

        const rank = leaderboard.findIndex((entry) => entry.userId === userId) + 1;

        results.set(userId, {
            rank,
            points,
            participantCount: leaderboard.length,
            leaderboard,
        });
    }

    return results;
};

/**
 * Berechnet Rankings für eine Liste von Benutzern basierend auf einer Metrik.
 * @param {Array} users Liste der Benutzerobjekte
 * @param {Function} metricFn Funktion zum Extrahieren des Wertes (z.B. user => user.totalPoints)
 */
export const computeRankingForGroup = (users, metricFn) => {
    // Filtern nach Benutzern mit Wert > 0, um Rauschen zu vermeiden (optional, aber sinnvoll für Leaderboards)
    // Wir behalten alle, sortieren aber Nullen nach unten.
    const withMetrics = users.map(user => ({
        userId: user.userId,
        value: metricFn(user)
    }));

    // Sortieren: Höchster Wert zuerst
    withMetrics.sort((a, b) => {
        if (b.value === a.value) return a.userId.localeCompare(b.userId);
        return b.value - a.value;
    });

    const rankMap = new Map();
    withMetrics.forEach((entry, index) => {
        // Rang ist index + 1
        // Bei gleichen Werten könnte man den gleichen Rang vergeben, hier vereinfacht strikt
        rankMap.set(entry.userId, {
            rank: index + 1,
            value: entry.value,
            totalParticipants: withMetrics.length
        });
    });

    return rankMap;
};
