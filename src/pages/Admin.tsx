import { Fragment } from "react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { PageSizeSelector } from "@/components/common/pagination/PageSizeSelector";
import { PaginationControls, PaginationMeta } from "@/components/common/pagination/PaginationControls";
import { getExerciseBrowseLabels } from "@/components/exercises/exerciseBrowseLabels";
import { ExerciseBrowseGrid, ExerciseBrowseTable } from "@/components/exercises/ExerciseBrowseList";
import { ExerciseBrowsePanel } from "@/components/exercises/ExerciseBrowsePanel";
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
import {
  extractNormalizedExerciseUnits,
  normalizeExerciseUnit,
} from "@/components/exercises/unitNormalization";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useDateTimeFormatter } from "@/hooks/use-date-time-formatter";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { getPrimaryDistanceUnit } from "@/utils/units";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Ban,
  Check,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileJson,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Shield,
  Unlock,
  Upload,
  Users,
} from "lucide-react";
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const EXERCISE_IMPORT_COLUMNS = [
  "name",
  "description",
  "category",
  "discipline",
  "movementPattern",
  "measurementTypes",
  "distanceUnit",
  "timeUnit",
  "difficultyTier",
  "requiresWeight",
  "allowsWeight",
  "supportsSets",
  "muscleGroups",
  "equipment",
  "aliases",
];

const parseCsvText = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  const pushCell = () => {
    row.push(current);
    current = "";
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      pushCell();
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      pushCell();
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }
    current += char;
  }
  if (current.length > 0 || row.length > 0) {
    pushCell();
    if (row.some((value) => value.trim().length > 0)) {
      rows.push(row);
    }
  }
  return rows;
};

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  isEmailVerified: boolean;
  has2FA: boolean;
  role: "user" | "admin";
  isBlocked: boolean;
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
  aliases?: string[];
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
  details?: string;
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

interface ImportPreviewDiff {
  incoming: unknown;
  existing: unknown;
  changed: boolean;
  incomingEmpty: boolean;
}

interface ImportPreviewItem {
  key: string;
  status: "new" | "update" | "invalid";
  name?: string;
  slug?: string;
  incoming: Record<string, unknown> | null;
  existing: Record<string, unknown> | null;
  diffs: Record<string, ImportPreviewDiff>;
  reason?: string;
}

