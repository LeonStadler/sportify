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
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("stats.pointsTrend")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PointsTrendChart
            data={(workouts?.timeline ?? []) as AnalyticsWorkoutDay[]}
            areaLabel={t("stats.points")}
          />
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
              {workouts?.highlights.peakDay
                ? formatters.formatRangeDate(workouts.highlights.peakDay.date)
                : "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {workouts?.highlights.peakDay
                ? t("stats.pointsWithUnit", {
                    value: formatters.formatInteger(workouts.highlights.peakDay.points),
                  })
                : t("stats.noWorkoutData")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">{t("stats.longestWorkout")}</p>
            <p className="text-base font-medium">
              {workouts?.highlights.longestWorkout?.title ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {workouts?.highlights.longestWorkout
                ? `${formatters.formatRangeDate(workouts.highlights.longestWorkout.startTime)} · ${formatters.formatDurationMinutes(workouts.highlights.longestWorkout.durationMinutes)}`
                : t("stats.noWorkoutData")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">{t("stats.activeDays")}</p>
            <p className="text-base font-medium">
              {formatters.formatInteger(workouts?.highlights.activeDays ?? 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("stats.consistency", {
                value:
                  workouts?.totals.consistency !== null && workouts?.totals.consistency !== undefined
                    ? formatters.formatDecimal(workouts.totals.consistency, 1)
                    : "0",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
