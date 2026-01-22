export const measurementOptions = [
  { value: "reps", labelKey: "training.form.measurementReps", fallback: "Wdh" },
  { value: "time", labelKey: "training.form.measurementTime", fallback: "Zeit" },
  { value: "distance", labelKey: "training.form.measurementDistance", fallback: "Distanz" },
];

export const muscleGroupTree = [
  {
    label: "Brust",
    children: ["Brust"],
  },
  {
    label: "Rücken",
    children: ["Latissimus", "Oberer Rücken", "Unterer Rücken", "Trapez", "Rhomboiden"],
  },
  {
    label: "Schultern",
    children: ["Vordere Schulter", "Seitliche Schulter", "Hintere Schulter"],
  },
  {
    label: "Arme",
    children: ["Bizeps", "Trizeps", "Unterarme"],
  },
  {
    label: "Core",
    children: ["Bauch", "Schräger Bauch", "Tiefe Bauchmuskeln"],
  },
  {
    label: "Beine",
    children: ["Quadrizeps", "Hamstrings", "Waden", "Gluteus", "Adduktoren", "Abduktoren", "Hüftbeuger"],
  },
  {
    label: "Nacken",
    children: ["Nacken"],
  },
];

export const muscleGroupOptions = muscleGroupTree.flatMap((group) => group.children);

export const disciplineOptions = [
  "Calisthenics/Bodyweight",
  "Yoga/Stretching",
  "Weights/Gym",
  "Running",
  "Cycling",
  "Swimming",
];

export const categoryOptions = [
  "Kraft",
  "Ausdauer",
  "Mobility",
  "Skills",
  "Functional",
];

export const movementPatternOptions = [
  { value: "push", labelKey: "exerciseLibrary.movement.push", fallback: "Push" },
  { value: "pull", labelKey: "exerciseLibrary.movement.pull", fallback: "Pull" },
  { value: "squat", labelKey: "exerciseLibrary.movement.squat", fallback: "Squat" },
  { value: "hinge", labelKey: "exerciseLibrary.movement.hinge", fallback: "Hinge" },
  { value: "carry", labelKey: "exerciseLibrary.movement.carry", fallback: "Carry" },
  { value: "rotation", labelKey: "exerciseLibrary.movement.rotation", fallback: "Rotation" },
  { value: "isometric", labelKey: "exerciseLibrary.movement.isometric", fallback: "Isometrisch" },
];
