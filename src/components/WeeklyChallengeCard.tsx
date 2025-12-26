import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WEEKLY_CHALLENGE_POINTS_TARGET } from "@/config/events";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  WeeklyChallengeResponse,
} from "@/types/challenges";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { Flame, ShieldCheck, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "./ui/skeleton";

import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface WeeklyChallengeCardProps {
  className?: string;
  userPointsGoal?: number;
  onOpenSettings?: () => void;
}

export function WeeklyChallengeCard({
  className,
  userPointsGoal,
  onOpenSettings,
}: WeeklyChallengeCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<WeeklyChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locale = useMemo(
    () => (i18n.language === "en" ? enUS : de),
    [i18n.language]
  );

  useEffect(() => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadChallenge = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/challenges/weekly`, {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(t("weeklyChallenge.errorLoading"));
        }

        const payload: WeeklyChallengeResponse = await response.json();
        setData(payload);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Weekly challenge load error", error);
        toast({
          title: t("dashboard.error"),
          description: t("weeklyChallenge.couldNotLoad"),
          variant: "destructive",
        });
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenge();

    return () => {
      controller.abort();
    };
  }, [user, toast, t]);

  if (!user) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            {t("weeklyChallenge.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("weeklyChallenge.pleaseLogin")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            {t("weeklyChallenge.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-64" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            {t("weeklyChallenge.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("weeklyChallenge.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formattedRange = `${format(new Date(data.week.start), "PPP", { locale })} – ${format(new Date(data.week.end), "PPP", { locale })}`;

  // Use user goal if set and > 0, otherwise fallback to API target
  const apiTarget = data?.targets?.points ?? WEEKLY_CHALLENGE_POINTS_TARGET;
  const normalizedPointsTarget =
    userPointsGoal && userPointsGoal > 0 ? userPointsGoal : apiTarget > 0 ? apiTarget : WEEKLY_CHALLENGE_POINTS_TARGET;

  const challengeCompleted =
    normalizedPointsTarget > 0 &&
    data.progress.totalPoints >= normalizedPointsTarget;
  const completionPercentage = normalizedPointsTarget
    ? Math.round((data.progress.totalPoints / normalizedPointsTarget) * 100)
    : 0;

  return (
    <Card className={cn("h-full relative", className)}>
      <CardHeader className="space-y-2 relative pr-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Flame className="h-5 w-5 text-orange-500" />
            {t("weeklyChallenge.title")}
          </CardTitle>
          <Badge
            variant={challengeCompleted ? "default" : "secondary"}
            className="flex items-center mr-4 gap-1"
          >
            {challengeCompleted ? (
              <>
                <ShieldCheck className="h-4 w-4" />
                {t("weeklyChallenge.completed")}
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                {data.week.daysRemaining}{" "}
                {data.week.daysRemaining === 1
                  ? t("weeklyChallenge.day")
                  : t("weeklyChallenge.days")}
              </>
            )}
          </Badge>
        </div>
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 right-0"
            onClick={onOpenSettings}
            title={t("weeklyGoals.pointsTitle", "Wochenziel festlegen")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        <p className="text-sm text-muted-foreground">{formattedRange}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">
            {data.progress.totalPoints.toLocaleString()}{" "}
            {t("weeklyChallenge.points")}
          </span>
          <span className="text-muted-foreground">
            {t("weeklyChallenge.workoutsThisWeek", {
              count: data.progress.workoutsCompleted,
            })}
          </span>
          <span className="text-muted-foreground">
            {t("weeklyChallenge.progress")}:{" "}
            {completionPercentage}
            %
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {t("weeklyChallenge.pointsTarget")}
            </span>
            <span className="text-muted-foreground">
              {data.progress.totalPoints.toLocaleString()} /{" "}
              {normalizedPointsTarget.toLocaleString()}{" "}
              {t("weeklyChallenge.points")}
            </span>
          </div>
          <Progress
            value={Math.min(
              normalizedPointsTarget
                ? (data.progress.totalPoints / normalizedPointsTarget) * 100
                : 0,
              100
            )}
            className="h-2"
          />
        </div>

        {challengeCompleted && (
          <div className="flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex flex-col items-center gap-2 text-center">
              <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {t("weeklyChallenge.completedTitle", "Challenge geschafft!")}
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  {t("weeklyChallenge.bonusPointsSecured", "Du hast dir die Bonuspunkte gesichert.")}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
