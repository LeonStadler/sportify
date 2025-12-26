import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_WEEKLY_POINTS_GOAL } from "@/config/events";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { WeeklyGoals, WeeklyGoalsForm } from "./WeeklyGoalsForm";

interface WeeklyGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: WeeklyGoals;
  onSave: (goals: WeeklyGoals) => Promise<void>;
}

export type { WeeklyGoals };

export function WeeklyGoalsDialog({
  open,
  onOpenChange,
  goals,
  onSave,
}: WeeklyGoalsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const defaultGoals: WeeklyGoals = {
    pullups: { target: 100, current: goals.pullups?.current ?? 0 },
    pushups: { target: 400, current: goals.pushups?.current ?? 0 },
    situps: { target: 200, current: goals.situps?.current ?? 0 },
    running: { target: 25, current: goals.running?.current ?? 0 },
    cycling: { target: 100, current: goals.cycling?.current ?? 0 },
    points: {
      target: DEFAULT_WEEKLY_POINTS_GOAL,
      current: goals.points?.current ?? 0,
    },
  };
  const [localGoals, setLocalGoals] = useState<WeeklyGoals>({
    ...goals,
    situps: goals.situps ?? { target: 0, current: 0 },
    points: goals.points ?? { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalGoals({
      ...goals,
      situps: goals.situps ?? { target: 0, current: 0 },
      points: goals.points ?? { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
    });
  }, [goals, open]);

  const updateGoal = (activity: keyof WeeklyGoals, target: number) => {
    setLocalGoals((prev) => ({
      ...prev,
      [activity]: { ...prev[activity], target: Math.max(0, target) },
    }));
  };

  const handleReset = () => {
    setLocalGoals(defaultGoals);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localGoals);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving goals:", error);
      toast({
        title: t("common.error", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t(
                "weeklyGoals.saveError",
                "Fehler beim Speichern der Wochenziele"
              ),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("weeklyGoals.dialog.title", "Wochenziele einstellen")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "weeklyGoals.dialog.description",
              "Passe deine wöchentlichen Ziele nach deinen Wünschen an."
            )}
          </DialogDescription>
        </DialogHeader>

        <WeeklyGoalsForm goals={localGoals} onChange={updateGoal} />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t("common.cancel", "Abbrechen")}
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={isSaving}
          >
            {t("common.reset", "Zurücksetzen")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? t("common.saving", "Wird gespeichert...")
              : t("common.save", "Speichern")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

