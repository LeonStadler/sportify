import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsStatCard } from "@/components/analytics/AnalyticsStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { ActivityMetricOption } from "../types";

interface AnalyticsOverviewTabProps {
  workouts?: AnalyticsWorkoutsData;
  recovery?: AnalyticsRecoveryData;
  balance?: AnalyticsBalanceData;
  range?: AnalyticsRange | null;
  activityMetrics: ActivityMetricOption[];
  formatters: AnalyticsFormatters;
  t: TFunction;
}

export function AnalyticsOverviewTab({
  workouts,
  recovery,
  balance,
  range,
  activityMetrics,
  formatters,
  t,
}: AnalyticsOverviewTabProps) {
  const workoutTotals = workouts?.totals;
  const workoutComparison = workouts?.comparison;

  const moodReadiness = recovery?.summary.avgReadiness;
  const readinessChange = balance?.readiness.change;

  const timeline = useMemo(
    () => (workouts?.timeline ?? []) as AnalyticsWorkoutDay[],
    [workouts?.timeline],
  );
  const hasTimeline = timeline.length > 0;

  const breakdownChartData = useMemo(() => {
    if (!workouts?.activityBreakdown?.length) return null;
    const row: Record<string, number | string> = { name: "share" };
    workouts.activityBreakdown.forEach((entry) => {
      row[entry.activity] = entry.percentage;
    });
    return [row];
  }, [workouts?.activityBreakdown]);

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
        <CardHeader>
          <CardTitle>{t("stats.activityBreakdown")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {range
              ? t("stats.rangeLabel", {
                  start: formatters.formatRangeDate(range.start),
                  end: formatters.formatRangeDate(range.end),
                })
              : t("stats.zoomHint")}
          </p>
        </CardHeader>
        <CardContent>
          {workouts && workouts.activityBreakdown.length ? (
            <div className="space-y-4">
              {breakdownChartData ? (
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={breakdownChartData}
                      layout="vertical"
                      margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted) / 0.25)" }}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--popover))",
                        }}
                        formatter={(value: number, key: string) => {
                          const metric = activityMetrics.find((m) => m.key === key);
                          return [`${formatters.formatDecimal(value, 1)}%`, metric?.label ?? key];
                        }}
                      />
                      {activityMetrics.map((metric) => (
                        <Bar
                          key={metric.key}
                          dataKey={metric.key as string}
                          stackId="share"
                          fill={metric.color}
                          maxBarSize={24}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : null}

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
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noWorkoutData")}</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
