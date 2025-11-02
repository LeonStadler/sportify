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
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export interface WeeklyGoals {
  pullups: { target: number; current: number; };
  pushups: { target: number; current: number; };
  running: { target: number; current: number; };
  cycling: { target: number; current: number; };
}

interface WeeklyGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: WeeklyGoals;
  onSave: (goals: WeeklyGoals) => Promise<void>;
}

export function WeeklyGoalsDialog({
  open,
  onOpenChange,
  goals,
  onSave,
}: WeeklyGoalsDialogProps) {
  const { t } = useTranslation();
  const [localGoals, setLocalGoals] = useState<WeeklyGoals>(goals);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals, open]);

  const updateGoal = (activity: keyof WeeklyGoals, target: number) => {
    setLocalGoals(prev => ({
      ...prev,
      [activity]: { ...prev[activity], target: Math.max(0, target) }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localGoals);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const activities = [
    {
      key: 'pullups' as const,
      label: t('dashboard.pullups', 'Klimmzüge'),
      unit: '',
      getPlaceholder: () => '100'
    },
    {
      key: 'pushups' as const,
      label: t('dashboard.pushups', 'Liegestütze'),
      unit: '',
      getPlaceholder: () => '400'
    },
    {
      key: 'running' as const,
      label: t('dashboard.running', 'Laufen'),
      unit: 'km',
      getPlaceholder: () => '25'
    },
    {
      key: 'cycling' as const,
      label: t('dashboard.cycling', 'Radfahren'),
      unit: 'km',
      getPlaceholder: () => '100'
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('weeklyGoals.dialog.title', 'Wochenziele einstellen')}
          </DialogTitle>
          <DialogDescription>
            {t('weeklyGoals.dialog.description', 'Passe deine wöchentlichen Ziele nach deinen Wünschen an.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {activities.map((activity) => (
            <div
              key={activity.key}
              className="p-4 border rounded-lg space-y-2 bg-muted/30"
            >
              <Label htmlFor={`goal-${activity.key}`} className="text-base font-semibold">
                {activity.label}
                {activity.unit && ` (${activity.unit})`}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`goal-${activity.key}`}
                  type="number"
                  min="0"
                  step={activity.unit === 'km' ? '0.1' : '1'}
                  value={localGoals[activity.key].target || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    updateGoal(activity.key, isNaN(value) ? 0 : value);
                  }}
                  placeholder={activity.getPlaceholder()}
                  className="flex-1"
                />
                {activity.unit && (
                  <span className="text-sm text-muted-foreground min-w-[2rem]">
                    {activity.unit}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('weeklyGoals.dialog.current', 'Aktuell')}: {localGoals[activity.key].current} {activity.unit && activity.unit}
              </p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('common.cancel', 'Abbrechen')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('common.saving', 'Wird gespeichert...') : t('common.save', 'Speichern')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

