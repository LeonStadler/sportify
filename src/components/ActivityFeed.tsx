import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { parseAvatarConfig } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NiceAvatar from "react-nice-avatar";
import { Link, useNavigate } from "react-router-dom";

interface WorkoutActivity {
  id: string;
  activityType: string;
  amount: number;
  points: number;
}

interface FeedWorkout {
  workoutId: string;
  workoutTitle: string;
  workoutNotes?: string;
  startTimeTimestamp: string | null;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  userFirstName: string;
  userLastName: string;
  isOwnWorkout: boolean;
  activities: WorkoutActivity[];
  totalPoints: number;
}

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case "pullups":
      return "💪";
    case "pushups":
      return "🔥";
    case "situps":
      return "🚀";
    case "running":
      return "🏃";
    case "cycling":
      return "🚴";
    default:
      return "💪";
  }
};

const getActivityName = (activityType: string, t: (key: string) => string) => {
  const translationKey = `activityFeed.activityTypes.${activityType.toLowerCase()}`;
  const translation = t(translationKey);
  return translation !== translationKey
    ? translation
    : t("activityFeed.activityTypes.unknown");
};

const getActivityColor = (activityType: string) => {
  switch (activityType) {
    case "pullups":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "pushups":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "situps":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "running":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "cycling":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatAmount = (activityType: string, amount: number) => {
  switch (activityType) {
    case "running":
    case "cycling":
      return `${amount} km`;
    default:
      return `${amount}×`;
  }
};

const formatTimeAgo = (
  dateString: string | null | undefined,
  t: (key: string, params?: Record<string, unknown>) => string
) => {
  if (!dateString) {
    return t("activityFeed.timeAgoShort.unknown");
  }

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return t("activityFeed.timeAgoShort.unknown");
  }

  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    const locale = "de-DE";
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 60) {
    if (diffMins < 1) {
      return t("activityFeed.timeAgoShort.justNow");
    }
    return t("activityFeed.timeAgoShort.minutes", { count: diffMins });
  } else if (diffHours < 24) {
    return t("activityFeed.timeAgoShort.hours", { count: diffHours });
  } else if (diffDays < 7) {
    if (diffDays === 1) {
      return t("activityFeed.timeAgoShort.yesterday");
    }
    return t("activityFeed.timeAgoShort.days", { count: diffDays });
  } else if (diffDays < 30) {
    return t("activityFeed.timeAgoShort.weeks", { count: diffWeeks });
  } else {
    return t("activityFeed.timeAgoShort.months", { count: diffMonths });
  }
};

