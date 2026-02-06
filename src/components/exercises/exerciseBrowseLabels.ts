import type { TFunction } from "i18next";

export function getExerciseBrowseLabels(t: TFunction) {
  return {
    name: t("filters.sortName", "Name"),
    category: t("filters.sortCategory", "Kategorie"),
    discipline: t("filters.sortDiscipline", "Disziplin"),
    measurement: t("filters.sortMeasurement", "Einheit"),
    weight: t("filters.sortWeight", "Gewicht"),
    difficulty: t("filters.sortDifficulty", "Schwierigkeit"),
    muscleGroups: t("exerciseLibrary.muscleGroups", "Muskelgruppen"),
    weightRequired: t("exerciseLibrary.requiresWeight", "Gewicht erforderlich"),
    time: t("exerciseLibrary.time", "Zeit"),
    distance: t("exerciseLibrary.distance", "Distanz"),
  };
}
