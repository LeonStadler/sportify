import { WeeklyGoals } from "@/components/settings/WeeklyGoalsForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface WeeklyProgress {
  pullups: number;
  pushups: number;
  situps: number;
  running: number;
  cycling: number;
}

interface WeeklyGoalsCardProps {
  goals: WeeklyGoals;
  progress: WeeklyProgress;
  onOpenSettings: () => void;
  className?: string;
}

export function WeeklyGoalsCard({
  goals,
  progress,
  onOpenSettings,
  className,
}: WeeklyGoalsCardProps) {
  const { t } = useTranslation();

  const entries = [
    {
      label: t("dashboard.pullups"),
      unit: "",
      goal: goals.pullups.target,
      current: progress.pullups ?? 0,
    },
    {
      label: t("dashboard.pushups"),
      unit: "",
      goal: goals.pushups.target,
      current: progress.pushups ?? 0,
    },
    {
      label: t("dashboard.situps", "Sit-ups"),
      unit: "",
      goal: goals.situps.target,
      current: progress.situps ?? 0,
    },
    {
      label: t("dashboard.running"),
      unit: "km",
      goal: goals.running.target,
      current: progress.running ?? 0,
    },
    {
      label: t("dashboard.cycling"),
      unit: "km",
      goal: goals.cycling.target,
      current: progress.cycling ?? 0,
    },
  ];

  return (
    <Card className={className + " relative"}>
      <CardHeader className="pb-4 relative">
        <CardTitle className="text-lg md:text-xl">
          {t("dashboard.weeklyGoals")}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 right-0"
          onClick={onOpenSettings}
          title={t("weeklyGoals.dialog.title", "Wochenziele einstellen")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.label}>
            <div className="flex justify-between text-sm mb-2">
              <span>
                {entry.label} ({t("dashboard.goal")}: {entry.goal}
                {entry.unit && ` ${entry.unit}`})
              </span>
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
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

