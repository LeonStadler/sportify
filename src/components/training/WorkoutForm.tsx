import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Exercise, ExerciseListResponse } from "@/types/exercise";
import type { Workout } from "@/types/workout";
import { convertWeightFromKg, convertWeightToKg } from "@/utils/units";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { CalendarIcon, Check, ChevronDown, Clock, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface WorkoutSet {
  reps: number;
  weight?: number; // Für Kraftübungen
  duration?: number;
  distance?: number;
  isDropSet?: boolean;
}

interface WorkoutActivity {
  activityType: string;
  totalAmount: number;
  unit: string;
  useSetMode: boolean; // Umschalten zwischen Gesamtmenge und Sets/Reps
  sets: WorkoutSet[];
  notes?: string;
  restBetweenSetsSeconds?: number;
  restAfterSeconds?: number;
  effort?: number;
  supersetGroup?: string;
  setDefaults?: {
    count: number;
    reps?: number;
    weight?: number;
  };
}

interface WorkoutFormProps {
  workout?: Workout;
  prefillWorkout?: Workout | null;
  onWorkoutCreated?: (workoutId?: string) => void;
  onWorkoutUpdated?: () => void;
  onCancelEdit?: () => void;
  onPrefillConsumed?: () => void;
  defaultIsTemplate?: boolean;
  forceTemplate?: boolean;
  hideTemplateToggle?: boolean;
}

export function WorkoutForm({
  workout,
  prefillWorkout,
  onWorkoutCreated,
  onWorkoutUpdated,
  onCancelEdit,
  onPrefillConsumed,
  defaultIsTemplate,
  forceTemplate,
  hideTemplateToggle,
}: WorkoutFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  const locale = useMemo(
    () => (i18n.language === "en" ? enUS : de),
    [i18n.language]
  );

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseFacets, setExerciseFacets] = useState<{
    categories: string[];
    muscleGroups: string[];
    equipment: string[];
  }>({ categories: [], muscleGroups: [], equipment: [] });

  // Automatischer Default-Titel basierend auf Tageszeit
  const getDefaultTitle = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("training.form.defaultTitles.morning");
    if (hour < 17) return t("training.form.defaultTitles.afternoon");
    return t("training.form.defaultTitles.evening");
  }, [t]);

  // Benutzereinstellungen für Distanzeinheiten
  const getUserDistanceUnit = () => {
    return user?.preferences?.units?.distance || "km";
  };
  const getUserWeightUnit = () => {
    return user?.preferences?.units?.weight || "kg";
  };

  const getDefaultUnitOptions = useCallback(
    (measurementType?: string | null) => {
      switch (measurementType) {
        case "distance":
          return [
            {
              value: "km",
              label: t("training.form.units.kilometers"),
              multiplier: 1,
            },
            {
              value: "m",
              label: t("training.form.units.meters"),
              multiplier: 0.001,
            },
            {
              value: "miles",
              label: t("training.form.units.miles"),
              multiplier: 1.609,
            },
          ];
        case "time":
          return [
            {
              value: "min",
              label: t("training.form.units.minutes", "Minuten"),
              multiplier: 1,
            },
            {
              value: "sec",
              label: t("training.form.units.seconds", "Sekunden"),
              multiplier: 1 / 60,
            },
          ];
        default:
          return [
            {
              value: "reps",
              label: t("training.form.units.repetitions"),
              multiplier: 1,
            },
          ];
      }
    },
    [t]
  );

  const loadExercises = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/exercises?limit=500`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Exercises load failed");
      }
      const data: ExerciseListResponse = await response.json();
      setExercises(Array.isArray(data.exercises) ? data.exercises : []);
      setExerciseFacets({
        categories: data.facets?.categories || [],
        muscleGroups: data.facets?.muscleGroups || [],
        equipment: data.facets?.equipment || [],
      });
    } catch (error) {
      console.error("Load exercises error:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadExercises();
    }
  }, [loadExercises, user]);

  const movementPatternOptions = useMemo(
    () => [
      { value: "push", label: t("training.form.patternPush", "Push") },
      { value: "pull", label: t("training.form.patternPull", "Pull") },
      { value: "legs", label: t("training.form.patternLegs", "Beine") },
      { value: "core", label: t("training.form.patternCore", "Core") },
      { value: "full", label: t("training.form.patternFull", "Ganzkörper") },
    ],
    [t]
  );

  const measurementTypeOptions = useMemo(
    () => [
      { value: "reps", label: t("training.form.measurementReps", "Wiederholungen") },
      { value: "time", label: t("training.form.measurementTime", "Zeit") },
      { value: "distance", label: t("training.form.measurementDistance", "Distanz") },
      { value: "weight", label: t("training.form.measurementWeight", "Gewicht") },
      { value: "mixed", label: t("training.form.measurementMixed", "Mixed") },
    ],
    [t]
  );

  const sessionTypeOptions = useMemo(
    () => [
      { value: "strength", label: t("training.form.sessionStrength", "Kraft") },
      { value: "cardio", label: t("training.form.sessionCardio", "Ausdauer") },
      { value: "mixed", label: t("training.form.sessionMixed", "Mixed") },
      { value: "mobility", label: t("training.form.sessionMobility", "Mobility") },
    ],
    [t]
  );

  // Workout-Grunddaten
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  const [workoutTime, setWorkoutTime] = useState(format(new Date(), "HH:mm"));
  const [duration, setDuration] = useState<string>(""); // in Minuten, optional
  const [endTime, setEndTime] = useState<string>(""); // Format: "HH:mm"
  const [useEndTime, setUseEndTime] = useState<boolean>(false); // Toggle zwischen Dauer und Endzeit
  const [difficulty, setDifficulty] = useState<number>(5);
  const [sessionType, setSessionType] = useState<string>("strength");
  const [rounds, setRounds] = useState<string>("1");
  const [restBetweenSetsSeconds, setRestBetweenSetsSeconds] = useState<string>("");
  const [restBetweenActivitiesSeconds, setRestBetweenActivitiesSeconds] = useState<string>("");
  const [restBetweenRoundsSeconds, setRestBetweenRoundsSeconds] = useState<string>("");
  const [visibility, setVisibility] = useState<"private" | "friends" | "public">("private");
  const [isTemplate, setIsTemplate] = useState<boolean>(defaultIsTemplate ?? false);
  const isTemplateLocked = forceTemplate === true;
  const getDefaultUnit = () => "reps";
  const getUnitLabel = useCallback(
    (unit: string | undefined, exercise?: Exercise | null) => {
      if (!unit) return t("training.form.units.repetitions");
      const unitOptions =
        exercise && exercise.unitOptions && exercise.unitOptions.length > 0
          ? exercise.unitOptions
          : getDefaultUnitOptions(exercise?.measurementType);
      const match = unitOptions.find((option) => option.value === unit);
      if (match) return match.label;
      if (unit === "reps") return t("training.form.units.repetitions");
      if (unit === "min") return t("training.form.units.minutes", "Minuten");
      if (unit === "sec") return t("training.form.units.seconds", "Sekunden");
      if (unit === "km") return t("training.form.units.kilometers");
      if (unit === "m") return t("training.form.units.meters");
      if (unit === "miles") return t("training.form.units.miles");
      return unit;
    },
    [getDefaultUnitOptions, t]
  );

  const normalizeUnitValue = (unit?: string | null) => {
    if (!unit) return getDefaultUnit();
    if (unit === "Wiederholungen") return "reps";
    return unit;
  };

  const supportsSetModeForExercise = (exercise?: Exercise | null) => {
    if (!exercise) return false;
    if (!exercise.supportsSets) return false;
    const measurementType = exercise.measurementType || "reps";
    return ["reps", "weight", "mixed"].includes(measurementType);
  };

  const getSetTotalAmount = (sets: WorkoutSet[]) => {
    const totalReps = sets.reduce((sum, set) => sum + (set.reps || 0), 0);
    if (totalReps > 0) return totalReps;
    const totalDuration = sets.reduce(
      (sum, set) => sum + (set.duration || 0),
      0
    );
    if (totalDuration > 0) return totalDuration;
    const totalDistance = sets.reduce(
      (sum, set) => sum + (set.distance || 0),
      0
    );
    if (totalDistance > 0) return totalDistance;
    const totalWeight = sets.reduce((sum, set) => sum + (set.weight || 0), 0);
    if (totalWeight > 0) return totalWeight;
    return 0;
  };
  
  const [activities, setActivities] = useState<WorkoutActivity[]>([
    {
    activityType: "",
    totalAmount: 0,
    unit: getDefaultUnit(),
    useSetMode: false,
    sets: [{ reps: 0 }],
      restBetweenSetsSeconds: undefined,
      restAfterSeconds: undefined,
      effort: undefined,
      supersetGroup: "",
      setDefaults: { count: 3, reps: 10 },
      notes: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTitleInitialized = useRef(false);
  const lastPrefillId = useRef<string | null>(null);

  useEffect(() => {
    if (isTemplateLocked && !isTemplate) {
      setIsTemplate(true);
    }
    if (!isTemplate && visibility !== "private") {
      setVisibility("private");
    }
  }, [isTemplate, isTemplateLocked, visibility]);

  // Berechne Endzeit aus Startzeit und Dauer
  const calculateEndTime = (start: string, dur: number): string => {
    if (!start || !dur || dur <= 0) return "";
    try {
      const [hours, minutes] = start.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + dur;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    } catch {
      return "";
    }
  };

  // Berechne Dauer aus Startzeit und Endzeit
  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    try {
      const [startHours, startMins] = start.split(":").map(Number);
      const [endHours, endMins] = end.split(":").map(Number);
      const startMinutes = startHours * 60 + startMins;
      const endMinutes = endHours * 60 + endMins;
      let duration = endMinutes - startMinutes;
      if (duration < 0) {
        // Wenn Endzeit am nächsten Tag ist
        duration = 24 * 60 + duration;
      }
      return duration;
    } catch {
      return 0;
    }
  };

  // Initialwerte setzen oder aktualisieren wenn ein Workout editiert wird
  useEffect(() => {
    if (workout) {
      setTitle(workout.title);
      setDescription(workout.description || "");
      const date = new Date(workout.workoutDate);
      setWorkoutDate(date);
      
      // Startzeit setzen (aus workout.startTime oder workout.workoutDate extrahieren)
      if (workout.startTime) {
        setWorkoutTime(workout.startTime);
      } else {
          setWorkoutTime(format(date, "HH:mm"));
      }
      
      // useEndTime aus Workout lesen
      const workoutUseEndTime = workout.useEndTime === true;
      setUseEndTime(workoutUseEndTime);

      if (workoutUseEndTime && workout.duration && workout.startTime) {
        // Wenn Endzeit-Modus: Endzeit aus Startzeit und Dauer berechnen
        const calculatedEndTime = calculateEndTime(
          workout.startTime,
          workout.duration
        );
        setEndTime(calculatedEndTime);
        setDuration(""); // Duration-Feld leeren
      } else {
        // Dauer-Modus: Dauer direkt setzen
        setDuration(workout.duration ? String(workout.duration) : "");
        setEndTime(""); // Endzeit-Feld leeren
      }
      setDifficulty(workout.difficulty ?? 5);
      setSessionType(workout.sessionType || "strength");
      setRounds(workout.rounds ? String(workout.rounds) : "1");
      setRestBetweenSetsSeconds(
        workout.restBetweenSetsSeconds !== undefined && workout.restBetweenSetsSeconds !== null
          ? String(workout.restBetweenSetsSeconds)
          : ""
      );
      setRestBetweenActivitiesSeconds(
        workout.restBetweenActivitiesSeconds !== undefined && workout.restBetweenActivitiesSeconds !== null
          ? String(workout.restBetweenActivitiesSeconds)
          : ""
      );
      setRestBetweenRoundsSeconds(
        workout.restBetweenRoundsSeconds !== undefined && workout.restBetweenRoundsSeconds !== null
          ? String(workout.restBetweenRoundsSeconds)
          : ""
      );
      
      setActivities(
        workout.activities.map((a) => ({
          activityType: a.activityType,
          totalAmount: a.amount,
          unit: normalizeUnitValue(a.unit),
          useSetMode: !!a.sets,
          sets:
            a.sets && a.sets.length > 0
              ? a.sets.map((s) => ({
                  ...s,
                  weight:
                    s.weight !== undefined
                      ? convertWeightFromKg(s.weight, getUserWeightUnit())
                      : undefined,
                }))
              : [{ reps: a.amount }],
          notes: a.notes || "",
          restBetweenSetsSeconds: a.restBetweenSetsSeconds ?? undefined,
          restAfterSeconds: a.restAfterSeconds ?? undefined,
          effort: a.effort ?? undefined,
          supersetGroup: a.supersetGroup || "",
          setDefaults: { count: a.sets?.length || 3, reps: a.sets?.[0]?.reps ?? 10 },
        }))
      );
      setVisibility(workout.visibility ?? "private");
      setIsTemplate(isTemplateLocked ? true : Boolean(workout.isTemplate));
      isTitleInitialized.current = true;
    } else {
      // Wenn kein Workout vorhanden ist und Titel noch nicht initialisiert wurde, Standard-Titel setzen
      if (!isTitleInitialized.current) {
        setTitle(getDefaultTitle());
        isTitleInitialized.current = true;
      }
      setVisibility("private");
      setIsTemplate(isTemplateLocked ? true : false);
    }
  }, [workout, getDefaultTitle, isTemplateLocked]);

  useEffect(() => {
    if (!workout && prefillWorkout && prefillWorkout.id !== lastPrefillId.current) {
      setTitle(prefillWorkout.title || getDefaultTitle());
      setDescription(prefillWorkout.description || "");
      setWorkoutDate(new Date());
      setWorkoutTime(format(new Date(), "HH:mm"));
      setDuration("");
      setEndTime("");
      setUseEndTime(false);
      setDifficulty(prefillWorkout.difficulty ?? 5);
      setSessionType(prefillWorkout.sessionType || "strength");
      setRounds(prefillWorkout.rounds ? String(prefillWorkout.rounds) : "1");
      setRestBetweenSetsSeconds(
        prefillWorkout.restBetweenSetsSeconds !== undefined && prefillWorkout.restBetweenSetsSeconds !== null
          ? String(prefillWorkout.restBetweenSetsSeconds)
          : ""
      );
      setRestBetweenActivitiesSeconds(
        prefillWorkout.restBetweenActivitiesSeconds !== undefined && prefillWorkout.restBetweenActivitiesSeconds !== null
          ? String(prefillWorkout.restBetweenActivitiesSeconds)
          : ""
      );
      setRestBetweenRoundsSeconds(
        prefillWorkout.restBetweenRoundsSeconds !== undefined && prefillWorkout.restBetweenRoundsSeconds !== null
          ? String(prefillWorkout.restBetweenRoundsSeconds)
          : ""
      );
      setVisibility("private");
      setIsTemplate(isTemplateLocked ? true : false);
      setActivities(
        prefillWorkout.activities.map((a) => ({
          activityType: a.activityType,
          totalAmount: a.amount,
          unit: normalizeUnitValue(a.unit),
          useSetMode: !!a.sets,
          sets:
            a.sets && a.sets.length > 0
              ? a.sets.map((s) => ({
                  ...s,
                  weight:
                    s.weight !== undefined
                      ? convertWeightFromKg(s.weight, getUserWeightUnit())
                      : undefined,
                }))
              : [{ reps: a.amount }],
          notes: a.notes || "",
          restBetweenSetsSeconds: a.restBetweenSetsSeconds ?? undefined,
          restAfterSeconds: a.restAfterSeconds ?? undefined,
          effort: a.effort ?? undefined,
          supersetGroup: a.supersetGroup || "",
          setDefaults: { count: a.sets?.length || 3, reps: a.sets?.[0]?.reps ?? 10 },
        }))
      );
      lastPrefillId.current = prefillWorkout.id;
      onPrefillConsumed?.();
    }
  }, [prefillWorkout, workout, getDefaultTitle, onPrefillConsumed, isTemplateLocked]);

  const addActivity = () => {
    setActivities([
      ...activities,
      {
      activityType: "",
      totalAmount: 0,
      unit: getDefaultUnit(),
      useSetMode: false,
      sets: [{ reps: 0 }],
      restBetweenSetsSeconds: undefined,
      restAfterSeconds: undefined,
      effort: undefined,
      supersetGroup: "",
      setDefaults: { count: 3, reps: 10 },
        notes: "",
      },
    ]);
  };

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index));
    }
  };

  const updateActivity = (
    index: number,
    field: keyof WorkoutActivity,
    value: string | number | boolean | WorkoutSet[] | undefined
  ) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    
    // Automatische Einheit setzen bei Aktivitätstyp-Änderung
    if (field === "activityType") {
      const exercise = exercises.find((ex) => ex.id === value);
      if (exercise) {
        const unitOptions =
          exercise.unitOptions && exercise.unitOptions.length > 0
            ? exercise.unitOptions
            : getDefaultUnitOptions(exercise.measurementType);

        const userUnit = getUserDistanceUnit();
        const preferredUnit =
          unitOptions.find((u) => {
            const value = u.value.toLowerCase();
            const target = userUnit.toLowerCase();
            if (value === target) return true;
            if (target === "miles" && value === "meilen") return true;
            if (target === "meilen" && value === "miles") return true;
            return false;
          }) || unitOptions[0];

        newActivities[index].unit = preferredUnit?.value || getDefaultUnit();
        const supportsWeight = Boolean(
          exercise.requiresWeight || exercise.allowsWeight
        );
        newActivities[index].sets = [
          { reps: 0, weight: supportsWeight ? undefined : undefined },
        ];
        newActivities[index].useSetMode = supportsSetModeForExercise(exercise);
        if (!newActivities[index].setDefaults) {
          newActivities[index].setDefaults = { count: 3, reps: 10 };
        }
        if (!supportsSetModeForExercise(exercise)) {
          newActivities[index].totalAmount = 0;
        }
      }
    }
    
    // Gesamtmenge bei Set-Änderungen berechnen
    if (
      field === "sets" &&
      newActivities[index].useSetMode &&
      Array.isArray(value)
    ) {
      newActivities[index].totalAmount = getSetTotalAmount(value);
    }
    
    setActivities(newActivities);
  };

  const addSet = (activityIndex: number) => {
    const newActivities = [...activities];
    const exercise = exercises.find(
      (ex) => ex.id === newActivities[activityIndex].activityType
    );
    const supportsWeight = Boolean(
      exercise?.requiresWeight || exercise?.allowsWeight
    );
    newActivities[activityIndex].sets.push({ 
      reps: 0, 
      weight: supportsWeight ? undefined : undefined,
    });
    setActivities(newActivities);
  };

  const updateSetDefaults = (
    activityIndex: number,
    field: "count" | "reps" | "weight",
    value: number
  ) => {
    const newActivities = [...activities];
    const currentDefaults = newActivities[activityIndex].setDefaults || {
      count: 3,
      reps: 10,
    };
    newActivities[activityIndex].setDefaults = {
      ...currentDefaults,
      [field]: value,
    };
    setActivities(newActivities);
  };

  const applySetDefaults = (activityIndex: number) => {
    const newActivities = [...activities];
    const activity = newActivities[activityIndex];
    const exercise = exercises.find((ex) => ex.id === activity.activityType);
    const defaults = activity.setDefaults || { count: 3, reps: 10 };
    const count = Math.max(1, Number(defaults.count) || 1);
    const supportsWeight = Boolean(
      exercise?.requiresWeight || exercise?.allowsWeight
    );
    const repsValue = Math.max(0, Number(defaults.reps) || 0);
    const weightValue = supportsWeight ? Number(defaults.weight) || 0 : undefined;

    activity.sets = Array.from({ length: count }).map(() => ({
      reps: repsValue,
      weight: supportsWeight ? weightValue : undefined,
      isDropSet: false,
    }));
    activity.useSetMode = true;
    activity.totalAmount = getSetTotalAmount(activity.sets);
    setActivities(newActivities);
  };

  const removeSet = (activityIndex: number, setIndex: number) => {
    const newActivities = [...activities];
    if (newActivities[activityIndex].sets.length > 1) {
      newActivities[activityIndex].sets.splice(setIndex, 1);
      // Gesamtmenge neu berechnen
      if (newActivities[activityIndex].useSetMode) {
        newActivities[activityIndex].totalAmount = getSetTotalAmount(
          newActivities[activityIndex].sets
        );
      }
      setActivities(newActivities);
    }
  };

  // Toggle-Handler für Dauer/Endzeit
  const handleToggleEndTime = (checked: boolean) => {
    setUseEndTime(checked);
    
    if (checked) {
      // Umschalten zu Endzeit-Modus: Wenn Dauer vorhanden, berechne Endzeit
      if (duration && workoutTime) {
        const parsedDuration = parseInt(duration);
        if (parsedDuration > 0) {
          const calculatedEndTime = calculateEndTime(
            workoutTime,
            parsedDuration
          );
          setEndTime(calculatedEndTime);
        }
      }
      setDuration(""); // Duration-Feld leeren
    } else {
      // Umschalten zu Dauer-Modus: Wenn Endzeit vorhanden, berechne Dauer
      if (endTime && workoutTime) {
        const calculatedDuration = calculateDuration(workoutTime, endTime);
        if (calculatedDuration > 0) {
          setDuration(String(calculatedDuration));
        }
      }
      setEndTime(""); // Endzeit-Feld leeren
    }
  };

  const updateSet = (
    activityIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: number | boolean
  ) => {
    const newActivities = [...activities];
    const prevSet = newActivities[activityIndex].sets[setIndex];
    newActivities[activityIndex].sets[setIndex] = {
      ...prevSet,
      [field]: value,
    };
    
    // Gesamtmenge neu berechnen
    if (newActivities[activityIndex].useSetMode) {
      newActivities[activityIndex].totalAmount = getSetTotalAmount(
        newActivities[activityIndex].sets
      );
    }

    if (field === "reps") {
      const isLastSet = setIndex === newActivities[activityIndex].sets.length - 1;
      if (isLastSet && (prevSet.reps || 0) === 0 && value > 0) {
        const exercise = exercises.find(
          (ex) => ex.id === newActivities[activityIndex].activityType
        );
        const supportsWeight = Boolean(
          exercise?.requiresWeight || exercise?.allowsWeight
        );
        newActivities[activityIndex].sets.push({
          reps: 0,
          weight: supportsWeight ? undefined : undefined,
        });
      }
    }
    
    setActivities(newActivities);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t("common.error"),
        description: t("training.form.mustBeLoggedIn"),
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: t("common.error"),
        description: t("training.form.titleRequired"),
        variant: "destructive",
      });
      return;
    }

    const normalizedActivities = activities.map((activity) => {
      if (activity.useSetMode && activity.sets && activity.sets.length > 0) {
        const cleanedSets = activity.sets.filter(
          (set) =>
            (set?.reps || 0) > 0 ||
            (set?.weight || 0) > 0 ||
            (set?.duration || 0) > 0 ||
            (set?.distance || 0) > 0
        );
        const totalAmount = getSetTotalAmount(cleanedSets);
        return { ...activity, sets: cleanedSets, totalAmount };
      }
      return activity;
    });

    // Validiere Aktivitäten
    const validActivities = normalizedActivities.filter((activity) => {
      if (!activity.activityType) return false;
      
      // Wenn Sets-Modus aktiviert ist, prüfe ob es gültige Sets gibt
      if (activity.useSetMode && activity.sets && activity.sets.length > 0) {
        const validSets = activity.sets.filter(
          (set) =>
            set &&
            ((set.reps || 0) > 0 ||
              (set.weight || 0) > 0 ||
              (set.duration || 0) > 0 ||
              (set.distance || 0) > 0)
        );
        return validSets.length > 0;
      }
      
      // Ansonsten prüfe die Gesamtmenge
      return activity.totalAmount > 0;
    });

    if (validActivities.length === 0) {
      toast({
        title: t("common.error"),
        description: t("training.form.activityRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
      // Datum und Uhrzeit kombinieren
      const [hours, minutes] = workoutTime.split(":").map(Number);
      const workoutDateTime = new Date(workoutDate);
      workoutDateTime.setHours(hours, minutes, 0, 0);

      // Berechne duration oder endTime basierend auf useEndTime
      let finalDuration: number | null = null;
      let finalEndTime: string | null = null;

      if (useEndTime && endTime) {
        // Endzeit-Modus: Berechne duration aus startTime und endTime
        const calculatedDuration = calculateDuration(workoutTime, endTime);
        if (calculatedDuration > 0) {
          finalDuration = calculatedDuration;
        }
        finalEndTime = endTime;
      } else if (duration) {
        // Dauer-Modus: Verwende direkt duration
        const parsedDuration = parseInt(duration);
        if (parsedDuration > 0) {
          finalDuration = parsedDuration;
        }
      }

      // Backend-Format: activities mit quantity statt amount
      const backendActivities = validActivities.map((activity) => {
        // Filtere ungültige Sets heraus (reps <= 0)
        let setsToSend = null;
        if (activity.useSetMode && activity.sets && activity.sets.length > 0) {
          const validSets = activity.sets.filter(
            (set) =>
              set &&
              ((set.reps || 0) > 0 ||
                (set.weight || 0) > 0 ||
                (set.duration || 0) > 0 ||
                (set.distance || 0) > 0)
          );
          if (validSets.length > 0) {
            const weightUnit = getUserWeightUnit();
            setsToSend = validSets.map((set) => ({
              ...set,
              weight:
                set.weight !== undefined
                  ? convertWeightToKg(set.weight, weightUnit)
                  : undefined,
            }));
          }
        }

        return {
          activityType: activity.activityType,
          quantity: activity.totalAmount, // Backend erwartet 'quantity'
          amount: activity.totalAmount, // Für Kompatibilität auch amount senden
          notes: activity.notes || null,
          sets: setsToSend,
          unit: activity.unit,
          restBetweenSetsSeconds: activity.restBetweenSetsSeconds ?? null,
          restAfterSeconds: activity.restAfterSeconds ?? null,
          effort: activity.effort ?? null,
          supersetGroup: activity.supersetGroup || null,
        };
      });

      const url = workout
        ? `${API_URL}/workouts/${workout.id}`
        : `${API_URL}/workouts`;
      const method = workout ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          activities: backendActivities,
          workoutDate: workoutDateTime.toISOString(),
          startTime: workoutTime,
          duration: finalDuration,
          endTime: finalEndTime,
          useEndTime: useEndTime,
          visibility: isTemplate ? visibility : "private",
          isTemplate,
          difficulty,
          sessionType,
          rounds: rounds ? Number(rounds) : 1,
          restBetweenSetsSeconds:
            restBetweenSetsSeconds !== "" ? Number(restBetweenSetsSeconds) : null,
          restBetweenActivitiesSeconds:
            restBetweenActivitiesSeconds !== ""
              ? Number(restBetweenActivitiesSeconds)
              : null,
          restBetweenRoundsSeconds:
            restBetweenRoundsSeconds !== "" ? Number(restBetweenRoundsSeconds) : null,
        }),
      });

      if (!response.ok) {
        let errorMessage = t("training.form.saveError");
        let errorDetails = "";
        try {
          const errorData = await response.json();
          console.error("Backend error:", errorData);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            errorDetails = errorData.details;
          }
          if (errorData.code) {
            errorDetails += errorDetails
              ? ` (Code: ${errorData.code})`
              : `Code: ${errorData.code}`;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMessage = `Server-Fehler (${response.status}): ${response.statusText}`;
        }
        const fullErrorMessage = errorDetails
          ? `${errorMessage}: ${errorDetails}`
          : errorMessage;
        throw new Error(fullErrorMessage);
      }

      const savedWorkout = await response.json();

      toast({
        title: workout
          ? t("training.form.workoutUpdated")
          : t("training.form.workoutCreated"),
        description: `${savedWorkout.title} ${t("training.form.workoutSavedSuccess")}`,
      });

      // Form zurücksetzen
      isTitleInitialized.current = false;
      setTitle(getDefaultTitle());
      setDescription("");
      setWorkoutDate(new Date());
      setWorkoutTime(format(new Date(), "HH:mm"));
      setDuration("");
      setEndTime("");
      setUseEndTime(false);
      setDifficulty(5);
      setSessionType("strength");
      setRounds("1");
      setRestBetweenSetsSeconds("");
      setRestBetweenActivitiesSeconds("");
      setRestBetweenRoundsSeconds("");
      setActivities([
        {
          activityType: "",
          totalAmount: 0,
          unit: getDefaultUnit(),
          useSetMode: false,
          sets: [{ reps: 0 }],
          restBetweenSetsSeconds: undefined,
          restAfterSeconds: undefined,
          effort: undefined,
          supersetGroup: "",
          setDefaults: { count: 3, reps: 10 },
          notes: "",
        },
      ]);

      if (workout) {
        onWorkoutUpdated?.();
      } else {
        onWorkoutCreated?.(savedWorkout.id);
      }
    } catch (error) {
      console.error("Save workout error:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("training.form.saveError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultExerciseFilters = {
    query: "",
    category: "all",
    movementPattern: "all",
    measurementType: "all",
    muscleGroup: "all",
    equipment: "all",
    requiresWeight: "all",
  };

  const getMeasurementLabel = (value?: string | null) =>
    measurementTypeOptions.find((option) => option.value === value)?.label ??
    value ??
    "-";

  const filterExercises = (
    source: Exercise[],
    filterState: typeof defaultExerciseFilters
  ) => {
    const query = filterState.query.trim().toLowerCase();
    return source.filter((exercise) => {
      if (filterState.category !== "all" && exercise.category !== filterState.category) {
        return false;
      }
      if (
        filterState.movementPattern !== "all" &&
        exercise.movementPattern !== filterState.movementPattern
      ) {
        return false;
      }
      if (
        filterState.measurementType !== "all" &&
        exercise.measurementType !== filterState.measurementType
      ) {
        return false;
      }
      if (
        filterState.muscleGroup !== "all" &&
        !(exercise.muscleGroups || []).includes(filterState.muscleGroup)
      ) {
        return false;
      }
      if (
        filterState.equipment !== "all" &&
        !(exercise.equipment || []).includes(filterState.equipment)
      ) {
        return false;
      }
      if (filterState.requiresWeight !== "all") {
        const requiresWeight = exercise.requiresWeight === true;
        if (filterState.requiresWeight === "yes" && !requiresWeight) {
          return false;
        }
        if (filterState.requiresWeight === "no" && requiresWeight) {
          return false;
        }
      }
      if (!query) return true;
      return (
        exercise.name?.toLowerCase().includes(query) ||
        exercise.slug?.toLowerCase().includes(query)
      );
    });
  };

  const ExercisePicker = ({
    value,
    onSelect,
  }: {
    value: string;
    onSelect: (exerciseId: string) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState(defaultExerciseFilters);
    const [showFilters, setShowFilters] = useState(false);
    const selectedExercise = exercises.find((exercise) => exercise.id === value) || null;

    const filtered = useMemo(
      () => filterExercises(exercises, filters),
      [exercises, filters]
    );

    const options = useMemo(() => {
      if (!selectedExercise) return filtered;
      if (filtered.some((exercise) => exercise.id === selectedExercise.id)) {
        return filtered;
      }
      return [selectedExercise, ...filtered];
    }, [filtered, selectedExercise]);

    const resetFilters = () => {
      setFilters(defaultExerciseFilters);
      setShowFilters(false);
    };

    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setFilters(defaultExerciseFilters);
            setShowFilters(false);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between mt-1"
          >
            {selectedExercise ? selectedExercise.name : t("training.form.selectExercise")}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground" />
              <CommandInput
                placeholder={t("training.form.searchExercise", "Übung suchen")}
                value={filters.query}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, query: value }))
                }
              />
            </div>

            {showFilters && (
              <div className="p-3 space-y-2 border-b bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("training.form.filterCategory", "Kategorie")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
                      {exerciseFacets.categories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.movementPattern}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, movementPattern: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("training.form.filterPattern", "Bewegung")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
                      {movementPatternOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.measurementType}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, measurementType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("training.form.filterType", "Einheitstyp")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
                      {measurementTypeOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.muscleGroup}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, muscleGroup: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("training.form.filterMuscle", "Muskel")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
                      {exerciseFacets.muscleGroups.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.equipment}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, equipment: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("training.form.filterEquipment", "Equipment")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
                      {exerciseFacets.equipment.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.requiresWeight}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, requiresWeight: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("training.form.filterWeight", "Gewicht")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
                      <SelectItem value="yes">
                        {t("training.form.filterWeightRequired", "Gewicht erforderlich")}
                      </SelectItem>
                      <SelectItem value="no">
                        {t("training.form.filterWeightOptional", "Kein Gewicht")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-foreground"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                {showFilters
                  ? t("training.form.hideFilters", "Filter ausblenden")
                  : t("training.form.showFilters", "Filter anzeigen")}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-foreground"
                onClick={resetFilters}
              >
                {t("filters.reset", "Filter zurücksetzen")}
              </button>
            </div>

            <CommandList className="max-h-[260px]">
              <CommandEmpty>
                {t("training.form.noExercises", "Keine Übungen gefunden")}
              </CommandEmpty>
              <CommandGroup heading={t("training.form.exerciseResults", "Übungen")}>
                {options.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => {
                      onSelect(exercise.id);
                      setOpen(false);
                    }}
                    className="flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {exercise.category || "-"} · {getMeasurementLabel(exercise.measurementType)}
                      </div>
                    </div>
                    {value === exercise.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl">
          {workout
            ? t("training.form.editWorkout")
            : t("training.form.newWorkout")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Zeile 1: Titel und Datum */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                {t("training.form.workoutTitle")}
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getDefaultTitle()}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                {t("training.form.dateRequired")}
              </Label>
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
                    {workoutDate
                      ? format(workoutDate, "PPP", { locale })
                      : t("training.form.selectDate")}
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
          </div>

          {/* Zeile 2: Uhrzeit und Dauer/Endzeit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time" className="text-sm font-medium">
                {useEndTime
                  ? t("training.form.startTime")
                  : t("training.form.timeRequired")}
              </Label>
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
            <div>
              {useEndTime ? (
                <>
                  <Label htmlFor="endTime" className="text-sm font-medium">
                    {t("training.form.endTime")}
                  </Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </>
              ) : (
                <>
                  <Label htmlFor="duration" className="text-sm font-medium">
                    {t("training.form.duration")}
                  </Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                    placeholder={t("training.form.durationPlaceholder")}
                  min="1"
                  className="mt-1"
                />
                </>
              )}
            </div>
          </div>

          {/* Zeile 3: Toggle Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="toggleEndTime"
              checked={useEndTime}
              onCheckedChange={handleToggleEndTime}
            />
            <Label htmlFor="toggleEndTime" className="text-sm cursor-pointer">
              {t("training.form.toggleDurationEndTime")}
            </Label>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              {t("training.form.description")}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("training.form.descriptionPlaceholder")}
              rows={2}
              className="w-full mt-1"
            />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  {t("training.form.sessionType", "Session Type")}
                </Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {t("training.form.difficulty", "Schwierigkeit")}
                </Label>
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(Math.min(10, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className="w-20"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  {t("training.form.rounds", "Runden")}
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  className="mt-1"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {t("training.form.restBetweenActivities", "Pause zwischen Übungen (Sek)")}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={restBetweenActivitiesSeconds}
                  onChange={(e) => setRestBetweenActivitiesSeconds(e.target.value)}
                  className="mt-1"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {t("training.form.restBetweenRounds", "Pause zwischen Runden (Sek)")}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={restBetweenRoundsSeconds}
                  onChange={(e) => setRestBetweenRoundsSeconds(e.target.value)}
                  className="mt-1"
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  {t("training.form.restBetweenSets", "Standard Pause zwischen Sätzen (Sek)")}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={restBetweenSetsSeconds}
                  onChange={(e) => setRestBetweenSetsSeconds(e.target.value)}
                  className="mt-1"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {!hideTemplateToggle && !isTemplateLocked && (
              <div className="flex items-center gap-3">
                <Switch
                  id="template-flag"
                  checked={isTemplate}
                  onCheckedChange={setIsTemplate}
                />
                <Label htmlFor="template-flag" className="text-sm cursor-pointer">
                  {t("training.form.saveAsTemplate", "Als Vorlage speichern")}
                </Label>
              </div>
            )}
            {isTemplate && (
              <div>
                <Label className="text-sm font-medium">
                  {t("training.form.visibility", "Sichtbarkeit")}
                </Label>
                <Select
                  value={visibility}
                  onValueChange={(value) =>
                    setVisibility(value as "private" | "friends" | "public")
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      {t("training.form.visibilityPrivate", "Private")}
                    </SelectItem>
                    <SelectItem value="friends">
                      {t("training.form.visibilityFriends", "Friends")}
                    </SelectItem>
                    <SelectItem value="public">
                      {t("training.form.visibilityPublic", "Public")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Aktivitäten */}
          <div>
            <Label className="text-sm font-medium">
              {t("training.form.activitiesRequired")}
            </Label>
            <div className="space-y-4 mt-2">
              {activities.map((activity, index) => {
                const exercise = exercises.find(
                  (ex) => ex.id === activity.activityType
                );
                
                return (
                  <div
                    key={index}
                    className="p-3 md:p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("training.form.activity")} {index + 1}
                      </span>
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
                        <Label className="text-xs md:text-sm">
                          {t("training.form.exercise")}
                        </Label>
                        <ExercisePicker
                          value={activity.activityType}
                          onSelect={(value) =>
                            updateActivity(index, "activityType", value)
                          }
                        />
                      </div>

                      {exercise && (
          <div>
                          <Label className="text-xs md:text-sm">
                            {t("training.form.unit")}
                          </Label>
                          <Select 
                            value={activity.unit} 
                            onValueChange={(value) =>
                              updateActivity(index, "unit", value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(exercise.unitOptions && exercise.unitOptions.length > 0
                                ? exercise.unitOptions
                                : getDefaultUnitOptions(exercise.measurementType)
                              ).map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs md:text-sm">
                          {t("training.form.supersetGroup", "Superset")}
                        </Label>
                        <Input
                          value={activity.supersetGroup || ""}
                          onChange={(e) =>
                            updateActivity(index, "supersetGroup", e.target.value)
                          }
                          placeholder={t("training.form.supersetGroupPlaceholder", "z.B. A")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs md:text-sm">
                          {t("training.form.effort", "Effort (1-10)")}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={activity.effort ?? ""}
                          onChange={(e) =>
                            updateActivity(
                              index,
                              "effort",
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="mt-1"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <Label className="text-xs md:text-sm">
                          {t("training.form.restBetweenSetsOverride", "Pause zwischen Sätzen (Sek)")}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={activity.restBetweenSetsSeconds ?? ""}
                          onChange={(e) =>
                            updateActivity(
                              index,
                              "restBetweenSetsSeconds",
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value, 10) || 0
                            )
                          }
                          placeholder={
                            restBetweenSetsSeconds
                              ? restBetweenSetsSeconds
                              : t("training.form.restBetweenSets", "Standard Pause")
                          }
                          className="mt-1"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs md:text-sm">
                          {t("training.form.restAfterActivity", "Pause nach Übung (Sek)")}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={activity.restAfterSeconds ?? ""}
                          onChange={(e) =>
                            updateActivity(
                              index,
                              "restAfterSeconds",
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="mt-1"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    {/* Sets/Reps oder Gesamtmenge Toggle */}
                    {exercise && supportsSetModeForExercise(exercise) && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`setMode-${index}`}
                          checked={activity.useSetMode}
                          onCheckedChange={(checked) =>
                            updateActivity(index, "useSetMode", checked)
                          }
                        />
                        <Label htmlFor={`setMode-${index}`} className="text-sm">
                          {t("training.form.useSetsReps")}
                        </Label>
                      </div>
                    )}

                    {/* Eingabe je nach Modus */}
                    {activity.useSetMode && exercise ? (
                      // Sets & Reps Modus
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          {t("training.form.sets")}
                        </Label>
                        <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            {t("training.form.setDefaults", "Sätze schnell anlegen")}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={activity.setDefaults?.count ?? 3}
                              onChange={(e) =>
                                updateSetDefaults(
                                  index,
                                  "count",
                                  parseInt(e.target.value, 10) || 1
                                )
                              }
                              placeholder={t("training.form.setCount", "Sätze")}
                              inputMode="numeric"
                            />
                            <Input
                              type="number"
                              min="0"
                              value={activity.setDefaults?.reps ?? ""}
                              onChange={(e) =>
                                updateSetDefaults(
                                  index,
                                  "reps",
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              placeholder={t("training.form.reps", "Wdh")}
                              inputMode="numeric"
                            />
                            {(exercise.requiresWeight || exercise.allowsWeight) && (
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={activity.setDefaults?.weight ?? ""}
                                onChange={(e) =>
                                  updateSetDefaults(
                                    index,
                                    "weight",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder={getUserWeightUnit()}
                                inputMode="decimal"
                              />
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applySetDefaults(index)}
                          >
                            {t("training.form.applySetDefaults", "Sätze anlegen")}
                          </Button>
                        </div>
                        {activity.sets.map((set, setIndex) => (
                          <div
                            key={setIndex}
                            className="flex gap-2 items-center"
                          >
                            <span className="text-sm w-12">
                              {t("training.form.set")} {setIndex + 1}:
                            </span>
                            <div className="flex gap-2 flex-1">
                              <Input
                                type="number"
                                placeholder={t("training.form.reps")}
                                value={set.reps || ""}
                                onChange={(e) =>
                                  updateSet(
                                    index,
                                    setIndex,
                                    "reps",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="flex-1"
                                min="0"
                                inputMode="numeric"
                              />
                              {(exercise.requiresWeight || exercise.allowsWeight) && (
                                <Input
                                  type="number"
                                  placeholder={getUserWeightUnit()}
                                  value={set.weight || ""}
                                  onChange={(e) =>
                                    updateSet(
                                      index,
                                      setIndex,
                                      "weight",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="flex-1"
                                  min="0"
                                  step="0.5"
                                  inputMode="decimal"
                                />
                              )}
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={set.isDropSet || false}
                                  onCheckedChange={(checked) =>
                                    updateSet(index, setIndex, "isDropSet", checked)
                                  }
                                />
                                <span className="text-xs text-muted-foreground">
                                  {t("training.form.dropSet", "Dropset")}
                                </span>
                              </div>
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
                          {t("training.form.addSet")}
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          {t("training.form.total")}: {activity.totalAmount}{" "}
                          {getUnitLabel(activity.unit, exercise)}
                        </div>
                      </div>
                    ) : (
                      // Gesamtmenge Modus
                      <div>
                        <Label className="text-xs md:text-sm">
                          {exercise?.measurementType === "time"
                            ? t("training.form.totalDuration", "Dauer")
                            : exercise?.measurementType === "distance"
                              ? t("training.form.totalDistance", "Distanz")
                              : t("training.form.totalAmount")}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step={
                            exercise?.unitOptions[0]?.value === "km" ||
                            exercise?.unitOptions[0]?.value === "m"
                              ? "0.1"
                              : "1"
                          }
                          value={activity.totalAmount || ""}
                          onChange={(e) =>
                            updateActivity(
                              index,
                              "totalAmount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="mt-1"
                          inputMode="decimal"
                        />
                        {exercise && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {getUnitLabel(activity.unit, exercise)}
                          </p>
                        )}
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
              {t("training.form.addActivity")}
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-sm md:text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("training.form.saving") : t("training.form.save")}
          </Button>
          {workout && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              className="w-full mt-2 text-sm"
            >
              {t("training.form.cancel")}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
