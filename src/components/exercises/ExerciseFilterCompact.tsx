import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import {
  getExerciseCategoryLabel,
  getExerciseMovementPatternLabel,
  getExerciseMuscleGroupLabel,
} from "@/components/exercises/exerciseLabels";

interface OptionItem {
  value: string;
  labelKey?: string;
  fallback?: string;
}

export interface ExerciseFilterCompactState {
  sortBy: string;
  category: string;
  movementPattern: string;
  measurementType: string;
  muscleGroup: string;
  equipment: string;
  requiresWeight: string;
}

interface ExerciseFilterCompactProps {
  filters: ExerciseFilterCompactState;
  onFiltersChange: (next: Partial<ExerciseFilterCompactState>) => void;
  facets: { categories: string[]; muscleGroups: string[]; equipment: string[] };
  movementPatternOptions: OptionItem[];
  measurementOptions: OptionItem[];
  showSort?: boolean;
}

export const ExerciseFilterCompact = ({
  filters,
  onFiltersChange,
  facets,
  movementPatternOptions,
  measurementOptions,
  showSort = true,
}: ExerciseFilterCompactProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-2">
      {showSort && (
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFiltersChange({ sortBy: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("training.form.sortBy", "Sortieren")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">
              {t("training.form.sortPopular", "Beliebt")}
            </SelectItem>
            <SelectItem value="name-asc">
              {t("training.form.sortNameAsc", "Name (A–Z)")}
            </SelectItem>
            <SelectItem value="name-desc">
              {t("training.form.sortNameDesc", "Name (Z–A)")}
            </SelectItem>
          </SelectContent>
        </Select>
      )}
      <Select
        value={filters.category}
        onValueChange={(value) => onFiltersChange({ category: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("training.form.filterCategory", "Kategorie")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
          {facets.categories.map((item) => (
            <SelectItem key={item} value={item}>
              {getExerciseCategoryLabel(item, t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.movementPattern}
        onValueChange={(value) => onFiltersChange({ movementPattern: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("training.form.filterPattern", "Bewegung")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
          {movementPatternOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {getExerciseMovementPatternLabel(item.value, t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.measurementType}
        onValueChange={(value) => onFiltersChange({ measurementType: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("training.form.filterType", "Einheitstyp")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
          {measurementOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.labelKey ? t(item.labelKey, item.fallback) : item.fallback}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.muscleGroup}
        onValueChange={(value) => onFiltersChange({ muscleGroup: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("training.form.filterMuscle", "Muskel")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
          {facets.muscleGroups.map((item) => (
            <SelectItem key={item} value={item}>
              {getExerciseMuscleGroupLabel(item, t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.equipment}
        onValueChange={(value) => onFiltersChange({ equipment: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("training.form.filterEquipment", "Equipment")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
          {facets.equipment.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.requiresWeight}
        onValueChange={(value) => onFiltersChange({ requiresWeight: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("training.form.filterWeight", "Gewicht")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.all", "Alle")}</SelectItem>
          <SelectItem value="yes">
            {t("training.form.filterWeightRequired", "Gewicht erforderlich")}
          </SelectItem>
          <SelectItem value="no">
            {t("training.form.filterWeightOptional", "Kein Gewicht")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
