import type { AnalyticsDelta } from "@/types/analytics";

export const ensureAtLeastOne = <T>(values: T[], fallback: T): T[] => {
  if (values.length === 0) {
    return [fallback];
  }
  return values;
};

export type TrendDirection = "up" | "down" | "neutral";

export const getTrend = (delta?: AnalyticsDelta | null): TrendDirection => {
  if (!delta) return "neutral";
  if (delta.difference > 0) return "up";
  if (delta.difference < 0) return "down";
  return "neutral";
};
