import { PageTemplate } from "@/components/common/PageTemplate";
import { PageSizeSelector } from "@/components/common/pagination/PageSizeSelector";
import {
  PaginationControls,
  PaginationMeta,
} from "@/components/common/pagination/PaginationControls";
import { getExerciseBrowseLabels } from "@/components/exercises/exerciseBrowseLabels";
import { ExerciseBrowseGrid, ExerciseBrowseTable } from "@/components/exercises/ExerciseBrowseList";
import { ExerciseBrowsePanel } from "@/components/exercises/ExerciseBrowsePanel";
import { ExerciseFilterPanel } from "@/components/exercises/ExerciseFilterPanel";
import type { ExerciseFormValue } from "@/components/exercises/ExerciseForm";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import {
  getExerciseCategoryLabel,
  getExerciseDisciplineLabel,
  getExerciseMovementPatternLabel,
  getExerciseMuscleGroupLabel,
} from "@/components/exercises/exerciseLabels";
import {
  categoryOptions as defaultCategoryOptions,
  disciplineOptions,
  measurementOptions,
  movementPatternOptions,
  muscleGroupTree,
} from "@/components/exercises/exerciseOptions";
import {
  extractNormalizedExerciseUnits,
  normalizeExerciseUnit,
} from "@/components/exercises/unitNormalization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { getPrimaryDistanceUnit } from "@/utils/units";
import { ArrowDown, ArrowUp, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const buildEditChanges = (original: Exercise, draft: Partial<Exercise>) => {
  const changes = {};
  const fields: Array<keyof Exercise> = [
    "name",
    "description",
    "aliases",
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
    "unit",
    "unitOptions",
  ];
  fields.forEach((field) => {
    const nextValue = draft[field];
    const prevValue = original[field];
    if (Array.isArray(nextValue)) {
      const normalize = (value: unknown[]) => {
        if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
          return [...(value as Array<Record<string, unknown>>)]
            .map((item) => ({
              value: String(item.value ?? ""),
              label: String(item.label ?? ""),
              multiplier:
                typeof item.multiplier === "number"
                  ? item.multiplier
                  : Number(item.multiplier ?? 0),
            }))
            .sort((a, b) => a.value.localeCompare(b.value));
        }
        return [...value].map((item) => String(item)).sort();
      };
      const nextNormalized = normalize(nextValue);
      const prevNormalized = Array.isArray(prevValue) ? normalize(prevValue) : [];
      if (JSON.stringify(nextNormalized) !== JSON.stringify(prevNormalized)) {
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
  const primaryDistanceUnit = useMemo(
    () => getPrimaryDistanceUnit(user?.preferences?.units?.distance),
    [user?.preferences?.units?.distance]
  );
  const distanceUnitOptions = useMemo(() => {
    if (primaryDistanceUnit === "miles") {
      return [
        { value: "miles", label: t("training.form.units.miles") },
        { value: "yards", label: t("training.form.units.yards", "Yards") },
      ];
    }
    return [
      { value: "km", label: t("training.form.units.kilometers") },
      { value: "m", label: t("training.form.units.meters") },
    ];
  }, [primaryDistanceUnit, t]);

  const [formValue, setFormValue] = useState<ExerciseFormValue>({
    name: "",
    description: "",
    nameVariants: {
      deSingular: "",
      dePlural: "",
      enSingular: "",
      enPlural: "",
      other: "",
    },
    category: "",
    discipline: "",
    movementPattern: "",
    measurementTypes: ["reps"],
    distanceUnit: getPrimaryDistanceUnit(user?.preferences?.units?.distance),
    timeUnit: "min",
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
  const [favoriteUpdating, setFavoriteUpdating] = useState<string | null>(null);

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

  useEffect(() => {
    const name = formValue.name.trim();
    if (!name) {
      setNameSuggestions([]);
      setNameExactMatch(false);
      setConfirmSimilar(false);
      setNameCheckLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setNameCheckLoading(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          query: name,
          limit: "8",
        });
        const response = await fetch(`${API_URL}/exercises?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) {
          setNameSuggestions([]);
          setNameExactMatch(false);
          return;
        }
        const data: ExerciseListResponse = await response.json();
        const matches = Array.isArray(data.exercises) ? data.exercises : [];
        const exact = matches.some(
          (exercise) => exercise.name?.toLowerCase() === name.toLowerCase()
        );
        const suggestions = matches
          .map((exercise) => exercise.name)
          .filter((item): item is string => Boolean(item))
          .filter((item) => item.toLowerCase() !== name.toLowerCase())
          .slice(0, 5);
        setNameExactMatch(exact);
        setNameSuggestions(suggestions);
        if (suggestions.length === 0) {
          setConfirmSimilar(false);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Name check error:", error);
        }
      } finally {
        setNameCheckLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [formValue.name]);


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

  const buildAliasList = (input: ExerciseFormValue) => {
    const candidates = [
      input.nameVariants?.deSingular,
      input.nameVariants?.dePlural,
      input.nameVariants?.enSingular,
      input.nameVariants?.enPlural,
      ...(input.nameVariants?.other || "").split(","),
    ]
      .map((item) => (item || "").trim())
      .filter(Boolean)
      .filter((item) => item.toLowerCase() !== input.name.trim().toLowerCase());

    return Array.from(new Set(candidates));
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

  const buildExercisesParams = useCallback(
    (page = 1) => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });
      if (query.trim()) params.set("query", query.trim());
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (disciplineFilter !== "all") params.set("discipline", disciplineFilter);
      if (movementPatternFilter !== "all")
        params.set("movementPattern", movementPatternFilter);
      if (measurementFilters.length > 0) {
        params.set("measurementTypes", measurementFilters.join(","));
      }
      if (muscleFilters.length > 0) {
        params.set("muscleGroups", muscleFilters.join(","));
      }
      if (requiresWeightFilter !== "all")
        params.set("requiresWeight", requiresWeightFilter);
      params.set("difficultyMin", difficultyRange[0].toString());
      params.set("difficultyMax", difficultyRange[1].toString());
      if (sortBy !== "none") {
        params.set("sortBy", sortBy);
        params.set("sortDirection", sortDirection);
      }
      return params;
    },
    [
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
    ]
  );

  const loadExercises = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = buildExercisesParams(currentPage);
      params.set("includeMeta", "true");
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
    buildExercisesParams,
  ]);

  const handleToggleFavorite = async (exerciseId: string, nextValue: boolean) => {
    if (!user) return;
    setFavoriteUpdating(exerciseId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/exercises/${exerciseId}/favorite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ favorite: nextValue }),
      });
      if (!response.ok) {
        throw new Error("Favorite update failed");
      }
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, isFavorite: nextValue }
            : exercise
        )
      );
    } catch (error) {
      console.error("Favorite update error:", error);
      toast({
        variant: "destructive",
        title: t("common.error", "Fehler"),
        description: t("exerciseLibrary.favoriteError", "Favorit konnte nicht gespeichert werden."),
      });
    } finally {
      setFavoriteUpdating(null);
    }
  };

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
    if (!formValue.category) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.categoryRequired", "Bitte wähle eine Kategorie aus."),
        variant: "destructive",
      });
      return;
    }
    if (!formValue.discipline) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.disciplineRequired", "Bitte wähle eine Disziplin aus."),
        variant: "destructive",
      });
      return;
    }
    if (!formValue.movementPattern) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.movementPatternRequired", "Bitte wähle ein Bewegungsmuster aus."),
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
      const hasDistance = formValue.measurementTypes.includes("distance");
      const hasReps = formValue.measurementTypes.includes("reps");
      const hasTime = formValue.measurementTypes.includes("time");
      const measurementType = hasDistance
        ? "distance"
        : hasReps && hasTime
          ? "mixed"
          : hasReps
            ? "reps"
            : "time";

      const preferredDistanceUnit = getPrimaryDistanceUnit(
        user?.preferences?.units?.distance
      );
      const distanceUnitOptions =
        preferredDistanceUnit === "miles"
          ? [
              { value: "miles", label: t("training.form.units.miles") },
              { value: "yards", label: t("training.form.units.yards", "Yards") },
            ]
          : [
              { value: "km", label: t("training.form.units.kilometers") },
              { value: "m", label: t("training.form.units.meters") },
            ];
      const timeUnitOptions = [
        { value: "min", label: t("training.form.units.minutes", "Minuten") },
        { value: "sec", label: t("training.form.units.seconds", "Sekunden") },
      ];
      const unitOptions = hasDistance
        ? distanceUnitOptions
        : hasTime
          ? timeUnitOptions
          : [];
      const resolvedUnit = hasDistance
        ? formValue.distanceUnit || preferredDistanceUnit
        : hasTime
          ? formValue.timeUnit || "min"
          : "reps";

      const payload = {
        name: formValue.name.trim(),
        description: formValue.description.trim() || null,
        aliases: buildAliasList(formValue),
        category: formValue.category,
        discipline: formValue.discipline || null,
        movementPattern: formValue.movementPattern,
        measurementType,
        unit: resolvedUnit,
        unitOptions,
        difficultyTier: formValue.difficulty,
        requiresWeight: formValue.requiresWeight,
        allowsWeight: formValue.allowsWeight,
        supportsSets: formValue.supportsSets,
        supportsTime: hasTime,
        supportsDistance: hasDistance,
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
        nameVariants: {
          deSingular: "",
          dePlural: "",
          enSingular: "",
          enPlural: "",
          other: "",
        },
        category: "",
        discipline: "",
        movementPattern: "",
        measurementTypes: ["reps"],
        distanceUnit: getPrimaryDistanceUnit(user?.preferences?.units?.distance),
        timeUnit: "min",
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
    if (!editDraft.category || !editDraft.discipline || !editDraft.movementPattern) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.requiredFields", "Bitte fülle Kategorie, Disziplin und Bewegungsmuster aus."),
        variant: "destructive",
      });
      return;
    }
    const hasDistance = editDraft.measurementTypes.includes("distance");
    const hasReps = editDraft.measurementTypes.includes("reps");
    const hasTime = editDraft.measurementTypes.includes("time");
    const measurementType = hasDistance
      ? "distance"
      : hasReps && hasTime
        ? "mixed"
        : hasReps
          ? "reps"
          : "time";
    const preferredDistanceUnit = getPrimaryDistanceUnit(
      user?.preferences?.units?.distance
    );
    const unitOptions = hasDistance
      ? [
          {
            value: preferredDistanceUnit,
            label:
              preferredDistanceUnit === "miles"
                ? t("training.form.units.miles")
                : t("training.form.units.kilometers"),
          },
        ]
      : hasTime
        ? [
          { value: "min", label: t("training.form.units.minutes", "Minuten") },
          { value: "sec", label: t("training.form.units.seconds", "Sekunden") },
        ]
        : [];
    const resolvedUnit = hasDistance
      ? editDraft.distanceUnit || preferredDistanceUnit
      : hasTime
        ? editDraft.timeUnit || "min"
        : "reps";

    const changePayload = {
      name: editDraft.name,
      description: editDraft.description,
      aliases: buildAliasList(editDraft),
      category: editDraft.category,
      discipline: editDraft.discipline,
      movementPattern: editDraft.movementPattern,
      measurementType,
      unit: resolvedUnit,
      unitOptions,
      difficultyTier: editDraft.difficulty,
      requiresWeight: editDraft.requiresWeight,
      allowsWeight: editDraft.allowsWeight,
      supportsSets: editDraft.supportsSets,
      supportsTime: hasTime,
      supportsDistance: hasDistance,
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

  const setEditDefaults = useCallback((exercise: Exercise) => {
    const measurementSet = new Set<string>();
    if (exercise.measurementType) measurementSet.add(exercise.measurementType);
    if (exercise.supportsTime && exercise.measurementType !== "time") measurementSet.add("time");
    if (exercise.supportsDistance && exercise.measurementType !== "distance") measurementSet.add("distance");
    if (exercise.supportsSets || exercise.measurementType === "reps") measurementSet.add("reps");
    const unitOptionsValues = extractNormalizedExerciseUnits(exercise.unitOptions);
    const normalizedUnit = normalizeExerciseUnit(exercise.unit);

    const distanceUnitCandidate =
      (["km", "m", "miles"].includes(normalizedUnit) ? normalizedUnit : "") ||
      unitOptionsValues.find((value) => ["km", "m", "miles"].includes(value)) ||
      user?.preferences?.units?.distance ||
      "km";
    const distanceUnit = getPrimaryDistanceUnit(distanceUnitCandidate);

    const timeUnit =
      (["min", "sec"].includes(normalizedUnit) ? normalizedUnit : "") ||
      unitOptionsValues.find((value) => ["min", "sec"].includes(value)) ||
      "min";

    const aliasList = Array.isArray(exercise.aliases) ? exercise.aliases : [];

    setEditDraft({
      name: exercise.name,
      description: exercise.description || "",
      nameVariants: {
        deSingular: "",
        dePlural: "",
        enSingular: "",
        enPlural: "",
        other: aliasList.join(", "),
      },
      category: exercise.category || "Kraft",
      discipline: exercise.discipline || "",
      movementPattern: exercise.movementPattern || "push",
      measurementTypes: Array.from(measurementSet),
      distanceUnit,
      timeUnit,
      difficulty: exercise.difficultyTier || 5,
      requiresWeight: exercise.requiresWeight || false,
      allowsWeight: exercise.allowsWeight || false,
      supportsSets: exercise.supportsSets || false,
      muscleGroups: exercise.muscleGroups || [],
      equipment: (exercise.equipment || []).join(", "),
    });
  }, [user?.preferences?.units?.distance]);

  const openExerciseDetails = useCallback(
    (exercise: Exercise, mode: "view" | "edit" | "report" = "view") => {
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
    },
    [setEditDefaults]
  );

  const closeExerciseDetails = useCallback(() => {
    setDetailExerciseId(null);
    setDetailMode("view");
    setEditDraft(null);
    setActiveExercise(null);
    setReportReason("");
    setReportDetails("");
  }, []);

  const navigateExercise = useCallback((direction: "prev" | "next") => {
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
  }, [detailExerciseId, exercises, openExerciseDetails]);

  useEffect(() => {
    if (!detailExerciseId) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigateExercise("prev");
      if (event.key === "ArrowRight") navigateExercise("next");
      if (event.key === "Escape") closeExerciseDetails();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [detailExerciseId, exercises, navigateExercise, closeExerciseDetails]);

  const detailExercise = useMemo(
    () => exercises.find((item) => item.id === detailExerciseId) || null,
    [detailExerciseId, exercises]
  );

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
              defaultDistanceUnit={primaryDistanceUnit}
              distanceUnitOptions={distanceUnitOptions}
              defaultTimeUnit="min"
            />
          </CardContent>
        </Card>

        <ExerciseBrowsePanel
          title={t("exerciseLibrary.search", "Übungen durchsuchen")}
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
          filtersPanel={
            <ExerciseFilterPanel
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
          }
          loading={loading}
          empty={pagination.totalItems === 0}
          emptyText={t("exerciseLibrary.empty", "Keine Übungen gefunden.")}
          loadingText={t("common.loading", "Lade...")}
          grid={
            <ExerciseBrowseGrid
              items={paginatedExercises}
              onSelect={(exercise) => openExerciseDetails(exercise, "view")}
              onToggleFavorite={(exercise, next) =>
                handleToggleFavorite(exercise.id, next)
              }
              renderMenuItems={(exercise) => (
                <>
                  <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "view")}>
                    {t("exerciseLibrary.details", "Details anzeigen")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "edit")}>
                    {t("exerciseLibrary.suggestChange", "Änderung vorschlagen")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "report")}>
                    {t("exerciseLibrary.report", "Melden")}
                  </DropdownMenuItem>
                </>
              )}
              labels={getExerciseBrowseLabels(t)}
            />
          }
          table={
            <ExerciseBrowseTable
              items={paginatedExercises}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortClick={handleSortClick}
              onSelect={(exercise) => openExerciseDetails(exercise, "view")}
              onToggleFavorite={(exercise, next) =>
                handleToggleFavorite(exercise.id, next)
              }
              renderMenuItems={(exercise) => (
                <>
                  <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "view")}>
                    {t("exerciseLibrary.details", "Details anzeigen")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "edit")}>
                    {t("exerciseLibrary.suggestChange", "Änderung vorschlagen")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openExerciseDetails(exercise, "report")}>
                    {t("exerciseLibrary.report", "Melden")}
                  </DropdownMenuItem>
                </>
              )}
              labels={getExerciseBrowseLabels(t)}
            />
          }
          footer={
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
              {pagination.totalPages > 1 && (
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
              )}
            </div>
          }
        />
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
                      <span>{getExerciseCategoryLabel(detailExercise?.category, t) || "-"}</span>
                      <span>·</span>
                      <span>{getExerciseDisciplineLabel(detailExercise?.discipline, t) || "-"}</span>
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
                          <div><strong>{t("exerciseLibrary.discipline", "Disziplin")}:</strong> {getExerciseDisciplineLabel(detailExercise.discipline, t) || "-"}</div>
                          <div><strong>{t("exerciseLibrary.pattern", "Bewegungsmuster")}:</strong> {getExerciseMovementPatternLabel(detailExercise.movementPattern, t) || "-"}</div>
                          <div><strong>{t("exerciseLibrary.difficulty", "Schwierigkeit")}:</strong> {detailExercise.difficultyTier ?? "-"}</div>
                          <div><strong>{t("exerciseLibrary.unit", "Einheit")}:</strong> {detailExercise.unit || "-"}</div>
                          <div><strong>{t("exerciseLibrary.supportsSets", "Sets/Reps")}:</strong> {detailExercise.supportsSets ? t("common.yes", "Ja") : t("common.no", "Nein")}</div>
                          <div><strong>{t("exerciseLibrary.requiresWeight", "Gewicht erforderlich")}:</strong> {detailExercise.requiresWeight ? t("common.yes", "Ja") : t("common.no", "Nein")}</div>
                          <div><strong>{t("exerciseLibrary.allowsWeight", "Gewicht optional")}:</strong> {detailExercise.allowsWeight ? t("common.yes", "Ja") : t("common.no", "Nein")}</div>
                        </div>
                      </div>
                      <div className="space-y-2 rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground">
                          {t("exerciseLibrary.muscleGroups", "Muskelgruppen")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(detailExercise.muscleGroups || []).length > 0
                            ? detailExercise.muscleGroups?.map((group) => (
                              <Badge key={group} variant="secondary">
                                {getExerciseMuscleGroupLabel(group, t)}
                              </Badge>
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
                    defaultDistanceUnit={primaryDistanceUnit}
                    distanceUnitOptions={distanceUnitOptions}
                    defaultTimeUnit="min"
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
