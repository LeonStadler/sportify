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
import {
  CalendarDays,
  CalendarRange,
  BarChart3,
  FileText,
  Info,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import type { TrainingJournalEntry } from "@/types/training-journal";
import { useNavigate } from "react-router-dom";
import { WidgetFooterButton } from "@/components/dashboard/WidgetFooterButton";

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

interface RecentWorkoutOption {
  id: string;
  title: string;
  workoutDate?: string;
}

export function RecoveryJournalCard({ className }: { className?: string }) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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
  const [latestEntry, setLatestEntry] = useState<TrainingJournalEntry | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkoutOption[]>([]);

  const formatNumber = (value: number | null, digits = 1) =>
    value === null || value === undefined ? "—" : value.toFixed(digits);

  const formatScaleValue = (value?: number | null) =>
    typeof value === "number" && !Number.isNaN(value) ? `${value}/10` : "—";

  const locale = useMemo(
    () => (i18n.language === "en" ? enUS : de),
    [i18n.language]
  );

  const moodMap = useMemo(
    () => ({
      energized: { emoji: "⚡", label: t("recoveryDiary.moods.energized") },
      balanced: { emoji: "🙂", label: t("recoveryDiary.moods.balanced") },
      tired: { emoji: "😴", label: t("recoveryDiary.moods.tired") },
      sore: { emoji: "💢", label: t("recoveryDiary.moods.sore") },
      stressed: { emoji: "⚠️", label: t("recoveryDiary.moods.stressed") },
      motivated: { emoji: "🔥", label: t("recoveryDiary.moods.motivated") },
      relaxed: { emoji: "😌", label: t("recoveryDiary.moods.relaxed") },
      excited: { emoji: "🎉", label: t("recoveryDiary.moods.excited") },
      focused: { emoji: "🎯", label: t("recoveryDiary.moods.focused") },
      frustrated: { emoji: "😤", label: t("recoveryDiary.moods.frustrated") },
    }),
    [t]
  );

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "—";
    return format(parsed, "PPP", { locale });
  };

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token ?? ""}` };

        const [analyticsResp, summaryResp] = await Promise.all([
          fetch(`${API_URL}/stats/analytics?period=${period}`, {
            headers,
            signal: controller.signal,
          }),
          fetch(`${API_URL}/training-journal/summary?period=year`, {
            headers,
            signal: controller.signal,
          }),
        ]);

        if (!analyticsResp.ok) throw new Error("Failed to load recovery analytics");
        const payload = await analyticsResp.json();
        setData({
          summary: payload?.recovery?.summary ?? data.summary,
          timeline: payload?.recovery?.timeline ?? [],
        });

        if (summaryResp.ok) {
          const summaryPayload = await summaryResp.json();
          const latest = summaryPayload?.latestEntry ?? null;
          setLatestEntry(latest);
          const lastEntryDate =
            summaryPayload?.lastEntry ??
            summaryPayload?.latestEntry?.entryDate ??
            null;
          setLastEntryGlobal(lastEntryDate ? new Date(lastEntryDate) : null);

          if (latest?.workoutId) {
            const recentResp = await fetch(`${API_URL}/recent-workouts`, {
              headers,
              signal: controller.signal,
            });
            if (recentResp.ok) {
              const data = await recentResp.json();
              const workoutsArray = Array.isArray(data)
                ? data
                : Array.isArray(data.workouts)
                ? data.workouts
                : [];
              const mapped: RecentWorkoutOption[] = workoutsArray
                .map((w: unknown) => {
                  if (!w || typeof w !== "object") return null;
                  const entry = w as Record<string, unknown>;
                  const id = typeof entry.id === "string" ? entry.id : null;
                  if (!id) return null;
                  const title =
                    typeof entry.title === "string" ? entry.title : t("recoveryDiary.noWorkout");
                  const workoutDate =
                    typeof entry.workoutDate === "string"
                      ? entry.workoutDate
                      : typeof entry.createdAt === "string"
                      ? entry.createdAt
                      : undefined;
                  return { id, title, workoutDate };
                })
                .filter((w): w is RecentWorkoutOption => Boolean(w));
              setRecentWorkouts(mapped);
            }
          }
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }
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

  const lastEntryDisplay = latestEntry?.entryDate
    ? new Date(latestEntry.entryDate)
    : lastEntryGlobal || lastEntry;

  const latestEntryWorkout =
    latestEntry && latestEntry.workoutId
      ? recentWorkouts.find((w) => w.id === latestEntry.workoutId)
      : null;

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
      <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 space-y-0 pb-3">
        <div className="space-y-1.5 min-w-0">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2 flex-wrap">
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
        <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading", "Lädt...")}</p>
        ) : (
          <>
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

            {latestEntry ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">
                    {t("recoveryDiary.latestEntry", "Letzter Eintrag")}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(latestEntry.entryDate)}
                  </span>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {moodMap[latestEntry.mood] ? (
                      <Badge variant="secondary" className="text-xs">
                        {moodMap[latestEntry.mood].emoji}{" "}
                        {moodMap[latestEntry.mood].label}
                      </Badge>
                    ) : null}
                    {latestEntryWorkout ? (
                      <Badge variant="outline" className="text-xs flex flex-row items-center gap-2 px-2 py-1">
                        <span className="font-medium">{latestEntryWorkout.title}</span>
                        {latestEntryWorkout.workoutDate && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDate(latestEntryWorkout.workoutDate)}
                          </span>
                        )}
                      </Badge>
                    ) : latestEntry.workoutId ? (
                      <Badge variant="outline" className="text-xs">
                        {t("recoveryDiary.workoutLinked", "Verknüpftes Workout")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {t("recoveryDiary.noWorkout", "Kein Workout verknüpft")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>
                      {t("recoveryDiary.metrics.energy", "Energie")}:{" "}
                      {formatScaleValue(latestEntry.energyLevel)}
                    </span>
                    <span>
                      {t("recoveryDiary.metrics.focus", "Fokus")}:{" "}
                      {formatScaleValue(latestEntry.focusLevel)}
                    </span>
                    <span>
                      {t("recoveryDiary.metrics.sleep", "Schlafqualität")}:{" "}
                      {formatScaleValue(latestEntry.sleepQuality)}
                    </span>
                    <span>
                      {t("recoveryDiary.metrics.soreness", "Muskelkater")}:{" "}
                      {formatScaleValue(latestEntry.sorenessLevel)}
                    </span>
                    <span>
                      {t("recoveryDiary.metrics.exertion", "Belastung")}:{" "}
                      {formatScaleValue(latestEntry.perceivedExertion)}
                    </span>
                    {typeof latestEntry.metrics?.sleepDurationHours === "number" && (
                      <span>
                        {t("recoveryDiary.metrics.sleepDuration", "Schlafdauer")}:{" "}
                        {formatNumber(latestEntry.metrics.sleepDurationHours, 1)} h
                      </span>
                    )}
                    {typeof latestEntry.metrics?.hydrationLevel === "number" && (
                      <span>
                        {t("recoveryDiary.metrics.hydration", "Hydration")}:{" "}
                        {formatScaleValue(latestEntry.metrics.hydrationLevel)}
                      </span>
                    )}
                    {typeof latestEntry.metrics?.restingHeartRate === "number" && (
                      <span>
                        {t("recoveryDiary.metrics.heartRate", "Herzfrequenz")}:{" "}
                        {Math.round(latestEntry.metrics.restingHeartRate)} bpm
                      </span>
                    )}
                  </div>
                  {latestEntry.notes ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {latestEntry.notes}
                    </p>
                  ) : null}
                  {latestEntry.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {latestEntry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <WidgetFooterButton
              onClick={() => navigate("/training?tab=recovery")}
              ariaLabel={t("recoveryDiary.openRecoveryDiary", "Zum Erholungstagebuch")}
            >
              {t("recoveryDiary.openRecoveryDiary", "Zum Erholungstagebuch")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </WidgetFooterButton>
          </>
        )}
      </CardContent>
    </Card>
  );
}
