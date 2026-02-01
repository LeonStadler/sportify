import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MuscleGroupSelector } from "@/components/exercises/MuscleGroupSelector";
import { getExerciseCategoryLabel, getExerciseDisciplineLabel } from "@/components/exercises/exerciseLabels";
import { cn } from "@/lib/utils";
import {
  categoryOptions,
  disciplineOptions,
  measurementOptions,
  movementPatternOptions,
  muscleGroupTree,
} from "@/components/exercises/exerciseOptions";
import { ChevronDown, Info } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type ExerciseFormValue = {
  name: string;
  description: string;
  category: string;
  discipline: string;
  movementPattern: string;
  measurementTypes: string[];
  distanceUnit: string;
  timeUnit: string;
  difficulty: number;
  requiresWeight: boolean;
  allowsWeight: boolean;
  supportsSets: boolean;
  muscleGroups: string[];
  equipment: string;
};

interface ExerciseFormProps {
  value: ExerciseFormValue;
  onChange: (next: ExerciseFormValue) => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  showDescriptionToggle?: boolean;
  descriptionOpen?: boolean;
  onDescriptionToggle?: (open: boolean) => void;
  hideSubmit?: boolean;
  nameSuggestions?: string[];
  nameCheckLoading?: boolean;
  nameExactMatch?: boolean;
  confirmSimilar?: boolean;
  onConfirmSimilarChange?: (value: boolean) => void;
  defaultDistanceUnit?: string;
  defaultTimeUnit?: string;
}

