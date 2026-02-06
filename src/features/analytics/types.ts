import type { AnalyticsRecoveryDay, AnalyticsWorkoutDay } from "@/types/analytics";

interface BaseMetricOption<Key extends string> {
  key: Key;
  label: string;
  color: string;
}

export type ActivityMetricOption = BaseMetricOption<string> & {
  measurementType?: "reps" | "time" | "distance" | null;
  supportsTime?: boolean | null;
  supportsDistance?: boolean | null;
};
export type RecoveryMetricOption = BaseMetricOption<keyof AnalyticsRecoveryDay>;
