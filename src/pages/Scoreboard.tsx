import { PageTemplate } from "@/components/PageTemplate";
import { ScoreboardTable } from "@/components/ScoreboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export function Scoreboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [period, setPeriod] = useState("all");

  const activityTypes = useMemo(() => [
    { id: "all", name: t('scoreboard.activityTypes.all'), icon: "🏆" },
    { id: "pullups", name: t('scoreboard.activityTypes.pullups'), icon: "💪" },
    { id: "pushups", name: t('scoreboard.activityTypes.pushups'), icon: "🔥" },
    { id: "running", name: t('scoreboard.activityTypes.running'), icon: "🏃" },
    { id: "cycling", name: t('scoreboard.activityTypes.cycling'), icon: "🚴" },
    { id: "situps", name: t('scoreboard.activityTypes.situps'), icon: "🚀" },
  ], [t]);

  const periods = useMemo(() => [
    { id: "all", name: t('scoreboard.periods.all') },
    { id: "week", name: t('scoreboard.periods.week') },
    { id: "month", name: t('scoreboard.periods.month') },
    { id: "year", name: t('scoreboard.periods.year') },
  ], [t]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">{t('scoreboard.mustBeLoggedIn')}</p>
      </div>
    );
  }

  return (
    <PageTemplate
      title={t('scoreboard.title')}
      subtitle={t('scoreboard.subtitle')}
      headerActions={
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      className="space-y-6"
    >

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {activityTypes.map((activity) => (
            <TabsTrigger
              key={activity.id}
              value={activity.id}
            >
              <span className="mr-1.5">{activity.icon}</span>
              <span>{activity.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {activityTypes.map((activity) => (
          <TabsContent key={activity.id} value={activity.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {activity.icon} {activity.name} {t('scoreboard.leaderboard')} ({periods.find(p => p.id === period)?.name})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreboardTable activity={activity.id} period={period} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </PageTemplate>
  );
}
