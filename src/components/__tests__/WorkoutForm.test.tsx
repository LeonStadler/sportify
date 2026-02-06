import { describe, expect, it } from "vitest";

import { calculateSetTotals, getMetricVisibility } from "@/components/training/workoutTotals";

describe("WorkoutForm totals", () => {
  it("calculates total time in mixed reps+time set mode (2 x 8 sec = 16 sec)", () => {
    const visibility = getMetricVisibility({
      measurementType: "mixed",
      supportsTime: true,
      supportsDistance: false,
    });
    const totals = calculateSetTotals([{ reps: 2, duration: 8 }], visibility);

    expect(totals.totalDuration).toBe(16);
  });

  it("shows both distance and time totals for distance+time exercises", () => {
    const visibility = getMetricVisibility({
      measurementType: "distance",
      supportsTime: true,
      supportsDistance: true,
    });
    const totals = calculateSetTotals([{ distance: 7, duration: 7, reps: 0 }], visibility);

    expect(totals.totalDistance).toBe(7);
    expect(totals.totalDuration).toBe(7);
  });

  it("calculates mixed reps+time totals even when reps stay empty (duration only)", () => {
    const visibility = getMetricVisibility({
      measurementType: "mixed",
      supportsTime: true,
      supportsDistance: false,
    });
    const totals = calculateSetTotals([{ reps: 0, duration: 8 }], visibility);

    expect(totals.totalDuration).toBe(8);
  });
});
