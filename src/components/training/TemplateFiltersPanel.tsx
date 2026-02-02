import { MuscleGroupSelector } from "@/components/exercises/MuscleGroupSelector";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "react-i18next";

interface TemplateFiltersPanelProps {
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  categoryOptions: string[];
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  disciplineOptions: string[];
  disciplineFilter: string;
  onDisciplineFilterChange: (value: string) => void;
  movementPatternOptions: Array<{ value: string; label: string }>;
  movementPatternFilter: string;
  onMovementPatternFilterChange: (value: string) => void;
  muscleFilters: string[];
  onMuscleFiltersChange: (value: string[]) => void;
  muscleGroups: Array<{ label: string; children: string[] }>;
  difficultyRange: [number, number];
  onDifficultyRangeChange: (value: [number, number]) => void;
  onReset: () => void;
}

export function TemplateFiltersPanel({
  sourceFilter,
  onSourceFilterChange,
  categoryOptions,
  categoryFilter,
  onCategoryFilterChange,
  disciplineOptions,
  disciplineFilter,
  onDisciplineFilterChange,
  movementPatternOptions,
  movementPatternFilter,
  onMovementPatternFilterChange,
  muscleFilters,
  onMuscleFiltersChange,
  muscleGroups,
  difficultyRange,
  onDifficultyRangeChange,
  onReset,
}: TemplateFiltersPanelProps) {
  const { t } = useTranslation();
  const pillClass = "rounded-full px-3 text-xs";

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
            {t("training.templatesSource", "Quelle")}
          </div>
          <ToggleGroup
            type="single"
            value={sourceFilter}
            onValueChange={(next) => onSourceFilterChange(next || "all")}
            className="flex flex-wrap justify-start"
          >
            <ToggleGroupItem value="all" className={pillClass}>
              {t("filters.all", "Alle")}
            </ToggleGroupItem>
            <ToggleGroupItem value="own" className={pillClass}>
              {t("training.templatesOwn", "Deine Vorlagen")}
            </ToggleGroupItem>
            <ToggleGroupItem value="friends" className={pillClass}>
              {t("training.templatesFriends", "Vorlagen von Freunden")}
            </ToggleGroupItem>
            <ToggleGroupItem value="public" className={pillClass}>
              {t("training.templatesPublic", "Öffentliche Vorlagen")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.category", "Kategorie")}
          </div>
          <ToggleGroup
            type="single"
            value={categoryFilter}
            onValueChange={(next) => onCategoryFilterChange(next || "all")}
            className="flex flex-wrap justify-start"
          >
            <ToggleGroupItem value="all" className={pillClass}>
              {t("filters.all", "Alle")}
            </ToggleGroupItem>
            {categoryOptions.map((item) => (
              <ToggleGroupItem key={item} value={item} className={pillClass}>
                {item}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.discipline", "Disziplin")}
          </div>
          <ToggleGroup
            type="single"
            value={disciplineFilter}
            onValueChange={(next) => onDisciplineFilterChange(next || "all")}
            className="flex flex-wrap justify-start"
          >
            <ToggleGroupItem value="all" className={pillClass}>
              {t("filters.all", "Alle")}
            </ToggleGroupItem>
            {disciplineOptions.map((item) => (
              <ToggleGroupItem key={item} value={item} className={pillClass}>
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
            <ToggleGroupItem value="all" className={pillClass}>
              {t("filters.all", "Alle")}
            </ToggleGroupItem>
            {movementPatternOptions.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value} className={pillClass}>
                {option.label}
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
            {t("exerciseLibrary.muscleGroups", "Muskelgruppen")}
          </div>
          <MuscleGroupSelector
            value={muscleFilters}
            onChange={onMuscleFiltersChange}
            groups={muscleGroups}
            placeholder={t("exerciseLibrary.muscleGroupsPlaceholder", "Muskelgruppen auswählen")}
          />
        </div>
      </div>
    </div>
  );
}
