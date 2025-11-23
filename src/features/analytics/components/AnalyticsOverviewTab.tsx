import { useMemo, useState } from "react";
import { ActivityTimelineChart } from "@/components/analytics/ActivityTimelineChart";
import { AnalyticsStatCard } from "@/components/analytics/AnalyticsStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TFunction } from "i18next";
import { CalendarRange, HeartPulse, LayoutPanelTop, LineChart, TrendingUp, Activity as ActivityIcon } from "lucide-react";

import type {
  AnalyticsBalanceData,
  AnalyticsInsightData,
  AnalyticsRange,
  AnalyticsRecoveryData,
  AnalyticsWorkoutDay,
  AnalyticsWorkoutsData,
} from "@/types/analytics";

import type { AnalyticsFormatters } from "../utils/formatters";
import { getTrend } from "../utils/metrics";
import type { ActivityMetricOption } from "../types";
import { AnalyticsInsights } from "./AnalyticsInsights";

interface AnalyticsOverviewTabProps {
  workouts?: AnalyticsWorkoutsData;
  recovery?: AnalyticsRecoveryData;
  balance?: AnalyticsBalanceData;
  insights?: AnalyticsInsightData;
  range?: AnalyticsRange | null;
  activityMetrics: ActivityMetricOption[];
  selectedActivityKeys: ActivityMetricOption["key"][];
  selectedActivityConfigs: ActivityMetricOption[];
  onToggleActivityMetric: (key: ActivityMetricOption["key"]) => void;
  formatters: AnalyticsFormatters;
  t: TFunction;
}

