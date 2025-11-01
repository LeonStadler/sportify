import { PageTemplate } from "@/components/PageTemplate";
import { ScoreboardTable } from "@/components/ScoreboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
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
    { id: "other", name: t('scoreboard.activityTypes.other'), icon: "🔗" },
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
        <div className="w-full overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="flex h-auto flex-wrap items-center justify-start rounded-lg bg-muted/50 dark:bg-muted/30 p-1.5 gap-1.5 sm:grid sm:w-full sm:grid-cols-4 md:grid-cols-7 sm:gap-2 sm:h-10">
            {activityTypes.map((activity) => (
              <TabsTrigger
                key={activity.id}
                value={activity.id}
                className="text-xs sm:text-sm whitespace-nowrap px-3 py-2 sm:py-1.5 flex-shrink-0 rounded-md transition-all bg-transparent hover:bg-muted data-[state=active]:bg-background dark:data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold"
              >
                <span className="mr-1.5 text-sm sm:text-base">{activity.icon}</span>
                <span>{activity.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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
