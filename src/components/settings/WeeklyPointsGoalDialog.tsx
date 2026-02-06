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
import { Slider } from "@/components/ui/slider";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface WeeklyPointsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoal: number;
  onSave: (points: number) => Promise<void>;
  defaultGoal?: number;
}

export function WeeklyPointsGoalDialog({
  open,
  onOpenChange,
  currentGoal,
  onSave,
  defaultGoal = 0,
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

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await onSave(defaultGoal);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to reset points goal", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {t("weeklyGoals.pointsTitle")}
            </DrawerTitle>
            <DrawerDescription>
              {t("weeklyGoals.pointsDescription")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="grid gap-6 px-4 pb-4">
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-2">
                <span className="sr-only" id="points-goal-label">
                  {t("weeklyGoals.pointsLabel")}
                </span>
                <span
                  className="text-4xl font-bold tabular-nums text-foreground"
                  aria-hidden
                >
                  {points}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("weeklyGoals.dialog.pointsUnit")}
                </span>
              </div>
              <Slider
                value={[points]}
                onValueChange={(vals) => setPoints(vals[0])}
                max={5000}
                step={25}
                className="py-2"
                aria-labelledby="points-goal-label"
                aria-describedby="points-goal-hint"
              />
              <p
                className="text-xs text-muted-foreground text-center"
                id="points-goal-hint"
              >
                {t("weeklyGoals.pointsHint")}
              </p>
            </div>
          </div>

          <DrawerFooter className="flex flex-col gap-3">
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving
                ? t("common.saving")
                : t("common.save")}
            </Button>
            <div className="grid grid-cols-2 gap-2 w-full">
              <DrawerClose asChild>
                <Button variant="outline" disabled={isSaving} className="w-full">
                  {t("common.cancel")}
                </Button>
              </DrawerClose>
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isSaving}
                className="w-full"
              >
                {t("common.reset")}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
