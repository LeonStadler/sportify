import test from 'node:test';
import assert from 'node:assert/strict';

import { getAnalyticsForPeriod } from '../services/analytics/analyticsService.js';

class StubPool {
  constructor(responses = []) {
    this.responses = responses;
    this.calls = [];
  }

  async query(sql, params = []) {
    const index = this.calls.length;
    const response = this.responses[index];
    if (!response) {
      throw new Error(`No stub response configured for query #${index + 1}`);
    }

    this.calls.push({ sql, params });
    return typeof response === 'function' ? response(sql, params) : response;
  }
}

test('getAnalyticsForPeriod aggregates workout and recovery analytics', async () => {
  const pool = new StubPool([
    {
      rows: [
        {
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          previous_start_date: '2023-12-25',
          previous_end_date: '2023-12-31',
        },
      ],
    },
    {
      rows: [
        {
          day: '2024-01-01',
          pullups: 10,
          pushups: 20,
          running: 5,
          cycling: 0,
          situps: 15,
          points: 100,
          workouts: 1,
          duration_minutes: 45,
        },
        {
          day: '2024-01-02',
          pullups: 20,
          pushups: 25,
          running: 10,
          cycling: 5,
          situps: 20,
          points: 120,
          workouts: 1,
          duration_minutes: 50,
        },
      ],
    },
    {
      rows: [
        {
          workout_count: 2,
          total_duration: 95,
          total_points: 220,
          pullups: 30,
          pushups: 45,
          running: 15,
          cycling: 5,
          situps: 35,
          active_days: 2,
        },
      ],
    },
    {
      rows: [
        {
          workout_count: 1,
          total_duration: 40,
          total_points: 120,
          pullups: 15,
          pushups: 20,
          running: 5,
          cycling: 0,
          situps: 10,
          active_days: 1,
        },
      ],
    },
    {
      rows: [
        {
          id: 'wk-long',
          title: 'Long Session',
          start_time: '2024-01-02T10:00:00.000Z',
          duration_minutes: 50,
        },
      ],
    },
    {
      rows: [
        {
          total_entries: 4,
          avg_energy_level: 7,
          avg_focus_level: 6,
          avg_sleep_quality: 8,
          avg_soreness_level: 3,
          avg_perceived_exertion: 4,
          avg_sleep_duration: 7.5,
          avg_resting_heart_rate: 52,
          avg_hydration_level: 7,
        },
      ],
    },
    {
      rows: [
        {
          total_entries: 3,
          avg_energy_level: 6,
          avg_focus_level: 5,
          avg_sleep_quality: 7,
          avg_soreness_level: 4,
          avg_perceived_exertion: 5,
          avg_sleep_duration: 7,
          avg_resting_heart_rate: 54,
          avg_hydration_level: 6,
        },
      ],
    },
    {
      rows: [
        {
          entry_date: '2024-01-01',
          entry_count: 2,
          avg_energy_level: 7,
          avg_focus_level: 6,
          avg_sleep_quality: 8,
          avg_soreness_level: 3,
          avg_perceived_exertion: 4,
          avg_sleep_duration: 7.5,
          avg_resting_heart_rate: 52,
          avg_hydration_level: 7,
          dominant_mood: 'energized',
        },
        {
          entry_date: '2024-01-02',
          entry_count: 2,
          avg_energy_level: 6,
          avg_focus_level: 5,
          avg_sleep_quality: 7,
          avg_soreness_level: 4,
          avg_perceived_exertion: 5,
          avg_sleep_duration: 7,
          avg_resting_heart_rate: 54,
          avg_hydration_level: 6,
          dominant_mood: 'balanced',
        },
      ],
    },
    {
      rows: [
        { mood: 'energized', count: 3 },
        { mood: 'tired', count: 1 },
      ],
    },
  ]);

  const analytics = await getAnalyticsForPeriod(pool, 'user-123', 'week');

  assert.equal(analytics.period, 'week');
  assert.deepEqual(analytics.range, {
    start: '2024-01-01',
    end: '2024-01-07',
    previousStart: '2023-12-25',
    previousEnd: '2023-12-31',
  });

  assert.deepEqual(analytics.workouts.totals, {
    workouts: 2,
    durationMinutes: 95,
    points: 220,
    pullups: 30,
    pushups: 45,
    running: 15,
    cycling: 5,
    situps: 35,
    activeDays: 2,
    averageDurationPerWorkout: 47.5,
    averagePointsPerWorkout: 110,
    consistency: 100,
  });

  assert.equal(analytics.workouts.timeline.length, 2);
  assert.deepEqual(analytics.workouts.activityBreakdown, [
    { activity: 'pullups', total: 30, percentage: 23.1 },
    { activity: 'pushups', total: 45, percentage: 34.6 },
    { activity: 'running', total: 15, percentage: 11.5 },
    { activity: 'cycling', total: 5, percentage: 3.8 },
    { activity: 'situps', total: 35, percentage: 26.9 },
  ]);
  assert.deepEqual(analytics.workouts.comparison, {
    points: { current: 220, previous: 120, change: { difference: 100, percent: 83.3 } },
    workouts: { current: 2, previous: 1, change: { difference: 1, percent: 100 } },
    durationMinutes: { current: 95, previous: 40, change: { difference: 55, percent: 137.5 } },
  });

  assert.deepEqual(analytics.workouts.highlights, {
    longestWorkout: {
      id: 'wk-long',
      title: 'Long Session',
      startTime: '2024-01-02T10:00:00.000Z',
      durationMinutes: 50,
    },
    peakDay: {
      date: '2024-01-02',
      pullups: 20,
      pushups: 25,
      running: 10,
      cycling: 5,
      situps: 20,
      points: 120,
      workouts: 1,
      durationMinutes: 50,
    },
    activeDays: 2,
  });

  assert.deepEqual(analytics.recovery.summary, {
    entries: 4,
    avgEnergy: 7,
    avgFocus: 6,
    avgSleep: 8,
    avgSoreness: 3,
    avgExertion: 4,
    avgSleepDuration: 7.5,
    avgRestingHeartRate: 52,
    avgHydration: 7,
    avgReadiness: 69,
    dominantMood: 'energized',
  });

  assert.deepEqual(analytics.recovery.moodDistribution, [
    { mood: 'energized', count: 3, percentage: 75 },
    { mood: 'tired', count: 1, percentage: 25 },
  ]);

  assert.equal(analytics.balance.daily.length, 2);
  assert.deepEqual(analytics.balance.daily[0], {
    date: '2024-01-01',
    points: 100,
    workouts: 1,
    durationMinutes: 45,
    avgEnergy: 7,
    avgFocus: 6,
    avgSleep: 8,
    avgSoreness: 3,
    avgExertion: 4,
    avgHydration: 7,
    avgRestingHeartRate: 52,
    avgSleepDuration: 7.5,
    readinessScore: 69,
  });
  assert.deepEqual(analytics.balance.daily[1], {
    date: '2024-01-02',
    points: 120,
    workouts: 1,
    durationMinutes: 50,
    avgEnergy: 6,
    avgFocus: 5,
    avgSleep: 7,
    avgSoreness: 4,
    avgExertion: 5,
    avgHydration: 6,
    avgRestingHeartRate: 54,
    avgSleepDuration: 7,
    readinessScore: 59,
  });
  assert.deepEqual(analytics.balance.readiness, {
    average: 64,
    previousAverage: 59,
    change: { difference: 5, percent: 8.5 },
  });

  assert.ok(analytics.insights.primaryCorrelation);
  assert.ok(analytics.insights.correlations.length > 0);
});