const getUserInitials = (firstName: string, lastName: string) => {
  const first = firstName && firstName.length > 0 ? firstName.charAt(0) : "?";
  const last = lastName && lastName.length > 0 ? lastName.charAt(0) : "?";
  return `${first}${last}`.toUpperCase();
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<FeedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFriends, setHasFriends] = useState<boolean | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadActivityFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setWorkouts([]);
      setError(t("activityFeed.pleaseLogin"));
      setIsLoading(false);
      return;
    }

    const fetchOnce = async () => {
      const response = await fetch(`${API_URL}/feed?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const status = response.status;
        const message =
          status === 401 || status === 403
            ? t("activityFeed.sessionExpired", "Bitte melde dich erneut an.")
            : t("activityFeed.couldNotLoad");

        throw Object.assign(new Error(message), { status });
      }

      const data = await response.json();
      const payload = Array.isArray(data.workouts) ? data.workouts : [];
      setWorkouts(payload);
      setHasFriends(data.hasFriends ?? payload.length > 0);
      setHasMore(data.pagination?.hasNext ?? false);
    };

    try {
      try {
        await fetchOnce();
      } catch (error) {
        // einmal kurz warten und ein zweites Mal versuchen (Backend-Warmup / kurzzeitige Netzwerkfehler)
        await sleep(800);
        await fetchOnce();
      }
    } catch (error: any) {
      console.error("Error loading activity feed:", error);
      setWorkouts([]);
      setHasFriends(false);
      setError(error?.message ?? t("activityFeed.couldNotLoad"));
      toast({
        title: t("dashboard.error"),
        description: t("activityFeed.errorLoading"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast, navigate]);

  useEffect(() => {
    if (user) {
      loadActivityFeed();
    }
  }, [user, loadActivityFeed]);

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col min-h-0", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">
            {t("activityFeed.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-auto">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col min-h-0", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl">
            {t("activityFeed.title")}
          </CardTitle>
          {workouts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/friends/activities")}
              className="text-primary hover:text-primary/80"
            >
              {t("activityFeed.showAll", "Alle anzeigen")}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-auto">
        {error ? (
          <div role="alert" className="text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="space-y-2">
            {workouts.length > 0 ? (
              <>
                {workouts.map((workout) => (
                  <div
                    key={workout.workoutId}
                    className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${workout.isOwnWorkout
                      ? "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30"
                      : "bg-muted/30 border-border"
                      }`}
                  >
                    {/* Header: User + Time + Points */}
                    <div className="flex items-center gap-2.5 mb-2">
                      {workout.isOwnWorkout ? (
                        <Avatar className="w-8 h-8">
                          {workout.userAvatar &&
                            parseAvatarConfig(workout.userAvatar) ? (
                            <NiceAvatar
                              style={{ width: "32px", height: "32px" }}
                              {...parseAvatarConfig(workout.userAvatar)!}
                            />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {getUserInitials(
                                workout.userFirstName,
                                workout.userLastName
                              )}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      ) : (
                        <Link
                          to={`/friends/${workout.userId}`}
                          className="hover:opacity-80 transition-opacity shrink-0"
                        >
                          <Avatar className="w-8 h-8 cursor-pointer">
                            {workout.userAvatar &&
                              parseAvatarConfig(workout.userAvatar) ? (
                              <NiceAvatar
                                style={{ width: "32px", height: "32px" }}
                                {...parseAvatarConfig(workout.userAvatar)!}
                              />
                            ) : (
                              <AvatarFallback className="text-xs">
                                {getUserInitials(
                                  workout.userFirstName,
                                  workout.userLastName
                                )}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </Link>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {workout.isOwnWorkout ? (
                            <span className="font-medium text-sm truncate text-foreground">
                              {workout.userName}
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({t("activityFeed.you", "Du")})
                              </span>
                            </span>
                          ) : (
                            <Link
                              to={`/friends/${workout.userId}`}
                              className="font-medium text-sm truncate text-foreground hover:text-primary transition-colors"
                            >
                              {workout.userName}
                            </Link>
                          )}
                          <span className="text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {workout.workoutTitle}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(workout.startTimeTimestamp, t)}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-primary whitespace-nowrap">
                        +{workout.totalPoints}
                      </span>
                    </div>

                    {/* Activities - compact inline */}
                    {workout.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {workout.activities.map((activity) => (
                          <Badge
                            key={activity.id}
                            variant="secondary"
                            className={`text-xs py-0.5 px-2 ${getActivityColor(activity.activityType)}`}
                          >
                            {getActivityIcon(activity.activityType)}{" "}
                            {formatAmount(
                              activity.activityType,
                              activity.amount
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Show More Button */}
                {hasMore && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/friends/activities")}
                  >
                    {t("activityFeed.showMore", "Mehr anzeigen")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                {hasFriends === false ? (
                  <>
                    <p className="text-muted-foreground mb-2 font-medium">
                      {t(
                        "activityFeed.noFriends",
                        "Du hast noch keine Freunde"
                      )}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4">
                      {t(
                        "activityFeed.addFriendsToSeeActivities",
                        "Füge Freunde hinzu, um deren Aktivitäten hier zu sehen."
                      )}
                    </p>
                    <Button
                      onClick={() => navigate("/friends")}
                      className="mt-2"
                    >
                      {t("activityFeed.goToFriends", "Zu Freunden")}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-2">
                      {t("activityFeed.noActivities")}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t("activityFeed.addFriends")}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

