export type ExerciseMetricConfig = {
  measurementType?: "reps" | "time" | "distance" | "mixed" | "weight" | string;
  supportsTime?: boolean;
  supportsDistance?: boolean;
};

export type MetricVisibility = {
  showReps: boolean;
  showTime: boolean;
  showDistance: boolean;
};

export type WorkoutSetLike = {
  reps?: number;
  duration?: number;
  distance?: number;
  weight?: number;
};

export const getMetricVisibility = (
  exercise?: ExerciseMetricConfig | null,
  _unit?: string | null
): MetricVisibility => {
  if (!exercise) {
    return { showReps: true, showTime: false, showDistance: false };
  }
  const measurementType = exercise.measurementType || "reps";
  const supportsReps = ["reps", "weight", "mixed"].includes(measurementType);
  const supportsTime = Boolean(exercise.supportsTime || measurementType === "time");
  const supportsDistance = Boolean(
    exercise.supportsDistance || measurementType === "distance"
  );
  if (supportsTime && supportsDistance) {
    return { showReps: false, showTime: true, showDistance: true };
  }
  if (supportsTime && supportsReps && !supportsDistance) {
    return { showReps: true, showTime: true, showDistance: false };
  }
  if (supportsDistance && supportsReps && !supportsTime) {
    return { showReps: true, showTime: false, showDistance: true };
  }
  if (supportsTime) return { showReps: false, showTime: true, showDistance: false };
  if (supportsDistance) {
    return { showReps: false, showTime: false, showDistance: true };
  }
  return { showReps: true, showTime: false, showDistance: false };
};

export const calculateSetTotals = (
  sets: WorkoutSetLike[],
  visibility: MetricVisibility
) => {
  const totalReps = sets.reduce((sum, set) => sum + (set.reps || 0), 0);
  const totalDuration = sets.reduce((sum, set) => {
    const duration = set.duration || 0;
    if (!visibility.showReps || !visibility.showTime) return sum + duration;
    const reps = set.reps && set.reps > 0 ? set.reps : 1;
    return sum + duration * reps;
  }, 0);
  const totalDistance = sets.reduce((sum, set) => sum + (set.distance || 0), 0);
  const totalWeight = sets.reduce((sum, set) => sum + (set.weight || 0), 0);
  const totalWeightVolume = sets.reduce((sum, set) => {
    const weight = set.weight || 0;
    if (weight <= 0) return sum;
    const multiplier = visibility.showReps
      ? set.reps && set.reps > 0
        ? set.reps
        : 1
      : 1;
    return sum + weight * multiplier;
  }, 0);

  return {
    totalReps,
    totalDuration,
    totalDistance,
    totalWeight,
    totalWeightVolume,
  };
};
