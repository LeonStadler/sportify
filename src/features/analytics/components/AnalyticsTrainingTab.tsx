import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TFunction } from "i18next";

import { PointsTrendChart } from "@/components/analytics/PointsTrendChart";
import type { AnalyticsWorkoutDay, AnalyticsWorkoutsData } from "@/types/analytics";

import type { AnalyticsFormatters } from "../utils/formatters";

interface AnalyticsTrainingTabProps {
  workouts?: AnalyticsWorkoutsData;
  formatters: AnalyticsFormatters;
  t: TFunction;
}

export function AnalyticsTrainingTab({ workouts, formatters, t }: AnalyticsTrainingTabProps) {
  const highlights = workouts?.highlights;
  const totals = workouts?.totals;
  const timeline = (workouts?.timeline ?? []) as AnalyticsWorkoutDay[];
  const hasTimeline = timeline.length > 0;

  return (
    <>
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
