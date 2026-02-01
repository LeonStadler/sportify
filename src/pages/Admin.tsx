import { PageTemplate } from "@/components/common/PageTemplate";
import { ExerciseBrowsePanel } from "@/components/exercises/ExerciseBrowsePanel";
import { getExerciseBrowseLabels } from "@/components/exercises/exerciseBrowseLabels";
import { ExerciseBrowseGrid, ExerciseBrowseTable } from "@/components/exercises/ExerciseBrowseList";
import { PageSizeSelector } from "@/components/common/pagination/PageSizeSelector";
import { PaginationControls, PaginationMeta } from "@/components/common/pagination/PaginationControls";
import { ExerciseFiltersPanel } from "@/components/exercises/ExerciseFiltersPanel";
import { ExerciseForm, ExerciseFormValue } from "@/components/exercises/ExerciseForm";
import {
  getExerciseCategoryLabel,
  getExerciseDisciplineLabel,
  getExerciseMovementPatternLabel,
  getExerciseMuscleGroupLabel,
} from "@/components/exercises/exerciseLabels";
import {
  categoryOptions,
  disciplineOptions,
  measurementOptions,
  movementPatternOptions,
  muscleGroupTree,
} from "@/components/exercises/exerciseOptions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Users
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  isEmailVerified: boolean;
  has2FA: boolean;
  role: "user" | "admin";
  createdAt: string;
  lastLoginAt?: string;
}

