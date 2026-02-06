export const normalizeExerciseUnit = (unit?: string | null): string => {
  if (!unit) return "";
  const raw = String(unit).trim();
  const lower = raw.toLowerCase();

  if (
    [
      "reps",
      "rep",
      "wdh",
      "wdhs",
      "wiederholung",
      "wiederholungen",
    ].includes(lower)
  ) {
    return "reps";
  }

  if (
    [
      "sec",
      "secs",
      "second",
      "seconds",
      "sek",
      "sekunde",
      "sekunden",
      "s",
    ].includes(lower)
  ) {
    return "sec";
  }

  if (
    [
      "min",
      "mins",
      "minute",
      "minutes",
      "minute(n)",
      "minuten",
    ].includes(lower)
  ) {
    return "min";
  }

  if (
    [
      "miles",
      "mile",
      "mi",
      "meile",
      "meilen",
    ].includes(lower)
  ) {
    return "miles";
  }

  if (
    [
      "km",
      "kilometer",
      "kilometers",
      "kilometre",
      "kilometres",
    ].includes(lower)
  ) {
    return "km";
  }

  if (
    [
      "m",
      "meter",
      "meters",
      "metre",
      "metres",
    ].includes(lower)
  ) {
    return "m";
  }

  return raw;
};

export const extractNormalizedExerciseUnits = (
  unitOptions?: Array<string | { value?: string; label?: string }>
) => {
  if (!Array.isArray(unitOptions)) return [];
  const values = unitOptions
    .map((option) => {
      if (typeof option === "string") return normalizeExerciseUnit(option);
      return (
        normalizeExerciseUnit(option?.value || "") ||
        normalizeExerciseUnit(option?.label || "")
      );
    })
    .filter(Boolean);
  return Array.from(new Set(values));
};
