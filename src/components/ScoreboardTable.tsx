
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  name: string;
  avatar: string;
  totalScore: number;
  pullUps: number;
  pushUps: number;
  running: number; // km
  cycling: number; // km
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "Max Mustermann",
    avatar: "MM",
    totalScore: 2450,
    pullUps: 120,
    pushUps: 500,
    running: 25.5,
    cycling: 150.2
  },
  {
    id: 2,
    name: "Anna Schmidt",
    avatar: "AS",
    totalScore: 2380,
    pullUps: 95,
    pushUps: 480,
    running: 32.1,
    cycling: 125.8
  },
  {
    id: 3,
    name: "Tom Wagner",
    avatar: "TW",
    totalScore: 2210,
    pullUps: 105,
    pushUps: 420,
    running: 28.3,
    cycling: 95.5
  },
  {
    id: 4,
    name: "Lisa Müller",
    avatar: "LM",
    totalScore: 2150,
    pullUps: 85,
    pushUps: 390,
    running: 35.2,
    cycling: 110.3
  },
  {
    id: 5,
    name: "Du",
    avatar: "DU",
    totalScore: 1980,
    pullUps: 78,
    pushUps: 350,
    running: 22.1,
    cycling: 88.7
  }
];

export function ScoreboardTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏆 Aktuelle Rangliste
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockUsers.map((user, index) => (
            <div 
              key={user.id} 
              className={`
                flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md
                ${user.name === "Du" ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className={`
                    text-lg font-bold w-8 text-center
                    ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-orange-600" : "text-gray-600"}
                  `}>
                    {index + 1}
                  </span>
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                    ${user.name === "Du" ? "bg-orange-500" : "bg-slate-600"}
                  `}>
                    {user.avatar}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Klimmzüge: {user.pullUps}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Liegestütze: {user.pushUps}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{user.totalScore}</p>
                <p className="text-sm text-gray-500">Punkte</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
