import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Edit,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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

export function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseReports, setExerciseReports] = useState<ExerciseReport[]>([]);
  const [exerciseEditRequests, setExerciseEditRequests] = useState<ExerciseEditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    id: "",
    name: "",
    pointsPerUnit: 1,
    unit: "reps",
    hasWeight: false,
    hasSetMode: true,
    isActive: true,
  });
  const [scoringQuery, setScoringQuery] = useState("");
  const [scoringCategory, setScoringCategory] = useState("all");
  const [scoringStatus, setScoringStatus] = useState("all");
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");

  const exerciseMap = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  const scoringCategories = useMemo(() => {
    const values = exercises
      .map((exercise) => exercise.category)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values));
  }, [exercises]);

  const filteredScoringExercises = useMemo(() => {
    const query = scoringQuery.trim().toLowerCase();
    return exercises.filter((exercise) => {
      if (scoringCategory !== "all" && exercise.category !== scoringCategory) {
        return false;
      }
      if (scoringStatus !== "all") {
        const isActive = exercise.isActive === true;
        if (scoringStatus === "active" && !isActive) return false;
        if (scoringStatus === "inactive" && isActive) return false;
      }
      if (!query) return true;
      return (
        exercise.name.toLowerCase().includes(query) ||
        exercise.id.toLowerCase().includes(query)
      );
    });
  }, [exercises, scoringCategory, scoringQuery, scoringStatus]);

  const formatChangeValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Ja" : "Nein";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const changeKeyLabels: Record<string, string> = {
    name: "Name",
    description: "Beschreibung",
    category: "Kategorie",
    discipline: "Disziplin",
    movementPattern: "Movement",
    measurementType: "Messung",
    requiresWeight: "Gewicht erforderlich",
    allowsWeight: "Gewicht optional",
    supportsSets: "Sets/Reps",
    supportsTime: "Zeit",
    supportsDistance: "Distanz",
    supportsGrade: "Route",
    difficultyTier: "Schwierigkeit",
    muscleGroups: "Muskelgruppen",
    equipment: "Equipment",
    unitOptions: "Einheiten",
  };

  const MergeDialog = ({ sourceId }: { sourceId: string }) => {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState("");

    useEffect(() => {
      if (!open) {
        setTargetId("");
      }
    }, [open]);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Merge
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Übung zusammenführen</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Ziel-Übung</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Ziel wählen" />
              </SelectTrigger>
              <SelectContent>
                {exercises
                  .filter((item) => item.id !== sourceId)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Alle Aktivitäten werden auf die Ziel‑Übung umgehängt.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button
              disabled={!targetId}
              onClick={async () => {
                await handleMergeExercise(sourceId, targetId);
                setOpen(false);
              }}
            >
              Zusammenführen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        throw new Error(errorData.error || "Merge fehlgeschlagen.");
      }
      toast({
        title: "Merge erfolgreich",
        description: "Die Übung wurde zusammengeführt.",
      });
      await loadExercises();
    } catch (error) {
      toast({
        title: "Fehler",
        description:
          error instanceof Error ? error.message : "Merge fehlgeschlagen.",
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
        title: "Fehler",
        description: "Fehler beim Laden der Monitoring-Daten",
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
          title: "Erfolg",
          description: "Stuck Jobs wurden bereinigt",
        });
        await loadMonitoringData();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Cleanup der Jobs",
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
      ]);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Admin-Daten",
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

  // Prüfe Admin-Rechte
  if (user?.role !== "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Zugriff verweigert</h2>
              <p className="text-muted-foreground">
                Sie haben keine Berechtigung, auf den Admin-Bereich zuzugreifen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !exerciseForm.name ||
      exerciseForm.pointsPerUnit <= 0
    ) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle erforderlichen Felder aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/exercises`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: exerciseForm.id
            ? exerciseForm.id.toLowerCase().replace(/\s+/g, "-")
            : undefined,
          name: exerciseForm.name,
          pointsPerUnit: exerciseForm.pointsPerUnit,
          unit: exerciseForm.unit,
          hasWeight: exerciseForm.hasWeight,
          hasSetMode: exerciseForm.hasSetMode,
          unitOptions: exerciseForm.hasSetMode
            ? [
                {
                  value: exerciseForm.unit,
                  label: exerciseForm.unit,
                  multiplier: 1,
                },
              ]
            : [],
          isActive: exerciseForm.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Übung erfolgreich erstellt.",
        });
        resetExerciseForm();
        await loadExercises();
      } else {
        const errorData = await response.json();
        toast({
          title: "Fehler",
          description: errorData.error || "Fehler beim Erstellen der Übung",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen der Übung",
        variant: "destructive",
      });
    }
  };

  const handleUpdateExercise = async (
    exercise: Exercise,
    field: keyof Exercise,
    value: unknown
  ) => {
    try {
      const token = localStorage.getItem("token");
      const updateData: Partial<Exercise> = { [field]: value };

      const response = await fetch(
        `${API_URL}/admin/exercises/${exercise.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Übung erfolgreich aktualisiert.",
        });
        await loadExercises();
      } else {
        const errorData = await response.json();
        toast({
          title: "Fehler",
          description: errorData.error || "Fehler beim Aktualisieren der Übung",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Übung",
        variant: "destructive",
      });
    }
  };

  const resetExerciseForm = () => {
    setExerciseForm({
      id: "",
      name: "",
      pointsPerUnit: 1,
      unit: "Wiederholungen",
      hasWeight: false,
      hasSetMode: true,
      isActive: true,
    });
    setIsExerciseFormOpen(false);
    setEditingExercise(null);
  };

  const startEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      id: exercise.id,
      name: exercise.name,
      pointsPerUnit: exercise.pointsPerUnit,
      unit: exercise.unit,
      hasWeight: exercise.hasWeight,
      hasSetMode: exercise.hasSetMode,
      isActive: exercise.isActive,
    });
    setIsExerciseFormOpen(true);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Nie";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Ungültiges Datum";
      }
      return date.toLocaleString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error, "Input:", dateString);
      return "Ungültiges Datum";
    }
  };

  const maskEmail = (email: string) => {
    if (showEmails) return email;
    const [name, domain] = email.split("@");
    return `${name.substring(0, 2)}***@${domain}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Verwaltung der App-Einstellungen und Benutzer
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Sie sind als Administrator angemeldet und haben vollständigen Zugriff
          auf alle Einstellungen.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap w-full gap-2">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="users">Benutzerverwaltung</TabsTrigger>
          <TabsTrigger value="scoring">Wertung</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* App Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                App-Statistiken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {users.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Registrierte Benutzer
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter((u) => u.isEmailVerified).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verifizierte E-Mails
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Administratoren
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={loadAdminData}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Wird geladen..." : "Daten aktualisieren"}
          </Button>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Benutzer-Verwaltung
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
                  {showEmails ? "E-Mails verbergen" : "E-Mails anzeigen"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead>Letzter Login</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((adminUser) => (
                        <TableRow key={adminUser.id}>
                          <TableCell>
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
                                  Admin
                                </Badge>
                              )}
                              {adminUser.isEmailVerified && (
                                <Badge
                                  variant="outline"
                                  className="text-green-600"
                                >
                                  ✓ Verifiziert
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
                      Keine Benutzer gefunden
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
            {isLoading ? "Wird geladen..." : "Daten aktualisieren"}
          </Button>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6 mt-6">
          {/* Exercise Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Übungs-Wertung
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    resetExerciseForm();
                    setIsExerciseFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Neue Übung
                </Button>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Punkte pro Einheit definieren die Basiswertung. Einheit und Messung
                kommen aus der Übung selbst.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <Label>Suche</Label>
                    <Input
                      value={scoringQuery}
                      onChange={(e) => setScoringQuery(e.target.value)}
                      placeholder="Name oder ID"
                      className="mt-1"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <Label>Kategorie</Label>
                    <Select
                      value={scoringCategory}
                      onValueChange={setScoringCategory}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        {scoringCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-40">
                    <Label>Status</Label>
                    <Select
                      value={scoringStatus}
                      onValueChange={setScoringStatus}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="inactive">Inaktiv</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card className="border-dashed">
                  <CardContent className="p-4 space-y-2 text-sm">
                    <p className="font-medium">Wertungslogik</p>
                    <p className="text-muted-foreground">
                      Punkte = Basiswert pro Einheit × Menge. Bei Sets wird die Summe der
                      Wiederholungen genutzt. Einheit und Messung kommen aus der Übung.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Zusammenführen</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>Quell‑Übung</Label>
                      <Select
                        value={mergeSourceId}
                        onValueChange={setMergeSourceId}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Quelle wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {exercises.map((exercise) => (
                            <SelectItem key={exercise.id} value={exercise.id}>
                              {exercise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ziel‑Übung</Label>
                      <Select
                        value={mergeTargetId}
                        onValueChange={setMergeTargetId}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Ziel wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {exercises
                            .filter((exercise) => exercise.id !== mergeSourceId)
                            .map((exercise) => (
                              <SelectItem key={exercise.id} value={exercise.id}>
                                {exercise.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      disabled={!mergeSourceId || !mergeTargetId}
                      onClick={() => handleMergeExercise(mergeSourceId, mergeTargetId)}
                    >
                      Zusammenführen
                    </Button>
                  </CardContent>
                </Card>

                {isExerciseFormOpen && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>
                          {editingExercise
                            ? "Übung bearbeiten"
                            : "Neue Übung erstellen"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetExerciseForm}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={
                          editingExercise
                            ? async (e) => {
                                e.preventDefault();
                                await handleUpdateExercise(
                                  editingExercise,
                                  "name",
                                  exerciseForm.name
                                );
                                await handleUpdateExercise(
                                  editingExercise,
                                  "pointsPerUnit",
                                  exerciseForm.pointsPerUnit
                                );
                                await handleUpdateExercise(
                                  editingExercise,
                                  "unit",
                                  exerciseForm.unit
                                );
                                await handleUpdateExercise(
                                  editingExercise,
                                  "hasWeight",
                                  exerciseForm.hasWeight
                                );
                                await handleUpdateExercise(
                                  editingExercise,
                                  "hasSetMode",
                                  exerciseForm.hasSetMode
                                );
                                await handleUpdateExercise(
                                  editingExercise,
                                  "isActive",
                                  exerciseForm.isActive
                                );
                                resetExerciseForm();
                              }
                            : handleCreateExercise
                        }
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="exercise-name">Name</Label>
                            <Input
                              id="exercise-name"
                              value={exerciseForm.name}
                              onChange={(e) =>
                                setExerciseForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="Burpees"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="exercise-points">
                              Punkte pro Einheit
                            </Label>
                            <Input
                              id="exercise-points"
                              type="number"
                              step="0.1"
                              min="0"
                              value={exerciseForm.pointsPerUnit}
                              onChange={(e) =>
                                setExerciseForm((prev) => ({
                                  ...prev,
                                  pointsPerUnit:
                                    parseFloat(e.target.value) || 0,
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="exercise-unit">Einheit</Label>
                            <Input
                              id="exercise-unit"
                              value={exerciseForm.unit}
                              onChange={(e) =>
                                setExerciseForm((prev) => ({
                                  ...prev,
                                  unit: e.target.value,
                                }))
                              }
                              placeholder="Wiederholungen"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="has-set-mode"
                              checked={exerciseForm.hasSetMode}
                              onCheckedChange={(checked) =>
                                setExerciseForm((prev) => ({
                                  ...prev,
                                  hasSetMode: checked,
                                }))
                              }
                            />
                            <Label htmlFor="has-set-mode">Set-Modus</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="has-weight"
                              checked={exerciseForm.hasWeight}
                              onCheckedChange={(checked) =>
                                setExerciseForm((prev) => ({
                                  ...prev,
                                  hasWeight: checked,
                                }))
                              }
                            />
                            <Label htmlFor="has-weight">Mit Gewicht</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is-active"
                              checked={exerciseForm.isActive}
                              onCheckedChange={(checked) =>
                                setExerciseForm((prev) => ({
                                  ...prev,
                                  isActive: checked,
                                }))
                              }
                            />
                            <Label htmlFor="is-active">Aktiv</Label>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            {editingExercise ? "Speichern" : "Erstellen"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetExerciseForm}
                          >
                            Abbrechen
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Punkte/Einheit</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Messung</TableHead>
                        <TableHead>Eigenschaften</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScoringExercises.map((exercise) => (
                        <TableRow key={exercise.id}>
                          <TableCell className="font-medium">
                            {exercise.name}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              value={exercise.pointsPerUnit}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  exercise,
                                  "pointsPerUnit",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {exercise.unitOptions?.[0]?.label || exercise.unit}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {exercise.category || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {exercise.measurementType || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {exercise.hasSetMode && (
                                <Badge
                                  variant="outline"
                                  className="text-xs w-fit"
                                >
                                  Set-Modus
                                </Badge>
                              )}
                              {exercise.hasWeight && (
                                <Badge
                                  variant="outline"
                                  className="text-xs w-fit"
                                >
                                  Mit Gewicht
                                </Badge>
                              )}
                              {exercise.supportsTime && (
                                <Badge variant="outline" className="text-xs w-fit">
                                  Zeit
                                </Badge>
                              )}
                              {exercise.supportsDistance && (
                                <Badge variant="outline" className="text-xs w-fit">
                                  Distanz
                                </Badge>
                              )}
                              {exercise.supportsGrade && (
                                <Badge variant="outline" className="text-xs w-fit">
                                  Route
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                exercise.isActive ? "default" : "secondary"
                              }
                            >
                              {exercise.isActive ? "Aktiv" : "Inaktiv"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditExercise(exercise)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <MergeDialog sourceId={exercise.id} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredScoringExercises.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Keine Übungen gefunden
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={loadExercises}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Wird geladen..." : "Übungen aktualisieren"}
          </Button>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Übungs-Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exerciseReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine offenen Reports
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Übung</TableHead>
                        <TableHead>Grund</TableHead>
                        <TableHead>Beschreibung</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exerciseReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="text-sm">
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
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                resolveExerciseReport(report.id, "resolved")
                              }
                            >
                              Erledigt
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                resolveExerciseReport(report.id, "dismissed")
                              }
                            >
                              Ablehnen
                            </Button>
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
                Änderungsanfragen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exerciseEditRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine offenen Änderungsanfragen
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Übung</TableHead>
                        <TableHead>Änderungen</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exerciseEditRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="text-sm">
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
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                resolveEditRequest(request.id, "approved")
                              }
                            >
                              Freigeben
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                resolveEditRequest(request.id, "rejected")
                              }
                            >
                              Ablehnen
                            </Button>
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

        <TabsContent value="monitoring" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <Button
              onClick={loadMonitoringData}
              variant="outline"
              disabled={isLoadingMonitoring}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoadingMonitoring ? "animate-spin" : ""}`}
              />
              Aktualisieren
            </Button>
          </div>

          {monitoringData && (
            <>
              {/* Job Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Job-Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {monitoringData.jobs.stuckJobs.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {monitoringData.jobs.stuckJobs.length} stuck job(s)
                        gefunden
                        <Button
                          onClick={handleCleanupJobs}
                          variant="outline"
                          size="sm"
                          className="ml-4"
                        >
                          Cleanup durchführen
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
                            Letzter Lauf:{" "}
                            {new Date(stat.last_run).toLocaleString("de-DE")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {monitoringData.jobs.recentFailures.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">
                        Fehler der letzten 7 Tage
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
                  <CardTitle>E-Mail-Warteschlange</CardTitle>
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
                                ? `${stat.failed_after_retries} nach Retries`
                                : "Gesamt"}
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
                    <h4 className="font-semibold mb-2">Letzte E-Mails (24h)</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Empfänger</TableHead>
                            <TableHead>Betreff</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Versuche</TableHead>
                            <TableHead>Erstellt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monitoringData.emails.recent
                            .slice(0, 10)
                            .map((email: any) => (
                              <TableRow key={email.id}>
                                <TableCell className="font-mono text-xs">
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
                                    "de-DE"
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
                  Klicken Sie auf "Aktualisieren", um Monitoring-Daten zu laden
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
