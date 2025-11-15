export interface AnalyticsDelta {
  difference: number;
  percent: number | null;
}

export interface AnalyticsRange {
  start: string | null;
  end: string | null;
  previousStart: string | null;
  previousEnd: string | null;
}

export interface AnalyticsActivityBreakdownEntry {
  activity: string;
  total: number | null;
  percentage: number;
}

export interface AnalyticsWorkoutDay {
  date: string;
  workouts: number;
  durationMinutes: number;
  points: number;
  pullups: number;
  pushups: number;
  running: number;
  cycling: number;
  situps: number;
}

export interface AnalyticsLongestWorkout {
  id: string;
  title: string;
  startTime: string;
  durationMinutes: number;
}

export interface AnalyticsWorkoutsData {
  totals: {
    workouts: number;
    durationMinutes: number;
    points: number;
    pullups: number;
    pushups: number;
    running: number;
    cycling: number;
    situps: number;
    activeDays: number;
    averageDurationPerWorkout: number | null;
    averagePointsPerWorkout: number | null;
    consistency: number | null;
  };
  timeline: AnalyticsWorkoutDay[];
  activityBreakdown: AnalyticsActivityBreakdownEntry[];
  highlights: {
    longestWorkout: AnalyticsLongestWorkout | null;
    peakDay: AnalyticsWorkoutDay | null;
    activeDays: number;
  };
  comparison: {
    points: { current: number; previous: number; change: AnalyticsDelta };
    workouts: { current: number; previous: number; change: AnalyticsDelta };
    durationMinutes: { current: number; previous: number; change: AnalyticsDelta };
  };
}

export interface AnalyticsRecoverySummary {
  entries: number;
  avgEnergy: number | null;
  avgFocus: number | null;
  avgSleep: number | null;
  avgSoreness: number | null;
  avgExertion: number | null;
  avgSleepDuration: number | null;
  avgRestingHeartRate: number | null;
  avgHydration: number | null;
  avgReadiness: number | null;
  dominantMood: string | null;
}

export interface AnalyticsRecoveryDay {
  date: string;
  entries: number;
  avgEnergy: number | null;
  avgFocus: number | null;
  avgSleep: number | null;
  avgSoreness: number | null;
  avgExertion: number | null;
  avgSleepDuration: number | null;
  avgRestingHeartRate: number | null;
  avgHydration: number | null;
  mood: string | null;
}

export interface AnalyticsMoodDistributionEntry {
  mood: string;
  count: number;
  percentage: number;
}

export interface AnalyticsRecoveryData {
  summary: AnalyticsRecoverySummary;
  comparison: {
    entries: AnalyticsDelta;
    energy: AnalyticsDelta | null;
    focus: AnalyticsDelta | null;
    sleep: AnalyticsDelta | null;
    soreness: AnalyticsDelta | null;
    exertion: AnalyticsDelta | null;
    hydration: AnalyticsDelta | null;
  };
  timeline: AnalyticsRecoveryDay[];
  moodDistribution: AnalyticsMoodDistributionEntry[];
}

export interface AnalyticsBalanceDay {
  date: string;
  points: number;
  workouts: number;
  durationMinutes: number;
  avgEnergy: number | null;
  avgSleep: number | null;
  avgSoreness: number | null;
  readinessScore: number | null;
}

export interface AnalyticsBalanceData {
  daily: AnalyticsBalanceDay[];
  readiness: {
    average: number | null;
    previousAverage: number | null;
    change: AnalyticsDelta | null;
  };
}

export interface AnalyticsResponse {
  period: string;
  range: AnalyticsRange;
  workouts: AnalyticsWorkoutsData;
  recovery: AnalyticsRecoveryData;
  balance: AnalyticsBalanceData;
}
