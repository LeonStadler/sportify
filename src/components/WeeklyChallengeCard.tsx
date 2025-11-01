import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { parseAvatarConfig } from "@/lib/avatar";
import NiceAvatar from "react-nice-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { WeeklyChallengeLeaderboardEntry, WeeklyChallengeResponse } from "@/types/challenges";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { Flame, ShieldCheck, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "./ui/skeleton";

interface WeeklyChallengeCardProps {
  className?: string;
}

type ChallengeActivityKey = "pullups" | "pushups" | "running" | "cycling";

const getAvatarFallback = (name: string) => {
  const initials = name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "S";
};

export function WeeklyChallengeCard({ className }: WeeklyChallengeCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<WeeklyChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const activityMeta: Record<ChallengeActivityKey, { label: string; icon: string; unit?: string }> = {
    pullups: { label: t('dashboard.pullups'), icon: "💪" },
    pushups: { label: t('dashboard.pushups'), icon: "🔥" },
    running: { label: t('dashboard.running'), icon: "🏃", unit: "km" },
    cycling: { label: t('dashboard.cycling'), icon: "🚴", unit: "km" },
  };

  const formatActivityValue = (activity: ChallengeActivityKey, value: number, localeCode?: string) => {
    const meta = activityMeta[activity];
    const numeric = Number.isFinite(value) ? value : 0;
    const formattedNumber = new Intl.NumberFormat(localeCode, {
      maximumFractionDigits: meta.unit ? 1 : 0,
      minimumFractionDigits: 0,
    }).format(numeric);
    return meta.unit ? `${formattedNumber} ${meta.unit}` : `${formattedNumber}x`;
  };

  const locale = useMemo(() => (i18n.language === "en" ? enUS : de), [i18n.language]);
  const numberLocale = i18n.language === "en" ? "en-US" : "de-DE";
  const visibleLeaderboard = useMemo(() => {
    if (!data) {
      return [] as WeeklyChallengeLeaderboardEntry[];
    }

    const topEntries = data.leaderboard.slice(0, 5);
    const currentUserEntry = data.leaderboard.find((entry) => entry.isCurrentUser);

    if (currentUserEntry && !topEntries.some((entry) => entry.id === currentUserEntry.id)) {
      return [...topEntries, currentUserEntry];
    }

    return topEntries;
  }, [data]);

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
          throw new Error(t('weeklyChallenge.errorLoading'));
        }

        const payload: WeeklyChallengeResponse = await response.json();
        setData(payload);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Weekly challenge load error", error);
        toast({
          title: t('dashboard.error'),
          description: t('weeklyChallenge.couldNotLoad'),
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
  }, [user, toast]);

  if (!user) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            {t('weeklyChallenge.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('weeklyChallenge.pleaseLogin')}
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
            {t('weeklyChallenge.title')}
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
            {t('weeklyChallenge.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('weeklyChallenge.noData')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formattedRange = `${format(new Date(data.week.start), "PPP", { locale })} – ${format(new Date(data.week.end), "PPP", { locale })}`;
  const challengeCompleted = data.progress.completionPercentage >= 100;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Flame className="h-5 w-5 text-orange-500" />
            {t('weeklyChallenge.title')}
          </CardTitle>
          <Badge variant={challengeCompleted ? "default" : "secondary"} className="flex items-center gap-1">
            {challengeCompleted ? (
              <>
                <ShieldCheck className="h-4 w-4" />
                {t('weeklyChallenge.completed')}
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                {data.week.daysRemaining} {data.week.daysRemaining === 1 ? t('weeklyChallenge.day') : t('weeklyChallenge.days')}
              </>
            )}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{formattedRange}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">{data.progress.totalPoints.toLocaleString()} {t('weeklyChallenge.points')}</span>
          <span className="text-muted-foreground">
            {t('weeklyChallenge.workoutsThisWeek', { count: data.progress.workoutsCompleted })}
          </span>
          <span className="text-muted-foreground">
            {t('weeklyChallenge.progress')}: {Math.round(data.progress.completionPercentage)}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {Object.entries(activityMeta).map(([key, meta]) => {
            const activityKey = key as ChallengeActivityKey;
            const progress = data.activities[activityKey];
            const percentage = Number.isFinite(progress.percentage) ? Math.round(progress.percentage) : 0;

            return (
              <div key={activityKey} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="text-base">{meta.icon}</span>
                    {meta.label}
                  </span>
                  <span className="text-muted-foreground">
                    {formatActivityValue(activityKey, progress.current, numberLocale)} / {formatActivityValue(activityKey, progress.target, numberLocale)}
                  </span>
                </div>
                <Progress value={Math.min(percentage, 100)} className="h-2" />
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              {t('weeklyChallenge.leaderboard')}
            </h3>
            {challengeCompleted ? (
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="mr-1 h-4 w-4" />
                {t('weeklyChallenge.bonusPointsSecured')}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t('weeklyChallenge.collectPoints')}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {visibleLeaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('weeklyChallenge.noActivitiesYet')}
              </p>
            ) : (
              visibleLeaderboard.map((entry: WeeklyChallengeLeaderboardEntry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    entry.isCurrentUser
                      ? "bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/40"
                      : "bg-card border-border/50 hover:bg-accent/50"
                  )}
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      "w-10 justify-center font-semibold shrink-0",
                      entry.isCurrentUser && "bg-primary/20 dark:bg-primary/30 text-primary"
                    )}
                  >
                    #{entry.rank}
                  </Badge>
                  <Avatar className="h-10 w-10 shrink-0">
                    {entry.avatarUrl && parseAvatarConfig(entry.avatarUrl) ? (
                      <NiceAvatar 
                        style={{ width: '40px', height: '40px' }} 
                        {...parseAvatarConfig(entry.avatarUrl)!} 
                      />
                    ) : (
                      <AvatarFallback className={cn(
                        entry.isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {getAvatarFallback(entry.displayName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">
                      {entry.displayName}
                      {entry.isCurrentUser && (
                        <span className="ml-1 text-primary font-semibold">
                          ({t('weeklyChallenge.you')})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.totalPoints.toLocaleString()} {t('weeklyChallenge.points')} · {Math.round(entry.totalRunning)} {t('weeklyChallenge.kmRunning')}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs shrink-0 font-medium border-border/50"
                  >
                    {Math.round(entry.totalPullups)} {t('weeklyChallenge.pullUps')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
