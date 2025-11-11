import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { parseAvatarConfig } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import type {
  WeeklyChallengeLeaderboardEntry,
  WeeklyChallengeResponse,
} from "@/types/challenges";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { Flame, ShieldCheck, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NiceAvatar from "react-nice-avatar";

import { Skeleton } from "./ui/skeleton";

interface BackendFriend {
  id: string;
  displayName?: string;
  display_name?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  avatarUrl?: string;
  avatar_url?: string;
}

interface Friend {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface WeeklyChallengeCardProps {
  className?: string;
}

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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsError, setFriendsError] = useState<string | null>(null);

  const locale = useMemo(
    () => (i18n.language === "en" ? enUS : de),
    [i18n.language]
  );
  const numberLocale = i18n.language === "en" ? "en-US" : "de-DE";

  const WEEKLY_POINTS_TARGET = 1500;

  const visibleLeaderboard = useMemo(() => {
    if (!data || !user) {
      return [] as WeeklyChallengeLeaderboardEntry[];
    }

    // Erstelle Set von Freunde-IDs inklusive eigener ID
    const friendIds = new Set([user.id, ...friends.map((f) => f.id)]);

    // Filtere Leaderboard nach Freunden (sich selbst + Freunde)
    const friendsLeaderboard = data.leaderboard
      .filter((entry) => friendIds.has(entry.id))
      .sort((a, b) => {
        // Sortiere nach Punkten (absteigend), dann nach Rank
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return a.rank - b.rank;
      });

    return friendsLeaderboard;
  }, [data, friends, user]);

  useEffect(() => {
    if (!user) {
      setFriends([]);
      setFriendsError(null);
      return;
    }

    const loadFriends = async () => {
      try {
        setFriendsError(null);
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/friends`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorMessage = t("weeklyChallenge.errorLoadingFriends");
          setFriendsError(errorMessage);
          setFriends([]);
          toast({
            title: t("common.error"),
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setFriends(
            data.map((friend: BackendFriend) => ({
              id: friend.id,
              displayName:
                friend.displayName ||
                friend.display_name ||
                `${friend.firstName || friend.first_name || ""} ${friend.lastName || friend.last_name || ""}`,
              avatarUrl: friend.avatarUrl || friend.avatar_url,
            }))
          );
        } else {
          setFriends([]);
        }
      } catch (error) {
        console.error("Error loading friends:", error);
        const errorMessage = t("weeklyChallenge.errorLoadingFriends");
        setFriendsError(errorMessage);
        setFriends([]);
        toast({
          title: t("common.error"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    loadFriends();
  }, [user, toast, t]);

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
  const challengeCompleted = data.progress.totalPoints >= WEEKLY_POINTS_TARGET;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Flame className="h-5 w-5 text-orange-500" />
            {t("weeklyChallenge.title")}
          </CardTitle>
          <Badge
            variant={challengeCompleted ? "default" : "secondary"}
            className="flex items-center gap-1"
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
            {Math.round(
              (data.progress.totalPoints / WEEKLY_POINTS_TARGET) * 100
            )}
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
              {WEEKLY_POINTS_TARGET.toLocaleString()}{" "}
              {t("weeklyChallenge.points")}
            </span>
          </div>
          <Progress
            value={Math.min(
              (data.progress.totalPoints / WEEKLY_POINTS_TARGET) * 100,
              100
            )}
            className="h-2"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              {t("weeklyChallenge.leaderboard")}
            </h3>
            {challengeCompleted ? (
              <Badge
                variant="outline"
                className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              >
                <ShieldCheck className="mr-1 h-4 w-4" />
                {t("weeklyChallenge.bonusPointsSecured")}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t("weeklyChallenge.collectPoints")}
              </span>
            )}
          </div>

          {friendsError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20">
              {friendsError}
            </div>
          )}

          <div className="space-y-2">
            {visibleLeaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {friends.length === 0
                  ? t("weeklyChallenge.noFriendsYet")
                  : t("weeklyChallenge.noActivitiesYet")}
              </p>
            ) : (
              visibleLeaderboard.map(
                (entry: WeeklyChallengeLeaderboardEntry) => (
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
                        entry.isCurrentUser &&
                          "bg-primary/20 dark:bg-primary/30 text-primary"
                      )}
                    >
                      #{entry.rank}
                    </Badge>
                    <Avatar className="h-10 w-10 shrink-0">
                      {entry.avatarUrl && parseAvatarConfig(entry.avatarUrl) ? (
                        <NiceAvatar
                          style={{ width: "40px", height: "40px" }}
                          {...parseAvatarConfig(entry.avatarUrl)!}
                        />
                      ) : (
                        <AvatarFallback
                          className={cn(
                            entry.isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {getAvatarFallback(entry.displayName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">
                        {entry.displayName}
                        {entry.isCurrentUser && (
                          <span className="ml-1 text-primary font-semibold">
                            ({t("weeklyChallenge.you")})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.totalPoints.toLocaleString()}{" "}
                        {t("weeklyChallenge.points")}
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
