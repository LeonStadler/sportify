import { PageTemplate } from "@/components/common/PageTemplate";
import { TimeRangeFilter } from "@/components/filters/TimeRangeFilter";
import { GlobalRankingWarningDialog } from "@/components/ranking/GlobalRankingWarningDialog";
import { ScoreboardTable } from "@/components/ranking/ScoreboardTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ExercisePicker } from "@/components/exercises/ExercisePicker";
import { getNormalizedRange, getRangeForPeriod } from "@/utils/dateRanges";
import { ChevronDown, Eye, EyeOff, Globe, Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { API_URL } from "@/lib/api";
import type { Exercise, ExerciseListResponse } from "@/types/exercise";

type MetricType = "reps" | "time" | "distance";

const normalizeMetricType = (value?: string | null): MetricType | undefined => {
  if (value === "reps" || value === "time" || value === "distance") return value;
  return undefined;
};

type TopExerciseEntry = {
  id: string;
  name: string;
  measurementType?: MetricType;
  supportsTime?: boolean;
  supportsDistance?: boolean;
};

type ScoreboardTabItem = {
  id: string;
  name: string;
  icon?: string;
  isCustomize?: boolean;
  isPinned?: boolean;
  activityId?: string;
  metaLabel?: string;
  metaKind?: "auto" | "manual";
};

const resolveDefaultExercises = (items: Exercise[]) => {
  const defaults = ["pullups", "pushups", "situps"];
  const resolved: TopExerciseEntry[] = [];
  defaults.forEach((id) => {
    const match = items.find((exercise) => exercise.id === id);
    if (match && !resolved.some((item) => item.id === match.id)) {
      resolved.push({
        id: match.id,
        name: match.name,
        measurementType: normalizeMetricType(match.measurementType),
        supportsTime: match.supportsTime ?? undefined,
        supportsDistance: match.supportsDistance ?? undefined,
      });
    }
  });
  if (resolved.length === 0 && items.length > 0) {
    return items.slice(0, 3).map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      measurementType: normalizeMetricType(exercise.measurementType),
      supportsTime: exercise.supportsTime ?? undefined,
      supportsDistance: exercise.supportsDistance ?? undefined,
    }));
  }
  return resolved;
};

