import { PageTemplate } from "@/components/common/PageTemplate";
import { PageSizeSelector } from "@/components/common/pagination/PageSizeSelector";
import {
  PaginationControls,
  PaginationMeta,
} from "@/components/common/pagination/PaginationControls";
import { WorkoutReactions } from "@/components/workout/WorkoutReactions";
import { TimeRangeFilter } from "@/components/filters/TimeRangeFilter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { parseAvatarConfig } from "@/lib/avatar";
import type { FeedWorkout } from "@/types/workout";
import {
  getNormalizedRange,
  getRangeForPeriod,
  toDateParam,
} from "@/utils/dateRanges";
import { Dumbbell, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import NiceAvatar from "react-nice-avatar";
import { Link, useNavigate } from "react-router-dom";

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
  t: (key: string, params?: Record<string, unknown>) => string,
  locale: string
) => {
  if (!dateString) {
    return t("activityFeed.timeAgoShort.unknown");
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return t("activityFeed.timeAgoShort.unknown");
  }

  return date.toLocaleDateString(locale === "en" ? "en-US" : "de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUserInitials = (firstName: string, lastName: string) => {
  const first = firstName && firstName.length > 0 ? firstName.charAt(0) : "?";
  const last = lastName && lastName.length > 0 ? lastName.charAt(0) : "?";
  return `${first}${last}`.toUpperCase();
};

export function FriendsActivities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<FeedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFriends, setHasFriends] = useState<boolean | null>(null);
  const [period, setPeriod] = useState("all");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [offset, setOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const handleReactionChange = useCallback(
    (workoutId: string, reactions: FeedWorkout["reactions"]) => {
      if (!reactions) {
        return;
      }

      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.workoutId === workoutId
            ? { ...workout, reactions }
            : workout
        )
      );
    },
    []
  );

  const formatDate = (date: Date) =>
    date.toLocaleDateString(i18n.language === "en" ? "en-US" : "de-DE");

  const resolvedRange = useMemo(
    () => getNormalizedRange(getRangeForPeriod(period, customRange, offset)),
    [customRange, period, offset]
  );

  const loadFeed = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setWorkouts([]);
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        period,
      });

      if (resolvedRange?.from && resolvedRange?.to) {
        params.set("start", toDateParam(resolvedRange.from));
        params.set("end", toDateParam(resolvedRange.to));
      }

      const response = await fetch(`${API_URL}/feed?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkouts(Array.isArray(data.workouts) ? data.workouts : []);
        setHasFriends(data.hasFriends ?? false);
        setPagination({
          currentPage: data.pagination?.currentPage ?? 1,
          totalPages: data.pagination?.totalPages ?? 1,
          totalItems: data.pagination?.totalItems ?? 0,
          hasNext: data.pagination?.hasNext ?? false,
          hasPrev: data.pagination?.hasPrev ?? false,
        });
      } else {
        setWorkouts([]);
        toast({
          title: t("dashboard.error"),
          description: t("activityFeed.errorLoading"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading activity feed:", error);
      setWorkouts([]);
      toast({
        title: t("dashboard.error"),
        description: t("activityFeed.errorLoading"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, pageSize, period, resolvedRange, t, toast]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setOffset(0);
    setCurrentPage(1);
    if (value !== "custom") {
      setCustomRange(undefined);
    }
  };

  const handleRangeChange = (range: DateRange | undefined) => {
    setCustomRange(range);
    setCurrentPage(1);
    if (range?.from && range?.to) {
      setPeriod("custom");
    }
  };

  const handleOffsetChange = (newOffset: number) => {
    setOffset(newOffset);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (!user) {
    return (
      <PageTemplate
        title={t("friendsActivities.title", "Aktivitäten")}
        subtitle={t(
          "friendsActivities.subtitle",
          "Alle Trainings deiner Freunde"
        )}
      >
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">
            {t("activityFeed.pleaseLogin")}
          </p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={t("friendsActivities.title", "Aktivitäten")}
      subtitle={t(
        "friendsActivities.subtitle",
        "Alle Trainings deiner Freunde"
      )}
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
          formatDate={formatDate}
        />
      }
    >
      {/* Page Size Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          {pagination.totalItems > 0 &&
            t("friendsActivities.totalWorkouts", {
              count: pagination.totalItems,
              defaultValue: `${pagination.totalItems} Trainings gefunden`,
            })}
        </div>
        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          label={t("friendsActivities.itemsPerPage", "Pro Seite:")}
          options={[5, 10, 20, 50]}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && workouts.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              {hasFriends === false ? (
                <>
                  <h3 className="text-lg font-medium mb-2">
                    {t("activityFeed.noFriends", "Du hast noch keine Freunde")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t(
                      "activityFeed.addFriendsToSeeActivities",
                      "Füge Freunde hinzu, um deren Aktivitäten hier zu sehen."
                    )}
                  </p>
                  <Button onClick={() => navigate("/friends")}>
                    {t("activityFeed.goToFriends", "Zu Freunden")}
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">
                    {t(
                      "friendsActivities.noWorkouts",
                      "Keine Trainings gefunden"
                    )}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(
                      "friendsActivities.noWorkoutsDescription",
                      "Im ausgewählten Zeitraum wurden keine Trainings aufgezeichnet."
                    )}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workouts List */}
      {!isLoading && workouts.length > 0 && (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Card
              key={workout.workoutId}
              className={
                workout.isOwnWorkout
                  ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                  : ""
              }
            >
              <CardContent className="p-3 md:p-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  {workout.isOwnWorkout ? (
                    <Avatar className="w-10 h-10 shrink-0">
                      {workout.userAvatar &&
                        parseAvatarConfig(workout.userAvatar) ? (
                        <NiceAvatar
                          style={{ width: "40px", height: "40px" }}
                          {...parseAvatarConfig(workout.userAvatar)!}
                        />
                      ) : (
                        <AvatarFallback className="text-sm">
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
                      <Avatar className="w-10 h-10 cursor-pointer">
                        {workout.userAvatar &&
                          parseAvatarConfig(workout.userAvatar) ? (
                          <NiceAvatar
                            style={{ width: "40px", height: "40px" }}
                            {...parseAvatarConfig(workout.userAvatar)!}
                          />
                        ) : (
                          <AvatarFallback className="text-sm">
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
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {workout.isOwnWorkout ? (
                          <span className="font-semibold text-sm truncate text-foreground">
                            {workout.userName}
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({t("activityFeed.you", "Du")})
                            </span>
                          </span>
                        ) : (
                          <Link
                            to={`/friends/${workout.userId}`}
                            className="font-semibold text-sm truncate text-foreground hover:text-primary transition-colors"
                          >
                            {workout.userName}
                          </Link>
                        )}
                        <span className="text-muted-foreground hidden sm:inline">
                          ·
                        </span>
                        <span className="text-sm text-muted-foreground truncate hidden sm:inline">
                          {workout.workoutTitle}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">
                        +{workout.totalPoints} {t("activityFeed.points")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Dumbbell className="h-3.5 w-3.5 sm:hidden" />
                      <span className="text-xs sm:hidden truncate">
                        {workout.workoutTitle}
                      </span>
                      <span className="text-xs">
                        {formatTimeAgo(
                          workout.startTimeTimestamp,
                          t,
                          i18n.language
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activities */}
                {workout.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {workout.activities.map((activity) => (
                      <Badge
                        key={activity.id}
                        variant="secondary"
                        className={`text-xs py-0.5 px-2 ${getActivityColor(activity.activityType)}`}
                      >
                        {getActivityIcon(activity.activityType)}{" "}
                        {getActivityName(activity.activityType, t)}:{" "}
                        {formatAmount(activity.activityType, activity.amount)}
                        <span className="ml-1 opacity-75">
                          ({activity.points})
                        </span>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-2">
                  <WorkoutReactions
                    workoutId={workout.workoutId}
                    reactions={workout.reactions}
                    isOwnWorkout={workout.isOwnWorkout}
                    onReactionChange={(nextReactions) =>
                      handleReactionChange(workout.workoutId, nextReactions)
                    }
                  />
                </div>

                {/* Notes */}
                {workout.workoutNotes && (
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    "{workout.workoutNotes}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <PaginationControls
              pagination={pagination}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              labels={{
                previous: t("filters.previous"),
                next: t("filters.next"),
                page: (current, total) =>
                  t("filters.pageLabel", { current, total }),
                summary: (start, end, total) =>
                  t("filters.itemSummary", { start, end, total }),
              }}
            />
          )}
        </div>
      )}
    </PageTemplate>
  );
}
