import type { TFunction } from "i18next";

type LabelConfig = {
  key: string;
  fallback: string;
};

const categoryLabelConfig: Record<string, LabelConfig> = {
  Kraft: { key: "exerciseLibrary.categoryLabels.strength", fallback: "Kraft" },
  Strength: { key: "exerciseLibrary.categoryLabels.strength", fallback: "Strength" },
  strength: { key: "exerciseLibrary.categoryLabels.strength", fallback: "Strength" },
  Ausdauer: { key: "exerciseLibrary.categoryLabels.endurance", fallback: "Ausdauer" },
  Endurance: { key: "exerciseLibrary.categoryLabels.endurance", fallback: "Endurance" },
  endurance: { key: "exerciseLibrary.categoryLabels.endurance", fallback: "Endurance" },
  Mobility: { key: "exerciseLibrary.categoryLabels.mobility", fallback: "Mobility" },
  mobility: { key: "exerciseLibrary.categoryLabels.mobility", fallback: "Mobility" },
  Skills: { key: "exerciseLibrary.categoryLabels.skills", fallback: "Skills" },
  skills: { key: "exerciseLibrary.categoryLabels.skills", fallback: "Skills" },
  Functional: { key: "exerciseLibrary.categoryLabels.functional", fallback: "Functional" },
  functional: { key: "exerciseLibrary.categoryLabels.functional", fallback: "Functional" },
  Fertigkeiten: { key: "exerciseLibrary.categoryLabels.skills", fallback: "Fertigkeiten" },
  Funktional: { key: "exerciseLibrary.categoryLabels.functional", fallback: "Funktional" },
};

