import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExercisePicker } from "@/components/exercises/ExercisePicker";

export interface StatCardConfig {
  id: string;
  type: "points" | "activity" | "rank" | "workouts";
  period: "week" | "month" | "quarter" | "year";
  activityId?: string;
  activityMode?: "auto" | "custom";
  activityMetric?: "reps" | "time" | "distance";
  color: "orange" | "blue" | "green" | "purple" | "teal" | "rose" | "slate";
}

interface DashboardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: StatCardConfig[];
  onSave: (cards: StatCardConfig[]) => void;
  onReset?: () => void;
  exercises: Array<{ id: string; name: string; measurementType?: string | null; supportsTime?: boolean | null; supportsDistance?: boolean | null }>;
  facets: { categories: string[]; muscleGroups: string[]; equipment: string[] };
}

export function DashboardSettingsDialog({
  open,
  onOpenChange,
  cards,
  onSave,
  onReset,
  exercises,
  facets,
}: DashboardSettingsDialogProps) {
  const { t } = useTranslation();
  const [localCards, setLocalCards] = useState<StatCardConfig[]>(cards);
  const colorClasses: Record<StatCardConfig["color"], string> = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    teal: "bg-teal-500",
    rose: "bg-rose-500",
    slate: "bg-slate-500",
  };

  useEffect(() => {
    setLocalCards(cards);
  }, [cards, open]);

  const updateCard = (index: number, updates: Partial<StatCardConfig>) => {
    const newCards = [...localCards];
    newCards[index] = { ...newCards[index], ...updates };
    setLocalCards(newCards);
  };

  const getAvailableMetrics = (exerciseId?: string) => {
    const exercise = exercises.find((item) => item.id === exerciseId);
    if (!exercise) return ["reps"] as StatCardConfig["activityMetric"][];
    const supportsDistance =
      exercise.supportsDistance || exercise.measurementType === "distance";
    const supportsTime = exercise.supportsTime || exercise.measurementType === "time";
    const supportsReps =
      exercise.measurementType === "reps" ||
      exercise.supportsSets ||
      (!supportsDistance && !supportsTime);
    const metrics: StatCardConfig["activityMetric"][] = [];
    if (supportsReps) metrics.push("reps");
    if (supportsTime) metrics.push("time");
    if (supportsDistance) metrics.push("distance");
    return metrics;
  };

  const getDefaultMetric = (exerciseId?: string) => {
    const metrics = getAvailableMetrics(exerciseId);
    if (metrics.includes("distance")) return "distance";
    if (metrics.includes("reps")) return "reps";
    if (metrics.includes("time")) return "time";
    return "reps";
  };

  const handleSave = () => {
    onSave(localCards);
    onOpenChange(false);
  };

  const getTypeLabel = (type: StatCardConfig['type']) => {
    switch (type) {
      case 'points':
        return t('dashboard.totalPoints', 'Gesamtpunkte');
      case 'activity':
        return t('dashboard.activity', 'Sportübung');
      case 'rank':
        return t('dashboard.rank', 'Rang');
      case 'workouts':
        return t('dashboard.workouts', 'Anzahl Trainings');
      default:
        return type;
    }
  };

  const getPeriodLabel = (period: StatCardConfig['period']) => {
    switch (period) {
      case 'week':
        return t('dashboard.week', 'Woche');
      case 'month':
        return t('dashboard.month', 'Monat');
      case 'quarter':
        return t('dashboard.quarter', 'Quartal');
      case 'year':
        return t('dashboard.year', 'Jahr');
      default:
        return period;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('dashboard.settings.title', 'Dashboard-Kacheln konfigurieren')}
          </DialogTitle>
          <DialogDescription>
            {t('dashboard.settings.description', 'Passe die angezeigten Kacheln und Zeiträume nach deinen Wünschen an.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {localCards.map((card, index) => {
            const baseId = `dashboard-card-${card.id}`;
            const selectedExercise = exercises.find((exercise) => exercise.id === card.activityId);
            return (
            <div
              key={card.id}
              className="p-4 border rounded-lg space-y-4 bg-card shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 h-8 w-1.5 rounded-full ${
                    colorClasses[card.color] ?? colorClasses.orange
                  }`}
                />
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm">
                    {t("dashboard.settings.card", "Kachel")} {index + 1}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {getTypeLabel(card.type)} · {getPeriodLabel(card.period)}
                  </p>
                  {card.type === "activity" && (
                    <p className="text-xs text-muted-foreground">
                      {card.activityMode === "custom"
                        ? t("dashboard.cardMeta.manual", "Manuell")
                        : t("dashboard.cardMeta.auto", "Auto")}
                      {card.activityMode === "custom" && selectedExercise?.name
                        ? ` · ${selectedExercise.name}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${baseId}-type`}>
                    {t('dashboard.settings.type', 'Typ')}
                  </Label>
                  <Select
                    value={card.type}
                    onValueChange={(value) =>
                      updateCard(index, {
                        type: value as StatCardConfig["type"],
                        activityId:
                          value === "activity" ? card.activityId : undefined,
                        activityMode:
                          value === "activity" ? card.activityMode || "auto" : undefined,
                        activityMetric:
                          value === "activity"
                            ? card.activityMetric || getDefaultMetric(card.activityId)
                            : undefined,
                      })
                    }
                  >
                    <SelectTrigger id={`${baseId}-type`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">
                        {t('dashboard.totalPoints', 'Gesamtpunkte')}
                      </SelectItem>
                      <SelectItem value="activity">
                        {t('dashboard.activity', 'Sportübung')}
                      </SelectItem>
                      <SelectItem value="rank">
                        {t('dashboard.rank', 'Rang')}
                      </SelectItem>
                      <SelectItem value="workouts">
                        {t('dashboard.workouts', 'Anzahl Trainings')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {card.type === "activity" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`${baseId}-activity-mode`}>
                        {t("dashboard.settings.activityMode", "Auswahl")}
                      </Label>
                      <Select
                        value={card.activityMode || "auto"}
                        onValueChange={(value) =>
                          updateCard(index, {
                            activityMode: value as StatCardConfig["activityMode"],
                          })
                        }
                      >
                        <SelectTrigger id={`${baseId}-activity-mode`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">
                            {t("dashboard.settings.activityAuto", "Top‑Übung automatisch")}
                          </SelectItem>
                          <SelectItem value="custom">
                            {t("dashboard.settings.activityCustom", "Übung auswählen")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {card.activityMode !== "auto" && (
                      <div className="space-y-2">
                        <Label htmlFor={`${baseId}-activity`}>
                          {t("dashboard.settings.activityType", "Übung")}
                        </Label>
                        <ExercisePicker
                          value={card.activityId}
                          onSelect={(value) =>
                            updateCard(index, {
                              activityId: value,
                              activityMetric: getDefaultMetric(value),
                              activityMode: "custom",
                            })
                          }
                          exercises={exercises}
                          facets={facets}
                          enableFilters
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`${baseId}-activity-metric`}>
                        {t("dashboard.settings.activityMetric", "Wert")}
                      </Label>
                      <Select
                        value={card.activityMetric || getDefaultMetric(card.activityId)}
                        onValueChange={(value) =>
                          updateCard(index, {
                            activityMetric: value as StatCardConfig["activityMetric"],
                          })
                        }
                      >
                        <SelectTrigger id={`${baseId}-activity-metric`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableMetrics(card.activityId).map((metric) => (
                            <SelectItem key={metric} value={metric}>
                              {metric === "distance"
                                ? t("training.form.units.kilometersShort", "km")
                                : metric === "time"
                                  ? t("training.form.units.minutesShort", "Min")
                                  : t("training.form.units.repetitionsShort", "Wdh.")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`${baseId}-period`}>
                    {t('dashboard.settings.period', 'Zeitraum')}
                  </Label>
                  <Select
                    value={card.period}
                    onValueChange={(value) =>
                      updateCard(index, {
                        period: value as StatCardConfig['period'],
                      })
                    }
                  >
                    <SelectTrigger id={`${baseId}-period`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">
                        {t('dashboard.week', 'Woche')}
                      </SelectItem>
                      <SelectItem value="month">
                        {t('dashboard.month', 'Monat')}
                      </SelectItem>
                      <SelectItem value="quarter">
                        {t('dashboard.quarter', 'Quartal')}
                      </SelectItem>
                      <SelectItem value="year">
                        {t('dashboard.year', 'Jahr')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${baseId}-color`}>
                    {t('dashboard.settings.color', 'Farbe')}
                  </Label>
                  <Select
                    value={card.color}
                    onValueChange={(value) =>
                      updateCard(index, {
                        color: value as StatCardConfig['color'],
                      })
                    }
                  >
                    <SelectTrigger id={`${baseId}-color`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orange">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                          {t('dashboard.settings.colors.orange', 'Orange')}
                        </span>
                      </SelectItem>
                      <SelectItem value="blue">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          {t('dashboard.settings.colors.blue', 'Blau')}
                        </span>
                      </SelectItem>
                      <SelectItem value="green">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                          {t('dashboard.settings.colors.green', 'Grün')}
                        </span>
                      </SelectItem>
                      <SelectItem value="purple">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                          {t('dashboard.settings.colors.purple', 'Lila')}
                        </span>
                      </SelectItem>
                      <SelectItem value="teal">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                          {t('dashboard.settings.colors.teal', 'Türkis')}
                        </span>
                      </SelectItem>
                      <SelectItem value="rose">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                          {t('dashboard.settings.colors.rose', 'Rosa')}
                        </span>
                      </SelectItem>
                      <SelectItem value="slate">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                          {t('dashboard.settings.colors.slate', 'Grau')}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )})}
        </div>

        <DialogFooter>
          {onReset && (
            <Button
              variant="secondary"
              onClick={() => {
                onReset();
                onOpenChange(false);
              }}
            >
              {t('common.reset', 'Zurücksetzen')}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Abbrechen')}
          </Button>
          <Button onClick={handleSave}>
            {t('common.save', 'Speichern')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
