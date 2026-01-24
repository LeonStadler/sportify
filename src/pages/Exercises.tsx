import { PageTemplate } from "@/components/common/PageTemplate";
import { PageSizeSelector } from "@/components/common/pagination/PageSizeSelector";
import {
  PaginationControls,
  PaginationMeta,
} from "@/components/common/pagination/PaginationControls";
import { ExerciseFiltersPanel } from "@/components/exercises/ExerciseFiltersPanel";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { SearchFilterToolbar } from "@/components/common/SearchFilterToolbar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  categoryOptions as defaultCategoryOptions,
  disciplineOptions,
  measurementOptions,
  movementPatternOptions,
  muscleGroupTree,
} from "@/components/exercises/exerciseOptions";
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
import { ArrowDown, ArrowUp, Info, MoreHorizontal } from "lucide-react";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [pageSize, setPageSize] = useState(12);
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
  const [detailExerciseId, setDetailExerciseId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [editDraft, setEditDraft] = useState<ExerciseFormValue | null>(null);
  const [detailMode, setDetailMode] = useState<"view" | "edit" | "report">("view");
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [nameCheckLoading, setNameCheckLoading] = useState(false);
  const [nameExactMatch, setNameExactMatch] = useState(false);
  const [confirmSimilar, setConfirmSimilar] = useState(false);

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

  const categoryFilterOptions = useMemo(() => {
    const combined = new Set([...defaultCategoryOptions, ...(facets.categories || [])]);
    return Array.from(combined).filter(Boolean);
  }, [facets.categories]);


  const normalizeMeasurementFilters = (next: string[]) => {
    const added = next.find((item) => !measurementFilters.includes(item));
    let result = [...next];
    if (result.includes("reps") && result.includes("distance")) {
      result =
        added === "reps"
          ? result.filter((item) => item !== "distance")
          : result.filter((item) => item !== "reps");
    }
    return result;
  };


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

  const normalizeCategory = (value?: string | null) => {
    if (!value) return value;
    const lower = value.toLowerCase();
    if (lower === "strength") return "Kraft";
    if (lower === "endurance") return "Ausdauer";
    return value;
  };

  const normalizeDiscipline = (value?: string | null) => {
    if (!value) return value;
    const lower = value.toLowerCase();
    if (lower === "strength") return "Kraft";
    if (lower === "endurance") return "Ausdauer";
    return value;
  };

  const buildExercisesParams = (page = 1) => {
    const params = new URLSearchParams({
      limit: pageSize.toString(),
      offset: ((page - 1) * pageSize).toString(),
    });
    if (query.trim()) params.set("query", query.trim());
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (disciplineFilter !== "all") params.set("discipline", disciplineFilter);
    if (movementPatternFilter !== "all") params.set("movementPattern", movementPatternFilter);
    if (measurementFilters.length > 0) {
      params.set("measurementTypes", measurementFilters.join(","));
    }
    if (muscleFilters.length > 0) {
      params.set("muscleGroups", muscleFilters.join(","));
    }
    if (requiresWeightFilter !== "all") params.set("requiresWeight", requiresWeightFilter);
    params.set("difficultyMin", difficultyRange[0].toString());
    params.set("difficultyMax", difficultyRange[1].toString());
    if (sortBy !== "none") {
      params.set("sortBy", sortBy);
      params.set("sortDirection", sortDirection);
    }
    return params;
  };

  const loadExercises = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = buildExercisesParams(currentPage);
      const response = await fetch(`${API_URL}/exercises?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Load failed");
      const data: ExerciseListResponse = await response.json();
      const normalized = (Array.isArray(data.exercises) ? data.exercises : []).map((exercise) => ({
        ...exercise,
        category: normalizeCategory(exercise.category),
        discipline: normalizeDiscipline(exercise.discipline),
      }));
      setExercises(normalized);
      const nextPagination =
        data.pagination ?? {
          currentPage,
          totalPages: 1,
          totalItems: normalized.length,
          hasNext: false,
          hasPrev: false,
        };
      setPagination(nextPagination);
      setCurrentPage(nextPagination.currentPage);
      setFacets({
        categories: (data.facets?.categories || []).map(normalizeCategory).filter(Boolean),
        muscleGroups: data.facets?.muscleGroups || [],
        equipment: data.facets?.equipment || [],
      });
    } catch (error) {
      console.error("Exercises load error:", error);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    currentPage,
    pageSize,
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

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    if (!user) return;
    const value = formValue.name.trim();
    if (value.length < 3) {
      setNameSuggestions([]);
      setNameCheckLoading(false);
      setNameExactMatch(false);
      setConfirmSimilar(false);
      return;
    }
    let isActive = true;
    const handle = setTimeout(async () => {
      try {
        setNameCheckLoading(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          query: value,
          limit: "5",
          offset: "0",
        });
        const response = await fetch(`${API_URL}/exercises?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Name check failed");
        const data: ExerciseListResponse = await response.json();
        if (!isActive) return;
        const normalizeName = (name: string) =>
          name
            .toLowerCase()
            .replace(/[\s\-_/]+/g, "")
            .replace(/[^a-z0-9]/g, "");
        const names = (data.exercises || [])
          .map((exercise) => exercise.name)
          .filter(Boolean);
        const normalizedValue = normalizeName(value);
        const exact = names.some((name) => normalizeName(name) === normalizedValue);
        setNameExactMatch(exact);
        setNameSuggestions(
          names.filter((name) => normalizeName(name) !== normalizedValue)
        );
        setConfirmSimilar(false);
      } catch (error) {
        if (isActive) setNameSuggestions([]);
      } finally {
        if (isActive) setNameCheckLoading(false);
      }
    }, 300);
    return () => {
      isActive = false;
      clearTimeout(handle);
    };
  }, [formValue.name, user]);

  const filteredExercises = exercises;
  const paginatedExercises = exercises;

  useEffect(() => {
    setCurrentPage(1);
  }, [
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
    if (nameExactMatch) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.nameExists", "Eine Übung mit diesem Namen existiert bereits."),
        variant: "destructive",
      });
      return;
    }
    if (nameSuggestions.length > 0 && !confirmSimilar) {
      toast({
        title: t("exerciseLibrary.similarNamesTitle", "Ähnliche Übung gefunden"),
        description: t(
          "exerciseLibrary.similarNamesConfirm",
          "Bitte bestätige, dass es sich um eine andere Übung handelt."
        ),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const measurementType = formValue.measurementTypes.includes("distance")
        ? "distance"
        : formValue.measurementTypes.includes("reps")
          ? "reps"
          : "time";

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
        confirmSimilar,
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
        if (response.status === 409) {
          const data = await response.json().catch(() => ({}));
          setNameSuggestions(Array.isArray(data?.similarNames) ? data.similarNames : []);
          setNameExactMatch(data?.exactMatch === true);
          setConfirmSimilar(false);
          toast({
            title: t("common.error"),
            description: data?.error || t("exerciseLibrary.nameExists", "Übung existiert bereits."),
            variant: "destructive",
          });
          return;
        }
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
      setNameSuggestions([]);
      setNameExactMatch(false);
      setConfirmSimilar(false);
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
      measurementType: editDraft.measurementTypes.includes("distance")
        ? "distance"
        : editDraft.measurementTypes.includes("reps")
          ? "reps"
          : "time",
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
      setDetailExerciseId(null);
      setDetailMode("view");
    } catch (error) {
      console.error("Edit request error:", error);
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.editRequestError", "Anfrage konnte nicht gesendet werden."),
        variant: "destructive",
      });
    }
  };

  const openExerciseDetails = (exercise: Exercise, mode: "view" | "edit" | "report" = "view") => {
    setActiveExercise(exercise);
    setDetailExerciseId(exercise.id);
    setDetailMode(mode);
    if (mode === "edit") {
      setEditDefaults(exercise);
    } else {
      setEditDraft(null);
    }
    if (mode !== "report") {
      setReportReason("");
      setReportDetails("");
    }
  };

  const closeExerciseDetails = () => {
    setDetailExerciseId(null);
    setDetailMode("view");
    setEditDraft(null);
    setActiveExercise(null);
    setReportReason("");
    setReportDetails("");
  };

  const navigateExercise = (direction: "prev" | "next") => {
    if (!detailExerciseId) return;
    const index = exercises.findIndex((item) => item.id === detailExerciseId);
    if (index === -1) return;
    const nextIndex =
      direction === "prev"
        ? (index - 1 + exercises.length) % exercises.length
        : (index + 1) % exercises.length;
    const nextExercise = exercises[nextIndex];
    if (nextExercise) {
      openExerciseDetails(nextExercise);
    }
  };

  useEffect(() => {
    if (!detailExerciseId) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigateExercise("prev");
      if (event.key === "ArrowRight") navigateExercise("next");
      if (event.key === "Escape") closeExerciseDetails();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [detailExerciseId, exercises]);

  const detailExercise = useMemo(
    () => exercises.find((item) => item.id === detailExerciseId) || null,
    [detailExerciseId, exercises]
  );

  const setEditDefaults = (exercise: Exercise) => {
    const measurementSet = new Set<string>();
    if (exercise.measurementType) measurementSet.add(exercise.measurementType);
    if (exercise.supportsTime && exercise.measurementType !== "time") measurementSet.add("time");
    if (exercise.supportsDistance && exercise.measurementType !== "distance") measurementSet.add("distance");
    if (exercise.supportsSets || exercise.measurementType === "reps") measurementSet.add("reps");
    setEditDraft({
      name: exercise.name,
      description: exercise.description || "",
      category: exercise.category || "Kraft",
      discipline: exercise.discipline || "",
      movementPattern: exercise.movementPattern || "push",
      measurementTypes: Array.from(measurementSet),
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
              nameSuggestions={nameSuggestions}
              nameCheckLoading={nameCheckLoading}
              nameExactMatch={nameExactMatch}
              confirmSimilar={confirmSimilar}
              onConfirmSimilarChange={setConfirmSimilar}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>{t("exerciseLibrary.search", "Übungen durchsuchen")}</CardTitle>
            </div>

            <SearchFilterToolbar
              query={query}
              onQueryChange={setQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filtersOpen={filtersOpen}
              onToggleFilters={() => setFiltersOpen((open) => !open)}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortByChange={setSortBy}
              onSortDirectionToggle={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              sortOptions={sortOptions}
            />

            {filtersOpen && (
              <ExerciseFiltersPanel
                categoryOptions={categoryFilterOptions}
                disciplineOptions={disciplineOptions}
                movementPatternOptions={movementPatternOptions}
                measurementOptions={measurementOptions}
                muscleGroups={muscleGroupTree}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                disciplineFilter={disciplineFilter}
                onDisciplineFilterChange={setDisciplineFilter}
                movementPatternFilter={movementPatternFilter}
                onMovementPatternFilterChange={setMovementPatternFilter}
                measurementFilters={measurementFilters}
                onMeasurementFiltersChange={(next) =>
                  setMeasurementFilters(normalizeMeasurementFilters(next))
                }
                muscleFilters={muscleFilters}
                onMuscleFiltersChange={setMuscleFilters}
                requiresWeightFilter={requiresWeightFilter}
                onRequiresWeightFilterChange={setRequiresWeightFilter}
                difficultyRange={difficultyRange}
                onDifficultyRangeChange={setDifficultyRange}
                onReset={() => {
                  setQuery("");
                  setCategoryFilter("all");
                  setDisciplineFilter("all");
                  setMovementPatternFilter("all");
                  setMeasurementFilters([]);
                  setMuscleFilters([]);
                  setRequiresWeightFilter("all");
                  setDifficultyRange([1, 10]);
                  setCurrentPage(1);
                }}
              />
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">{t("common.loading", "Lade...")}</div>
            ) : pagination.totalItems === 0 ? (
              <div className="text-sm text-muted-foreground">{t("exerciseLibrary.empty", "Keine Übungen gefunden.")}</div>
            ) : viewMode === "grid" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedExercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-xl p-4 flex flex-col h-full bg-background/60">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{exercise.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {exercise.category || "-"} · {exercise.discipline || "-"}
                          </div>
                        </div>
                        <div onClick={(event) => event.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "view")}>
                                {t("exerciseLibrary.details", "Details anzeigen")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "edit")}>
                                {t("exerciseLibrary.suggestChange", "Änderung vorschlagen")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "report")}>
                                {t("exerciseLibrary.report", "Melden")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {exercise.measurementType && (
                          <Badge variant="secondary">{exercise.measurementType}</Badge>
                        )}
                        {exercise.difficultyTier !== null && exercise.difficultyTier !== undefined && (
                          <Badge variant="outline">
                            {t("exerciseLibrary.difficulty", "Schwierigkeit")} {exercise.difficultyTier}
                          </Badge>
                        )}
                        {exercise.requiresWeight && (
                          <Badge variant="outline">{t("exerciseLibrary.requiresWeight", "Gewicht erforderlich")}</Badge>
                        )}
                        {exercise.supportsTime && <Badge variant="outline">Zeit</Badge>}
                        {exercise.supportsDistance && <Badge variant="outline">Distanz</Badge>}
                      </div>

                      {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {t("exerciseLibrary.muscleGroups", "Muskelgruppen")}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {exercise.muscleGroups.slice(0, 4).map((group) => (
                              <Badge key={group} variant="secondary">
                                {group}
                              </Badge>
                            ))}
                            {exercise.muscleGroups.length > 4 && (
                              <Badge variant="secondary">+{exercise.muscleGroups.length - 4}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {pagination.totalPages > 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {pagination.totalItems > 0 &&
                          t("exerciseLibrary.totalExercises", {
                            count: pagination.totalItems,
                            defaultValue: `${pagination.totalItems} Übungen gefunden`,
                          })}
                      </div>
                      <PageSizeSelector
                        pageSize={pageSize}
                        onPageSizeChange={(next) => {
                          setPageSize(next);
                          setCurrentPage(1);
                        }}
                        label={t("filters.itemsPerPage", "Pro Seite:")}
                        options={[6, 12, 24, 48]}
                      />
                    </div>
                    <PaginationControls
                      pagination={pagination}
                      onPageChange={setCurrentPage}
                      pageSize={pageSize}
                      maxVisiblePages={7}
                      labels={{
                        page: (current, total) =>
                          t("filters.pageLabel", { current, total, defaultValue: `${current}/${total}` }),
                        summary: (start, end, total) =>
                          t("filters.pageSummary", {
                            start,
                            end,
                            total,
                            defaultValue: `${start}–${end} / ${total}`,
                          }),
                        previous: t("filters.prev", "Zurück"),
                        next: t("filters.next", "Weiter"),
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
              <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-background">
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
                    <TableHead className="sticky right-0 z-10 bg-background text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExercises.map((exercise) => (
                    <TableRow
                      key={exercise.id}
                      className="cursor-pointer"
                      onClick={() => openExerciseDetails(exercise, "view")}
                    >
                      <TableCell className="font-medium sticky left-0 bg-background z-10">
                        {exercise.name}
                      </TableCell>
                      <TableCell>{exercise.category || "-"}</TableCell>
                      <TableCell>{exercise.discipline || "-"}</TableCell>
                      <TableCell>{exercise.measurementType || "-"}</TableCell>
                      <TableCell>
                        {exercise.requiresWeight ? t("exerciseLibrary.requiresWeight", "Gewicht erforderlich") : "-"}
                      </TableCell>
                      <TableCell
                        className="text-right sticky right-0 z-10 bg-background"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => openExerciseDetails(exercise, "view")}
                            >
                              {t("exerciseLibrary.details", "Details anzeigen")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => openExerciseDetails(exercise, "edit")}
                            >
                              {t("exerciseLibrary.suggestChange", "Änderung vorschlagen")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => openExerciseDetails(exercise, "report")}
                            >
                              {t("exerciseLibrary.report", "Melden")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {pagination.totalItems > 0 &&
                        t("exerciseLibrary.totalExercises", {
                          count: pagination.totalItems,
                          defaultValue: `${pagination.totalItems} Übungen gefunden`,
                        })}
                    </div>
                    <PageSizeSelector
                      pageSize={pageSize}
                      onPageSizeChange={(next) => {
                        setPageSize(next);
                        setCurrentPage(1);
                      }}
                      label={t("filters.itemsPerPage", "Pro Seite:")}
                      options={[6, 12, 24, 48]}
                    />
                  </div>
                  <PaginationControls
                    pagination={pagination}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                    maxVisiblePages={7}
                    labels={{
                      page: (current, total) =>
                        t("filters.pageLabel", { current, total, defaultValue: `${current}/${total}` }),
                      summary: (start, end, total) =>
                        t("filters.pageSummary", {
                          start,
                          end,
                          total,
                          defaultValue: `${start}–${end} / ${total}`,
                        }),
                      previous: t("filters.prev", "Zurück"),
                      next: t("filters.next", "Weiter"),
                    }}
                  />
                </div>
              )}
              </>
            )}
          </CardContent>
        </Card>
        <Dialog open={Boolean(detailExerciseId)} onOpenChange={(open) => (open ? null : closeExerciseDetails())}>
          <DialogContent className="max-w-4xl overflow-y-auto max-h-[85vh]">
            <DialogHeader className="pr-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {detailExercise?.name || t("exerciseLibrary.details", "Übung")}
                  </DialogTitle>
                  {detailMode === "view" && (
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{detailExercise?.category || "-"}</span>
                      <span>·</span>
                      <span>{detailExercise?.discipline || "-"}</span>
                      <span>·</span>
                      <span>{detailExercise?.measurementType || "-"}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateExercise("prev")}>
                    <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => navigateExercise("next")}>
                    <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            {detailExercise && (
              <div className="space-y-6">
                {detailMode === "view" && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground">
                          {t("exerciseLibrary.details", "Details")}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>{t("exerciseLibrary.discipline", "Disziplin")}:</strong> {detailExercise.discipline || "-"}</div>
                          <div><strong>{t("exerciseLibrary.pattern", "Bewegungsmuster")}:</strong> {detailExercise.movementPattern || "-"}</div>
                          <div><strong>{t("exerciseLibrary.difficulty", "Schwierigkeit")}:</strong> {detailExercise.difficultyTier ?? "-"}</div>
                          <div><strong>{t("exerciseLibrary.unit", "Einheit")}:</strong> {detailExercise.unit || "-"}</div>
                          <div><strong>{t("exerciseLibrary.supportsSets", "Sets/Reps")}:</strong> {detailExercise.supportsSets ? "Ja" : "Nein"}</div>
                          <div><strong>{t("exerciseLibrary.requiresWeight", "Gewicht erforderlich")}:</strong> {detailExercise.requiresWeight ? "Ja" : "Nein"}</div>
                          <div><strong>{t("exerciseLibrary.allowsWeight", "Gewicht optional")}:</strong> {detailExercise.allowsWeight ? "Ja" : "Nein"}</div>
                        </div>
                      </div>
                      <div className="space-y-2 rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground">
                          {t("exerciseLibrary.muscleGroups", "Muskelgruppen")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(detailExercise.muscleGroups || []).length > 0
                            ? detailExercise.muscleGroups?.map((group) => (
                              <Badge key={group} variant="secondary">{group}</Badge>
                            ))
                            : <span className="text-sm text-muted-foreground">-</span>}
                        </div>
                        <div className="mt-3 text-xs font-medium text-muted-foreground">
                          {t("exerciseLibrary.equipment", "Equipment")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(detailExercise.equipment || []).length > 0
                            ? detailExercise.equipment?.map((item) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))
                            : <span className="text-sm text-muted-foreground">-</span>}
                        </div>
                      </div>
                    </div>

                    {detailExercise.description && (
                      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                        {detailExercise.description}
                      </div>
                    )}
                  </>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button variant={detailMode === "view" ? "default" : "outline"} onClick={() => setDetailMode("view")}>
                    {t("exerciseLibrary.details", "Details")}
                  </Button>
                  <Button
                    variant={detailMode === "edit" ? "default" : "outline"}
                    onClick={() => {
                      if (detailExercise) {
                        setEditDefaults(detailExercise);
                        setDetailMode("edit");
                      }
                    }}
                  >
                    {t("exerciseLibrary.suggestChange", "Änderung vorschlagen")}
                  </Button>
                  <Button
                    variant={detailMode === "report" ? "default" : "outline"}
                    onClick={() => setDetailMode("report")}
                  >
                    {t("exerciseLibrary.report", "Melden")}
                  </Button>
                </div>

                {detailMode === "edit" && editDraft && (
                  <ExerciseForm
                    value={editDraft}
                    onChange={setEditDraft}
                    onSubmit={handleEditRequest}
                    submitLabel={t("exerciseLibrary.sendRequest", "Anfrage senden")}
                    showDescriptionToggle
                  />
                )}

                {detailMode === "report" && (
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
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTemplate>
  );
}
