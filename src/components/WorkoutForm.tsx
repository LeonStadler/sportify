
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function WorkoutForm() {
  const [exercise, setExercise] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const { toast } = useToast();

  const exercises = [
    { id: "pullups", name: "Klimmzüge", unit: "Wiederholungen" },
    { id: "pushups", name: "Liegestütze", unit: "Wiederholungen" },
    { id: "running", name: "Laufen", unit: "Kilometer" },
    { id: "cycling", name: "Radfahren", unit: "Kilometer" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || !value) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    const exerciseName = exercises.find(ex => ex.id === exercise)?.name;
    toast({
      title: "Workout gespeichert! 🎉",
      description: `${value} ${unit} ${exerciseName} wurde erfolgreich eingetragen.`,
    });

    // Reset form
    setExercise("");
    setValue("");
    setUnit("");
  };

  const selectedExercise = exercises.find(ex => ex.id === exercise);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neues Workout eintragen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="exercise">Übung</Label>
            <Select value={exercise} onValueChange={(value) => {
              setExercise(value);
              const ex = exercises.find(ex => ex.id === value);
              setUnit(ex?.unit || "");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Wähle eine Übung" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value">Wert</Label>
            <div className="flex gap-2">
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Anzahl/Distanz eingeben"
                className="flex-1"
              />
              <div className="px-3 py-2 bg-gray-100 border rounded-md min-w-[120px] flex items-center justify-center text-sm text-gray-600">
                {selectedExercise?.unit || "Einheit"}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
            Workout speichern
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
