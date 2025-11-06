import { PageTemplate } from "@/components/PageTemplate";
import { TrainingDiarySection } from "@/components/TrainingDiarySection";
import { WorkoutForm } from "@/components/WorkoutForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import type { Workout } from "@/types/workout";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface WorkoutResponse {
  workouts: Workout[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function Training() {
  const { t } = useTranslation();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [createdWorkoutId, setCreatedWorkoutId] = useState<string | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState("trainings");
  const { toast } = useToast();
  const { user } = useAuth();

  const exerciseTypes = [
    { id: "all", name: t("training.allExercises") },
    { id: "pullups", name: t("training.pullups") },
    { id: "pushups", name: t("training.pushups") },
    { id: "running", name: t("training.running") },
    { id: "cycling", name: t("training.cycling") },
    { id: "situps", name: t("training.situps") },
    { id: "other", name: t("training.other") },
  ];

  const loadWorkouts = useCallback(
    async (page = 1, type = "all") => {
      if (!user) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(type !== "all" && { type }),
        });

        const response = await fetch(`${API_URL}/workouts?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(t("training.loadError"));
        }

        const data: WorkoutResponse = await response.json();
        setWorkouts(data.workouts);
        setPagination(data.pagination);
        setCurrentPage(page);
      } catch (error) {
        console.error("Load workouts error:", error);
        toast({
          title: t("common.error"),
          description: t("training.workoutsLoadError"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast, t]
  );

  useEffect(() => {
    loadWorkouts(1, filterType);
  }, [loadWorkouts, filterType]);

  const handleWorkoutCreated = (workoutId?: string) => {
    // Lade die erste Seite neu um das neue Workout zu zeigen
    loadWorkouts(1, filterType);

    // Zeige Dialog an, wenn ein neues Workout erstellt wurde
    if (workoutId) {
      setCreatedWorkoutId(workoutId);
      setShowRecoveryDialog(true);
    }
  };

  const handleRecoveryDialogConfirm = () => {
    setShowRecoveryDialog(false);
    // Wechsle zum Erholungstagebuch-Tab
    setActiveTab("recovery");
  };

  const handleRecoveryDialogCancel = () => {
    setShowRecoveryDialog(false);
    setCreatedWorkoutId(undefined);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    loadWorkouts(page, filterType);
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm(t("training.deleteConfirm"))) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t("training.deleteError"));
      }

      toast({
        title: t("training.workoutDeleted"),
        description: t("training.workoutDeletedSuccess"),
      });

      loadWorkouts(currentPage, filterType);
    } catch (error) {
      console.error("Delete workout error:", error);
      toast({
        title: t("common.error"),
        description: t("training.deleteWorkoutError"),
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (workout: Workout) => {
    setEditingWorkout(workout);
  };

  const handleWorkoutUpdated = () => {
    setEditingWorkout(null);
    loadWorkouts(currentPage, filterType);
  };

  const handleCancelEdit = () => setEditingWorkout(null);

  // Prüfe ob Workout bearbeitbar ist (jünger als 7 Tage)
  const isWorkoutEditable = (workout: Workout) => {
    if (!workout.startTimeTimestamp) return false;

    const workoutDateTime = new Date(workout.startTimeTimestamp);
    if (isNaN(workoutDateTime.getTime())) return false;

    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - workoutDateTime.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diffInDays <= 7;
  };

  const getExerciseIcon = (exerciseType: string) => {
    switch (exerciseType) {
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
      case "other":
        return "🔗";
      default:
        return "💪";
    }
  };

  const getExerciseColor = (exerciseType: string) => {
    switch (exerciseType) {
      case "pullups":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pushups":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "situps":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cycling":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "other":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getExerciseName = (exerciseType: string) => {
    const exercise = exerciseTypes.find((ex) => ex.id === exerciseType);
    return exercise?.name || exerciseType;
  };

  const formatWorkoutDateTime = (workout: Workout) => {
    if (!workout.startTimeTimestamp) {
      return t("training.unknownDate");
    }

    try {
      const dateToFormat = new Date(workout.startTimeTimestamp);
      if (isNaN(dateToFormat.getTime())) {
        return t("training.unknownDate");
      }

      const locale = user?.languagePreference === "en" ? "en-US" : "de-DE";
      const timeFormat = user?.preferences?.timeFormat || "24h";

      return dateToFormat.toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: timeFormat === "12h",
      });
    } catch (error) {
      console.error("Date formatting error:", error, "Input:", workout);
      return t("training.unknownDate");
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return t("training.duration.hours", { hours, minutes: remainingMinutes });
    }
    return t("training.duration.minutes", { minutes });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">{t("training.mustBeLoggedIn")}</p>
      </div>
    );
  }

  return (
    <PageTemplate
      title={t("training.title", "Training Log")}
      subtitle={t(
        "training.subtitle",
        "Trage deine Workouts ein und verfolge deinen Fortschritt"
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="trainings">
            {t("training.trainingsDiary")}
          </TabsTrigger>
          <TabsTrigger value="recovery">
            {t("training.recoveryDiary")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <WorkoutForm
              workout={editingWorkout ?? undefined}
              onWorkoutCreated={handleWorkoutCreated}
              onWorkoutUpdated={handleWorkoutUpdated}
              onCancelEdit={handleCancelEdit}
            />

            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg md:text-xl">
                    {t("training.yourWorkouts")}
                  </CardTitle>
                  <Select value={filterType} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exerciseTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : workouts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      {filterType === "all"
                        ? t("training.noWorkouts")
                        : t("training.noWorkoutsForType", {
                            type: getExerciseName(filterType),
                          })}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t("training.createFirstWorkout", {
                        location:
                          window.innerWidth >= 1280
                            ? t("training.location.left")
                            : t("training.location.above"),
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground text-sm md:text-base truncate">
                                {workout.title}
                              </h3>
                              {workout.duration && (
                                <Badge variant="outline" className="text-xs">
                                  ⏱️ {formatDuration(workout.duration)}
                                </Badge>
                              )}
                            </div>

                            {workout.description && (
                              <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                                {workout.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1 mb-2">
                              {workout.activities.map((activity) => {
                                // Formatiere Sets für Anzeige: z.B. "3x10, 3x8, 3x12"
                                const formatSets = (
                                  sets: Array<{ reps: number; weight?: number }>
                                ) => {
                                  if (!sets || sets.length === 0) return null;
                                  return sets
                                    .map((set) => {
                                      const reps = set.reps || 0;
                                      const weight = set.weight;
                                      if (weight) {
                                        return `${reps}x${weight}kg`;
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
                                  <div
                                    key={activity.id}
                                    className="flex flex-col gap-1"
                                  >
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <Badge
                                        className={`text-xs ${getExerciseColor(activity.activityType)}`}
                                        variant="secondary"
                                      >
                                        {getExerciseIcon(activity.activityType)}{" "}
                                        {activity.amount} {activity.unit}
                                      </Badge>
                                      {setsDisplay && (
                                        <span className="text-xs text-muted-foreground">
                                          ({setsDisplay})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>📅 {formatWorkoutDateTime(workout)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isWorkoutEditable(workout) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(workout)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                                >
                                  <span className="hidden sm:inline">
                                    {t("training.edit")}
                                  </span>
                                  <span className="sm:hidden">✏️</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteWorkout(workout.id)}
                                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-shrink-0"
                                >
                                  <span className="hidden sm:inline">
                                    {t("training.delete")}
                                  </span>
                                  <span className="sm:hidden">×</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination - Mobile optimiert */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.hasPrev}
                          className="text-xs md:text-sm"
                        >
                          <span className="hidden sm:inline">
                            {t("training.previous")}
                          </span>
                          <span className="sm:hidden">←</span>
                        </Button>
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {pagination.currentPage}/{pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.hasNext}
                          className="text-xs md:text-sm"
                        >
                          <span className="hidden sm:inline">
                            {t("training.next")}
                          </span>
                          <span className="sm:hidden">→</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4 md:space-y-6">
          <TrainingDiarySection preselectedWorkoutId={createdWorkoutId} />
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={showRecoveryDialog}
        onOpenChange={setShowRecoveryDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("training.recoveryDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("training.recoveryDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRecoveryDialogCancel}>
              {t("training.recoveryDialog.noLater")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRecoveryDialogConfirm}>
              {t("training.recoveryDialog.yesDocument")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
