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
import { WeeklyGoalsCard, WeeklyProgress } from "@/components/dashboard/WeeklyGoalsCard";
import { WeeklyGoalsDialog } from "@/components/settings/WeeklyGoalsDialog";
import { WeeklyGoals } from "@/components/settings/WeeklyGoalsForm";
import { WeeklyPointsGoalDialog } from "@/components/settings/WeeklyPointsGoalDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_WEEKLY_POINTS_GOAL } from "@/config/events";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { BarChart, Dumbbell, Settings, TrendingUp, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface DashboardStats {
  totalPoints: number;
  periodPoints: number;
  totalWorkouts: number;
  periodWorkouts: number;
  userRank: number;
  totalUsers: number;
  period: string;
  activities: {
    pullups: { total: number; period: number };
    pushups: { total: number; period: number };
    running: { total: number; period: number };
    cycling: { total: number; period: number };
    situps: { total: number; period: number };
  };
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
  { id: "2", type: "activity", period: "week", activityType: "pullups", color: "blue" },
  { id: "3", type: "activity", period: "week", activityType: "running", color: "green" },
  { id: "4", type: "rank", period: "week", color: "purple" },
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
    activities: {
      pullups: { total: 0, period: 0 },
      pushups: { total: 0, period: 0 },
      running: { total: 0, period: 0 },
      cycling: { total: 0, period: 0 },
      situps: { total: 0, period: 0 },
    },
  });

  const defaultGoals: WeeklyGoals = {
    pullups: { target: 100, current: 0 },
    pushups: { target: 400, current: 0 },
    situps: { target: 200, current: 0 },
    running: { target: 25, current: 0 },
    cycling: { target: 100, current: 0 },
    points: { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
  };

  const [goals, setGoals] = useState<WeeklyGoals>(defaultGoals);

  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [recentWorkoutsError, setRecentWorkoutsError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    pullups: 0,
    pushups: 0,
    situps: 0,
    running: 0,
    cycling: 0,
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
        const w = statsMap["week"].activities;
        setWeeklyProgress({
          pullups: w.pullups?.period ?? 0,
          pushups: w.pushups?.period ?? 0,
          situps: w.situps?.period ?? 0,
          running: w.running?.period ?? 0,
          cycling: w.cycling?.period ?? 0,
        });
      } else {
        // fallback auf aktuelle stats falls week nicht geladen
        const w = stats.activities;
        setWeeklyProgress({
          pullups: w.pullups?.period ?? 0,
          pushups: w.pushups?.period ?? 0,
          situps: w.situps?.period ?? 0,
          running: w.running?.period ?? 0,
          cycling: w.cycling?.period ?? 0,
        });
      }
    } catch (error) {
      console.error("Error loading stats for cards:", error);
    }
  }, [cardConfigs]);

  const loadGoals = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = (await response.json()) || {};
        setGoals((prev) => ({
          pullups: {
            target: data.pullups?.target ?? prev.pullups?.target ?? defaultGoals.pullups.target,
            current: data.pullups?.current ?? prev.pullups?.current ?? 0,
          },
          pushups: {
            target: data.pushups?.target ?? prev.pushups?.target ?? defaultGoals.pushups.target,
            current: data.pushups?.current ?? prev.pushups?.current ?? 0,
          },
          situps: {
            target: data.situps?.target ?? prev.situps?.target ?? defaultGoals.situps.target,
            current: data.situps?.current ?? prev.situps?.current ?? 0,
          },
          running: {
            target: data.running?.target ?? prev.running?.target ?? defaultGoals.running.target,
            current: data.running?.current ?? prev.running?.current ?? 0,
          },
          cycling: {
            target: data.cycling?.target ?? prev.cycling?.target ?? defaultGoals.cycling.target,
            current: data.cycling?.current ?? prev.cycling?.current ?? 0,
          },
          points: {
            target: data.points?.target ?? prev.points?.target ?? defaultGoals.points.target,
            current: data.points?.current ?? prev.points?.current ?? 0,
          },
        }));
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

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
  }, [loadStatsForCards, toast, t, loadRecentWorkouts]);

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

  const formatActivityName = (activityType: string) => {
    const activityKey = activityType.toLowerCase();
    const translationKey = `dashboard.activityTypes.${activityKey}`;
    const translation = t(translationKey);
    // Fallback to original if translation key doesn't exist
    return translation !== translationKey ? translation : activityType;
  };

  const formatActivityAmount = (activityType: string, amount: number) => {
    switch (activityType) {
      case "pullup":
      case "pushup":
        return `${amount}x`;
      case "running":
      case "cycling":
        return `${amount} km`;
      default:
        return `${amount}`;
    }
  };

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

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case "pullup":
        return "bg-orange-50 border-orange-200";
      case "pushup":
        return "bg-blue-50 border-blue-200";
      case "running":
        return "bg-green-50 border-green-200";
      case "cycling":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getActivityDotColor = (activityType: string) => {
    switch (activityType) {
      case "pullup":
        return "bg-orange-500";
      case "pushup":
        return "bg-blue-500";
      case "running":
        return "bg-green-500";
      case "cycling":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
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
      setGoals((prev) => ({
        pullups: {
          target: updatedGoals.pullups?.target ?? newGoals.pullups?.target ?? defaultGoals.pullups.target,
          current: updatedGoals.pullups?.current ?? newGoals.pullups?.current ?? prev.pullups?.current ?? 0,
        },
        pushups: {
          target: updatedGoals.pushups?.target ?? newGoals.pushups?.target ?? defaultGoals.pushups.target,
          current: updatedGoals.pushups?.current ?? newGoals.pushups?.current ?? prev.pushups?.current ?? 0,
        },
        situps: {
          target: updatedGoals.situps?.target ?? newGoals.situps?.target ?? defaultGoals.situps.target,
          current: updatedGoals.situps?.current ?? newGoals.situps?.current ?? prev.situps?.current ?? 0,
        },
        running: {
          target: updatedGoals.running?.target ?? newGoals.running?.target ?? defaultGoals.running.target,
          current: updatedGoals.running?.current ?? newGoals.running?.current ?? prev.running?.current ?? 0,
        },
        cycling: {
          target: updatedGoals.cycling?.target ?? newGoals.cycling?.target ?? defaultGoals.cycling.target,
          current: updatedGoals.cycling?.current ?? newGoals.cycling?.current ?? prev.cycling?.current ?? 0,
        },
        points: {
          target: updatedGoals.points?.target ?? newGoals.points?.target ?? defaultGoals.points.target,
          current: updatedGoals.points?.current ?? newGoals.points?.current ?? prev.points?.current ?? 0,
        },
      }));
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

  const renderStatCard = (config: StatCardConfig) => {
    const periodStats = statsByPeriod[config.period] || stats;
    let title = "";
    let value = "";
    let trend = "";
    let Icon = Trophy;

    switch (config.type) {
      case "points":
        title = t("dashboard.totalPoints", "Gesamtpunkte");
        value = periodStats.totalPoints.toLocaleString();
        trend = `+${periodStats.periodPoints} ${getPeriodLabel(config.period)}`;
        Icon = Trophy;
        break;
      case "activity": {
        if (!config.activityType) return null;
        const activity = periodStats.activities[config.activityType];
        title = t(`dashboard.${config.activityType}`, config.activityType);
        if (
          config.activityType === "running" ||
          config.activityType === "cycling"
        ) {
          value = `${activity?.total || 0} km`;
          trend = `+${activity?.period || 0} km ${getPeriodLabel(config.period)}`;
        } else {
          value = (activity?.total || 0).toString();
          trend = `+${activity?.period || 0} ${getPeriodLabel(config.period)}`;
        }
        Icon = Dumbbell;
        break;
      }
      case "rank":
        title = t("dashboard.rank", "Rang");
        value = `#${periodStats.userRank}`;
        trend = t("dashboard.ofAthletes", { count: periodStats.totalUsers });
        Icon = BarChart;
        break;
      case "workouts":
        title = t("dashboard.workouts", "Anzahl Trainings");
        value = periodStats.totalWorkouts.toString();
        trend = `+${periodStats.periodWorkouts} ${getPeriodLabel(config.period)}`;
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
        <div className="grid grid-cols-1 2xs:grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {cardConfigs.map((config) => renderStatCard(config))}
        </div>
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
      </div>

      <DashboardSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        cards={cardConfigs}
        onSave={handleSaveCardConfigs}
      />

      <WeeklyGoalsDialog
        open={goalsDialogOpen}
        onOpenChange={setGoalsDialogOpen}
        goals={goals}
        onSave={handleSaveGoals}
      />

      <WeeklyPointsGoalDialog
        open={pointsGoalDialogOpen}
        onOpenChange={setPointsGoalDialogOpen}
        currentGoal={goals.points.target}
        onSave={handleSavePointsGoal}
      />

      {/* Goals and Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8 auto-rows-auto">
        {/* Wochenziele links, 1/3 Breite, doppelte Höhe */}
        <WeeklyGoalsCard
          className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2"
          goals={goals}
          progress={weeklyProgress}
          onOpenSettings={() => setGoalsDialogOpen(true)}
        />

        {/* Wochen-Challenge oben rechts, 2/3 Breite */}
        <WeeklyChallengeCard
          className="col-span-1 md:col-span-1 lg:col-span-2"
          userPointsGoal={goals.points.target}
          onOpenSettings={() => setPointsGoalDialogOpen(true)}
        />

        {/* Monthly Goal unterhalb der Weekly Challenge, ebenfalls 2/3 Breite */}
        <MonthlyGoalCard className="col-span-1 md:col-span-1 lg:col-span-2" />

        {/* Aktivitäten von dir und Freunden: links, 2/3 Breite, doppelte Höhe */}
        <ActivityFeed className="col-span-1 md:col-span-1 lg:col-span-2 lg:row-span-2 order-last lg:order-none" />

        {/* Scoreboard rechts oben, 1/3 Breite */}
        <DashboardLeaderboardCard className="col-span-1 md:col-span-1 lg:col-span-1" />

        {/* Erholungstagebuch rechts unten, 1/3 Breite */}
        <RecoveryJournalCard className="col-span-1 md:col-span-1 lg:col-span-1" />
      </div>
    </PageTemplate>
  );
}
