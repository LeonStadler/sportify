import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DEFAULT_WEEKLY_POINTS_GOAL } from "@/config/events";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import type { Exercise, ExerciseListResponse } from "@/types/exercise";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { WeeklyGoals, WeeklyGoalsForm } from "./WeeklyGoalsForm";

interface WeeklyGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: WeeklyGoals;
  onSave: (goals: WeeklyGoals) => Promise<void>;
  showPoints?: boolean;
}

export type { WeeklyGoals };

export function WeeklyGoalsDialog({
  open,
  onOpenChange,
  goals,
  onSave,
  showPoints = true,
}: WeeklyGoalsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const resolveDefaultExercises = (items: Exercise[]) => {
    const defaults = [
      { id: "pullups", target: 30, unit: "reps" as const },
      { id: "pushups", target: 100, unit: "reps" as const },
      { id: "situps", target: 100, unit: "reps" as const },
    ];

    return defaults
      .map((def) => {
        const match = items.find((exercise) => exercise.id === def.id);
        if (!match) return null;
        return {
          exerciseId: match.id,
          target: def.target,
          current: 0,
          unit: def.unit,
        };
      })
      .filter(Boolean) as WeeklyGoals["exercises"];
  };

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [facets, setFacets] = useState<ExerciseListResponse["facets"]>();

  const defaultGoals: WeeklyGoals = {
    points: {
      target: DEFAULT_WEEKLY_POINTS_GOAL,
      current: goals.points?.current ?? 0,
    },
    exercises: resolveDefaultExercises(exercises),
  };
  const [localGoals, setLocalGoals] = useState<WeeklyGoals>({
    points: goals.points ?? { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
    exercises: goals.exercises ?? [],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalGoals({
      points: goals.points ?? { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
      exercises: goals.exercises ?? [],
    });
  }, [goals, open]);

  useEffect(() => {
    if (!open) return;
    const loadExercises = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/exercises?limit=500&includeMeta=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          return;
        }
        const data: ExerciseListResponse = await response.json();
        setExercises(Array.isArray(data.exercises) ? data.exercises : []);
        setFacets(data.facets);
      } catch (error) {
        console.error("Load exercises error:", error);
      }
    };
    loadExercises();
  }, [open]);

  const getDefaultUnit = (exercise?: Exercise | null) => {
    if (!exercise) return "reps" as WeeklyGoals["exercises"][number]["unit"];
    const supportsDistance = exercise.supportsDistance || exercise.measurementType === "distance";
    const supportsTime = exercise.supportsTime || exercise.measurementType === "time";
    if (supportsDistance && supportsTime) return "distance";
    if (supportsTime) return "time";
    if (supportsDistance) return "distance";
    return "reps";
  };

  const updatePointsGoal = (target: number) => {
    setLocalGoals((prev) => ({
      ...prev,
      points: { ...prev.points, target: Math.max(0, target) },
    }));
  };

  const updateExerciseGoal = (index: number, exerciseId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    setLocalGoals((prev) => {
      const next = [...prev.exercises];
      next[index] = {
        ...next[index],
        exerciseId,
        unit: getDefaultUnit(exercise),
      };
      return { ...prev, exercises: next };
    });
  };

  const updateExerciseUnit = (
    index: number,
    unit: WeeklyGoals["exercises"][number]["unit"]
  ) => {
    setLocalGoals((prev) => {
      const next = [...prev.exercises];
      next[index] = { ...next[index], unit };
      return { ...prev, exercises: next };
    });
  };

  const updateExerciseTarget = (index: number, target: number) => {
    setLocalGoals((prev) => {
      const next = [...prev.exercises];
      next[index] = { ...next[index], target: Math.max(0, target) };
      return { ...prev, exercises: next };
    });
  };

  const addExerciseGoal = () => {
    setLocalGoals((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { exerciseId: "", target: 0, unit: "reps" }],
    }));
  };

  const removeExerciseGoal = (index: number) => {
    setLocalGoals((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index),
    }));
  };

  const handleReset = async () => {
    setIsSaving(true);
    const resetGoals: WeeklyGoals = {
      points: {
        target: DEFAULT_WEEKLY_POINTS_GOAL,
        current: localGoals.points?.current ?? 0,
      },
      exercises: resolveDefaultExercises(exercises),
    };

    try {
      await onSave(resetGoals);
      onOpenChange(false);
    } catch (error) {
      console.error("Error resetting goals:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("weeklyGoals.saveError"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localGoals);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving goals:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("weeklyGoals.saveError"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg max-h-[85vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("weeklyGoals.dialog.title")}
            </DrawerTitle>
            <DrawerDescription>
              {t("weeklyGoals.dialog.description")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-2">
            <WeeklyGoalsForm
              goals={localGoals}
              exercises={exercises}
              facets={facets}
              onChangePoints={updatePointsGoal}
              onChangeExercise={updateExerciseGoal}
              onChangeExerciseUnit={updateExerciseUnit}
              onChangeExerciseTarget={updateExerciseTarget}
              onAddExercise={addExerciseGoal}
              onRemoveExercise={removeExerciseGoal}
              showPoints={showPoints}
            />
          </div>

          <DrawerFooter className="gap-2 flex-row flex-wrap">
            <DrawerClose asChild>
              <Button
                variant="outline"
                disabled={isSaving}
              >
                {t("common.cancel")}
              </Button>
            </DrawerClose>
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={isSaving}
            >
              {t("common.reset")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? t("common.saving")
                : t("common.save")}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