export function ExerciseForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  submitDisabled,
  showDescriptionToggle = true,
  descriptionOpen,
  onDescriptionToggle,
  hideSubmit,
  nameSuggestions,
  nameCheckLoading,
  nameExactMatch,
  confirmSimilar,
  onConfirmSimilarChange,
  defaultDistanceUnit = "km",
  defaultTimeUnit = "min",
}: ExerciseFormProps) {
  const { t } = useTranslation();

  const descriptionIsOpen = descriptionOpen ?? Boolean(value.description);

  const setField = (field: keyof ExerciseFormValue, fieldValue: ExerciseFormValue[keyof ExerciseFormValue]) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const categoryOptionsWithValue = useMemo(() => {
    if (value.category && !categoryOptions.includes(value.category)) {
      return [value.category, ...categoryOptions];
    }
    return categoryOptions;
  }, [value.category]);

  const disciplineOptionsWithValue = useMemo(() => {
    if (value.discipline && !disciplineOptions.includes(value.discipline)) {
      return [value.discipline, ...disciplineOptions];
    }
    return disciplineOptions;
  }, [value.discipline]);

  const movementOptionsWithValue = useMemo(() => {
    if (value.movementPattern && !movementPatternOptions.some((item) => item.value === value.movementPattern)) {
      return [
        { value: value.movementPattern, labelKey: "", fallback: value.movementPattern },
        ...movementPatternOptions,
      ];
    }
    return movementPatternOptions;
  }, [value.movementPattern]);


  const nameStatus = nameCheckLoading
    ? "loading"
    : nameExactMatch
      ? "exact"
      : nameSuggestions && nameSuggestions.length > 0
        ? "similar"
        : "ok";

  const normalizeMeasurementTypes = (prev: string[], next: string[]) => {
    const added = next.find((item) => !prev.includes(item));
    let result = [...next];

    if (result.includes("reps") && result.includes("distance")) {
      result =
        added === "reps"
          ? result.filter((item) => item !== "distance")
          : result.filter((item) => item !== "reps");
    }

    if (result.length === 0) {
      return prev.length ? prev : ["reps"];
    }

    return result;
  };

  const handleMeasurementChange = (next: string[]) => {
    const normalized = normalizeMeasurementTypes(value.measurementTypes, next);
    const nextValue: ExerciseFormValue = { ...value, measurementTypes: normalized };

    if (normalized.includes("reps")) {
      nextValue.supportsSets = true;
    } else if (normalized.includes("distance")) {
      nextValue.supportsSets = false;
    } else if (normalized.includes("time")) {
      nextValue.supportsSets = true;
    }

    if (normalized.includes("distance") && !value.distanceUnit) {
      nextValue.distanceUnit = defaultDistanceUnit;
    }
    if (normalized.includes("time") && !value.timeUnit) {
      nextValue.timeUnit = defaultTimeUnit;
    }

    onChange(nextValue);
  };

  const handleRequiresWeightChange = (next: boolean) => {
    onChange({
      ...value,
      requiresWeight: next,
      allowsWeight: next ? false : value.allowsWeight,
    });
  };

  const handleAllowsWeightChange = (next: boolean) => {
    onChange({
      ...value,
      allowsWeight: next,
      requiresWeight: next ? false : value.requiresWeight,
    });
  };

  const difficultyPlaceholder = useMemo(
    () => t("exerciseLibrary.difficulty", "Schwierigkeit"),
    [t]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2">
            <Label>{t("exerciseLibrary.name")}</Label>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">{t("common.info", "Information")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm" side="right" align="center" collisionPadding={16}>
                  {t(
                    "exerciseLibrary.nameHint",
                    "Nutze möglichst etablierte Namen (z.B. 'Pull-Ups', 'Bench Press') und halte die Schreibweise konsistent."
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            value={value.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder={t("exerciseLibrary.namePlaceholder", "z.B. Pull-Ups")}
          />
          <div className="mt-2 min-h-[32px] space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={`h-2 w-2 rounded-full ${
                  nameStatus === "exact"
                    ? "bg-destructive"
                    : nameStatus === "similar"
                      ? "bg-amber-500"
                      : nameStatus === "loading"
                        ? "bg-muted-foreground"
                        : "bg-emerald-500"
                }`}
              />
              <span>
                {nameStatus === "loading" &&
                  t("exerciseLibrary.nameChecking", "Prüfe ähnliche Übungen...")}
                {nameStatus === "exact" &&
                  t("exerciseLibrary.nameExists", "Name existiert bereits.")}
                {nameStatus === "similar" &&
                  t("exerciseLibrary.similarNames", "Ähnliche Übungen gefunden")}
                {nameStatus === "ok" &&
                  t("exerciseLibrary.nameOk", "Name verfügbar")}
              </span>
            </div>
            {nameStatus === "similar" && nameSuggestions && nameSuggestions.length > 0 && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-1">
                  {nameSuggestions.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {nameStatus === "similar" && onConfirmSimilarChange && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={Boolean(confirmSimilar)}
                  onCheckedChange={(checked) => onConfirmSimilarChange(Boolean(checked))}
                />
                {t(
                  "exerciseLibrary.similarConfirm",
                  "Ich bestätige, dass es sich um eine andere Übung handelt."
                )}
              </label>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-[220px]">
          <Label>{t("exerciseLibrary.category")}</Label>
          <Select value={value.category} onValueChange={(next) => setField("category", next)}>
            <SelectTrigger className={cn("mt-1", !value.category && "text-muted-foreground")}>
              <SelectValue placeholder={t("exerciseLibrary.category", "Kategorie")} />
            </SelectTrigger>
            <SelectContent className="z-[300]">
              {categoryOptionsWithValue.map((item) => (
                <SelectItem key={item} value={item}>
                  {getExerciseCategoryLabel(item, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <Label>{t("exerciseLibrary.discipline")}</Label>
          <Select value={value.discipline} onValueChange={(next) => setField("discipline", next)}>
            <SelectTrigger className={cn("mt-1", !value.discipline && "text-muted-foreground")}>
              <SelectValue placeholder={t("exerciseLibrary.discipline", "Disziplin")} />
            </SelectTrigger>
            <SelectContent className="z-[300]">
              {disciplineOptionsWithValue.map((item) => (
                <SelectItem key={item} value={item}>
                  {getExerciseDisciplineLabel(item, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <Label>{t("exerciseLibrary.pattern")}</Label>
          <Select value={value.movementPattern} onValueChange={(next) => setField("movementPattern", next)}>
            <SelectTrigger className={cn("mt-1", !value.movementPattern && "text-muted-foreground")}>
              <SelectValue placeholder={t("exerciseLibrary.pattern", "Bewegungsmuster")} />
            </SelectTrigger>
            <SelectContent className="z-[300]">
              {movementOptionsWithValue.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.labelKey ? t(item.labelKey, item.fallback) : item.fallback}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("exerciseLibrary.measurement")}</Label>
        <ToggleGroup
          type="multiple"
          className="flex flex-wrap justify-start gap-2"
          value={value.measurementTypes}
          onValueChange={handleMeasurementChange}
        >
          {measurementOptions.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value}>
              {t(item.labelKey, item.fallback)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {(value.measurementTypes.includes("distance") || value.measurementTypes.includes("time")) && (
        <div className="flex flex-wrap gap-4">
          {value.measurementTypes.includes("distance") && (
            <div className="flex-1 min-w-[220px]">
              <Label>{t("exerciseLibrary.defaultDistanceUnit", "Standard Distanz-Einheit")}</Label>
              <Select
                value={value.distanceUnit || defaultDistanceUnit}
                onValueChange={(next) => setField("distanceUnit", next)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">{t("training.form.units.kilometers")}</SelectItem>
                  <SelectItem value="m">{t("training.form.units.meters")}</SelectItem>
                  <SelectItem value="miles">{t("training.form.units.miles")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {value.measurementTypes.includes("time") && (
            <div className="flex-1 min-w-[220px]">
              <Label>{t("exerciseLibrary.defaultTimeUnit", "Standard Zeit-Einheit")}</Label>
              <Select
                value={value.timeUnit || defaultTimeUnit}
                onValueChange={(next) => setField("timeUnit", next)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="min">{t("training.form.units.minutes", "Minuten")}</SelectItem>
                  <SelectItem value="sec">{t("training.form.units.seconds", "Sekunden")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>{t("exerciseLibrary.difficulty")}</Label>
        <div className="flex items-center gap-3">
          <Slider
            value={[value.difficulty]}
            min={1}
            max={10}
            step={1}
            onValueChange={(next) => setField("difficulty", next[0])}
            className="flex-1"
          />
          <Input
            type="number"
            min="1"
            max="10"
            value={value.difficulty}
            onChange={(e) => setField("difficulty", Number(e.target.value) || 1)}
            className="w-24"
            placeholder={difficultyPlaceholder}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px]">
          <Label>{t("exerciseLibrary.muscleGroups")}</Label>
          <div className="mt-1">
            <MuscleGroupSelector
              value={value.muscleGroups}
              onChange={(next) => setField("muscleGroups", next)}
              groups={muscleGroupTree}
              placeholder={t("exerciseLibrary.muscleGroupsPlaceholder", "Muskelgruppen auswählen")}
            />
          </div>
        </div>
        <div className="flex-1 min-w-[240px]">
          <Label>{t("exerciseLibrary.equipment")}</Label>
          <Input
            value={value.equipment}
            onChange={(e) => setField("equipment", e.target.value)}
            placeholder={t("exerciseLibrary.equipmentPlaceholder", "z.B. bodyweight, barbell")}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Switch checked={value.requiresWeight} onCheckedChange={handleRequiresWeightChange} />
          <span className="text-sm">{t("exerciseLibrary.requiresWeight", "Gewicht erforderlich")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.allowsWeight} onCheckedChange={handleAllowsWeightChange} />
          <span className="text-sm">{t("exerciseLibrary.allowsWeight", "Gewicht optional")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.supportsSets} onCheckedChange={(next) => setField("supportsSets", next)} />
          <span className="text-sm">{t("exerciseLibrary.supportsSets", "Sets/Reps")}</span>
        </div>
      </div>

      {showDescriptionToggle ? (
        <Accordion
          type="single"
          collapsible
          value={descriptionIsOpen ? "description" : ""}
          onValueChange={(next) => (onDescriptionToggle ? onDescriptionToggle(next === "description") : undefined)}
          className="space-y-2"
        >
          <AccordionItem value="description" className="border rounded-md">
            <AccordionTrigger className="px-4 py-2 text-sm">
              {t("exerciseLibrary.description", "Beschreibung")}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Textarea
                value={value.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder={t("exerciseLibrary.descriptionPlaceholder", "Optional")}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <Textarea
          value={value.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder={t("exerciseLibrary.descriptionPlaceholder", "Optional")}
        />
      )}

      {!hideSubmit && onSubmit && (
        <Button onClick={onSubmit} disabled={submitDisabled}>
          {submitLabel || t("exerciseLibrary.create", "Übung erstellen")}
        </Button>
      )}
    </div>
  );
}
