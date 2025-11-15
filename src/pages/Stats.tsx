import { useEffect, useMemo, useState } from "react";
import { de, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { PageTemplate } from "@/components/PageTemplate";
import { useAnalytics } from "@/hooks/use-analytics";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard";
import { AnalyticsPeriodSelect } from "@/features/analytics/components/AnalyticsPeriodSelect";
import { createAnalyticsFormatters } from "@/features/analytics/utils/formatters";
import type {
  ActivityMetricOption,
  RecoveryMetricOption,
} from "@/features/analytics/types";

export function Stats() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const locale = useMemo(() => (i18n.language === "en" ? enUS : de), [i18n.language]);
  const [timeRange, setTimeRange] = useState("week");
  const { data, isLoading, error, reload } = useAnalytics(timeRange);

  useEffect(() => {
    if (error && error !== "missing-token") {
      toast({
        variant: "destructive",
        title: t("stats.analyticsError"),
        description: t("stats.analyticsErrorDescription"),
      });
    }
  }, [error, t, toast]);

  const activityMetrics = useMemo<ActivityMetricOption[]>(
    () => [
      { key: "pullups", label: t("stats.pullups"), color: "#3b82f6" },
      { key: "pushups", label: t("stats.pushups"), color: "#ef4444" },
      { key: "running", label: t("stats.runningKm"), color: "#22c55e" },
      { key: "cycling", label: t("stats.cyclingKm"), color: "#a855f7" },
      { key: "situps", label: t("stats.situps"), color: "#f97316" },
    ],
    [t],
  );

  const recoveryMetrics = useMemo<RecoveryMetricOption[]>(
    () => [
      { key: "avgEnergy", label: t("stats.energy"), color: "#3b82f6" },
      { key: "avgSleep", label: t("stats.sleep"), color: "#22c55e" },
      { key: "avgSoreness", label: t("stats.soreness"), color: "#ef4444" },
      { key: "avgExertion", label: t("stats.exertion"), color: "#f97316" },
      { key: "avgHydration", label: t("stats.hydration"), color: "#0ea5e9" },
    ],
    [t],
  );

  const formatters = useMemo(
    () => createAnalyticsFormatters({ language: i18n.language, locale, t }),
    [i18n.language, locale, t],
  );

  return (
    <PageTemplate
      title={t("stats.title", "Statistics")}
      subtitle={t("stats.subtitle", "Detailed analysis of your athletic performance")}
      headerActions={<AnalyticsPeriodSelect value={timeRange} onChange={setTimeRange} t={t} />}
      className="space-y-4 md:space-y-6"
    >
      <AnalyticsDashboard
        data={data ?? null}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        formatters={formatters}
        activityMetrics={activityMetrics}
        recoveryMetrics={recoveryMetrics}
        t={t}
      />
    </PageTemplate>
  );
}
