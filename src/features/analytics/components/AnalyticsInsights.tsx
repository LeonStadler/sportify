import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TFunction } from "i18next";

import { CorrelationScatterChart } from "@/components/analytics/CorrelationScatterChart";
import type { AnalyticsInsightData } from "@/types/analytics";

interface AnalyticsInsightsProps {
  insights?: AnalyticsInsightData;
  t: TFunction;
}

const TRAINING_LABELS: Record<string, string> = {
  points: "points",
  workouts: "totalWorkouts",
  durationMinutes: "totalDuration",
};

const RECOVERY_LABELS: Record<string, string> = {
  avgEnergy: "energy",
  avgFocus: "focus",
  avgSleep: "sleep",
  avgSoreness: "soreness",
  avgExertion: "exertion",
  avgHydration: "hydration",
  avgRestingHeartRate: "restingHeartRate",
  avgSleepDuration: "sleepDuration",
  readinessScore: "readinessLabel",
};

const formatLabel = (key: string, t: TFunction) => t(`stats.${RECOVERY_LABELS[key] ?? key}`, key);

export function AnalyticsInsights({ insights, t }: AnalyticsInsightsProps) {
  if (!insights) {
    return null;
  }

  const topCorrelation = insights.primaryCorrelation;

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>{t("stats.correlationTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("stats.correlationDescription")}</p>
        </CardHeader>
        <CardContent>
          {topCorrelation && topCorrelation.pairs.length ? (
            <CorrelationScatterChart
              data={topCorrelation}
              xLabel={t(`stats.${TRAINING_LABELS[topCorrelation.trainingMetric]}`)}
              yLabel={formatLabel(topCorrelation.recoveryMetric, t)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.notEnoughData")}</p>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2 grid gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.topCorrelations")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.correlations.length ? (
              insights.correlations.map((entry) => (
                <div key={`${entry.trainingMetric}-${entry.recoveryMetric}`} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {t(`stats.${TRAINING_LABELS[entry.trainingMetric]}`)} ↔ {formatLabel(entry.recoveryMetric, t)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("stats.samples", { count: entry.sampleSize })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {entry.correlation > 0 ? "↑" : "↓"}
                    {Math.abs(entry.correlation).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("stats.notEnoughData")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("stats.readinessDrivers")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.readinessDrivers.length ? (
              insights.readinessDrivers.map((entry) => (
                <div key={entry.recoveryMetric} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{formatLabel(entry.recoveryMetric, t)}</p>
                    <p className="text-xs text-muted-foreground">{t("stats.samples", { count: entry.sampleSize })}</p>
                  </div>
                  <span className="text-sm font-semibold">
                    {entry.correlation > 0 ? "↑" : "↓"}
                    {Math.abs(entry.correlation).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("stats.notEnoughData")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
