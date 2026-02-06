import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import type { Exercise } from "@/types/exercise";
import { Button } from "@/components/ui/button";
import { ExercisePicker } from "@/components/exercises/ExercisePicker";
import { useAuth } from "@/hooks/use-auth";
import { getPrimaryDistanceUnit } from "@/utils/units";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExerciseListResponse } from "@/types/exercise";

export interface WeeklyGoalData {
  target: number;
  current: number;
}

export interface WeeklyExerciseGoal {
  exerciseId: string;
  target: number;
  current?: number;
  unit?: "reps" | "time" | "distance";
}

export interface WeeklyGoals {
  points: WeeklyGoalData;
  exercises: WeeklyExerciseGoal[];
}

interface WeeklyGoalsFormProps {
  goals: WeeklyGoals;
  exercises: Exercise[];
  facets?: ExerciseListResponse["facets"];
  onChangePoints: (target: number) => void;
  onChangeExercise: (index: number, exerciseId: string) => void;
  onChangeExerciseUnit: (index: number, unit: WeeklyExerciseGoal["unit"]) => void;
  onChangeExerciseTarget: (index: number, target: number) => void;
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
  showPoints?: boolean;
}

export function WeeklyGoalsForm({
  goals,
  exercises,
  facets,
  onChangePoints,
  onChangeExercise,
  onChangeExerciseUnit,
  onChangeExerciseTarget,
  onAddExercise,
  onRemoveExercise,
  showPoints = true,
}: WeeklyGoalsFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const distanceUnit = getPrimaryDistanceUnit(user?.preferences?.units?.distance);

  const getAvailableUnits = (exercise?: Exercise | null) => {
    if (!exercise) return ["reps"] as WeeklyExerciseGoal["unit"][];
    const options: WeeklyExerciseGoal["unit"][] = [];
    const supportsDistance = exercise.supportsDistance || exercise.measurementType === "distance";
    const supportsTime = exercise.supportsTime || exercise.measurementType === "time";
    const supportsReps =
      exercise.measurementType === "reps" ||
      exercise.supportsSets ||
      (!supportsDistance && !supportsTime);
    if (supportsReps) options.push("reps");
    if (supportsTime) options.push("time");
    if (supportsDistance) options.push("distance");
    return options;
  };

  const getDefaultUnit = (exercise?: Exercise | null) => {
    if (!exercise) return "reps" as WeeklyExerciseGoal["unit"];
    const supportsDistance = exercise.supportsDistance || exercise.measurementType === "distance";
    const supportsTime = exercise.supportsTime || exercise.measurementType === "time";
    const supportsReps =
      exercise.measurementType === "reps" ||
      exercise.supportsSets ||
      (!supportsDistance && !supportsTime);
    if (supportsDistance) return "distance";
    if (supportsReps) return "reps";
    if (supportsTime) return "time";
    return "reps";
  };

  return (
    <div className="space-y-6 py-2">
      {showPoints && (
        <div className="space-y-3">
          <Label>{t("weeklyGoals.dialog.pointsGoal", "Punkte‑Ziel")}</Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              step="10"
              value={goals.points?.target ?? 0}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                onChangePoints(isNaN(value) ? 0 : value);
              }}
              className="h-9 w-28 text-right"
            />
            <span className="text-xs text-muted-foreground">
              {t("weeklyGoals.dialog.points", "Punkte")}
            </span>
          </div>
          <Slider
            value={[goals.points?.target ?? 0]}
            onValueChange={(vals) => onChangePoints(vals[0])}
            max={5000}
            step={25}
            className="py-1"
          />
          <p className="text-xs text-muted-foreground">
            {t("weeklyGoals.dialog.current", "Aktuell")}: {goals.points?.current ?? 0}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("weeklyGoals.dialog.exerciseGoals", "Übungsziele")}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddExercise}
            disabled={goals.exercises.length >= 10}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("weeklyGoals.dialog.addExercise", "Übung hinzufügen")}
          </Button>
        </div>

        {goals.exercises.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("weeklyGoals.dialog.noExercises", "Wähle bis zu 10 Übungen für dein Wochenziel.")}
          </p>
        )}

        {goals.exercises.map((goal, index) => {
          const selected = exercises.find((ex) => ex.id === goal.exerciseId);
          const availableUnits = getAvailableUnits(selected);
          const activeUnit = goal.unit || getDefaultUnit(selected);
          return (
            <div key={`${goal.exerciseId}-${index}`} className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ExercisePicker
                    value={goal.exerciseId}
                    onSelect={(exerciseId) => onChangeExercise(index, exerciseId)}
                    exercises={exercises}
                    facets={
                      facets || {
                        categories: [],
                        muscleGroups: [],
                        equipment: [],
                      }
                    }
                    enableFilters
                    placeholder={t("weeklyGoals.dialog.selectExercise", "Übung wählen")}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveExercise(index)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={goal.target ?? 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    onChangeExerciseTarget(index, isNaN(value) ? 0 : value);
                  }}
                  className="h-9 w-28 text-right"
                />
                {availableUnits.length > 1 ? (
                  <Select
                    value={activeUnit}
                    onValueChange={(value) =>
                      onChangeExerciseUnit(index, value as WeeklyExerciseGoal["unit"])
                    }
                  >
                    <SelectTrigger className="h-9 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.includes("reps") && (
                        <SelectItem value="reps">
                          {t("training.form.units.repetitionsShort", "Wdh.")}
                        </SelectItem>
                      )}
                      {availableUnits.includes("time") && (
                        <SelectItem value="time">
                          {t("training.form.units.minutesShort", "Min")}
                        </SelectItem>
                      )}
                      {availableUnits.includes("distance") && (
                        <SelectItem value="distance">
                          {distanceUnit === "miles"
                            ? t("training.form.units.milesShort", "mi")
                            : t("training.form.units.kilometersShort", "km")}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {activeUnit === "distance"
                      ? distanceUnit === "miles"
                        ? t("training.form.units.milesShort", "mi")
                        : t("training.form.units.kilometersShort", "km")
                      : activeUnit === "time"
                        ? t("training.form.units.minutesShort", "Min")
                        : t("training.form.units.repetitionsShort", "Wdh.")}
                  </span>
                )}
              </div>

              <Slider
                value={[goal.target ?? 0]}
                onValueChange={(vals) => onChangeExerciseTarget(index, vals[0])}
                max={
                  activeUnit === "distance"
                    ? 100
                    : activeUnit === "time"
                      ? 600
                      : 500
                }
                step={activeUnit === "distance" ? 1 : activeUnit === "time" ? 5 : 1}
                className="py-1"
              />

              <p className="text-xs text-muted-foreground">
                {t("weeklyGoals.dialog.current", "Aktuell")}: {goal.current ?? 0}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
