import { PageTemplate } from "@/components/common/PageTemplate";
import { PageSizeSelector } from "@/components/common/pagination/PageSizeSelector";
import {
  PaginationControls,
  PaginationMeta,
} from "@/components/common/pagination/PaginationControls";
import { WorkoutReactions } from "@/components/workout/WorkoutReactions";
import { TimeRangeFilter } from "@/components/filters/TimeRangeFilter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import type { Workout, WorkoutReaction } from "@/types/workout";
import {
  getNormalizedRange,
  getRangeForPeriod,
  toDateParam,
} from "@/utils/dateRanges";
import { convertDistance, convertWeightFromKg } from "@/utils/units";
import { Dumbbell } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

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

const translateUnit = (unit: string, t: (key: string) => string) => {
  // Normalisiere die Unit für den Vergleich
  const normalizedUnit = unit.toLowerCase();

  // Prüfe auf bekannte Units und übersetze sie
  if (normalizedUnit === "wiederholungen" || normalizedUnit === "repetitions") {
    return t("training.form.units.repetitions");
  }
  if (normalizedUnit === "km" || normalizedUnit === "kilometer" || normalizedUnit === "kilometers") {
    return t("training.form.units.kilometers");
  }
  if (normalizedUnit === "m" || normalizedUnit === "meter" || normalizedUnit === "meters") {
    return t("training.form.units.meters");
  }
  if (normalizedUnit === "meilen" || normalizedUnit === "miles") {
    return t("training.form.units.miles");
  }

  // Fallback: Unit unverändert zurückgeben
  return unit;
};

