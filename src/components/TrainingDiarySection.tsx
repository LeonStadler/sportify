import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TrainingJournalEntry, TrainingJournalMood, TrainingJournalSummary } from "@/types/training-journal";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { CalendarIcon, NotebookPen, RefreshCcw, Save, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "./ui/calendar";

interface TrainingDiarySectionProps {
  className?: string;
  preselectedWorkoutId?: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface JournalApiResponse {
  entries: TrainingJournalEntry[];
  pagination: PaginationState;
}

interface RecentWorkoutOption {
  id: string;
  title: string;
  workoutDate?: string;
}

// Diese werden innerhalb der Komponente mit useTranslation erstellt

const DEFAULT_PAGINATION: PaginationState = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasNext: false,
  hasPrev: false,
};

const formatNumber = (value?: number | null) =>
  typeof value === "number" && !Number.isNaN(value) ? value.toFixed(1).replace(/\.0$/, "") : "–";

const formatScaleValue = (value?: number | null) =>
  typeof value === "number" && !Number.isNaN(value) ? `${value}/10` : "–";

export function TrainingDiarySection({ className, preselectedWorkoutId }: TrainingDiarySectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const locale = useMemo(() => (i18n.language === 'en' ? enUS : de), [i18n.language]);

  const moodOptions: Array<{ value: TrainingJournalMood; label: string; helper: string; emoji: string }> = useMemo(() => [
    { value: "energized", label: t('recoveryDiary.moods.energized'), helper: t('recoveryDiary.moods.energizedHelper'), emoji: "⚡" },
    { value: "balanced", label: t('recoveryDiary.moods.balanced'), helper: t('recoveryDiary.moods.balancedHelper'), emoji: "🙂" },
    { value: "tired", label: t('recoveryDiary.moods.tired'), helper: t('recoveryDiary.moods.tiredHelper'), emoji: "😴" },
    { value: "sore", label: t('recoveryDiary.moods.sore'), helper: t('recoveryDiary.moods.soreHelper'), emoji: "💢" },
    { value: "stressed", label: t('recoveryDiary.moods.stressed'), helper: t('recoveryDiary.moods.stressedHelper'), emoji: "⚠️" },
    { value: "motivated", label: t('recoveryDiary.moods.motivated'), helper: t('recoveryDiary.moods.motivatedHelper'), emoji: "🔥" },
    { value: "relaxed", label: t('recoveryDiary.moods.relaxed'), helper: t('recoveryDiary.moods.relaxedHelper'), emoji: "😌" },
    { value: "excited", label: t('recoveryDiary.moods.excited'), helper: t('recoveryDiary.moods.excitedHelper'), emoji: "🎉" },
    { value: "focused", label: t('recoveryDiary.moods.focused'), helper: t('recoveryDiary.moods.focusedHelper'), emoji: "🎯" },
    { value: "frustrated", label: t('recoveryDiary.moods.frustrated'), helper: t('recoveryDiary.moods.frustratedHelper'), emoji: "😤" },
  ], [t]);

  const filterMoodOptions = useMemo(() => [
    { value: "all", label: t('recoveryDiary.moods.all') },
    ...moodOptions.map(({ value, label }) => ({ value, label })),
  ], [moodOptions, t]);
  const [entries, setEntries] = useState<TrainingJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState<TrainingJournalSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkoutOption[]>([]);
  const [editingEntry, setEditingEntry] = useState<TrainingJournalEntry | null>(null);

  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [mood, setMood] = useState<TrainingJournalMood>("balanced");
  const [energyLevel, setEnergyLevel] = useState<string>("");
  const [focusLevel, setFocusLevel] = useState<string>("");
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [sorenessLevel, setSorenessLevel] = useState<string>("");
  const [perceivedExertion, setPerceivedExertion] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [workoutId, setWorkoutId] = useState<string>("none");
  const [sleepDuration, setSleepDuration] = useState<string>("");
  const [restingHeartRate, setRestingHeartRate] = useState<string>("");
  const [hydrationLevel, setHydrationLevel] = useState<string>("");

  const [filterMood, setFilterMood] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [summaryPeriod, setSummaryPeriod] = useState<string>("week");

  // Finde das ausgewählte Workout für die Anzeige
  const selectedWorkout = useMemo(() => {
    if (!workoutId || workoutId === "none") return null;
    return recentWorkouts.find(w => w.id === workoutId) || null;
  }, [workoutId, recentWorkouts]);

  const resetForm = useCallback(() => {
    setEntryDate(new Date());
    setMood("balanced");
    setEnergyLevel("");
    setFocusLevel("");
    setSleepQuality("");
    setSorenessLevel("");
    setPerceivedExertion("");
    setNotes("");
    setTagsInput("");
    setWorkoutId("none");
    setSleepDuration("");
    setRestingHeartRate("");
    setHydrationLevel("");
    setEditingEntry(null);
  }, []);

  const formatDate = useCallback(
    (dateString?: string | null) => {
      if (!dateString) return "–";

      // Stelle sicher, dass dateString ein String ist
      const stringDate = typeof dateString === 'string' ? dateString : String(dateString);

      try {
        const parsed = new Date(stringDate);
        if (Number.isNaN(parsed.getTime())) {
          return "–";
        }
        return format(parsed, "PPP", { locale });
      } catch (error) {
        console.warn('Date formatting error:', error, 'Input:', dateString);
        return "–";
      }
    },
    [locale],
  );

  const fetchRecentWorkouts = useCallback(async () => {
    if (!user) return [];
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/recent-workouts`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!response.ok) {
        throw new Error(t('recoveryDiary.errors.loadWorkoutsError'));
      }

      const data = await response.json();
      // Unterstütze sowohl { workouts: [...] } als auch direktes Array für Kompatibilität
      const workoutsArray = Array.isArray(data) ? data : (Array.isArray(data.workouts) ? data.workouts : []);

      const options: RecentWorkoutOption[] = workoutsArray
        .map((workout: Record<string, unknown>) => {
          const id = typeof workout.id === "string" ? workout.id : null;
          if (!id) return null;

          const title = typeof workout.title === "string" ? workout.title : "Workout";
          const workoutDate =
            typeof workout.workoutDate === "string" && workout.workoutDate
              ? workout.workoutDate
              : typeof workout.createdAt === "string" && workout.createdAt
                ? workout.createdAt
                : undefined;

          return { id, title, workoutDate } satisfies RecentWorkoutOption;
        })
        .filter((item): item is RecentWorkoutOption => item !== null);

      setRecentWorkouts(options);
      return options;
    } catch (error) {
      console.error("Recent workouts error:", error);
      return [];
    }
  }, [user, t]);

  const loadSummary = useCallback(async (period: string = 'week') => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/training-journal/summary?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!response.ok) {
        throw new Error(t('recoveryDiary.errors.loadError'));
      }

      const data = await response.json();

      // Konvertiere die Durchschnittswerte zu Zahlen, falls sie als Strings kommen
      const parseNumber = (value: unknown): number | null => {
        if (value === null || value === undefined) return null;
        const num = typeof value === 'string' ? parseFloat(value) : Number(value);
        return !Number.isNaN(num) ? num : null;
      };

      setSummary({
        moodDistribution: Array.isArray(data.moodDistribution) ? data.moodDistribution : [],
        topTags: Array.isArray(data.topTags) ? data.topTags : [],
        latestEntry: data.latestEntry ?? null,
        totalEntries: data.totalEntries ?? 0,
        avgEnergyLevel: parseNumber(data.avgEnergyLevel),
        avgFocusLevel: parseNumber(data.avgFocusLevel),
        avgSleepQuality: parseNumber(data.avgSleepQuality),
        avgSorenessLevel: parseNumber(data.avgSorenessLevel),
        avgPerceivedExertion: parseNumber(data.avgPerceivedExertion),
        firstEntry: data.firstEntry ?? null,
        lastEntry: data.lastEntry ?? null,
      });
    } catch (error) {
      console.error("Training journal summary error:", error);
    }
  }, [user, t]);

  const loadEntries = useCallback(
    async (page = 1) => {
      if (!user) return;
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });

        if (filterMood !== "all") {
          params.set("mood", filterMood);
        }
        if (filterStartDate) {
          params.set("startDate", filterStartDate);
        }
        if (filterEndDate) {
          params.set("endDate", filterEndDate);
        }
        if (searchFilter) {
          params.set("search", searchFilter);
        }

        const response = await fetch(`${API_URL}/training-journal?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
        });

        if (!response.ok) {
          throw new Error(t('recoveryDiary.errors.loadError'));
        }

        const data: JournalApiResponse = await response.json();
        setEntries(Array.isArray(data.entries) ? data.entries : []);
        setPagination(data.pagination ?? DEFAULT_PAGINATION);
        setCurrentPage(page);
      } catch (error) {
        console.error("Load training journal error:", error);
        toast({
          title: t('common.error'),
          description: t('recoveryDiary.errors.loadErrorDescription'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, filterMood, filterStartDate, filterEndDate, searchFilter, toast, t],
  );

  useEffect(() => {
    if (!user) return;
    loadEntries(1);
    loadSummary(summaryPeriod);
    fetchRecentWorkouts();
  }, [user, loadEntries, fetchRecentWorkouts]);

  useEffect(() => {
    if (!user) return;
    loadSummary(summaryPeriod);
  }, [summaryPeriod, loadSummary, user]);

  // Setze das vorgewählte Workout, wenn es übergeben wurde
  useEffect(() => {
    if (preselectedWorkoutId && preselectedWorkoutId !== "none") {
      // Lade aktuelle Workouts neu, damit das neue Workout in der Liste verfügbar ist
      fetchRecentWorkouts().then((loadedWorkouts) => {
        // Prüfe ob das Workout in der geladenen Liste ist, wenn nicht, lade es direkt
        const workoutExists = loadedWorkouts.some(w => w.id === preselectedWorkoutId);
        if (!workoutExists) {
          const loadWorkout = async () => {
            try {
              const token = localStorage.getItem("token");
              const response = await fetch(`${API_URL}/workouts/${preselectedWorkoutId}`, {
                headers: {
                  Authorization: `Bearer ${token ?? ""}`,
                },
              });

              if (response.ok) {
                const workout = await response.json();
                // Füge das Workout zur Liste hinzu
                setRecentWorkouts(prev => {
                  // Prüfe ob es schon in der Liste ist
                  if (prev.some(w => w.id === workout.id)) {
                    return prev;
                  }
                  return [{
                    id: workout.id,
                    title: workout.title,
                    workoutDate: workout.workoutDate || workout.createdAt,
                  }, ...prev];
                });
              }
            } catch (error) {
              console.error('Error fetching workout:', error);
            }
          };
          loadWorkout().then(() => {
            setWorkoutId(preselectedWorkoutId);
          });
        } else {
          setWorkoutId(preselectedWorkoutId);
        }
      });
    }
  }, [preselectedWorkoutId, fetchRecentWorkouts]);

  useEffect(() => {
    if (!user) return;
    setCurrentPage(1);
    loadEntries(1);
  }, [filterMood, filterStartDate, filterEndDate, searchFilter, user, loadEntries]);

  // Lade fehlende Workouts für die Einträge
  useEffect(() => {
    if (!user || entries.length === 0) return;

    const loadMissingWorkouts = async () => {
      const workoutIds = entries
        .map(e => e.workoutId)
        .filter((id): id is string => id !== null && id !== undefined && id !== "none")
        .filter(id => !recentWorkouts.some(w => w.id === id));

      if (workoutIds.length === 0) return;

      const token = localStorage.getItem("token");
      const loadedWorkouts: RecentWorkoutOption[] = [];

      for (const workoutId of workoutIds) {
        try {
          const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
            headers: {
              Authorization: `Bearer ${token ?? ""}`,
            },
          });

          if (response.ok) {
            const workout = await response.json();
            loadedWorkouts.push({
              id: workout.id,
              title: workout.title,
              workoutDate: workout.workoutDate || workout.createdAt,
            });
          }
        } catch (error) {
          console.error(`Error fetching workout ${workoutId}:`, error);
        }
      }

      if (loadedWorkouts.length > 0) {
        setRecentWorkouts(prev => {
          const existingIds = new Set(prev.map(w => w.id));
          const newWorkouts = loadedWorkouts.filter(w => !existingIds.has(w.id));
          return [...newWorkouts, ...prev];
        });
      }
    };

    loadMissingWorkouts();
  }, [entries, recentWorkouts, user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchFilter(searchInput.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const payload: Record<string, unknown> = {
        entryDate: entryDate.toISOString().slice(0, 10),
        mood,
      };

      const toNumberOrNull = (value: string) => {
        if (!value) return null;
        const numeric = Number(value);
        return Number.isNaN(numeric) ? null : numeric;
      };

      payload.energyLevel = toNumberOrNull(energyLevel);
      payload.focusLevel = toNumberOrNull(focusLevel);
      payload.sleepQuality = toNumberOrNull(sleepQuality);
      payload.sorenessLevel = toNumberOrNull(sorenessLevel);
      payload.perceivedExertion = toNumberOrNull(perceivedExertion);
      payload.notes = notes.trim() ? notes.trim() : null;

      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      payload.tags = tags;

      if (workoutId && workoutId !== "none") {
        payload.workoutId = workoutId;
      }

      const metrics: Record<string, number> = {};
      const sleepDurationValue = toNumberOrNull(sleepDuration);
      if (typeof sleepDurationValue === "number") {
        metrics.sleepDurationHours = Number(sleepDurationValue.toFixed(2));
      }

      const restingHeartRateValue = toNumberOrNull(restingHeartRate);
      if (typeof restingHeartRateValue === "number") {
        metrics.restingHeartRate = Math.round(restingHeartRateValue);
      }

      const hydrationLevelValue = toNumberOrNull(hydrationLevel);
      if (typeof hydrationLevelValue === "number") {
        metrics.hydrationLevel = Math.round(hydrationLevelValue);
      }

      payload.metrics = metrics;

      const url = editingEntry
        ? `${API_URL}/training-journal/${editingEntry.id}`
        : `${API_URL}/training-journal`;

      const response = await fetch(url, {
        method: editingEntry ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: t('common.error') }));
        throw new Error(errorBody.error ?? t('recoveryDiary.errors.saveError'));
      }

      await loadEntries(editingEntry ? currentPage : 1);
      await loadSummary(summaryPeriod);
      resetForm();

      toast({
        title: editingEntry ? t('recoveryDiary.success.entryUpdated') : t('recoveryDiary.success.entrySaved'),
        description: editingEntry
          ? t('recoveryDiary.success.entryUpdatedDescription')
          : t('recoveryDiary.success.entrySavedDescription'),
      });
    } catch (error) {
      console.error("Save training journal entry error:", error);
      const message = error instanceof Error ? error.message : t('recoveryDiary.errors.saveErrorDescription');
      toast({
        title: t('common.error'),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (entry: TrainingJournalEntry) => {
    setEditingEntry(entry);

    // Parse Datum sicher - unterstütze verschiedene Formate
    try {
      let parsedDate: Date;
      if (typeof entry.entryDate === 'string') {
        // Wenn es im Format YYYY-MM-DD ist, parsen wir es direkt
        if (/^\d{4}-\d{2}-\d{2}$/.test(entry.entryDate)) {
          const [year, month, day] = entry.entryDate.split('-').map(Number);
          parsedDate = new Date(year, month - 1, day);
        } else {
          parsedDate = new Date(entry.entryDate);
        }

        // Prüfe ob das Datum gültig ist
        if (Number.isNaN(parsedDate.getTime())) {
          console.warn('Invalid date in entry:', entry.entryDate);
          parsedDate = new Date();
        }
      } else {
        parsedDate = new Date(entry.entryDate);
        if (Number.isNaN(parsedDate.getTime())) {
          parsedDate = new Date();
        }
      }
      setEntryDate(parsedDate);
    } catch (error) {
      console.error('Error parsing date:', error, entry.entryDate);
      setEntryDate(new Date());
    }

    setMood(entry.mood);
    setEnergyLevel(entry.energyLevel ? String(entry.energyLevel) : "");
    setFocusLevel(entry.focusLevel ? String(entry.focusLevel) : "");
    setSleepQuality(entry.sleepQuality ? String(entry.sleepQuality) : "");
    setSorenessLevel(entry.sorenessLevel ? String(entry.sorenessLevel) : "");
    setPerceivedExertion(entry.perceivedExertion ? String(entry.perceivedExertion) : "");
    setNotes(entry.notes ?? "");
    setTagsInput(entry.tags.join(", "));

    // Wenn ein Workout verknüpft ist, lade es explizit falls es nicht in recentWorkouts ist
    if (entry.workoutId && entry.workoutId !== "none") {
      await fetchRecentWorkouts();

      // Prüfe ob das Workout in der Liste ist, wenn nicht, lade es direkt
      const workoutExists = recentWorkouts.some(w => w.id === entry.workoutId);
      if (!workoutExists) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/workouts/${entry.workoutId}`, {
            headers: {
              Authorization: `Bearer ${token ?? ""}`,
            },
          });

          if (response.ok) {
            const workout = await response.json();
            // Füge das Workout zur Liste hinzu
            setRecentWorkouts(prev => {
              // Prüfe ob es schon in der Liste ist
              if (prev.some(w => w.id === workout.id)) {
                return prev;
              }
              return [{
                id: workout.id,
                title: workout.title,
                workoutDate: workout.workoutDate || workout.createdAt,
              }, ...prev];
            });
          }
        } catch (error) {
          console.error('Error fetching workout:', error);
        }
      }

      setWorkoutId(entry.workoutId);
    } else {
      setWorkoutId("none");
    }

    setSleepDuration(entry.metrics?.sleepDurationHours ? String(entry.metrics.sleepDurationHours) : "");
    setRestingHeartRate(entry.metrics?.restingHeartRate ? String(entry.metrics.restingHeartRate) : "");
    setHydrationLevel(entry.metrics?.hydrationLevel ? String(entry.metrics.hydrationLevel) : "");

    // Scroll zum Formular
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    const confirmed = window.confirm(t('recoveryDiary.errors.deleteConfirm'));
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/training-journal/${entryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: t('common.error') }));
        throw new Error(errorBody.error ?? t('recoveryDiary.errors.deleteErrorDescription'));
      }

      toast({
        title: t('recoveryDiary.success.entryDeleted'),
        description: t('recoveryDiary.success.entryDeletedDescription'),
      });

      await loadEntries(currentPage);
      await loadSummary(summaryPeriod);
      resetForm();
    } catch (error) {
      console.error("Delete training journal entry error:", error);
      const message = error instanceof Error ? error.message : t('recoveryDiary.errors.deleteErrorDescription');
      toast({
        title: t('common.error'),
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleResetFilters = () => {
    setFilterMood("all");
    setFilterStartDate("");
    setFilterEndDate("");
    setSearchInput("");
    setSearchFilter("");
  };

  if (!user) {
    return null;
  }

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-col gap-2 border-b pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <NotebookPen className="h-5 w-5 text-primary" />
              {t('recoveryDiary.title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('recoveryDiary.subtitle')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleResetFilters} title={t('recoveryDiary.resetFilters')}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

      </CardHeader>

      <CardContent className="space-y-8 pt-4">
        {/* Summary Statistics mit Zeitraum-Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-foreground">{t('recoveryDiary.statistics')}</h3>
            <Select value={summaryPeriod} onValueChange={(value) => setSummaryPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{t('recoveryDiary.period.week')}</SelectItem>
                <SelectItem value="month">{t('recoveryDiary.period.month')}</SelectItem>
                <SelectItem value="quarter">{t('recoveryDiary.period.quarter')}</SelectItem>
                <SelectItem value="year">{t('recoveryDiary.period.year')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {summary && (
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 xl:grid-cols-6">
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('recoveryDiary.entries')}</p>
                <p className="text-lg font-semibold">{summary.totalEntries ?? 0}</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('recoveryDiary.avgEnergy')}</p>
                <p className="text-lg font-semibold">{formatScaleValue(summary.avgEnergyLevel)}</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('recoveryDiary.avgFocus')}</p>
                <p className="text-lg font-semibold">{formatScaleValue(summary.avgFocusLevel)}</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('recoveryDiary.avgSleep')}</p>
                <p className="text-lg font-semibold">{formatScaleValue(summary.avgSleepQuality)}</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('recoveryDiary.avgSoreness')}</p>
                <p className="text-lg font-semibold">{formatScaleValue(summary.avgSorenessLevel)}</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('recoveryDiary.avgExertion')}</p>
                <p className="text-lg font-semibold">{formatScaleValue(summary.avgPerceivedExertion)}</p>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entry-date">{t('recoveryDiary.date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="entry-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !entryDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "PPP", { locale }) : t('recoveryDiary.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={(date) => date && setEntryDate(date)}
                    initialFocus
                    locale={locale}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-mood">{t('recoveryDiary.mood')}</Label>
              <Select value={mood} onValueChange={(value: TrainingJournalMood) => setMood(value)}>
                <SelectTrigger id="entry-mood">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex flex-col text-sm">
                        <span className="font-medium">
                          {option.emoji} {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{option.helper}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="energy-level">{t('recoveryDiary.energyLevel')}</Label>
              <Input
                id="energy-level"
                type="number"
                min={1}
                max={10}
                value={energyLevel}
                onChange={(event) => setEnergyLevel(event.target.value)}
                placeholder={t('recoveryDiary.placeholders.energy')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="focus-level">{t('recoveryDiary.focusLevel')}</Label>
              <Input
                id="focus-level"
                type="number"
                min={1}
                max={10}
                value={focusLevel}
                onChange={(event) => setFocusLevel(event.target.value)}
                placeholder={t('recoveryDiary.placeholders.focus')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep-quality">{t('recoveryDiary.sleepQuality')}</Label>
              <Input
                id="sleep-quality"
                type="number"
                min={1}
                max={10}
                value={sleepQuality}
                onChange={(event) => setSleepQuality(event.target.value)}
                placeholder={t('recoveryDiary.placeholders.sleep')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soreness-level">{t('recoveryDiary.sorenessLevel')}</Label>
              <Input
                id="soreness-level"
                type="number"
                min={0}
                max={10}
                value={sorenessLevel}
                onChange={(event) => setSorenessLevel(event.target.value)}
                placeholder={t('recoveryDiary.placeholders.soreness')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perceived-exertion">{t('recoveryDiary.perceivedExertion')}</Label>
              <Input
                id="perceived-exertion"
                type="number"
                min={1}
                max={10}
                value={perceivedExertion}
                onChange={(event) => setPerceivedExertion(event.target.value)}
                placeholder={t('recoveryDiary.placeholders.exertion')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workout-reference">{t('recoveryDiary.workoutLink')}</Label>
              <Select value={workoutId} onValueChange={(value) => setWorkoutId(value)}>
                <SelectTrigger id="workout-reference" className="h-auto min-h-10 py-2 items-start [&>span]:line-clamp-none">
                  <SelectValue placeholder={t('recoveryDiary.workoutLinkPlaceholder')}>
                    {selectedWorkout ? (
                      <div className="flex flex-col text-left w-full">
                        <span className="font-medium break-words whitespace-normal">{selectedWorkout.title}</span>
                        {selectedWorkout.workoutDate && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(selectedWorkout.workoutDate)}
                          </span>
                        )}
                      </div>
                    ) : workoutId === "none" ? (
                      <span>{t('recoveryDiary.noWorkout')}</span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('recoveryDiary.noWorkout')}</SelectItem>
                  {recentWorkouts.map((workout) => (
                    <SelectItem key={workout.id} value={workout.id}>
                      <div className="flex flex-col">
                        <span>{workout.title}</span>
                        {workout.workoutDate && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(workout.workoutDate)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep-duration">{t('recoveryDiary.sleepDuration')}</Label>
              <Input
                id="sleep-duration"
                type="number"
                min={0}
                step="0.25"
                value={sleepDuration}
                onChange={(event) => setSleepDuration(event.target.value)}
                placeholder={t('recoveryDiary.placeholders.sleepDuration')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resting-hr">{t('recoveryDiary.restingHeartRate')}</Label>
              <Input
                id="resting-hr"
                type="number"
                min={0}
                value={restingHeartRate}
                onChange={(event) => setRestingHeartRate(event.target.value)}
                placeholder={t('recoveryDiary.placeholders.heartRate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hydration-level">{t('recoveryDiary.hydrationLevel')}</Label>
              <Input
                id="hydration-level"
                type="number"
                min={1}
                max={10}
                value={hydrationLevel}
                onChange={(event) => setHydrationLevel(event.target.value)}
                placeholder={t('recoveryDiary.placeholders.hydration')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-tags">{t('recoveryDiary.tags')}</Label>
            <Input
              id="entry-tags"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder={t('recoveryDiary.tagsPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">{t('recoveryDiary.tagsHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-notes">{t('recoveryDiary.notes')}</Label>
            <Textarea
              id="entry-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t('recoveryDiary.notesPlaceholder')}
              rows={4}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {editingEntry && (
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                <X className="mr-2 h-4 w-4" />
                {t('recoveryDiary.cancelEdit')}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {editingEntry ? t('recoveryDiary.update') : t('recoveryDiary.save')}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="filter-mood">{t('recoveryDiary.filterMood')}</Label>
              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger id="filter-mood">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterMoodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-start">{t('recoveryDiary.filterStart')}</Label>
              <Input
                id="filter-start"
                type="date"
                value={filterStartDate}
                onChange={(event) => setFilterStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-end">{t('recoveryDiary.filterEnd')}</Label>
              <Input
                id="filter-end"
                type="date"
                value={filterEndDate}
                onChange={(event) => setFilterEndDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-search">{t('recoveryDiary.filterSearch')}</Label>
              <Input
                id="filter-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('recoveryDiary.filterSearchPlaceholder')}
              />
            </div>
          </div>

          {summary && (summary.moodDistribution.length > 0 || summary.topTags.length > 0) && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                {t('recoveryDiary.trends')}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('recoveryDiary.moodDistribution')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.moodDistribution.map((item) => {
                      const option = moodOptions.find((m) => m.value === item.mood);
                      return (
                        <Badge key={item.mood} variant="secondary" className="text-xs">
                          {option?.emoji ?? ""} {option?.label ?? item.mood} ({item.count})
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('recoveryDiary.popularTags')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.topTags.map((tag) => (
                      <Badge key={tag.tag} variant="outline" className="text-xs">
                        #{tag.tag} ({tag.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              {t('recoveryDiary.noEntries')}
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const currentMood = moodOptions.find((m) => m.value === entry.mood);
                const entryWorkout = entry.workoutId ? recentWorkouts.find(w => w.id === entry.workoutId) : null;
                return (
                  <div key={entry.id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {currentMood?.emoji ?? ""} {currentMood?.label ?? entry.mood}
                          </Badge>
                          <span className="text-sm font-semibold text-foreground">{formatDate(entry.entryDate)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {entry.workoutId ? (
                            <Badge variant="outline" className="text-xs flex flex-row items-center justify-between gap-2 px-2 py-1">
                              <span className="font-medium">{entryWorkout ? entryWorkout.title : `Workout #${entry.workoutId.slice(0, 8)}`}</span>
                              {entryWorkout?.workoutDate && (
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  {formatDate(entryWorkout.workoutDate)}
                                </span>
                              )}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              {t('recoveryDiary.noWorkout')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{t('recoveryDiary.metrics.energy')}: {formatScaleValue(entry.energyLevel)}</span>
                          <span>{t('recoveryDiary.metrics.focus')}: {formatScaleValue(entry.focusLevel)}</span>
                          <span>{t('recoveryDiary.metrics.sleep')}: {formatScaleValue(entry.sleepQuality)}</span>
                          <span>{t('recoveryDiary.metrics.soreness')}: {formatScaleValue(entry.sorenessLevel)}</span>
                          <span>{t('recoveryDiary.metrics.exertion')}: {formatScaleValue(entry.perceivedExertion)}</span>
                          {typeof entry.metrics?.sleepDurationHours === "number" && (
                            <span>{t('recoveryDiary.metrics.sleepDuration')}: {formatNumber(entry.metrics.sleepDurationHours)} h</span>
                          )}
                          {typeof entry.metrics?.restingHeartRate === "number" && (
                            <span>{t('recoveryDiary.metrics.heartRate')}: {Math.round(entry.metrics.restingHeartRate)} bpm</span>
                          )}
                          {typeof entry.metrics?.hydrationLevel === "number" && (
                            <span>{t('recoveryDiary.metrics.hydration')}: {formatScaleValue(entry.metrics.hydrationLevel)}</span>
                          )}
                        </div>
                        {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                          {t('recoveryDiary.edit')}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                          {t('recoveryDiary.delete')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadEntries(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    {t('recoveryDiary.previous')}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {t('recoveryDiary.page')} {pagination.currentPage} {t('recoveryDiary.of')} {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadEntries(currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    {t('recoveryDiary.next')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
