import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Workout } from '@/types/workout';

interface WorkoutSet {
  reps: number;
  weight?: number; // Für Kraftübungen
}

interface WorkoutActivity {
  activityType: string;
  totalAmount: number;
  unit: string;
  useSetMode: boolean; // Umschalten zwischen Gesamtmenge und Sets/Reps
  sets: WorkoutSet[];
  notes?: string;
}

interface WorkoutFormProps {
  workout?: Workout;
  onWorkoutCreated?: (workoutId?: string) => void;
  onWorkoutUpdated?: () => void;
  onCancelEdit?: () => void;
}

export function WorkoutForm({ workout, onWorkoutCreated, onWorkoutUpdated, onCancelEdit }: WorkoutFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  const locale = useMemo(() => (i18n.language === 'en' ? enUS : de), [i18n.language]);

  // Aktivitätstypen mit fixen Einheiten und verschiedenen Größenordnungen
  const exerciseTypes = useMemo(() => [
    { 
      id: "pullups", 
      name: t('training.pullups'), 
      hasWeight: false, 
      hasSetMode: true,
      unitOptions: [
        { value: "Wiederholungen", label: t('training.form.units.repetitions'), multiplier: 1 }
      ]
    },
    { 
      id: "pushups", 
      name: t('training.pushups'), 
      hasWeight: false, 
      hasSetMode: true,
      unitOptions: [
        { value: "Wiederholungen", label: t('training.form.units.repetitions'), multiplier: 1 }
      ]
    },
    { 
      id: "situps", 
      name: t('training.situps'), 
      hasWeight: false, 
      hasSetMode: true,
      unitOptions: [
        { value: "Wiederholungen", label: t('training.form.units.repetitions'), multiplier: 1 }
      ]
    },
    { 
      id: "running", 
      name: t('training.running'), 
      hasWeight: false, 
      hasSetMode: false,
      unitOptions: [
        { value: "km", label: t('training.form.units.kilometers'), multiplier: 1 },
        { value: "m", label: t('training.form.units.meters'), multiplier: 0.001 },
        { value: "Meilen", label: t('training.form.units.miles'), multiplier: 1.609 }
      ]
    },
    { 
      id: "cycling", 
      name: t('training.cycling'), 
      hasWeight: false, 
      hasSetMode: false,
      unitOptions: [
        { value: "km", label: t('training.form.units.kilometers'), multiplier: 1 },
        { value: "m", label: t('training.form.units.meters'), multiplier: 0.001 },
        { value: "Meilen", label: t('training.form.units.miles'), multiplier: 1.609 }
      ]
    },
    { 
      id: "other", 
      name: t('training.other'), 
      hasWeight: false, 
      hasSetMode: true,
      unitOptions: [
        { value: "Einheiten", label: t('training.form.units.units'), multiplier: 1 }
      ]
    }
  ], [t]);

  // Automatischer Default-Titel basierend auf Tageszeit
  const getDefaultTitle = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('training.form.defaultTitles.morning');
    if (hour < 17) return t('training.form.defaultTitles.afternoon');
    return t('training.form.defaultTitles.evening');
  };

  // Benutzereinstellungen für Distanzeinheiten
  const getUserDistanceUnit = () => {
    return user?.preferences?.units?.distance || 'km';
  };

  // Workout-Grunddaten
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  const [workoutTime, setWorkoutTime] = useState(format(new Date(), "HH:mm"));
  const [duration, setDuration] = useState<string>(""); // in Minuten, optional
  const getDefaultUnit = () => t('training.form.units.repetitions');
  
  const [activities, setActivities] = useState<WorkoutActivity[]>([{
    activityType: "",
    totalAmount: 0,
    unit: getDefaultUnit(),
    useSetMode: false,
    sets: [{ reps: 0 }],
    notes: ""
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTitleInitialized = useRef(false);

  // Initialwerte setzen oder aktualisieren wenn ein Workout editiert wird
  useEffect(() => {
    if (workout) {
      setTitle(workout.title);
      setDescription(workout.description || "");
      const date = new Date(workout.workoutDate);
      setWorkoutDate(date);
      setWorkoutTime(format(date, "HH:mm"));
      setDuration(workout.duration ? String(workout.duration) : "");
      setActivities(
        workout.activities.map((a) => ({
          activityType: a.activityType,
          totalAmount: a.amount,
          unit: a.unit,
          useSetMode: !!a.sets,
          sets: a.sets && a.sets.length > 0 ? a.sets.map((s) => ({ ...s })) : [{ reps: a.amount }],
          notes: a.notes || "",
        }))
      );
      isTitleInitialized.current = true;
    } else {
      // Wenn kein Workout vorhanden ist und Titel noch nicht initialisiert wurde, Standard-Titel setzen
      if (!isTitleInitialized.current) {
        setTitle(getDefaultTitle());
        isTitleInitialized.current = true;
      }
    }
  }, [workout]);

  const addActivity = () => {
    setActivities([...activities, {
      activityType: "",
      totalAmount: 0,
      unit: getDefaultUnit(),
      useSetMode: false,
      sets: [{ reps: 0 }],
      notes: ""
    }]);
  };

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index));
    }
  };

  const updateActivity = (index: number, field: keyof WorkoutActivity, value: string | number | boolean | WorkoutSet[]) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    
    // Automatische Einheit setzen bei Aktivitätstyp-Änderung
    if (field === 'activityType') {
      const exercise = exerciseTypes.find(ex => ex.id === value);
      if (exercise) {
        // Für Laufen/Radfahren: Benutzereinstellungen verwenden
        if (exercise.id === 'running' || exercise.id === 'cycling') {
          const userUnit = getUserDistanceUnit();
          const unitOption = exercise.unitOptions.find(u => u.value === userUnit) || exercise.unitOptions[0];
          newActivities[index].unit = unitOption.value;
        } else {
          newActivities[index].unit = exercise.unitOptions[0].value;
        }
        newActivities[index].sets = [{ reps: 0, weight: exercise.hasWeight ? 0 : undefined }];
        // Standard ist useSetMode: false (Total-Modus)
        newActivities[index].useSetMode = false;
      }
    }
    
    // Gesamtmenge bei Set-Änderungen berechnen
    if (field === 'sets' && newActivities[index].useSetMode && Array.isArray(value)) {
      const totalReps = value.reduce((sum: number, set: WorkoutSet) => sum + set.reps, 0);
      newActivities[index].totalAmount = totalReps;
    }
    
    setActivities(newActivities);
  };

  const addSet = (activityIndex: number) => {
    const newActivities = [...activities];
    const exercise = exerciseTypes.find(ex => ex.id === newActivities[activityIndex].activityType);
    newActivities[activityIndex].sets.push({ 
      reps: 0, 
      weight: exercise?.hasWeight ? 0 : undefined 
    });
    setActivities(newActivities);
  };

  const removeSet = (activityIndex: number, setIndex: number) => {
    const newActivities = [...activities];
    if (newActivities[activityIndex].sets.length > 1) {
      newActivities[activityIndex].sets.splice(setIndex, 1);
      // Gesamtmenge neu berechnen
      if (newActivities[activityIndex].useSetMode) {
        const totalReps = newActivities[activityIndex].sets.reduce((sum, set) => sum + set.reps, 0);
        newActivities[activityIndex].totalAmount = totalReps;
      }
      setActivities(newActivities);
    }
  };

  const updateSet = (activityIndex: number, setIndex: number, field: keyof WorkoutSet, value: number) => {
    const newActivities = [...activities];
    newActivities[activityIndex].sets[setIndex] = {
      ...newActivities[activityIndex].sets[setIndex],
      [field]: value
    };
    
    // Gesamtmenge neu berechnen
    if (newActivities[activityIndex].useSetMode) {
      const totalReps = newActivities[activityIndex].sets.reduce((sum, set) => sum + set.reps, 0);
      newActivities[activityIndex].totalAmount = totalReps;
    }
    
    setActivities(newActivities);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('training.form.mustBeLoggedIn'),
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: t('common.error'), 
        description: t('training.form.titleRequired'),
        variant: "destructive",
      });
      return;
    }

    // Validiere Aktivitäten
    const validActivities = activities.filter(activity => {
      if (!activity.activityType) return false;
      
      // Wenn Sets-Modus aktiviert ist, prüfe ob es gültige Sets gibt
      if (activity.useSetMode && activity.sets && activity.sets.length > 0) {
        const validSets = activity.sets.filter(set => set && (set.reps || 0) > 0);
        return validSets.length > 0;
      }
      
      // Ansonsten prüfe die Gesamtmenge
      return activity.totalAmount > 0;
    });

    if (validActivities.length === 0) {
      toast({
        title: t('common.error'),
        description: t('training.form.activityRequired'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Datum und Uhrzeit kombinieren
      const [hours, minutes] = workoutTime.split(':').map(Number);
      const workoutDateTime = new Date(workoutDate);
      workoutDateTime.setHours(hours, minutes, 0, 0);

      // Backend-Format: activities mit quantity statt amount
      const backendActivities = validActivities.map(activity => {
        // Filtere ungültige Sets heraus (reps <= 0)
        let setsToSend = null;
        if (activity.useSetMode && activity.sets && activity.sets.length > 0) {
          const validSets = activity.sets.filter(set => set && (set.reps || 0) > 0);
          if (validSets.length > 0) {
            setsToSend = validSets;
          }
        }

        return {
          activityType: activity.activityType,
          quantity: activity.totalAmount, // Backend erwartet 'quantity'
          amount: activity.totalAmount, // Für Kompatibilität auch amount senden
          notes: activity.notes || null,
          sets: setsToSend,
          unit: activity.unit
        };
      });

      console.log('Sending workout data:', {
        title: title.trim(),
        description: description.trim() || null,
        activities: backendActivities,
        workoutDate: workoutDateTime.toISOString(),
        duration: duration ? parseInt(duration) : null,
      });

      const url = workout ? `${API_URL}/workouts/${workout.id}` : `${API_URL}/workouts`;
      const method = workout ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          activities: backendActivities,
          workoutDate: workoutDateTime.toISOString(),
          duration: duration ? parseInt(duration) : null,
        }),
      });

      if (!response.ok) {
        let errorMessage = t('training.form.saveError');
        let errorDetails = '';
        try {
          const errorData = await response.json();
          console.error('Backend error:', errorData);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            errorDetails = errorData.details;
          }
          if (errorData.code) {
            errorDetails += errorDetails ? ` (Code: ${errorData.code})` : `Code: ${errorData.code}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Server-Fehler (${response.status}): ${response.statusText}`;
        }
        const fullErrorMessage = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
        throw new Error(fullErrorMessage);
      }

      const savedWorkout = await response.json();
      console.log('Workout saved successfully:', savedWorkout);

      toast({
        title: workout ? t('training.form.workoutUpdated') : t('training.form.workoutCreated'),
        description: `${savedWorkout.title} ${t('training.form.workoutSavedSuccess')}`,
      });

      // Form zurücksetzen
      isTitleInitialized.current = false;
      setTitle(getDefaultTitle());
      setDescription("");
      setWorkoutDate(new Date());
      setWorkoutTime(format(new Date(), "HH:mm"));
      setDuration("");
      setActivities([
        {
          activityType: "",
          totalAmount: 0,
          unit: getDefaultUnit(),
          useSetMode: false,
          sets: [{ reps: 0 }],
          notes: "",
        },
      ]);

      if (workout) {
        onWorkoutUpdated?.();
      } else {
        onWorkoutCreated?.(savedWorkout.id);
      }

    } catch (error) {
      console.error('Save workout error:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('training.form.saveError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl">
          {workout ? t('training.form.editWorkout') : t('training.form.newWorkout')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workout-Grunddaten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">{t('training.form.workoutTitle')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getDefaultTitle()}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm font-medium">{t('training.form.duration')}</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={t('training.form.durationPlaceholder')}
                min="1"
                className="mt-1"
              />
            </div>
          </div>

          {/* Datum und Uhrzeit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">{t('training.form.dateRequired')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !workoutDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {workoutDate ? format(workoutDate, "PPP", { locale }) : t('training.form.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={workoutDate}
                    onSelect={(date) => date && setWorkoutDate(date)}
                    initialFocus
                    locale={locale}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="time" className="text-sm font-medium">{t('training.form.timeRequired')}</Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={workoutTime}
                  onChange={(e) => setWorkoutTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">{t('training.form.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('training.form.descriptionPlaceholder')}
              rows={2}
              className="w-full mt-1"
            />
          </div>

          {/* Aktivitäten */}
          <div>
            <Label className="text-sm font-medium">{t('training.form.activitiesRequired')}</Label>
            <div className="space-y-4 mt-2">
              {activities.map((activity, index) => {
                const exercise = exerciseTypes.find(ex => ex.id === activity.activityType);
                
                return (
                  <div key={index} className="p-3 md:p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('training.form.activity')} {index + 1}</span>
                      {activities.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeActivity(index)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Aktivitätstyp und Einheit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs md:text-sm">{t('training.form.exercise')}</Label>
                        <Select 
                          value={activity.activityType} 
                          onValueChange={(value) => updateActivity(index, 'activityType', value)}
                        >
                          <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('training.form.selectExercise')} />
              </SelectTrigger>
              <SelectContent>
                            {exerciseTypes.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                      {exercise && (
          <div>
                          <Label className="text-xs md:text-sm">{t('training.form.unit')}</Label>
                          <Select 
                            value={activity.unit} 
                            onValueChange={(value) => updateActivity(index, 'unit', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {exercise.unitOptions.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Sets/Reps oder Gesamtmenge Toggle */}
                    {exercise && exercise.hasSetMode && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`setMode-${index}`}
                          checked={activity.useSetMode}
                          onCheckedChange={(checked) => updateActivity(index, 'useSetMode', checked)}
                        />
                        <Label htmlFor={`setMode-${index}`} className="text-sm">
                          {t('training.form.useSetsReps')}
                        </Label>
                      </div>
                    )}

                    {/* Eingabe je nach Modus */}
                    {activity.useSetMode && exercise ? (
                      // Sets & Reps Modus
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">{t('training.form.sets')}</Label>
                        {activity.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex gap-2 items-center">
                            <span className="text-sm w-12">{t('training.form.set')} {setIndex + 1}:</span>
                            <div className="flex gap-2 flex-1">
                              <Input
                                type="number"
                                placeholder={t('training.form.reps')}
                                value={set.reps || ""}
                                onChange={(e) => updateSet(index, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                className="flex-1"
                                min="0"
                              />
                              {exercise.hasWeight && (
                                <Input
                                  type="number"
                                  placeholder={`${activity.unit}`}
                                  value={set.weight || ""}
                                  onChange={(e) => updateSet(index, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                  className="flex-1"
                                  min="0"
                                  step="0.5"
                                />
                              )}
                            </div>
                            {activity.sets.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSet(index, setIndex)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSet(index)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('training.form.addSet')}
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          {t('training.form.total')}: {activity.totalAmount} {activity.unit}
                        </div>
                      </div>
                    ) : (
                      // Gesamtmenge Modus
                      <div>
                        <Label className="text-xs md:text-sm">{t('training.form.totalAmount')}</Label>
                        <Input
                          type="number"
                          min="0"
                          step={exercise?.unitOptions[0]?.value === "km" || exercise?.unitOptions[0]?.value === "m" ? "0.1" : "1"}
                          value={activity.totalAmount || ""}
                          onChange={(e) => updateActivity(index, 'totalAmount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addActivity}
              className="w-full mt-3 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('training.form.addActivity')}
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-sm md:text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('training.form.saving') : t('training.form.save')}
          </Button>
          {workout && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              className="w-full mt-2 text-sm"
            >
              {t('training.form.cancel')}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
