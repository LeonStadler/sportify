import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { parseAvatarConfig } from "@/lib/avatar";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NiceAvatar from "react-nice-avatar";
import { useNavigate } from "react-router-dom";

interface ActivityFeedItem {
  id: string;
  userName: string;
  userAvatar?: string;
  userFirstName: string;
  userLastName: string;
  activityType: string;
  amount: number;
  points: number;
  workoutTitle: string;
  startTimeTimestamp: string | null;
}

const formatActivity = (
  activity: ActivityFeedItem,
  t: (key: string, params?: Record<string, unknown>) => string
) => {
  const { activityType, amount, workoutTitle } = activity;

  let formatted = `${amount}`;

  // Add unit based on activity type
  switch (activityType) {
    case "pushups":
    case "pullups":
    case "situps":
      formatted += ` ${t("activityFeed.repetitions")}`;
      break;
    case "running":
    case "cycling":
      formatted += " km";
      break;
    default:
      formatted += ` ${t("activityFeed.units")}`;
  }

  if (workoutTitle) {
    formatted += ` ${t("activityFeed.inWorkout", { title: workoutTitle })}`;
  }

  return formatted;
};

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
  // Fallback to original if translation key doesn't exist
  return translation !== translationKey
    ? translation
    : t("activityFeed.activityTypes.unknown");
};

const getActivityColor = (activityType: string) => {
  switch (activityType) {
    case "pullups":
      return "bg-blue-100 text-blue-800";
    case "pushups":
      return "bg-red-100 text-red-800";
    case "situps":
      return "bg-orange-100 text-orange-800";
    case "running":
      return "bg-green-100 text-green-800";
    case "cycling":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatTimeAgo = (
  dateString: string | null | undefined,
  t: (key: string, params?: Record<string, unknown>) => string
) => {
  // Kein Fallback - wenn kein Datum vorhanden, zeige "Unbekannt"
  if (!dateString) {
    return t("activityFeed.timeAgoShort.unknown");
  }

  const date = new Date(dateString);
  const now = new Date();

  // Prüfe ob das Datum gültig ist
  if (isNaN(date.getTime())) {
    console.warn("Invalid date in formatTimeAgo:", dateString);
    return t("activityFeed.timeAgoShort.unknown");
  }

  const diffMs = now.getTime() - date.getTime();

  // Wenn die Differenz negativ ist (Zukunft), zeige das Datum formatiert
  if (diffMs < 0) {
    // Zeige formatiertes Datum für zukünftige Daten
    const locale = "de-DE";
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Unter 1 Stunde: Minuten
  if (diffMins < 60) {
    if (diffMins < 1) {
      return t("activityFeed.timeAgoShort.justNow");
    }
    return t("activityFeed.timeAgoShort.minutes", { count: diffMins });
  }
  // Unter 24 Stunden: Stunden:Minuten
  else if (diffHours < 24) {
    const remainingMinutes = diffMins % 60;
    if (remainingMinutes === 0) {
      return t("activityFeed.timeAgoShort.hours", { count: diffHours });
    }
    return t("activityFeed.timeAgoShort.hoursMinutes", {
      hours: diffHours,
      minutes: remainingMinutes,
    });
  }
  // Unter 7 Tagen: Tage
  else if (diffDays < 7) {
    if (diffDays === 1) {
      return t("activityFeed.timeAgoShort.yesterday");
    }
    return t("activityFeed.timeAgoShort.days", { count: diffDays });
  }
  // Unter 30 Tagen: Wochen
  else if (diffDays < 30) {
    return t("activityFeed.timeAgoShort.weeks", { count: diffWeeks });
  }
  // Unter 1 Jahr: Monate
  else if (diffDays < 365) {
    return t("activityFeed.timeAgoShort.months", { count: diffMonths });
  }
  // Darüber: Jahre
  else {
    return t("activityFeed.timeAgoShort.years", { count: diffYears });
  }
};

const getUserInitials = (firstName: string, lastName: string) => {
  const first = firstName && firstName.length > 0 ? firstName.charAt(0) : "?";
  const last = lastName && lastName.length > 0 ? lastName.charAt(0) : "?";
  return `${first}${last}`.toUpperCase();
};

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFriends, setHasFriends] = useState<boolean | null>(null);

  const loadActivityFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setActivities([]);
        setError(t("activityFeed.pleaseLogin"));
        return;
      }

      const response = await fetch(`${API_URL}/feed?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const payload = Array.isArray(data) ? data : data?.activities;

        if (Array.isArray(payload)) {
          setActivities(payload);
          // hasFriends sollte true sein, wenn es akzeptierte Freunde gibt
          // Wenn payload leer ist, aber hasFriends true ist, bedeutet das, dass Freunde existieren, aber noch keine Aktivitäten
          setHasFriends(data?.hasFriends ?? (payload.length > 0 ? true : null));
        } else {
          console.warn("ActivityFeed: Unexpected data format", data);
          setActivities([]);
          setHasFriends(data?.hasFriends ?? false);
          setError(t("activityFeed.unexpectedFormat"));
        }
      } else {
        setActivities([]);
        setHasFriends(false);
        setError(t("activityFeed.couldNotLoad"));
        toast({
          title: t("dashboard.error"),
          description: t("activityFeed.errorLoading"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading activity feed:", error);
      setActivities([]);
      setHasFriends(false);
      setError(t("activityFeed.couldNotLoad"));
      toast({
        title: t("dashboard.error"),
        description: t("activityFeed.errorLoading"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (user) {
      loadActivityFeed();
    }
  }, [user, loadActivityFeed]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">
            {t("activityFeed.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl">
          {t("activityFeed.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div role="alert" className="text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <Avatar className="w-10 h-10 md:w-12 md:h-12">
                    {activity.userAvatar &&
                    parseAvatarConfig(activity.userAvatar) ? (
                      <NiceAvatar
                        style={{ width: "48px", height: "48px" }}
                        {...parseAvatarConfig(activity.userAvatar)!}
                      />
                    ) : (
                      <AvatarFallback className="text-xs md:text-sm">
                        {getUserInitials(
                          activity.userFirstName,
                          activity.userLastName
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm md:text-base truncate">
                        {activity.userName}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getActivityColor(activity.activityType)}`}
                      >
                        {getActivityIcon(activity.activityType)}{" "}
                        {getActivityName(activity.activityType, t)}
                      </Badge>
                    </div>

                    <p className="text-xs md:text-sm text-muted-foreground mb-1">
                      <span className="font-medium">
                        {formatActivity(activity, t)}
                      </span>
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.startTimeTimestamp, t)}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        {activity.points} {t("activityFeed.points")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
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
