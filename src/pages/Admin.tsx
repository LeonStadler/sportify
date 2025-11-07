import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Edit,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  pointsPerUnit: number;
  unit: string;
  hasWeight: boolean;
  hasSetMode: boolean;
  unitOptions: Array<{ value: string; label: string; multiplier: number }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    id: "",
    name: "",
    pointsPerUnit: 1,
    unit: "Wiederholungen",
    hasWeight: false,
    hasSetMode: true,
    isActive: true,
  });

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

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadUsers(), loadExercises()]);
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
      !exerciseForm.id ||
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
          id: exerciseForm.id.toLowerCase().replace(/\s+/g, "-"),
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="users">Benutzerverwaltung</TabsTrigger>
          <TabsTrigger value="scoring">Wertung</TabsTrigger>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                            <Label htmlFor="exercise-id">
                              ID (eindeutig, z.B. "burpees")
                            </Label>
                            <Input
                              id="exercise-id"
                              value={exerciseForm.id}
                              onChange={(e) =>
                                setExerciseForm((prev) => ({
                                  ...prev,
                                  id: e.target.value,
                                }))
                              }
                              placeholder="burpees"
                              disabled={!!editingExercise}
                              required
                            />
                          </div>
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
                        <TableHead>ID</TableHead>
                        <TableHead>Punkte/Einheit</TableHead>
                        <TableHead>Einheit</TableHead>
                        <TableHead>Eigenschaften</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercises.map((exercise) => (
                        <TableRow key={exercise.id}>
                          <TableCell className="font-medium">
                            {exercise.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {exercise.id}
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
                          </TableCell>
                          <TableCell>{exercise.unit}</TableCell>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditExercise(exercise)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {exercises.length === 0 && (
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
      </Tabs>
    </div>
  );
}
