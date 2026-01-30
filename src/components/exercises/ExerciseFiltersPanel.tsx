import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "react-i18next";
import { MuscleGroupSelector } from "@/components/exercises/MuscleGroupSelector";

interface OptionItem {
  value: string;
  labelKey?: string;
  fallback?: string;
}

interface ExerciseFiltersPanelProps {
  categoryOptions: string[];
  disciplineOptions: string[];
  movementPatternOptions: OptionItem[];
  measurementOptions: OptionItem[];
  muscleGroups: Array<{ label: string; children: string[] }>;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  disciplineFilter: string;
  onDisciplineFilterChange: (value: string) => void;
  movementPatternFilter: string;
  onMovementPatternFilterChange: (value: string) => void;
  measurementFilters: string[];
  onMeasurementFiltersChange: (value: string[]) => void;
  muscleFilters: string[];
  onMuscleFiltersChange: (value: string[]) => void;
  requiresWeightFilter: string;
  onRequiresWeightFilterChange: (value: string) => void;
  difficultyRange: [number, number];
  onDifficultyRangeChange: (value: [number, number]) => void;
  onReset: () => void;
}

export function ExerciseFiltersPanel({
  categoryOptions,
  disciplineOptions,
  movementPatternOptions,
  measurementOptions,
  muscleGroups,
  categoryFilter,
  onCategoryFilterChange,
  disciplineFilter,
  onDisciplineFilterChange,
  movementPatternFilter,
  onMovementPatternFilterChange,
  measurementFilters,
  onMeasurementFiltersChange,
  muscleFilters,
  onMuscleFiltersChange,
  requiresWeightFilter,
  onRequiresWeightFilterChange,
  difficultyRange,
  onDifficultyRangeChange,
  onReset,
}: ExerciseFiltersPanelProps) {
  const { t } = useTranslation();
  const filterPillClass = "rounded-full px-3 text-xs";

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{t("filters.title", "Filter")}</div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          {t("filters.reset", "Zurücksetzen")}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.category")}
          </div>
          <ToggleGroup
            type="single"
            value={categoryFilter}
            onValueChange={(next) => onCategoryFilterChange(next || "all")}
            className="flex flex-wrap justify-start"
          >
            <ToggleGroupItem value="all" className={filterPillClass}>
              {t("filters.all", "Alle")}
            </ToggleGroupItem>
            {categoryOptions.map((item) => (
              <ToggleGroupItem key={item} value={item} className={filterPillClass}>
                {item}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.discipline")}
          </div>
          <ToggleGroup
            type="single"
            value={disciplineFilter}
            onValueChange={(next) => onDisciplineFilterChange(next || "all")}
            className="flex flex-wrap justify-start"
          >
            <ToggleGroupItem value="all" className={filterPillClass}>
              {t("filters.all", "Alle")}
            </ToggleGroupItem>
            {disciplineOptions.map((item) => (
              <ToggleGroupItem key={item} value={item} className={filterPillClass}>
                {item}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.movementPattern", "Bewegungsmuster")}
          </div>
          <ToggleGroup
            type="single"
            value={movementPatternFilter}
            onValueChange={(next) => onMovementPatternFilterChange(next || "all")}
            className="flex flex-wrap justify-start"
          >
            <ToggleGroupItem value="all" className={filterPillClass}>
              {t("filters.all", "Alle")}
            </ToggleGroupItem>
            {movementPatternOptions.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value} className={filterPillClass}>
                {item.labelKey ? t(item.labelKey, item.fallback) : item.fallback}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.measurement")}
          </div>
          <ToggleGroup
            type="multiple"
            value={measurementFilters}
            onValueChange={(next) => onMeasurementFiltersChange(next)}
            className="flex flex-wrap justify-start"
          >
            {measurementOptions.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value} className={filterPillClass}>
                {item.labelKey ? t(item.labelKey, item.fallback) : item.fallback}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.difficulty", "Schwierigkeit")}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Slider
              value={difficultyRange}
              min={1}
              max={10}
              step={1}
              onValueChange={(next) =>
                onDifficultyRangeChange([next[0], next[1] ?? next[0]])
              }
              className="flex-1"
            />
            <div className="text-sm text-muted-foreground">
              {difficultyRange[0]}–{difficultyRange[1]}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.muscleGroups")}
          </div>
          <MuscleGroupSelector
            value={muscleFilters}
            onChange={onMuscleFiltersChange}
            groups={muscleGroups}
            placeholder={t("exerciseLibrary.muscleGroupsPlaceholder", "Muskelgruppen auswählen")}
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.requiresWeight", "Gewicht")}
          </div>
          <ToggleGroup
            type="single"
            value={requiresWeightFilter}
            onValueChange={(next) => onRequiresWeightFilterChange(next || "all")}
            className="flex flex-wrap justify-start"
          >
            <ToggleGroupItem value="all" className={filterPillClass}>
              {t("filters.all", "Alle")}
            </ToggleGroupItem>
            <ToggleGroupItem value="yes" className={filterPillClass}>
              {t("exerciseLibrary.requiresWeight", "Gewicht erforderlich")}
            </ToggleGroupItem>
            <ToggleGroupItem value="no" className={filterPillClass}>
              {t("exerciseLibrary.noWeight", "Kein Gewicht")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
