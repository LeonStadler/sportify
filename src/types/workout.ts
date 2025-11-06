export interface WorkoutActivity {
  id?: string;
  activityType: string;
  amount: number;
  unit: string;
  notes?: string;
  sets?: Array<{
    reps: number;
    weight?: number;
  }>;
}

export interface Workout {
  id: string;
  title: string;
  description?: string;
  workoutDate?: string; // Kann null sein, wenn startTimeTimestamp vorhanden
  startTime?: string; // Format: "HH:mm"
  startTimeTimestamp?: string; // Vollständiger ISO-String (TIMESTAMPTZ)
  duration?: number; // in Minuten
  useEndTime?: boolean; // true = Endzeit-Modus, false = Dauer-Modus
  createdAt: string;
  updatedAt: string;
  activities: WorkoutActivity[];
}
