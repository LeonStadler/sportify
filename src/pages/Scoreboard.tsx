
import { ScoreboardTable } from "@/components/ScoreboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Scoreboard() {
  const disciplines = [
    { id: "overall", name: "Gesamt", icon: "🏆" },
    { id: "pullups", name: "Klimmzüge", icon: "💪" },
    { id: "pushups", name: "Liegestütze", icon: "🔥" },
    { id: "running", name: "Laufen", icon: "🏃" },
    { id: "cycling", name: "Radfahren", icon: "🚴" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scoreboard</h1>
        <p className="text-gray-600 mt-2">Vergleiche deine Leistungen mit anderen Athleten</p>
      </div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {disciplines.map((discipline) => (
            <TabsTrigger key={discipline.id} value={discipline.id} className="text-xs">
              <span className="mr-1">{discipline.icon}</span>
              {discipline.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overall" className="mt-6">
          <ScoreboardTable />
        </TabsContent>

        {disciplines.slice(1).map((discipline) => (
          <TabsContent key={discipline.id} value={discipline.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {discipline.icon} {discipline.name} Rangliste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Rangliste für {discipline.name} wird geladen...</p>
                  <p className="text-sm mt-2">Feature wird in der nächsten Version verfügbar sein</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