const formatAmount = (
  activityType: string,
  amount: number,
  unit: string,
  t: (key: string) => string,
  distanceUnit: string
) => {
  const translatedUnit = translateUnit(unit, t);
  const normalized = unit.toLowerCase();
  if (normalized === "km" || normalized === "m" || normalized === "miles" || normalized === "meilen") {
    const converted = convertDistance(amount, unit, distanceUnit);
    return `${converted} ${translateUnit(distanceUnit, t)}`;
  }
  return `${amount} ${translatedUnit}`;
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

const formatDuration = (minutes?: number, t?: (key: string, params?: Record<string, unknown>) => string) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (t) {
    if (hours > 0) {
      return t("training.duration.hours", { hours, minutes: remainingMinutes });
    }
    return t("training.duration.minutes", { minutes });
  }

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${minutes}min`;
};

const getSourceTemplateCredit = (
  workout: Workout,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  if (!workout.sourceTemplateId || !workout.sourceTemplateOwnerDisplayName) {
    return null;
  }
  return t("training.sourceTemplateCredit", {
    name: workout.sourceTemplateOwnerDisplayName,
    defaultValue: "Vorlage von {{name}}",
  });
};

const getVisibilityLabel = (value?: string) => {
  switch (value) {
    case "public":
      return "Public";
    case "friends":
      return "Friends";
    default:
      return "Private";
  }
};

const getVisibilityBadgeClass = (value?: string) => {
  switch (value) {
    case "public":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "friends":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

interface WorkoutResponse {
  workouts: Workout[];
  pagination: PaginationMeta;
}

export function MyWorkouts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const weightUnit = user?.preferences?.units?.weight || "kg";
  const distanceUnit = user?.preferences?.units?.distance || "km";

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const formatDate = (date: Date) =>
    date.toLocaleDateString(i18n.language === "en" ? "en-US" : "de-DE");

  const resolvedRange = useMemo(
    () => getNormalizedRange(getRangeForPeriod(period, customRange, offset)),
    [customRange, period, offset]
  );

  const loadWorkouts = useCallback(async () => {
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
      });

      if (resolvedRange?.from && resolvedRange?.to) {
        params.set("startDate", toDateParam(resolvedRange.from));
        params.set("endDate", toDateParam(resolvedRange.to));
      }

      const response = await fetch(`${API_URL}/workouts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: WorkoutResponse = await response.json();
        setWorkouts(Array.isArray(data.workouts) ? data.workouts : []);
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
          description: t("myWorkouts.errorLoading"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
      setWorkouts([]);
      toast({
        title: t("dashboard.error"),
        description: t("myWorkouts.errorLoading"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, pageSize, resolvedRange, t, toast]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

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

  const handleReactionChange = (workoutId: string, reactions: WorkoutReaction[]) => {
    setWorkouts((prevWorkouts) =>
      prevWorkouts.map((workout) =>
        workout.id === workoutId ? { ...workout, reactions } : workout
      )
    );
  };

  if (!user) {
    return (
      <PageTemplate
        title={t("myWorkouts.title", "Meine Workouts")}
        subtitle={t(
          "myWorkouts.subtitle",
          "Alle deine Trainings im Überblick"
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
      title={t("myWorkouts.title", "Meine Workouts")}
      subtitle={t(
        "myWorkouts.subtitle",
        "Alle deine Trainings im Überblick"
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
            t("myWorkouts.totalWorkouts", {
              count: pagination.totalItems,
              defaultValue: `${pagination.totalItems} Trainings gefunden`,
            })}
        </div>
        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          label={t("myWorkouts.itemsPerPage", "Pro Seite:")}
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
              <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t(
                  "myWorkouts.noWorkouts",
                  "Keine Trainings gefunden"
                )}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  "myWorkouts.noWorkoutsDescription",
                  "Im ausgewählten Zeitraum wurden keine Trainings aufgezeichnet."
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workouts List */}
      {!isLoading && workouts.length > 0 && (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Card
              key={workout.id}
              className="border-primary/30 bg-primary/5 dark:bg-primary/10"
            >
              <CardContent className="p-3 md:p-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Dumbbell className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-sm truncate text-foreground">
                          {workout.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getVisibilityBadgeClass(workout.visibility)}`}
                        >
                          {getVisibilityLabel(workout.visibility)}
                        </Badge>
                        {workout.isTemplate && (
                          <Badge variant="outline" className="text-xs">
                            Vorlage
                          </Badge>
                        )}
                        {workout.duration && (
                          <Badge variant="outline" className="text-xs ml-2">
                            ⏱️ {formatDuration(workout.duration, t)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <span className="text-xs">
                        {formatTimeAgo(
                          workout.startTimeTimestamp || null,
                          t,
                          i18n.language
                        )}
                      </span>
                    </div>
                    {getSourceTemplateCredit(workout, t) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        ⭐ {getSourceTemplateCredit(workout, t)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {workout.description && (
                  <p className="text-xs text-muted-foreground italic mb-2">
                    "{workout.description}"
                  </p>
                )}

                {/* Activities */}
                {workout.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {workout.activities.map((activity) => {
                      const formatSets = (
                        sets: Array<{ reps: number; weight?: number }>
                      ) => {
                        if (!sets || sets.length === 0) return null;
                        return sets
                          .map((set) => {
                            const reps = set.reps || 0;
                            const weight = set.weight;
                            if (weight) {
                              const displayWeight = convertWeightFromKg(weight, weightUnit);
                              return `${reps}x${displayWeight}${weightUnit}`;
                            }
                            return `${reps}`;
                          })
                          .join(", ");
                      };

                      const setsDisplay =
                        activity.sets && activity.sets.length > 0
                          ? formatSets(activity.sets)
                          : null;

                      return (
                        <Badge
                          key={activity.id}
                          variant="secondary"
                          className={`text-xs py-0.5 px-2 ${getActivityColor(activity.activityType)}`}
                        >
                          {getActivityIcon(activity.activityType)}{" "}
                          {getActivityName(activity.activityType, t)}:{" "}
                          {formatAmount(activity.activityType, activity.amount, activity.unit, t, distanceUnit)}
                          {setsDisplay && (
                            <span className="ml-1 opacity-75">
                              ({setsDisplay})
                            </span>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Reactions */}
                <div className="mt-2">
                  <WorkoutReactions
                    workoutId={workout.id}
                    reactions={workout.reactions || []}
                    isOwnWorkout={true}
                    onReactionChange={(nextReactions) =>
                      handleReactionChange(workout.id, nextReactions)
                    }
                  />
                </div>
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
