import { WorkoutForm } from "@/components/WorkoutForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";

interface WorkoutActivity {
  id: string;
  activityType: string;
  amount: number;
  unit: string;
  notes?: string;
  sets?: Array<{
    reps: number;
    weight?: number;
  }>;
}

interface Workout {
  id: string;
  title: string;
  description?: string;
  workoutDate: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  activities: WorkoutActivity[];
}

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
  const { toast } = useToast();
  const { user } = useAuth();

  const exerciseTypes = [
    { id: "all", name: "Alle Übungen" },
    { id: "pullups", name: "Klimmzüge" },
    { id: "pushups", name: "Liegestütze" },
    { id: "running", name: "Laufen" },
    { id: "cycling", name: "Radfahren" },
    { id: "situps", name: "Sit-ups" },
    { id: "other", name: "Sonstiges" },
  ];

  const loadWorkouts = useCallback(async (page = 1, type = "all") => {
    if (!user) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(type !== "all" && { type }),
      });

      console.log('Loading workouts with params:', params.toString());

      const response = await fetch(`http://localhost:3001/api/workouts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Workouts');
      }

      const data: WorkoutResponse = await response.json();
      console.log('Loaded workouts:', data);
      setWorkouts(data.workouts);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Load workouts error:', error);
      toast({
        title: "Fehler",
        description: "Workouts konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadWorkouts(1, filterType);
  }, [loadWorkouts, filterType]);

  const handleWorkoutCreated = () => {
    // Lade die erste Seite neu um das neue Workout zu zeigen
    loadWorkouts(1, filterType);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    loadWorkouts(page, filterType);
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm('Möchtest du dieses Workout wirklich löschen?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/workouts/${workoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Workouts');
      }

      toast({
        title: "Workout gelöscht",
        description: "Das Workout wurde erfolgreich gelöscht.",
      });

      loadWorkouts(currentPage, filterType);
    } catch (error) {
      console.error('Delete workout error:', error);
      toast({
        title: "Fehler",
        description: "Workout konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  // Prüfe ob Workout bearbeitbar ist (jünger als 7 Tage)
  const isWorkoutEditable = (workoutDate: string, createdAt: string) => {
    const dateToCheck = workoutDate || createdAt;
    if (!dateToCheck) return false;
    
    const workoutDateTime = new Date(dateToCheck);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - workoutDateTime.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffInDays <= 7;
  };

  const getExerciseIcon = (exerciseType: string) => {
    switch (exerciseType) {
      case "pullups": return "💪";
      case "pushups": return "🔥";
      case "situps": return "🚀";
      case "running": return "🏃";
      case "cycling": return "🚴";
      case "other": return "🔗";
      default: return "💪";
    }
  };

  const getExerciseColor = (exerciseType: string) => {
    switch (exerciseType) {
      case "pullups": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pushups": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "situps": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "running": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cycling": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "other": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getExerciseName = (exerciseType: string) => {
    const exercise = exerciseTypes.find(ex => ex.id === exerciseType);
    return exercise?.name || exerciseType;
  };

  // Datum- und Uhrzeitformatierung basierend auf Benutzereinstellungen
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unbekanntes Datum";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Vor wenigen Minuten";
      if (diffInHours < 24) return `Vor ${diffInHours} Stunden`;
      if (diffInHours < 48) return "Gestern";
      
      const locale = user?.languagePreference === 'en' ? 'en-US' : 'de-DE';
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return "Invalid Date";
    }
  };

  const formatWorkoutDateTime = (dateString: string) => {
    if (!dateString) return "Unbekanntes Datum";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      const locale = user?.languagePreference === 'en' ? 'en-US' : 'de-DE';
      const timeFormat = user?.preferences?.timeFormat || '24h';
      
      return date.toLocaleString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: timeFormat === '12h',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return "Invalid Date";
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes}min`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Du musst angemeldet sein, um Workouts zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Training Log</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">Trage deine Workouts ein und verfolge deinen Fortschritt</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
        <WorkoutForm onWorkoutCreated={handleWorkoutCreated} />

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg md:text-xl">Deine Workouts</CardTitle>
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
                    ? "Noch keine Workouts vorhanden." 
                    : `Keine Workouts für ${getExerciseName(filterType)} gefunden.`
                  }
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Erstelle dein erstes Workout mit dem Formular {window.innerWidth >= 1280 ? 'links' : 'oben'}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <div key={workout.id} className="p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground text-sm md:text-base truncate">{workout.title}</h3>
                          {workout.duration && (
                            <Badge variant="outline" className="text-xs">
                              ⏱️ {formatDuration(workout.duration)}
                            </Badge>
                          )}
                        </div>
                        
                        {workout.description && (
                          <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">{workout.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {workout.activities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-1">
                              <Badge 
                                className={`text-xs ${getExerciseColor(activity.activityType)}`}
                                variant="secondary"
                              >
                                {getExerciseIcon(activity.activityType)} {activity.amount} {activity.unit}
                        </Badge>
                              {activity.sets && activity.sets.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({activity.sets.length} Sets)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>📅 {workout.workoutDate ? formatWorkoutDateTime(workout.workoutDate) : formatDate(workout.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isWorkoutEditable(workout.workoutDate, workout.createdAt) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* TODO: Edit-Funktionalität implementieren */}}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                            >
                              <span className="hidden sm:inline">Bearbeiten</span>
                              <span className="sm:hidden">✏️</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteWorkout(workout.id)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-shrink-0"
                            >
                              <span className="hidden sm:inline">Löschen</span>
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
                      <span className="hidden sm:inline">Vorherige</span>
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
                      <span className="hidden sm:inline">Nächste</span>
                      <span className="sm:hidden">→</span>
                    </Button>
                  </div>
                )}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
