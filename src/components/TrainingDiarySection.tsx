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
import { Calendar } from "./ui/calendar";

interface TrainingDiarySectionProps {
  className?: string;
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

const moodOptions: Array<{ value: TrainingJournalMood; label: string; helper: string; emoji: string }> = [
  { value: "energized", label: "Energiegeladen", helper: "Höchste Leistungsfähigkeit", emoji: "⚡" },
  { value: "balanced", label: "Ausgeglichen", helper: "Stabil und fokussiert", emoji: "🙂" },
  { value: "tired", label: "Müde", helper: "Leichte Müdigkeit vorhanden", emoji: "😴" },
  { value: "sore", label: "Muskelkater", helper: "Erholung notwendig", emoji: "💢" },
  { value: "stressed", label: "Gestresst", helper: "Achte auf Regeneration", emoji: "⚠️" },
];

const filterMoodOptions = [
  { value: "all", label: "Alle Stimmungen" },
  ...moodOptions.map(({ value, label }) => ({ value, label })),
];

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

export function TrainingDiarySection({ className }: TrainingDiarySectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const locale = useMemo(() => (user?.languagePreference === "en" ? enUS : de), [user?.languagePreference]);

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
      const parsed = new Date(dateString);
      if (Number.isNaN(parsed.getTime())) return dateString;
      return format(parsed, "PPP", { locale });
    },
    [locale],
  );

  const fetchRecentWorkouts = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/recent-workouts`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Fehler beim Laden der Workouts");
      }

      const data = await response.json();
      const options: RecentWorkoutOption[] = Array.isArray(data.workouts)
        ? (data.workouts
          .map((workout: Record<string, unknown>) => {
            const id = typeof workout.id === "string" ? workout.id : null;
            if (!id) return null;

            const title = typeof workout.title === "string" ? workout.title : "Workout";
            const workoutDate =
              typeof workout.workoutDate === "string"
                ? workout.workoutDate
                : typeof workout.createdAt === "string"
                  ? workout.createdAt
                  : undefined;

            return { id, title, workoutDate } satisfies RecentWorkoutOption;
          })
          .filter(Boolean) as RecentWorkoutOption[])
        : [];
      setRecentWorkouts(options);
    } catch (error) {
      console.error("Recent workouts error:", error);
    }
  }, [user]);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/training-journal/summary`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Fehler beim Laden der Zusammenfassung");
      }

      const data = await response.json();
      setSummary({
        moodDistribution: Array.isArray(data.moodDistribution) ? data.moodDistribution : [],
        topTags: Array.isArray(data.topTags) ? data.topTags : [],
        latestEntry: data.latestEntry ?? null,
        totalEntries: data.totalEntries ?? 0,
        avgEnergyLevel: data.avgEnergyLevel ?? null,
        avgFocusLevel: data.avgFocusLevel ?? null,
        avgSleepQuality: data.avgSleepQuality ?? null,
        avgSorenessLevel: data.avgSorenessLevel ?? null,
        avgPerceivedExertion: data.avgPerceivedExertion ?? null,
        firstEntry: data.firstEntry ?? null,
        lastEntry: data.lastEntry ?? null,
      });
    } catch (error) {
      console.error("Training journal summary error:", error);
    }
  }, [user]);

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
          throw new Error("Fehler beim Laden des Trainingstagebuchs");
        }

        const data: JournalApiResponse = await response.json();
        setEntries(Array.isArray(data.entries) ? data.entries : []);
        setPagination(data.pagination ?? DEFAULT_PAGINATION);
        setCurrentPage(page);
      } catch (error) {
        console.error("Load training journal error:", error);
        toast({
          title: "Fehler",
          description: "Das Trainingstagebuch konnte nicht geladen werden.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, filterMood, filterStartDate, filterEndDate, searchFilter, toast],
  );

  useEffect(() => {
    if (!user) return;
    loadEntries(1);
    loadSummary();
    fetchRecentWorkouts();
  }, [user, loadEntries, loadSummary, fetchRecentWorkouts]);

  useEffect(() => {
    if (!user) return;
    setCurrentPage(1);
    loadEntries(1);
  }, [filterMood, filterStartDate, filterEndDate, searchFilter, user, loadEntries]);

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
        const errorBody = await response.json().catch(() => ({ error: "Unbekannter Fehler" }));
        throw new Error(errorBody.error ?? "Fehler beim Speichern des Eintrags");
      }

      await loadEntries(editingEntry ? currentPage : 1);
      await loadSummary();
      resetForm();

      toast({
        title: editingEntry ? "Eintrag aktualisiert" : "Eintrag gespeichert",
        description: editingEntry
          ? "Der Trainingstagebuch-Eintrag wurde aktualisiert."
          : "Der Trainingstagebuch-Eintrag wurde hinzugefügt.",
      });
    } catch (error) {
      console.error("Save training journal entry error:", error);
      const message = error instanceof Error ? error.message : "Der Eintrag konnte nicht gespeichert werden.";
      toast({
        title: "Fehler",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: TrainingJournalEntry) => {
    setEditingEntry(entry);
    setEntryDate(new Date(entry.entryDate));
    setMood(entry.mood);
    setEnergyLevel(entry.energyLevel ? String(entry.energyLevel) : "");
    setFocusLevel(entry.focusLevel ? String(entry.focusLevel) : "");
    setSleepQuality(entry.sleepQuality ? String(entry.sleepQuality) : "");
    setSorenessLevel(entry.sorenessLevel ? String(entry.sorenessLevel) : "");
    setPerceivedExertion(entry.perceivedExertion ? String(entry.perceivedExertion) : "");
    setNotes(entry.notes ?? "");
    setTagsInput(entry.tags.join(", "));
    setWorkoutId(entry.workoutId ?? "none");
    setSleepDuration(entry.metrics?.sleepDurationHours ? String(entry.metrics.sleepDurationHours) : "");
    setRestingHeartRate(entry.metrics?.restingHeartRate ? String(entry.metrics.restingHeartRate) : "");
    setHydrationLevel(entry.metrics?.hydrationLevel ? String(entry.metrics.hydrationLevel) : "");
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    const confirmed = window.confirm("Möchtest du diesen Eintrag wirklich löschen?");
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
        const errorBody = await response.json().catch(() => ({ error: "Unbekannter Fehler" }));
        throw new Error(errorBody.error ?? "Der Eintrag konnte nicht gelöscht werden.");
      }

      toast({
        title: "Eintrag gelöscht",
        description: "Der Trainingstagebuch-Eintrag wurde entfernt.",
      });

      await loadEntries(currentPage);
      await loadSummary();
      resetForm();
    } catch (error) {
      console.error("Delete training journal entry error:", error);
      const message = error instanceof Error ? error.message : "Der Eintrag konnte nicht gelöscht werden.";
      toast({
        title: "Fehler",
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
              Trainingstagebuch
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Dokumentiere Tagesform, Regeneration und persönliche Notizen für deine Einheiten.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleResetFilters} title="Filter zurücksetzen">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        {summary && (
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Einträge</p>
              <p className="text-lg font-semibold">{summary.totalEntries ?? 0}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ø Energie</p>
              <p className="text-lg font-semibold">{formatScaleValue(summary.avgEnergyLevel)}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ø Fokus</p>
              <p className="text-lg font-semibold">{formatScaleValue(summary.avgFocusLevel)}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ø Schlafqualität</p>
              <p className="text-lg font-semibold">{formatScaleValue(summary.avgSleepQuality)}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ø Muskelkater</p>
              <p className="text-lg font-semibold">{formatScaleValue(summary.avgSorenessLevel)}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ø Belastung</p>
              <p className="text-lg font-semibold">{formatScaleValue(summary.avgPerceivedExertion)}</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-8 pt-4">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entry-date">Datum</Label>
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
                    {entryDate ? format(entryDate, "PPP", { locale }) : "Datum wählen"}
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
              <Label htmlFor="entry-mood">Stimmung</Label>
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
              <Label htmlFor="energy-level">Energielevel (1-10)</Label>
              <Input
                id="energy-level"
                type="number"
                min={1}
                max={10}
                value={energyLevel}
                onChange={(event) => setEnergyLevel(event.target.value)}
                placeholder="z. B. 8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="focus-level">Fokus (1-10)</Label>
              <Input
                id="focus-level"
                type="number"
                min={1}
                max={10}
                value={focusLevel}
                onChange={(event) => setFocusLevel(event.target.value)}
                placeholder="z. B. 7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep-quality">Schlafqualität (1-10)</Label>
              <Input
                id="sleep-quality"
                type="number"
                min={1}
                max={10}
                value={sleepQuality}
                onChange={(event) => setSleepQuality(event.target.value)}
                placeholder="z. B. 6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soreness-level">Muskelkater (0-10)</Label>
              <Input
                id="soreness-level"
                type="number"
                min={0}
                max={10}
                value={sorenessLevel}
                onChange={(event) => setSorenessLevel(event.target.value)}
                placeholder="z. B. 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perceived-exertion">Belastungsempfinden (1-10)</Label>
              <Input
                id="perceived-exertion"
                type="number"
                min={1}
                max={10}
                value={perceivedExertion}
                onChange={(event) => setPerceivedExertion(event.target.value)}
                placeholder="z. B. 8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workout-reference">Workout-Verknüpfung</Label>
              <Select value={workoutId} onValueChange={(value) => setWorkoutId(value)}>
                <SelectTrigger id="workout-reference">
                  <SelectValue placeholder="Optional verknüpfen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Workout verknüpft</SelectItem>
                  {recentWorkouts.map((workout) => (
                    <SelectItem key={workout.id} value={workout.id}>
                      <span className="flex flex-col text-sm">
                        <span className="font-medium">{workout.title}</span>
                        {workout.workoutDate && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(workout.workoutDate)}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep-duration">Schlafdauer (Stunden)</Label>
              <Input
                id="sleep-duration"
                type="number"
                min={0}
                step="0.25"
                value={sleepDuration}
                onChange={(event) => setSleepDuration(event.target.value)}
                placeholder="z. B. 7.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resting-hr">Ruhepuls (bpm)</Label>
              <Input
                id="resting-hr"
                type="number"
                min={0}
                value={restingHeartRate}
                onChange={(event) => setRestingHeartRate(event.target.value)}
                placeholder="z. B. 54"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hydration-level">Hydration (1-10)</Label>
              <Input
                id="hydration-level"
                type="number"
                min={1}
                max={10}
                value={hydrationLevel}
                onChange={(event) => setHydrationLevel(event.target.value)}
                placeholder="z. B. 8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-tags">Tags</Label>
            <Input
              id="entry-tags"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="z. B. regeneration, intensität, fokus"
            />
            <p className="text-xs text-muted-foreground">Mehrere Tags mit Komma trennen. Maximal 10 Tags pro Eintrag.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-notes">Notizen</Label>
            <Textarea
              id="entry-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Wie hast du dich gefühlt? Was lief gut, was weniger?"
              rows={4}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {editingEntry && (
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                <X className="mr-2 h-4 w-4" />
                Bearbeitung abbrechen
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {editingEntry ? "Eintrag aktualisieren" : "Eintrag speichern"}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="filter-mood">Stimmung</Label>
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
              <Label htmlFor="filter-start">Von</Label>
              <Input
                id="filter-start"
                type="date"
                value={filterStartDate}
                onChange={(event) => setFilterStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-end">Bis</Label>
              <Input
                id="filter-end"
                type="date"
                value={filterEndDate}
                onChange={(event) => setFilterEndDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-search">Suche</Label>
              <Input
                id="filter-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tags oder Notizen durchsuchen"
              />
            </div>
          </div>

          {summary && (summary.moodDistribution.length > 0 || summary.topTags.length > 0) && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Trends
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Stimmungsverteilung</p>
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
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Beliebte Tags</p>
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
              Noch keine Einträge im Trainingstagebuch vorhanden.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const currentMood = moodOptions.find((m) => m.value === entry.mood);
                return (
                  <div key={entry.id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {currentMood?.emoji ?? ""} {currentMood?.label ?? entry.mood}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">{formatDate(entry.entryDate)}</span>
                          {entry.workoutId && (
                            <Badge variant="outline" className="text-xs">
                              Workout #{entry.workoutId.slice(0, 8)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>⚡ Energie: {formatScaleValue(entry.energyLevel)}</span>
                          <span>🎯 Fokus: {formatScaleValue(entry.focusLevel)}</span>
                          <span>🛌 Schlaf: {formatScaleValue(entry.sleepQuality)}</span>
                          <span>💥 Muskelkater: {formatScaleValue(entry.sorenessLevel)}</span>
                          <span>📈 Belastung: {formatScaleValue(entry.perceivedExertion)}</span>
                          {typeof entry.metrics?.sleepDurationHours === "number" && (
                            <span>🕒 Schlafdauer: {formatNumber(entry.metrics.sleepDurationHours)} h</span>
                          )}
                          {typeof entry.metrics?.restingHeartRate === "number" && (
                            <span>❤️ Ruhepuls: {Math.round(entry.metrics.restingHeartRate)} bpm</span>
                          )}
                          {typeof entry.metrics?.hydrationLevel === "number" && (
                            <span>💧 Hydration: {formatScaleValue(entry.metrics.hydrationLevel)}</span>
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
                          Bearbeiten
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                          Löschen
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
                    Zurück
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Seite {pagination.currentPage} von {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadEntries(currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Weiter
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
