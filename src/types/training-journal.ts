export type TrainingJournalMood = 'energized' | 'balanced' | 'tired' | 'sore' | 'stressed' | 'motivated' | 'relaxed' | 'excited' | 'focused' | 'frustrated';

export interface TrainingJournalEntry {
  id: string;
  entryDate: string;
  mood: TrainingJournalMood;
  energyLevel: number | null;
  focusLevel: number | null;
  sleepQuality: number | null;
  sorenessLevel: number | null;
  perceivedExertion: number | null;
  notes: string | null;
  tags: string[];
  metrics: Record<string, number>;
  workoutId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingJournalSummary {
  totalEntries?: number;
  avgEnergyLevel?: number | null;
  avgFocusLevel?: number | null;
  avgSleepQuality?: number | null;
  avgSorenessLevel?: number | null;
  avgPerceivedExertion?: number | null;
  firstEntry?: string | null;
  lastEntry?: string | null;
  moodDistribution: Array<{ mood: TrainingJournalMood; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  latestEntry: TrainingJournalEntry | null;
}