interface Exercise {
  id: string;
  name: string;
  description?: string;
  category?: string;
  discipline?: string;
  movementPattern?: string | null;
  measurementType?: string;
  pointsPerUnit: number;
  unit: string;
  hasWeight: boolean;
  hasSetMode: boolean;
  requiresWeight?: boolean;
  allowsWeight?: boolean;
  supportsSets?: boolean;
  supportsTime?: boolean;
  supportsDistance?: boolean;
  supportsGrade?: boolean;
  difficultyTier?: number | null;
  muscleGroups?: string[];
  equipment?: string[];
  unitOptions: Array<{ value: string; label: string; multiplier: number }>;
  status?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExerciseReport {
  id: string;
  exerciseId: string;
  reportedBy: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface ExerciseEditRequest {
  id: string;
  exerciseId: string;
  requestedBy: string;
  changeRequest: Record<string, unknown>;
  status: string;
  createdAt: string;
}

interface AdminOverviewStats {
  users: number;
  workouts: number;
  templates: number;
  exercises: number;
  recoveryEntries: number;
  awards: number;
  badges: number;
  workoutActivities: number;
}

export function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseReports, setExerciseReports] = useState<ExerciseReport[]>([]);
  const [exerciseEditRequests, setExerciseEditRequests] = useState<ExerciseEditRequest[]>([]);
  const [overviewStats, setOverviewStats] = useState<AdminOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [exerciseManagementView, setExerciseManagementView] = useState<"grid" | "table">("table");
  const [exerciseManagementFiltersOpen, setExerciseManagementFiltersOpen] = useState(false);
  const [exerciseManagementQuery, setExerciseManagementQuery] = useState("");
  const [exerciseManagementCategoryFilter, setExerciseManagementCategoryFilter] = useState("all");
  const [exerciseManagementDisciplineFilter, setExerciseManagementDisciplineFilter] = useState("all");
  const [exerciseManagementMovementPatternFilter, setExerciseManagementMovementPatternFilter] = useState("all");
  const [exerciseManagementMeasurementFilters, setExerciseManagementMeasurementFilters] = useState<string[]>([]);
  const [exerciseManagementMuscleFilters, setExerciseManagementMuscleFilters] = useState<string[]>([]);
  const [exerciseManagementRequiresWeightFilter, setExerciseManagementRequiresWeightFilter] = useState("all");
  const [exerciseManagementDifficultyRange, setExerciseManagementDifficultyRange] = useState<[number, number]>([1, 10]);
  const [exerciseManagementSortBy, setExerciseManagementSortBy] = useState("name");
  const [exerciseManagementSortDirection, setExerciseManagementSortDirection] = useState<"asc" | "desc">("asc");
  const [exerciseManagementPageSize, setExerciseManagementPageSize] = useState(12);
  const [exerciseManagementPage, setExerciseManagementPage] = useState(1);
  const [exerciseManagementPagination, setExerciseManagementPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [exerciseEditDialogOpen, setExerciseEditDialogOpen] = useState(false);
  const [exerciseEditTarget, setExerciseEditTarget] = useState<Exercise | null>(null);
  const [exerciseEditDraft, setExerciseEditDraft] = useState<ExerciseFormValue | null>(null);
  const [exerciseEditDescriptionOpen, setExerciseEditDescriptionOpen] = useState(false);
  const [exerciseEditSaving, setExerciseEditSaving] = useState(false);
  const [exerciseDialogMode, setExerciseDialogMode] = useState<"view" | "edit">("view");
  const [detailExerciseId, setDetailExerciseId] = useState<string | null>(null);
  const mergeSectionRef = useRef<HTMLDivElement | null>(null);

  const exerciseMap = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

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

  const exerciseManagementSortOptions = [
    { value: "none", label: t("filters.sortNone", "Keine") },
    { value: "name", label: t("filters.sortName", "Name") },
    { value: "category", label: t("filters.sortCategory", "Kategorie") },
    { value: "discipline", label: t("filters.sortDiscipline", "Disziplin") },
    { value: "measurement", label: t("filters.sortMeasurement", "Einheit") },
    { value: "weight", label: t("filters.sortWeight", "Gewicht") },
    { value: "difficulty", label: t("filters.sortDifficulty", "Schwierigkeit") },
    { value: "newest", label: t("filters.sortNewest", "Neueste") },
  ];

  const exerciseManagementCategoryOptions = useMemo(() => {
    const combined = new Set<string>(categoryOptions);
    exercises.forEach((exercise) => {
      const normalized = normalizeCategory(exercise.category);
      if (normalized) combined.add(normalized);
    });
    return Array.from(combined);
  }, [exercises]);

  const exerciseManagementDisciplineOptions = useMemo(() => {
    const combined = new Set<string>(disciplineOptions);
    exercises.forEach((exercise) => {
      const normalized = normalizeDiscipline(exercise.discipline);
      if (normalized) combined.add(normalized);
    });
    return Array.from(combined);
  }, [exercises]);

  const exerciseManagementHandleSortClick = (next: string) => {
    if (exerciseManagementSortBy !== next) {
      setExerciseManagementSortBy(next);
      setExerciseManagementSortDirection("asc");
      return;
    }
    if (exerciseManagementSortDirection === "asc") {
      setExerciseManagementSortDirection("desc");
      return;
    }
    setExerciseManagementSortBy("none");
    setExerciseManagementSortDirection("asc");
  };

  const exerciseManagementResetFilters = () => {
    setExerciseManagementCategoryFilter("all");
    setExerciseManagementDisciplineFilter("all");
    setExerciseManagementMovementPatternFilter("all");
    setExerciseManagementMeasurementFilters([]);
    setExerciseManagementMuscleFilters([]);
    setExerciseManagementRequiresWeightFilter("all");
    setExerciseManagementDifficultyRange([1, 10]);
  };

  const exerciseManagementToFormValue = (exercise: Exercise): ExerciseFormValue => {
    const measurementSet = new Set<string>();
    if (exercise.measurementType) measurementSet.add(exercise.measurementType);
    if (exercise.supportsTime && exercise.measurementType !== "time") measurementSet.add("time");
    if (exercise.supportsDistance && exercise.measurementType !== "distance") measurementSet.add("distance");
    if (exercise.supportsSets || exercise.measurementType === "reps") measurementSet.add("reps");

    const normalizeUnitValue = (unit?: string | null) => {
      if (!unit) return "";
      const lower = unit.toLowerCase();
      if (lower.includes("sek")) return "sec";
      if (lower.includes("min")) return "min";
      if (lower.includes("mile") || lower.includes("meile")) return "miles";
      if (lower === "m" || lower.includes("meter")) return "m";
      if (lower.includes("km") || lower.includes("kilometer")) return "km";
      if (lower.includes("wdh") || lower.includes("reps") || lower.includes("wiederholung"))
        return "reps";
      return unit;
    };

    const unitOptionsValues = Array.isArray(exercise.unitOptions)
      ? exercise.unitOptions.map((option) => option.value)
      : [];

    const distanceUnit =
      unitOptionsValues.find((value) => ["km", "m", "miles"].includes(value)) ||
      normalizeUnitValue(exercise.unit) ||
      (user?.preferences?.units?.distance || "km");

    const timeUnit =
      unitOptionsValues.find((value) => ["min", "sec"].includes(value)) ||
      normalizeUnitValue(exercise.unit) ||
      "min";

    return {
      name: exercise.name,
      description: exercise.description || "",
      category: exercise.category || "Kraft",
      discipline: exercise.discipline || "",
      movementPattern: exercise.movementPattern || "push",
      measurementTypes: Array.from(measurementSet),
      distanceUnit,
      timeUnit,
      difficulty: exercise.difficultyTier || 5,
      requiresWeight: exercise.requiresWeight || false,
      allowsWeight: exercise.allowsWeight || false,
      supportsSets: exercise.supportsSets ?? true,
      muscleGroups: exercise.muscleGroups || [],
      equipment: (exercise.equipment || []).join(", "),
    };
  };

  const exerciseManagementOpenEdit = (exercise: Exercise) => {
    setExerciseEditTarget(exercise);
    const formValue = exerciseManagementToFormValue(exercise);
    setExerciseEditDraft(formValue);
    setExerciseEditDescriptionOpen(Boolean(formValue.description));
    setExerciseDialogMode("edit");
    setDetailExerciseId(exercise.id);
    setExerciseEditDialogOpen(true);
  };

  const exerciseManagementOpenView = (exercise: Exercise) => {
    setExerciseEditTarget(exercise);
    setExerciseEditDraft(null);
    setExerciseEditDescriptionOpen(false);
    setExerciseDialogMode("view");
    setDetailExerciseId(exercise.id);
    setExerciseEditDialogOpen(true);
  };

  const exerciseManagementCloseEdit = () => {
    setExerciseEditDialogOpen(false);
    setExerciseEditTarget(null);
    setExerciseEditDraft(null);
    setExerciseEditDescriptionOpen(false);
    setExerciseDialogMode("view");
    setDetailExerciseId(null);
  };

  const exerciseManagementHandleSave = async () => {
    if (!exerciseEditTarget || !exerciseEditDraft) return;
    if (!exerciseEditDraft.category || !exerciseEditDraft.discipline || !exerciseEditDraft.movementPattern) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.requiredFields", "Bitte fülle Kategorie, Disziplin und Bewegungsmuster aus."),
        variant: "destructive",
      });
      return;
    }
    const measurementType = exerciseEditDraft.measurementTypes.includes("distance")
      ? "distance"
      : exerciseEditDraft.measurementTypes.includes("reps")
        ? "reps"
        : "time";
    const distanceUnitOptions = [
      { value: "km", label: t("training.form.units.kilometers") },
      { value: "m", label: t("training.form.units.meters") },
      { value: "miles", label: t("training.form.units.miles") },
    ];
    const timeUnitOptions = [
      { value: "min", label: t("training.form.units.minutes", "Minuten") },
      { value: "sec", label: t("training.form.units.seconds", "Sekunden") },
    ];
    const unitOptions = measurementType === "distance"
      ? distanceUnitOptions
      : measurementType === "time"
        ? timeUnitOptions
        : [];
    const resolvedUnit = measurementType === "distance"
      ? exerciseEditDraft.distanceUnit || (user?.preferences?.units?.distance || "km")
      : measurementType === "time"
        ? exerciseEditDraft.timeUnit || "min"
        : "reps";
    const payload = {
      name: exerciseEditDraft.name,
      description: exerciseEditDraft.description,
      category: exerciseEditDraft.category,
      discipline: exerciseEditDraft.discipline,
      movementPattern: exerciseEditDraft.movementPattern,
      measurementType,
      unit: resolvedUnit,
      unitOptions,
      difficultyTier: exerciseEditDraft.difficulty,
      requiresWeight: exerciseEditDraft.requiresWeight,
      allowsWeight: exerciseEditDraft.allowsWeight,
      supportsSets: exerciseEditDraft.supportsSets,
      supportsTime: exerciseEditDraft.measurementTypes.includes("time"),
      supportsDistance: exerciseEditDraft.measurementTypes.includes("distance"),
      supportsGrade: false,
      muscleGroups: exerciseEditDraft.muscleGroups,
      equipment: exerciseEditDraft.equipment
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const changes: Record<string, unknown> = {};
    const fields: Array<keyof Exercise> = [
      "name",
      "description",
      "category",
      "discipline",
      "movementPattern",
      "measurementType",
      "unit",
      "unitOptions",
      "requiresWeight",
      "allowsWeight",
      "supportsSets",
      "supportsTime",
      "supportsDistance",
      "supportsGrade",
      "difficultyTier",
      "muscleGroups",
      "equipment",
    ];
    fields.forEach((field) => {
      const nextValue = payload[field];
      const prevValue = exerciseEditTarget[field];
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

    if (Object.keys(changes).length === 0) {
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.noChanges", "Keine Änderungen angegeben."),
        variant: "destructive",
      });
      return;
    }

    setExerciseEditSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/exercises/${exerciseEditTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      });
      if (!response.ok) throw new Error("Update failed");
      const updated = await response.json();
      setExercises((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast({
        title: t("common.saved", "Gespeichert"),
        description: t("exerciseLibrary.updateSuccess", "Übung wurde aktualisiert."),
      });
      exerciseManagementCloseEdit();
    } catch (error) {
      console.error("Admin exercise update error:", error);
      toast({
        title: t("common.error"),
        description: t("exerciseLibrary.updateError", "Änderungen konnten nicht gespeichert werden."),
        variant: "destructive",
      });
    } finally {
      setExerciseEditSaving(false);
    }
  };

  const exerciseManagementFiltered = useMemo(() => {
    const normalizedQuery = exerciseManagementQuery.trim().toLowerCase();
    const results = exercises.filter((exercise) => {
      if (normalizedQuery) {
        const nameMatch = exercise.name?.toLowerCase().includes(normalizedQuery);
        const descriptionMatch = exercise.description?.toLowerCase().includes(normalizedQuery);
        if (!nameMatch && !descriptionMatch) return false;
      }

      if (exerciseManagementCategoryFilter !== "all") {
        const normalizedCategory = normalizeCategory(exercise.category) || "";
        if (normalizedCategory !== exerciseManagementCategoryFilter) return false;
      }

      if (exerciseManagementDisciplineFilter !== "all") {
        const normalizedDiscipline = normalizeDiscipline(exercise.discipline) || "";
        if (normalizedDiscipline !== exerciseManagementDisciplineFilter) return false;
      }

      if (exerciseManagementMovementPatternFilter !== "all") {
        if ((exercise.movementPattern || "") !== exerciseManagementMovementPatternFilter) return false;
      }

      if (exerciseManagementMeasurementFilters.length > 0) {
        const measurementSet = new Set<string>();
        if (exercise.measurementType) measurementSet.add(exercise.measurementType);
        if (exercise.supportsTime) measurementSet.add("time");
        if (exercise.supportsDistance) measurementSet.add("distance");
        if (exercise.supportsSets || exercise.measurementType === "reps") measurementSet.add("reps");
        const matchesMeasurement = exerciseManagementMeasurementFilters.some((item) => measurementSet.has(item));
        if (!matchesMeasurement) return false;
      }

      if (exerciseManagementMuscleFilters.length > 0) {
        const muscleGroups = exercise.muscleGroups || [];
        const hasMatch = exerciseManagementMuscleFilters.some((group) => muscleGroups.includes(group));
        if (!hasMatch) return false;
      }

      if (exerciseManagementRequiresWeightFilter !== "all") {
        const requiresWeight = Boolean(exercise.requiresWeight);
        if (exerciseManagementRequiresWeightFilter === "yes" && !requiresWeight) return false;
        if (exerciseManagementRequiresWeightFilter === "no" && requiresWeight) return false;
      }

      const difficulty = exercise.difficultyTier ?? 5;
      if (difficulty < exerciseManagementDifficultyRange[0] || difficulty > exerciseManagementDifficultyRange[1]) {
        return false;
      }

      return true;
    });

    const sorted = [...results];
    const direction = exerciseManagementSortDirection === "asc" ? 1 : -1;
    if (exerciseManagementSortBy !== "none") {
      sorted.sort((a, b) => {
        switch (exerciseManagementSortBy) {
          case "name":
            return (a.name || "").localeCompare(b.name || "") * direction;
          case "category":
            return (a.category || "").localeCompare(b.category || "") * direction;
          case "discipline":
            return (a.discipline || "").localeCompare(b.discipline || "") * direction;
          case "measurement":
            return (a.measurementType || "").localeCompare(b.measurementType || "") * direction;
          case "weight": {
            const weightValue = (exercise?: Exercise) =>
              exercise?.requiresWeight ? 2 : exercise?.allowsWeight ? 1 : 0;
            return (weightValue(a) - weightValue(b)) * direction;
          }
          case "difficulty":
            return ((a.difficultyTier ?? 0) - (b.difficultyTier ?? 0)) * direction;
          case "newest":
            return ((new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0)) * direction;
          default:
            return 0;
        }
      });
    }

    return sorted;
  }, [
    exercises,
    exerciseManagementQuery,
    exerciseManagementCategoryFilter,
    exerciseManagementDisciplineFilter,
    exerciseManagementMovementPatternFilter,
    exerciseManagementMeasurementFilters,
    exerciseManagementMuscleFilters,
    exerciseManagementRequiresWeightFilter,
    exerciseManagementDifficultyRange,
    exerciseManagementSortBy,
    exerciseManagementSortDirection,
  ]);

  const detailExercise = useMemo(
    () => exerciseManagementFiltered.find((item) => item.id === detailExerciseId) || null,
    [detailExerciseId, exerciseManagementFiltered]
  );

  const detailIndex = useMemo(
    () => (detailExerciseId ? exerciseManagementFiltered.findIndex((item) => item.id === detailExerciseId) : -1),
    [detailExerciseId, exerciseManagementFiltered]
  );

  const hasPrevDetail = detailIndex > 0;
  const hasNextDetail = detailIndex >= 0 && detailIndex < exerciseManagementFiltered.length - 1;

  const navigateExercise = (direction: "prev" | "next") => {
    if (!detailExerciseId) return;
    const index = exerciseManagementFiltered.findIndex((item) => item.id === detailExerciseId);
    if (index < 0) return;
    const nextIndex = direction === "prev" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= exerciseManagementFiltered.length) return;
    const nextExercise = exerciseManagementFiltered[nextIndex];
    if (!nextExercise) return;
    if (exerciseDialogMode === "edit") {
      const formValue = exerciseManagementToFormValue(nextExercise);
      setExerciseEditDraft(formValue);
      setExerciseEditDescriptionOpen(Boolean(formValue.description));
      setExerciseEditTarget(nextExercise);
    } else {
      setExerciseEditTarget(nextExercise);
    }
    setDetailExerciseId(nextExercise.id);
  };

  useEffect(() => {
    const totalItems = exerciseManagementFiltered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / exerciseManagementPageSize));
    const nextPage = Math.min(exerciseManagementPage, totalPages);
    if (nextPage !== exerciseManagementPage) {
      setExerciseManagementPage(nextPage);
    }
    setExerciseManagementPagination({
      currentPage: nextPage,
      totalPages,
      totalItems,
      hasNext: nextPage < totalPages,
      hasPrev: nextPage > 1,
    });
  }, [exerciseManagementFiltered, exerciseManagementPage, exerciseManagementPageSize]);

  const exerciseManagementPageItems = useMemo(() => {
    const start = (exerciseManagementPage - 1) * exerciseManagementPageSize;
    return exerciseManagementFiltered.slice(start, start + exerciseManagementPageSize);
  }, [exerciseManagementFiltered, exerciseManagementPage, exerciseManagementPageSize]);

  const formatChangeValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? t("common.yes", "Ja") : t("common.no", "Nein");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const changeKeyLabels: Record<string, string> = {
    name: t("exerciseLibrary.name", "Name"),
    description: t("exerciseLibrary.description", "Beschreibung"),
    category: t("exerciseLibrary.category", "Kategorie"),
    discipline: t("exerciseLibrary.discipline", "Disziplin"),
    movementPattern: t("exerciseLibrary.pattern", "Bewegungsmuster"),
    measurementType: t("exerciseLibrary.measurement", "Einheiten"),
    requiresWeight: t("exerciseLibrary.requiresWeight", "Gewicht erforderlich"),
    allowsWeight: t("exerciseLibrary.allowsWeight", "Gewicht optional"),
    supportsSets: t("exerciseLibrary.supportsSets", "Sets/Reps"),
    supportsTime: t("exerciseLibrary.time", "Zeit"),
    supportsDistance: t("exerciseLibrary.distance", "Distanz"),
    supportsGrade: t("exerciseLibrary.route", "Route"),
    difficultyTier: t("exerciseLibrary.difficulty", "Schwierigkeit"),
    muscleGroups: t("exerciseLibrary.muscleGroups", "Muskelgruppen"),
    equipment: t("exerciseLibrary.equipment", "Equipment"),
    unitOptions: t("exerciseLibrary.measurement", "Einheiten"),
  };

  const ExerciseMergeSelect = ({
    value,
    onChange,
    placeholder,
    options,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: Exercise[];
  }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selected = options.find((exercise) => exercise.id === value) || null;

    const filtered = useMemo(() => {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) return options;
      return options.filter((exercise) =>
        exercise.name.toLowerCase().includes(normalizedQuery)
      );
    }, [options, query]);

    const displayOptions = useMemo(() => {
      if (!selected) return filtered;
      if (filtered.some((exercise) => exercise.id === selected.id)) return filtered;
      return [selected, ...filtered];
    }, [filtered, selected]);

    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="mt-1 w-full justify-between"
          >
            {selected ? selected.name : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground" />
              <CommandInput
                placeholder={t("common.search", "Suche")}
                value={query}
                onValueChange={setQuery}
              />
            </div>
            <CommandList className="max-h-[260px]">
              <CommandEmpty>{t("common.noResults", "Keine Treffer")}</CommandEmpty>
              <CommandGroup>
                {displayOptions.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.id}
                    onSelect={() => {
                      onChange(exercise.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={
                        value === exercise.id
                          ? "mr-2 h-4 w-4 opacity-100"
                          : "mr-2 h-4 w-4 opacity-0"
                      }
                    />
                    {exercise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const handleMergeExercise = async (sourceId: string, targetId: string) => {
    if (!targetId || sourceId === targetId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/admin/exercises/${sourceId}/merge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            t("admin.errors.mergeFailed", "Merge fehlgeschlagen.")
        );
      }
      toast({
        title: t("admin.success.mergeTitle", "Merge erfolgreich"),
        description: t(
          "admin.success.mergeDescription",
          "Die Übung wurde zusammengeführt."
        ),
      });
      await loadExercises();
    } catch (error) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.errors.mergeFailed", "Merge fehlgeschlagen."),
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadExercises = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/exercises`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const exercisesData = await response.json();
        setExercises(exercisesData);
      }
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  const loadExerciseReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/exercise-reports?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExerciseReports(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading exercise reports:", error);
    }
  };

  const loadExerciseEditRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/admin/exercise-edit-requests?status=pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setExerciseEditRequests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading exercise edit requests:", error);
    }
  };

  const resolveExerciseReport = async (reportId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/admin/exercise-reports/${reportId}/resolve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) {
        throw new Error("Resolve failed");
      }
      await loadExerciseReports();
    } catch (error) {
      console.error("Resolve report error:", error);
    }
  };

  const resolveEditRequest = async (requestId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/admin/exercise-edit-requests/${requestId}/resolve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) {
        throw new Error("Resolve failed");
      }
      await loadExerciseEditRequests();
    } catch (error) {
      console.error("Resolve edit request error:", error);
    }
  };

  const loadOverviewStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/overview-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to load overview stats");
      }
      const data = await response.json();
      setOverviewStats(data);
    } catch (error) {
      console.error("Admin overview stats error:", error);
      toast({
        title: t("admin.errors.title", "Fehler"),
        description: t(
          "admin.errors.overviewLoad",
          "Übersichtsdaten konnten nicht geladen werden."
        ),
        variant: "destructive",
      });
    }
  };

  const loadMonitoringData = async () => {
    setIsLoadingMonitoring(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/monitoring`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMonitoringData(data);
      }
    } catch (error) {
      console.error("Error loading monitoring data:", error);
      toast({
        title: t("admin.errors.title", "Fehler"),
        description: t(
          "admin.errors.monitoringLoad",
          "Fehler beim Laden der Monitoring-Daten"
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  const handleCleanupJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/monitoring/cleanup-jobs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: t("admin.success.title", "Erfolg"),
          description: t(
            "admin.success.cleanupJobs",
            "Stuck Jobs wurden bereinigt"
          ),
        });
        await loadMonitoringData();
      }
    } catch (error) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description: t("admin.errors.cleanupJobs", "Fehler beim Cleanup der Jobs"),
        variant: "destructive",
      });
    }
  };

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadExercises(),
        loadExerciseReports(),
        loadExerciseEditRequests(),
        loadOverviewStats(),
      ]);
    } catch (error) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description: t("admin.errors.adminLoad", "Fehler beim Laden der Admin-Daten"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Lade Daten beim Komponenten-Mount
  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    }
  }, [user?.role, loadAdminData]);

  useEffect(() => {
    if (user?.role === "admin" && activeTab === "monitoring") {
      if (!monitoringData && !isLoadingMonitoring) {
        loadMonitoringData();
      }
    }
  }, [user?.role, activeTab, monitoringData, isLoadingMonitoring]);

  // Prüfe Admin-Rechte
  if (user?.role !== "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {t("admin.accessDenied.title", "Zugriff verweigert")}
              </h2>
              <p className="text-muted-foreground">
                {t(
                  "admin.accessDenied.body",
                  "Sie haben keine Berechtigung, auf den Admin-Bereich zuzugreifen."
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t("admin.date.never", "Nie");

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return t("admin.date.invalid", "Ungültiges Datum");
      }
      return date.toLocaleString(i18n.language || "de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error, "Input:", dateString);
      return t("admin.date.invalid", "Ungültiges Datum");
    }
  };

  const maskEmail = (email: string) => {
    if (showEmails) return email;
    const [name, domain] = email.split("@");
    return `${name.substring(0, 2)}***@${domain}`;
  };

  return (
    <PageTemplate
      title={t("admin.title", "Admin Panel")}
      subtitle={t(
        "admin.subtitle",
        "Verwaltung der App-Einstellungen und Benutzer"
      )}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">
              {t("admin.tabs.overview", "Übersicht")}
            </TabsTrigger>
            <TabsTrigger value="users">
              {t("admin.tabs.users", "Benutzerverwaltung")}
            </TabsTrigger>
            <TabsTrigger value="exercise-management">
              {t("admin.tabs.exercises", "Übungsverwaltung")}
            </TabsTrigger>
            <TabsTrigger value="moderation">
              {t("admin.tabs.moderation", "Moderation")}
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              {t("admin.tabs.monitoring", "Monitoring")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            {/* App Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                {t("admin.stats.title", "App-Statistiken")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {overviewStats?.users ?? users.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.users", "Registrierte Benutzer")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter((u) => u.isEmailVerified).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.verifiedEmails", "Verifizierte E-Mails")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {users.filter((u) => u.role === "admin").length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.admins", "Administratoren")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">
                      {overviewStats?.workouts ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.workouts", "Durchgeführte Trainings")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {overviewStats?.templates ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.templates", "Workout‑Vorlagen")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {overviewStats?.exercises ?? exercises.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.exercises", "Angelegte Übungen")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-sky-600">
                      {overviewStats?.recoveryEntries ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.recoveryEntries", "Erholungstagebuch‑Einträge")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-rose-600">
                      {overviewStats?.badges ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.badges", "Vergebene Badges")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">
                      {overviewStats?.awards ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.awards", "Vergebene Auszeichnungen")}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-teal-600">
                      {overviewStats?.workoutActivities ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {t("admin.stats.activities", "Getrackte Aktivitäten")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                  {t("admin.users.title", "Benutzer-Verwaltung")}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmails(!showEmails)}
                  >
                    {showEmails ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  {showEmails
                    ? t("admin.users.hideEmails", "E-Mails verbergen")
                    : t("admin.users.showEmails", "E-Mails anzeigen")}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[720px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 z-10 bg-background">
                          {t("admin.users.table.name", "Name")}
                          </TableHead>
                        <TableHead>{t("admin.users.table.email", "E-Mail")}</TableHead>
                        <TableHead>{t("admin.users.table.status", "Status")}</TableHead>
                        <TableHead>{t("admin.users.table.created", "Erstellt")}</TableHead>
                        <TableHead>{t("admin.users.table.lastLogin", "Letzter Login")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((adminUser) => (
                          <TableRow key={adminUser.id}>
                            <TableCell className="sticky left-0 z-10 bg-background">
                              <div>
                                <p className="font-medium">
                                  {adminUser.firstName} {adminUser.lastName}
                                </p>
                                {adminUser.nickname && (
                                  <p className="text-sm text-muted-foreground">
                                    "{adminUser.nickname}"
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-mono text-sm">
                                {maskEmail(adminUser.email)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {adminUser.role === "admin" && (
                                  <Badge variant="secondary">
                                    <Shield className="w-3 h-3 mr-1" />
                                  {t("admin.users.badge.admin", "Admin")}
                                  </Badge>
                                )}
                                {adminUser.isEmailVerified && (
                                  <Badge
                                    variant="outline"
                                    className="text-green-600"
                                  >
                                  {t("admin.users.badge.verified", "✓ Verifiziert")}
                                  </Badge>
                                )}
                                {adminUser.has2FA && (
                                  <Badge
                                    variant="outline"
                                    className="text-blue-600"
                                  >
                                    🔒 2FA
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(adminUser.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(adminUser.lastLoginAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {users.length === 0 && (
                    <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {t("admin.users.empty", "Keine Benutzer gefunden")}
                    </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={loadAdminData}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
            {isLoading
              ? t("admin.users.refreshLoading", "Wird geladen...")
              : t("admin.users.refresh", "Daten aktualisieren")}
            </Button>
          </TabsContent>

          <TabsContent value="exercise-management" className="space-y-6">
            <div className="space-y-6">
              <Card ref={mergeSectionRef}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {t("admin.exercises.merge.title", "Zusammenführen")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <Label>{t("admin.exercises.merge.source", "Quell‑Übung")}</Label>
                    <ExerciseMergeSelect
                      value={mergeSourceId}
                      onChange={setMergeSourceId}
                      placeholder={t("admin.exercises.merge.sourcePlaceholder", "Quelle wählen")}
                      options={exercises}
                    />
                  </div>
                  <div>
                    <Label>{t("admin.exercises.merge.target", "Ziel‑Übung")}</Label>
                    <ExerciseMergeSelect
                      value={mergeTargetId}
                      onChange={setMergeTargetId}
                      placeholder={t("admin.exercises.merge.targetPlaceholder", "Ziel wählen")}
                      options={exercises.filter((exercise) => exercise.id !== mergeSourceId)}
                    />
                  </div>
                    <Button
                      variant="outline"
                      disabled={!mergeSourceId || !mergeTargetId}
                      onClick={() => handleMergeExercise(mergeSourceId, mergeTargetId)}
                    >
                    {t("admin.exercises.merge.action", "Zusammenführen")}
                    </Button>
                </CardContent>
              </Card>

              <ExerciseBrowsePanel
                title={t("exerciseLibrary.search", "Übungen durchsuchen")}
                query={exerciseManagementQuery}
                onQueryChange={(value) => {
                  setExerciseManagementQuery(value);
                  setExerciseManagementPage(1);
                }}
                viewMode={exerciseManagementView}
                onViewModeChange={setExerciseManagementView}
                filtersOpen={exerciseManagementFiltersOpen}
                onToggleFilters={() => setExerciseManagementFiltersOpen((prev) => !prev)}
                sortBy={exerciseManagementSortBy}
                sortDirection={exerciseManagementSortDirection}
                onSortByChange={setExerciseManagementSortBy}
                onSortDirectionToggle={() =>
                  setExerciseManagementSortDirection((prev) =>
                    prev === "asc" ? "desc" : "asc"
                  )
                }
                sortOptions={exerciseManagementSortOptions}
                filtersPanel={
                  <ExerciseFiltersPanel
                    categoryOptions={exerciseManagementCategoryOptions}
                    disciplineOptions={exerciseManagementDisciplineOptions}
                    movementPatternOptions={movementPatternOptions}
                    measurementOptions={measurementOptions}
                    muscleGroups={muscleGroupTree}
                    categoryFilter={exerciseManagementCategoryFilter}
                    onCategoryFilterChange={(value) => {
                      setExerciseManagementCategoryFilter(value);
                      setExerciseManagementPage(1);
                    }}
                    disciplineFilter={exerciseManagementDisciplineFilter}
                    onDisciplineFilterChange={(value) => {
                      setExerciseManagementDisciplineFilter(value);
                      setExerciseManagementPage(1);
                    }}
                    movementPatternFilter={exerciseManagementMovementPatternFilter}
                    onMovementPatternFilterChange={(value) => {
                      setExerciseManagementMovementPatternFilter(value);
                      setExerciseManagementPage(1);
                    }}
                    measurementFilters={exerciseManagementMeasurementFilters}
                    onMeasurementFiltersChange={(value) => {
                      setExerciseManagementMeasurementFilters(value);
                      setExerciseManagementPage(1);
                    }}
                    muscleFilters={exerciseManagementMuscleFilters}
                    onMuscleFiltersChange={(value) => {
                      setExerciseManagementMuscleFilters(value);
                      setExerciseManagementPage(1);
                    }}
                    requiresWeightFilter={exerciseManagementRequiresWeightFilter}
                    onRequiresWeightFilterChange={(value) => {
                      setExerciseManagementRequiresWeightFilter(value);
                      setExerciseManagementPage(1);
                    }}
                    difficultyRange={exerciseManagementDifficultyRange}
                    onDifficultyRangeChange={(value) => {
                      setExerciseManagementDifficultyRange(value);
                      setExerciseManagementPage(1);
                    }}
                    onReset={() => {
                      exerciseManagementResetFilters();
                      setExerciseManagementPage(1);
                    }}
                  />
                }
                loading={isLoading}
                empty={exerciseManagementPagination.totalItems === 0}
                emptyText={t("exerciseLibrary.empty", "Keine Übungen gefunden.")}
                loadingText={t("common.loading", "Lade...")}
                grid={
                  <ExerciseBrowseGrid
                    items={exerciseManagementPageItems}
                    onSelect={(exercise) => exerciseManagementOpenView(exercise)}
                    renderMenuItems={(exercise) => (
                      <>
                        <DropdownMenuItem onSelect={() => exerciseManagementOpenView(exercise)}>
                          {t("admin.exercises.actions.details", "Details")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => exerciseManagementOpenEdit(exercise)}>
                          {t("admin.exercises.actions.edit", "Bearbeiten")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setMergeSourceId(exercise.id);
                            toast({
                              title: t("admin.exercises.merge.toastTitle", "Quelle gesetzt"),
                              description: t(
                                "admin.exercises.merge.toastDescription",
                                {
                                  name: exercise.name,
                                  defaultValue: `${exercise.name} als Quell‑Übung ausgewählt.`,
                                }
                              ),
                            });
                            requestAnimationFrame(() => {
                              mergeSectionRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            });
                          }}
                        >
                          {t("admin.exercises.actions.merge", "Zusammenführen")}
                        </DropdownMenuItem>
                      </>
                    )}
                    labels={getExerciseBrowseLabels(t)}
                  />
                }
                table={
                  <ExerciseBrowseTable
                    items={exerciseManagementPageItems}
                    sortBy={exerciseManagementSortBy}
                    sortDirection={exerciseManagementSortDirection}
                    onSortClick={exerciseManagementHandleSortClick}
                    onSelect={(exercise) => exerciseManagementOpenView(exercise)}
                    renderMenuItems={(exercise) => (
                      <>
                        <DropdownMenuItem onSelect={() => exerciseManagementOpenView(exercise)}>
                          {t("admin.exercises.actions.details", "Details")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => exerciseManagementOpenEdit(exercise)}>
                          {t("admin.exercises.actions.edit", "Bearbeiten")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setMergeSourceId(exercise.id);
                            toast({
                              title: t("admin.exercises.merge.toastTitle", "Quelle gesetzt"),
                              description: t(
                                "admin.exercises.merge.toastDescription",
                                {
                                  name: exercise.name,
                                  defaultValue: `${exercise.name} als Quell‑Übung ausgewählt.`,
                                }
                              ),
                            });
                            requestAnimationFrame(() => {
                              mergeSectionRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            });
                          }}
                        >
                          {t("admin.exercises.actions.merge", "Zusammenführen")}
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
                        {exerciseManagementPagination.totalItems > 0 &&
                          t("exerciseLibrary.totalExercises", {
                            count: exerciseManagementPagination.totalItems,
                            defaultValue: `${exerciseManagementPagination.totalItems} Übungen gefunden`,
                          })}
                      </div>
                      <PageSizeSelector
                        pageSize={exerciseManagementPageSize}
                        onPageSizeChange={(next) => {
                          setExerciseManagementPageSize(next);
                          setExerciseManagementPage(1);
                        }}
                        label={t("filters.itemsPerPage", "Pro Seite:")}
                        options={[6, 12, 24, 48]}
                      />
                    </div>
                    {exerciseManagementPagination.totalPages > 1 && (
                      <PaginationControls
                        pagination={exerciseManagementPagination}
                        onPageChange={setExerciseManagementPage}
                        pageSize={exerciseManagementPageSize}
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
            </div>

            <Dialog open={exerciseEditDialogOpen} onOpenChange={(open) => (open ? null : exerciseManagementCloseEdit())}>
              <DialogContent className="max-w-4xl overflow-y-auto max-h-[85vh]">
                <DialogHeader className="pr-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <DialogTitle className="text-xl">
                        {detailExercise?.name ||
                          t("admin.exerciseDetail.exercise", "Übung")}
                      </DialogTitle>
                      {exerciseDialogMode === "view" && detailExercise && (
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>{getExerciseCategoryLabel(detailExercise.category, t) || "-"}</span>
                          <span>·</span>
                          <span>{getExerciseDisciplineLabel(detailExercise.discipline, t) || "-"}</span>
                          <span>·</span>
                          <span>{detailExercise.measurementType || "-"}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => navigateExercise("prev")} disabled={!hasPrevDetail}>
                        <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => navigateExercise("next")} disabled={!hasNextDetail}>
                        <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                {detailExercise && (
                  <div className="space-y-6">
                    {exerciseDialogMode === "view" && (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 rounded-lg border p-4">
                          <div className="text-xs font-medium text-muted-foreground">
                            {t("admin.exerciseDetail.title", "Details")}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>
                              <strong>{t("admin.exerciseDetail.discipline", "Disziplin")}:</strong>{" "}
                              {getExerciseDisciplineLabel(detailExercise.discipline, t) || "-"}
                            </div>
                            <div>
                              <strong>{t("admin.exerciseDetail.movementPattern", "Bewegungsmuster")}:</strong>{" "}
                              {getExerciseMovementPatternLabel(detailExercise.movementPattern, t) || "-"}
                            </div>
                            <div>
                              <strong>{t("admin.exerciseDetail.difficulty", "Schwierigkeit")}:</strong>{" "}
                              {detailExercise.difficultyTier ?? "-"}
                            </div>
                            <div>
                              <strong>{t("admin.exerciseDetail.unit", "Einheit")}:</strong>{" "}
                              {detailExercise.unit || "-"}
                            </div>
                            <div>
                              <strong>{t("admin.exerciseDetail.supportsSets", "Sets/Reps")}:</strong>{" "}
                              {detailExercise.supportsSets
                                ? t("admin.exerciseDetail.yes", "Ja")
                                : t("admin.exerciseDetail.no", "Nein")}
                            </div>
                            <div>
                              <strong>{t("admin.exerciseDetail.requiresWeight", "Gewicht erforderlich")}:</strong>{" "}
                              {detailExercise.requiresWeight
                                ? t("admin.exerciseDetail.yes", "Ja")
                                : t("admin.exerciseDetail.no", "Nein")}
                            </div>
                            <div>
                              <strong>{t("admin.exerciseDetail.allowsWeight", "Gewicht optional")}:</strong>{" "}
                              {detailExercise.allowsWeight
                                ? t("admin.exerciseDetail.yes", "Ja")
                                : t("admin.exerciseDetail.no", "Nein")}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 rounded-lg border p-4">
                          <div className="text-xs font-medium text-muted-foreground">
                            {t("admin.exerciseDetail.muscleGroups", "Muskelgruppen")}
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
                            {t("admin.exerciseDetail.equipment", "Equipment")}
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
                      <Button
                        variant={exerciseDialogMode === "view" ? "default" : "outline"}
                        onClick={() => setExerciseDialogMode("view")}
                      >
                      {t("admin.exercises.actions.details", "Details")}
                      </Button>
                      <Button
                        variant={exerciseDialogMode === "edit" ? "default" : "outline"}
                        onClick={() => {
                          if (detailExercise) {
                            const formValue = exerciseManagementToFormValue(detailExercise);
                            setExerciseEditDraft(formValue);
                            setExerciseEditDescriptionOpen(Boolean(formValue.description));
                            setExerciseDialogMode("edit");
                          }
                        }}
                      >
                      {t("admin.exercises.actions.edit", "Bearbeiten")}
                      </Button>
                    </div>

                    {exerciseDialogMode === "edit" && exerciseEditDraft && (
                      <ExerciseForm
                        value={exerciseEditDraft}
                        onChange={setExerciseEditDraft}
                        onSubmit={exerciseManagementHandleSave}
                      submitLabel={t(
                        "admin.exerciseDetail.saveChanges",
                        "Änderungen speichern"
                      )}
                        submitDisabled={exerciseEditSaving}
                        descriptionOpen={exerciseEditDescriptionOpen}
                        onDescriptionToggle={setExerciseEditDescriptionOpen}
                        showDescriptionToggle
                        defaultDistanceUnit={user?.preferences?.units?.distance || "km"}
                        defaultTimeUnit="min"
                      />
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t("admin.moderation.reports.title", "Übungs-Reports")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exerciseReports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                  {t("admin.moderation.reports.empty", "Keine offenen Reports")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[720px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 z-10 bg-background">
                          {t("admin.moderation.reports.table.exercise", "Übung")}
                          </TableHead>
                        <TableHead>{t("admin.moderation.reports.table.reason", "Grund")}</TableHead>
                        <TableHead>{t("admin.moderation.reports.table.details", "Beschreibung")}</TableHead>
                        <TableHead>{t("admin.moderation.reports.table.created", "Erstellt")}</TableHead>
                        <TableHead className="sticky right-0 z-10 bg-background text-right">
                          {t("admin.moderation.reports.table.actions", "Aktionen")}
                        </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exerciseReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="sticky left-0 z-10 bg-background text-sm">
                              {exerciseMap.get(report.exerciseId)?.name ||
                                report.exerciseId}
                            </TableCell>
                            <TableCell>{report.reason}</TableCell>
                            <TableCell className="text-xs">
                              {report.description || "-"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatDate(report.createdAt)}
                            </TableCell>
                            <TableCell className="sticky right-0 z-10 bg-background">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    resolveExerciseReport(report.id, "resolved")
                                  }
                                >
                                {t("admin.moderation.reports.actions.resolve", "Erledigt")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    resolveExerciseReport(report.id, "dismissed")
                                  }
                                >
                                {t("admin.moderation.reports.actions.dismiss", "Ablehnen")}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  {t("admin.moderation.edits.title", "Änderungsanfragen")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exerciseEditRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                  {t("admin.moderation.edits.empty", "Keine offenen Änderungsanfragen")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[860px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 z-10 bg-background">
                          {t("admin.moderation.edits.table.exercise", "Übung")}
                          </TableHead>
                        <TableHead>{t("admin.moderation.edits.table.changes", "Änderungen")}</TableHead>
                        <TableHead>{t("admin.moderation.edits.table.created", "Erstellt")}</TableHead>
                        <TableHead className="sticky right-0 z-10 bg-background text-right">
                          {t("admin.moderation.edits.table.actions", "Aktionen")}
                        </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exerciseEditRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="sticky left-0 z-10 bg-background text-sm">
                              {exerciseMap.get(request.exerciseId)?.name ||
                                request.exerciseId}
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="space-y-1">
                                {Object.entries(request.changeRequest || {}).map(
                                  ([key, value]) => {
                                    const exercise = exerciseMap.get(
                                      request.exerciseId
                                    ) as any;
                                    const oldValue =
                                      exercise && key in exercise
                                        ? formatChangeValue(exercise[key])
                                        : null;
                                    return (
                                      <div key={key}>
                                        <span className="font-medium">
                                          {changeKeyLabels[key] || key}
                                        </span>
                                        :{" "}
                                        {oldValue ? (
                                          <>
                                            <span className="line-through text-muted-foreground">
                                              {oldValue}
                                            </span>{" "}
                                            → <span>{formatChangeValue(value)}</span>
                                          </>
                                        ) : (
                                          <span>{formatChangeValue(value)}</span>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatDate(request.createdAt)}
                            </TableCell>
                            <TableCell className="sticky right-0 z-10 bg-background">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    resolveEditRequest(request.id, "approved")
                                  }
                                >
                              {t("admin.moderation.edits.actions.approve", "Freigeben")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    resolveEditRequest(request.id, "rejected")
                                  }
                                >
                              {t("admin.moderation.edits.actions.reject", "Ablehnen")}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <h2 className="text-xl font-semibold">
                {t("admin.monitoring.title", "Monitoring")}
              </h2>
            </div>

            {isLoadingMonitoring && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                {t("admin.monitoring.loading", "Monitoring-Daten werden geladen...")}
                </CardContent>
              </Card>
            )}

            {!isLoadingMonitoring && !monitoringData && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                {t("admin.monitoring.empty", "Keine Monitoring-Daten verfügbar.")}
                </CardContent>
              </Card>
            )}

            {monitoringData && (
              <>
                {/* Job Stats */}
                <Card>
                  <CardHeader>
                  <CardTitle>{t("admin.monitoring.jobs.title", "Job-Status")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {monitoringData.jobs.stuckJobs.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                        {t("admin.monitoring.jobs.stuck", {
                          count: monitoringData.jobs.stuckJobs.length,
                          defaultValue: `${monitoringData.jobs.stuckJobs.length} stuck job(s) gefunden`,
                        })}
                        <Button
                          onClick={handleCleanupJobs}
                          variant="outline"
                          size="sm"
                          className="ml-4"
                        >
                          {t("admin.monitoring.jobs.cleanup", "Cleanup durchführen")}
                        </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {monitoringData.jobs.stats.map((stat: any) => (
                        <div
                          key={`${stat.job_name}-${stat.status}`}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {stat.job_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {stat.status}
                              </p>
                            </div>
                            <Badge
                              variant={
                                stat.status === "completed"
                                  ? "default"
                                  : stat.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {stat.count}
                            </Badge>
                          </div>
                          {stat.last_run && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {t("admin.monitoring.jobs.lastRun", "Letzter Lauf")}:{" "}
                              {new Date(stat.last_run).toLocaleString(i18n.language || "de-DE")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {monitoringData.jobs.recentFailures.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">
                        {t("admin.monitoring.jobs.recentFailures", "Fehler der letzten 7 Tage")}
                        </h4>
                        <div className="space-y-2">
                          {monitoringData.jobs.recentFailures.map(
                            (failure: any) => (
                              <div
                                key={failure.job_name}
                                className="flex items-center justify-between p-2 bg-destructive/10 rounded"
                              >
                                <span className="text-sm">
                                  {failure.job_name}
                                </span>
                                <Badge variant="destructive">
                                  {failure.count}
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Email Queue Stats */}
                <Card>
                  <CardHeader>
                  <CardTitle>{t("admin.monitoring.emails.title", "E-Mail-Warteschlange")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {monitoringData.emails.stats.map((stat: any) => (
                        <div key={stat.status} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{stat.status}</p>
                              <p className="text-xs text-muted-foreground">
                                {stat.status === "failed" &&
                                  stat.failed_after_retries > 0
                                  ? t("admin.monitoring.emails.stats.failedAfterRetries", {
                                    count: stat.failed_after_retries,
                                    defaultValue: `${stat.failed_after_retries} nach Retries`,
                                  })
                                  : t("admin.monitoring.emails.stats.total", "Gesamt")}
                              </p>
                            </div>
                            <Badge
                              variant={
                                stat.status === "sent"
                                  ? "default"
                                  : stat.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {stat.count}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                    <h4 className="font-semibold mb-2">
                      {t("admin.monitoring.emails.recentTitle", "Letzte E-Mails (24h)")}
                    </h4>
                      <div className="overflow-x-auto">
                        <Table className="min-w-[720px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="sticky left-0 z-10 bg-background">
                              {t("admin.monitoring.emails.table.recipient", "Empfänger")}
                              </TableHead>
                            <TableHead>{t("admin.monitoring.emails.table.subject", "Betreff")}</TableHead>
                            <TableHead>{t("admin.monitoring.emails.table.status", "Status")}</TableHead>
                            <TableHead>{t("admin.monitoring.emails.table.attempts", "Versuche")}</TableHead>
                            <TableHead>{t("admin.monitoring.emails.table.created", "Erstellt")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {monitoringData.emails.recent
                              .slice(0, 10)
                              .map((email: any) => (
                                <TableRow key={email.id}>
                                  <TableCell className="sticky left-0 z-10 bg-background font-mono text-xs">
                                    {email.recipient}
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {email.subject}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        email.status === "sent"
                                          ? "default"
                                          : email.status === "failed"
                                            ? "destructive"
                                            : "secondary"
                                      }
                                    >
                                      {email.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{email.attempts}</TableCell>
                                  <TableCell className="text-xs">
                                    {new Date(email.createdAt).toLocaleString(
                                      i18n.language || "de-DE"
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!monitoringData && !isLoadingMonitoring && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                  {t(
                    "admin.monitoring.refreshHint",
                    t(
                      "admin.monitoring.refreshHint",
                      'Klicken Sie auf "Aktualisieren", um Monitoring-Daten zu laden'
                    )
                  )}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
