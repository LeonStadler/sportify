import { PageTemplate } from "@/components/common/PageTemplate";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import type { ExerciseFormValue } from "@/components/exercises/ExerciseForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import type { Exercise, ExerciseListResponse } from "@/types/exercise";
import { ArrowDown, ArrowUp, Check, ChevronDown, Info, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const buildEditChanges = (original: Exercise, draft: Partial<Exercise>) => {
  const changes = {};
  const fields: Array<keyof Exercise> = [
    "name",
    "description",
    "category",
    "discipline",
    "movementPattern",
    "measurementType",
    "requiresWeight",
    "allowsWeight",
    "supportsSets",
    "supportsTime",
    "supportsDistance",
    "supportsGrade",
    "difficultyTier",
    "muscleGroups",
    "equipment",
    "unitOptions",
  ];
  fields.forEach((field) => {
    const nextValue = draft[field];
    const prevValue = original[field];
    if (Array.isArray(nextValue)) {
      const nextSorted = [...nextValue].sort();
      const prevSorted = Array.isArray(prevValue) ? [...prevValue].sort() : [];
      if (JSON.stringify(nextSorted) !== JSON.stringify(prevSorted)) {
        changes[field] = nextValue;
      }
      return;
    }
    if (nextValue !== undefined && nextValue !== prevValue) {
      changes[field] = nextValue;
    }
  });
  return changes;
};

export function Exercises() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [facets, setFacets] = useState({ categories: [], muscleGroups: [], equipment: [] });
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [movementPatternFilter, setMovementPatternFilter] = useState("all");
  const [measurementFilters, setMeasurementFilters] = useState<string[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [requiresWeightFilter, setRequiresWeightFilter] = useState("all");
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 10]);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [formValue, setFormValue] = useState<ExerciseFormValue>({
    name: "",
    description: "",
    category: "Kraft",
    discipline: "",
    movementPattern: "push",
    measurementTypes: ["reps"],
    difficulty: 5,
    requiresWeight: false,
    allowsWeight: false,
    supportsSets: true,
    muscleGroups: [],
    equipment: "",
  });
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [editDraft, setEditDraft] = useState<ExerciseFormValue | null>(null);

  const movementPatternOptions = [
    { value: "push", label: t("exerciseLibrary.movement.push", "Push") },
    { value: "pull", label: t("exerciseLibrary.movement.pull", "Pull") },
    { value: "squat", label: t("exerciseLibrary.movement.squat", "Squat") },
    { value: "hinge", label: t("exerciseLibrary.movement.hinge", "Hinge") },
    { value: "carry", label: t("exerciseLibrary.movement.carry", "Carry") },
    { value: "rotation", label: t("exerciseLibrary.movement.rotation", "Rotation") },
    { value: "isometric", label: t("exerciseLibrary.movement.isometric", "Isometrisch") },
  ];

  const measurementOptions = [
    { value: "reps", label: t("training.form.measurementReps") },
    { value: "time", label: t("training.form.measurementTime") },
    { value: "distance", label: t("training.form.measurementDistance") },
  ];

  const sortOptions = [
    { value: "none", label: t("filters.sortNone", "Keine") },
    { value: "name", label: t("filters.sortName", "Name") },
    { value: "category", label: t("filters.sortCategory", "Kategorie") },
    { value: "discipline", label: t("filters.sortDiscipline", "Disziplin") },
    { value: "measurement", label: t("filters.sortMeasurement", "Einheit") },
    { value: "weight", label: t("filters.sortWeight", "Gewicht") },
    { value: "difficulty", label: t("filters.sortDifficulty", "Schwierigkeit") },
    { value: "newest", label: t("filters.sortNewest", "Neueste") },
  ];

  const handleSortClick = (next: string) => {
    if (sortBy !== next) {
      setSortBy(next);
      setSortDirection("asc");
      return;
    }
    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }
    setSortBy("none");
    setSortDirection("asc");
  };

  const loadExercises = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ limit: "500" });
      const response = await fetch(`${API_URL}/exercises?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Load failed");
      const data: ExerciseListResponse = await response.json();
      setExercises(Array.isArray(data.exercises) ? data.exercises : []);
      setFacets({
        categories: data.facets?.categories || [],
        muscleGroups: data.facets?.muscleGroups || [],
        equipment: data.facets?.equipment || [],
      });
    } catch (error) {
      console.error("Exercises load error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const filteredExercises = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = exercises.filter((exercise) => {
      if (categoryFilter !== "all" && exercise.category !== categoryFilter) return false;
      if (disciplineFilter !== "all" && exercise.discipline !== disciplineFilter) return false;
      if (movementPatternFilter !== "all" && exercise.movementPattern !== movementPatternFilter) return false;
      if (measurementFilters.length > 0) {
        const supportsReps =
          exercise.measurementType === "reps" || exercise.supportsSets || false;
        const supportsTime = exercise.supportsTime || exercise.measurementType === "time";
        const supportsDistance =
          exercise.supportsDistance || exercise.measurementType === "distance";
        const matches = measurementFilters.some((filter) => {
          if (filter === "reps") return supportsReps;
          if (filter === "time") return supportsTime;
          if (filter === "distance") return supportsDistance;
          return false;
        });
        if (!matches) return false;
      }
      if (muscleFilters.length > 0) {
        const groups = exercise.muscleGroups || [];
        if (!muscleFilters.some((item) => groups.includes(item))) return false;
      }
      if (requiresWeightFilter !== "all") {
        const required = exercise.requiresWeight === true;
        if (requiresWeightFilter === "yes" && !required) return false;
        if (requiresWeightFilter === "no" && required) return false;
      }
      const difficulty = exercise.difficultyTier ?? 5;
      if (difficulty < difficultyRange[0] || difficulty > difficultyRange[1]) return false;
      if (!q) return true;
      return (
        exercise.name?.toLowerCase().includes(q) ||
        exercise.slug?.toLowerCase().includes(q)
      );
    });
    if (sortBy === "none") return filtered;
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let base = 0;
      if (sortBy === "name") base = (a.name || "").localeCompare(b.name || "");
      if (sortBy === "difficulty") base = (a.difficultyTier ?? 0) - (b.difficultyTier ?? 0);
      if (sortBy === "category") base = (a.category || "").localeCompare(b.category || "");
      if (sortBy === "discipline") base = (a.discipline || "").localeCompare(b.discipline || "");
      if (sortBy === "measurement") base = (a.measurementType || "").localeCompare(b.measurementType || "");
      if (sortBy === "weight") base = (a.requiresWeight ? 1 : 0) - (b.requiresWeight ? 1 : 0);
      if (sortBy === "newest") {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        base = aTime - bTime;
      }
      return sortDirection === "asc" ? base : -base;
    });
    return sorted;
  }, [
    exercises,
    query,
    categoryFilter,
    disciplineFilter,
    movementPatternFilter,
    measurementFilters,
    muscleFilters,
    requiresWeightFilter,
    difficultyRange,
    sortBy,
    sortDirection,
  ]);

  const handleCreateExercise = async () => {
    if (!user) return;
    if (!formValue.name.trim()) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.nameRequired", "Bitte gib einen Namen an."),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const measurementType = formValue.measurementTypes.includes("time")
        ? "time"
        : formValue.measurementTypes.includes("distance")
          ? "distance"
          : "reps";

      const payload = {
        name: formValue.name.trim(),
        description: formValue.description.trim() || null,
        category: formValue.category,
        discipline: formValue.discipline || null,
        movementPattern: formValue.movementPattern,
        measurementType,
        difficultyTier: formValue.difficulty,
        requiresWeight: formValue.requiresWeight,
        allowsWeight: formValue.allowsWeight,
        supportsSets: formValue.supportsSets,
        supportsTime: formValue.measurementTypes.includes("time"),
        supportsDistance: formValue.measurementTypes.includes("distance"),
        supportsGrade: false,
        muscleGroups: formValue.muscleGroups,
        equipment: formValue.equipment
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch(`${API_URL}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Create failed");
      }
      await loadExercises();
      setFormValue({
        name: "",
        description: "",
        category: "Kraft",
        discipline: "",
        movementPattern: "push",
        measurementTypes: ["reps"],
        difficulty: 5,
        requiresWeight: false,
        allowsWeight: false,
        supportsSets: true,
        muscleGroups: [],
        equipment: "",
      });
      toast({
        title: t("exerciseLibrary.exerciseCreated", "Übung erstellt"),
        description: t(
          "exerciseLibrary.exerciseCreatedInfo",
          "Die Übung ist sofort nutzbar."
        ),
      });
    } catch (error) {
      console.error("Create exercise error:", error);
      toast({
        title: t("common.error"),
        description: t(
          "exerciseLibrary.exerciseCreateError",
          "Übung konnte nicht erstellt werden."
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!activeExercise) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/exercises/${activeExercise.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reportReason, details: reportDetails }),
      });
      if (!response.ok) throw new Error("Report failed");
      toast({
        title: t("exerciseLibrary.reportSent", "Report gesendet"),
        description: t(
          "exerciseLibrary.reportSentDesc",
          "Danke! Wir prüfen das intern."
        ),
      });
      setReportReason("");
      setReportDetails("");
      setActiveExercise(null);
    } catch (error) {
      console.error("Report error:", error);
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.reportError", "Report konnte nicht gesendet werden."),
        variant: "destructive",
      });
    }
  };

  const handleEditRequest = async () => {
    if (!activeExercise || !editDraft) return;
    const changePayload = {
      name: editDraft.name,
      description: editDraft.description,
      category: editDraft.category,
      discipline: editDraft.discipline,
      movementPattern: editDraft.movementPattern,
      measurementType: editDraft.measurementTypes.includes("time")
        ? "time"
        : editDraft.measurementTypes.includes("distance")
          ? "distance"
          : "reps",
      difficultyTier: editDraft.difficulty,
      requiresWeight: editDraft.requiresWeight,
      allowsWeight: editDraft.allowsWeight,
      supportsSets: editDraft.supportsSets,
      supportsTime: editDraft.measurementTypes.includes("time"),
      supportsDistance: editDraft.measurementTypes.includes("distance"),
      supportsGrade: false,
      muscleGroups: editDraft.muscleGroups,
      equipment: editDraft.equipment
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const changes = buildEditChanges(activeExercise, changePayload);
    if (Object.keys(changes).length === 0) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.noChanges", "Keine Änderungen angegeben."),
        variant: "destructive",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/exercises/${activeExercise.id}/edit-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ changeRequest: changes }),
        }
      );
      if (!response.ok) throw new Error("Edit request failed");
      toast({
        title: t("exerciseLibrary.editRequestSent", "Änderung gesendet"),
        description: t(
          "exerciseLibrary.editRequestSentDesc",
          "Deine Änderungsanfrage wurde gespeichert."
        ),
      });
      setEditDraft(null);
      setActiveExercise(null);
    } catch (error) {
      console.error("Edit request error:", error);
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.editRequestError", "Anfrage konnte nicht gesendet werden."),
        variant: "destructive",
      });
    }
  };

  const setEditDefaults = (exercise: Exercise) => {
    setEditDraft({
      name: exercise.name,
      description: exercise.description || "",
      category: exercise.category || "Kraft",
      discipline: exercise.discipline || "",
      movementPattern: exercise.movementPattern || "push",
      measurementTypes: [
        exercise.supportsTime ? "time" : null,
        exercise.supportsDistance ? "distance" : null,
        "reps",
      ].filter(Boolean) as string[],
      difficulty: exercise.difficultyTier || 5,
      requiresWeight: exercise.requiresWeight || false,
      allowsWeight: exercise.allowsWeight || false,
      supportsSets: exercise.supportsSets ?? true,
      muscleGroups: exercise.muscleGroups || [],
      equipment: (exercise.equipment || []).join(", "),
    });
  };

  return (
    <PageTemplate title={t("exerciseLibrary.title")} subtitle={t("exerciseLibrary.subtitle")}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="flex items-center gap-2">
              <CardTitle>{t("exerciseLibrary.newExercise", "Neue Übung erstellen")}</CardTitle>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-sm">
                    {t(
                      "exerciseLibrary.note",
                      "Übungen sind sofort nutzbar. Änderungen können nur Admins vornehmen."
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ExerciseForm
              value={formValue}
              onChange={setFormValue}
              onSubmit={handleCreateExercise}
              submitLabel={t("exerciseLibrary.create", "Übung erstellen")}
              showDescriptionToggle
              descriptionOpen={descriptionOpen}
              onDescriptionToggle={setDescriptionOpen}
              submitDisabled={isSubmitting}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>{t("exerciseLibrary.search", "Übungen durchsuchen")}</CardTitle>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("exerciseLibrary.searchPlaceholder", "Suche")}
                className="md:flex-1"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4 mr-2" />
                  Tabelle
                </Button>
                <Button
                  variant={filtersOpen ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {filtersOpen ? t("filters.hide", "Filter ausblenden") : t("filters.show", "Filter")}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{t("filters.sort", "Sortieren")}</span>
              <Select value={sortBy} onValueChange={(next) => setSortBy(next)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                disabled={sortBy === "none"}
              >
                {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>

            {filtersOpen && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {t("exerciseLibrary.category")}
                  </div>
                  <ToggleGroup
                    type="single"
                    value={categoryFilter}
                    onValueChange={(next) => setCategoryFilter(next || "all")}
                    className="flex flex-wrap justify-start"
                  >
                    <ToggleGroupItem value="all">{t("filters.all", "Alle")}</ToggleGroupItem>
                    {facets.categories.map((item) => (
                      <ToggleGroupItem key={item} value={item}>
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
                    onValueChange={(next) => setDisciplineFilter(next || "all")}
                    className="flex flex-wrap justify-start"
                  >
                    <ToggleGroupItem value="all">{t("filters.all", "Alle")}</ToggleGroupItem>
                    {["Calisthenics", "Kraft", "Ausdauer", "Functional", "Mobility"].map((item) => (
                      <ToggleGroupItem key={item} value={item}>
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
                    onValueChange={(next) => setMovementPatternFilter(next || "all")}
                    className="flex flex-wrap justify-start"
                  >
                    <ToggleGroupItem value="all">{t("filters.all", "Alle")}</ToggleGroupItem>
                    {movementPatternOptions.map((item) => (
                      <ToggleGroupItem key={item.value} value={item.value}>
                        {item.label}
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
                    onValueChange={(next) => setMeasurementFilters(next)}
                    className="flex flex-wrap justify-start"
                  >
                    {measurementOptions.map((item) => (
                      <ToggleGroupItem key={item.value} value={item.value}>
                        {item.label}
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
                        setDifficultyRange([next[0], next[1] ?? next[0]])
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between md:w-auto">
                        {muscleFilters.length
                          ? muscleFilters.join(", ")
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
                              onSelect={() => setMuscleFilters([])}
                              className="text-muted-foreground"
                            >
                              {t("exerciseLibrary.clearMuscles", "Alle abwählen")}
                            </CommandItem>
                            {facets.muscleGroups.map((group) => (
                              <CommandItem
                                key={group}
                                value={group}
                                onSelect={() => {
                                  setMuscleFilters((prev) =>
                                    prev.includes(group)
                                      ? prev.filter((item) => item !== group)
                                      : [...prev, group]
                                  );
                                }}
                              >
                                <span className="mr-2">
                                  {muscleFilters.includes(group) ? <Check className="h-4 w-4" /> : null}
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

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {t("exerciseLibrary.requiresWeight", "Gewicht")}
                  </div>
                  <ToggleGroup
                    type="single"
                    value={requiresWeightFilter}
                    onValueChange={(next) => setRequiresWeightFilter(next || "all")}
                    className="flex flex-wrap justify-start"
                  >
                    <ToggleGroupItem value="all">{t("filters.all", "Alle")}</ToggleGroupItem>
                    <ToggleGroupItem value="yes">
                      {t("exerciseLibrary.requiresWeight", "Gewicht erforderlich")}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="no">
                      {t("exerciseLibrary.noWeight", "Kein Gewicht")}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">{t("common.loading", "Lade...")}</div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-sm text-muted-foreground">{t("exerciseLibrary.empty", "Keine Übungen gefunden.")}</div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise) => (
                  <div key={exercise.id} className="border rounded-lg p-4 flex flex-col h-full">
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {exercise.category || "-"} · {exercise.discipline || "-"}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exercise.measurementType && (
                          <Badge variant="secondary">{exercise.measurementType}</Badge>
                        )}
                        {exercise.requiresWeight && (
                          <Badge variant="outline">Gewicht erforderlich</Badge>
                        )}
                        {exercise.supportsTime && (
                          <Badge variant="outline">Zeit</Badge>
                        )}
                        {exercise.supportsDistance && (
                          <Badge variant="outline">Distanz</Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveExercise(exercise);
                              setEditDefaults(exercise);
                            }}
                          >
                            {t("exerciseLibrary.suggestChange", "Änderung vorschlagen")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl overflow-visible">
                          <DialogHeader>
                            <DialogTitle>{t("exerciseLibrary.suggestChangeTitle", "Änderung vorschlagen")}</DialogTitle>
                          </DialogHeader>
                          {editDraft && (
                            <ExerciseForm
                              value={editDraft}
                              onChange={setEditDraft}
                              onSubmit={handleEditRequest}
                              submitLabel={t("exerciseLibrary.sendRequest", "Anfrage senden")}
                              showDescriptionToggle
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveExercise(exercise)}
                          >
                            {t("exerciseLibrary.report", "Melden")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("exerciseLibrary.reportTitle", "Übung melden")}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <Input
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              placeholder={t("exerciseLibrary.reportReason", "Grund")}
                            />
                            <Textarea
                              value={reportDetails}
                              onChange={(e) => setReportDetails(e.target.value)}
                              placeholder={t("exerciseLibrary.reportDetails", "Details")}
                            />
                            <Button onClick={handleReport}>
                              {t("exerciseLibrary.sendReport", "Report senden")}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>
                    <button
                      className="inline-flex items-center gap-1 text-left"
                      onClick={() => handleSortClick("name")}
                    >
                      Name
                      {sortBy === "name" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center gap-1 text-left"
                      onClick={() => handleSortClick("category")}
                    >
                      Kategorie
                      {sortBy === "category" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center gap-1 text-left"
                      onClick={() => handleSortClick("discipline")}
                    >
                      Disziplin
                      {sortBy === "discipline" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center gap-1 text-left"
                      onClick={() => handleSortClick("measurement")}
                    >
                      Einheit
                      {sortBy === "measurement" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center gap-1 text-left"
                      onClick={() => handleSortClick("weight")}
                    >
                      Gewicht
                      {sortBy === "weight" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">{exercise.name}</TableCell>
                      <TableCell>{exercise.category || "-"}</TableCell>
                      <TableCell>{exercise.discipline || "-"}</TableCell>
                      <TableCell>{exercise.measurementType || "-"}</TableCell>
                      <TableCell>
                        {exercise.requiresWeight ? t("exerciseLibrary.requiresWeight", "Gewicht erforderlich") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveExercise(exercise);
                                setEditDefaults(exercise);
                              }}
                            >
                              {t("exerciseLibrary.suggestChange", "Änderung vorschlagen")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl overflow-visible">
                            <DialogHeader>
                              <DialogTitle>{t("exerciseLibrary.suggestChangeTitle", "Änderung vorschlagen")}</DialogTitle>
                            </DialogHeader>
                            {editDraft && (
                              <ExerciseForm
                                value={editDraft}
                                onChange={setEditDraft}
                                onSubmit={handleEditRequest}
                                submitLabel={t("exerciseLibrary.sendRequest", "Anfrage senden")}
                                showDescriptionToggle
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveExercise(exercise)}
                            >
                              {t("exerciseLibrary.report", "Melden")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t("exerciseLibrary.reportTitle", "Übung melden")}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <Input
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder={t("exerciseLibrary.reportReason", "Grund")}
                              />
                              <Textarea
                                value={reportDetails}
                                onChange={(e) => setReportDetails(e.target.value)}
                                placeholder={t("exerciseLibrary.reportDetails", "Details")}
                              />
                              <Button onClick={handleReport}>
                                {t("exerciseLibrary.sendReport", "Report senden")}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
