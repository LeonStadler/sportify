import { PageTemplate } from "@/components/common/PageTemplate";
import { PageSizeSelector } from "@/components/common/pagination/PageSizeSelector";
import { PaginationControls } from "@/components/common/pagination/PaginationControls";
import { ExerciseBrowsePanel } from "@/components/exercises/ExerciseBrowsePanel";
import {
  categoryOptions as defaultCategoryOptions,
  disciplineOptions as defaultDisciplineOptions,
  movementPatternOptions as defaultMovementPatternOptions,
  muscleGroupTree,
} from "@/components/exercises/exerciseOptions";
import {
  getExerciseMovementPatternLabel,
  getExerciseMuscleGroupLabel,
} from "@/components/exercises/exerciseLabels";
import { TimeRangeFilter } from "@/components/filters/TimeRangeFilter";
import { TemplateBrowseGrid, TemplateBrowseTable, type TemplateBrowseItem } from "@/components/training/TemplateBrowseList";
import { TemplateFiltersPanel } from "@/components/training/TemplateFiltersPanel";
import { TrainingDiarySection } from "@/components/training/TrainingDiarySection";
import { WorkoutForm } from "@/components/training/WorkoutForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import type { Workout } from "@/types/workout";
import { getNormalizedRange, getRangeForPeriod, toDateParam } from "@/utils/dateRanges";
import { convertDistance, convertWeightFromKg } from "@/utils/units";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Eye, Info, Pencil, Play, Star, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
interface WorkoutResponse {
  workouts: Workout[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface TemplateResponse {
  templates: Workout[];
}

interface TemplateFetchOptions {
  silent?: boolean;
}

const WORKOUTS_PER_PAGE = 10;
const RECENT_WORKOUTS_LIMIT = 5;

const getVisibilityLabel = (value?: string) => {
  switch (value) {
    case "public":
      return "Public";
    case "friends":
      return "Friends";
    default:
      return "Private";
  }
};

const getVisibilityBadgeClass = (value?: string) => {
  switch (value) {
    case "public":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "friends":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getTemplateOwnerName = (template: Workout) => {
  const owner = template.owner;
  if (!owner) return "-";
  const firstName = owner.firstName || "";
  const lastName = owner.lastName || "";
  const nickname = owner.nickname || "";

  switch (owner.displayPreference) {
    case "nickname":
      return nickname.trim() || `${firstName} ${lastName}`.trim() || "-";
    case "fullName":
      return `${firstName} ${lastName}`.trim() || nickname || "-";
    case "firstName":
    default:
      return firstName || nickname || `${firstName} ${lastName}`.trim() || "-";
  }
};

const getTemplateRelevanceScore = (template: Workout, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 0;

  const title = (template.title || "").toLowerCase();
  const description = (template.description || "").toLowerCase();
  const ownerName = getTemplateOwnerName(template).toLowerCase();
  const muscles = (template.muscleGroups || []).join(" ").toLowerCase();

  let score = 0;
  if (title === normalized) score += 30;
  if (title.startsWith(normalized)) score += 20;
  if (title.includes(normalized)) score += 12;
  if (description.includes(normalized)) score += 6;
  if (ownerName.includes(normalized)) score += 5;
  if (muscles.includes(normalized)) score += 4;
  return score;
};

export function Training() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user, updateProfile } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [period, setPeriod] = useState<string>("month");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [offset, setOffset] = useState(0);
  const resolvedRange = useMemo(
    () => getNormalizedRange(getRangeForPeriod(period, customRange, offset)),
    [customRange, period, offset]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [createdWorkoutId, setCreatedWorkoutId] = useState<string | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState("trainings");
  const [templates, setTemplates] = useState<Workout[]>([]);
  const [prefillWorkout, setPrefillWorkout] = useState<Workout | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templatePickerQuery, setTemplatePickerQuery] = useState("");
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const nextFavorites =
      user.preferences?.workouts?.favoriteTemplateIds ?? [];
    setFavoriteTemplateIds(nextFavorites);
  }, [user]);
  const [templateSourceFilter, setTemplateSourceFilter] = useState("all");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("all");
  const [templateDisciplineFilter, setTemplateDisciplineFilter] = useState("all");
  const [templateMovementPatternFilter, setTemplateMovementPatternFilter] = useState("all");
  const [templateMuscleFilters, setTemplateMuscleFilters] = useState<string[]>([]);
  const [templateDifficultyRange, setTemplateDifficultyRange] = useState<[number, number]>([1, 10]);
  const [templateViewMode, setTemplateViewMode] = useState<"grid" | "table">("grid");
  const [templateFiltersOpen, setTemplateFiltersOpen] = useState(false);
  const [templateSortBy, setTemplateSortBy] = useState("relevance");
  const [templateSortDirection, setTemplateSortDirection] = useState<"asc" | "desc">("desc");
  const [templateCurrentPage, setTemplateCurrentPage] = useState(1);
  const [templatePageSize, setTemplatePageSize] = useState(12);
  const [templateCreateOpen, setTemplateCreateOpen] = useState(false);
  const [templateCreatePrefill, setTemplateCreatePrefill] = useState<Workout | null>(null);
  const [templateCreateMode, setTemplateCreateMode] = useState<"create" | "duplicate">(
    "create"
  );
  const [templateDetailId, setTemplateDetailId] = useState<string | null>(null);
  const [templateDetailMode, setTemplateDetailMode] = useState<"view" | "edit">("view");
  const [templateLineage, setTemplateLineage] = useState<Workout[]>([]);
  const [templateLineageLoading, setTemplateLineageLoading] = useState(false);
  const [templateDuplicatesOpen, setTemplateDuplicatesOpen] = useState(false);
  const workoutFormRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const weightUnit = user?.preferences?.units?.weight || "kg";
  const distanceUnit = user?.preferences?.units?.distance || "km";

  const [exerciseTypes, setExerciseTypes] = useState<Array<{ id: string; name: string }>>([
    { id: "all", name: t("training.allExercises") },
  ]);

