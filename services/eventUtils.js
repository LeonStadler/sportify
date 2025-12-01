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
}) => {
    const normalized = weeklyGoals && typeof weeklyGoals === 'object' ? weeklyGoals : {};
    const pointsTarget = Number(normalized?.points?.target ?? normalized?.points?.value ?? defaultPointsGoal ?? 0);
    const pointsGoalMet = pointsTarget > 0 && totalPoints >= pointsTarget;
    const challengeMet = challengeThreshold > 0 && totalPoints >= challengeThreshold;

    let hasExerciseGoals = false;
    let exerciseGoalsMet = true;
    const entries = Object.entries(normalized).filter(([key]) => key !== 'points');
    for (const [activityType, goal] of entries) {
        const target = Number(goal?.target ?? goal?.value ?? 0);
        if (target > 0) {
            hasExerciseGoals = true;
            const totalQuantity = Number(activityTotals?.[activityType] ?? 0);
            if (totalQuantity < target) {
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
