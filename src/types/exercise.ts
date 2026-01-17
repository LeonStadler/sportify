export interface ExerciseUnitOption {
  value: string;
  label: string;
  multiplier?: number;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  category?: string | null;
  discipline?: string | null;
  movementPattern?: string | null;
  measurementType?: string | null;
  pointsPerUnit?: number | null;
  unit?: string | null;
  requiresWeight?: boolean | null;
  allowsWeight?: boolean | null;
  supportsSets?: boolean | null;
  supportsTime?: boolean | null;
  supportsDistance?: boolean | null;
  supportsGrade?: boolean | null;
  difficultyTier?: number | null;
  muscleGroups?: string[] | null;
  equipment?: string[] | null;
  unitOptions?: ExerciseUnitOption[];
  status?: string | null;
  createdBy?: string | null;
  approvedBy?: string | null;
  mergedInto?: string | null;
  isActive?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExerciseListResponse {
  exercises: Exercise[];
  facets?: {
    categories: string[];
    muscleGroups: string[];
    equipment: string[];
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}
