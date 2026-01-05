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

export interface StatCardConfig {
  id: string;
  type: 'points' | 'activity' | 'rank' | 'workouts';
  period: 'week' | 'month' | 'quarter' | 'year';
  activityType?: 'pullups' | 'pushups' | 'running' | 'cycling' | 'situps';
  color: 'orange' | 'blue' | 'green' | 'purple';
}

interface DashboardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: StatCardConfig[];
  onSave: (cards: StatCardConfig[]) => void;
}

export function DashboardSettingsDialog({
  open,
  onOpenChange,
  cards,
  onSave,
}: DashboardSettingsDialogProps) {
  const { t } = useTranslation();
  const [localCards, setLocalCards] = useState<StatCardConfig[]>(cards);

  useEffect(() => {
    setLocalCards(cards);
  }, [cards, open]);

  const updateCard = (index: number, updates: Partial<StatCardConfig>) => {
    const newCards = [...localCards];
    newCards[index] = { ...newCards[index], ...updates };
    setLocalCards(newCards);
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
            return (
            <div
              key={card.id}
              className="p-4 border rounded-lg space-y-4 bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  {t('dashboard.settings.card', 'Kachel')} {index + 1}
                </h3>
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
                        type: value as StatCardConfig['type'],
                        activityType: value === 'activity' ? card.activityType : undefined,
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

                {card.type === 'activity' && (
                  <div className="space-y-2">
                    <Label htmlFor={`${baseId}-activity`}>
                      {t('dashboard.settings.activityType', 'Übung')}
                    </Label>
                    <Select
                      value={card.activityType || 'pullups'}
                      onValueChange={(value) =>
                        updateCard(index, {
                          activityType: value as StatCardConfig['activityType'],
                        })
                      }
                    >
                      <SelectTrigger id={`${baseId}-activity`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pullups">
                          {t('dashboard.pullups', 'Klimmzüge')}
                        </SelectItem>
                        <SelectItem value="pushups">
                          {t('dashboard.pushups', 'Liegestütze')}
                        </SelectItem>
                        <SelectItem value="running">
                          {t('dashboard.running', 'Laufen')}
                        </SelectItem>
                        <SelectItem value="cycling">
                          {t('dashboard.cycling', 'Radfahren')}
                        </SelectItem>
                        <SelectItem value="situps">
                          {t('dashboard.situps', 'Sit-ups')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                        {t('dashboard.settings.colors.orange', 'Orange')}
                      </SelectItem>
                      <SelectItem value="blue">
                        {t('dashboard.settings.colors.blue', 'Blau')}
                      </SelectItem>
                      <SelectItem value="green">
                        {t('dashboard.settings.colors.green', 'Grün')}
                      </SelectItem>
                      <SelectItem value="purple">
                        {t('dashboard.settings.colors.purple', 'Lila')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )})}
        </div>

        <DialogFooter>
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
