
import { BarChart, TrendingUp, Trophy, Dumbbell } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Deine sportlichen Fortschritte auf einen Blick</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gesamtpunkte"
          value="1,980"
          icon={Trophy}
          trend="+120 diese Woche"
          color="orange"
        />
        <StatCard
          title="Klimmzüge"
          value="78"
          icon={Dumbbell}
          trend="+8 heute"
          color="blue"
        />
        <StatCard
          title="Laufdistanz"
          value="22.1 km"
          icon={TrendingUp}
          trend="+5.2 km diese Woche"
          color="green"
        />
        <StatCard
          title="Rang"
          value="#5"
          icon={BarChart}
          trend="↑ 2 Plätze"
          color="purple"
        />
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Wochenziele</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Klimmzüge (Ziel: 100)</span>
                <span>78/100</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Liegestütze (Ziel: 400)</span>
                <span>350/400</span>
              </div>
              <Progress value={87.5} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Laufen (Ziel: 25 km)</span>
                <span>22.1/25 km</span>
              </div>
              <Progress value={88.4} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">15 Klimmzüge</p>
                  <p className="text-sm text-gray-600">vor 2 Stunden</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">5.2 km Laufen</p>
                  <p className="text-sm text-gray-600">gestern</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">50 Liegestütze</p>
                  <p className="text-sm text-gray-600">vor 2 Tagen</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
