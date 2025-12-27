import { de, enUS } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { PageTemplate } from "@/components/common/PageTemplate";
import { TimeRangeFilter } from "@/components/filters/TimeRangeFilter";
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard";
import type {
  ActivityMetricOption,
  RecoveryMetricOption,
} from "@/features/analytics/types";
import { createAnalyticsFormatters } from "@/features/analytics/utils/formatters";
import { useAnalytics } from "@/hooks/use-analytics";
import { useToast } from "@/hooks/use-toast";
import { getNormalizedRange, getRangeForPeriod } from "@/utils/dateRanges";

export function Stats() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const locale = useMemo(() => (i18n.language === "en" ? enUS : de), [i18n.language]);
  const [period, setPeriod] = useState("week");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [offset, setOffset] = useState(0);
  const defaultTab = searchParams.get("tab") || "overview";

  // Berechne den aufgelösten Zeitraum basierend auf period und offset
  const resolvedRange = useMemo(
    () => getNormalizedRange(getRangeForPeriod(period, customRange, offset)),
    [customRange, period, offset]
  );

  const effectivePeriod = period === "custom" || offset > 0 ? "custom" : period;

  const analyticsSelection = useMemo(
    () => ({
      period: effectivePeriod,
      start: effectivePeriod === "custom" ? resolvedRange?.from ?? null : null,
      end: effectivePeriod === "custom" ? resolvedRange?.to ?? null : null,
    }),
    [effectivePeriod, resolvedRange?.from, resolvedRange?.to],
  );

  const { data, isLoading, error, reload } = useAnalytics(analyticsSelection);

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

  const handlePeriodChange = useCallback((nextPeriod: string) => {
    setPeriod(nextPeriod);
    setOffset(0);
    if (nextPeriod !== "custom") {
      setCustomRange(undefined);
    }
  }, []);

  const handleRangeChange = useCallback((range: DateRange | undefined) => {
    setCustomRange(range);
    if (range?.from && range?.to) {
      setPeriod("custom");
      setOffset(0);
    }
  }, []);

  const handleOffsetChange = useCallback((newOffset: number) => {
    setOffset(newOffset);
  }, []);

  return (
    <PageTemplate
      title={t("stats.title", "Statistics")}
      subtitle={t("stats.subtitle", "Detailed analysis of your athletic performance")}
      headerActions={
        <TimeRangeFilter
          period={period}
          range={customRange}
          offset={offset}
          onPeriodChange={handlePeriodChange}
          onRangeChange={handleRangeChange}
          onOffsetChange={handleOffsetChange}
          t={t}
          locale={i18n.language}
          presets={[
            { value: "week", label: t("filters.period.week") },
            { value: "month", label: t("filters.period.month") },
            { value: "quarter", label: t("filters.period.quarter") },
            { value: "year", label: t("filters.period.year") },
            { value: "custom", label: t("filters.period.custom") },
          ]}
          formatDate={(date) => formatters.formatRangeDate(date.toISOString())}
        />
      }
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
        defaultTab={defaultTab}
        t={t}
      />
    </PageTemplate>
  );
}
