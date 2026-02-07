import { randomUUID } from "crypto";
import { addDays } from "date-fns";
import {
  DEFAULT_MONTHLY_POINT_CHALLENGE,
  DEFAULT_WEEKLY_POINT_CHALLENGE,
  DEFAULT_WEEKLY_POINTS_GOAL,
} from "../config/badges.js";
import { createSummaryUnsubscribeUrl } from "./emailPreferencesService.js";
import { sendJobFailureAlert } from "./alertService.js";
import {
  grantCategoryRankAward,
  grantLeaderboardAward,
  grantMonthlyChampionAward,
} from "./awardService.js";
import { badgeService } from "./badgeService.js";
import { queueEmailSummary } from "./emailQueueService.js";
import {
  buildFriendAdjacency,
  computeDirectLeaderboard,
  computeRankingForGroup,
  evaluateWeeklyGoals,
  parseWeeklyGoals,
  resolveMonthlyWindow,
  resolveWeeklyWindow,
} from "./eventUtils.js";

const OFFSET_ENV_KEYS = [
  "EVENTS_UTC_OFFSET_MINUTES",
  "EVENTS_TIMEZONE_OFFSET_MINUTES",
];

const ACTIVITY_LABELS = {
  pullups: "Klimmzüge",
  pushups: "Liegestütze",
  situps: "Sit-ups",
  running: "Laufen (km)",
  cycling: "Radfahren (km)",
};

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parsePreferences = (value) => {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch (_error) {
      return {};
    }
  }

  return {};
};

const hasSummaryEmailsEnabled = (preferences) =>
  preferences?.notifications?.email !== false;

const getSummaryUnsubscribeUrl = (userId) => {
  try {
    return createSummaryUnsubscribeUrl({ userId });
  } catch (error) {
    console.error(
      `Could not create summary unsubscribe URL for user ${userId}:`,
      error
    );
    return null;
  }
};

const getOffsetMinutes = () => {
  for (const key of OFFSET_ENV_KEYS) {
    if (process.env[key] !== undefined) {
      return parseNumber(process.env[key], 0);
    }
  }
  return 0;
};

const toISODate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