export function Scoreboard() {
  const { user, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [scope, setScope] = useState("friends");
  const [period, setPeriod] = useState("month");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [offset, setOffset] = useState(0);
  const [showInGlobalRankings, setShowInGlobalRankings] = useState(
    user?.showInGlobalRankings ?? true
  );
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [exerciseOptions, setExerciseOptions] = useState<Exercise[]>([]);
  const [exerciseFacets, setExerciseFacets] = useState<ExerciseListResponse["facets"]>({
    categories: [],
    muscleGroups: [],
    equipment: [],
  });
  const [topExercisesPersonal, setTopExercisesPersonal] = useState<TopExerciseEntry[]>([]);
  const [topExercisesFriends, setTopExercisesFriends] = useState<TopExerciseEntry[]>([]);
  const [topExercisesGlobal, setTopExercisesGlobal] = useState<TopExerciseEntry[]>([]);
  const [pinnedExerciseIds, setPinnedExerciseIds] = useState<string[]>([]);
  const [pendingExerciseId, setPendingExerciseId] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      setShowInGlobalRankings(user.showInGlobalRankings ?? true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const nextPinned =
      user.preferences?.exercises?.scoreboard?.pinnedExerciseIds ?? [];
    setPinnedExerciseIds(nextPinned);
  }, [user]);

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
        console.error("Failed to load exercises for scoreboard", err);
      }
    };
    loadExercises();
  }, []);

  const handleGlobalRankingToggle = (checked: boolean) => {
    if (!checked) {
      setShowWarningDialog(true);
    } else {
      performGlobalRankingUpdate(true);
    }
  };

  const performGlobalRankingUpdate = async (checked: boolean) => {
    setShowInGlobalRankings(checked);
    try {
      await updateProfile(
        {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          nickname: user?.nickname || "",
          displayPreference: user?.displayPreference || "firstName",
          showInGlobalRankings: checked,
        },
        true
      );
      toast({
        title: t("settings.saved", "Gespeichert"),
        description: t(
          "settings.settingSaved",
          "{{setting}} wurde aktualisiert.",
          { setting: "Sichtbarkeit in globaler Rangliste" }
        ),
      });
    } catch (error) {
      setShowInGlobalRankings(!checked); // Revert on error
      toast({
        title: t("common.error", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("settings.saveError", "Fehler beim Speichern"),
        variant: "destructive",
      });
    }
  };

  const customTabId = "custom-exercises";

  const activityTypes = useMemo<ScoreboardTabItem[]>(() => {
    const personalTop = topExercisesPersonal[0];
    const friendsTop = topExercisesFriends[0];
    const globalTop = topExercisesGlobal[0];

    const pinnedExercises: ScoreboardTabItem[] = pinnedExerciseIds
      .map((id) => {
        const exercise =
          exerciseOptions.find((item) => item.id === id) ||
          topExercisesPersonal.find((item) => item.id === id) ||
          topExercisesFriends.find((item) => item.id === id) ||
          topExercisesGlobal.find((item) => item.id === id);
        return {
          id,
          name: exercise?.name ?? id,
          isPinned: true,
          activityId: exercise?.id ?? id,
          metaLabel: t("scoreboard.pinnedExercise", "Manuell gewählt"),
          metaKind: "manual",
        };
      });

    const autoTabs: ScoreboardTabItem[] = [];

    if (personalTop) {
      autoTabs.push({
        id: "auto-personal",
        name: personalTop.name,
        activityId: personalTop.id,
        metaLabel: t("scoreboard.autoPersonal", "Top bei dir"),
        metaKind: "auto",
      });
    }
    if (friendsTop) {
      autoTabs.push({
        id: "auto-friends",
        name: friendsTop.name,
        activityId: friendsTop.id,
        metaLabel: t("scoreboard.autoFriends", "Top bei Freunden"),
        metaKind: "auto",
      });
    }
    if (globalTop) {
      autoTabs.push({
        id: "auto-global",
        name: globalTop.name,
        activityId: globalTop.id,
        metaLabel: t("scoreboard.autoGlobal", "Top global"),
        metaKind: "auto",
      });
    }

    return [
      { id: "all", name: t("scoreboard.activityTypes.all"), icon: "" },
      ...autoTabs,
      ...pinnedExercises,
    ];
  }, [
    exerciseOptions,
    pinnedExerciseIds,
    topExercisesPersonal,
    topExercisesFriends,
    topExercisesGlobal,
    t,
  ]);

  const tabItems = useMemo<ScoreboardTabItem[]>(
    () => [
      ...activityTypes,
      {
        id: customTabId,
        name: t("scoreboard.customExercisesTitle", "Eigene Übungen"),
        icon: "",
        isCustomize: true,
      },
    ],
    [activityTypes, t]
  );

  useEffect(() => {
    if (!tabItems.find((item) => item.id === activeTab)) {
      setActiveTab("all");
    }
  }, [tabItems, activeTab]);

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

  const resolvedRangeForRequest = resolvedRange?.from && resolvedRange?.to
    ? {
        start: resolvedRange.from,
        end: resolvedRange.to,
      }
    : null;

  const sanitizeTopExercises = (
    list: Array<{
      id?: string;
      name?: string;
      measurementType?: string | null;
      supportsTime?: boolean | null;
      supportsDistance?: boolean | null;
    }>
  ): TopExerciseEntry[] =>
    list
      .filter((item): item is Required<Pick<TopExerciseEntry, "id" | "name">> & {
        measurementType?: string | null;
        supportsTime?: boolean | null;
        supportsDistance?: boolean | null;
      } => Boolean(item?.id && item?.name))
      .map((item) => ({
        id: item.id,
        name: item.name,
        measurementType: normalizeMetricType(item.measurementType),
        supportsTime: item.supportsTime ?? undefined,
        supportsDistance: item.supportsDistance ?? undefined,
      }));

  useEffect(() => {
    const loadTopExercises = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (period === "custom" && (!resolvedRangeForRequest?.start || !resolvedRangeForRequest?.end)) {
        setTopExercisesPersonal([]);
        setTopExercisesFriends([]);
        setTopExercisesGlobal([]);
        return;
      }

      const buildParams = (scopeValue: string) => {
        const params = new URLSearchParams({
          period,
          scope: scopeValue,
          limit: "5",
        });
        if (resolvedRangeForRequest?.start && resolvedRangeForRequest?.end) {
          const toParam = (date: Date) => date.toISOString().slice(0, 10);
          params.set("start", toParam(resolvedRangeForRequest.start));
          params.set("end", toParam(resolvedRangeForRequest.end));
        }
        return params;
      };

      const pickUnique = (
        list: TopExerciseEntry[],
        used: Set<string>,
        fallback: TopExerciseEntry[]
      ) => {
        const next = list.find((item) => item && !used.has(item.id));
        if (next) {
          used.add(next.id);
          return [next];
        }
        const fallbackItem = fallback.find((item) => item && !used.has(item.id));
        if (!fallbackItem) return [];
        used.add(fallbackItem.id);
        return [fallbackItem];
      };

      try {
        const [personalRes, friendsRes, globalRes] = await Promise.all([
          fetch(
            `${API_URL}/scoreboard/top-exercises?${buildParams("personal").toString()}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `${API_URL}/scoreboard/top-exercises?${buildParams("friends").toString()}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `${API_URL}/scoreboard/top-exercises?${buildParams("global").toString()}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const personalList = personalRes.ok
          ? sanitizeTopExercises((await personalRes.json()).exercises || [])
          : [];
        const friendsList = friendsRes.ok
          ? sanitizeTopExercises((await friendsRes.json()).exercises || [])
          : [];
        const globalList = globalRes.ok
          ? sanitizeTopExercises((await globalRes.json()).exercises || [])
          : [];

        const usedIds = new Set<string>();
        const fallback = resolveDefaultExercises(exerciseOptions);
        setTopExercisesPersonal(pickUnique(personalList, usedIds, fallback));
        setTopExercisesFriends(pickUnique(friendsList, usedIds, fallback));
        setTopExercisesGlobal(pickUnique(globalList, usedIds, fallback));
      } catch (error) {
        console.error("Failed to load top exercises", error);
      }
    };
    loadTopExercises();
  }, [exerciseOptions, period, resolvedRangeForRequest?.end, resolvedRangeForRequest?.start]);

  const handlePinnedExerciseChange = async (nextPinned: string[]) => {
    if (!user) return;
    setPinnedExerciseIds(nextPinned);
    try {
      const nextPreferences = {
        ...user.preferences,
        exercises: {
          ...user.preferences?.exercises,
          scoreboard: {
            ...user.preferences?.exercises?.scoreboard,
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
      toast({
        title: t("settings.saved", "Gespeichert"),
        description: t(
          "scoreboard.pinnedExercisesSaved",
          "Deine Übungs-Auswahl wurde gespeichert."
        ),
      });
    } catch (error) {
      console.error("Failed to save pinned exercises", error);
      toast({
        variant: "destructive",
        title: t("common.error", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("settings.saveError", "Fehler beim Speichern"),
      });
    }
  };

  const handleAddPinnedExercise = (exerciseId: string) => {
    if (!exerciseId) return;
    if (pinnedExerciseIds.includes(exerciseId)) {
      setPendingExerciseId(undefined);
      return;
    }
    if (pinnedExerciseIds.length >= 3) {
      toast({
        title: t("scoreboard.pinnedLimitTitle", "Maximal 3 Übungen"),
        description: t(
          "scoreboard.pinnedLimitDescription",
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
      title={t("scoreboard.title", "Rangliste")}
      subtitle={t("scoreboard.subtitle", "Vergleiche dich mit anderen")}
      headerActions={
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <TimeRangeFilter
            period={period}
            range={customRange}
            offset={offset}
            onPeriodChange={handlePeriodChange}
            onRangeChange={handleRangeChange}
            onOffsetChange={handleOffsetChange}
            t={t}
            locale={i18n.language}
            formatDate={formatDate}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[140px] justify-between">
                <div className="flex items-center gap-2">
                  {scope === "friends" ? (
                    <>
                      <Users className="h-4 w-4" />
                      <span>{t("scoreboard.scope.friends", "Freunde")}</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      <span>{t("scoreboard.scope.global", "Global")}</span>
                    </>
                  )}
                  {showInGlobalRankings && (
                    <span
                      className="h-2 w-2 rounded-full bg-emerald-500"
                      aria-label={t("scoreboard.scope.global", "Global")}
                    />
                  )}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Ansicht</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={scope} onValueChange={setScope}>
                <DropdownMenuRadioItem value="friends">
                  <Users className="mr-2 h-4 w-4" />
                  {t("scoreboard.scope.friends", "Freunde")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="global">
                  <Globe className="mr-2 h-4 w-4" />
                  {t("scoreboard.scope.global", "Global")}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Einstellungen</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showInGlobalRankings}
                onCheckedChange={handleGlobalRankingToggle}
                className="justify-between"
              >
                <div className="flex items-center gap-2">
                  {showInGlobalRankings ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>In globaler Rangliste anzeigen</span>
                </div>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <GlobalRankingWarningDialog
            open={showWarningDialog}
            onOpenChange={setShowWarningDialog}
            onConfirm={() => performGlobalRankingUpdate(false)}
          />
        </div>
      }
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex-wrap gap-2">
          {tabItems.map((activity) => (
            <TabsTrigger
              key={activity.id}
              value={activity.id}
              className={activity.isCustomize ? "h-8 px-2" : undefined}
              aria-label={
                activity.isCustomize
                  ? t("scoreboard.customExercisesTitle", "Eigene Übungen")
                  : undefined
              }
            >
              {activity.isCustomize ? (
                <Plus className="h-4 w-4" aria-hidden="true" />
              ) : (
                <>
                  {activity.icon && <span className="mr-1.5">{activity.icon}</span>}
                  <span>{activity.name}</span>
                  {activity.metaKind === "auto" && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-4 px-1.5 text-[10px] uppercase tracking-wide"
                    >
                      {t("scoreboard.autoBadge", "Auto")}
                    </Badge>
                  )}
                  {activity.metaKind === "manual" && (
                    <Badge
                      variant="outline"
                      className="ml-2 h-4 px-1.5 text-[10px] uppercase tracking-wide"
                    >
                      {t("scoreboard.manualBadge", "Manuell")}
                    </Badge>
                  )}
                </>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabItems
          .filter((item) => !item.isCustomize)
          .map((activity) => {
            const activityId = activity.activityId ?? activity.id;
            const metaLabel = activity.metaLabel;
            const metaKind = activity.metaKind;
            return (
          <TabsContent key={activity.id} value={activity.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {activity.icon && <span>{activity.icon}</span>}
                  <span>
                    {activity.name} {t("scoreboard.leaderboard")} ({activePeriodLabel})
                  </span>
                </CardTitle>
                {metaLabel && (
                  <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>
                      {t("scoreboard.exerciseSelection", "Übungsauswahl")} · {metaLabel}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span>
                      {metaKind === "auto"
                        ? t(
                            "scoreboard.autoExercisesHint",
                            "Automatisch ausgewählt nach Leistung im gewählten Zeitraum."
                          )
                        : t(
                            "scoreboard.manualExercisesHint",
                            "Manuell ausgewählte Übung."
                          )}
                    </span>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ScoreboardTable
                  activity={activityId}
                  period={effectivePeriod}
                  dateRange={resolvedRange}
                  scope={scope}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )})}

        <TabsContent value={customTabId} className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("scoreboard.customExercisesTitle", "Eigene Übungen")}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {pinnedExerciseIds.length > 0
                  ? t("scoreboard.customExercisesSelected", {
                      defaultValue: "{{count}} ausgewählt",
                      count: pinnedExerciseIds.length,
                    })
                  : t(
                      "scoreboard.customExercisesDescription",
                      "Wähle bis zu drei Übungen, die zusätzlich zu den Top‑Übungen angezeigt werden."
                    )}
              </p>
            </CardHeader>
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
                placeholder={t("scoreboard.customExercisesSelect", "Übung hinzufügen")}
              />
              {pinnedExerciseIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("scoreboard.customExercisesEmpty", "Noch keine Übungen ausgewählt.")}
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
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
