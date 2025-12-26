import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface WeeklyPointsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoal: number;
  onSave: (points: number) => Promise<void>;
}

export function WeeklyPointsGoalDialog({
  open,
  onOpenChange,
  currentGoal,
  onSave,
}: WeeklyPointsGoalDialogProps) {
  const { t } = useTranslation();
  const [points, setPoints] = useState(currentGoal);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPoints(currentGoal);
    }
  }, [open, currentGoal]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(points);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save points goal", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t("weeklyGoals.pointsTitle", "Set weekly points goal")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "weeklyGoals.pointsDescription",
              "Set your personal points goal for this week."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="points-goal" className="text-base font-medium">
                {t("weeklyGoals.pointsLabel", "Punkte")}
              </Label>
              <div className="w-20">
                <Input
                  id="points-goal"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="h-8 text-right"
                />
              </div>
            </div>
            <Slider
              value={[points]}
              onValueChange={(vals) => setPoints(vals[0])}
              max={3000}
              step={50}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground text-center">
              {t(
                "weeklyGoals.pointsHint",
                "Standard-Challenge ist meist 1500 Punkte."
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t("common.cancel", "Abbrechen")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? t("common.saving", "Speichert...")
              : t("common.save", "Speichern")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

