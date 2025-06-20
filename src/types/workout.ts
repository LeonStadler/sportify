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
  workoutDate: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  activities: WorkoutActivity[];
}