const JOB_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const ensureJobRun = async (
  pool,
  jobName,
  scheduledFor,
  { force = false, metadata = {} } = {}
) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO job_runs (id, job_name, scheduled_for, status, metadata)
           VALUES ($1, $2, $3, 'running', $4)
           ON CONFLICT (job_name, scheduled_for)
           DO NOTHING
           RETURNING id`,
      [randomUUID(), jobName, scheduledFor, JSON.stringify(metadata)]
    );

    if (rows.length > 0) {
      console.log(`Job run created: ${jobName} for ${scheduledFor} (ID: ${rows[0].id})`);
      return { id: rows[0].id, skipped: false };
    }

    if (!force) {
      console.log(`Job run skipped: ${jobName} for ${scheduledFor} (already exists)`);
      return { id: null, skipped: true };
    }

    const { rows: existing } = await pool.query(
      `SELECT id, status FROM job_runs WHERE job_name = $1 AND scheduled_for = $2`,
      [jobName, scheduledFor]
    );

    if (existing.length === 0) {
      // Should not happen, but create if missing
      const { rows: newRows } = await pool.query(
        `INSERT INTO job_runs (id, job_name, scheduled_for, status, metadata)
             VALUES ($1, $2, $3, 'running', $4)
             RETURNING id`,
        [randomUUID(), jobName, scheduledFor, JSON.stringify(metadata)]
      );
      console.log(`Job run created (force): ${jobName} for ${scheduledFor} (ID: ${newRows[0].id})`);
      return { id: newRows[0].id, skipped: false };
    }

    await pool.query(
      `UPDATE job_runs
           SET status = 'running', started_at = NOW(), metadata = $2
           WHERE id = $1`,
      [existing[0].id, JSON.stringify(metadata)]
    );

    console.log(`Job run restarted (force): ${jobName} for ${scheduledFor} (ID: ${existing[0].id}, previous status: ${existing[0].status})`);
    return { id: existing[0].id, skipped: false };
  } catch (error) {
    console.error(`Error ensuring job run for ${jobName}:`, error);
    throw error;
  }
};

const finalizeJobRun = async (
  pool,
  jobRunId,
  { status = "completed", metadata = {} } = {}
) => {
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

  let query = "";
  if (
    columnNames.includes("requester_id") &&
    columnNames.includes("addressee_id")
  ) {
    const hasStatus = columnNames.includes("status");
    query = `SELECT requester_id AS user_one_id, addressee_id AS user_two_id
                 FROM friendships${hasStatus ? " WHERE status = 'accepted'" : ""}`;
  } else {
    const hasStatus = columnNames.includes("status");
    query = `SELECT user_one_id, user_two_id
                 FROM friendships${hasStatus ? " WHERE status = 'accepted'" : ""}`;
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
    totals[row.exercise_id] = {
      quantity: parseNumber(row.total_quantity, 0),
      reps: parseNumber(row.total_reps, 0),
      duration: parseNumber(row.total_duration, 0),
      distance: parseNumber(row.total_distance, 0),
    };
  }
  return map;
};

export const processWeeklyEvents = async (
  pool,
  { referenceDate = new Date(), force = false } = {}
) => {
  const offsetMinutes = getOffsetMinutes();
  const {
    utcStart: weekStart,
    utcEnd: weekEndExclusive,
    localStart,
  } = resolveWeeklyWindow(referenceDate, offsetMinutes);
  const weekEndInclusive = addDays(weekEndExclusive, -1);

  const jobRun = await ensureJobRun(pool, "weekly-events", weekEndExclusive, {
    force,
    metadata: { weekStart: localStart.toISOString() },
  });
  if (jobRun.skipped) {
    return { skipped: true, reason: "already-processed" };
  }

  const startTime = Date.now();
  const timeoutId = setTimeout(async () => {
    await finalizeJobRun(pool, jobRun.id, {
      status: "failed",
      metadata: { error: "Job timeout after 30 minutes" },
    });
  }, JOB_TIMEOUT_MS);

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
                u.preferences,
                u.weekly_goals,
                u.show_in_global_rankings,
                COALESCE(SUM(wa.points_earned), 0) AS total_points,
                COUNT(DISTINCT wir.id) AS total_workouts
            FROM users u
            LEFT JOIN workouts_in_range wir ON wir.user_id = u.id
            LEFT JOIN workout_activities wa ON wa.workout_id = wir.id AND wa.exercise_id IS NOT NULL
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
                wa.exercise_id,
                SUM(wa.quantity) AS total_quantity,
                COALESCE(SUM(wa.reps), 0) AS total_reps,
                COALESCE(SUM(wa.duration), 0) AS total_duration,
                COALESCE(SUM(wa.distance), 0) AS total_distance
            FROM workouts_in_range wir
            JOIN workout_activities wa ON wa.workout_id = wir.id
            WHERE wa.exercise_id IS NOT NULL
            GROUP BY wir.user_id, wa.exercise_id
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
      const totalExercises = Object.values(totalsByType).reduce(
        (sum, value) => sum + parseNumber(value.quantity, 0),
        0
      );

      return {
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        nickname: row.nickname,
        displayPreference: row.display_preference,
        summaryEmailsEnabled: hasSummaryEmailsEnabled(
          parsePreferences(row.preferences)
        ),
        showInGlobalRankings: row.show_in_global_rankings,
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
      // Use new counter-based badge logic
      if (evaluation.exerciseGoalsMet) {
        const earned = await badgeService.handleWeeklyProgress(
          pool,
          summary.userId,
          "weekly-goal-exercises",
          true
        );
        badgesEarned.push(...earned);
      }
      if (evaluation.pointsGoalMet) {
        const earned = await badgeService.handleWeeklyProgress(
          pool,
          summary.userId,
          "weekly-goal-points",
          true
        );
        badgesEarned.push(...earned);
      }
      if (evaluation.challengeMet) {
        const earned = await badgeService.handleWeeklyProgress(
          pool,
          summary.userId,
          "weekly-challenge-points",
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

    const leaderboardEvaluations = computeDirectLeaderboard(
      userPointMap,
      friendGraph
    );
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
        leaderboardAwards.push({
          userId,
          rank: leaderboard.rank,
          points: leaderboard.points,
        });
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

    // Process emails with individual error handling to prevent partial failures
    const emailResults = [];
    for (const summary of summaries) {
      if (!summary.email) {
        emailResults.push({
          userId: summary.userId,
          status: "skipped",
          reason: "missing-recipient-email",
        });
        continue;
      }
      if (!summary.summaryEmailsEnabled) {
        emailResults.push({
          userId: summary.userId,
          status: "skipped",
          reason: "email-notifications-disabled",
        });
        continue;
      }
      try {
        const badges = weeklyBadgesMap.get(summary.userId) || [];
        const awards = weeklyAwardsMap.get(summary.userId) || [];
        const evaluation = goalEvaluationMap.get(summary.userId);
        const leaderboard = leaderboardEvaluations.get(summary.userId);
        const unsubscribeUrl = getSummaryUnsubscribeUrl(summary.userId);

        const activityLines = Object.entries(summary.totalsByType)
          .map(([type, amount]) => {
            const label = ACTIVITY_LABELS[type] || type;
            return `• ${label}: ${amount}`;
          })
          .filter(Boolean);

        const lines = [
          `Hallo ${summary.firstName ?? "Athlet"},`,
          "",
          "Deine Wochenübersicht:",
          `• Gesamtpunkte: ${summary.totalPoints}`,
          `• Workouts: ${summary.totalWorkouts}`,
          ...activityLines,
          "",
          "Ziele:",
          evaluation.hasExerciseGoals
            ? `• Übungs-Ziele: ${evaluation.exerciseGoalsMet ? "erreicht" : "nicht erreicht"}`
            : null,
          evaluation.pointsTarget > 0
            ? `• Punkte-Ziel: ${evaluation.pointsGoalMet ? "erreicht" : "nicht erreicht"} (${summary.totalPoints}/${evaluation.pointsTarget})`
            : null,
          `• Wochen-Challenge: ${evaluation.challengeMet ? "geschafft" : "offen"}`,
          "",
          leaderboard &&
          leaderboard.rank <= Math.min(3, leaderboard.participantCount) &&
          leaderboard.participantCount >= 2
            ? `• Leaderboard Platz (Freunde): ${leaderboard.rank} von ${leaderboard.participantCount}`
            : undefined,
          "",
          badges.length > 0
            ? `• Neue Meilensteine: ${badges.map((b) => b.label).join(", ")}`
            : null,
          awards.length > 0
            ? `• Neue Auszeichnungen: ${awards.map((a) => a.label).join(", ")}`
            : null,
          "",
          unsubscribeUrl
            ? "Wenn du diese Zusammenfassung nicht mehr erhalten möchtest, kannst du sie hier abbestellen:"
            : null,
          unsubscribeUrl || null,
          unsubscribeUrl ? "" : null,
          "Bleib dran und viel Erfolg für die nächste Woche!",
        ].filter((line) => line !== null && line !== undefined);

        const body = lines.join("\n");
        await queueEmailSummary(pool, {
          userId: summary.userId,
          recipient: summary.email,
          subject: "Deine Wochenbilanz ist da!",
          body,
        });
        emailResults.push({ userId: summary.userId, status: "queued" });
      } catch (error) {
        console.error(
          `Failed to queue email for user ${summary.userId}:`,
          error
        );
        emailResults.push({
          userId: summary.userId,
          status: "failed",
          error: error.message,
        });
      }
    }

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    await finalizeJobRun(pool, jobRun.id, {
      metadata: {
        processedUsers: summaries.length,
        weekStart: toISODate(weekStart),
        emailResults: emailResults.filter((r) => r.status === "failed").length,
        durationMs: duration,
      },
    });

    return {
      skipped: false,
      processedUsers: summaries.length,
      weekStart,
      weekEnd: weekEndInclusive,
      emailResults,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    await finalizeJobRun(pool, jobRun.id, {
      status: "failed",
      metadata: { error: error.message },
    });
    await sendJobFailureAlert("weekly-events", error.message, {
      weekStart: toISODate(weekStart),
    });
    throw error;
  }
};

export const processMonthlyEvents = async (
  pool,
  { referenceDate = new Date(), force = false } = {}
) => {
  const offsetMinutes = getOffsetMinutes();
  const {
    utcStart: monthStart,
    utcEnd: monthEndExclusive,
    localStart,
  } = resolveMonthlyWindow(referenceDate, offsetMinutes);
  const monthEndInclusive = addDays(monthEndExclusive, -1);

  const jobRun = await ensureJobRun(pool, "monthly-events", monthEndExclusive, {
    force,
    metadata: { monthStart: localStart.toISOString() },
  });
  if (jobRun.skipped) {
    return { skipped: true, reason: "already-processed" };
  }

  const startTime = Date.now();
  const timeoutId = setTimeout(async () => {
    await finalizeJobRun(pool, jobRun.id, {
      status: "failed",
      metadata: { error: "Job timeout after 30 minutes" },
    });
  }, JOB_TIMEOUT_MS);

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
                u.preferences,
                u.show_in_global_rankings,
                COALESCE(SUM(wa.points_earned), 0) AS total_points
            FROM users u
            LEFT JOIN workouts_in_range wir ON wir.user_id = u.id
            LEFT JOIN workout_activities wa ON wa.workout_id = wir.id AND wa.exercise_id IS NOT NULL
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
                wa.exercise_id,
                SUM(wa.quantity) AS total_quantity,
                COALESCE(SUM(wa.reps), 0) AS total_reps,
                COALESCE(SUM(wa.duration), 0) AS total_duration,
                COALESCE(SUM(wa.distance), 0) AS total_distance
            FROM workouts_in_range wir
            JOIN workout_activities wa ON wa.workout_id = wir.id
            WHERE wa.exercise_id IS NOT NULL
            GROUP BY wir.user_id, wa.exercise_id
        `;

    const [{ rows }, activityTotalsResult] = await Promise.all([
      pool.query(summaryQuery, [monthStart, monthEndExclusive]),
      pool.query(activityTotalsQuery, [monthStart, monthEndExclusive]),
    ]);

    const activityTotalsMap = buildActivityTotalsMap(activityTotalsResult.rows);
    const friendships = await fetchFriendships(pool);
    const friendGraph = buildFriendAdjacency(friendships);

    const monthlyAwardsMap = new Map();
    const monthlyBadgesMap = new Map(); // Store badges (counter milestones)

    const summaries = rows.map((row) => ({
      userId: row.user_id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      summaryEmailsEnabled: hasSummaryEmailsEnabled(
        parsePreferences(row.preferences)
      ),
      totalPoints: parseNumber(row.total_points, 0),
      totalsByType: activityTotalsMap.get(row.user_id) ?? {},
      showInGlobalRankings: row.show_in_global_rankings !== false, // default true
    }));

    // --- Ranking Calculations ---

    // 1. Global Rankings (Points & Activities) - Filter: showInGlobalRankings = true
    const globalParticipants = summaries.filter(
      (s) => s.showInGlobalRankings && s.totalPoints > 0
    );
    const globalPointsRank = computeRankingForGroup(
      globalParticipants,
      (s) => s.totalPoints
    );

    const activities = ["pullups", "pushups", "situps"];
    const globalActivityRanks = {};
    for (const activity of activities) {
      // Filter for users who actually did the activity and opted in
      const participants = summaries.filter(
        (s) =>
          s.showInGlobalRankings && (s.totalsByType[activity] || 0) > 0
      );
      globalActivityRanks[activity] = computeRankingForGroup(
        participants,
        (s) => s.totalsByType[activity] || 0
      );
    }

    // 2. Friends Rankings (Points & Activities) - No Filter
    // Will be computed per user inside the loop

    for (const summary of summaries) {
      const challengeMet =
        summary.totalPoints >= DEFAULT_MONTHLY_POINT_CHALLENGE;

      const awardsGranted = [];
      const badgesEarned = [];

      // A. Monthly Goal Badge (Counter)
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

        // New: Counter Badge
        const badges = await badgeService.handleMonthlyProgress(
          pool,
          summary.userId,
          "monthly-challenge-points",
          true
        );
        badgesEarned.push(...badges);
      }

      // B. Rank Awards (Global)
      if (summary.showInGlobalRankings) {
        // Points
        const rankInfo = globalPointsRank.get(summary.userId);
        if (rankInfo && rankInfo.rank <= 3) {
          const award = await grantCategoryRankAward(
            pool,
            summary.userId,
            rankInfo.rank,
            "points",
            "global",
            monthStart,
            monthEndInclusive,
            rankInfo.value
          );
          if (award) awardsGranted.push(award);
        }
        // Activities
        for (const activity of activities) {
          const actRankInfo = globalActivityRanks[activity]?.get(
            summary.userId
          );
          if (actRankInfo && actRankInfo.rank <= 3) {
            const award = await grantCategoryRankAward(
              pool,
              summary.userId,
              actRankInfo.rank,
              activity,
              "global",
              monthStart,
              monthEndInclusive,
              actRankInfo.value
            );
            if (award) awardsGranted.push(award);
          }
        }
      }

      // C. Rank Awards (Friends)
      // Get friends + self
      const friendIds = friendGraph.get(summary.userId) ?? new Set();
      const groupIds = new Set([...friendIds, summary.userId]);
      const groupSummaries = summaries.filter((s) => groupIds.has(s.userId));

      // Friend Rank: Points
      const friendPointsRank = computeRankingForGroup(
        groupSummaries.filter((s) => s.totalPoints > 0),
        (s) => s.totalPoints
      );
      const myFriendRank = friendPointsRank.get(summary.userId);
      if (
        myFriendRank &&
        myFriendRank.rank <= 3 &&
        myFriendRank.totalParticipants >= 2
      ) {
        const award = await grantCategoryRankAward(
          pool,
          summary.userId,
          myFriendRank.rank,
          "points",
          "friends",
          monthStart,
          monthEndInclusive,
          myFriendRank.value
        );
        if (award) awardsGranted.push(award);
      }

      // Friend Rank: Activities
      for (const activity of activities) {
        const participants = groupSummaries.filter(
          (s) => (s.totalsByType[activity] || 0) > 0
        );
        const actRankMap = computeRankingForGroup(
          participants,
          (s) => s.totalsByType[activity] || 0
        );
        const myActRank = actRankMap.get(summary.userId);
        if (
          myActRank &&
          myActRank.rank <= 3 &&
          myActRank.totalParticipants >= 2
        ) {
          const award = await grantCategoryRankAward(
            pool,
            summary.userId,
            myActRank.rank,
            activity,
            "friends",
            monthStart,
            monthEndInclusive,
            myActRank.value
          );
          if (award) awardsGranted.push(award);
        }
      }

      monthlyAwardsMap.set(summary.userId, awardsGranted);
      monthlyBadgesMap.set(summary.userId, badgesEarned);

      // Store results in DB (Note: monthly_results table structure might need activity breakdown column in future)
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
          JSON.stringify(badgesEarned),
          JSON.stringify(awardsGranted),
        ]
      );
    }

    // Process emails with individual error handling to prevent partial failures
    const emailResults = [];
    for (const summary of summaries) {
      if (!summary.email) {
        emailResults.push({
          userId: summary.userId,
          status: "skipped",
          reason: "missing-recipient-email",
        });
        continue;
      }
      if (!summary.summaryEmailsEnabled) {
        emailResults.push({
          userId: summary.userId,
          status: "skipped",
          reason: "email-notifications-disabled",
        });
        continue;
      }
      try {
        const awards = monthlyAwardsMap.get(summary.userId) || [];
        const badges = monthlyBadgesMap.get(summary.userId) || [];
        const challengeMet =
          summary.totalPoints >= DEFAULT_MONTHLY_POINT_CHALLENGE;
        const unsubscribeUrl = getSummaryUnsubscribeUrl(summary.userId);

        // Build Ranking Strings for Email
        const rankingLines = [];

        // Global Rank (if opted in)
        if (summary.showInGlobalRankings && summary.totalPoints > 0) {
          const gRank = globalPointsRank.get(summary.userId);
          if (gRank) {
            rankingLines.push(
              `• Globaler Rang (Punkte): ${gRank.rank} von ${gRank.totalParticipants}`
            );
          }
        }

        // Friend Rank
        if (summary.totalPoints > 0) {
          const friendIds = friendGraph.get(summary.userId) ?? new Set();
          const groupIds = new Set([...friendIds, summary.userId]);
          const groupSummaries = summaries.filter(
            (s) => groupIds.has(s.userId) && s.totalPoints > 0
          );
          const friendRankMap = computeRankingForGroup(
            groupSummaries,
            (s) => s.totalPoints
          );
          const fRank = friendRankMap.get(summary.userId);
          if (fRank) {
            rankingLines.push(
              `• Freundes-Rang (Punkte): ${fRank.rank} von ${fRank.totalParticipants}`
            );
          }
        }

        const activityLines = Object.entries(summary.totalsByType)
          .map(([type, amount]) => {
            const label = ACTIVITY_LABELS[type] || type;
            return `• ${label}: ${amount}`;
          })
          .filter(Boolean);

        const lines = [
          `Hallo ${summary.firstName ?? "Athlet"},`,
          "",
          "Dein Monatsabschluss:",
          `• Gesamtpunkte: ${summary.totalPoints}`,
          ...activityLines,
          "",
          `• Monats-Challenge (${DEFAULT_MONTHLY_POINT_CHALLENGE} Punkte): ${challengeMet ? "geschafft" : "offen"}`,
          "",
          ...rankingLines,
          "",
          badges.length > 0
            ? `• Neue Meilensteine: ${badges.map((b) => b.label).join(", ")}`
            : null,
          awards.length > 0
            ? `• Neue Auszeichnungen: ${awards.map((a) => a.label).join(", ")}`
            : null,
          "",
          unsubscribeUrl
            ? "Wenn du diese Zusammenfassung nicht mehr erhalten möchtest, kannst du sie hier abbestellen:"
            : null,
          unsubscribeUrl || null,
          unsubscribeUrl ? "" : null,
          "Großartige Arbeit in diesem Monat – weiter so!",
        ].filter((line) => line !== null && line !== undefined);

        const body = lines.join("\n");
        await queueEmailSummary(pool, {
          userId: summary.userId,
          recipient: summary.email,
          subject: "Dein Monatsabschluss",
          body,
        });
        emailResults.push({ userId: summary.userId, status: "queued" });
      } catch (error) {
        console.error(
          `Failed to queue email for user ${summary.userId}:`,
          error
        );
        emailResults.push({
          userId: summary.userId,
          status: "failed",
          error: error.message,
        });
      }
    }

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    await finalizeJobRun(pool, jobRun.id, {
      metadata: {
        processedUsers: summaries.length,
        monthStart: toISODate(monthStart),
        emailResults: emailResults.filter((r) => r.status === "failed").length,
        durationMs: duration,
      },
    });

    return {
      skipped: false,
      processedUsers: summaries.length,
      monthStart,
      monthEnd: monthEndInclusive,
      emailResults,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    await finalizeJobRun(pool, jobRun.id, {
      status: "failed",
      metadata: { error: error.message },
    });
    await sendJobFailureAlert("monthly-events", error.message, {
      monthStart: toISODate(monthStart),
    });
    throw error;
  }
};