  const loadExerciseTypes = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/exercises?limit=500`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Exercise list failed");
      }
      const data = await response.json();
      const items = Array.isArray(data.exercises)
        ? data.exercises.map((exercise: { id: string; name: string }) => ({
          id: exercise.id,
          name: exercise.name,
        }))
        : [];
      setExerciseTypes([{ id: "all", name: t("training.allExercises") }, ...items]);
    } catch (error) {
      console.error("Load exercise types error:", error);
    }
  }, [t]);

  const loadWorkouts = useCallback(
    async (page = 1, type = "all") => {
      if (!user) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          page: page.toString(),
          limit: WORKOUTS_PER_PAGE.toString(),
          ...(type !== "all" && { type }),
        });

        if (resolvedRange?.from && resolvedRange?.to) {
          params.set("startDate", toDateParam(resolvedRange.from));
          params.set("endDate", toDateParam(resolvedRange.to));
        }

        const response = await fetch(`${API_URL}/workouts?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(t("training.loadError"));
        }

        const data: WorkoutResponse = await response.json();
        setWorkouts(data.workouts);
        setPagination(data.pagination);
        setCurrentPage(page);
      } catch (error) {
        console.error("Load workouts error:", error);
        toast({
          title: t("common.error"),
          description: t("training.workoutsLoadError"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [resolvedRange?.from, resolvedRange?.to, t, toast, user]
  );

  const loadRecentWorkouts = useCallback(async () => {
    if (!user) return;

    try {
      setRecentLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: "1",
        limit: RECENT_WORKOUTS_LIMIT.toString(),
      });

      const response = await fetch(`${API_URL}/workouts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t("training.loadError"));
      }

      const data: WorkoutResponse = await response.json();
      setRecentWorkouts(Array.isArray(data.workouts) ? data.workouts : []);
    } catch (error) {
      console.error("Load recent workouts error:", error);
      toast({
        title: t("common.error"),
        description: t("training.workoutsLoadError"),
        variant: "destructive",
      });
    } finally {
      setRecentLoading(false);
    }
  }, [t, toast, user]);

  const loadTemplates = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/workouts/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Template load failed");
      }
      const data: TemplateResponse = await response.json();
      setTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch (error) {
      console.error("Load templates error:", error);
    }
  }, [user]);

  useEffect(() => {
    loadWorkouts(1, filterType);
  }, [loadWorkouts, filterType]);

  useEffect(() => {
    loadRecentWorkouts();
  }, [loadRecentWorkouts]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (user) {
      loadExerciseTypes();
    }
  }, [loadExerciseTypes, user]);

  const handleWorkoutCreated = (workoutId?: string) => {
    // Lade die erste Seite neu um das neue Workout zu zeigen
    loadWorkouts(1, filterType);
    loadRecentWorkouts();
    loadTemplates();

    // Zeige Dialog an, wenn ein neues Workout erstellt wurde
    if (workoutId) {
      setCreatedWorkoutId(workoutId);
      setShowRecoveryDialog(true);
    }
  };

  const handleTemplateCreated = () => {
    loadTemplates();
    setTemplateCreateOpen(false);
    setTemplateCreatePrefill(null);
    setTemplateDetailMode("view");
  };

  const handleUseTemplate = (template: Workout) => {
    setEditingWorkout(null);
    setPrefillWorkout(template);
    setTemplateDetailId(null);
    setTemplateDetailMode("view");
    setActiveTab("trainings");
    requestAnimationFrame(() => {
      workoutFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const templateSortOptions = useMemo(
    () => [
      { value: "relevance", label: t("training.templateSort.relevance", "Relevanz") },
      { value: "title", label: t("training.templateSort.title", "Titel") },
      { value: "difficulty", label: t("training.templateSort.difficulty", "Schwierigkeit") },
      { value: "usage", label: t("training.templateSort.usage", "Nutzung") },
      { value: "updatedAt", label: t("training.templateSort.updatedAt", "Zuletzt aktualisiert") },
      { value: "owner", label: t("training.templateSort.owner", "Ersteller") },
    ],
    [t]
  );

  const templateCategoryOptions = useMemo(() => {
    const options = new Set(defaultCategoryOptions);
    templates.forEach((template) => {
      if (template.category) options.add(template.category);
    });
    return Array.from(options).filter(Boolean);
  }, [templates]);

  const templateDisciplineOptions = useMemo(() => {
    const options = new Set(defaultDisciplineOptions);
    templates.forEach((template) => {
      if (template.discipline) options.add(template.discipline);
    });
    return Array.from(options).filter(Boolean);
  }, [templates]);

  const templateMovementPatternOptions = useMemo(() => {
    const known = new Map(
      defaultMovementPatternOptions.map((option) => [
        option.value,
        getExerciseMovementPatternLabel(option.value, t),
      ])
    );

    templates.forEach((template) => {
      const patterns =
        template.movementPatterns && template.movementPatterns.length > 0
          ? template.movementPatterns
          : template.movementPattern
            ? [template.movementPattern]
            : [];
      patterns.forEach((pattern) => {
        if (pattern && !known.has(pattern)) {
          known.set(pattern, pattern);
        }
      });
    });

    return Array.from(known.entries()).map(([value, label]) => ({ value, label }));
  }, [templates, t]);

  const templateFilteredSorted = useMemo(() => {
    const query = templateSearch.trim().toLowerCase();

    const filtered = templates.filter((template) => {
      const ownerId = template.owner?.id || null;
      const ownerName = getTemplateOwnerName(template).toLowerCase();
      const muscleString = (template.muscleGroups || []).join(" ").toLowerCase();
      const patterns =
        template.movementPatterns && template.movementPatterns.length > 0
          ? template.movementPatterns
          : template.movementPattern
            ? [template.movementPattern]
            : [];

      if (templateSourceFilter === "own" && ownerId !== user?.id) return false;
      if (templateSourceFilter === "friends" && template.visibility !== "friends") return false;
      if (templateSourceFilter === "public" && template.visibility !== "public") return false;

      if (templateCategoryFilter !== "all" && template.category !== templateCategoryFilter) {
        return false;
      }
      if (
        templateDisciplineFilter !== "all" &&
        template.discipline !== templateDisciplineFilter
      ) {
        return false;
      }
      if (
        templateMovementPatternFilter !== "all" &&
        !patterns.includes(templateMovementPatternFilter)
      ) {
        return false;
      }
      if (templateMuscleFilters.length > 0) {
        const muscleSet = new Set(template.muscleGroups || []);
        const hasAnyMuscle = templateMuscleFilters.some((muscle) => muscleSet.has(muscle));
        if (!hasAnyMuscle) return false;
      }

      const difficulty = Number(template.difficulty ?? 0);
      if (difficulty > 0) {
        if (difficulty < templateDifficultyRange[0] || difficulty > templateDifficultyRange[1]) {
          return false;
        }
      }

      if (!query) return true;
      return (
        template.title.toLowerCase().includes(query) ||
        (template.description || "").toLowerCase().includes(query) ||
        ownerName.includes(query) ||
        (template.category || "").toLowerCase().includes(query) ||
        (template.discipline || "").toLowerCase().includes(query) ||
        muscleString.includes(query)
      );
    });

    const direction = templateSortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      if (templateSortBy === "relevance") {
        const scoreA = getTemplateRelevanceScore(a, query);
        const scoreB = getTemplateRelevanceScore(b, query);
        if (scoreA !== scoreB) return (scoreA - scoreB) * direction;
        const usageDelta = (a.usageCount || 0) - (b.usageCount || 0);
        if (usageDelta !== 0) return usageDelta * direction;
        return (
          (new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()) *
          direction
        );
      }
      if (templateSortBy === "title") {
        return a.title.localeCompare(b.title) * direction;
      }
      if (templateSortBy === "owner") {
        return getTemplateOwnerName(a).localeCompare(getTemplateOwnerName(b)) * direction;
      }
      if (templateSortBy === "difficulty") {
        return (Number(a.difficulty || 0) - Number(b.difficulty || 0)) * direction;
      }
      if (templateSortBy === "usage") {
        return (Number(a.usageCount || 0) - Number(b.usageCount || 0)) * direction;
      }
      if (templateSortBy === "updatedAt") {
        return (
          (new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()) *
          direction
        );
      }
      return 0;
    });

    return sorted;
  }, [
    templateSearch,
    templates,
    templateSourceFilter,
    templateCategoryFilter,
    templateDisciplineFilter,
    templateMovementPatternFilter,
    templateMuscleFilters,
    templateDifficultyRange,
    templateSortDirection,
    templateSortBy,
    user?.id,
  ]);

  const templatePickerOptions = useMemo(() => {
    const query = templatePickerQuery.trim().toLowerCase();
    const filtered = templates.filter((template) => {
      if (!query) return true;
      const title = (template.title || "").toLowerCase();
      const owner = (template.owner?.displayName || "").toLowerCase();
      return title.includes(query) || owner.includes(query);
    });
    const favoriteSet = new Set(favoriteTemplateIds);
    return filtered.sort((a, b) => {
      const aFav = favoriteSet.has(a.id) ? 1 : 0;
      const bFav = favoriteSet.has(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [templates, templatePickerQuery, favoriteTemplateIds]);

  const handleToggleFavoriteTemplate = async (
    templateId: string,
    nextValue: boolean
  ) => {
    if (!user) return;
    const nextIds = nextValue
      ? Array.from(new Set([...favoriteTemplateIds, templateId]))
      : favoriteTemplateIds.filter((id) => id !== templateId);
    setFavoriteTemplateIds(nextIds);
    try {
      const nextPreferences = {
        ...user.preferences,
        workouts: {
          ...user.preferences?.workouts,
          favoriteTemplateIds: nextIds,
        },
      };
      await updateProfile(
        {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          nickname: user.nickname || "",
          displayPreference: user.displayPreference || "firstName",
          languagePreference: user.languagePreference || "de",
          preferences: nextPreferences,
        },
        true
      );
    } catch (error) {
      console.error("Failed to update favorite templates", error);
      setFavoriteTemplateIds(
        user.preferences?.workouts?.favoriteTemplateIds ?? []
      );
    }
  };

  const templateTotalPages = Math.max(
    1,
    Math.ceil(templateFilteredSorted.length / templatePageSize)
  );

  useEffect(() => {
    if (templateCurrentPage > templateTotalPages) {
      setTemplateCurrentPage(templateTotalPages);
    }
  }, [templateCurrentPage, templateTotalPages]);

  const templatePaginated = useMemo(() => {
    const start = (templateCurrentPage - 1) * templatePageSize;
    return templateFilteredSorted.slice(start, start + templatePageSize);
  }, [templateCurrentPage, templateFilteredSorted, templatePageSize]);

  const templatePaginationMeta = useMemo(
    () => ({
      currentPage: templateCurrentPage,
      totalPages: templateTotalPages,
      totalItems: templateFilteredSorted.length,
      hasPrev: templateCurrentPage > 1,
      hasNext: templateCurrentPage < templateTotalPages,
    }),
    [templateCurrentPage, templateFilteredSorted.length, templateTotalPages]
  );

  const templateBrowseItems = useMemo<TemplateBrowseItem[]>(
    () =>
      templatePaginated.map((template) => ({
        id: template.id,
        title: template.title,
        description: template.description || null,
        category: template.category || null,
        discipline: template.discipline || null,
        movementPattern:
          template.movementPatterns?.[0] || template.movementPattern || null,
        visibility: template.visibility,
        difficulty: template.difficulty ?? null,
        muscleGroups: template.muscleGroups || [],
        activitiesCount: template.activities?.length || 0,
        usageCount: Number(template.usageCount || 0),
        ownerName: getTemplateOwnerName(template),
        ownerId: template.owner?.id || null,
        sourceTemplateId: template.sourceTemplateId || null,
        sourceTemplateTitle: template.sourceTemplateTitle || null,
        sourceTemplateOwnerId: template.sourceTemplateOwnerId || null,
        sourceTemplateOwnerDisplayName:
          template.sourceTemplateOwnerDisplayName || null,
        sourceTemplateRootId: template.sourceTemplateRootId || null,
        sourceTemplateRootTitle: template.sourceTemplateRootTitle || null,
        sourceTemplateRootOwnerId: template.sourceTemplateRootOwnerId || null,
        sourceTemplateRootOwnerDisplayName:
          template.sourceTemplateRootOwnerDisplayName || null,
        isOwn: template.owner?.id === user?.id,
        isFavorite: favoriteTemplateIds.includes(template.id),
        updatedAt: template.updatedAt,
      })),
    [templatePaginated, user?.id, favoriteTemplateIds]
  );

  const templateDetail = useMemo(
    () => templates.find((template) => template.id === templateDetailId) || null,
    [templateDetailId, templates]
  );

  const openTemplateDetails = (
    template: Workout,
    mode: "view" | "edit" = "view"
  ) => {
    setTemplateDetailId(template.id);
    setTemplateDetailMode(mode);
  };

  const closeTemplateDetails = () => {
    setTemplateDetailId(null);
    setTemplateDetailMode("view");
  };

  const navigateTemplateDetails = (direction: "prev" | "next") => {
    if (!templateDetailId || templateFilteredSorted.length === 0) return;
    const index = templateFilteredSorted.findIndex((item) => item.id === templateDetailId);
    if (index < 0) return;
    const nextIndex =
      direction === "prev"
        ? (index - 1 + templateFilteredSorted.length) % templateFilteredSorted.length
        : (index + 1) % templateFilteredSorted.length;
    const nextTemplate = templateFilteredSorted[nextIndex];
    if (nextTemplate) {
      setTemplateDetailId(nextTemplate.id);
      setTemplateDetailMode("view");
    }
  };

  const handleTemplateSortClick = (next: string) => {
    if (templateSortBy !== next) {
      setTemplateSortBy(next);
      setTemplateSortDirection("asc");
      return;
    }
    if (templateSortDirection === "asc") {
      setTemplateSortDirection("desc");
      return;
    }
    setTemplateSortBy("relevance");
    setTemplateSortDirection("desc");
  };

  const openTemplateCreate = (prefill?: Workout | null) => {
    setTemplateCreatePrefill(prefill || null);
    setTemplateCreateMode(prefill ? "duplicate" : "create");
    setTemplateCreateOpen(true);
  };

  const handleDuplicateTemplate = (template: Workout) => {
    // Ensure duplicate form opens cleanly even when a details dialog is currently open.
    setTemplateDetailId(null);
    setTemplateDetailMode("view");
    openTemplateCreate(template);
  };

  const fetchTemplateById = useCallback(
    async (templateId: string, options?: TemplateFetchOptions) => {
      const localMatch = templates.find((entry) => entry.id === templateId);
      if (localMatch) return localMatch;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/workouts/templates/${templateId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Template not accessible");
        }

        const template: Workout = await response.json();
        setTemplates((prev) =>
          prev.some((entry) => entry.id === template.id) ? prev : [template, ...prev]
        );
        return template;
      } catch (error) {
        if (!options?.silent) {
          console.error("Template fetch error:", error);
          toast({
            title: t("common.error"),
            description: t(
              "training.sourceTemplateUnavailable",
              "Original-Vorlage ist nicht verfuegbar (ggf. privat oder keine Freundschaft)."
            ),
            variant: "destructive",
          });
        }
        return null;
      }
    },
    [templates, t, toast]
  );

  const openSourceTemplate = useCallback(
    async (templateId?: string | null) => {
      if (!templateId) return;

      const template = await fetchTemplateById(templateId);
      if (!template) return;
      setActiveTab("templates");
      openTemplateDetails(template, "view");
    },
    [fetchTemplateById]
  );

  const handleTemplateDelete = async (template: Workout) => {
    if (template.owner?.id !== user?.id) return;
    const confirmed = window.confirm(
      t(
        "training.templateDeleteConfirm",
        "Möchtest du diese Vorlage wirklich löschen?"
      )
    );
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/workouts/${template.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Delete failed");
      loadTemplates();
      closeTemplateDetails();
      toast({
        title: t("training.templateDeleted", "Vorlage gelöscht"),
      });
    } catch (error) {
      console.error("Delete template error:", error);
      toast({
        title: t("common.error"),
        description: t("training.templateDeleteError", "Vorlage konnte nicht gelöscht werden."),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setTemplateCurrentPage(1);
  }, [
    templateSearch,
    templateSourceFilter,
    templateCategoryFilter,
    templateDisciplineFilter,
    templateMovementPatternFilter,
    templateMuscleFilters,
    templateDifficultyRange,
    templateSortBy,
    templateSortDirection,
    templatePageSize,
  ]);

  useEffect(() => {
    if (!templateDetailId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigateTemplateDetails("prev");
      if (event.key === "ArrowRight") navigateTemplateDetails("next");
      if (event.key === "Escape") closeTemplateDetails();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [templateDetailId, templateFilteredSorted]);

  useEffect(() => {
    setTemplateDuplicatesOpen(false);
  }, [templateDetailId]);

  useEffect(() => {
    let cancelled = false;

    const buildLineage = async () => {
      if (!templateDetail) {
        setTemplateLineage([]);
        return;
      }

      setTemplateLineageLoading(true);
      const chain: Workout[] = [templateDetail];
      const visited = new Set<string>([templateDetail.id]);
      let cursor: Workout | null = templateDetail;

      while (cursor?.sourceTemplateId) {
        const parentId = cursor.sourceTemplateId;
        if (!parentId || visited.has(parentId)) break;
        visited.add(parentId);

        const parent =
          templates.find((entry) => entry.id === parentId) ||
          (await fetchTemplateById(parentId, { silent: true }));
        if (!parent) break;
        chain.unshift(parent);
        cursor = parent;

        if (chain.length >= 12) break;
      }

      if (!cancelled) {
        setTemplateLineage(chain);
        setTemplateLineageLoading(false);
      }
    };

    buildLineage();

    return () => {
      cancelled = true;
    };
  }, [templateDetail, templates, fetchTemplateById]);

  const templateRootId = useMemo(
    () =>
      templateDetail
        ? templateDetail.sourceTemplateRootId || templateDetail.id
        : null,
    [templateDetail]
  );

  const templateRootDuplicates = useMemo(() => {
    if (!templateRootId) return [];
    return templates.filter(
      (entry) => (entry.sourceTemplateRootId || entry.id) === templateRootId
    );
  }, [templates, templateRootId]);

  const templateBrowseLabels = useMemo(
    () => ({
      title: t("training.templateTitle", "Titel"),
      owner: t("training.templateOwner", "Ersteller"),
      visibility: t("training.templateVisibility", "Sichtbarkeit"),
      category: t("exerciseLibrary.category", "Kategorie"),
      discipline: t("exerciseLibrary.discipline", "Disziplin"),
      difficulty: t("exerciseLibrary.difficulty", "Schwierigkeit"),
      muscleGroups: t("exerciseLibrary.muscleGroups", "Muskelgruppen"),
      usageCount: t("training.templateUsageCount", "Nutzungen"),
      activities: t("training.templateActivities", "Aktivitäten"),
      sourceTemplateCredit: t("training.templateOriginalBy", "Original von"),
      duplicateOf: t("training.templateDuplicateOf", "Duplikat von"),
    }),
    [t]
  );

  const handleRecoveryDialogConfirm = () => {
    setShowRecoveryDialog(false);
    // Wechsle zum Erholungstagebuch-Tab
    setActiveTab("recovery");
  };

  // Initiales Tab aus Query-Param übernehmen (z.B. ?tab=recovery)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "recovery") {
      setActiveTab("recovery");
    }
  }, [searchParams]);

  const handleRecoveryDialogCancel = () => {
    setShowRecoveryDialog(false);
    setCreatedWorkoutId(undefined);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setOffset(0);
    setCurrentPage(1);
    if (value !== "custom") {
      setCustomRange(undefined);
    }
  };

  const handleRangeChange = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range?.from && range?.to) {
      setPeriod("custom");
      setCurrentPage(1);
    }
  };

  const handleOffsetChange = (newOffset: number) => {
    setOffset(newOffset);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    loadWorkouts(page, filterType);
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm(t("training.deleteConfirm"))) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t("training.deleteError"));
      }

      toast({
        title: t("training.workoutDeleted"),
        description: t("training.workoutDeletedSuccess"),
      });

      loadWorkouts(currentPage, filterType);
      loadRecentWorkouts();
    } catch (error) {
      console.error("Delete workout error:", error);
      toast({
        title: t("common.error"),
        description: t("training.deleteWorkoutError"),
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (workout: Workout) => {
    setEditingWorkout(workout);
    setActiveTab("trainings");
    requestAnimationFrame(() => {
      workoutFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleWorkoutUpdated = () => {
    setEditingWorkout(null);
    loadWorkouts(currentPage, filterType);
    loadRecentWorkouts();
    loadTemplates();
  };

  const handleCancelEdit = () => setEditingWorkout(null);

  // Prüfe ob Workout bearbeitbar ist (jünger als 7 Tage)
  const isWorkoutEditable = (workout: Workout) => {
    if (!workout.startTimeTimestamp) return false;

    const workoutDateTime = new Date(workout.startTimeTimestamp);
    if (isNaN(workoutDateTime.getTime())) return false;

    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - workoutDateTime.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diffInDays <= 7;
  };

  const getExerciseIcon = (exerciseType: string) => {
    switch (exerciseType) {
      case "pullups":
        return "💪";
      case "pushups":
        return "🔥";
      case "situps":
        return "🚀";
      case "running":
        return "🏃";
      case "cycling":
        return "🚴";
      default:
        return "💪";
    }
  };

  const getExerciseColor = (exerciseType: string) => {
    switch (exerciseType) {
      case "pullups":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pushups":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "situps":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cycling":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getExerciseName = (exerciseType: string) => {
    const exercise = exerciseTypes.find((ex) => ex.id === exerciseType);
    return exercise?.name || exerciseType;
  };

  const getActivityName = (activityType: string) => {
    const exercise = exerciseTypes.find((ex) => ex.id === activityType);
    if (exercise?.name) return exercise.name;
    const translationKey = `activityFeed.activityTypes.${activityType.toLowerCase()}`;
    const translation = t(translationKey);
    return translation !== translationKey
      ? translation
      : t("activityFeed.activityTypes.unknown");
  };

  const translateUnit = (unit: string) => {
    // Normalisiere die Unit für den Vergleich
    const normalizedUnit = unit.toLowerCase();

    // Prüfe auf bekannte Units und übersetze sie
    if (normalizedUnit === "wiederholungen" || normalizedUnit === "repetitions") {
      return t("training.form.units.repetitions");
    }
    if (normalizedUnit === "km" || normalizedUnit === "kilometer" || normalizedUnit === "kilometers") {
      return t("training.form.units.kilometers");
    }
    if (normalizedUnit === "m" || normalizedUnit === "meter" || normalizedUnit === "meters") {
      return t("training.form.units.meters");
    }
    if (normalizedUnit === "meilen" || normalizedUnit === "miles" || normalizedUnit === "mi") {
      return t("training.form.units.miles");
    }

    // Fallback: Unit unverändert zurückgeben
    return unit;
  };

  const formatActivityAmount = (amount: number, unit: string) => {
    const normalized = unit.toLowerCase();
    if (normalized === "km" || normalized === "m" || normalized === "miles" || normalized === "meilen") {
      const converted = convertDistance(amount, unit, distanceUnit);
      return `${converted} ${translateUnit(distanceUnit)}`;
    }
    return `${amount} ${translateUnit(unit)}`;
  };

  const formatWorkoutDateTime = (workout: Workout) => {
    if (!workout.startTimeTimestamp) {
      return t("training.unknownDate");
    }

    try {
      const dateToFormat = new Date(workout.startTimeTimestamp);
      if (isNaN(dateToFormat.getTime())) {
        return t("training.unknownDate");
      }

      const locale = user?.languagePreference === "en" ? "en-US" : "de-DE";
      const timeFormat = user?.preferences?.timeFormat || "24h";

      return dateToFormat.toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: timeFormat === "12h",
      });
    } catch (error) {
      console.error("Date formatting error:", error, "Input:", workout);
      return t("training.unknownDate");
    }
  };

  const getSourceTemplateCredit = (workout: Workout) => {
    if (!workout.sourceTemplateRootOwnerDisplayName) {
      return null;
    }
    if (
      workout.sourceTemplateRootOwnerId &&
      user?.id &&
      workout.sourceTemplateRootOwnerId === user.id
    ) {
      return null;
    }
    return t("training.templateOriginalByName", {
      name: workout.sourceTemplateRootOwnerDisplayName,
      defaultValue: "Original von {{name}}",
    });
  };

  const getTemplateSourceCredit = (template: Workout) => {
    if (!template.sourceTemplateRootOwnerDisplayName) {
      return null;
    }
    if (
      template.sourceTemplateRootOwnerId &&
      template.owner?.id &&
      template.sourceTemplateRootOwnerId === template.owner.id
    ) {
      return null;
    }
    return t("training.templateOriginalByName", {
      name: template.sourceTemplateRootOwnerDisplayName,
      defaultValue: "Original von {{name}}",
    });
  };

  const getTemplateDuplicateLabel = (template: Workout) => {
    if (!template.sourceTemplateId) {
      return null;
    }
    const sourceName =
      template.sourceTemplateTitle ||
      template.sourceTemplateOwnerDisplayName ||
      t("training.templates", "Workout Vorlage");
    return t("training.templateDuplicateOfTitle", {
      title: sourceName,
      defaultValue: "Duplikat von {{title}}",
    });
  };

  const getTemplateParentName = (template: Workout) =>
    template.sourceTemplateId
      ? template.sourceTemplateTitle ||
        template.sourceTemplateOwnerDisplayName ||
        t("training.templates", "Workout Vorlage")
      : null;

  const getTemplateRootName = (template: Workout) =>
    template.sourceTemplateRootId
      ? template.sourceTemplateRootTitle ||
        template.sourceTemplateRootOwnerDisplayName ||
        t("training.templates", "Workout Vorlage")
      : null;

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return t("training.duration.hours", { hours, minutes: remainingMinutes });
    }
    return t("training.duration.minutes", { minutes });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">{t("training.mustBeLoggedIn")}</p>
      </div>
    );
  }

  return (
    <PageTemplate
      title={t("training.title", "Training")}
      subtitle={t(
        "training.subtitle",
        "Trage deine Workouts ein und verfolge deinen Fortschritt"
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="trainings">
            {t("training.trainingsDiary")}
          </TabsTrigger>
          <TabsTrigger value="workouts">
            {t("training.yourWorkouts", "Vergangene Workouts")}
          </TabsTrigger>
          <TabsTrigger value="templates">
            {t("training.templates", "Vorlagen")}
          </TabsTrigger>
          <TabsTrigger value="recovery">
            {t("training.recoveryDiary")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="space-y-4 md:space-y-6">
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">
                  {t("training.newWorkout", "Neues Workout")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("training.newWorkoutHint", "Füge dein Training hinzu oder nutze eine Vorlage.")}
                </p>
              </div>
              <Popover open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {t("training.useTemplate", "Vorlage nutzen")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="end">
                  <Command>
                    <div className="flex items-center gap-2 px-3 py-2 border-b">
                      <CommandInput
                        placeholder={t("training.searchTemplates", "Vorlagen durchsuchen")}
                        value={templatePickerQuery}
                        onValueChange={setTemplatePickerQuery}
                      />
                    </div>
                    <CommandList className="max-h-[260px] overflow-y-auto">
                      <CommandEmpty>
                        {t("training.noTemplates", "Keine Vorlagen gefunden.")}
                      </CommandEmpty>
                      <CommandGroup>
                        {templatePickerOptions.map((template) => (
                          <CommandItem
                            key={template.id}
                            value={template.id}
                            onSelect={() => {
                              handleUseTemplate(template);
                              setTemplatePickerOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium flex items-center gap-2">
                                {favoriteTemplateIds.includes(template.id) && (
                                  <Star className="h-3.5 w-3.5 text-yellow-500" />
                                )}
                                {template.title}
                              </span>
                              {template.owner?.displayName && (
                                <span className="text-xs text-muted-foreground">
                                  {template.owner.displayName}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                    <div className="border-t px-3 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => {
                          setTemplatePickerOpen(false);
                          setActiveTab("templates");
                        }}
                      >
                        {t("training.templatesBrowse", "Vorlagen durchsuchen")}
                      </Button>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div ref={workoutFormRef}>
              <WorkoutForm
                workout={editingWorkout ?? undefined}
                prefillWorkout={prefillWorkout}
                onPrefillConsumed={() => setPrefillWorkout(null)}
                onWorkoutCreated={handleWorkoutCreated}
                onWorkoutUpdated={handleWorkoutUpdated}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg md:text-xl">
                      {t("training.recentWorkouts", "Letzte Trainings")}
                    </CardTitle>
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            title={t("training.editWindowInfo")}
                          >
                            <Info className="h-4 w-4" />
                            <span className="sr-only">
                              {t("training.editWindowInfo")}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="start" className="max-w-xs text-sm">
                          {t("training.editWindowInfo")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab("workouts")}>
                    {t("training.viewAllWorkouts", "Alle anzeigen")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : recentWorkouts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      {t("training.noWorkouts")}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t("training.createFirstWorkout", {
                        location:
                          window.innerWidth >= 1280
                            ? t("training.location.left")
                            : t("training.location.above"),
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground text-sm md:text-base truncate">
                                {workout.title}
                              </h3>
                              {workout.duration && (
                                <Badge variant="outline" className="text-xs">
                                  ⏱️ {formatDuration(workout.duration)}
                                </Badge>
                              )}
                            </div>

                            {workout.description && (
                              <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                                {workout.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1 mb-2">
                              {workout.activities.map((activity) => {
                                // Formatiere Sets für Anzeige: z.B. "3x10, 3x8, 3x12"
                                const formatSets = (
                                  sets: Array<{ reps: number; weight?: number }>
                                ) => {
                                  if (!sets || sets.length === 0) return null;
                                  return sets
                                    .map((set) => {
                                      const reps = set.reps || 0;
                                      const weight = set.weight;
                                      if (weight) {
                                        const displayWeight = convertWeightFromKg(weight, weightUnit);
                                        return `${reps}x${displayWeight}${weightUnit}`;
                                      }
                                      return `${reps}`;
                                    })
                                    .join(", ");
                                };

                                const setsDisplay =
                                  activity.sets && activity.sets.length > 0
                                    ? formatSets(activity.sets)
                                    : null;

                                return (
                                  <div
                                    key={activity.id}
                                    className="flex flex-col gap-1"
                                  >
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <Badge
                                        className={`text-xs ${getExerciseColor(activity.activityType)}`}
                                        variant="secondary"
                                      >
                                        {getExerciseIcon(activity.activityType)}{" "}
                                        {getActivityName(activity.activityType)}:{" "}
                                        {formatActivityAmount(activity.amount, activity.unit)}
                                      </Badge>
                                      {setsDisplay && (
                                        <span className="text-xs text-muted-foreground">
                                          ({setsDisplay})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>📅 {formatWorkoutDateTime(workout)}</span>
                            </div>
                            {getSourceTemplateCredit(workout) && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                ⭐{" "}
                                <button
                                  type="button"
                                  className="underline underline-offset-2 hover:text-foreground"
                                  onClick={() => openSourceTemplate(workout.sourceTemplateId)}
                                >
                                  {getSourceTemplateCredit(workout)}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {isWorkoutEditable(workout) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(workout)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                                  aria-label={t("training.edit")}
                                >
                                  <span className="hidden sm:inline">
                                    {t("training.edit")}
                                  </span>
                                  <span className="sm:hidden" aria-hidden="true">✏️</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteWorkout(workout.id)}
                                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-shrink-0"
                                  aria-label={t("training.delete")}
                                >
                                  <span className="hidden sm:inline">
                                    {t("training.delete")}
                                  </span>
                                  <span className="sm:hidden" aria-hidden="true">×</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="pb-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg md:text-xl">
                    {t("training.yourWorkouts")}
                  </CardTitle>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 text-muted-foreground"
                          title={t("training.editWindowInfo")}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">
                            {t("training.editWindowInfo")}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="start" className="max-w-xs text-sm">
                        {t("training.editWindowInfo")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={filterType} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <TimeRangeFilter
                  period={period}
                  range={customRange}
                  offset={offset}
                  onPeriodChange={handlePeriodChange}
                  onRangeChange={handleRangeChange}
                  onOffsetChange={handleOffsetChange}
                  t={t}
                  locale={user?.languagePreference || "de"}
                  formatDate={(date) =>
                    date.toLocaleDateString(
                      user?.languagePreference === "en" ? "en-US" : "de-DE"
                    )
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : workouts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    {filterType === "all"
                      ? t("training.noWorkouts")
                      : t("training.noWorkoutsForType", {
                        type: getExerciseName(filterType),
                      })}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {t("training.createFirstWorkout", {
                      location:
                        window.innerWidth >= 1280
                          ? t("training.location.left")
                          : t("training.location.above"),
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground text-sm md:text-base truncate">
                              {workout.title}
                            </h3>
                            {workout.duration && (
                              <Badge variant="outline" className="text-xs">
                                ⏱️ {formatDuration(workout.duration)}
                              </Badge>
                            )}
                          </div>

                          {workout.description && (
                            <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                              {workout.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1 mb-2">
                            {workout.activities.map((activity) => {
                              const formatSets = (
                                sets: Array<{ reps: number; weight?: number }>
                              ) => {
                                if (!sets || sets.length === 0) return null;
                                return sets
                                  .map((set) => {
                                    const reps = set.reps || 0;
                                    const weight = set.weight;
                                    if (weight) {
                                      const displayWeight = convertWeightFromKg(weight, weightUnit);
                                      return `${reps}x${displayWeight}${weightUnit}`;
                                    }
                                    return `${reps}`;
                                  })
                                  .join(", ");
                              };

                              const setsDisplay =
                                activity.sets && activity.sets.length > 0
                                  ? formatSets(activity.sets)
                                  : null;

                              return (
                                <div
                                  key={activity.id}
                                  className="flex flex-col gap-1"
                                >
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <Badge
                                      className={`text-xs ${getExerciseColor(activity.activityType)}`}
                                      variant="secondary"
                                    >
                                      {getExerciseIcon(activity.activityType)}{" "}
                                      {getActivityName(activity.activityType)}:{" "}
                                      {formatActivityAmount(activity.amount, activity.unit)}
                                    </Badge>
                                    {setsDisplay && (
                                      <span className="text-xs text-muted-foreground">
                                        ({setsDisplay})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>📅 {formatWorkoutDateTime(workout)}</span>
                          </div>
                          {getSourceTemplateCredit(workout) && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              ⭐{" "}
                              <button
                                type="button"
                                className="underline underline-offset-2 hover:text-foreground"
                                onClick={() => openSourceTemplate(workout.sourceTemplateId)}
                              >
                                {getSourceTemplateCredit(workout)}
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {isWorkoutEditable(workout) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(workout)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                                aria-label={t("training.edit")}
                              >
                                <span className="hidden sm:inline">
                                  {t("training.edit")}
                                </span>
                                <span className="sm:hidden" aria-hidden="true">✏️</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteWorkout(workout.id)}
                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-shrink-0"
                                aria-label={t("training.delete")}
                              >
                                <span className="hidden sm:inline">
                                  {t("training.delete")}
                                </span>
                                <span className="sm:hidden" aria-hidden="true">×</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {pagination.totalPages > 1 && (
                    <PaginationControls
                      pagination={pagination}
                      onPageChange={handlePageChange}
                      pageSize={WORKOUTS_PER_PAGE}
                      disabled={isLoading}
                      labels={{
                        previous: t("filters.previous", t("training.previous")),
                        next: t("filters.next", t("training.next")),
                        page: (current, total) =>
                          t("filters.pageLabel", { current, total }),
                        summary: (start, end, total) =>
                          t("filters.itemSummary", {
                            start,
                            end,
                            total: total ?? end,
                          }),
                      }}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6 mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {t("training.templates", "Workout Vorlagen")}
            </h2>
            <Button onClick={() => openTemplateCreate(null)}>
              {t("training.createTemplate", "Vorlage erstellen")}
            </Button>
          </div>

          <ExerciseBrowsePanel
            title={t("training.templatesBrowse", "Vorlagen durchsuchen")}
            query={templateSearch}
            onQueryChange={setTemplateSearch}
            viewMode={templateViewMode}
            onViewModeChange={setTemplateViewMode}
            filtersOpen={templateFiltersOpen}
            onToggleFilters={() => setTemplateFiltersOpen((open) => !open)}
            sortBy={templateSortBy}
            sortDirection={templateSortDirection}
            onSortByChange={setTemplateSortBy}
            onSortDirectionToggle={() =>
              setTemplateSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            sortOptions={templateSortOptions}
            filtersPanel={
              <TemplateFiltersPanel
                sourceFilter={templateSourceFilter}
                onSourceFilterChange={setTemplateSourceFilter}
                categoryOptions={templateCategoryOptions}
                categoryFilter={templateCategoryFilter}
                onCategoryFilterChange={setTemplateCategoryFilter}
                disciplineOptions={templateDisciplineOptions}
                disciplineFilter={templateDisciplineFilter}
                onDisciplineFilterChange={setTemplateDisciplineFilter}
                movementPatternOptions={templateMovementPatternOptions}
                movementPatternFilter={templateMovementPatternFilter}
                onMovementPatternFilterChange={setTemplateMovementPatternFilter}
                muscleFilters={templateMuscleFilters}
                onMuscleFiltersChange={setTemplateMuscleFilters}
                muscleGroups={muscleGroupTree}
                difficultyRange={templateDifficultyRange}
                onDifficultyRangeChange={setTemplateDifficultyRange}
                onReset={() => {
                  setTemplateSearch("");
                  setTemplateSourceFilter("all");
                  setTemplateCategoryFilter("all");
                  setTemplateDisciplineFilter("all");
                  setTemplateMovementPatternFilter("all");
                  setTemplateMuscleFilters([]);
                  setTemplateDifficultyRange([1, 10]);
                }}
              />
            }
            loading={false}
            empty={templateFilteredSorted.length === 0}
            emptyText={t("training.noTemplates", "Keine Vorlagen gefunden.")}
            loadingText={t("common.loading", "Lade...")}
            grid={
              <TemplateBrowseGrid
                items={templateBrowseItems}
                onSelect={(item) => {
                  const template = templates.find((entry) => entry.id === item.id);
                  if (template) openTemplateDetails(template, "view");
                }}
                onToggleFavorite={handleToggleFavoriteTemplate}
                onSourceTemplateClick={(item) => openSourceTemplate(item.sourceTemplateId)}
                onRootTemplateClick={(item) =>
                  openSourceTemplate(item.sourceTemplateRootId)
                }
                renderMenuItems={(item) => {
                  const template = templates.find((entry) => entry.id === item.id);
                  if (!template) return null;
                  return (
                    <>
                      <DropdownMenuItem onSelect={() => openTemplateDetails(template, "view")}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("exerciseLibrary.details", "Details anzeigen")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleUseTemplate(template)}>
                        <Play className="mr-2 h-4 w-4" />
                        {t("training.useTemplate", "Vorlage nutzen")}
                      </DropdownMenuItem>
                      {template.owner?.id === user?.id && (
                        <DropdownMenuItem onSelect={() => openTemplateDetails(template, "edit")}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("training.editTemplate", "Vorlage bearbeiten")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => handleDuplicateTemplate(template)}>
                        <Copy className="mr-2 h-4 w-4" />
                        {t("training.duplicateTemplate", "Duplizieren")}
                      </DropdownMenuItem>
                      {template.owner?.id === user?.id && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleTemplateDelete(template)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("training.deleteTemplate", "Vorlage löschen")}
                        </DropdownMenuItem>
                      )}
                    </>
                  );
                }}
                labels={templateBrowseLabels}
              />
            }
            table={
              <TemplateBrowseTable
                items={templateBrowseItems}
                sortBy={templateSortBy}
                sortDirection={templateSortDirection}
                onSortClick={handleTemplateSortClick}
                onSelect={(item) => {
                  const template = templates.find((entry) => entry.id === item.id);
                  if (template) openTemplateDetails(template, "view");
                }}
                onToggleFavorite={handleToggleFavoriteTemplate}
                onSourceTemplateClick={(item) => openSourceTemplate(item.sourceTemplateId)}
                onRootTemplateClick={(item) =>
                  openSourceTemplate(item.sourceTemplateRootId)
                }
                renderMenuItems={(item) => {
                  const template = templates.find((entry) => entry.id === item.id);
                  if (!template) return null;
                  return (
                    <>
                      <DropdownMenuItem onSelect={() => openTemplateDetails(template, "view")}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("exerciseLibrary.details", "Details anzeigen")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleUseTemplate(template)}>
                        <Play className="mr-2 h-4 w-4" />
                        {t("training.useTemplate", "Vorlage nutzen")}
                      </DropdownMenuItem>
                      {template.owner?.id === user?.id && (
                        <DropdownMenuItem onSelect={() => openTemplateDetails(template, "edit")}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("training.editTemplate", "Vorlage bearbeiten")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => handleDuplicateTemplate(template)}>
                        <Copy className="mr-2 h-4 w-4" />
                        {t("training.duplicateTemplate", "Duplizieren")}
                      </DropdownMenuItem>
                      {template.owner?.id === user?.id && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleTemplateDelete(template)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("training.deleteTemplate", "Vorlage löschen")}
                        </DropdownMenuItem>
                      )}
                    </>
                  );
                }}
                labels={templateBrowseLabels}
              />
            }
            footer={
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-muted-foreground">
                    {t("training.templatesFound", {
                      count: templateFilteredSorted.length,
                      defaultValue: `${templateFilteredSorted.length} Vorlagen gefunden`,
                    })}
                  </div>
                  <PageSizeSelector
                    pageSize={templatePageSize}
                    onPageSizeChange={setTemplatePageSize}
                    label={t("filters.itemsPerPage", "Pro Seite:")}
                    options={[6, 12, 24, 48]}
                  />
                </div>
                {templatePaginationMeta.totalPages > 1 && (
                  <PaginationControls
                    pagination={templatePaginationMeta}
                    onPageChange={setTemplateCurrentPage}
                    pageSize={templatePageSize}
                    maxVisiblePages={7}
                    labels={{
                      previous: t("filters.previous", "Zurück"),
                      next: t("filters.next", "Weiter"),
                      page: (current, total) =>
                        t("filters.pageLabel", { current, total }),
                      summary: (start, end, total) =>
                        t("filters.itemSummary", {
                          start,
                          end,
                          total: total ?? end,
                        }),
                    }}
                  />
                )}
              </div>
            }
          />

          <Dialog
            open={templateCreateOpen}
            onOpenChange={(open) => {
              setTemplateCreateOpen(open);
              if (!open) {
                setTemplateCreatePrefill(null);
                setTemplateCreateMode("create");
              }
            }}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {templateCreateMode === "duplicate"
                    ? t("training.duplicateTemplate", "Vorlage duplizieren")
                    : t("training.createTemplate", "Vorlage erstellen")}
                </DialogTitle>
                <DialogDescription>
                  {templateCreateMode === "duplicate" && templateCreatePrefill
                    ? templateCreatePrefill.owner?.id === user?.id
                      ? t("training.templateDuplicateHintOwn", {
                          source: templateCreatePrefill.title,
                          defaultValue:
                            "Dupliziere '{{source}}'. Du kannst danach alles anpassen.",
                        })
                      : t("training.templateDuplicateHint", {
                          source: templateCreatePrefill.title,
                          owner: getTemplateOwnerName(templateCreatePrefill),
                          defaultValue:
                            "Dupliziere '{{source}}' von {{owner}}. Du kannst danach alles anpassen.",
                        })
                    : t(
                        "training.templateCreateHint",
                        "Du kannst Vorlagen später in der Übersicht bearbeiten."
                      )}
                </DialogDescription>
              </DialogHeader>
              <WorkoutForm
                defaultIsTemplate
                forceTemplate
                hideTemplateToggle
                prefillWorkout={templateCreatePrefill}
                onPrefillConsumed={() => setTemplateCreatePrefill(null)}
                onWorkoutCreated={handleTemplateCreated}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={Boolean(templateDetailId)} onOpenChange={(open) => (open ? null : closeTemplateDetails())}>
            <DialogContent className="max-w-4xl overflow-y-auto max-h-[85vh]">
              <DialogHeader className="pr-10">
                <DialogDescription className="sr-only">
                  {t(
                    "training.templateDetailsDescription",
                    "Details und Aktionen fuer die ausgewaehlte Workout-Vorlage."
                  )}
                </DialogDescription>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl">
                      {templateDetail?.title || t("training.templates", "Workout Vorlage")}
                    </DialogTitle>
                    {templateDetail && templateDetailMode === "view" && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-muted-foreground">
                          {getTemplateOwnerName(templateDetail)}
                        </span>
                        {getTemplateParentName(templateDetail) ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100">
                            <Copy className="h-3 w-3" />
                            <span className="text-[11px] font-medium">
                              {t("training.templateDuplicateOfShort", "Duplikat von")}
                            </span>
                            <button
                              type="button"
                              className="text-[11px] font-semibold hover:underline"
                              onClick={() =>
                                openSourceTemplate(templateDetail.sourceTemplateId)
                              }
                            >
                              {getTemplateParentName(templateDetail)}
                            </button>
                          </span>
                        ) : null}
                        {getTemplateRootName(templateDetail) &&
                        getTemplateSourceCredit(templateDetail) ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100">
                            <Info className="h-3 w-3" />
                            <span className="text-[11px] font-medium">
                              {t("training.templateOriginalShort", "Original von")}
                            </span>
                            <button
                              type="button"
                              className="text-[11px] font-semibold hover:underline"
                              onClick={() =>
                                openSourceTemplate(
                                  templateDetail.sourceTemplateRootId ??
                                    templateDetail.sourceTemplateId
                                )
                              }
                            >
                              {getTemplateRootName(templateDetail)}
                            </button>
                          </span>
                        ) : null}
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-muted-foreground">
                          {getVisibilityLabel(templateDetail.visibility)}
                        </span>
                        {templateDetail.difficulty ? (
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-muted-foreground">
                            {t("exerciseLibrary.difficulty", "Schwierigkeit")}:{" "}
                            {templateDetail.difficulty}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateTemplateDetails("prev")}>
                      <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateTemplateDetails("next")}>
                      <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {templateDetail && (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={templateDetailMode === "view" ? "default" : "outline"}
                      onClick={() => setTemplateDetailMode("view")}
                    >
                      {t("exerciseLibrary.details", "Details anzeigen")}
                    </Button>
                    <Button variant="outline" onClick={() => handleUseTemplate(templateDetail)}>
                      {t("training.useTemplate", "Vorlage nutzen")}
                    </Button>
                    {templateDetail.owner?.id === user?.id && (
                      <Button
                        variant={templateDetailMode === "edit" ? "default" : "outline"}
                        onClick={() => setTemplateDetailMode("edit")}
                      >
                        {t("training.editTemplate", "Vorlage bearbeiten")}
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => handleDuplicateTemplate(templateDetail)}>
                      {t("training.duplicateTemplate", "Duplizieren")}
                    </Button>
                    {templateDetail.owner?.id === user?.id && (
                      <Button
                        variant="destructive"
                        onClick={() => handleTemplateDelete(templateDetail)}
                      >
                        {t("training.deleteTemplate", "Vorlage löschen")}
                      </Button>
                    )}
                  </div>

                  {templateDetailMode === "view" && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 rounded-lg border p-4">
                          <div className="text-xs font-medium text-muted-foreground">
                            {t("exerciseLibrary.details", "Details")}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>
                              <strong>{t("exerciseLibrary.category", "Kategorie")}:</strong>{" "}
                              {templateDetail.category || "-"}
                            </div>
                            <div>
                              <strong>{t("exerciseLibrary.discipline", "Disziplin")}:</strong>{" "}
                              {templateDetail.discipline || "-"}
                            </div>
                            <div>
                              <strong>{t("exerciseLibrary.movementPattern", "Bewegungsmuster")}:</strong>{" "}
                              {(templateDetail.movementPatterns && templateDetail.movementPatterns.length > 0
                                ? templateDetail.movementPatterns
                                : templateDetail.movementPattern
                                  ? [templateDetail.movementPattern]
                                  : []
                              )
                                .map((pattern) => getExerciseMovementPatternLabel(pattern, t))
                                .join(", ") || "-"}
                            </div>
                            {templateDetail.sourceTemplateRootId && (
                              <div>
                                <strong>{t("training.templateOriginal", "Original")}:</strong>{" "}
                                <button
                                  type="button"
                                  className="underline underline-offset-2 hover:text-foreground"
                                  onClick={() =>
                                    openSourceTemplate(templateDetail.sourceTemplateRootId)
                                  }
                                >
                                  {templateDetail.sourceTemplateRootTitle ||
                                    templateDetail.sourceTemplateRootOwnerDisplayName ||
                                    getTemplateOwnerName(templateDetail)}
                                </button>
                              </div>
                            )}
                            <div>
                              <strong>{t("training.templateUsageCount", "Nutzungen")}:</strong>{" "}
                              {templateDetail.usageCount || 0}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 rounded-lg border p-4">
                          <div className="text-xs font-medium text-muted-foreground">
                            {t("exerciseLibrary.muscleGroups", "Muskelgruppen")}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(templateDetail.muscleGroups || []).length > 0
                              ? templateDetail.muscleGroups?.map((group) => (
                                <Badge key={group} variant="secondary">
                                  {getExerciseMuscleGroupLabel(group, t)}
                                </Badge>
                              ))
                              : <span className="text-sm text-muted-foreground">-</span>}
                          </div>
                        </div>
                      </div>

                      {templateDetail.description && (
                        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                          {templateDetail.description}
                        </div>
                      )}

                      <div className="rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          {t("training.templateActivities", "Aktivitäten")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(templateDetail.activities || []).map((activity) => (
                            <Badge key={activity.id} variant="outline">
                              {getActivityName(activity.activityType)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {templateRootDuplicates.length > 1 && (
                        <Collapsible
                          open={templateDuplicatesOpen}
                          onOpenChange={setTemplateDuplicatesOpen}
                        >
                          <div className="rounded-lg border">
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground"
                              >
                                {t("training.templateRootDuplicates", "Weitere Ableitungen")}
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    templateDuplicatesOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 flex flex-wrap items-center gap-2 text-sm">
                                {templateRootDuplicates
                                  .filter((entry) => entry.id !== templateDetail.id)
                                  .map((entry) => (
                                    <button
                                      key={entry.id}
                                      type="button"
                                      className="rounded-md border px-2 py-1 text-left hover:bg-muted"
                                      onClick={() => openTemplateDetails(entry, "view")}
                                    >
                                      <span className="font-medium">{entry.title}</span>
                                      <span className="ml-1 text-xs text-muted-foreground">
                                        ({getTemplateOwnerName(entry)})
                                      </span>
                                    </button>
                                  ))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}

                      {(templateLineageLoading || templateLineage.length > 1) && (
                        <div className="rounded-lg border p-4">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            {t("training.templateLineage", "Vorlagen-Kette")}
                          </div>
                          {templateLineageLoading ? (
                            <div className="text-sm text-muted-foreground">
                              {t("common.loading", "Lade...")}
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              {templateLineage.map((node, index) => (
                                <div key={`${node.id}-${index}`} className="inline-flex items-center gap-2">
                                  {index > 0 && <span className="text-muted-foreground">→</span>}
                                  <button
                                    type="button"
                                    className="rounded-md border px-2 py-1 text-left hover:bg-muted"
                                    onClick={() => openTemplateDetails(node, "view")}
                                  >
                                    <span className="font-medium">{node.title}</span>
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      ({getTemplateOwnerName(node)})
                                    </span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {templateDetailMode === "edit" && templateDetail.owner?.id === user?.id && (
                    <WorkoutForm
                      workout={templateDetail}
                      forceTemplate
                      hideTemplateToggle
                      onWorkoutUpdated={() => {
                        loadTemplates();
                        setTemplateDetailMode("view");
                      }}
                      onCancelEdit={() => setTemplateDetailMode("view")}
                    />
                  )}

                  {templateDetailMode === "edit" && templateDetail.owner?.id !== user?.id && (
                    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                      {t(
                        "training.templateEditForbidden",
                        "Diese Vorlage kannst du nicht direkt bearbeiten. Du kannst sie aber duplizieren."
                      )}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4 md:space-y-6">
          <TrainingDiarySection preselectedWorkoutId={createdWorkoutId} />
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={showRecoveryDialog}
        onOpenChange={setShowRecoveryDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("training.recoveryDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("training.recoveryDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRecoveryDialogCancel}>
              {t("training.recoveryDialog.noLater")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRecoveryDialogConfirm}>
              {t("training.recoveryDialog.yesDocument")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
