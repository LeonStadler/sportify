export interface WeeklyChallengeTargets {
  pullups: number;
  pushups: number;
  running: number;
  cycling: number;
  points: number;
}

export interface WeeklyChallengeActivityProgress {
  target: number;
  current: number;
  percentage: number;
}

export interface WeeklyChallengeProgressSummary {
  pullups: number;
  pushups: number;
  running: number;
  cycling: number;
  workoutsCompleted: number;
  totalPoints: number;
  completionPercentage: number;
}

export interface WeeklyChallengeLeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  totalPoints: number;
  totalRunning: number;
  totalPullups: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface WeeklyChallengeWeekWindow {
  start: string;
  end: string;
  daysRemaining: number;
}

export interface WeeklyChallengeResponse {
  week: WeeklyChallengeWeekWindow;
  targets: WeeklyChallengeTargets;
  progress: WeeklyChallengeProgressSummary;
  activities: Record<
    "pullups" | "pushups" | "running" | "cycling",
    WeeklyChallengeActivityProgress
  >;
  leaderboard: WeeklyChallengeLeaderboardEntry[];
}
