
import { WorkoutForm } from "@/components/WorkoutForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Training() {
  const recentWorkouts = [
    { id: 1, exercise: "Klimmzüge", value: 15, unit: "Wiederholungen", date: "Heute, 14:30", points: 45 },
    { id: 2, exercise: "Laufen", value: 5.2, unit: "Kilometer", date: "Gestern, 07:15", points: 52 },
    { id: 3, exercise: "Liegestütze", value: 50, unit: "Wiederholungen", date: "Vor 2 Tagen", points: 50 },
    { id: 4, exercise: "Radfahren", value: 15.5, unit: "Kilometer", date: "Vor 3 Tagen", points: 78 },
    { id: 5, exercise: "Klimmzüge", value: 12, unit: "Wiederholungen", date: "Vor 4 Tagen", points: 36 },
  ];

  const getExerciseIcon = (exercise: string) => {
    switch (exercise) {
      case "Klimmzüge": return "💪";
      case "Liegestütze": return "🔥";
      case "Laufen": return "🏃";
      case "Radfahren": return "🚴";
      default: return "💪";
    }
  };

  const getExerciseColor = (exercise: string) => {
    switch (exercise) {
      case "Klimmzüge": return "bg-blue-100 text-blue-800";
      case "Liegestütze": return "bg-red-100 text-red-800";
      case "Laufen": return "bg-green-100 text-green-800";
      case "Radfahren": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Training Log</h1>
        <p className="text-gray-600 mt-2">Trage deine Workouts ein und verfolge deinen Fortschritt</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutForm />

        <Card>
          <CardHeader>
            <CardTitle>Letzte Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getExerciseIcon(workout.exercise)}</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {workout.value} {workout.unit}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getExerciseColor(workout.exercise)}>
                          {workout.exercise}
                        </Badge>
                        <span className="text-sm text-gray-500">{workout.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">+{workout.points}</p>
                    <p className="text-xs text-gray-500">Punkte</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