interface ImportPreviewResult {
  items: ImportPreviewItem[];
  summary: {
    total: number;
    new: number;
    update: number;
    invalid: number;
  };
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

interface MonitoringJobStat {
  job_name: string;
  status: string;
  count: number | string;
  last_run: string | null;
  failed_count?: number | string;
  running_count?: number | string;
  completed_count?: number | string;
}

interface MonitoringJobFailure {
  job_name: string;
  count: number | string;
}

interface MonitoringJobEntry {
  id: string;
  job_name: string;
  scheduled_for?: string | null;
  started_at?: string | null;
}

interface MonitoringEmailStat {
  status: string;
  count: number | string;
  failed_after_retries?: number | string;
}

interface MonitoringEmailEntry {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  attempts: number;
  error?: string | null;
  createdAt?: string | null;
  processedAt?: string | null;
}

interface MonitoringData {
  jobs: {
    stats: MonitoringJobStat[];
    stuckJobs: MonitoringJobEntry[];
    recentFailures: MonitoringJobFailure[];
  };
  emails: {
    stats: MonitoringEmailStat[];
    recent: MonitoringEmailEntry[];
  };
}

export function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { formatDateTime } = useDateTimeFormatter();
  const primaryDistanceUnit = getPrimaryDistanceUnit(user?.preferences?.units?.distance);
  const distanceUnitOptions =
    primaryDistanceUnit === "miles"
      ? [
        { value: "miles", label: t("training.form.units.miles", "Meilen") },
        { value: "yards", label: t("training.form.units.yards", "Yards") },
      ]
      : [
        { value: "km", label: t("training.form.units.kilometers", "Kilometer") },
        { value: "m", label: t("training.form.units.meters", "Meter") },
      ];

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseReports, setExerciseReports] = useState<ExerciseReport[]>([]);
  const [exerciseEditRequests, setExerciseEditRequests] = useState<ExerciseEditRequest[]>([]);
  const [overviewStats, setOverviewStats] = useState<AdminOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [exerciseManagementView, setExerciseManagementView] = useState<"grid" | "table">("table");
  const [pendingScroll, setPendingScroll] = useState<{
    tab: string;
    ref: RefObject<HTMLDivElement>;
  } | null>(null);
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
  const [exerciseImporting, setExerciseImporting] = useState(false);
  const [exerciseImportDialogOpen, setExerciseImportDialogOpen] = useState(false);
  const [exerciseImportMode, setExerciseImportMode] = useState<"auto" | "manual">("auto");
  const [exerciseImportScope, setExerciseImportScope] = useState<"all" | "conflicts">("all");
  const [exerciseImportShowNewInConflicts, setExerciseImportShowNewInConflicts] = useState(false);
  const [exerciseImportSearch, setExerciseImportSearch] = useState("");
  const [exerciseImportGroupByStatus, setExerciseImportGroupByStatus] = useState(false);
  const [exerciseImportCompactView, setExerciseImportCompactView] = useState(false);
  const [exerciseImportMergeShowAllFields, setExerciseImportMergeShowAllFields] = useState(false);
  const [exerciseImportReportEnabled, setExerciseImportReportEnabled] = useState(false);
  const [exerciseImportReportFormat, setExerciseImportReportFormat] = useState<"json" | "csv" | "both">("json");
  const [exerciseImportPreview, setExerciseImportPreview] = useState<ImportPreviewResult | null>(null);
  const [exerciseImportRaw, setExerciseImportRaw] = useState<
    Array<Record<string, unknown> & { _importKey?: string }>
  >([]);
  const [exerciseImportSelection, setExerciseImportSelection] = useState<Set<string>>(
    () => new Set()
  );
  const [exerciseImportDecisions, setExerciseImportDecisions] = useState<
    Record<string, Record<string, string>>
  >({});
  const [exerciseImportActiveKey, setExerciseImportActiveKey] = useState<string | null>(null);
  const [exerciseImportWizardOpen, setExerciseImportWizardOpen] = useState(false);
  const [exerciseImportWizardIndex, setExerciseImportWizardIndex] = useState(0);
  const [exerciseImportWizardItems, setExerciseImportWizardItems] = useState<ImportPreviewItem[]>(
    []
  );
  const [exerciseImportSkippedKeys, setExerciseImportSkippedKeys] = useState<Set<string>>(
    () => new Set()
  );
  const [mergeSectionOpen, setMergeSectionOpen] = useState(false);
  const [exerciseEditDialogOpen, setExerciseEditDialogOpen] = useState(false);
  const [exerciseEditTarget, setExerciseEditTarget] = useState<Exercise | null>(null);
  const [exerciseEditDraft, setExerciseEditDraft] = useState<ExerciseFormValue | null>(null);
  const [exerciseEditDescriptionOpen, setExerciseEditDescriptionOpen] = useState(false);
  const [exerciseEditSaving, setExerciseEditSaving] = useState(false);
  const [exerciseDialogMode, setExerciseDialogMode] = useState<"view" | "edit">("view");
  const [detailExerciseId, setDetailExerciseId] = useState<string | null>(null);
  const [exerciseManagementSelectedIds, setExerciseManagementSelectedIds] = useState<Set<string>>(
    () => new Set()
  );
  const mergeSectionRef = useRef<HTMLDivElement | null>(null);
  const usersSectionRef = useRef<HTMLDivElement | null>(null);
  const exerciseManagementTopRef = useRef<HTMLDivElement | null>(null);
  const moderationReportsRef = useRef<HTMLDivElement | null>(null);
  const moderationEditsRef = useRef<HTMLDivElement | null>(null);
  const monitoringJobsRef = useRef<HTMLDivElement | null>(null);
  const monitoringStuckRef = useRef<HTMLDivElement | null>(null);
  const monitoringFailuresRef = useRef<HTMLDivElement | null>(null);
  const monitoringEmailsRef = useRef<HTMLDivElement | null>(null);

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

  const handleMergeSectionOpen = () => {
    setMergeSectionOpen(true);
    requestAnimationFrame(() => {
      mergeSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExerciseExport = async (format: "csv" | "json" | "xlsx") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/admin/exercises/export?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(t("admin.errors.exportFailed", "Export fehlgeschlagen."));
      }
      const blob = await response.blob();
      downloadBlob(
        blob,
        format === "json"
          ? "exercise-import-template.json"
          : format === "xlsx"
            ? "exercise-import-template.xlsx"
            : "exercise-import-template.csv"
      );
    } catch (error) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.errors.exportFailed", "Export fehlgeschlagen."),
        variant: "destructive",
      });
    }
  };

  const handleExportSelectedExercises = async () => {
    const ids = Array.from(exerciseManagementSelectedIds);
    if (ids.length === 0) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/exercises/export-selected`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || t("admin.errors.exportFailed", "Export fehlgeschlagen."));
      }
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      downloadBlob(
        blob,
        `exercises-export-${new Date().toISOString().slice(0, 10)}.json`
      );
      toast({
        title: t("admin.exercises.exportSelected.success", "Export abgeschlossen"),
        description: t("admin.exercises.exportSelected.count", "{{count}} Übungen exportiert.", {
          count: data.meta?.exported ?? data.exercises?.length ?? ids.length,
        }),
      });
    } catch (error) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.errors.exportFailed", "Export fehlgeschlagen."),
        variant: "destructive",
      });
    }
  };

  const exerciseManagementToggleSelect = (id: string, selected: boolean) => {
    setExerciseManagementSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const exerciseManagementSelectAllOnPage = (selected: boolean) => {
    setExerciseManagementSelectedIds((prev) => {
      const next = new Set(prev);
      exerciseManagementPageItems.forEach((item) => {
        if (selected) next.add(item.id);
        else next.delete(item.id);
      });
      return next;
    });
  };

  const exerciseManagementClearSelection = () => {
    setExerciseManagementSelectedIds(new Set());
  };

  const resetExerciseImportDialog = () => {
    setExerciseImportDialogOpen(false);
    setExerciseImportPreview(null);
    setExerciseImportRaw([]);
    setExerciseImportSelection(new Set());
    setExerciseImportDecisions({});
    setExerciseImportActiveKey(null);
    setExerciseImportWizardOpen(false);
    setExerciseImportWizardItems([]);
    setExerciseImportWizardIndex(0);
    setExerciseImportSkippedKeys(new Set());
  };

  const requestExerciseImportPreview = async (file: File) => {
    setExerciseImporting(true);
    try {
      const token = localStorage.getItem("token");
      let previewData: { exercises: Array<Record<string, unknown>>; preview: ImportPreviewResult };
      const isXlsx = file.name.toLowerCase().endsWith(".xlsx");

      if (isXlsx) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${API_URL}/admin/exercises/import-preview-file`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || t("admin.errors.importFailed", "Import fehlgeschlagen.")
          );
        }
        previewData = await response.json();
      } else {
        const content = await file.text();
        let parsed: Array<Record<string, unknown>> = [];
        if (file.name.toLowerCase().endsWith(".json")) {
          const json = JSON.parse(content);
          parsed = Array.isArray(json)
            ? json
            : Array.isArray(json.exercises)
              ? json.exercises
              : Array.isArray(json.examples)
                ? json.examples
                : [];
        } else {
          const rows = parseCsvText(content);
          if (rows.length === 0) {
            throw new Error(t("admin.errors.importEmpty", "Keine Daten gefunden."));
          }
          const [header, ...dataRows] = rows;
          parsed = dataRows.map((row) => {
            const record: Record<string, unknown> = {};
            header.forEach((key, index) => {
              record[key] = row[index] ?? "";
            });
            return record;
          });
        }

        const response = await fetch(`${API_URL}/admin/exercises/import-preview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ exercises: parsed }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || t("admin.errors.importFailed", "Import fehlgeschlagen.")
          );
        }
        previewData = await response.json();
      }

      const rawExercises = previewData.exercises || [];
      const preview = previewData.preview;
      const keyed = rawExercises.map((item, index) => ({
        ...item,
        _importKey: preview.items[index]?.key ?? String(index),
      }));
      const selection = new Set(
        preview.items
          .filter((item) => item.status !== "invalid")
          .map((item) => item.key)
      );

      setExerciseImportRaw(keyed);
      setExerciseImportPreview(preview);
      setExerciseImportSelection(selection);
      setExerciseImportDialogOpen(true);
    } catch (error) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.errors.importFailed", "Import fehlgeschlagen."),
        variant: "destructive",
      });
    } finally {
      setExerciseImporting(false);
    }
  };

  const toggleExerciseImportSelection = (key: string, selected: boolean) => {
    setExerciseImportSelection((prev) => {
      const next = new Set(prev);
      if (selected) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const selectAllExerciseImport = (selected: boolean, keys: string[]) => {
    setExerciseImportSelection((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => {
        if (selected) next.add(key);
        else next.delete(key);
      });
      return next;
    });
  };

  const openExerciseImportMerge = (item: ImportPreviewItem) => {
    const key = item.key;
    setExerciseImportDecisions((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev };
      const decisions: Record<string, string> = {};
      Object.entries(item.diffs || {}).forEach(([field, diff]) => {
        decisions[field] = diff.incomingEmpty ? "keep" : "import";
      });
      next[key] = decisions;
      return next;
    });
    setExerciseImportActiveKey(key);
  };

  const updateExerciseImportDecision = (key: string, field: string, decision: "keep" | "import") => {
    setExerciseImportDecisions((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: decision,
      },
    }));
  };

  const handleExerciseImportConfirm = async (options?: {
    selectedKeys?: Set<string>;
  }) => {
    if (!exerciseImportPreview) return;
    const selectedKeys = options?.selectedKeys ?? new Set(exerciseImportSelection);
    const selectedExercises = exerciseImportRaw.filter((item) =>
      selectedKeys.has(String(item._importKey))
    );
    if (selectedExercises.length === 0) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description: t("admin.errors.importEmpty", "Keine Daten gefunden."),
        variant: "destructive",
      });
      return;
    }
    setExerciseImporting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/exercises/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exercises: selectedExercises,
          mode: exerciseImportMode,
          decisions: exerciseImportDecisions,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || t("admin.errors.importFailed", "Import fehlgeschlagen.")
        );
      }
      const result = await response.json();
      if (exerciseImportReportEnabled) {
        const report = {
          generatedAt: new Date().toISOString(),
          mode: exerciseImportMode,
          scope: exerciseImportScope,
          summary: {
            imported: result.imported ?? 0,
            updated: result.updated ?? 0,
            skipped: result.skipped ?? 0,
          },
          selection: Array.from(exerciseImportSelection),
          items: exerciseImportPreview?.items?.map((item) => ({
            key: item.key,
            status: item.status,
            name: item.name,
            slug: item.slug,
            selected: exerciseImportSelection.has(item.key),
            decisions: exerciseImportDecisions[item.key] || {},
          })),
        };
        const reportJson = JSON.stringify(report, null, 2);
        if (exerciseImportReportFormat === "json" || exerciseImportReportFormat === "both") {
          downloadBlob(
            new Blob([reportJson], { type: "application/json" }),
            `exercise-import-report-${new Date().toISOString().slice(0, 10)}.json`
          );
        }
        if (exerciseImportReportFormat === "csv" || exerciseImportReportFormat === "both") {
          const rows = [
            [
              "key",
              "status",
              "name",
              "slug",
              "selected",
              "category",
              "discipline",
              "movementPattern",
              "measurementType",
              "difficultyTier",
              "decisions",
            ].join(","),
            ...(report.items || []).map((item) => {
              const previewItem =
                exerciseImportPreview?.items?.find((entry) => entry.key === item.key) || null;
              const incoming = previewItem?.incoming || {};
              const decisionJson = JSON.stringify(item.decisions || {}).replace(/"/g, '""');
              return [
                item.key,
                item.status,
                `"${String(item.name || "").replace(/"/g, '""')}"`,
                item.slug || "",
                item.selected ? "true" : "false",
                `"${String(incoming.category || "").replace(/"/g, '""')}"`,
                `"${String(incoming.discipline || "").replace(/"/g, '""')}"`,
                `"${String(incoming.movementPattern || "").replace(/"/g, '""')}"`,
                `"${String(incoming.measurementType || "").replace(/"/g, '""')}"`,
                incoming.difficultyTier ?? "",
                `"${decisionJson}"`,
              ].join(",");
            }),
          ];
          downloadBlob(
            new Blob([rows.join("\n")], { type: "text/csv; charset=utf-8" }),
            `exercise-import-report-${new Date().toISOString().slice(0, 10)}.csv`
          );
        }
      }
      toast({
        title: t("admin.success.importTitle", "Import abgeschlossen"),
        description: t(
          "admin.success.importDescription",
          "Importiert: {{imported}} · Aktualisiert: {{updated}} · Übersprungen: {{skipped}}",
          {
            imported: result.imported ?? 0,
            updated: result.updated ?? 0,
            skipped: result.skipped ?? 0,
          }
        ),
      });
      resetExerciseImportDialog();
      await loadExercises();
    } catch (error) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.errors.importFailed", "Import fehlgeschlagen."),
        variant: "destructive",
      });
    } finally {
      setExerciseImporting(false);
    }
  };

  const exerciseManagementToFormValue = (exercise: Exercise): ExerciseFormValue => {
    const measurementSet = new Set<string>();
    if (exercise.measurementType) measurementSet.add(exercise.measurementType);
    if (exercise.supportsTime && exercise.measurementType !== "time") measurementSet.add("time");
    if (exercise.supportsDistance && exercise.measurementType !== "distance") measurementSet.add("distance");
    if (exercise.supportsSets || exercise.measurementType === "reps") measurementSet.add("reps");

    const unitOptionsValues = extractNormalizedExerciseUnits(exercise.unitOptions);
    const normalizedUnit = normalizeExerciseUnit(exercise.unit);

    const distanceUnit =
      (["km", "m", "miles"].includes(normalizedUnit) ? normalizedUnit : "") ||
      unitOptionsValues.find((value) => ["km", "m", "miles"].includes(value)) ||
      (user?.preferences?.units?.distance || "km");

    const timeUnit =
      (["min", "sec"].includes(normalizedUnit) ? normalizedUnit : "") ||
      unitOptionsValues.find((value) => ["min", "sec"].includes(value)) ||
      "min";

    return {
      name: exercise.name,
      description: exercise.description || "",
      nameVariants: {
        deSingular: "",
        dePlural: "",
        enSingular: "",
        enPlural: "",
        other: Array.isArray(exercise.aliases) ? exercise.aliases.join(", ") : "",
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
      supportsSets: exercise.supportsSets ?? true,
      muscleGroups: exercise.muscleGroups || [],
      equipment: (exercise.equipment || []).join(", "),
    };
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

  const exerciseManagementOpenDetails = (
    exerciseLike: { id: string },
    mode: "view" | "edit" = "view"
  ) => {
    const exercise = exercises.find((item) => item.id === exerciseLike.id);
    if (!exercise) return;
    setExerciseEditTarget(exercise);
    if (mode === "edit") {
      const formValue = exerciseManagementToFormValue(exercise);
      setExerciseEditDraft(formValue);
      setExerciseEditDescriptionOpen(Boolean(formValue.description));
    } else {
      setExerciseEditDraft(null);
      setExerciseEditDescriptionOpen(false);
    }
    setExerciseDialogMode(mode);
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
    const hasDistance = exerciseEditDraft.measurementTypes.includes("distance");
    const hasReps = exerciseEditDraft.measurementTypes.includes("reps");
    const hasTime = exerciseEditDraft.measurementTypes.includes("time");

    const measurementType = hasDistance
      ? "distance"
      : hasReps && hasTime
        ? "mixed"
        : hasReps
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
    const unitOptions = hasDistance
      ? distanceUnitOptions
      : hasTime
        ? timeUnitOptions
        : [];
    const resolvedUnit = hasDistance
      ? exerciseEditDraft.distanceUnit || (user?.preferences?.units?.distance || "km")
      : hasTime
        ? exerciseEditDraft.timeUnit || "min"
        : "reps";
    const payload = {
      name: exerciseEditDraft.name,
      description: exerciseEditDraft.description,
      aliases: buildAliasList(exerciseEditDraft),
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
      supportsTime: hasTime,
      supportsDistance: hasDistance,
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
      "aliases",
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

  const exerciseImportVisibleItems = useMemo(() => {
    if (!exerciseImportPreview) return [];
    let items = exerciseImportPreview.items;
    if (exerciseImportScope === "conflicts") {
      items = items.filter((item) =>
        exerciseImportShowNewInConflicts
          ? item.status === "update" || item.status === "invalid" || item.status === "new"
          : item.status === "update" || item.status === "invalid"
      );
    }
    const query = exerciseImportSearch.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const incoming = item.incoming || {};
      const name = String(item.name || incoming.name || "").toLowerCase();
      const category = String(incoming.category || "").toLowerCase();
      const discipline = String(incoming.discipline || "").toLowerCase();
      const measurement = String(incoming.measurementType || "").toLowerCase();
      return (
        name.includes(query) ||
        category.includes(query) ||
        discipline.includes(query) ||
        measurement.includes(query)
      );
    });
  }, [
    exerciseImportPreview,
    exerciseImportScope,
    exerciseImportShowNewInConflicts,
    exerciseImportSearch,
  ]);

  const exerciseImportGroupedItems = useMemo(() => {
    if (!exerciseImportGroupByStatus) {
      return [{ status: "all", items: exerciseImportVisibleItems }];
    }
    const grouped: Array<{ status: "new" | "update" | "invalid"; items: ImportPreviewItem[] }> = [
      { status: "new", items: [] },
      { status: "update", items: [] },
      { status: "invalid", items: [] },
    ];
    exerciseImportVisibleItems.forEach((item) => {
      const group = grouped.find((g) => g.status === item.status);
      if (group) group.items.push(item);
    });
    return grouped.filter((group) => group.items.length > 0);
  }, [exerciseImportGroupByStatus, exerciseImportVisibleItems]);

  const exerciseImportActiveItem = useMemo(() => {
    if (!exerciseImportPreview || !exerciseImportActiveKey) return null;
    return (
      exerciseImportPreview.items.find((item) => item.key === exerciseImportActiveKey) || null
    );
  }, [exerciseImportPreview, exerciseImportActiveKey]);

  const exerciseImportVisibleSelectableKeys = useMemo(
    () =>
      exerciseImportVisibleItems
        .filter((item) => item.status !== "invalid")
        .map((item) => item.key),
    [exerciseImportVisibleItems]
  );

  const exerciseImportAllVisibleSelected = useMemo(
    () =>
      exerciseImportVisibleSelectableKeys.length > 0 &&
      exerciseImportVisibleSelectableKeys.every((key) =>
        exerciseImportSelection.has(key)
      ),
    [exerciseImportVisibleSelectableKeys, exerciseImportSelection]
  );

  const formatChangeValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? t("common.yes", "Ja") : t("common.no", "Nein");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const formatImportPreviewValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "-";
    }
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? t("common.yes", "Ja") : t("common.no", "Nein");
    if (typeof value === "object") return JSON.stringify(value);
    if (value === "") return "-";
    return String(value);
  };

  const importFieldLabels: Record<string, string> = {
    name: t("exerciseLibrary.name", "Name"),
    description: t("exerciseLibrary.description", "Beschreibung"),
    category: t("exerciseLibrary.category", "Kategorie"),
    discipline: t("exerciseLibrary.discipline", "Disziplin"),
    movementPattern: t("exerciseLibrary.pattern", "Bewegungsmuster"),
    measurementType: t("exerciseLibrary.measurement", "Einheiten"),
    pointsPerUnit: t("exerciseLibrary.pointsPerUnit", "Punkte/Einheit"),
    unit: t("exerciseLibrary.unit", "Einheit"),
    hasWeight: t("exerciseLibrary.hasWeight", "Gewicht möglich"),
    hasSetMode: t("exerciseLibrary.hasSetMode", "Set-Modus"),
    requiresWeight: t("exerciseLibrary.requiresWeight", "Gewicht erforderlich"),
    allowsWeight: t("exerciseLibrary.allowsWeight", "Gewicht optional"),
    supportsSets: t("exerciseLibrary.supportsSets", "Sets/Reps"),
    supportsTime: t("exerciseLibrary.time", "Zeit"),
    supportsDistance: t("exerciseLibrary.distance", "Distanz"),
    supportsGrade: t("exerciseLibrary.route", "Route"),
    difficultyTier: t("exerciseLibrary.difficulty", "Schwierigkeit"),
    muscleGroups: t("exerciseLibrary.muscleGroups", "Muskelgruppen"),
    equipment: t("exerciseLibrary.equipment", "Equipment"),
    unitOptions: t("exerciseLibrary.unitOptions", "Einheiten-Optionen"),
    aliases: t("exerciseLibrary.aliases", "Aliase"),
    isActive: t("exerciseLibrary.isActive", "Aktiv"),
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
          sideOffset={6}
          collisionPadding={12}
        >
          <Command shouldFilter={false}>
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <CommandInput
                placeholder={t("common.search", "Suche")}
                value={query}
                onValueChange={setQuery}
              />
            </div>
            <CommandList className="max-h-[260px] overflow-y-auto">
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
    if (!sourceId || !targetId || sourceId === targetId) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description: t(
          "admin.exercises.merge.validation",
          "Bitte wähle unterschiedliche Quell- und Ziel-Übungen."
        ),
        variant: "destructive",
      });
      return;
    }
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
          body: JSON.stringify({ targetExerciseId: targetId }),
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

  const applyMergeSelection = (exerciseId: string) => {
    if (mergeSourceId && !mergeTargetId) {
      if (mergeSourceId === exerciseId) {
        return "source";
      }
      setMergeTargetId(exerciseId);
      return "target";
    }
    if (mergeTargetId && !mergeSourceId) {
      if (mergeTargetId === exerciseId) {
        return "target";
      }
      setMergeSourceId(exerciseId);
      return "source";
    }
    if (mergeSourceId && mergeTargetId) {
      if (mergeSourceId === exerciseId) {
        return "source";
      }
      if (mergeTargetId === exerciseId) {
        return "target";
      }
      setMergeSourceId(exerciseId);
      return "source";
    }
    setMergeSourceId(exerciseId);
    return "source";
  };

  const handleMergeSourceChange = (nextId: string) => {
    setMergeSourceId(nextId);
    if (mergeTargetId === nextId) {
      setMergeTargetId("");
    }
  };

  const handleMergeTargetChange = (nextId: string) => {
    setMergeTargetId(nextId);
    if (mergeSourceId === nextId) {
      setMergeSourceId("");
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!exerciseId) return;
    const confirmed = window.confirm(
      t(
        "admin.exercises.deleteConfirm",
        "Möchtest du diese Übung wirklich endgültig löschen? Verknüpfte Trainings bleiben erhalten, die Übung wird entfernt."
      )
    );
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/admin/exercises/${exerciseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          t("admin.errors.deleteFailed", "Löschen fehlgeschlagen.")
        );
      }
      setExerciseManagementSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(exerciseId);
        return next;
      });
      toast({
        title: t("admin.success.deleteTitle", "Übung gelöscht"),
        description: t(
          "admin.success.deleteDescription",
          "Die Übung wurde dauerhaft gelöscht."
        ),
      });
      await loadExercises();
    } catch (error) {
      toast({
        title: t("admin.errors.title", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("admin.errors.deleteFailed", "Löschen fehlgeschlagen."),
        variant: "destructive",
      });
    }
  };

  const loadUsers = useCallback(async () => {
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
  }, []);

  const toggleUserBlock = useCallback(async (userId: string, currentlyBlocked: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/users/${userId}/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blocked: !currentlyBlocked }),
      });

      if (response.ok) {
        await loadUsers();
        toast({
          title: t("admin.success.title", "Erfolg"),
          description: currentlyBlocked
            ? t("admin.users.unblocked", "Benutzer wurde entsperrt.")
            : t("admin.users.blocked", "Benutzer wurde gesperrt."),
        });
      } else {
        throw new Error("Failed to toggle block status");
      }
    } catch (error) {
      console.error("Error toggling user block:", error);
      toast({
        title: t("admin.errors.title", "Fehler"),
        description: t("admin.users.blockError", "Fehler beim Sperren/Entsperren des Benutzers."),
        variant: "destructive",
      });
    }
  }, [loadUsers, toast, t]);

  const changeUserRole = useCallback(async (userId: string, newRole: "user" | "admin") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        await loadUsers();
        toast({
          title: t("admin.success.title", "Erfolg"),
          description: t("admin.users.roleChanged", "Rolle wurde auf {{role}} geändert.", {
            role: newRole === "admin" ? t("admin.users.role.admin", "Administrator") : t("admin.users.role.user", "Benutzer"),
          }),
        });
      } else {
        throw new Error("Failed to change role");
      }
    } catch (error) {
      console.error("Error changing user role:", error);
      toast({
        title: t("admin.errors.title", "Fehler"),
        description: t("admin.users.roleError", "Fehler beim Ändern der Benutzerrolle."),
        variant: "destructive",
      });
    }
  }, [loadUsers, toast, t]);

  const loadExercises = useCallback(async () => {
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
  }, []);

  const loadExerciseReports = useCallback(async () => {
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
  }, []);

  const loadExerciseEditRequests = useCallback(async () => {
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
  }, []);

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

  const loadOverviewStats = useCallback(async () => {
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
  }, [t, toast]);

  const loadMonitoringData = useCallback(async () => {
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
        console.log("Monitoring data loaded:", data);
        setMonitoringData(data);
      } else {
        const errorText = await response.text();
        console.error("Monitoring response error:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
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
  }, [t, toast]);

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
  }, [toast, t, loadUsers, loadExercises, loadExerciseReports, loadExerciseEditRequests, loadOverviewStats]);

  // Lade Daten beim Komponenten-Mount
  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    }
  }, [user?.role, loadAdminData]);

  useEffect(() => {
    if (
      user?.role === "admin" &&
      (activeTab === "monitoring" || activeTab === "overview")
    ) {
      loadMonitoringData();
    }
  }, [user?.role, activeTab, loadMonitoringData]);

  const monitoringJobs = monitoringData?.jobs ?? {
    stats: [],
    stuckJobs: [],
    recentFailures: [],
  };
  const monitoringEmails = monitoringData?.emails ?? {
    stats: [],
    recent: [],
  };
  const parseMonitoringCount = (value?: number | string | null) => {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const getDateScore = (value?: string | null) => {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  const totalUsers = overviewStats?.users ?? users.length;
  const totalWorkouts = overviewStats?.workouts ?? 0;
  const totalExercises = overviewStats?.exercises ?? exercises.length;
  const verifiedEmails = users.filter((u) => u.isEmailVerified).length;
  const moderationOpenReports = exerciseReports.length;
  const moderationOpenEdits = exerciseEditRequests.length;
  const moderationOpenTotal = moderationOpenReports + moderationOpenEdits;
  const monitoringJobFailureCount = monitoringJobs.recentFailures.reduce(
    (sum, failure) => sum + parseMonitoringCount(failure.count),
    0
  );
  const monitoringStuckCount = monitoringJobs.stuckJobs.length;
  const monitoringEmailFailureCount = monitoringEmails.stats.reduce((sum, stat) => {
    const failedAfterRetries = parseMonitoringCount(stat.failed_after_retries);
    if (failedAfterRetries > 0) return sum + failedAfterRetries;
    const status = String(stat.status ?? "").toLowerCase();
    if (status.includes("fail")) {
      return sum + parseMonitoringCount(stat.count);
    }
    return sum;
  }, 0);
  const monitoringIssueTotal =
    monitoringJobFailureCount + monitoringStuckCount + monitoringEmailFailureCount;
  const recentReports = useMemo(
    () =>
      [...exerciseReports]
        .sort((a, b) => getDateScore(b.createdAt) - getDateScore(a.createdAt))
        .slice(0, 3),
    [exerciseReports]
  );
  const recentEditRequests = useMemo(
    () =>
      [...exerciseEditRequests]
        .sort((a, b) => getDateScore(b.createdAt) - getDateScore(a.createdAt))
        .slice(0, 3),
    [exerciseEditRequests]
  );
  const recentMonitoringFailures = useMemo(
    () => monitoringJobs.recentFailures.slice(0, 3),
    [monitoringJobs.recentFailures]
  );
  const recentMonitoringEmails = useMemo(
    () => monitoringEmails.recent.slice(0, 3),
    [monitoringEmails.recent]
  );
  const getStatusColor = (count: number) => {
    if (count === 0) {
      return {
        text: "text-emerald-600",
        border: "border-emerald-500/40",
        bg: "bg-emerald-500/10",
        hoverBorder: "hover:border-emerald-500/40",
        hoverBg: "hover:bg-emerald-500/5",
        ring: "focus-visible:ring-emerald-500/40",
      };
    } else if (count <= 2) {
      return {
        text: "text-yellow-600",
        border: "border-yellow-500/40",
        bg: "bg-yellow-500/10",
        hoverBorder: "hover:border-yellow-500/40",
        hoverBg: "hover:bg-yellow-500/5",
        ring: "focus-visible:ring-yellow-500/40",
      };
    } else if (count <= 5) {
      return {
        text: "text-orange-600",
        border: "border-orange-500/40",
        bg: "bg-orange-500/10",
        hoverBorder: "hover:border-orange-500/40",
        hoverBg: "hover:bg-orange-500/5",
        ring: "focus-visible:ring-orange-500/40",
      };
    } else {
      return {
        text: "text-rose-600",
        border: "border-rose-500/40",
        bg: "bg-rose-500/10",
        hoverBorder: "hover:border-rose-500/40",
        hoverBg: "hover:bg-rose-500/5",
        ring: "focus-visible:ring-rose-500/40",
      };
    }
  };
  const scrollToRef = (ref: RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const navigateToSection = (tab: string, ref?: RefObject<HTMLDivElement>) => {
    setActiveTab(tab);
    if (!ref) return;
    if (tab === activeTab) {
      requestAnimationFrame(() => scrollToRef(ref));
      return;
    }
    setPendingScroll({ tab, ref });
  };

  useEffect(() => {
    if (!pendingScroll || pendingScroll.tab !== activeTab) return;
    requestAnimationFrame(() => scrollToRef(pendingScroll.ref));
    setPendingScroll(null);
  }, [activeTab, pendingScroll]);

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
      return formatDateTime(date, {
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
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    {t("admin.overview.title", "Admin-Übersicht")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "admin.overview.subtitle",
                      "Die wichtigsten Kennzahlen und Vorgänge auf einen Blick."
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => navigateToSection("users", usersSectionRef)}
                      className="rounded-lg border bg-background/70 p-4 text-left shadow-sm transition hover:border-emerald-500/40 hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.stats.users", "Registrierte Benutzer")}
                          </p>
                          <p className="text-3xl font-semibold text-emerald-600">{totalUsers}</p>
                        </div>
                        <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t(
                          "admin.overview.verifiedEmails",
                          "{{count}} verifizierte E-Mails",
                          { count: verifiedEmails }
                        )}
                      </p>
                    </button>
                    <div className="rounded-lg border bg-background/70 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.stats.workouts", "Durchgeführte Trainings")}
                          </p>
                          <p className="text-3xl font-semibold text-emerald-600">
                            {totalWorkouts}
                          </p>
                        </div>
                        <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                          <Activity className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("admin.overview.workoutsHint", "Inklusive importierter Sessions")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigateToSection("exercise-management", exerciseManagementTopRef)
                      }
                      className="rounded-lg border bg-background/70 p-4 text-left shadow-sm transition hover:border-emerald-500/40 hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.stats.exercises", "Angelegte Übungen")}
                          </p>
                          <p className="text-3xl font-semibold text-emerald-600">
                            {totalExercises}
                          </p>
                        </div>
                        <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                          <Settings className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t(
                          "admin.overview.exercisesHint",
                          "Basis für Vorlagen und Programme"
                        )}
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t("admin.overview.moderation.title", "Moderation im Blick")}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(moderationOpenTotal).border} ${getStatusColor(moderationOpenTotal).text}`}
                  >
                    {moderationOpenTotal > 0
                      ? t("admin.overview.moderation.open", "{{count}} offen", {
                        count: moderationOpenTotal,
                      })
                      : t("admin.overview.moderation.clear", "Keine offenen Fälle")}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => navigateToSection("moderation", moderationReportsRef)}
                      className={`rounded-lg border bg-muted/30 p-3 text-left transition ${getStatusColor(moderationOpenReports).hoverBorder} ${getStatusColor(moderationOpenReports).hoverBg} focus-visible:outline-none focus-visible:ring-2 ${getStatusColor(moderationOpenReports).ring}`}
                    >
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("admin.overview.moderation.reports", "Reports")}
                      </p>
                      <p className={`text-2xl font-semibold ${getStatusColor(moderationOpenReports).text}`}>
                        {moderationOpenReports}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "admin.overview.moderation.reportsHint",
                          "Sichtbare Inhalte prüfen"
                        )}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToSection("moderation", moderationEditsRef)}
                      className={`rounded-lg border bg-muted/30 p-3 text-left transition ${getStatusColor(moderationOpenEdits).hoverBorder} ${getStatusColor(moderationOpenEdits).hoverBg} focus-visible:outline-none focus-visible:ring-2 ${getStatusColor(moderationOpenEdits).ring}`}
                    >
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("admin.overview.moderation.edits", "Änderungen")}
                      </p>
                      <p className={`text-2xl font-semibold ${getStatusColor(moderationOpenEdits).text}`}>
                        {moderationOpenEdits}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "admin.overview.moderation.editsHint",
                          "Übungsdaten freigeben"
                        )}
                      </p>
                    </button>
                  </div>
                  {recentReports.length === 0 && recentEditRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("admin.overview.moderation.empty", "Aktuell gibt es nichts zu moderieren.")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentReports.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {t("admin.overview.moderation.latestReports", "Letzte Reports")}
                          </p>
                          {recentReports.map((report) => (
                            <div
                              key={report.id}
                              className="flex items-start justify-between gap-3 rounded-md border bg-background/80 p-2"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {exerciseMap.get(report.exerciseId)?.name ||
                                    report.exerciseId}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {report.reason || report.details || "-"}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(report.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {recentEditRequests.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {t("admin.overview.moderation.latestEdits", "Letzte Änderungsanfragen")}
                          </p>
                          {recentEditRequests.map((request) => (
                            <div
                              key={request.id}
                              className="flex items-start justify-between gap-3 rounded-md border bg-background/80 p-2"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {exerciseMap.get(request.exerciseId)?.name ||
                                    request.exerciseId}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t(
                                    "admin.overview.moderation.changesCount",
                                    "{{count}} Felder geändert",
                                    {
                                      count: Object.keys(request.changeRequest || {}).length,
                                    }
                                  )}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(request.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t("admin.overview.monitoring.title", "Monitoring-Kurzcheck")}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(monitoringIssueTotal).border} ${getStatusColor(monitoringIssueTotal).text}`}
                  >
                    {monitoringIssueTotal > 0
                      ? t("admin.overview.monitoring.alert", "{{count}} Hinweise", {
                        count: monitoringIssueTotal,
                      })
                      : t("admin.overview.monitoring.ok", "Alles ruhig")}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingMonitoring ? (
                    <p className="text-sm text-muted-foreground">
                      {t("admin.monitoring.loading", "Monitoring-Daten werden geladen...")}
                    </p>
                  ) : !monitoringData ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "admin.overview.monitoring.empty",
                          "Monitoring-Daten sind noch nicht geladen."
                        )}
                      </p>
                      <Button size="sm" variant="outline" onClick={loadMonitoringData}>
                        <Activity className="w-4 h-4" />
                        {t("admin.overview.monitoring.load", "Daten laden")}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigateToSection(
                              "monitoring",
                              monitoringJobs.recentFailures.length > 0
                                ? monitoringFailuresRef
                                : monitoringJobsRef
                            )
                          }
                          className={`rounded-lg border bg-muted/30 p-3 text-left transition ${getStatusColor(monitoringJobFailureCount).hoverBorder} ${getStatusColor(monitoringJobFailureCount).hoverBg} focus-visible:outline-none focus-visible:ring-2 ${getStatusColor(monitoringJobFailureCount).ring}`}
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {t("admin.overview.monitoring.jobFailures", "Job-Fehler")}
                          </p>
                          <p className={`text-2xl font-semibold ${getStatusColor(monitoringJobFailureCount).text}`}>
                            {monitoringJobFailureCount}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigateToSection(
                              "monitoring",
                              monitoringJobs.stuckJobs.length > 0
                                ? monitoringStuckRef
                                : monitoringJobsRef
                            )
                          }
                          className={`rounded-lg border bg-muted/30 p-3 text-left transition ${getStatusColor(monitoringStuckCount).hoverBorder} ${getStatusColor(monitoringStuckCount).hoverBg} focus-visible:outline-none focus-visible:ring-2 ${getStatusColor(monitoringStuckCount).ring}`}
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {t("admin.overview.monitoring.stuckJobs", "Stuck Jobs")}
                          </p>
                          <p className={`text-2xl font-semibold ${getStatusColor(monitoringStuckCount).text}`}>
                            {monitoringStuckCount}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToSection("monitoring", monitoringEmailsRef)}
                          className={`rounded-lg border bg-muted/30 p-3 text-left transition ${getStatusColor(monitoringEmailFailureCount).hoverBorder} ${getStatusColor(monitoringEmailFailureCount).hoverBg} focus-visible:outline-none focus-visible:ring-2 ${getStatusColor(monitoringEmailFailureCount).ring}`}
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {t("admin.overview.monitoring.emailFailures", "Mail-Fehler")}
                          </p>
                          <p className={`text-2xl font-semibold ${getStatusColor(monitoringEmailFailureCount).text}`}>
                            {monitoringEmailFailureCount}
                          </p>
                        </button>
                      </div>
                      {recentMonitoringFailures.length === 0 &&
                        recentMonitoringEmails.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "admin.overview.monitoring.noIssues",
                            "Keine kritischen Events in den letzten Einträgen."
                          )}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {recentMonitoringFailures.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {t("admin.overview.monitoring.latestJobs", "Letzte Job-Fehler")}
                              </p>
                              {recentMonitoringFailures.map((failure) => (
                                <div
                                  key={failure.job_name}
                                  className="flex items-center justify-between rounded-md border bg-background/80 p-2"
                                >
                                  <p className="text-sm font-medium">{failure.job_name}</p>
                                  <Badge variant="outline">
                                    {parseMonitoringCount(failure.count)}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          {recentMonitoringEmails.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {t("admin.overview.monitoring.latestEmails", "Letzte Mails")}
                              </p>
                              {recentMonitoringEmails.map((email) => (
                                <div
                                  key={email.id}
                                  className="flex items-center justify-between rounded-md border bg-background/80 p-2"
                                >
                                  <div>
                                    <p className="text-sm font-medium">{email.subject}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {maskEmail(email.recipient)} · {email.status}
                                    </p>
                                  </div>
                                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDate(email.processedAt || email.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <div ref={usersSectionRef}>
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
                            <TableHead className="sticky right-0 z-10 bg-background text-right">
                              {t("admin.users.table.actions", "Aktionen")}
                            </TableHead>
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
                                  {adminUser.isBlocked && (
                                    <Badge
                                      variant="destructive"
                                    >
                                      <Ban className="w-3 h-3 mr-1" />
                                      {t("admin.users.badge.blocked", "Gesperrt")}
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
                              <TableCell className="sticky right-0 z-10 bg-background">
                                <div className="flex justify-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {adminUser.isBlocked ? (
                                        <DropdownMenuItem
                                          onClick={() => toggleUserBlock(adminUser.id, true)}
                                        >
                                          <Unlock className="w-4 h-4 mr-2" />
                                          {t("admin.users.actions.unblock", "Entsperren")}
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => toggleUserBlock(adminUser.id, false)}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          <Ban className="w-4 h-4 mr-2" />
                                          {t("admin.users.actions.block", "Sperren")}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      {adminUser.role === "admin" ? (
                                        <DropdownMenuItem
                                          onClick={() => changeUserRole(adminUser.id, "user")}
                                        >
                                          <Users className="w-4 h-4 mr-2" />
                                          {t("admin.users.actions.setUser", "Zu Benutzer ändern")}
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => changeUserRole(adminUser.id, "admin")}
                                        >
                                          <Shield className="w-4 h-4 mr-2" />
                                          {t("admin.users.actions.setAdmin", "Zu Administrator ändern")}
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
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
            </div>
          </TabsContent>

          <TabsContent value="exercise-management" className="space-y-6">
            <div ref={exerciseManagementTopRef} className="space-y-6">
              <div className="flex items-center justify-between gap-4 border-b pb-4">
                <h2 className="text-lg font-semibold">
                  {t("admin.tabs.exercises", "Übungsverwaltung")}
                </h2>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Input
                            type="file"
                            id="header-import-upload"
                            className="hidden"
                            accept=".csv,.json,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                requestExerciseImportPreview(file);
                              }
                              event.currentTarget.value = "";
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("header-import-upload")?.click()
                            }
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Importiere Übungen aus CSV, JSON oder Excel.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Vorlage
                              <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Export-Format wählen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleExerciseExport("csv")}>
                              <FileText className="mr-2 h-4 w-4" />
                              CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExerciseExport("json")}>
                              <FileJson className="mr-2 h-4 w-4" />
                              JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExerciseExport("xlsx")}>
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              Excel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Lade eine Vorlage für den Import herunter.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleExportSelectedExercises}
                          disabled={exerciseManagementSelectedIds.size === 0}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {t("admin.exercises.exportSelected.button", "Ausgewählte exportieren")}
                          {exerciseManagementSelectedIds.size > 0 &&
                            ` (${exerciseManagementSelectedIds.size})`}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Exportiere die ausgewählten Übungen als JSON (inkl. aller Daten).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Dialog
                open={exerciseImportDialogOpen}
                onOpenChange={(open) => {
                  if (!open) resetExerciseImportDialog();
                  else setExerciseImportDialogOpen(true);
                }}
              >
                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>
                      {t("admin.exercises.importReview.title", "Import-Review")}
                    </DialogTitle>
                    <DialogDescription>
                      {t(
                        "admin.exercises.importReview.description",
                        "Prüfe die Übungen vor dem Import, wähle Einträge ab und entscheide Updates."
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  {!exerciseImportPreview ? (
                    <div className="py-6 text-sm text-muted-foreground">
                      {t("common.loading", "Lade...")}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        <Label className="mr-2">
                          {t("admin.exercises.importReview.mode", "Modus")}
                        </Label>
                        <Button
                          variant={exerciseImportMode === "auto" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExerciseImportMode("auto")}
                        >
                          {t("admin.exercises.importReview.modeAuto", "Auto-Merge")}
                        </Button>
                        <Button
                          variant={exerciseImportMode === "manual" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExerciseImportMode("manual")}
                        >
                          {t("admin.exercises.importReview.modeManual", "Manuell")}
                        </Button>

                        <Label className="ml-4 mr-2">
                          {t("admin.exercises.importReview.scope", "Ansicht")}
                        </Label>
                        <Button
                          variant={exerciseImportScope === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExerciseImportScope("all")}
                        >
                          {t("admin.exercises.importReview.scopeAll", "Alle")}
                        </Button>
                        <Button
                          variant={exerciseImportScope === "conflicts" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExerciseImportScope("conflicts")}
                        >
                          {t("admin.exercises.importReview.scopeConflicts", "Nur Konflikte")}
                        </Button>
                        {exerciseImportScope === "conflicts" && (
                          <Button
                            variant={exerciseImportShowNewInConflicts ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setExerciseImportShowNewInConflicts((prev) => !prev)
                            }
                          >
                            {exerciseImportShowNewInConflicts
                              ? t("admin.exercises.importReview.hideNew", "Neue ausblenden")
                              : t("admin.exercises.importReview.showNew", "Neue anzeigen")}
                          </Button>
                        )}

                        <div className="ml-auto flex gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">
                            {t("admin.exercises.importReview.summaryNew", "Neu")}:{" "}
                            {exerciseImportPreview.summary.new}
                          </Badge>
                          <Badge variant="secondary">
                            {t("admin.exercises.importReview.summaryUpdate", "Updates")}:{" "}
                            {exerciseImportPreview.summary.update}
                          </Badge>
                          {exerciseImportPreview.summary.invalid > 0 && (
                            <Badge variant="outline">
                              {t("admin.exercises.importReview.summaryInvalid", "Ungültig")}:{" "}
                              {exerciseImportPreview.summary.invalid}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {exerciseImportScope === "conflicts" && (
                        <div className="text-xs text-muted-foreground">
                          {t(
                            "admin.exercises.importReview.conflictsHint",
                            "Nur Konflikte werden angezeigt. Neue Übungen werden trotzdem importiert."
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 items-center">
                        <Input
                          value={exerciseImportSearch}
                          onChange={(event) => setExerciseImportSearch(event.target.value)}
                          placeholder={t("admin.exercises.importReview.search", "Suche...")}
                          className="max-w-sm"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={exerciseImportGroupByStatus ? "default" : "outline"}
                              size="sm"
                              onClick={() => setExerciseImportGroupByStatus((prev) => !prev)}
                            >
                              {exerciseImportGroupByStatus
                                ? t("admin.exercises.importReview.grouped", "Gruppiert")
                                : t("admin.exercises.importReview.group", "Gruppieren")}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            {t(
                              "admin.exercises.importReview.groupTooltip",
                              "Tabelle nach Status gruppieren: Neu, Update, Ungültig."
                            )}
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          variant={exerciseImportCompactView ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExerciseImportCompactView((prev) => !prev)}
                        >
                          {exerciseImportCompactView
                            ? t("admin.exercises.importReview.compact", "Kompakt")
                            : t("admin.exercises.importReview.detail", "Detail")}
                        </Button>
                        <div className="flex items-center gap-2 ml-auto">
                          <Checkbox
                            checked={exerciseImportReportEnabled}
                            onCheckedChange={(checked) =>
                              setExerciseImportReportEnabled(checked === true)
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {t("admin.exercises.importReview.report", "Import-Report speichern")}
                          </span>
                          {exerciseImportReportEnabled && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant={exerciseImportReportFormat === "json" ? "default" : "outline"}
                                onClick={() => setExerciseImportReportFormat("json")}
                              >
                                JSON
                              </Button>
                              <Button
                                size="sm"
                                variant={exerciseImportReportFormat === "csv" ? "default" : "outline"}
                                onClick={() => setExerciseImportReportFormat("csv")}
                              >
                                CSV
                              </Button>
                              <Button
                                size="sm"
                                variant={exerciseImportReportFormat === "both" ? "default" : "outline"}
                                onClick={() => setExerciseImportReportFormat("both")}
                              >
                                {t("admin.exercises.importReview.reportBoth", "Beides")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border rounded-lg overflow-hidden min-h-[320px] max-h-[420px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 z-10 bg-background">
                            <TableRow>
                              <TableHead className="w-10">
                                <Checkbox
                                  checked={exerciseImportAllVisibleSelected}
                                  onCheckedChange={(checked) =>
                                    selectAllExerciseImport(
                                      checked === true,
                                      exerciseImportVisibleSelectableKeys
                                    )
                                  }
                                />
                              </TableHead>
                              <TableHead>{t("exerciseLibrary.name", "Name")}</TableHead>
                              {!exerciseImportCompactView && (
                                <TableHead>{t("exerciseLibrary.category", "Kategorie")}</TableHead>
                              )}
                              {!exerciseImportCompactView && (
                                <TableHead>{t("exerciseLibrary.discipline", "Disziplin")}</TableHead>
                              )}
                              {!exerciseImportCompactView && (
                                <TableHead>{t("exerciseLibrary.measurement", "Einheiten")}</TableHead>
                              )}
                              {!exerciseImportCompactView && (
                                <TableHead>{t("exerciseLibrary.difficulty", "Schwierigkeit")}</TableHead>
                              )}
                              <TableHead>{t("admin.exercises.importReview.status", "Status")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {exerciseImportGroupedItems.map((group) => (
                              <Fragment key={group.status}>
                                {exerciseImportGroupByStatus && (
                                  <TableRow>
                                    <TableCell colSpan={exerciseImportCompactView ? 4 : 7}>
                                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                        {group.status === "new"
                                          ? t("admin.exercises.importReview.statusNew", "Neu")
                                          : group.status === "update"
                                            ? t("admin.exercises.importReview.statusUpdate", "Update")
                                            : t("admin.exercises.importReview.statusInvalid", "Ungültig")}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                                {group.items.map((item) => {
                                  const incoming = item.incoming || {};
                                  const statusLabel =
                                    item.status === "new"
                                      ? t("admin.exercises.importReview.statusNew", "Neu")
                                      : item.status === "update"
                                        ? t("admin.exercises.importReview.statusUpdate", "Update")
                                        : t("admin.exercises.importReview.statusInvalid", "Ungültig");
                                  return (
                                    <TableRow key={item.key}>
                                      <TableCell>
                                        <Checkbox
                                          checked={exerciseImportSelection.has(item.key)}
                                          disabled={item.status === "invalid"}
                                          onCheckedChange={(checked) =>
                                            toggleExerciseImportSelection(item.key, checked === true)
                                          }
                                        />
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {item.name || String(incoming.name || "-")}
                                      </TableCell>
                                      {!exerciseImportCompactView && (
                                        <TableCell>
                                          {String(incoming.category || "-")}
                                        </TableCell>
                                      )}
                                      {!exerciseImportCompactView && (
                                        <TableCell>
                                          {String(incoming.discipline || "-")}
                                        </TableCell>
                                      )}
                                      {!exerciseImportCompactView && (
                                        <TableCell>
                                          {String(incoming.measurementType || "-")}
                                        </TableCell>
                                      )}
                                      {!exerciseImportCompactView && (
                                        <TableCell>
                                          {String(incoming.difficultyTier ?? "-")}
                                        </TableCell>
                                      )}
                                      <TableCell>
                                        <Badge
                                          variant={
                                            item.status === "update"
                                              ? "outline"
                                              : item.status === "new"
                                                ? "secondary"
                                                : "destructive"
                                          }
                                        >
                                          {statusLabel}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                          {t("admin.exercises.importReview.selected", "Ausgewählt")}:{" "}
                          {exerciseImportSelection.size}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={resetExerciseImportDialog}>
                            {t("common.cancel", "Abbrechen")}
                          </Button>
                          <Button
                            onClick={() => {
                              if (exerciseImportMode === "manual") {
                                const items =
                                  exerciseImportPreview?.items?.filter((i) =>
                                    exerciseImportSelection.has(i.key)
                                  ) ?? [];
                                setExerciseImportWizardItems(items);
                                setExerciseImportWizardIndex(0);
                                setExerciseImportSkippedKeys(new Set());
                                setExerciseImportWizardOpen(true);
                              } else {
                                handleExerciseImportConfirm();
                              }
                            }}
                            disabled={exerciseImportSelection.size === 0}
                          >
                            {t("admin.exercises.importReview.import", "Import starten")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog
                open={Boolean(exerciseImportActiveItem)}
                onOpenChange={(open) => {
                  if (!open) setExerciseImportActiveKey(null);
                }}
              >
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {t("admin.exercises.importReview.mergeTitle", "Feldvergleich")}
                    </DialogTitle>
                    <DialogDescription>
                      {t(
                        "admin.exercises.importReview.mergeDescription",
                        "Wähle pro Feld, ob der bestehende oder der importierte Wert verwendet wird."
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  {!exerciseImportActiveItem ? null : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={exerciseImportMergeShowAllFields}
                          onCheckedChange={(checked) =>
                            setExerciseImportMergeShowAllFields(checked === true)
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {t(
                            "admin.exercises.importReview.showAllFields",
                            "Alle Felder anzeigen"
                          )}
                        </span>
                      </div>
                      {Object.entries(exerciseImportActiveItem.diffs || {})
                        .filter(([, diff]) =>
                          exerciseImportMergeShowAllFields ? true : diff.changed
                        )
                        .map(([field, diff]) => {
                          const decision =
                            exerciseImportDecisions[exerciseImportActiveItem.key]?.[field] ||
                            (diff.incomingEmpty ? "keep" : "import");
                          return (
                            <div
                              key={field}
                              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-center border rounded-md p-3"
                            >
                              <div>
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                  {importFieldLabels[field] || field}
                                </div>
                                <div className="text-sm">
                                  {formatImportPreviewValue(diff.existing)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                  {t("admin.exercises.importReview.incoming", "Import")}
                                </div>
                                <div className="text-sm">
                                  {formatImportPreviewValue(diff.incoming)}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant={decision === "keep" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    updateExerciseImportDecision(
                                      exerciseImportActiveItem.key,
                                      field,
                                      "keep"
                                    )
                                  }
                                >
                                  {t("admin.exercises.importReview.keep", "Behalten")}
                                </Button>
                                <Button
                                  variant={decision === "import" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    updateExerciseImportDecision(
                                      exerciseImportActiveItem.key,
                                      field,
                                      "import"
                                    )
                                  }
                                >
                                  {t("admin.exercises.importReview.useImport", "Import")}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      {Object.entries(exerciseImportActiveItem.diffs || {}).filter(
                        ([, diff]) => diff.changed
                      ).length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            {t(
                              "admin.exercises.importReview.noChanges",
                              "Keine Unterschiede gefunden."
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Manueller Import: Schritt-für-Schritt Wizard mit Split-Screen */}
              <Dialog
                open={exerciseImportWizardOpen}
                onOpenChange={(open) => {
                  if (!open) {
                    setExerciseImportWizardOpen(false);
                  }
                }}
              >
                <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      {t("admin.exercises.importWizard.title", "Import – Übung für Übung")}
                    </DialogTitle>
                    <DialogDescription>
                      {t(
                        "admin.exercises.importWizard.description",
                        "Links: bestehende Übung im System. Rechts: zu importierende Daten. Pro Feld wählen, welcher Wert übernommen wird."
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  {exerciseImportWizardItems.length > 0 && (
                    <>
                      <div className="text-sm text-muted-foreground">
                        {t("admin.exercises.importWizard.step", "Übung")}{" "}
                        {exerciseImportWizardIndex + 1} / {exerciseImportWizardItems.length}
                        {exerciseImportSkippedKeys.size > 0 && (
                          <span className="ml-2">
                            ({t("admin.exercises.importWizard.skipped", "ausgelassen")}:{" "}
                            {exerciseImportSkippedKeys.size})
                          </span>
                        )}
                      </div>
                      {(() => {
                        const item =
                          exerciseImportWizardItems[exerciseImportWizardIndex];
                        if (!item) return null;
                        const showAllFields =
                          item.status === "new" ||
                          exerciseImportScope === "all";
                        const diffEntries = Object.entries(item.diffs || {}).filter(
                          ([, d]) => showAllFields || d.changed
                        );
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-auto">
                            <div className="border rounded-lg p-4 bg-muted/30 flex flex-col min-h-[280px]">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                {t(
                                  "admin.exercises.importWizard.existing",
                                  "Bestehende Übung im System"
                                )}
                              </div>
                              {item.existing ? (
                                <div className="space-y-2 overflow-y-auto">
                                  {diffEntries.map(([field, diff]) => (
                                    <div key={field} className="text-sm">
                                      <span className="text-muted-foreground">
                                        {importFieldLabels[field] || field}:
                                      </span>{" "}
                                      {formatImportPreviewValue(diff.existing)}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                                  {t(
                                    "admin.exercises.importWizard.noExisting",
                                    "Keine bestehende Übung – diese wird neu angelegt."
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="border rounded-lg p-4 flex flex-col min-h-[280px]">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                {t(
                                  "admin.exercises.importWizard.incoming",
                                  "Zu importierende Übung"
                                )}
                              </div>
                              <div className="space-y-3 overflow-y-auto flex-1">
                                {diffEntries.map(([field, diff]) => {
                                  const decision =
                                    exerciseImportDecisions[item.key]?.[field] ??
                                    (item.status === "new"
                                      ? "import"
                                      : diff.incomingEmpty
                                        ? "keep"
                                        : "import");
                                  return (
                                    <div
                                      key={field}
                                      className="flex flex-wrap items-center gap-2 border-b pb-2 last:border-0"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs text-muted-foreground">
                                          {importFieldLabels[field] || field}
                                        </div>
                                        <div className="text-sm">
                                          {formatImportPreviewValue(diff.incoming)}
                                        </div>
                                      </div>
                                      {item.status === "update" ? (
                                        <div className="flex gap-1 shrink-0">
                                          <Button
                                            variant={decision === "keep" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() =>
                                              updateExerciseImportDecision(
                                                item.key,
                                                field,
                                                "keep"
                                              )
                                            }
                                          >
                                            {t(
                                              "admin.exercises.importReview.keep",
                                              "Behalten"
                                            )}
                                          </Button>
                                          <Button
                                            variant={decision === "import" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() =>
                                              updateExerciseImportDecision(
                                                item.key,
                                                field,
                                                "import"
                                              )
                                            }
                                          >
                                            {t(
                                              "admin.exercises.importReview.useImport",
                                              "Import"
                                            )}
                                          </Button>
                                        </div>
                                      ) : (
                                        <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer shrink-0">
                                          <Checkbox
                                            checked={decision === "import"}
                                            onCheckedChange={(checked) =>
                                              updateExerciseImportDecision(
                                                item.key,
                                                field,
                                                checked === true ? "import" : "keep"
                                              )
                                            }
                                          />
                                          {t(
                                            "admin.exercises.importWizard.includeField",
                                            "Übernehmen"
                                          )}
                                        </Label>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const currentKey =
                              exerciseImportWizardItems[exerciseImportWizardIndex].key;
                            setExerciseImportSkippedKeys((prev) =>
                              new Set(prev).add(currentKey)
                            );
                            if (
                              exerciseImportWizardIndex >=
                              exerciseImportWizardItems.length - 1
                            ) {
                              setExerciseImportWizardOpen(false);
                              const finalKeys = new Set(exerciseImportSelection);
                              finalKeys.delete(currentKey);
                              exerciseImportSkippedKeys.forEach((k) =>
                                finalKeys.delete(k)
                              );
                              handleExerciseImportConfirm({
                                selectedKeys: finalKeys,
                              });
                              return;
                            }
                            setExerciseImportWizardIndex((i) => i + 1);
                          }}
                        >
                          {t(
                            "admin.exercises.importWizard.skipExercise",
                            "Diese Übung nicht importieren"
                          )}
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            disabled={exerciseImportWizardIndex === 0}
                            onClick={() =>
                              setExerciseImportWizardIndex((i) => Math.max(0, i - 1))
                            }
                          >
                            {t("common.previous", "Zurück")}
                          </Button>
                          {exerciseImportWizardIndex <
                            exerciseImportWizardItems.length - 1 ? (
                            <Button
                              onClick={() =>
                                setExerciseImportWizardIndex((i) => i + 1)
                              }
                            >
                              {t("common.next", "Weiter")}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                setExerciseImportWizardOpen(false);
                                const finalKeys = new Set(exerciseImportSelection);
                                exerciseImportSkippedKeys.forEach((k) => finalKeys.delete(k));
                                handleExerciseImportConfirm({
                                  selectedKeys: finalKeys,
                                });
                              }}
                            >
                              {t(
                                "admin.exercises.importReview.import",
                                "Import starten"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              <Collapsible
                open={mergeSectionOpen}
                onOpenChange={setMergeSectionOpen}
                className="w-full space-y-2"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between font-medium"
                  >
                    <span>
                      {t("admin.exercises.toolsSection.title", "Werkzeuge")}
                      <span className="text-muted-foreground font-normal ml-2">
                        {t("admin.exercises.toolsSection.hint", "Zusammenführen von Übungen")}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${mergeSectionOpen ? "rotate-180" : ""
                        }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
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
                          onChange={handleMergeSourceChange}
                          placeholder={t("admin.exercises.merge.sourcePlaceholder", "Quelle wählen")}
                          options={exercises}
                        />
                      </div>
                      <div>
                        <Label>{t("admin.exercises.merge.target", "Ziel‑Übung")}</Label>
                        <ExerciseMergeSelect
                          value={mergeTargetId}
                          onChange={handleMergeTargetChange}
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
                      <div className="md:col-span-3 text-xs text-muted-foreground">
                        {t(
                          "admin.exercises.merge.helper",
                          "Die Quell‑Übung wird in die Ziel‑Übung übernommen. Alle Verknüpfungen werden auf die Ziel‑Übung verschoben, die Quell‑Übung wird deaktiviert."
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

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
                    onSelect={(exercise) => exerciseManagementOpenDetails(exercise, "view")}
                    selectedIds={exerciseManagementSelectedIds}
                    onToggleSelect={exerciseManagementToggleSelect}
                    renderMenuItems={(exercise) => (
                      <>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            exerciseManagementOpenDetails(exercise, "view");
                          }}
                        >
                          {t("admin.exercises.actions.details", "Details")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            exerciseManagementOpenDetails(exercise, "edit");
                          }}
                        >
                          {t("admin.exercises.actions.edit", "Bearbeiten")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            const target = applyMergeSelection(exercise.id);
                            toast({
                              title: t(
                                "admin.exercises.merge.toastTitle",
                                target === "target" ? "Ziel gesetzt" : "Quelle gesetzt"
                              ),
                              description: t(
                                "admin.exercises.merge.toastDescription",
                                {
                                  name: exercise.name,
                                  defaultValue:
                                    target === "target"
                                      ? `${exercise.name} als Ziel‑Übung ausgewählt.`
                                      : `${exercise.name} als Quell‑Übung ausgewählt.`,
                                }
                              ),
                            });
                            handleMergeSectionOpen();
                          }}
                        >
                          {t("admin.exercises.actions.merge", "Zusammenführen")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(event) => {
                            event.preventDefault();
                            handleDeleteExercise(exercise.id);
                          }}
                        >
                          {t("admin.exercises.actions.delete", "Löschen")}
                        </DropdownMenuItem>
                      </>
                    )}
                    labels={getExerciseBrowseLabels(t)}
                  />
                }
                table={
                  <ExerciseBrowseTable
                    selectedIds={exerciseManagementSelectedIds}
                    onToggleSelect={exerciseManagementToggleSelect}
                    onSelectAllOnPage={exerciseManagementSelectAllOnPage}
                    items={exerciseManagementPageItems}
                    sortBy={exerciseManagementSortBy}
                    sortDirection={exerciseManagementSortDirection}
                    onSortClick={exerciseManagementHandleSortClick}
                    onSelect={(exercise) => exerciseManagementOpenDetails(exercise, "view")}
                    renderMenuItems={(exercise) => (
                      <>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            exerciseManagementOpenDetails(exercise, "view");
                          }}
                        >
                          {t("admin.exercises.actions.details", "Details")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            exerciseManagementOpenDetails(exercise, "edit");
                          }}
                        >
                          {t("admin.exercises.actions.edit", "Bearbeiten")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            const target = applyMergeSelection(exercise.id);
                            toast({
                              title: t(
                                "admin.exercises.merge.toastTitle",
                                target === "target" ? "Ziel gesetzt" : "Quelle gesetzt"
                              ),
                              description: t(
                                "admin.exercises.merge.toastDescription",
                                {
                                  name: exercise.name,
                                  defaultValue:
                                    target === "target"
                                      ? `${exercise.name} als Ziel‑Übung ausgewählt.`
                                      : `${exercise.name} als Quell‑Übung ausgewählt.`,
                                }
                              ),
                            });
                            handleMergeSectionOpen();
                          }}
                        >
                          {t("admin.exercises.actions.merge", "Zusammenführen")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(event) => {
                            event.preventDefault();
                            handleDeleteExercise(exercise.id);
                          }}
                        >
                          {t("admin.exercises.actions.delete", "Löschen")}
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
                        {detailExercise?.name || t("exerciseLibrary.details", "Übung")}
                      </DialogTitle>
                      <DialogDescription className="sr-only">
                        {t("exerciseLibrary.details", "Übung")}
                      </DialogDescription>
                      {exerciseDialogMode === "view" && (
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
                      <Button variant={exerciseDialogMode === "view" ? "default" : "outline"} onClick={() => setExerciseDialogMode("view")}>
                        {t("exerciseLibrary.details", "Details")}
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
                        defaultDistanceUnit={primaryDistanceUnit}
                        distanceUnitOptions={distanceUnitOptions}
                        defaultTimeUnit="min"
                      />
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <div ref={moderationReportsRef}>
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
                                {report.description || report.details || "-"}
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
            </div>

            <div ref={moderationEditsRef}>
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
                                      const exercise = exerciseMap.get(request.exerciseId);
                                      const exerciseRecord = exercise
                                        ? (exercise as unknown as Record<string, unknown>)
                                        : undefined;
                                      const oldValue =
                                        exerciseRecord && key in exerciseRecord
                                          ? formatChangeValue(exerciseRecord[key])
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
            </div>
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
                <div ref={monitoringJobsRef}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("admin.monitoring.jobs.title", "Job-Status")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {monitoringJobs.stuckJobs.length > 0 && (
                        <div ref={monitoringStuckRef}>
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {t("admin.monitoring.jobs.stuck", {
                                count: monitoringJobs.stuckJobs.length,
                                defaultValue: `${monitoringJobs.stuckJobs.length} stuck job(s) gefunden`,
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
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {monitoringJobs.stats.map((stat: MonitoringJobStat) => (
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
                                {formatDateTime(stat.last_run)}
                              </p>
                            )}
                          </div>
                        ))}
                        {monitoringJobs.stats.length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            {t("admin.monitoring.jobs.empty", "Keine Job-Statistiken verfügbar.")}
                          </div>
                        )}
                      </div>

                      {monitoringJobs.recentFailures.length > 0 && (
                        <div ref={monitoringFailuresRef} className="mt-4">
                          <h4 className="font-semibold mb-2">
                            {t("admin.monitoring.jobs.recentFailures", "Fehler der letzten 7 Tage")}
                          </h4>
                          <div className="space-y-2">
                            {monitoringJobs.recentFailures.map(
                              (failure: MonitoringJobFailure) => (
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
                </div>

                {/* Email Queue Stats */}
                <div ref={monitoringEmailsRef}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("admin.monitoring.emails.title", "E-Mail-Warteschlange")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {monitoringEmails.stats.map((stat: MonitoringEmailStat) => {
                          const failedAfterRetries = Number(stat.failed_after_retries ?? 0);
                          const showFailedAfterRetries =
                            stat.status === "failed" && failedAfterRetries > 0;
                          const failedAfterRetriesLabel = t(
                            "admin.monitoring.emails.stats.failedAfterRetries",
                            `${failedAfterRetries} nach Retries`,
                            { count: failedAfterRetries }
                          );

                          return (
                            <div key={stat.status} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{stat.status}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {showFailedAfterRetries
                                      ? failedAfterRetriesLabel
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
                          );
                        })}
                        {monitoringEmails.stats.length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            {t("admin.monitoring.emails.empty", "Keine E-Mail-Statistiken verfügbar.")}
                          </div>
                        )}
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
                              {monitoringEmails.recent
                                .slice(0, 10)
                                .map((email: MonitoringEmailEntry) => (
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
                                      {formatDateTime(email.createdAt)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {!monitoringData && !isLoadingMonitoring && null}
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
