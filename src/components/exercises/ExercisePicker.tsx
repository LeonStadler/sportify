import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, ChevronDown, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/exercise";
import { getExerciseCategoryLabel } from "@/components/exercises/exerciseLabels";
import { measurementOptions, movementPatternOptions } from "@/components/exercises/exerciseOptions";
import {
  ExerciseFilterCompact,
  ExerciseFilterCompactState,
} from "@/components/exercises/ExerciseFilterCompact";

type ExerciseFacets = {
  categories: string[];
  muscleGroups: string[];
  equipment: string[];
};

const measurementTypeOptions = measurementOptions.map((option) => ({
  value: option.value,
  labelKey: option.labelKey,
  fallback: option.fallback,
}));

export interface ExercisePickerProps {
  value?: string;
  onSelect: (exerciseId: string) => void;
  exercises: Exercise[];
  facets: ExerciseFacets;
  hasError?: boolean;
  enableFilters?: boolean;
  placeholder?: string;
}

export const ExercisePicker = ({
  value,
  onSelect,
  exercises,
  facets,
  hasError,
  enableFilters = true,
  placeholder,
}: ExercisePickerProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<
    ExerciseFilterCompactState & { query: string }
  >({
    query: "",
    category: "all",
    movementPattern: "all",
    measurementType: "all",
    muscleGroup: "all",
    equipment: "all",
    requiresWeight: "all",
    sortBy: "popular",
  });

  const selectedExercise =
    exercises.find((exercise) => exercise.id === value) || null;

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return exercises.filter((exercise) => {
      if (filters.category !== "all" && exercise.category !== filters.category) {
        return false;
      }
      if (
        filters.movementPattern !== "all" &&
        exercise.movementPattern !== filters.movementPattern
      ) {
        return false;
      }
      if (
        filters.measurementType !== "all" &&
        exercise.measurementType !== filters.measurementType
      ) {
        return false;
      }
      if (
        filters.muscleGroup !== "all" &&
        !(exercise.muscleGroups || []).includes(filters.muscleGroup)
      ) {
        return false;
      }
      if (
        filters.equipment !== "all" &&
        !(exercise.equipment || []).includes(filters.equipment)
      ) {
        return false;
      }
      if (filters.requiresWeight !== "all") {
        const requiresWeight = exercise.requiresWeight === true;
        if (filters.requiresWeight === "yes" && !requiresWeight) {
          return false;
        }
        if (filters.requiresWeight === "no" && requiresWeight) {
          return false;
        }
      }
      if (!query) return true;
      return (
        exercise.name?.toLowerCase().includes(query) ||
        exercise.slug?.toLowerCase().includes(query)
      );
    });
  }, [exercises, filters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (filters.sortBy) {
      case "name-desc":
        return list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      case "name-asc":
        return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "popular":
      default:
        return list.sort(
          (a, b) =>
            (b.usagePoints ?? 0) - (a.usagePoints ?? 0) ||
            (b.usageCount ?? 0) - (a.usageCount ?? 0) ||
            (a.name || "").localeCompare(b.name || "")
        );
    }
  }, [filtered, filters.sortBy]);

  const favoriteExercises = useMemo(
    () =>
      sorted.filter((exercise) => exercise.isFavorite),
    [sorted]
  );

  const popularExercises = useMemo(() => {
    return [...sorted]
      .filter((exercise) => (exercise.usagePoints ?? 0) > 0)
      .sort((a, b) => (b.usagePoints ?? 0) - (a.usagePoints ?? 0))
      .slice(0, 5);
  }, [sorted]);

  const options = useMemo(() => {
    if (!selectedExercise) return filtered;
    if (filtered.some((exercise) => exercise.id === selectedExercise.id)) {
      return sorted;
    }
    return [selectedExercise, ...sorted];
  }, [filtered, selectedExercise, sorted]);

  const resetFilters = () => {
    setFilters({
      query: "",
      category: "all",
      movementPattern: "all",
      measurementType: "all",
      muscleGroup: "all",
      equipment: "all",
      requiresWeight: "all",
      sortBy: "popular",
    });
    setShowFilters(false);
  };

  const getMeasurementLabel = (value?: string | null) =>
    measurementTypeOptions.find((option) => option.value === value)?.fallback ??
    value ??
    "-";

  const renderExerciseItem = (exercise: Exercise) => (
    <CommandItem
      key={exercise.id}
      value={exercise.name}
      onSelect={() => {
        onSelect(exercise.id);
        setOpen(false);
      }}
      className="flex items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {exercise.isFavorite && <Star className="h-3.5 w-3.5 text-yellow-500" />}
          <div className="font-medium">{exercise.name}</div>
        </div>
        <div className="text-xs text-muted-foreground">
          {getExerciseCategoryLabel(exercise.category, t) || "-"} ·{" "}
          {getMeasurementLabel(exercise.measurementType)}
        </div>
      </div>
      {value === exercise.id && <Check className="h-4 w-4 text-primary" />}
    </CommandItem>
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          resetFilters();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between mt-1",
            hasError && "border-destructive focus-visible:ring-destructive"
          )}
        >
          {selectedExercise?.name ||
            placeholder ||
            t("training.form.selectExercise", "Übung wählen")}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      {hasError && (
        <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3" />
          <span>{t("training.form.exerciseRequired", "Bitte wähle eine Übung aus.")}</span>
        </div>
      )}
      <PopoverContent
        className="p-0 max-h-[70vh] overflow-hidden"
        align="start"
        style={{
          width: "min(var(--radix-popover-trigger-width), 360px)",
          maxWidth: "90vw",
        }}
      >
        <Command shouldFilter={false} className="max-h-[70vh] overflow-hidden">
          <CommandInput
            placeholder={t("training.form.searchExercise", "Übung suchen")}
            value={filters.query}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, query: value }))
            }
          />

          {enableFilters && (
            <>
              {showFilters && (
                <div className="p-3 space-y-2 border-b bg-muted/30">
                  <ExerciseFilterCompact
                    filters={{
                      sortBy: filters.sortBy,
                      category: filters.category,
                      movementPattern: filters.movementPattern,
                      measurementType: filters.measurementType,
                      muscleGroup: filters.muscleGroup,
                      equipment: filters.equipment,
                      requiresWeight: filters.requiresWeight,
                    }}
                    onFiltersChange={(next) =>
                      setFilters((prev) => ({ ...prev, ...next }))
                    }
                    facets={facets}
                    movementPatternOptions={movementPatternOptions}
                    measurementOptions={measurementTypeOptions}
                  />
                </div>
              )}

              <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  {showFilters
                    ? t("training.form.hideFilters", "Filter ausblenden")
                    : t("training.form.showFilters", "Filter anzeigen")}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={resetFilters}
                >
                  {t("filters.reset", "Filter zurücksetzen")}
                </button>
              </div>
            </>
          )}

          <CommandList
            className="max-h-[320px] overflow-y-auto overscroll-contain"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <CommandEmpty>
              {t("training.form.noExercises", "Keine Übungen gefunden")}
            </CommandEmpty>

            {favoriteExercises.length > 0 && (
              <>
                <CommandGroup heading={t("exerciseLibrary.favorites", "Favoriten")}>
                  {favoriteExercises.map(renderExerciseItem)}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {popularExercises.length > 0 && (
              <>
                <CommandGroup heading={t("exerciseLibrary.popular", "Beliebt")}>
                  {popularExercises.map(renderExerciseItem)}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup heading={t("training.form.exerciseResults", "Übungen")}>
              {options.map(renderExerciseItem)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
