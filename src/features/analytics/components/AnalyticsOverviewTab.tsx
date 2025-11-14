import { ActivityTimelineChart } from "@/components/analytics/ActivityTimelineChart";
import { AnalyticsStatCard } from "@/components/analytics/AnalyticsStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TFunction } from "i18next";
import { CalendarRange, HeartPulse, TrendingUp, Activity as ActivityIcon } from "lucide-react";

import type {
  AnalyticsBalanceData,
  AnalyticsRange,
  AnalyticsRecoveryData,
  AnalyticsWorkoutDay,
  AnalyticsWorkoutsData,
} from "@/types/analytics";

import type { AnalyticsFormatters } from "../utils/formatters";
import { getTrend } from "../utils/metrics";
import type { MetricOption } from "../types";

interface AnalyticsOverviewTabProps {
  workouts?: AnalyticsWorkoutsData;
  recovery?: AnalyticsRecoveryData;
  balance?: AnalyticsBalanceData;
  range?: AnalyticsRange | null;
  activityMetrics: MetricOption[];
  selectedActivityKeys: string[];
  selectedActivityConfigs: MetricOption[];
  onToggleActivityMetric: (key: string) => void;
  formatters: AnalyticsFormatters;
  t: TFunction;
}

export function AnalyticsOverviewTab({
  workouts,
  recovery,
  balance,
  range,
  activityMetrics,
  selectedActivityKeys,
  selectedActivityConfigs,
  onToggleActivityMetric,
  formatters,
  t,
}: AnalyticsOverviewTabProps) {
  const moodReadiness = recovery?.summary.avgReadiness;
  const readinessChange = balance?.readiness.change;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <AnalyticsStatCard
          title={t("stats.totalPoints")}
          value={formatters.formatInteger(workouts?.totals.points ?? 0)}
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
          description={
            workouts?.totals.averagePointsPerWorkout
              ? t("stats.averagePointsPerWorkout", {
                  value: formatters.formatDecimal(workouts.totals.averagePointsPerWorkout, 1),
                })
              : undefined
          }
          change={
            workouts
              ? {
                  trend: getTrend(workouts.comparison.points.change),
                  value: formatters.formatChange(workouts.comparison.points.change) ?? "—",
                  label: t("stats.vsPreviousPeriod"),
                }
              : undefined
          }
        />
        <AnalyticsStatCard
          title={t("stats.totalWorkouts")}
          value={formatters.formatInteger(workouts?.totals.workouts ?? 0)}
          icon={<ActivityIcon className="h-4 w-4 text-blue-500" />}
          description={
            workouts?.totals.activeDays
              ? t("stats.activeDays", { count: workouts.totals.activeDays })
              : undefined
          }
          change={
            workouts
              ? {
                  trend: getTrend(workouts.comparison.workouts.change),
                  value: formatters.formatChange(workouts.comparison.workouts.change) ?? "—",
                  label: t("stats.vsPreviousPeriod"),
                }
              : undefined
          }
        />
        <AnalyticsStatCard
          title={t("stats.totalDuration")}
          value={formatters.formatDurationMinutes(workouts?.totals.durationMinutes ?? 0)}
          icon={<CalendarRange className="h-4 w-4 text-purple-500" />}
          description={
            workouts?.totals.averageDurationPerWorkout
              ? t("stats.averageDurationPerWorkout", {
                  value: formatters.formatDurationMinutes(workouts.totals.averageDurationPerWorkout),
                })
              : undefined
          }
          change={
            workouts
              ? {
                  trend: getTrend(workouts.comparison.durationMinutes.change),
                  value:
                    formatters.formatChange(workouts.comparison.durationMinutes.change, {
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
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("stats.trainingVolume")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {range
                ? t("stats.rangeLabel", {
                    start: formatters.formatRangeDate(range.start),
                    end: formatters.formatRangeDate(range.end),
                  })
                : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
          {workouts ? (
            <ActivityTimelineChart
              data={(workouts.timeline ?? []) as AnalyticsWorkoutDay[]}
              metrics={selectedActivityConfigs.map((metric) => ({
                key: metric.key,
                label: metric.label,
                color: metric.color,
              }))}
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
    </>
  );
}
