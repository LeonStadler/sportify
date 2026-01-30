export interface WorkoutActivity {
  id?: string;
  activityType: string;
  amount: number;
  unit: string;
  notes?: string;
  sets?: Array<{
    reps: number;
    weight?: number;
    duration?: number;
    distance?: number;
    isDropSet?: boolean;
  }>;
  restBetweenSetsSeconds?: number;
  restAfterSeconds?: number;
  effort?: number;
  supersetGroup?: string;
}

export interface WorkoutReactionUser {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface WorkoutReaction {
  emoji: string;
  count: number;
  users: WorkoutReactionUser[];
  currentUserReaction?: string;
}

export interface FeedWorkoutActivity {
  id: string;
  activityType: string;
  amount: number;
  points: number;
}

export interface FeedWorkout {
  workoutId: string;
  workoutTitle: string;
  workoutNotes?: string;
  startTimeTimestamp: string | null;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  userFirstName: string;
  userLastName: string;
  isOwnWorkout: boolean;
  activities: FeedWorkoutActivity[];
  reactions?: WorkoutReaction[];
  totalPoints: number;
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
  difficulty?: number;
  sessionType?: string;
  rounds?: number;
  restBetweenSetsSeconds?: number;
  restBetweenActivitiesSeconds?: number;
  restBetweenRoundsSeconds?: number;
  visibility?: "private" | "friends" | "public";
  isTemplate?: boolean;
  owner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    displayPreference?: string;
  };
  createdAt: string;
  updatedAt: string;
  activities: WorkoutActivity[];
  reactions?: WorkoutReaction[];
}
