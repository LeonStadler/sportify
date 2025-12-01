import { TimeRangeFilter } from "@/components/filters/TimeRangeFilter";
import { PageTemplate } from "@/components/PageTemplate";
import { ScoreboardTable } from "@/components/ScoreboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { getNormalizedRange, getRangeForPeriod } from "@/utils/dateRanges";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

export function Scoreboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [period, setPeriod] = useState("all");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [offset, setOffset] = useState(0);

  const activityTypes = useMemo(
    () => [
      { id: "all", name: t("scoreboard.activityTypes.all"), icon: "🏆" },
      {
        id: "pullups",
        name: t("scoreboard.activityTypes.pullups"),
        icon: "💪",
      },
      {
        id: "pushups",
        name: t("scoreboard.activityTypes.pushups"),
        icon: "🔥",
      },
      {
        id: "running",
        name: t("scoreboard.activityTypes.running"),
        icon: "🏃",
      },
      {
        id: "cycling",
        name: t("scoreboard.activityTypes.cycling"),
        icon: "🚴",
      },
      { id: "situps", name: t("scoreboard.activityTypes.situps"), icon: "🚀" },
    ],
    [t]
  );

  const formatDate = (date: Date) =>
    date.toLocaleDateString(i18n.language === "en" ? "en-US" : "de-DE");

  const resolvedRange = useMemo(
    () => getNormalizedRange(getRangeForPeriod(period, customRange, offset)),
    [customRange, period, offset]
  );
  const effectivePeriod = offset > 0 && period !== "custom" ? "custom" : period;

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setOffset(0);
    if (value !== "custom") {
      setCustomRange(undefined);
    }
  };

  const handleRangeChange = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range?.from && range?.to) {
      setPeriod("custom");
      setOffset(0);
    }
  };

  const handleOffsetChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const activePeriodLabel =
    effectivePeriod === "custom" && resolvedRange?.from && resolvedRange?.to
      ? `${formatDate(resolvedRange.from)} → ${formatDate(resolvedRange.to)}`
      : (() => {
          switch (period) {
            case "all":
              return t("filters.period.all");
            case "week":
              return t("filters.period.week");
            case "month":
              return t("filters.period.month");
            case "year":
              return t("filters.period.year");
            default:
              return t("filters.period.custom");
          }
        })();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">{t("scoreboard.mustBeLoggedIn")}</p>
      </div>
    );
  }

  return (
    <PageTemplate
      title={t("scoreboard.title")}
      subtitle={t("scoreboard.subtitle")}
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
            { value: "all", label: t("filters.period.all") },
            { value: "week", label: t("filters.period.week") },
            { value: "month", label: t("filters.period.month") },
            { value: "year", label: t("filters.period.year") },
            { value: "custom", label: t("filters.period.custom") },
          ]}
          formatDate={formatDate}
        />
      }
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {activityTypes.map((activity) => (
            <TabsTrigger key={activity.id} value={activity.id}>
              <span className="mr-1.5">{activity.icon}</span>
              <span>{activity.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {activityTypes.map((activity) => (
          <TabsContent key={activity.id} value={activity.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {activity.icon} {activity.name} {t("scoreboard.leaderboard")} ({activePeriodLabel})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreboardTable
                  activity={activity.id}
                  period={effectivePeriod}
                  dateRange={resolvedRange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </PageTemplate>
  );
}
