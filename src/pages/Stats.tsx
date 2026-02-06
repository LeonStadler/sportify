import { de, enUS } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ExercisePicker } from "@/components/exercises/ExercisePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { getNormalizedRange, getRangeForPeriod } from "@/utils/dateRanges";
import type { Exercise, ExerciseListResponse } from "@/types/exercise";

const normalizeMetricType = (
  value?: string | null
): ActivityMetricOption["measurementType"] =>
  value === "reps" || value === "time" || value === "distance" ? value : undefined;

export function Stats() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const locale = useMemo(() => (i18n.language === "en" ? enUS : de), [i18n.language]);
  const [period, setPeriod] = useState("week");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [offset, setOffset] = useState(0);
  const [exerciseOptions, setExerciseOptions] = useState<Exercise[]>([]);
  const [exerciseFacets, setExerciseFacets] = useState<ExerciseListResponse["facets"]>({
    categories: [],
    muscleGroups: [],
    equipment: [],
  });
  const [pendingExerciseId, setPendingExerciseId] = useState<string | undefined>();
  const [pinnedExerciseIds, setPinnedExerciseIds] = useState<string[]>([]);
  const [customExercisesOpen, setCustomExercisesOpen] = useState(false);
  const appliedDefaultPinned = useRef(false);
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
    if (!user) return;
    const nextPinned =
      user.preferences?.exercises?.stats?.pinnedExerciseIds ?? [];
    setPinnedExerciseIds(nextPinned);
  }, [user]);

  useEffect(() => {
    if (pinnedExerciseIds.length > 0) {
      setCustomExercisesOpen(true);
    }
  }, [pinnedExerciseIds.length]);

  useEffect(() => {
    const loadExercises = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(
          `${API_URL}/exercises?limit=500&includeMeta=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) return;
        const payload = (await response.json()) as ExerciseListResponse;
        setExerciseOptions(payload.exercises || []);
        setExerciseFacets(payload.facets || { categories: [], muscleGroups: [], equipment: [] });
      } catch (err) {
        console.error("Failed to load exercises for stats", err);
      }
    };
    loadExercises();
  }, []);

  const handlePinnedExerciseChange = useCallback(
    async (nextPinned: string[], options: { silent?: boolean } = {}) => {
      if (!user) return;
      setPinnedExerciseIds(nextPinned);
      try {
        const nextPreferences = {
          ...user.preferences,
          exercises: {
            ...user.preferences?.exercises,
            stats: {
              ...user.preferences?.exercises?.stats,
              pinnedExerciseIds: nextPinned,
            },
          },
        };
        await updateProfile(
          {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            nickname: user.nickname || "",
            displayPreference: user.displayPreference || "firstName",
            languagePreference: user.languagePreference || "de",
            preferences: nextPreferences,
          },
          true
        );
        if (!options.silent) {
          toast({
            title: t("settings.saved", "Gespeichert"),
            description: t(
              "stats.customExercisesSaved",
              "Deine Übungen wurden gespeichert."
            ),
          });
        }
      } catch (error) {
        console.error("Failed to update pinned exercises", error);
      }
    },
    [t, toast, updateProfile, user]
  );

  useEffect(() => {
    if (!user || appliedDefaultPinned.current) return;
    if (pinnedExerciseIds.length > 0) return;
    if (exerciseOptions.length === 0) return;
    const defaults = resolveDefaultExerciseIds(exerciseOptions);
    if (defaults.length === 0) return;
    appliedDefaultPinned.current = true;
    handlePinnedExerciseChange(defaults, { silent: true });
  }, [exerciseOptions, pinnedExerciseIds.length, user, handlePinnedExerciseChange]);

  useEffect(() => {
    if (error && error !== "missing-token") {
      toast({
        variant: "destructive",
        title: t("stats.analyticsError"),
        description: t("stats.analyticsErrorDescription"),
      });
    }
  }, [error, t, toast]);

  const activityMetrics = useMemo<ActivityMetricOption[]>(() => {
    const palette = [
      "#3b82f6",
      "#ef4444",
      "#22c55e",
      "#a855f7",
      "#f97316",
      "#0ea5e9",
      "#facc15",
      "#ec4899",
    ];
    const metricsFromData = (data?.workouts?.activityMetrics ?? []).slice(0, 5);
    const exerciseMap = new Map(exerciseOptions.map((item) => [item.id, item]));

    const merged: ActivityMetricOption[] = [];
    const seen = new Set<string>();

    metricsFromData.forEach((metric) => {
      if (!metric?.key || seen.has(metric.key)) return;
      seen.add(metric.key);
      merged.push({
        key: metric.key,
        label: metric.label,
        measurementType: normalizeMetricType(metric.measurementType),
        supportsTime: metric.supportsTime ?? undefined,
        supportsDistance: metric.supportsDistance ?? undefined,
        color: "",
      });
    });

    pinnedExerciseIds.slice(0, 3).forEach((id) => {
      if (seen.has(id)) return;
      const exercise = exerciseMap.get(id);
      merged.push({
        key: id,
        label: exercise?.name ?? id,
        measurementType: normalizeMetricType(exercise?.measurementType),
        supportsTime: exercise?.supportsTime ?? undefined,
        supportsDistance: exercise?.supportsDistance ?? undefined,
        color: "",
      });
      seen.add(id);
    });

    return merged.map((metric, index) => ({
      ...metric,
      color: palette[index % palette.length],
    }));
  }, [data?.workouts?.activityMetrics, exerciseOptions, pinnedExerciseIds]);

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
  const distanceUnit =
    user?.preferences?.units?.distance === "miles" ? "miles" : "km";

  const resolveDefaultExerciseIds = (items: Exercise[]) => {
    const defaults = ["pullups", "pushups", "situps"];
    const result: string[] = [];
    defaults.forEach((id) => {
      const match = items.find((exercise) => exercise.id === id);
      if (match && !result.includes(match.id)) {
        result.push(match.id);
      }
    });
    return result;
  };

  const handleAddPinnedExercise = (exerciseId: string) => {
    if (!exerciseId) return;
    if (pinnedExerciseIds.includes(exerciseId)) {
      setPendingExerciseId(undefined);
      return;
    }
    if (pinnedExerciseIds.length >= 3) {
      toast({
        title: t("stats.pinnedLimitTitle", "Maximal 3 Übungen"),
        description: t(
          "stats.pinnedLimitDescription",
          "Du kannst bis zu drei Übungen anheften."
        ),
        variant: "destructive",
      });
      setPendingExerciseId(undefined);
      return;
    }
    const next = [...pinnedExerciseIds, exerciseId];
    handlePinnedExerciseChange(next);
    setPendingExerciseId(undefined);
  };

  const handleRemovePinnedExercise = (exerciseId: string) => {
    const next = pinnedExerciseIds.filter((id) => id !== exerciseId);
    handlePinnedExerciseChange(next);
  };

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

  const trainingExtras = (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">
            {t("stats.customExercisesTitle", "Eigene Übungen")}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setCustomExercisesOpen((prev) => !prev)}
          >
            {customExercisesOpen
              ? t("stats.customExercisesHide", "Ausblenden")
              : t("stats.customExercisesToggle", "Übungen anpassen")}
            {customExercisesOpen ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t(
            "stats.autoExercisesHint",
            "Die Standardübungen basieren auf deiner Aktivität im gewählten Zeitraum. Du kannst zusätzliche Übungen anheften."
          )}
        </p>
      </CardHeader>
      {customExercisesOpen && (
        <CardContent className="space-y-3">
          <ExercisePicker
            value={pendingExerciseId}
            onSelect={(value) => {
              setPendingExerciseId(value);
              handleAddPinnedExercise(value);
            }}
            exercises={exerciseOptions}
            facets={exerciseFacets}
            enableFilters
            placeholder={t("stats.customExercisesSelect", "Übung hinzufügen")}
          />
          {pinnedExerciseIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("stats.customExercisesEmpty", "Noch keine Übungen ausgewählt.")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pinnedExerciseIds.map((id) => {
                const exercise = exerciseOptions.find((item) => item.id === id);
                return (
                  <Button
                    key={id}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemovePinnedExercise(id)}
                  >
                    {exercise?.name ?? id}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

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
        distanceUnit={distanceUnit}
        trainingExtras={trainingExtras}
      />
    </PageTemplate>
  );
}