test('getAnalyticsForPeriod handles empty datasets gracefully', async () => {
  const pool = new StubPool(
    new Array(9).fill({ rows: [] })
  );

  const analytics = await getAnalyticsForPeriod(pool, 'user-456', 'month');

  assert.equal(analytics.period, 'month');
  assert.deepEqual(analytics.workouts.totals, {
    workouts: 0,
    durationMinutes: 0,
    points: 0,
    pullups: 0,
    pushups: 0,
    running: 0,
    cycling: 0,
    situps: 0,
    activeDays: 0,
    averageDurationPerWorkout: null,
    averagePointsPerWorkout: null,
    consistency: null,
  });

  assert.deepEqual(analytics.workouts.activityBreakdown, [
    { activity: 'pullups', total: 0, percentage: 0 },
    { activity: 'pushups', total: 0, percentage: 0 },
    { activity: 'running', total: 0, percentage: 0 },
    { activity: 'cycling', total: 0, percentage: 0 },
    { activity: 'situps', total: 0, percentage: 0 },
  ]);

  assert.deepEqual(analytics.workouts.comparison, {
    points: { current: 0, previous: 0, change: { difference: 0, percent: null } },
    workouts: { current: 0, previous: 0, change: { difference: 0, percent: null } },
    durationMinutes: { current: 0, previous: 0, change: { difference: 0, percent: null } },
  });

  assert.deepEqual(analytics.recovery.summary, {
    entries: 0,
    avgEnergy: null,
    avgFocus: null,
    avgSleep: null,
    avgSoreness: null,
    avgExertion: null,
    avgSleepDuration: null,
    avgRestingHeartRate: null,
    avgHydration: null,
    avgReadiness: null,
    dominantMood: null,
  });

  assert.deepEqual(analytics.recovery.comparison, {
    entries: { difference: 0, percent: null },
    energy: null,
    focus: null,
    sleep: null,
    soreness: null,
    exertion: null,
    hydration: null,
  });

  assert.deepEqual(analytics.balance, {
    daily: [],
    readiness: {
      average: null,
      previousAverage: null,
      change: null,
    },
  });

  assert.deepEqual(analytics.insights, {
    correlations: [],
    primaryCorrelation: null,
    readinessDrivers: [],
  });
});