const disciplineLabelConfig: Record<string, LabelConfig> = {
  "Calisthenics/Bodyweight": {
    key: "exerciseLibrary.disciplineLabels.calisthenics",
    fallback: "Calisthenics/Bodyweight",
  },
  calisthenics: {
    key: "exerciseLibrary.disciplineLabels.calisthenics",
    fallback: "Calisthenics/Bodyweight",
  },
  "Yoga/Stretching": {
    key: "exerciseLibrary.disciplineLabels.yoga",
    fallback: "Yoga/Stretching",
  },
  yoga: {
    key: "exerciseLibrary.disciplineLabels.yoga",
    fallback: "Yoga/Stretching",
  },
  "Weights/Gym": {
    key: "exerciseLibrary.disciplineLabels.weights",
    fallback: "Weights/Gym",
  },
  weights: {
    key: "exerciseLibrary.disciplineLabels.weights",
    fallback: "Weights/Gym",
  },
  gym: {
    key: "exerciseLibrary.disciplineLabels.weights",
    fallback: "Weights/Gym",
  },
  Running: {
    key: "exerciseLibrary.disciplineLabels.running",
    fallback: "Running",
  },
  running: {
    key: "exerciseLibrary.disciplineLabels.running",
    fallback: "Running",
  },
  Cycling: {
    key: "exerciseLibrary.disciplineLabels.cycling",
    fallback: "Cycling",
  },
  cycling: {
    key: "exerciseLibrary.disciplineLabels.cycling",
    fallback: "Cycling",
  },
  Swimming: {
    key: "exerciseLibrary.disciplineLabels.swimming",
    fallback: "Swimming",
  },
  swimming: {
    key: "exerciseLibrary.disciplineLabels.swimming",
    fallback: "Swimming",
  },
  cardio: {
    key: "exerciseLibrary.disciplineLabels.cardio",
    fallback: "Cardio",
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
  Chest: { key: "exerciseLibrary.muscleGroupLabels.chest", fallback: "Chest" },
  chest: { key: "exerciseLibrary.muscleGroupLabels.chest", fallback: "Chest" },
  Brust: { key: "exerciseLibrary.muscleGroupLabels.chest", fallback: "Brust" },
  Back: { key: "exerciseLibrary.muscleGroupLabels.back", fallback: "Back" },
  back: { key: "exerciseLibrary.muscleGroupLabels.back", fallback: "Back" },
  Rücken: { key: "exerciseLibrary.muscleGroupLabels.back", fallback: "Rücken" },
  Lats: { key: "exerciseLibrary.muscleGroupLabels.lats", fallback: "Lats" },
  lats: { key: "exerciseLibrary.muscleGroupLabels.lats", fallback: "Lats" },
  Latissimus: { key: "exerciseLibrary.muscleGroupLabels.lats", fallback: "Latissimus" },
  "Upper back": { key: "exerciseLibrary.muscleGroupLabels.upperBack", fallback: "Upper back" },
  "upper back": { key: "exerciseLibrary.muscleGroupLabels.upperBack", fallback: "Upper back" },
  "Oberer Rücken": { key: "exerciseLibrary.muscleGroupLabels.upperBack", fallback: "Oberer Rücken" },
  "Lower back": { key: "exerciseLibrary.muscleGroupLabels.lowerBack", fallback: "Lower back" },
  "lower back": { key: "exerciseLibrary.muscleGroupLabels.lowerBack", fallback: "Lower back" },
  "Unterer Rücken": { key: "exerciseLibrary.muscleGroupLabels.lowerBack", fallback: "Unterer Rücken" },
  Traps: { key: "exerciseLibrary.muscleGroupLabels.traps", fallback: "Traps" },
  traps: { key: "exerciseLibrary.muscleGroupLabels.traps", fallback: "Traps" },
  Trapez: { key: "exerciseLibrary.muscleGroupLabels.traps", fallback: "Trapez" },
  Rhomboids: { key: "exerciseLibrary.muscleGroupLabels.rhomboids", fallback: "Rhomboids" },
  rhomboids: { key: "exerciseLibrary.muscleGroupLabels.rhomboids", fallback: "Rhomboids" },
  Rhomboiden: { key: "exerciseLibrary.muscleGroupLabels.rhomboids", fallback: "Rhomboiden" },
  Shoulders: { key: "exerciseLibrary.muscleGroupLabels.shoulders", fallback: "Shoulders" },
  shoulders: { key: "exerciseLibrary.muscleGroupLabels.shoulders", fallback: "Shoulders" },
  Schultern: { key: "exerciseLibrary.muscleGroupLabels.shoulders", fallback: "Schultern" },
  "Front delts": { key: "exerciseLibrary.muscleGroupLabels.frontDelts", fallback: "Front delts" },
  "front delts": { key: "exerciseLibrary.muscleGroupLabels.frontDelts", fallback: "Front delts" },
  "Vordere Schulter": { key: "exerciseLibrary.muscleGroupLabels.frontDelts", fallback: "Vordere Schulter" },
  "Side delts": { key: "exerciseLibrary.muscleGroupLabels.sideDelts", fallback: "Side delts" },
  "side delts": { key: "exerciseLibrary.muscleGroupLabels.sideDelts", fallback: "Side delts" },
  "Seitliche Schulter": { key: "exerciseLibrary.muscleGroupLabels.sideDelts", fallback: "Seitliche Schulter" },
  "Rear delts": { key: "exerciseLibrary.muscleGroupLabels.rearDelts", fallback: "Rear delts" },
  "rear delts": { key: "exerciseLibrary.muscleGroupLabels.rearDelts", fallback: "Rear delts" },
  "Hintere Schulter": { key: "exerciseLibrary.muscleGroupLabels.rearDelts", fallback: "Hintere Schulter" },
  Arms: { key: "exerciseLibrary.muscleGroupLabels.arms", fallback: "Arms" },
  arms: { key: "exerciseLibrary.muscleGroupLabels.arms", fallback: "Arms" },
  Arme: { key: "exerciseLibrary.muscleGroupLabels.arms", fallback: "Arme" },
  Biceps: { key: "exerciseLibrary.muscleGroupLabels.biceps", fallback: "Biceps" },
  biceps: { key: "exerciseLibrary.muscleGroupLabels.biceps", fallback: "Biceps" },
  Bizeps: { key: "exerciseLibrary.muscleGroupLabels.biceps", fallback: "Bizeps" },
  Triceps: { key: "exerciseLibrary.muscleGroupLabels.triceps", fallback: "Triceps" },
  triceps: { key: "exerciseLibrary.muscleGroupLabels.triceps", fallback: "Triceps" },
  Trizeps: { key: "exerciseLibrary.muscleGroupLabels.triceps", fallback: "Trizeps" },
  Forearms: { key: "exerciseLibrary.muscleGroupLabels.forearms", fallback: "Forearms" },
  forearms: { key: "exerciseLibrary.muscleGroupLabels.forearms", fallback: "Forearms" },
  Unterarme: { key: "exerciseLibrary.muscleGroupLabels.forearms", fallback: "Unterarme" },
  Core: { key: "exerciseLibrary.muscleGroupLabels.core", fallback: "Core" },
  core: { key: "exerciseLibrary.muscleGroupLabels.core", fallback: "Core" },
  Abs: { key: "exerciseLibrary.muscleGroupLabels.abs", fallback: "Abs" },
  abs: { key: "exerciseLibrary.muscleGroupLabels.abs", fallback: "Abs" },
  Bauch: { key: "exerciseLibrary.muscleGroupLabels.abs", fallback: "Bauch" },
  Obliques: { key: "exerciseLibrary.muscleGroupLabels.obliques", fallback: "Obliques" },
  obliques: { key: "exerciseLibrary.muscleGroupLabels.obliques", fallback: "Obliques" },
  "Schräger Bauch": { key: "exerciseLibrary.muscleGroupLabels.obliques", fallback: "Schräger Bauch" },
  "Deep core": { key: "exerciseLibrary.muscleGroupLabels.deepCore", fallback: "Deep core" },
  "deep core": { key: "exerciseLibrary.muscleGroupLabels.deepCore", fallback: "Deep core" },
  "Tiefe Bauchmuskeln": { key: "exerciseLibrary.muscleGroupLabels.deepCore", fallback: "Tiefe Bauchmuskeln" },
  Legs: { key: "exerciseLibrary.muscleGroupLabels.legs", fallback: "Legs" },
  legs: { key: "exerciseLibrary.muscleGroupLabels.legs", fallback: "Legs" },
  Beine: { key: "exerciseLibrary.muscleGroupLabels.legs", fallback: "Beine" },
  Quads: { key: "exerciseLibrary.muscleGroupLabels.quads", fallback: "Quads" },
  quads: { key: "exerciseLibrary.muscleGroupLabels.quads", fallback: "Quads" },
  Quadrizeps: { key: "exerciseLibrary.muscleGroupLabels.quads", fallback: "Quadrizeps" },
  Hamstrings: { key: "exerciseLibrary.muscleGroupLabels.hamstrings", fallback: "Hamstrings" },
  hamstrings: { key: "exerciseLibrary.muscleGroupLabels.hamstrings", fallback: "Hamstrings" },
  Calves: { key: "exerciseLibrary.muscleGroupLabels.calves", fallback: "Calves" },
  calves: { key: "exerciseLibrary.muscleGroupLabels.calves", fallback: "Calves" },
  Waden: { key: "exerciseLibrary.muscleGroupLabels.calves", fallback: "Waden" },
  Glutes: { key: "exerciseLibrary.muscleGroupLabels.glutes", fallback: "Glutes" },
  glutes: { key: "exerciseLibrary.muscleGroupLabels.glutes", fallback: "Glutes" },
  Gluteus: { key: "exerciseLibrary.muscleGroupLabels.glutes", fallback: "Gluteus" },
  Adductors: { key: "exerciseLibrary.muscleGroupLabels.adductors", fallback: "Adductors" },
  adductors: { key: "exerciseLibrary.muscleGroupLabels.adductors", fallback: "Adductors" },
  Adduktoren: { key: "exerciseLibrary.muscleGroupLabels.adductors", fallback: "Adduktoren" },
  Abductors: { key: "exerciseLibrary.muscleGroupLabels.abductors", fallback: "Abductors" },
  abductors: { key: "exerciseLibrary.muscleGroupLabels.abductors", fallback: "Abductors" },
  Abduktoren: { key: "exerciseLibrary.muscleGroupLabels.abductors", fallback: "Abduktoren" },
  "Hip flexors": { key: "exerciseLibrary.muscleGroupLabels.hipFlexors", fallback: "Hip flexors" },
  "hip flexors": { key: "exerciseLibrary.muscleGroupLabels.hipFlexors", fallback: "Hip flexors" },
  Hüftbeuger: { key: "exerciseLibrary.muscleGroupLabels.hipFlexors", fallback: "Hüftbeuger" },
  Neck: { key: "exerciseLibrary.muscleGroupLabels.neck", fallback: "Neck" },
  neck: { key: "exerciseLibrary.muscleGroupLabels.neck", fallback: "Neck" },
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
