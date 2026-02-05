import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/api";
import { parseAvatarConfig } from "@/lib/avatar";
import { getBadgeText } from "@/lib/badges";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, Award, Dumbbell, Home, Medal, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NiceAvatar from "react-nice-avatar";
import { Link, useParams } from "react-router-dom";

interface FriendBadge {
  id: string;
  slug: string;
  label: string;
  icon?: string | null;
  category: string;
  level?: number | null;
  earnedAt?: string;
}

interface FriendAward {
  id: string;
  type: string;
  label: string;
  periodStart?: string;
  periodEnd?: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
}

interface WorkoutActivity {
  id: string;
  activityType: string;
  amount: number;
  points: number;
}

interface RecentWorkout {
  workoutId: string;
  workoutTitle: string;
  startTimeTimestamp: string | null;
  workoutNotes?: string;
  activities: WorkoutActivity[];
  totalPoints: number;
}

interface FriendProfileResponse {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt?: string;
  badges: FriendBadge[];
  awards: FriendAward[];
  recentWorkouts: RecentWorkout[];
}

const formatDate = (value?: string) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, "dd.MM.yyyy", { locale: de });
  } catch (error) {
    return value;
  }
};

const formatDateRange = (start?: string, end?: string) => {
  const startFormatted = formatDate(start);
  const endFormatted = formatDate(end);
  if (startFormatted && endFormatted) {
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} – ${endFormatted}`;
  }
  return startFormatted || endFormatted;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
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

export function FriendProfile() {
  const { friendId } = useParams();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<FriendProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<"not-friends" | "generic" | null>(
    null
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      if (!friendId) {
        setErrorKind("generic");
        setError(t("friendProfile.errors.missingId"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setErrorKind(null);
      let nextErrorKind: "not-friends" | "generic" = "generic";

      try {
        const response = await fetch(`${API_URL}/profile/friends/${friendId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message =
            payload?.error || t("friendProfile.errors.loadFailed");
          if (
            response.status === 403 &&
            /nicht befreundet|not friends/i.test(message)
          ) {
            nextErrorKind = "not-friends";
          }
          throw new Error(message);
        }

        const data: FriendProfileResponse = await response.json();
        setProfile(data);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setErrorKind(nextErrorKind);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : t("friendProfile.errors.unknown")
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => controller.abort();
  }, [friendId, t]);

  const sortedBadges = useMemo(() => {
    if (!profile?.badges) return [];
    return [...profile.badges].sort((a, b) => {
      const dateA = a.earnedAt ? new Date(a.earnedAt).getTime() : 0;
      const dateB = b.earnedAt ? new Date(b.earnedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [profile?.badges]);

  const sortedAwards = useMemo(() => {
    if (!profile?.awards) return [];
    return [...profile.awards].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [profile?.awards]);

  const content = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="grid gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (error) {
      if (errorKind === "not-friends") {
        return (
          <div className="min-h-[60vh] flex items-center justify-center bg-background">
            <div className="text-center max-w-md mx-auto px-4">
              <h1 className="text-8xl md:text-9xl font-bold mb-4 text-primary">
                403
              </h1>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">
                {t("friendProfile.notFriends.title", "Nur für Freunde")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t(
                  "friendProfile.notFriends.description",
                  "Dieses Profil ist nur für Freunde sichtbar."
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  <Link
                    to="/friends"
                    className="inline-flex items-center gap-2"
                  >
                    <UserX className="w-5 h-5" />
                    {t(
                      "friendProfile.notFriends.backToFriends",
                      "Zu den Freunden"
                    )}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/" className="inline-flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    {t("notFound.backHome", "Zur Startseite")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <Card>
          <CardContent className="p-8 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      );
    }

    if (!profile) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t("friendProfile.errors.notFound")}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {profile.avatarUrl && parseAvatarConfig(profile.avatarUrl) ? (
                  <NiceAvatar
                    style={{ width: "64px", height: "64px" }}
                    {...parseAvatarConfig(profile.avatarUrl)!}
                  />
                ) : (
                  <AvatarFallback className="text-lg">
                    {getInitials(profile.displayName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold">
                  {profile.displayName}
                </h1>
                {profile.joinedAt && (
                  <p className="text-sm text-muted-foreground">
                    {t("friendProfile.joinedSince", {
                      date: formatDate(profile.joinedAt),
                    })}
                  </p>
                )}
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/friends">
                <ArrowLeft className="mr-2 h-4 w-4" />{" "}
                {t("friendProfile.backToFriends")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />{" "}
                {t("friendProfile.awards", "Auszeichnungen")}
              </CardTitle>
              <UiBadge variant="outline">{sortedAwards.length}</UiBadge>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedAwards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("friendProfile.noAwards", "Noch keine Auszeichnungen.")}
                </p>
              ) : (
                sortedAwards.map((award) => (
                  <div
                    key={award.id}
                    className="rounded-lg border bg-card p-3 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{award.label}</span>
                      <UiBadge variant="secondary" className="text-xs">
                        {award.type}
                      </UiBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateRange(award.periodStart, award.periodEnd) ||
                        t("friendProfile.awardLabel", "Auszeichnung")}
                    </p>
                    {award.metadata &&
                      Object.keys(award.metadata).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(award.metadata)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" · ")}
                        </p>
                      )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Medal className="h-5 w-5 text-primary" />{" "}
                {t("profile.achievements.badges")}
              </CardTitle>
              <UiBadge variant="outline">{sortedBadges.length}</UiBadge>
            </CardHeader>
            <CardContent className="grid gap-3">
              {sortedBadges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("friendProfile.noBadges", "Noch keine Badges.")}
                </p>
              ) : (
                sortedBadges.map((badge) => {
                  const badgeText = getBadgeText(badge, t);
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div>
                        <p className="font-medium leading-none">
                          {badgeText.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {badgeText.category || badge.category}
                          {badge.level
                            ? ` · ${t("friendProfile.level", "Stufe")} ${badge.level}`
                            : null}
                        </p>
                        {badge.earnedAt && (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(badge.earnedAt)}
                          </p>
                        )}
                      </div>
                      {badge.icon ? (
                        <UiBadge
                          variant="secondary"
                          className="text-xs uppercase"
                        >
                          {badgeText.icon || badge.icon.replace("badge-", "")}
                        </UiBadge>
                      ) : null}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Workouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />{" "}
              {t("friendProfile.recentWorkouts", "Letzte Aktivitäten")}
            </CardTitle>
            <UiBadge variant="outline">
              {profile.recentWorkouts?.length || 0}
            </UiBadge>
          </CardHeader>
          <CardContent className="space-y-3">
            {!profile.recentWorkouts || profile.recentWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t(
                  "friendProfile.noWorkouts",
                  "Noch keine Trainings aufgezeichnet."
                )}
              </p>
            ) : (
              profile.recentWorkouts.map((workout) => (
                <div
                  key={workout.workoutId}
                  className="rounded-lg border bg-card p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {workout.workoutTitle}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      +{workout.totalPoints}{" "}
                      {t("activityFeed.points", "Punkte")}
                    </span>
                  </div>
                  {workout.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {workout.activities.map((activity) => (
                        <UiBadge
                          key={activity.id}
                          variant="secondary"
                          className={`text-xs py-0.5 px-2 ${getActivityColor(activity.activityType)}`}
                        >
                          {getActivityIcon(activity.activityType)}{" "}
                          {formatAmount(activity.activityType, activity.amount)}
                        </UiBadge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {workout.startTimeTimestamp
                      ? new Date(workout.startTimeTimestamp).toLocaleDateString(
                          i18n.language === "en" ? "en-US" : "de-DE",
                          {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : t("training.unknownDate", "Unbekanntes Datum")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return <div className="space-y-6">{content()}</div>;
}

export default FriendProfile;
