import { ScoreboardTable } from "@/components/ScoreboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function Scoreboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [period, setPeriod] = useState("all");

  const activityTypes = [
    { id: "all", name: "Alle", icon: "🏆" },
    { id: "pullups", name: "Klimmzüge", icon: "💪" },
    { id: "pushups", name: "Liegestütze", icon: "🔥" },
    { id: "running", name: "Laufen", icon: "🏃" },
    { id: "cycling", name: "Radfahren", icon: "🚴" },
    { id: "situps", name: "Sit-ups", icon: "🚀" },
    { id: "other", name: "Sonstiges", icon: "🔗" },
  ];

  const periods = [
      { id: "all", name: "Gesamt" },
      { id: "week", name: "Letzte 7 Tage" },
      { id: "month", name: "Letzte 30 Tage" },
      { id: "year", name: "Letztes Jahr" },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Du musst angemeldet sein, um das Scoreboard zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scoreboard</h1>
            <p className="text-gray-600 mt-2">Vergleiche deine Leistungen mit anderen Athleten</p>
          </div>
          <div className="mt-4 sm:mt-0">
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
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7">
          {activityTypes.map((activity) => (
            <TabsTrigger key={activity.id} value={activity.id} className="text-xs">
              <span className="mr-1">{activity.icon}</span>
              {activity.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {activityTypes.map((activity) => (
          <TabsContent key={activity.id} value={activity.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {activity.icon} {activity.name} Rangliste ({periods.find(p => p.id === period)?.name})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreboardTable activity={activity.id} period={period} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
