import { useEffect, useMemo, useState } from "react";
import type { TFunction } from "i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";

import type { AnalyticsMoodDistributionEntry, AnalyticsResponse } from "@/types/analytics";

import type { AnalyticsFormatters } from "../utils/formatters";
import { ensureAtLeastOne } from "../utils/metrics";
import type { ActivityMetricOption, RecoveryMetricOption } from "../types";
import { AnalyticsOverviewTab } from "./AnalyticsOverviewTab";
import { AnalyticsTrainingTab } from "./AnalyticsTrainingTab";
import { AnalyticsRecoveryTab } from "./AnalyticsRecoveryTab";
import { AnalyticsBalanceTab } from "./AnalyticsBalanceTab";

type ActivityMetricKey = ActivityMetricOption["key"];
type RecoveryMetricKey = RecoveryMetricOption["key"];

interface AnalyticsDashboardProps {
  data: AnalyticsResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  formatters: AnalyticsFormatters;
  activityMetrics: ActivityMetricOption[];
  recoveryMetrics: RecoveryMetricOption[];
  t: TFunction;
}

const DEFAULT_RECOVERY_KEYS: RecoveryMetricKey[] = [
  "avgEnergy",
  "avgSleep",
  "avgSoreness",
];

export function AnalyticsDashboard({
  data,
  isLoading,
  error,
  onRetry,
  formatters,
  activityMetrics,
  recoveryMetrics,
  t,
}: AnalyticsDashboardProps) {
  const safeAnalyticsData = data ?? null;
  const workouts = safeAnalyticsData?.workouts;
  const recovery = safeAnalyticsData?.recovery;
  const balance = safeAnalyticsData?.balance;
  const insights = safeAnalyticsData?.insights;
  const range = safeAnalyticsData?.range;

  const [selectedActivityKeys, setSelectedActivityKeys] = useState<ActivityMetricKey[]>(() =>
    activityMetrics.map((metric) => metric.key),
  );
  const [selectedRecoveryKeys, setSelectedRecoveryKeys] = useState<RecoveryMetricKey[]>(() =>
    ensureAtLeastOne(
      DEFAULT_RECOVERY_KEYS.filter((key) =>
        recoveryMetrics.some((metric) => metric.key === key),
      ),
      recoveryMetrics[0]?.key ?? DEFAULT_RECOVERY_KEYS[0],
    ),
  );

  useEffect(() => {
    const availableKeys = activityMetrics.map((metric) => metric.key);
    setSelectedActivityKeys((prev) => {
      if (availableKeys.length === 0) {
        return [];
      }
      const filtered = prev.filter((key) => availableKeys.includes(key));
      return ensureAtLeastOne(filtered, availableKeys[0]);
    });
  }, [activityMetrics]);

  useEffect(() => {
    const availableKeys = recoveryMetrics.map((metric) => metric.key);
    setSelectedRecoveryKeys((prev) => {
      if (availableKeys.length === 0) {
        return [];
      }
      const filtered = prev.filter((key) => availableKeys.includes(key));
      return ensureAtLeastOne(filtered, availableKeys[0]);
    });
  }, [recoveryMetrics]);

  const selectedActivityConfigs = useMemo(() => {
    const availableKeys = activityMetrics.map((metric) => metric.key);
    if (availableKeys.length === 0) {
      return [] as ActivityMetricOption[];
    }
    const ensuredKeys = ensureAtLeastOne(
      selectedActivityKeys.filter((key) => availableKeys.includes(key)),
      availableKeys[0],
    );
    return ensuredKeys
      .map((key) => activityMetrics.find((metric) => metric.key === key))
      .filter((metric): metric is ActivityMetricOption => Boolean(metric));
  }, [activityMetrics, selectedActivityKeys]);

  const selectedRecoveryConfigs = useMemo(() => {
    const availableKeys = recoveryMetrics.map((metric) => metric.key);
    if (availableKeys.length === 0) {
      return [] as RecoveryMetricOption[];
    }
    const ensuredKeys = ensureAtLeastOne(
      selectedRecoveryKeys.filter((key) => availableKeys.includes(key)),
      availableKeys[0],
    );
    return ensuredKeys
      .map((key) => recoveryMetrics.find((metric) => metric.key === key))
      .filter((metric): metric is RecoveryMetricOption => Boolean(metric));
  }, [recoveryMetrics, selectedRecoveryKeys]);

  const moodDistribution: AnalyticsMoodDistributionEntry[] = recovery?.moodDistribution ?? [];
  const balanceData = balance?.daily ?? [];

  const showErrorAlert = error && error !== "missing-token";

  return (
    <div className="space-y-4 md:space-y-6">
      {showErrorAlert ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("stats.analyticsError")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{t("stats.analyticsErrorDescription")}</span>
            <Button size="sm" onClick={onRetry}>
              {t("stats.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading && !safeAnalyticsData ? (
        <div className="grid gap-4 md:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : null}

          {safeAnalyticsData ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="flex-wrap">
                <TabsTrigger value="overview">{t("stats.overview", "Übersicht")}</TabsTrigger>
                <TabsTrigger value="training">{t("stats.training", "Training")}</TabsTrigger>
                <TabsTrigger value="recovery">{t("stats.recovery", "Erholung")}</TabsTrigger>
                <TabsTrigger value="balance">{t("stats.balance", "Balance")}</TabsTrigger>
              </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <AnalyticsOverviewTab
              workouts={workouts}
              recovery={recovery}
              balance={balance}
              insights={insights}
              range={range ?? null}
              activityMetrics={activityMetrics}
              selectedActivityKeys={selectedActivityKeys}
              selectedActivityConfigs={selectedActivityConfigs}
              onToggleActivityMetric={(key: ActivityMetricKey) => {
                const availableKeys = activityMetrics.map((metric) => metric.key);
                setSelectedActivityKeys((prev) => {
                  const next = prev.includes(key)
                    ? prev.filter((value) => value !== key)
                    : [...prev, key];
                  const fallback = availableKeys[0] ?? key;
                  if (!fallback) {
                    return next;
                  }
                  return ensureAtLeastOne(next, fallback);
                });
              }}
              formatters={formatters}
              t={t}
            />
          </TabsContent>

          <TabsContent value="training" className="space-y-4 md:space-y-6">
            <AnalyticsTrainingTab workouts={workouts} formatters={formatters} t={t} />
          </TabsContent>

          <TabsContent value="recovery" className="space-y-4 md:space-y-6">
            <AnalyticsRecoveryTab
              recovery={recovery}
              moodDistribution={moodDistribution}
              recoveryMetrics={recoveryMetrics}
              selectedRecoveryKeys={selectedRecoveryKeys}
              selectedRecoveryConfigs={selectedRecoveryConfigs}
              onToggleRecoveryMetric={(key: RecoveryMetricKey) => {
                const availableKeys = recoveryMetrics.map((metric) => metric.key);
                setSelectedRecoveryKeys((prev) => {
                  const next = prev.includes(key)
                    ? prev.filter((value) => value !== key)
                    : [...prev, key];
                  const fallback = availableKeys[0] ?? key;
                  if (!fallback) {
                    return next;
                  }
                  return ensureAtLeastOne(next, fallback);
                });
              }}
              formatters={formatters}
              t={t}
            />
          </TabsContent>

          <TabsContent value="balance" className="space-y-4 md:space-y-6">
            <AnalyticsBalanceTab balanceData={balanceData} formatters={formatters} t={t} />
          </TabsContent>
        </Tabs>
      ) : null}

      {!isLoading && !safeAnalyticsData ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p>{t("stats.noData")}</p>
        </Card>
      ) : null}

      {isLoading && safeAnalyticsData ? (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t("stats.refreshing")}</span>
        </div>
      ) : null}
    </div>
  );
}
