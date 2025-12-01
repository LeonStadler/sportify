import { AnalyticsStatCard } from "@/components/analytics/AnalyticsStatCard";
import { MoodDistributionChart } from "@/components/analytics/MoodDistributionChart";
import { RecoveryTrendChart } from "@/components/analytics/RecoveryTrendChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TFunction } from "i18next";
import { CalendarRange, Flame, Gauge, MoonStar } from "lucide-react";

import type {
  AnalyticsInsightData,
  AnalyticsMoodDistributionEntry,
  AnalyticsRecoveryData,
  AnalyticsRecoveryDay,
} from "@/types/analytics";

import type { AnalyticsFormatters } from "../utils/formatters";
import { getTrend } from "../utils/metrics";
import type { RecoveryMetricOption } from "../types";
import { AnalyticsInsights } from "./AnalyticsInsights";

interface AnalyticsRecoveryTabProps {
  recovery?: AnalyticsRecoveryData;
  insights?: AnalyticsInsightData;
  moodDistribution: AnalyticsMoodDistributionEntry[];
  recoveryMetrics: RecoveryMetricOption[];
  selectedRecoveryKeys: RecoveryMetricOption["key"][];
  selectedRecoveryConfigs: RecoveryMetricOption[];
  onToggleRecoveryMetric: (key: RecoveryMetricOption["key"]) => void;
  formatters: AnalyticsFormatters;
  t: TFunction;
}

export function AnalyticsRecoveryTab({
  recovery,
  insights,
  moodDistribution,
  recoveryMetrics,
  selectedRecoveryKeys,
  selectedRecoveryConfigs,
  onToggleRecoveryMetric,
  formatters,
  t,
}: AnalyticsRecoveryTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <AnalyticsStatCard
          title={t("stats.recoveryEntries")}
          value={formatters.formatInteger(recovery?.summary.entries ?? 0)}
          icon={<CalendarRange className="h-4 w-4 text-blue-500" />}
          change={
            recovery
              ? {
                  trend: getTrend(recovery.comparison.entries),
                  value: formatters.formatChange(recovery.comparison.entries) ?? "—",
                  label: t("stats.vsPreviousPeriod"),
                }
              : undefined
          }
        />
        <AnalyticsStatCard
          title={t("stats.energy")}
          value={
            recovery?.summary.avgEnergy !== null && recovery?.summary.avgEnergy !== undefined
              ? formatters.formatDecimal(recovery.summary.avgEnergy, 1)
              : "—"
          }
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          change={
            recovery
              ? {
                  trend: getTrend(recovery.comparison.energy),
                  value: formatters.formatChange(recovery.comparison.energy, { digits: 1 }) ?? "—",
                  label: t("stats.vsPreviousPeriod"),
                }
              : undefined
          }
        />
        <AnalyticsStatCard
          title={t("stats.sleep")}
          value={
            recovery?.summary.avgSleepDuration !== null && recovery?.summary.avgSleepDuration !== undefined
              ? `${formatters.formatDecimal(recovery.summary.avgSleepDuration, 1)}h`
              : "—"
          }
          icon={<MoonStar className="h-4 w-4 text-indigo-500" />}
        />
        <AnalyticsStatCard
          title={t("stats.restingHeartRate")}
          value={
            recovery?.summary.avgRestingHeartRate !== null && recovery?.summary.avgRestingHeartRate !== undefined
              ? `${formatters.formatInteger(recovery.summary.avgRestingHeartRate)} bpm`
              : "—"
          }
          icon={<Gauge className="h-4 w-4 text-emerald-500" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("stats.recoveryTrend")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("stats.recoveryTrendDescription")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recoveryMetrics.map((metric) => {
              const isSelected = selectedRecoveryKeys.includes(metric.key);
              return (
                <Button
                  key={metric.key}
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onToggleRecoveryMetric(metric.key)}
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
          {recovery && recovery.timeline.length ? (
            <RecoveryTrendChart
              data={(recovery.timeline ?? []) as AnalyticsRecoveryDay[]}
              metrics={selectedRecoveryConfigs.map((metric) => ({
                key: metric.key,
                label: metric.label,
                color: metric.color,
              }))}
              formatDate={(value) => formatters.formatRangeDate(value)}
              formatValue={(key, value) => {
                if (key === "avgRestingHeartRate") return `${formatters.formatInteger(value)} bpm`;
                if (key === "avgSleepDuration") return `${formatters.formatDecimal(value, 1)} h`;
                return formatters.formatDecimal(value, 1);
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noRecoveryData")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("stats.moodDistribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          {moodDistribution.length ? (
            <MoodDistributionChart data={moodDistribution} />
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noRecoveryData")}</p>
          )}
        </CardContent>
      </Card>

      <AnalyticsInsights insights={insights} t={t} />
    </>
  );
}
