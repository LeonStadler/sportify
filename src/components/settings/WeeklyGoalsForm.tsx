import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "react-i18next";
import { Dumbbell, Footprints, Bike } from "lucide-react";

export interface WeeklyGoalData {
  target: number;
  current: number;
}

export interface WeeklyGoals {
  pullups: WeeklyGoalData;
  pushups: WeeklyGoalData;
  situps: WeeklyGoalData;
  running: WeeklyGoalData;
  cycling: WeeklyGoalData;
  points: WeeklyGoalData;
}

interface WeeklyGoalsFormProps {
  goals: WeeklyGoals;
  onChange: (key: keyof WeeklyGoals, target: number) => void;
}

export function WeeklyGoalsForm({ goals, onChange }: WeeklyGoalsFormProps) {
  const { t } = useTranslation();

  const activities = [
    {
      key: "pullups" as const,
      label: t("dashboard.pullups", "Klimmzüge"),
      unit: "",
      icon: Dumbbell,
      max: 500,
      step: 5,
    },
    {
      key: "pushups" as const,
      label: t("dashboard.pushups", "Liegestütze"),
      unit: "",
      icon: Dumbbell,
      max: 1000,
      step: 10,
    },
    {
      key: "situps" as const,
      label: t("dashboard.situps", "Sit-ups"),
      unit: "",
      icon: Dumbbell,
      max: 1000,
      step: 10,
    },
    {
      key: "running" as const,
      label: t("dashboard.running", "Laufen"),
      unit: "km",
      icon: Footprints,
      max: 100,
      step: 1,
    },
    {
      key: "cycling" as const,
      label: t("dashboard.cycling", "Radfahren"),
      unit: "km",
      icon: Bike,
      max: 200,
      step: 5,
    },
  ];

  return (
    <div className="space-y-8 py-2">
      {activities.map((activity) => (
        <div key={activity.key} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`goal-${activity.key}`}
              className="text-base font-medium flex items-center gap-2"
            >
              <activity.icon className="h-4 w-4 text-muted-foreground" />
              {activity.label}
            </Label>
            <div className="flex items-center gap-2 w-24">
              <Input
                id={`goal-${activity.key}`}
                type="number"
                min="0"
                step={activity.key === "running" || activity.key === "cycling" ? "0.1" : "1"}
                value={goals[activity.key]?.target ?? 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  onChange(activity.key, isNaN(value) ? 0 : value);
                }}
                className="h-8 text-right"
              />
              {activity.unit && (
                <span className="text-xs text-muted-foreground w-6">
                  {activity.unit}
                </span>
              )}
            </div>
          </div>
          
          <Slider
            value={[goals[activity.key]?.target ?? 0]}
            onValueChange={(vals) => onChange(activity.key, vals[0])}
            max={activity.max}
            step={activity.step}
            className="py-1"
          />
          
          <p className="text-xs text-muted-foreground">
            {t("weeklyGoals.dialog.current", "Aktuell")}:{" "}
            {goals[activity.key]?.current ?? 0} {activity.unit}
          </p>
        </div>
      ))}
    </div>
  );
}

