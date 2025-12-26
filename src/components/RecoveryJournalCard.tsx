import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, CalendarRange, BarChart3, FileText, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/lib/api";
import { useTranslation } from "react-i18next";

type PeriodOption = "week" | "month" | "quarter" | "year";

interface RecoverySummary {
  entries: number;
  avgEnergy: number | null;
  avgFocus: number | null;
  avgSleep: number | null;
  avgSoreness: number | null;
  avgExertion: number | null;
  dominantMood?: string | null;
}

interface RecoveryTimelineEntry {
  entryDate: string;
  entryCount: number;
}

interface RecoveryAnalytics {
  summary: RecoverySummary;
  timeline: RecoveryTimelineEntry[];
}

export function RecoveryJournalCard({ className }: { className?: string }) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState<PeriodOption>("week");
  const [data, setData] = useState<RecoveryAnalytics>({
    summary: {
      entries: 0,
      avgEnergy: null,
      avgFocus: null,
      avgSleep: null,
      avgSoreness: null,
      avgExertion: null,
      dominantMood: null,
    },
    timeline: [],
  });
  const [lastEntryGlobal, setLastEntryGlobal] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatNumber = (value: number | null, digits = 1) =>
    value === null || value === undefined ? "—" : value.toFixed(digits);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const resp = await fetch(`${API_URL}/stats/analytics?period=${period}`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
          signal: controller.signal,
        });
        if (!resp.ok) throw new Error("Failed to load recovery analytics");
        const payload = await resp.json();
        setData({
          summary: payload?.recovery?.summary ?? data.summary,
          timeline: payload?.recovery?.timeline ?? [],
        });

        // Fallback: hole den letzten Eintrag unabhängig vom gewählten Zeitraum (rolling year)
        const lastResp = await fetch(`${API_URL}/stats/analytics?period=year`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
          signal: controller.signal,
        });
        if (lastResp.ok) {
          const lastPayload = await lastResp.json();
          const lastTimeline = lastPayload?.recovery?.timeline ?? [];
          const withEntries = lastTimeline.filter((d: any) => (d.entryCount ?? 0) > 0);
          if (withEntries.length) {
            const last = withEntries[withEntries.length - 1];
            setLastEntryGlobal(new Date(last.entryDate));
          } else {
            setLastEntryGlobal(null);
          }
        }
      } catch (e) {
        console.error("Recovery analytics load error", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, period]);

  const lastEntry = useMemo(() => {
    if (!data.timeline?.length) return null;
    const withEntries = data.timeline.filter((d) => (d.entryCount ?? 0) > 0);
    if (!withEntries.length) return null;
    const last = withEntries[withEntries.length - 1];
    return new Date(last.entryDate);
  }, [data.timeline]);

  const lastEntryDisplay = lastEntryGlobal || lastEntry;

  const metrics = [
    { key: "avgExertion", label: t("recoveryDiary.metrics.exertion", "Belastung"), value: data.summary.avgExertion },
    { key: "avgSoreness", label: t("recoveryDiary.metrics.soreness", "Muskelkater"), value: data.summary.avgSoreness },
    { key: "avgSleep", label: t("recoveryDiary.metrics.sleep", "Schlafqualität"), value: data.summary.avgSleep },
    { key: "avgFocus", label: t("recoveryDiary.metrics.focus", "Fokus"), value: data.summary.avgFocus },
    { key: "avgEnergy", label: t("recoveryDiary.metrics.energy", "Energie"), value: data.summary.avgEnergy },
  ];

  const periodLabel =
    period === "week"
      ? t("common.week", "Woche")
      : period === "month"
      ? t("common.month", "Monat")
      : period === "quarter"
      ? t("common.quarter", "Quartal")
      : t("common.year", "Jahr");

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1.5">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-500" />
            {t("recoveryDiary.title", "Erholungstagebuch")}
          </CardTitle>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {t("recoveryDiary.entries", "Einträge")}: {data.summary.entries ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              {t("recoveryDiary.lastEntry", "Letzter Eintrag")}:{" "}
              {lastEntryDisplay ? lastEntryDisplay.toLocaleDateString(i18n.language) : "—"}
            </span>
            {data.summary.dominantMood ? (
              <span className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {data.summary.dominantMood}
                </Badge>
                <span className="text-[10px]">{t("recoveryDiary.mood", "Stimmung")}</span>
              </span>
            ) : null}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <CalendarDays className="h-4 w-4" />
              {periodLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setPeriod("week")}>
              {t("common.week", "Woche")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPeriod("month")}>
              {t("common.month", "Monat")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPeriod("quarter")}>
              {t("common.quarter", "Quartal")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPeriod("year")}>
              {t("common.year", "Jahr")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading", "Lädt...")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.map((m) => (
              <div
                key={m.key}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/30"
              >
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <Badge variant="secondary" className="text-sm">
                  {formatNumber(m.value, 1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

