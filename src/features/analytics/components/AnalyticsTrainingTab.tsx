import { useState } from "react";
import { ActivityTimelineChart } from "@/components/analytics/ActivityTimelineChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TFunction } from "i18next";

import { PointsTrendChart } from "@/components/analytics/PointsTrendChart";
import type {
  AnalyticsRange,
  AnalyticsWorkoutDay,
  AnalyticsWorkoutsData,
} from "@/types/analytics";

import type { AnalyticsFormatters } from "../utils/formatters";
import type { ActivityMetricOption } from "../types";

interface AnalyticsTrainingTabProps {
  workouts?: AnalyticsWorkoutsData;
  range?: AnalyticsRange | null;
  activityMetrics: ActivityMetricOption[];
  selectedActivityKeys: ActivityMetricOption["key"][];
  selectedActivityConfigs: ActivityMetricOption[];
  onToggleActivityMetric: (key: ActivityMetricOption["key"]) => void;
  formatters: AnalyticsFormatters;
  t: TFunction;
  distanceUnit?: "km" | "miles";
  extraContent?: React.ReactNode;
}

export function AnalyticsTrainingTab({
  workouts,
  range,
  activityMetrics,
  selectedActivityKeys,
  selectedActivityConfigs,
  onToggleActivityMetric,
  formatters,
  t,
  distanceUnit = "km",
  extraContent,
}: AnalyticsTrainingTabProps) {
  const highlights = workouts?.highlights;
  const totals = workouts?.totals;
  const timeline = (workouts?.timeline ?? []) as AnalyticsWorkoutDay[];
  const hasTimeline = timeline.length > 0;
  const [chartMode, setChartMode] = useState<"stacked" | "grouped">("stacked");
  const activityTimelineData = timeline.map((entry) => {
    const activityTotals = entry.activities || {};
    const row: Record<string, number | string> = {
      date: entry.date,
    };
    const distanceFactor = distanceUnit === "miles" ? 0.621371 : 1;
    selectedActivityConfigs.forEach((metric) => {
      const rawValue = Number(activityTotals[metric.key] ?? 0);
      const normalizedValue =
        metric.measurementType === "time"
          ? rawValue / 60
          : metric.measurementType === "distance"
            ? rawValue * distanceFactor
            : rawValue;
      row[metric.key] = normalizedValue;
    });
    return row;
  });

  return (
    <>
      {extraContent}
      <Card>
        <CardHeader>
          <CardTitle>{t("stats.pointsTrend")}</CardTitle>
        </CardHeader>
        <CardContent>
          {hasTimeline ? (
            <PointsTrendChart
              data={timeline}
              areaLabel={t("stats.points")}
              formatDate={(value) => formatters.formatRangeDate(value)}
              formatValue={(value) => formatters.formatInteger(Math.round(value))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noWorkoutData")}</p>
          )}
        </CardContent>
      </Card>

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
                {t("stats.chartModeStacked")}
              </Button>
              <Button
                size="sm"
                variant={chartMode === "grouped" ? "default" : "ghost"}
                onClick={() => setChartMode("grouped")}
                className="gap-1"
              >
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
              data={activityTimelineData}
              metrics={selectedActivityConfigs.map((metric) => ({
                key: metric.key,
                label: metric.label,
                color: metric.color,
                measurementType: metric.measurementType,
              }))}
              stacked={chartMode === "stacked"}
              formatDate={(value) => formatters.formatRangeDate(value)}
              formatValue={(key, value) => {
                const metric = selectedActivityConfigs.find((item) => item.key === key);
                const measurementType = metric?.measurementType;
                if (measurementType === "distance") {
                  return formatters.formatDecimal(value, 1);
                }
                if (measurementType === "time") {
                  return formatters.formatInteger(Math.round(value));
                }
                return formatters.formatInteger(Math.round(value));
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noWorkoutData")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("stats.longestWorkout")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">{t("stats.peakDay")}</p>
            <p className="text-base font-medium">
              {highlights?.peakDay
                ? formatters.formatRangeDate(highlights.peakDay.date)
                : "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {highlights?.peakDay
                ? t("stats.pointsWithUnit", {
                    value: formatters.formatInteger(highlights.peakDay.points),
                  })
                : t("stats.noWorkoutData")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">{t("stats.longestWorkout")}</p>
            <p className="text-base font-medium">
              {highlights?.longestWorkout?.title ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {highlights?.longestWorkout
                ? `${formatters.formatRangeDate(highlights.longestWorkout.startTime)} · ${formatters.formatDurationMinutes(highlights.longestWorkout.durationMinutes)}`
                : t("stats.noWorkoutData")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">{t("stats.activeDays")}</p>
            <p className="text-base font-medium">
              {formatters.formatInteger(highlights?.activeDays ?? 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("stats.consistency", {
                value:
                  totals?.consistency !== null && totals?.consistency !== undefined
                    ? formatters.formatDecimal(totals.consistency, 1)
                    : "0",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
