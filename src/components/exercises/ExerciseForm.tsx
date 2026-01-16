import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Check, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type ExerciseFormValue = {
  name: string;
  description: string;
  category: string;
  discipline: string;
  movementPattern: string;
  measurementTypes: string[];
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
}

const measurementOptions = [
  { value: "reps", labelKey: "training.form.measurementReps" },
  { value: "time", labelKey: "training.form.measurementTime" },
  { value: "distance", labelKey: "training.form.measurementDistance" },
];

const muscleGroupOptions = [
  "Brust",
  "Rücken",
  "Schultern",
  "Bizeps",
  "Trizeps",
  "Unterarme",
  "Core",
  "Gluteus",
  "Quadrizeps",
  "Hamstrings",
  "Waden",
];

const disciplineOptions = [
  "Calisthenics",
  "Kraft",
  "Ausdauer",
  "Functional",
  "Mobility",
];

const categoryOptions = [
  "Kraft",
  "Ausdauer",
  "Mobility",
  "Skills",
];

const movementPatternOptions = [
  { value: "push", labelKey: "training.form.patternPush" },
  { value: "pull", labelKey: "training.form.patternPull" },
  { value: "legs", labelKey: "training.form.patternLegs" },
  { value: "core", labelKey: "training.form.patternCore" },
  { value: "full", labelKey: "training.form.patternFull" },
];

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
}: ExerciseFormProps) {
  const { t } = useTranslation();

  const descriptionIsOpen = descriptionOpen ?? Boolean(value.description);

  const setField = (field: keyof ExerciseFormValue, fieldValue: ExerciseFormValue[keyof ExerciseFormValue]) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const difficultyPlaceholder = useMemo(
    () => t("exerciseLibrary.difficulty", "Schwierigkeit"),
    [t]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("exerciseLibrary.name")}</Label>
          <Input
            value={value.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder={t("exerciseLibrary.namePlaceholder", "z.B. Pull-Ups")}
          />
        </div>
        <div>
          <Label>{t("exerciseLibrary.category")}</Label>
          <Select value={value.category} onValueChange={(next) => setField("category", next)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("exerciseLibrary.discipline")}</Label>
          <Select value={value.discipline} onValueChange={(next) => setField("discipline", next)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t("exerciseLibrary.discipline", "Disziplin")} />
            </SelectTrigger>
            <SelectContent>
              {disciplineOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("exerciseLibrary.pattern")}</Label>
          <Select value={value.movementPattern} onValueChange={(next) => setField("movementPattern", next)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {movementPatternOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {t(item.labelKey)}
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
          onValueChange={(values) => setField("measurementTypes", values)}
        >
          {measurementOptions.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value}>
              {t(item.labelKey)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("exerciseLibrary.muscleGroups")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between mt-1">
                {value.muscleGroups.length
                  ? value.muscleGroups.join(", ")
                  : t("exerciseLibrary.muscleGroupsPlaceholder", "Muskelgruppen auswählen")}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0">
              <Command>
                <CommandInput placeholder={t("exerciseLibrary.searchMuscle", "Suchen")} />
                <CommandList>
                  <CommandEmpty>{t("exerciseLibrary.noMatches", "Keine Treffer")}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__clear__"
                      onSelect={() => setField("muscleGroups", [])}
                      className="text-muted-foreground"
                    >
                      {t("exerciseLibrary.clearMuscles", "Alle abwählen")}
                    </CommandItem>
                    {muscleGroupOptions.map((group) => (
                      <CommandItem
                        key={group}
                        value={group}
                        onSelect={() => {
                          setField(
                            "muscleGroups",
                            value.muscleGroups.includes(group)
                              ? value.muscleGroups.filter((g) => g !== group)
                              : [...value.muscleGroups, group]
                          );
                        }}
                      >
                        <span className="mr-2">
                          {value.muscleGroups.includes(group) ? <Check className="h-4 w-4" /> : null}
                        </span>
                        {group}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>{t("exerciseLibrary.equipment")}</Label>
          <Input
            value={value.equipment}
            onChange={(e) => setField("equipment", e.target.value)}
            placeholder={t("exerciseLibrary.equipmentPlaceholder", "z.B. bodyweight, barbell")}
            className="mt-1"
          />
        </div>
      </div>

      {showDescriptionToggle ? (
        <Collapsible open={descriptionIsOpen} onOpenChange={onDescriptionToggle ?? (() => undefined)}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="px-0">
              {descriptionIsOpen
                ? t("exerciseLibrary.hideDescription", "Beschreibung ausblenden")
                : t("exerciseLibrary.addDescription", "Beschreibung hinzufügen")}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Textarea
              value={value.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t("exerciseLibrary.descriptionPlaceholder", "Optional")}
            />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <Textarea
          value={value.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder={t("exerciseLibrary.descriptionPlaceholder", "Optional")}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Switch checked={value.requiresWeight} onCheckedChange={(next) => setField("requiresWeight", next)} />
          <span className="text-sm">{t("exerciseLibrary.requiresWeight", "Gewicht erforderlich")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.allowsWeight} onCheckedChange={(next) => setField("allowsWeight", next)} />
          <span className="text-sm">{t("exerciseLibrary.allowsWeight", "Gewicht optional")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.supportsSets} onCheckedChange={(next) => setField("supportsSets", next)} />
          <span className="text-sm">{t("exerciseLibrary.supportsSets", "Sets/Reps")}</span>
        </div>
      </div>

      {!hideSubmit && onSubmit && (
        <Button onClick={onSubmit} disabled={submitDisabled}>
          {submitLabel || t("exerciseLibrary.create", "Übung erstellen")}
        </Button>
      )}
    </div>
  );
}
