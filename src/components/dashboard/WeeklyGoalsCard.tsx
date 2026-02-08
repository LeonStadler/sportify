import { WeeklyGoals } from "@/components/settings/WeeklyGoalsForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { getPrimaryDistanceUnit } from "@/utils/units";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WeeklyGoalsCardProps {
  goals: WeeklyGoals;
  exerciseNameMap?: Record<string, string>;
  onOpenSettings: () => void;
  className?: string;
}

export function WeeklyGoalsCard({
  goals,
  exerciseNameMap,
  onOpenSettings,
  className,
}: WeeklyGoalsCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const distanceUnit = getPrimaryDistanceUnit(user?.preferences?.units?.distance);

  const entries = (goals.exercises || [])
    .filter((entry) => entry.exerciseId)
    .map((entry) => {
      const label =
        exerciseNameMap?.[entry.exerciseId] || t("weeklyGoals.dialog.exercise");
      const unitLabel =
        entry.unit === "distance"
          ? distanceUnit === "miles"
            ? t("training.form.units.milesShort", "mi")
            : t("training.form.units.kilometersShort", "km")
          : entry.unit === "time"
            ? t("training.form.units.minutesShort", "Min")
            : t("training.form.units.repetitionsShort", "Wdh.");
      return {
        label,
        unit: unitLabel,
        goal: entry.target ?? 0,
        current: entry.current ?? 0,
      };
    });

  return (
    <Card className={className + " relative"}>
      <CardHeader className="pb-4 relative">
        <CardTitle className="text-lg font-medium min-w-0 break-words">
          {t("dashboard.weeklyGoals")}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 right-0"
          onClick={onOpenSettings}
          aria-label={t("weeklyGoals.dialog.title")}
          title={t("weeklyGoals.dialog.title")}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("weeklyGoals.dialog.noExerciseGoalsSet")}
          </p>
        )}
        {entries.map((entry) => (
          <div key={entry.label}>
            <div className="flex justify-between text-sm mb-2">
              <span>{entry.label}</span>
              <span className="font-medium">
                {entry.current}/{entry.goal}
                {entry.unit && ` ${entry.unit}`}
              </span>
            </div>
            <Progress
              value={Math.min(
                entry.goal > 0 ? (entry.current / entry.goal) * 100 : 0,
                100
              )}
              className="h-2"
              aria-label={`${entry.label}: ${entry.current} von ${entry.goal}${entry.unit ? ` ${entry.unit}` : ""} erreicht`}
              role="progressbar"
              aria-valuenow={entry.current}
              aria-valuemin={0}
              aria-valuemax={entry.goal}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
