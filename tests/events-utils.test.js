import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_WEEKLY_POINT_CHALLENGE,
  DEFAULT_WEEKLY_POINTS_GOAL,
} from "../config/badges.js";
import {
  buildFriendAdjacency,
  computeDirectLeaderboard,
  evaluateWeeklyGoals,
  resolveMonthlyWindow,
} from "../services/eventUtils.js";

describe("eventUtils.evaluateWeeklyGoals", () => {
  it("uses the default weekly points goal when the user has not configured one", () => {
    const evaluation = evaluateWeeklyGoals({
      weeklyGoals: {},
      activityTotals: {},
      totalPoints: DEFAULT_WEEKLY_POINTS_GOAL + 50,
      defaultPointsGoal: DEFAULT_WEEKLY_POINTS_GOAL,
      challengeThreshold: DEFAULT_WEEKLY_POINT_CHALLENGE,
    });

    assert.equal(evaluation.pointsTarget, DEFAULT_WEEKLY_POINTS_GOAL);
    assert.equal(evaluation.pointsGoalMet, true);
    assert.equal(evaluation.challengeMet, false);
    assert.equal(evaluation.hasExerciseGoals, false);
    assert.equal(evaluation.exerciseGoalsMet, false);
  });

  it("respects custom weekly goals per activity and does not treat unset goals as met", () => {
    const evaluation = evaluateWeeklyGoals({
      weeklyGoals: {
        points: { target: DEFAULT_WEEKLY_POINTS_GOAL * 2 },
        exercises: [
          { exerciseId: "pushups", target: 100, unit: "reps" },
          { exerciseId: "running", target: 10, unit: "distance" },
        ],
      },
      activityTotals: {
        pushups: { reps: 120 },
        running: { distance: 8 },
      },
      totalPoints: DEFAULT_WEEKLY_POINT_CHALLENGE + 50,
      defaultPointsGoal: DEFAULT_WEEKLY_POINTS_GOAL,
      challengeThreshold: DEFAULT_WEEKLY_POINT_CHALLENGE,
      distanceUnit: "km",
    });

    assert.equal(evaluation.pointsTarget, DEFAULT_WEEKLY_POINTS_GOAL * 2);
    assert.equal(evaluation.pointsGoalMet, true);
    assert.equal(evaluation.challengeMet, true);
    assert.equal(evaluation.hasExerciseGoals, true);
    assert.equal(
      evaluation.exerciseGoalsMet,
      false,
      "Running target not met should mark exercise goals as incomplete"
    );
  });
});

describe("eventUtils.computeDirectLeaderboard", () => {
  it("ranks users only against their direct friends", () => {
    const friendships = [
      { userOneId: "alice", userTwoId: "bob" },
      { userOneId: "bob", userTwoId: "carol" },
      // dave is connected only to carol – should not affect alice directly
      { userOneId: "carol", userTwoId: "dave" },
    ];

    const friendGraph = buildFriendAdjacency(friendships);
    const userPoints = new Map([
      ["alice", 1200],
      ["bob", 900],
      ["carol", 700],
      ["dave", 1500],
    ]);

    const leaderboard = computeDirectLeaderboard(userPoints, friendGraph);

    assert.equal(leaderboard.get("alice")?.rank, 1);
    assert.equal(leaderboard.get("alice")?.participantCount, 2);
    assert.equal(leaderboard.get("bob")?.participantCount, 3);
    assert.equal(leaderboard.get("bob")?.rank, 2);
    assert.equal(leaderboard.get("carol")?.rank, 3);
    assert.equal(
      leaderboard
        .get("carol")
        ?.leaderboard?.some((entry) => entry.userId === "alice"),
      false,
      "Alice should not appear in Carol's leaderboard because they are not friends"
    );
  });
});

describe("eventUtils.resolveMonthlyWindow", () => {
  // NOTE: These tests are timezone-dependent because date-fns uses the system timezone.
  // They verify that the function returns a window spanning exactly one month.

  it("returns a window that spans exactly one month when on the 1st", () => {
    const referenceDate = new Date("2025-07-01T00:05:00.000Z");
    const offsetMinutes = 0;

    const window = resolveMonthlyWindow(referenceDate, offsetMinutes);

    // Verify the window spans approximately 30 days (June)
    const durationMs = window.utcEnd.getTime() - window.utcStart.getTime();
    const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24));
    assert.ok(
      durationDays >= 28 && durationDays <= 31,
      `Window should span one month, got ${durationDays} days`
    );

    // Verify utcStart is before utcEnd
    assert.ok(
      window.utcStart < window.utcEnd,
      "utcStart should be before utcEnd"
    );
  });

  it("returns a valid window when reference is mid-month", () => {
    const referenceDate = new Date("2025-07-05T10:00:00.000Z");
    const offsetMinutes = 0;

    const window = resolveMonthlyWindow(referenceDate, offsetMinutes);

    // Verify the window spans approximately 31 days (July)
    const durationMs = window.utcEnd.getTime() - window.utcStart.getTime();
    const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24));
    assert.ok(
      durationDays >= 28 && durationDays <= 31,
      `Window should span one month, got ${durationDays} days`
    );

    // Verify utcStart is before utcEnd
    assert.ok(
      window.utcStart < window.utcEnd,
      "utcStart should be before utcEnd"
    );
  });
});
