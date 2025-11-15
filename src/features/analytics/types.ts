import type { AnalyticsRecoveryDay, AnalyticsWorkoutDay } from "@/types/analytics";

interface BaseMetricOption<Key extends string> {
  key: Key;
  label: string;
  color: string;
}

export type ActivityMetricOption = BaseMetricOption<keyof AnalyticsWorkoutDay>;
export type RecoveryMetricOption = BaseMetricOption<keyof AnalyticsRecoveryDay>;