export function AnalyticsOverviewTab({
  workouts,
  recovery,
  balance,
  insights,
  range,
  activityMetrics,
  selectedActivityKeys,
  selectedActivityConfigs,
  onToggleActivityMetric,
  formatters,
  t,
}: AnalyticsOverviewTabProps) {
  const workoutTotals = workouts?.totals;
  const workoutComparison = workouts?.comparison;

  const moodReadiness = recovery?.summary.avgReadiness;
  const readinessChange = balance?.readiness.change;

  const [chartMode, setChartMode] = useState<"stacked" | "grouped">("stacked");

  const timeline = useMemo(
    () => (workouts?.timeline ?? []) as AnalyticsWorkoutDay[],
    [workouts?.timeline],
  );
  const hasTimeline = timeline.length > 0 && selectedActivityConfigs.length > 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <AnalyticsStatCard
          title={t("stats.totalPoints")}
          value={formatters.formatInteger(workoutTotals?.points ?? 0)}
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
          description={
            workoutTotals?.averagePointsPerWorkout
              ? t("stats.averagePointsPerWorkout", {
                  value: formatters.formatDecimal(workoutTotals.averagePointsPerWorkout, 1),
                })
              : undefined
          }
          change={
            workoutComparison?.points?.change
              ? {
                  trend: getTrend(workoutComparison.points.change),
                  value: formatters.formatChange(workoutComparison.points.change) ?? "—",
                  label: t("stats.vsPreviousPeriod"),
                }
              : undefined
          }
        />
        <AnalyticsStatCard
          title={t("stats.totalWorkouts")}
          value={formatters.formatInteger(workoutTotals?.workouts ?? 0)}
          icon={<ActivityIcon className="h-4 w-4 text-blue-500" />}
          description={
            workoutTotals?.activeDays
              ? t("stats.activeDaysCount", { count: workoutTotals.activeDays })
              : undefined
          }
          change={
            workoutComparison?.workouts?.change
              ? {
                  trend: getTrend(workoutComparison.workouts.change),
                  value: formatters.formatChange(workoutComparison.workouts.change) ?? "—",
                  label: t("stats.vsPreviousPeriod"),
                }
              : undefined
          }
        />
        <AnalyticsStatCard
          title={t("stats.totalDuration")}
          value={formatters.formatDurationMinutes(workoutTotals?.durationMinutes ?? 0)}
          icon={<CalendarRange className="h-4 w-4 text-purple-500" />}
          description={
            workoutTotals?.averageDurationPerWorkout
              ? t("stats.averageDurationPerWorkout", {
                  value: formatters.formatDurationMinutes(workoutTotals.averageDurationPerWorkout),
                })
              : undefined
          }
          change={
            workoutComparison?.durationMinutes?.change
              ? {
                  trend: getTrend(workoutComparison.durationMinutes.change),
                  value:
                    formatters.formatChange(workoutComparison.durationMinutes.change, {
                      isDuration: true,
                    }) ?? "—",
                  label: t("stats.vsPreviousPeriod"),
                }
              : undefined
          }
        />
        <AnalyticsStatCard
          title={t("stats.readinessScore")}
          value={
            moodReadiness !== null && moodReadiness !== undefined
              ? formatters.formatDecimal(moodReadiness, 1)
              : "—"
          }
          icon={<HeartPulse className="h-4 w-4 text-emerald-500" />}
          description={
            moodReadiness !== null && moodReadiness !== undefined
              ? t("stats.readinessDescription", {
                  value: formatters.formatDecimal(moodReadiness, 1),
                })
              : undefined
          }
          change={
            readinessChange
              ? {
                  trend: getTrend(readinessChange),
                  value: formatters.formatChange(readinessChange, { digits: 1 }) ?? "—",
                  label: t("stats.vsPreviousPeriod"),
                }
              : undefined
          }
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{t("stats.trainingVolume")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {range
                ? t("stats.rangeLabel", {
                    start: formatters.formatRangeDate(range.start),
                    end: formatters.formatRangeDate(range.end),
                  })
                : t("stats.zoomHint")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 rounded-md border px-1 py-1 text-xs text-muted-foreground">
              <span className="hidden sm:inline-block px-2 text-[13px] font-medium text-foreground">
                {t("stats.chartMode")}
              </span>
              <Button
                size="sm"
                variant={chartMode === "stacked" ? "default" : "ghost"}
                onClick={() => setChartMode("stacked")}
                className="gap-1"
              >
                <LayoutPanelTop className="h-4 w-4" />
                {t("stats.chartModeStacked")}
              </Button>
              <Button
                size="sm"
                variant={chartMode === "grouped" ? "default" : "ghost"}
                onClick={() => setChartMode("grouped")}
                className="gap-1"
              >
                <LineChart className="h-4 w-4" />
                {t("stats.chartModeGrouped")}
              </Button>
            </div>

            {activityMetrics.map((metric) => {
              const isSelected = selectedActivityKeys.includes(metric.key);
              return (
                <Button
                  key={metric.key}
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onToggleActivityMetric(metric.key)}
                  style={isSelected ? { backgroundColor: metric.color } : undefined}
                  className={isSelected ? "text-white" : undefined}
                >
                  {metric.label}
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {hasTimeline ? (
            <ActivityTimelineChart
              data={timeline}
              metrics={selectedActivityConfigs.map((metric) => ({
                key: metric.key,
                label: metric.label,
                color: metric.color,
              }))}
              stacked={chartMode === "stacked"}
              formatDate={(value) => formatters.formatRangeDate(value)}
              formatValue={(key, value) =>
                key === "running" || key === "cycling"
                  ? formatters.formatDecimal(value, 1)
                  : formatters.formatInteger(Math.round(value))
              }
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noWorkoutData")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("stats.activityBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          {workouts && workouts.activityBreakdown.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {workouts.activityBreakdown.map((activity) => (
                <div key={activity.activity} className="rounded-lg border p-4 flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    {activityMetrics.find((metric) => metric.key === activity.activity)?.label ??
                      activity.activity}
                  </span>
                  <span className="text-xl font-semibold">
                    {activity.total !== null ? formatters.formatDecimal(activity.total, 1) : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatters.formatDecimal(activity.percentage, 1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noWorkoutData")}</p>
          )}
        </CardContent>
      </Card>

      <AnalyticsInsights insights={insights} t={t} />
    </>
  );
}
