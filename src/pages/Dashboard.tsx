import { ActivityFeed } from "@/components/ActivityFeed";
import { PageTemplate } from "@/components/common/PageTemplate";
import { DashboardLeaderboardCard } from "@/components/dashboard/DashboardLeaderboardCard";
import {
  DashboardSettingsDialog,
  StatCardConfig,
} from "@/components/dashboard/DashboardSettingsDialog";
import { MonthlyGoalCard } from "@/components/dashboard/MonthlyGoalCard";
import { RecoveryJournalCard } from "@/components/dashboard/RecoveryJournalCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { WeeklyChallengeCard } from "@/components/dashboard/WeeklyChallengeCard";
import { WeeklyGoalsCard } from "@/components/dashboard/WeeklyGoalsCard";
import { WeeklyGoalsDialog } from "@/components/settings/WeeklyGoalsDialog";
import { WeeklyGoals } from "@/components/settings/WeeklyGoalsForm";
import { WeeklyPointsGoalDialog } from "@/components/settings/WeeklyPointsGoalDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_WEEKLY_POINTS_GOAL } from "@/config/events";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import type { Exercise, ExerciseListResponse } from "@/types/exercise";
import { getPrimaryDistanceUnit } from "@/utils/units";
import { BarChart, Dumbbell, Settings, TrendingUp, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface DashboardStats {
  totalPoints: number;
  periodPoints: number;
  totalWorkouts: number;
  periodWorkouts: number;
  userRank: number;
  totalUsers: number;
  period: string;
  activities: Array<{
    id: string;
    name: string;
    measurementType?: string | null;
    supportsTime?: boolean | null;
    supportsDistance?: boolean | null;
    totalPoints: number;
    periodPoints: number;
    totalReps: number;
    periodReps: number;
    totalDuration: number;
    periodDuration: number;
    totalDistance: number;
    periodDistance: number;
  }>;
}

interface RecentWorkout {
  id: string;
  workoutDate?: string;
  startTime?: string;
  createdAt: string;
  notes?: string;
  activities: Array<{
    activityType: string;
    amount: number;
    points: number;
  }>;
}

const DEFAULT_CARDS: StatCardConfig[] = [
  { id: "1", type: "points", period: "week", color: "orange" },
  { id: "2", type: "rank", period: "week", color: "purple" },
  { id: "3", type: "activity", period: "week", activityMode: "auto", color: "blue", activityMetric: "reps" },
  { id: "4", type: "workouts", period: "week", color: "green" },
];

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);
  const [pointsGoalDialogOpen, setPointsGoalDialogOpen] = useState(false);
  const [cardConfigs, setCardConfigs] = useState<StatCardConfig[]>(() => {
    const saved = localStorage.getItem("dashboard-card-configs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_CARDS;
      }
    }
    return DEFAULT_CARDS;
  });

  const [statsByPeriod, setStatsByPeriod] = useState<
    Record<string, DashboardStats>
  >({});

  const [stats, setStats] = useState<DashboardStats>({
    totalPoints: 0,
    periodPoints: 0,
    totalWorkouts: 0,
    periodWorkouts: 0,
    userRank: 1,
    totalUsers: 1,
    period: "week",
    activities: [],
  });

  const defaultGoals: WeeklyGoals = useMemo(
    () => ({
      points: { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
      exercises: [],
    }),
    []
  );

  const [goals, setGoals] = useState<WeeklyGoals>(defaultGoals);

  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [recentWorkoutsError, setRecentWorkoutsError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseNameMap, setExerciseNameMap] = useState<Record<string, string>>(
    {}
  );
  const [exerciseOptions, setExerciseOptions] = useState<Exercise[]>([]);
  const [exerciseFacets, setExerciseFacets] = useState({
    categories: [],
    muscleGroups: [],
    equipment: [],
  });

  const loadStats = async (
    token: string,
    period: string = "week"
  ): Promise<DashboardStats | null> => {
    try {
      const response = await fetch(`${API_URL}/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error loading stats for period ${period}:`, error);
      return null;
    }
  };

  const loadStatsForCards = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const uniquePeriods = Array.from(new Set(cardConfigs.map((c) => c.period)));
    const statsPromises = uniquePeriods.map((period) =>
      loadStats(token, period)
    );

    try {
      const results = await Promise.all(statsPromises);
      const statsMap: Record<string, DashboardStats> = {};
      results.forEach((stats, index) => {
        if (stats) {
          statsMap[uniquePeriods[index]] = stats;
        }
      });
      setStatsByPeriod(statsMap);

      // Set default stats (week)
      if (statsMap["week"]) {
        setStats(statsMap["week"]);
      }
    } catch (error) {
      console.error("Error loading stats for cards:", error);
    }
  }, [cardConfigs]);

  useEffect(() => {
    if (exerciseOptions.length === 0) return;
    setCardConfigs((prev) => {
      const next = prev.map((config) => {
        if (config.type !== "activity") return config;
        const activityId = config.activityId;
        const activityMode =
          config.activityMode || (activityId ? "custom" : "auto");
        return {
          ...config,
          activityId,
          activityMode,
          activityMetric: config.activityMetric || "reps",
        };
      });

      const changed = JSON.stringify(prev) !== JSON.stringify(next);
      if (changed) {
        localStorage.setItem("dashboard-card-configs", JSON.stringify(next));
      }
      return changed ? next : prev;
    });
  }, [exerciseOptions]);

  const loadGoals = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = (await response.json()) || {};
        setGoals({
          points: {
            target: data.points?.target ?? defaultGoals.points.target,
            current: data.points?.current ?? 0,
          },
          exercises: Array.isArray(data.exercises) ? data.exercises : [],
        });
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  }, [defaultGoals.points.target]);

  const loadExerciseNames = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${API_URL}/exercises?limit=500&includeMeta=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data: ExerciseListResponse = await response.json();
      const map: Record<string, string> = {};
      (data.exercises || []).forEach((ex: { id: string; name: string }) => {
        map[ex.id] = ex.name;
      });
      setExerciseNameMap(map);
      setExerciseOptions(Array.isArray(data.exercises) ? data.exercises : []);
      setExerciseFacets({
        categories: data.facets?.categories || [],
        muscleGroups: data.facets?.muscleGroups || [],
        equipment: data.facets?.equipment || [],
      });
    } catch (error) {
      console.error("Error loading exercise names:", error);
    }
  }, []);

  const loadRecentWorkouts = useCallback(
    async (token: string) => {
      try {
        setRecentWorkoutsError(null);

        if (!token) {
          setRecentWorkouts([]);
          setRecentWorkoutsError(t("dashboard.pleaseLoginWorkouts"));
          return;
        }

        const response = await fetch(`${API_URL}/recent-workouts?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const workouts = Array.isArray(data) ? data : data?.workouts;

          if (Array.isArray(workouts)) {
            setRecentWorkouts(
              workouts.map((workout) => ({
                ...workout,
                activities: Array.isArray(workout.activities)
                  ? workout.activities.map((activity) => ({
                    activityType: activity.activityType,
                    amount: activity.amount ?? activity.quantity ?? 0,
                    points: activity.points ?? 0,
                  }))
                  : [],
              }))
            );
          } else {
            setRecentWorkouts([]);
            setRecentWorkoutsError(t("dashboard.unexpectedFormat"));
          }
        } else {
          setRecentWorkouts([]);
          setRecentWorkoutsError(t("dashboard.workoutsNotLoaded"));
          toast({
            title: t("dashboard.error"),
            description: t("dashboard.errorLoadingWorkouts"),
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading recent workouts:", error);
        setRecentWorkouts([]);
        setRecentWorkoutsError(t("dashboard.workoutsNotLoaded"));
        toast({
          title: t("dashboard.error"),
          description: t("dashboard.errorLoadingWorkouts"),
          variant: "destructive",
        });
      }
    },
    [t, toast]
  );

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await Promise.all([
        loadStatsForCards(),
        loadGoals(token),
        loadRecentWorkouts(token),
        loadExerciseNames(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: t("dashboard.error"),
        description: t("dashboard.errorLoadingData"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadStatsForCards, loadGoals, toast, t, loadRecentWorkouts, loadExerciseNames]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  useEffect(() => {
    if (user && cardConfigs.length > 0) {
      loadStatsForCards();
    }
  }, [user, cardConfigs, loadStatsForCards]);

  const formatTimeAgo = (workout: RecentWorkout) => {
    // Kombiniere workoutDate und startTime, wenn verfügbar
    let date: Date;

    if (workout.workoutDate && workout.startTime) {
      // Kombiniere workoutDate und startTime
      const datePart = new Date(workout.workoutDate);
      const [hours, minutes] = workout.startTime.split(":").map(Number);
      datePart.setHours(hours, minutes, 0, 0);
      date = datePart;
    } else if (workout.workoutDate) {
      // Nur workoutDate (ohne Zeit)
      date = new Date(workout.workoutDate);
    } else if (workout.createdAt) {
      // Fallback zu createdAt
      date = new Date(workout.createdAt);
    } else {
      return t("dashboard.timeAgo.unknown", "Unbekannt");
    }

    if (isNaN(date.getTime())) {
      return t("dashboard.timeAgo.unknown", "Unbekannt");
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return t("dashboard.timeAgo.minutes", { count: diffMins });
    } else if (diffHours < 24) {
      return t("dashboard.timeAgo.hours", { count: diffHours });
    } else if (diffDays === 1) {
      return t("dashboard.timeAgo.yesterday");
    } else {
      return t("dashboard.timeAgo.days", { count: diffDays });
    }
  };

  const handleSaveCardConfigs = (configs: StatCardConfig[]) => {
    setCardConfigs(configs);
    localStorage.setItem("dashboard-card-configs", JSON.stringify(configs));
    loadStatsForCards();
    toast({
      title: t("dashboard.settings.saved", "Einstellungen gespeichert"),
      description: t(
        "dashboard.settings.savedDescription",
        "Die Dashboard-Kacheln wurden aktualisiert."
      ),
    });
  };

  const handleSaveGoals = async (newGoals: WeeklyGoals) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("dashboard.notAuthenticated"));
      }

      const response = await fetch(`${API_URL}/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGoals),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: t("dashboard.saveError") }));
        throw new Error(errorData.error || t("dashboard.saveGoalsError"));
      }

      const updatedGoals = (await response.json()) || {};
      setGoals({
        points: {
          target:
            updatedGoals.points?.target ??
            newGoals.points?.target ??
            defaultGoals.points.target,
          current: updatedGoals.points?.current ?? newGoals.points?.current ?? 0,
        },
        exercises: Array.isArray(updatedGoals.exercises)
          ? updatedGoals.exercises
          : newGoals.exercises,
      });
      toast({
        title: t("weeklyGoals.saved", "Wochenziele gespeichert"),
        description: t(
          "weeklyGoals.savedDescription",
          "Deine Wochenziele wurden erfolgreich aktualisiert."
        ),
      });
    } catch (error) {
      toast({
        title: t("common.error", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t(
              "weeklyGoals.saveError",
              "Fehler beim Speichern der Wochenziele"
            ),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSavePointsGoal = async (points: number) => {
    await handleSaveGoals({
      ...goals,
      points: { ...goals.points, target: points },
    });
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "week":
        return t("dashboard.thisWeek", "diese Woche");
      case "month":
        return t("dashboard.thisMonth", "diesen Monat");
      case "quarter":
        return t("dashboard.thisQuarter", "dieses Quartal");
      case "year":
        return t("dashboard.thisYear", "dieses Jahr");
      default:
        return period;
    }
  };

  const resolveMetric = (
    activity: DashboardStats["activities"][number] | undefined,
    metric: StatCardConfig["activityMetric"] | undefined
  ) => {
    const supportsDistance =
      activity?.supportsDistance || activity?.measurementType === "distance";
    const supportsTime =
      activity?.supportsTime || activity?.measurementType === "time";
    const supportsReps =
      activity?.measurementType === "reps" ||
      (!supportsDistance && !supportsTime) ||
      (activity?.totalReps ?? 0) > 0 ||
      (activity?.periodReps ?? 0) > 0;
    if (metric === "distance" && supportsDistance) return "distance";
    if (metric === "time" && supportsTime) return "time";
    if (metric === "reps" && supportsReps) return "reps";
    if (supportsDistance) return "distance";
    if (supportsReps) return "reps";
    if (supportsTime) return "time";
    return "reps";
  };

  const autoAssignmentMap = useMemo(() => {
    const assignments = new Map<string, { activity?: DashboardStats["activities"][number]; rank?: number }>();
    const periods = Array.from(new Set(cardConfigs.map((card) => card.period)));

    periods.forEach((period) => {
      const periodStats = statsByPeriod[period] || stats;
      const cardsForPeriod = cardConfigs.filter(
        (card) => card.type === "activity" && card.period === period
      );
      const customIds = new Set(
        cardsForPeriod
          .filter((card) => (card.activityMode ?? (card.activityId ? "custom" : "auto")) === "custom")
          .map((card) => card.activityId)
          .filter(Boolean) as string[]
      );

      const available = (periodStats.activities || []).filter(
        (activity) => !customIds.has(activity.id)
      );
      const used = new Set<string>();
      let rank = 0;

      cardsForPeriod.forEach((card) => {
        const mode = card.activityMode ?? (card.activityId ? "custom" : "auto");
        if (mode !== "auto") return;

        const metric = card.activityMetric || "reps";
        const match =
          available.find(
            (activity) =>
              !used.has(activity.id) && resolveMetric(activity, metric) === metric
          ) ||
          available.find((activity) => !used.has(activity.id));

        if (match) {
          used.add(match.id);
          rank += 1;
          assignments.set(card.id, { activity: match, rank });
        } else {
          assignments.set(card.id, { activity: undefined });
        }
      });
    });

    return assignments;
  }, [cardConfigs, statsByPeriod, stats]);

  const renderStatCard = (config: StatCardConfig) => {
    const periodStats = statsByPeriod[config.period] || stats;
    let title = "";
    let value = "";
    let trend = "";
    let meta = "";
    let Icon = Trophy;

    switch (config.type) {
      case "points":
        title = t("dashboard.totalPoints", "Gesamtpunkte");
        value = periodStats.totalPoints.toLocaleString();
        trend = `+${periodStats.periodPoints} ${getPeriodLabel(config.period)}`;
        meta = getPeriodLabel(config.period);
        Icon = Trophy;
        break;
      case "activity": {
        const distanceUnit = getPrimaryDistanceUnit(
          user?.preferences?.units?.distance
        );
        const distanceLabel =
          distanceUnit === "miles"
            ? t("training.form.units.milesShort", "mi")
            : t("training.form.units.kilometersShort", "km");

        const mode = config.activityMode ?? (config.activityId ? "custom" : "auto");
        const autoAssignment = autoAssignmentMap.get(config.id);
        const autoRank = autoAssignment?.rank;
        const selectedExercise = config.activityId
          ? exerciseOptions.find((item) => item.id === config.activityId)
          : undefined;

        const activity =
          mode === "custom" && config.activityId
            ? periodStats.activities.find((item) => item.id === config.activityId) ??
            (selectedExercise
              ? {
                id: selectedExercise.id,
                name: selectedExercise.name,
                measurementType: selectedExercise.measurementType,
                supportsTime: selectedExercise.supportsTime,
                supportsDistance: selectedExercise.supportsDistance,
                totalPoints: 0,
                periodPoints: 0,
                totalReps: 0,
                periodReps: 0,
                totalDuration: 0,
                periodDuration: 0,
                totalDistance: 0,
                periodDistance: 0,
              }
              : undefined)
            : autoAssignment?.activity;

        const periodLabel = getPeriodLabel(config.period);

        if (!activity) {
          const manualTitle =
            selectedExercise?.name ||
            t("dashboard.manualExercise", "Manuelle Übung");
          const autoTitle = t("dashboard.topExercise", "Top-Übung");
          title = mode === "custom" ? manualTitle : autoTitle;
          value = "0";
          trend = `+0 ${periodLabel}`;
          meta =
            mode === "custom"
              ? `${t(
                "dashboard.cardMeta.manualSelected",
                "Manuell ausgewählt"
              )} · ${periodLabel}`
              : `${t(
                "dashboard.cardMeta.autoRank",
                "Top‑Übung automatisch #{{rank}}",
                { rank: autoRank ?? 1 }
              )} · ${periodLabel}`;
          Icon = Dumbbell;
          break;
        }

        const resolvedMetric = resolveMetric(activity, config.activityMetric);
        const totalValue =
          resolvedMetric === "time"
            ? (activity.totalDuration || 0) / 60
            : resolvedMetric === "distance"
              ? distanceUnit === "miles"
                ? (activity.totalDistance || 0) / 1.60934
                : activity.totalDistance || 0
              : activity.totalReps || 0;
        const periodValue =
          resolvedMetric === "time"
            ? (activity.periodDuration || 0) / 60
            : resolvedMetric === "distance"
              ? distanceUnit === "miles"
                ? (activity.periodDistance || 0) / 1.60934
                : activity.periodDistance || 0
              : activity.periodReps || 0;

        const manualTitle =
          selectedExercise?.name ||
          activity.name ||
          t("dashboard.manualExercise", "Manuelle Übung");
        const autoTitle = activity.name || t("dashboard.topExercise", "Top-Übung");
        title = mode === "custom" ? manualTitle : autoTitle;
        value =
          resolvedMetric === "distance"
            ? `${Math.round(totalValue * 10) / 10} ${distanceLabel}`
            : resolvedMetric === "time"
              ? `${Math.round(totalValue)} ${t("training.form.units.minutesShort", "Min")}`
              : `${Math.round(totalValue)}`;
        trend =
          resolvedMetric === "distance"
            ? `+${Math.round(periodValue * 10) / 10} ${distanceLabel} ${getPeriodLabel(
              config.period
            )}`
            : resolvedMetric === "time"
              ? `+${Math.round(periodValue)} ${t(
                "training.form.units.minutesShort",
                "Min"
              )} ${getPeriodLabel(config.period)}`
              : `+${Math.round(periodValue)} ${getPeriodLabel(config.period)}`;
        meta =
          mode === "custom"
            ? `${t(
              "dashboard.cardMeta.manualSelected",
              "Manuell ausgewählt"
            )} · ${periodLabel}`
            : `${t(
              "dashboard.cardMeta.autoRank",
              "Top‑Übung automatisch #{{rank}}",
              { rank: autoRank ?? 1 }
            )} · ${periodLabel}`;
        Icon = Dumbbell;
        break;
      }
      case "rank":
        title = t("dashboard.rank", "Rang");
        value = `#${periodStats.userRank}`;
        trend = t("dashboard.ofAthletes", { count: periodStats.totalUsers });
        meta = getPeriodLabel(config.period);
        Icon = BarChart;
        break;
      case "workouts":
        title = t("dashboard.workouts", "Anzahl Trainings");
        value = periodStats.totalWorkouts.toString();
        trend = `+${periodStats.periodWorkouts} ${getPeriodLabel(config.period)}`;
        meta = getPeriodLabel(config.period);
        Icon = TrendingUp;
        break;
    }

    return (
      <StatCard
        key={config.id}
        title={title}
        value={value}
        icon={Icon}
        trend={trend}
        meta={meta}
        color={config.color}
      />
    );
  };

  if (isLoading) {
    return (
      <PageTemplate
        title={t("dashboard.title")}
        subtitle={t("dashboard.loadingProgress")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={t("dashboard.title")}
      subtitle={t("dashboard.subtitle")}
    >
      {recentWorkoutsError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {recentWorkoutsError}
        </div>
      )}

      {/* Stats Grid - Mobile optimiert */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0"
          onClick={() => setSettingsOpen(true)}
          aria-label={t(
            "dashboard.settings.title",
            "Dashboard-Kacheln konfigurieren"
          )}
          title={t(
            "dashboard.settings.title",
            "Dashboard-Kacheln konfigurieren"
          )}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="grid grid-cols-1 2xs:grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
          {cardConfigs.map((config) => renderStatCard(config))}
        </div>
      </div>

      <DashboardSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        cards={cardConfigs}
        onSave={handleSaveCardConfigs}
        onReset={() => handleSaveCardConfigs(DEFAULT_CARDS)}
        exercises={exerciseOptions}
        facets={exerciseFacets}
      />

      <WeeklyGoalsDialog
        open={goalsDialogOpen}
        onOpenChange={setGoalsDialogOpen}
        goals={goals}
        onSave={handleSaveGoals}
        showPoints={false}
      />

      <WeeklyPointsGoalDialog
        open={pointsGoalDialogOpen}
        onOpenChange={setPointsGoalDialogOpen}
        currentGoal={goals.points.target}
        defaultGoal={DEFAULT_WEEKLY_POINTS_GOAL}
        onSave={handleSavePointsGoal}
      />

      {/* Goals and Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8 auto-rows-auto">
        {/* Wochenziele links, 1/3 Breite, doppelte Höhe */}
        <WeeklyGoalsCard
          className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2"
          goals={goals}
          exerciseNameMap={exerciseNameMap}
          onOpenSettings={() => setGoalsDialogOpen(true)}
        />

        {/* Wochen-Challenge oben rechts, 2/3 Breite */}
        <WeeklyChallengeCard
          className="col-span-1 md:col-span-1 lg:col-span-2"
          userPointsGoal={goals.points.target}
          onOpenSettings={() => setPointsGoalDialogOpen(true)}
        />

        {/* Monthly Goal unterhalb der Weekly Challenge, ebenfalls 2/3 Breite */}
        <MonthlyGoalCard className="col-span-1 md:col-span-2 lg:col-span-2" />

        {/* Aktivitäten von dir und Freunden: links, 2/3 Breite, doppelte Höhe */}
        <ActivityFeed className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 order-last lg:order-none" />

        {/* Scoreboard rechts oben, 1/3 Breite */}
        <DashboardLeaderboardCard className="col-span-1 md:col-span-1 lg:col-span-1" />

        {/* Erholungstagebuch rechts unten, 1/3 Breite */}
        <RecoveryJournalCard className="col-span-1 md:col-span-1 lg:col-span-1" />
      </div>
    </PageTemplate>
  );
}
