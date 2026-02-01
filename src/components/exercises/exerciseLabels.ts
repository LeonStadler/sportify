import type { TFunction } from "i18next";

type LabelConfig = {
  key: string;
  fallback: string;
};

const categoryLabelConfig: Record<string, LabelConfig> = {
  Kraft: { key: "exerciseLibrary.categoryLabels.strength", fallback: "Kraft" },
  Strength: { key: "exerciseLibrary.categoryLabels.strength", fallback: "Strength" },
  Ausdauer: { key: "exerciseLibrary.categoryLabels.endurance", fallback: "Ausdauer" },
  Endurance: { key: "exerciseLibrary.categoryLabels.endurance", fallback: "Endurance" },
  Mobility: { key: "exerciseLibrary.categoryLabels.mobility", fallback: "Mobility" },
  Skills: { key: "exerciseLibrary.categoryLabels.skills", fallback: "Skills" },
  Functional: { key: "exerciseLibrary.categoryLabels.functional", fallback: "Functional" },
  Fertigkeiten: { key: "exerciseLibrary.categoryLabels.skills", fallback: "Fertigkeiten" },
  Funktional: { key: "exerciseLibrary.categoryLabels.functional", fallback: "Funktional" },
};

const disciplineLabelConfig: Record<string, LabelConfig> = {
  "Calisthenics/Bodyweight": {
    key: "exerciseLibrary.disciplineLabels.calisthenics",
    fallback: "Calisthenics/Bodyweight",
  },
  "Yoga/Stretching": {
    key: "exerciseLibrary.disciplineLabels.yoga",
    fallback: "Yoga/Stretching",
  },
  "Weights/Gym": {
    key: "exerciseLibrary.disciplineLabels.weights",
    fallback: "Weights/Gym",
  },
  Running: {
    key: "exerciseLibrary.disciplineLabels.running",
    fallback: "Running",
  },
  Cycling: {
    key: "exerciseLibrary.disciplineLabels.cycling",
    fallback: "Cycling",
  },
  Swimming: {
    key: "exerciseLibrary.disciplineLabels.swimming",
    fallback: "Swimming",
  },
};

const movementPatternLabelConfig: Record<string, LabelConfig> = {
  push: { key: "exerciseLibrary.movement.push", fallback: "Push" },
  pull: { key: "exerciseLibrary.movement.pull", fallback: "Pull" },
  squat: { key: "exerciseLibrary.movement.squat", fallback: "Squat" },
  hinge: { key: "exerciseLibrary.movement.hinge", fallback: "Hinge" },
  carry: { key: "exerciseLibrary.movement.carry", fallback: "Carry" },
  rotation: { key: "exerciseLibrary.movement.rotation", fallback: "Rotation" },
  isometric: { key: "exerciseLibrary.movement.isometric", fallback: "Isometrisch" },
};

const muscleGroupLabelConfig: Record<string, LabelConfig> = {
  Brust: { key: "exerciseLibrary.muscleGroupLabels.chest", fallback: "Brust" },
  Rücken: { key: "exerciseLibrary.muscleGroupLabels.back", fallback: "Rücken" },
  Latissimus: { key: "exerciseLibrary.muscleGroupLabels.lats", fallback: "Latissimus" },
  "Oberer Rücken": { key: "exerciseLibrary.muscleGroupLabels.upperBack", fallback: "Oberer Rücken" },
  "Unterer Rücken": { key: "exerciseLibrary.muscleGroupLabels.lowerBack", fallback: "Unterer Rücken" },
  Trapez: { key: "exerciseLibrary.muscleGroupLabels.traps", fallback: "Trapez" },
  Rhomboiden: { key: "exerciseLibrary.muscleGroupLabels.rhomboids", fallback: "Rhomboiden" },
  Schultern: { key: "exerciseLibrary.muscleGroupLabels.shoulders", fallback: "Schultern" },
  "Vordere Schulter": { key: "exerciseLibrary.muscleGroupLabels.frontDelts", fallback: "Vordere Schulter" },
  "Seitliche Schulter": { key: "exerciseLibrary.muscleGroupLabels.sideDelts", fallback: "Seitliche Schulter" },
  "Hintere Schulter": { key: "exerciseLibrary.muscleGroupLabels.rearDelts", fallback: "Hintere Schulter" },
  Arme: { key: "exerciseLibrary.muscleGroupLabels.arms", fallback: "Arme" },
  Bizeps: { key: "exerciseLibrary.muscleGroupLabels.biceps", fallback: "Bizeps" },
  Trizeps: { key: "exerciseLibrary.muscleGroupLabels.triceps", fallback: "Trizeps" },
  Unterarme: { key: "exerciseLibrary.muscleGroupLabels.forearms", fallback: "Unterarme" },
  Core: { key: "exerciseLibrary.muscleGroupLabels.core", fallback: "Core" },
  Bauch: { key: "exerciseLibrary.muscleGroupLabels.abs", fallback: "Bauch" },
  "Schräger Bauch": { key: "exerciseLibrary.muscleGroupLabels.obliques", fallback: "Schräger Bauch" },
  "Tiefe Bauchmuskeln": { key: "exerciseLibrary.muscleGroupLabels.deepCore", fallback: "Tiefe Bauchmuskeln" },
  Beine: { key: "exerciseLibrary.muscleGroupLabels.legs", fallback: "Beine" },
  Quadrizeps: { key: "exerciseLibrary.muscleGroupLabels.quads", fallback: "Quadrizeps" },
  Hamstrings: { key: "exerciseLibrary.muscleGroupLabels.hamstrings", fallback: "Hamstrings" },
  Waden: { key: "exerciseLibrary.muscleGroupLabels.calves", fallback: "Waden" },
  Gluteus: { key: "exerciseLibrary.muscleGroupLabels.glutes", fallback: "Gluteus" },
  Adduktoren: { key: "exerciseLibrary.muscleGroupLabels.adductors", fallback: "Adduktoren" },
  Abduktoren: { key: "exerciseLibrary.muscleGroupLabels.abductors", fallback: "Abduktoren" },
  Hüftbeuger: { key: "exerciseLibrary.muscleGroupLabels.hipFlexors", fallback: "Hüftbeuger" },
  Nacken: { key: "exerciseLibrary.muscleGroupLabels.neck", fallback: "Nacken" },
};

export function getExerciseCategoryLabel(value: string | null | undefined, t: TFunction) {
  if (!value) return value ?? "-";
  const config = categoryLabelConfig[value];
  return config ? t(config.key, config.fallback) : value;
}

export function getExerciseDisciplineLabel(value: string | null | undefined, t: TFunction) {
  if (!value) return value ?? "-";
  const config = disciplineLabelConfig[value];
  return config ? t(config.key, config.fallback) : value;
}

export function getExerciseMovementPatternLabel(
  value: string | null | undefined,
  t: TFunction
) {
  if (!value) return value ?? "-";
  const config = movementPatternLabelConfig[value];
  return config ? t(config.key, config.fallback) : value;
}

export function getExerciseMuscleGroupLabel(
  value: string | null | undefined,
  t: TFunction
) {
  if (!value) return value ?? "-";
  const config = muscleGroupLabelConfig[value];
  return config ? t(config.key, config.fallback) : value;
}
