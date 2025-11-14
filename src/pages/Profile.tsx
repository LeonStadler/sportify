import { AvatarEditor } from "@/components/AvatarEditor";
import { DeleteAccountConfirmationDialog } from "@/components/DeleteAccountConfirmationDialog";
import { DeleteAccountPasswordDialog } from "@/components/DeleteAccountPasswordDialog";
import { InviteFriendForm } from "@/components/InviteFriendForm";
import { PageTemplate } from "@/components/PageTemplate";
import { PasswordDialog } from "@/components/PasswordDialog";
import { RecoveryCodesDialog } from "@/components/RecoveryCodesDialog";
import { TwoFactorSetupDialog } from "@/components/TwoFactorSetupDialog";
import type { WeeklyGoals } from "@/components/WeeklyGoalsDialog";
import { DEFAULT_WEEKLY_POINTS_GOAL } from "@/config/events";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Invitation } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { getUserInitials, parseAvatarConfig } from "@/lib/avatar";
import {
  Award,
  Camera,
  Check,
  Copy,
  Key,
  Lock,
  Mail,
  Share2,
  Shield,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NiceAvatar, { NiceAvatarProps } from "react-nice-avatar";
import { useNavigate, useSearchParams } from "react-router-dom";

export function Profile() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const {
    user,
    updateProfile,
    deleteAccount,
    disable2FA,
    rotateBackupCodes,
    changePassword,
    isLoading,
    inviteFriend,
    getInvitations,
    getDisplayName,
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial tab from URL query parameter
  const getInitialTab = () => {
    const tabParam = searchParams.get("tab");
    const validTabs = [
      "profile",
      "preferences",
      "goals",
      "achievements",
      "security",
      "danger",
    ];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "profile";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Update tab when URL query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = [
      "profile",
      "preferences",
      "goals",
      "achievements",
      "security",
      "danger",
    ];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    nickname: user?.nickname || "",
    displayPreference: user?.displayPreference || "firstName",
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  // User preferences state
  const [preferencesForm, setPreferencesForm] = useState<{
    languagePreference: "de" | "en";
    timeFormat: "12h" | "24h";
    units: {
      distance: "km" | "m" | "miles" | "yards";
      weight: "kg" | "lbs" | "stone";
      temperature: "celsius" | "fahrenheit";
    };
    notifications: {
      push: boolean;
      email: boolean;
    };
    privacy: {
      publicProfile: boolean;
    };
    theme: "light" | "dark" | "system";
  }>({
    languagePreference: user?.languagePreference || "de",
    timeFormat: user?.preferences?.timeFormat || "24h",
    units: {
      distance: user?.preferences?.units?.distance || "km",
      weight: user?.preferences?.units?.weight || "kg",
      temperature: user?.preferences?.units?.temperature || "celsius",
    },
    notifications: {
      push: user?.preferences?.notifications?.push ?? true,
      email: user?.preferences?.notifications?.email ?? true,
    },
    privacy: {
      publicProfile: user?.preferences?.privacy?.publicProfile ?? true,
    },
    theme:
      (theme && (theme === "light" || theme === "dark" || theme === "system")
        ? theme
        : "system") || "system",
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDialogConfig, setPasswordDialogConfig] = useState<{
    title: string;
    description: string;
    onConfirm: (password: string) => Promise<void>;
    confirmLabel?: string;
  } | null>(null);
  const [
    deleteAccountConfirmationDialogOpen,
    setDeleteAccountConfirmationDialogOpen,
  ] = useState(false);
  const [deleteAccountPasswordDialogOpen, setDeleteAccountPasswordDialogOpen] =
    useState(false);
  const [twoFactorSetupDialogOpen, setTwoFactorSetupDialogOpen] =
    useState(false);
  const [recoveryCodesDialogOpen, setRecoveryCodesDialogOpen] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[]>([]);
  const [goals, setGoals] = useState<WeeklyGoals>({
    pullups: { target: 100, current: 0 },
    pushups: { target: 400, current: 0 },
    running: { target: 25, current: 0 },
    cycling: { target: 100, current: 0 },
    points: { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
  });
  const [goalsForm, setGoalsForm] = useState<WeeklyGoals>({
    pullups: { target: 100, current: 0 },
    pushups: { target: 400, current: 0 },
    running: { target: 25, current: 0 },
    cycling: { target: 100, current: 0 },
    points: { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
  });
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);

  const loadInvitations = useCallback(async () => {
    setLoadingInvitations(true);
    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Error loading invitations:", error);
    } finally {
      setLoadingInvitations(false);
    }
  }, [getInvitations]);

  // Load invitations on mount
  useEffect(() => {
    if (user) {
      loadInvitations();
      loadGoals();
    }
  }, [user, loadInvitations]);

  const loadGoals = async () => {
    try {
      setLoadingGoals(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const mergedGoals: WeeklyGoals = {
          pullups: { target: data.pullups?.target ?? 100, current: data.pullups?.current ?? 0 },
          pushups: { target: data.pushups?.target ?? 400, current: data.pushups?.current ?? 0 },
          running: { target: data.running?.target ?? 25, current: data.running?.current ?? 0 },
          cycling: { target: data.cycling?.target ?? 100, current: data.cycling?.current ?? 0 },
          points: {
            target: data.points?.target ?? DEFAULT_WEEKLY_POINTS_GOAL,
            current: data.points?.current ?? 0,
          },
        };
        setGoals(mergedGoals);
        setGoalsForm(mergedGoals);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoadingGoals(false);
    }
  };

  const handleSaveGoals = async (newGoals: WeeklyGoals) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("errors.notAuthenticated", "Nicht authentifiziert"));
      }

      const response = await fetch(`${API_URL}/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGoals),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Fehler beim Speichern" }));
        throw new Error(
          errorData.error ||
            t("goals.saveError", "Fehler beim Speichern der Ziele")
        );
      }

      const updatedGoals = await response.json();
      setGoals(updatedGoals);
      setGoalsForm(updatedGoals);
      toast({
        title: t("goals.saved", "Wochenziele gespeichert"),
        description: t(
          "goals.savedDescription",
          "Deine Wochenziele wurden erfolgreich aktualisiert."
        ),
      });
    } catch (error) {
      toast({
        title: t("common.error", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("goals.saveError", "Fehler beim Speichern der Wochenziele"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleGoalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveGoals(goalsForm);
  };

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        nickname: user.nickname || "",
        displayPreference: user.displayPreference || "firstName",
      });
    }
  }, [user]);

  const handleAvatarSave = async (config: NiceAvatarProps) => {
    try {
      const avatarJson = JSON.stringify(config);
      // Stelle sicher, dass alle Profildaten mitgesendet werden, damit sie nicht überschrieben werden
      await updateProfile({
        avatar: avatarJson,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        nickname: user?.nickname || "",
        displayPreference: user?.displayPreference || "firstName",
      });
      toast({
        title: "Avatar gespeichert",
        description: "Dein Avatar wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description:
          error instanceof Error
            ? error.message
            : "Fehler beim Speichern des Avatars",
        variant: "destructive",
      });
    }
  };

  const handleAvatarRemove = async () => {
    try {
      // Setze Avatar auf null und stelle sicher, dass alle anderen Profildaten erhalten bleiben
      await updateProfile({
        avatar: null,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        nickname: user?.nickname || "",
        displayPreference: user?.displayPreference || "firstName",
      });
      toast({
        title: "Avatar entfernt",
        description: "Dein Profilbild wurde erfolgreich entfernt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description:
          error instanceof Error
            ? error.message
            : "Fehler beim Entfernen des Avatars",
        variant: "destructive",
      });
    }
  };

  const getCurrentAvatarConfig = (): NiceAvatarProps | undefined => {
    if (!user?.avatar) return undefined;
    return parseAvatarConfig(user.avatar) || undefined;
  };

  const validateProfileForm = (): boolean => {
    const errors: { firstName?: string; lastName?: string } = {};

    if (!profileForm.firstName || profileForm.firstName.trim() === "") {
      errors.firstName = "Vorname ist ein Pflichtfeld.";
    }

    if (!profileForm.lastName || profileForm.lastName.trim() === "") {
      errors.lastName = "Nachname ist ein Pflichtfeld.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      toast({
        title: "Validierungsfehler",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    // Check if displayPreference is 'nickname' but no nickname is provided
    if (
      profileForm.displayPreference === "nickname" &&
      (!profileForm.nickname || profileForm.nickname.trim() === "")
    ) {
      toast({
        title: "Fehler",
        description:
          "Wenn 'Spitzname' als Anzeigename gewählt ist, muss ein Spitzname angegeben werden.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Stelle sicher, dass das bestehende Avatar mitgesendet wird, damit es nicht überschrieben wird
      await updateProfile({
        ...profileForm,
        avatar: user?.avatar || undefined,
      });
      setValidationErrors({});
      toast({
        title: "Profil aktualisiert",
        description:
          "Deine Profilinformationen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description:
          error instanceof Error
            ? error.message
            : "Fehler beim Speichern des Profils",
        variant: "destructive",
      });
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Stelle sicher, dass alle erforderlichen Felder und das Avatar mitgesendet werden
      await updateProfile({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        nickname: user?.nickname || "",
        displayPreference: user?.displayPreference || "firstName",
        languagePreference: preferencesForm.languagePreference as "de" | "en",
        preferences: preferencesForm,
        avatar: user?.avatar || undefined,
      });
      toast({
        title: "Einstellungen gespeichert",
        description: "Deine Präferenzen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description:
          error instanceof Error
            ? error.message
            : "Fehler beim Speichern der Einstellungen",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die Passwörter stimmen nicht überein.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Fehler",
        description: "Das Passwort muss mindestens 8 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordForm.currentPassword) {
      toast({
        title: "Fehler",
        description: "Bitte gib dein aktuelles Passwort ein.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordForm.newPassword) {
      toast({
        title: "Fehler",
        description: "Bitte gib ein neues Passwort ein.",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast({
        title: "Passwort geändert",
        description: "Dein Passwort wurde erfolgreich geändert.",
      });
      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Error is already handled in changePassword function and shown via toast
      // But we can add additional logging if needed
      console.error("Password change error:", error);
      toast({
        title: "Fehler",
        description:
          error instanceof Error
            ? error.message
            : "Fehler beim Ändern des Passworts",
        variant: "destructive",
      });
    }
  };

  const handleToggle2FA = (checked: boolean) => {
    if (checked) {
      // Open 2FA setup dialog when enabling
      setTwoFactorSetupDialogOpen(true);
    } else {
      // Show password dialog for disabling 2FA
      setPasswordDialogConfig({
        title: "2FA deaktivieren",
        description:
          "Bitte gib dein Passwort ein, um die Zwei-Faktor-Authentifizierung zu deaktivieren.",
        confirmLabel: "2FA deaktivieren",
        onConfirm: async (password: string) => {
          try {
            await disable2FA(password);
            toast({
              title: "2FA deaktiviert",
              description:
                "Zwei-Faktor-Authentifizierung wurde erfolgreich deaktiviert.",
            });
          } catch (error) {
            toast({
              title: "Fehler",
              description:
                error instanceof Error
                  ? error.message
                  : "Fehler beim Deaktivieren der 2FA",
              variant: "destructive",
            });
            throw error;
          }
        },
      });
      setPasswordDialogOpen(true);
    }
  };

  const handlePasswordDialogConfirm = async (password: string) => {
    if (!passwordDialogConfig) return;
    await passwordDialogConfig.onConfirm(password);
    setPasswordDialogOpen(false);
    setPasswordDialogConfig(null);
  };

  const handleInviteSuccess = async () => {
    await loadInvitations();
  };

  const copyInviteLink = async () => {
    const frontendUrl = window.location.origin;
    const inviteLink = `${frontendUrl}/invite/${user?.id}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: "Link kopiert",
        description: "Einladungslink wurde in die Zwischenablage kopiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Link konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    setDeleteAccountConfirmationDialogOpen(true);
  };

  const handleDeleteAccountConfirmation = () => {
    setDeleteAccountConfirmationDialogOpen(false);
    setDeleteAccountPasswordDialogOpen(true);
  };

  const handleDeleteAccountPasswordConfirm = async (password: string) => {
    try {
      await deleteAccount(password);
      toast({
        title: "Konto gelöscht",
        description: "Dein Konto wurde erfolgreich gelöscht.",
      });
      setDeleteAccountPasswordDialogOpen(false);
      // Redirect to login after successful account deletion
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch (error) {
      toast({
        title: "Fehler",
        description:
          error instanceof Error
            ? error.message
            : "Fehler beim Löschen des Kontos",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getInvitationStatusBadge = (invitation: Invitation) => {
    if (invitation.used) {
      return (
        <Badge variant="default" className="bg-green-500">
          Angenommen
        </Badge>
      );
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return <Badge variant="secondary">Abgelaufen</Badge>;
    }
    return <Badge variant="outline">Ausstehend</Badge>;
  };

  if (!user) {
    return <div>Lädt...</div>;
  }

  return (
    <PageTemplate
      title={t("profile.title", "Profil")}
      subtitle={t(
        "profile.subtitle",
        "Verwalte deine persönlichen Einstellungen und Ziele"
      )}
      className="space-y-6"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          const params = new URLSearchParams(searchParams);
          params.set("tab", value);
          setSearchParams(params);
        }}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="preferences">Einstellungen</TabsTrigger>
          <TabsTrigger value="goals">Wochenziele</TabsTrigger>
          <TabsTrigger value="achievements">Erfolge</TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
          <TabsTrigger value="danger" className="text-destructive">
            Gefahrenzone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profil Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      {user.avatar && parseAvatarConfig(user.avatar) ? (
                        <NiceAvatar
                          style={{ width: "80px", height: "80px" }}
                          {...parseAvatarConfig(user.avatar)!}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 shrink-0"
                      variant="secondary"
                      onClick={() => setAvatarEditorOpen(true)}
                      disabled={isLoading}
                    >
                      <Camera size={14} />
                    </Button>
                    {user.avatar && parseAvatarConfig(user.avatar) && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -left-2 rounded-full w-8 h-8 p-0 shrink-0"
                        variant="destructive"
                        onClick={handleAvatarRemove}
                        disabled={isLoading}
                        title="Avatar entfernen"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {getDisplayName()}
                    </h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    {user.role === "admin" && (
                      <Badge variant="secondary" className="mt-1">
                        <Shield size={12} className="mr-1" />
                        Administrator
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="bg-accent p-3 rounded-lg">
                  <p className="text-sm font-medium">E-Mail Verifizierung</p>
                  <p className="text-sm text-muted-foreground">
                    {user.isEmailVerified
                      ? "✓ Deine E-Mail ist verifiziert"
                      : "⚠ Bitte verifiziere deine E-Mail-Adresse"}
                  </p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-3">
                  <div>
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => {
                        setProfileForm((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }));
                        if (validationErrors.firstName) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            firstName: undefined,
                          }));
                        }
                      }}
                      className={
                        validationErrors.firstName ? "border-destructive" : ""
                      }
                    />
                    {validationErrors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => {
                        setProfileForm((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }));
                        if (validationErrors.lastName) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            lastName: undefined,
                          }));
                        }
                      }}
                      className={
                        validationErrors.lastName ? "border-destructive" : ""
                      }
                    />
                    {validationErrors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nickname">Spitzname (optional)</Label>
                    <Input
                      id="nickname"
                      value={profileForm.nickname}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          nickname: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="displayPreference">Anzeigename</Label>
                    <Select
                      value={profileForm.displayPreference}
                      onValueChange={(value) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          displayPreference: value as
                            | "nickname"
                            | "firstName"
                            | "fullName",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="firstName">Vorname</SelectItem>
                        <SelectItem value="fullName">
                          Vollständiger Name
                        </SelectItem>
                        <SelectItem
                          value="nickname"
                          disabled={
                            !profileForm.nickname ||
                            profileForm.nickname.trim() === ""
                          }
                        >
                          Spitzname{" "}
                          {(!profileForm.nickname ||
                            profileForm.nickname.trim() === "") &&
                            "(kein Spitzname vergeben)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {profileForm.displayPreference === "nickname" &&
                      (!profileForm.nickname ||
                        profileForm.nickname.trim() === "") && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Bitte gib einen Spitzname ein, um diese Option zu
                          verwenden.
                        </p>
                      )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Wird gespeichert..." : "Profil aktualisieren"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Invite Friends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Freunde einladen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Lade deine Freunde ein und trainiert gemeinsam!
                </p>

                <InviteFriendForm onSuccess={handleInviteSuccess} />

                <Separator />

                <div>
                  <Label htmlFor="invite-link">Dein Einladungslink</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="invite-link"
                      value={`${window.location.origin}/invite/${user.id}`}
                      readOnly
                    />
                    <Button variant="outline" onClick={copyInviteLink}>
                      {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Invitations List */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Eingeladene Freunde
                  </h4>
                  {loadingInvitations ? (
                    <p className="text-sm text-muted-foreground">Lädt...</p>
                  ) : invitations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Noch keine Einladungen gesendet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {invitations.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {invitation.firstName} {invitation.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {invitation.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    invitation.createdAt
                                  ).toLocaleDateString("de-DE")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-2">
                            {getInvitationStatusBadge(invitation)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Passwort ändern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Aktuelles Passwort</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">Neues Passwort</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">
                      Passwort bestätigen
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    variant="destructive"
                    disabled={isLoading}
                    onClick={handlePasswordChange}
                  >
                    {isLoading ? "Wird geändert..." : "Passwort ändern"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Zwei-Faktor-Authentifizierung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA aktivieren</p>
                    <p className="text-sm text-muted-foreground">
                      Zusätzliche Sicherheit für dein Konto
                    </p>
                    <p className="text-sm">
                      Status: {user.has2FA ? "✓ Aktiviert" : "○ Deaktiviert"}
                    </p>
                  </div>
                  <Switch
                    checked={user.has2FA || false}
                    onCheckedChange={handleToggle2FA}
                    disabled={isLoading}
                  />
                </div>

                {user.has2FA && (
                  <>
                    <Separator />
                    <div className="space-y-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium">2FA Details</p>
                        <p className="text-muted-foreground">
                          Aktiviert am:{" "}
                          {user.twoFactorEnabledAt &&
                          user.twoFactorEnabledAt !== null &&
                          user.twoFactorEnabledAt !== undefined &&
                          user.twoFactorEnabledAt !== "" &&
                          !isNaN(new Date(user.twoFactorEnabledAt).getTime())
                            ? new Date(
                                user.twoFactorEnabledAt
                              ).toLocaleDateString("de-DE", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Nicht verfügbar"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const codes = await rotateBackupCodes();
                            setNewRecoveryCodes(codes);
                            setRecoveryCodesDialogOpen(true);
                            toast({
                              title: "Recovery-Keys zurückgesetzt",
                              description:
                                "Neue Recovery-Keys wurden erfolgreich generiert.",
                            });
                          } catch (error) {
                            toast({
                              title: "Fehler",
                              description:
                                error instanceof Error
                                  ? error.message
                                  : "Fehler beim Zurücksetzen der Recovery-Keys",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="w-full"
                      >
                        Recovery-Keys zurücksetzen
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Kontosicherheit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Letzter Login</p>
                    <p className="text-sm text-muted-foreground">
                      {user.lastLoginAt &&
                      user.lastLoginAt !== null &&
                      user.lastLoginAt !== undefined &&
                      user.lastLoginAt !== "" &&
                      !isNaN(new Date(user.lastLoginAt).getTime())
                        ? new Date(user.lastLoginAt).toLocaleDateString(
                            "de-DE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Nie"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Letzte Passwortänderung
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.passwordChangedAt &&
                      user.passwordChangedAt !== null &&
                      user.passwordChangedAt !== undefined &&
                      user.passwordChangedAt !== "" &&
                      !isNaN(new Date(user.passwordChangedAt).getTime())
                        ? new Date(user.passwordChangedAt).toLocaleDateString(
                            "de-DE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Nie geändert"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">E-Mail-Verifizierung</p>
                    <p className="text-sm text-muted-foreground">
                      {user.isEmailVerified ? (
                        <span className="text-green-600 dark:text-green-400">
                          ✓ Verifiziert
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          ⚠ Nicht verifiziert
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <form onSubmit={handlePreferencesUpdate}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Benutzereinstellungen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Benutzereinstellungen
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Passe die App an deine Vorlieben an
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sprache */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sprache</Label>
                    <Select
                      value={preferencesForm.languagePreference}
                      onValueChange={(value) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          languagePreference: value as "de" | "en",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Uhrzeitformat */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Uhrzeitformat</Label>
                    <Select
                      value={preferencesForm.timeFormat}
                      onValueChange={(value) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          timeFormat: value as "12h" | "24h",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24-Stunden (14:30)</SelectItem>
                        <SelectItem value="12h">
                          12-Stunden (2:30 PM)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Theme */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("settings.theme")}
                    </Label>
                    <Select
                      value={theme || "system"}
                      onValueChange={(value) => {
                        setTheme(value as "light" | "dark" | "system");
                        setPreferencesForm((prev) => ({
                          ...prev,
                          theme: value as "light" | "dark" | "system",
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">
                          {t("settings.themeSystem")}
                        </SelectItem>
                        <SelectItem value="light">
                          {t("settings.themeLight")}
                        </SelectItem>
                        <SelectItem value="dark">
                          {t("settings.themeDark")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Einheiten-Präferenzen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Einheiten-Präferenzen
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Wähle deine bevorzugten Einheiten für Messungen
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Distanz */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Distanz</Label>
                    <Select
                      value={preferencesForm.units.distance}
                      onValueChange={(value) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          units: {
                            ...prev.units,
                            distance: value as "km" | "m" | "miles" | "yards",
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">Kilometer (km)</SelectItem>
                        <SelectItem value="m">Meter (m)</SelectItem>
                        <SelectItem value="miles">Meilen</SelectItem>
                        <SelectItem value="yards">Yards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gewicht */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gewicht</Label>
                    <Select
                      value={preferencesForm.units.weight}
                      onValueChange={(value) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          units: {
                            ...prev.units,
                            weight: value as "kg" | "lbs" | "stone",
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogramm (kg)</SelectItem>
                        <SelectItem value="lbs">Pfund (lbs)</SelectItem>
                        <SelectItem value="stone">Stone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperatur */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Temperatur</Label>
                    <Select
                      value={preferencesForm.units.temperature}
                      onValueChange={(value) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          units: {
                            ...prev.units,
                            temperature: value as "celsius" | "fahrenheit",
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="fahrenheit">
                          Fahrenheit (°F)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* App-Einstellungen */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">App-Einstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Push-Benachrichtigungen
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Erhalte Benachrichtigungen für neue Aktivitäten und
                        Freundschaftsanfragen
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.notifications.push}
                      onCheckedChange={(checked) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            push: checked,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        E-Mail-Benachrichtigungen
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Wöchentliche Zusammenfassung deiner Fortschritte
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.notifications.email}
                      onCheckedChange={(checked) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: checked,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Öffentliches Profil
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Andere Benutzer können dein Profil und deine Aktivitäten
                        sehen
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.privacy.publicProfile}
                      onCheckedChange={(checked) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, publicProfile: checked },
                        }))
                      }
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? "Wird gespeichert..."
                      : "Alle Einstellungen speichern"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wochenziele</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Passe deine wöchentlichen Ziele nach deinen Wünschen an. Die
                Fortschritte werden automatisch basierend auf deinen Trainings
                aktualisiert.
              </p>
            </CardHeader>
            <CardContent>
              {loadingGoals ? (
                <p className="text-muted-foreground">Lädt...</p>
              ) : (
                <form onSubmit={handleGoalsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-pullups">Klimmzüge</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="goal-pullups"
                          type="number"
                          min="0"
                          step="1"
                          value={goalsForm.pullups.target || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setGoalsForm((prev) => ({
                              ...prev,
                              pullups: {
                                ...prev.pullups,
                                target: isNaN(value) ? 0 : Math.max(0, value),
                              },
                            }));
                          }}
                          placeholder="100"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Aktuell: {goals.pullups.current} / Ziel:{" "}
                        {goals.pullups.target}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal-pushups">Liegestütze</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="goal-pushups"
                          type="number"
                          min="0"
                          step="1"
                          value={goalsForm.pushups.target || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setGoalsForm((prev) => ({
                              ...prev,
                              pushups: {
                                ...prev.pushups,
                                target: isNaN(value) ? 0 : Math.max(0, value),
                              },
                            }));
                          }}
                          placeholder="400"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Aktuell: {goals.pushups.current} / Ziel:{" "}
                        {goals.pushups.target}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal-running">Laufen (km)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="goal-running"
                          type="number"
                          min="0"
                          step="0.1"
                          value={goalsForm.running.target || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setGoalsForm((prev) => ({
                              ...prev,
                              running: {
                                ...prev.running,
                                target: isNaN(value) ? 0 : Math.max(0, value),
                              },
                            }));
                          }}
                          placeholder="25"
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground min-w-[2rem]">
                          km
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Aktuell: {goals.running.current} km / Ziel:{" "}
                        {goals.running.target} km
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal-cycling">Radfahren (km)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="goal-cycling"
                          type="number"
                          min="0"
                          step="0.1"
                          value={goalsForm.cycling.target || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setGoalsForm((prev) => ({
                              ...prev,
                              cycling: {
                                ...prev.cycling,
                                target: isNaN(value) ? 0 : Math.max(0, value),
                              },
                            }));
                          }}
                          placeholder="100"
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground min-w-[2rem]">
                          km
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Aktuell: {goals.cycling.current} km / Ziel:{" "}
                        {goals.cycling.target} km
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-points">Punkte</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="goal-points"
                          type="number"
                          min="0"
                          step="1"
                          value={goalsForm.points.target || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setGoalsForm((prev) => ({
                              ...prev,
                              points: {
                                ...prev.points,
                                target: isNaN(value) ? 0 : Math.max(0, value),
                              },
                            }));
                          }}
                          placeholder={DEFAULT_WEEKLY_POINTS_GOAL.toString()}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Aktuell: {goals.points.current} / Ziel:{" "}
                        {goals.points.target}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={savingGoals || isLoading}
                  >
                    {savingGoals
                      ? "Wird gespeichert..."
                      : "Wochenziele speichern"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Erfolge & Statistiken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Erfolge und detaillierte Statistiken werden bald verfügbar sein.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" />
                Gefahrenzone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-destructive mb-2">
                    Konto löschen
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Wenn du dein Konto löschst, werden alle deine Daten
                    unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig
                    gemacht werden. Alle deine Trainingsdaten, Erfolge,
                    Freundschaften und Einstellungen gehen verloren.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
                    <li>Alle deine Trainingsdaten werden gelöscht</li>
                    <li>Deine Erfolge und Statistiken gehen verloren</li>
                    <li>Alle Freundschaften werden beendet</li>
                    <li>Dein Profil ist nicht mehr erreichbar</li>
                    <li>
                      Diese Aktion ist dauerhaft und kann nicht rückgängig
                      gemacht werden
                    </li>
                  </ul>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  Konto löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AvatarEditor
        open={avatarEditorOpen}
        onOpenChange={setAvatarEditorOpen}
        currentConfig={getCurrentAvatarConfig()}
        onSave={handleAvatarSave}
      />

      {/* Password Dialog for 2FA */}
      {passwordDialogConfig && (
        <PasswordDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          title={passwordDialogConfig.title}
          description={passwordDialogConfig.description}
          onConfirm={handlePasswordDialogConfirm}
          confirmLabel={passwordDialogConfig.confirmLabel}
        />
      )}

      {/* Delete Account Confirmation Dialog */}
      <DeleteAccountConfirmationDialog
        open={deleteAccountConfirmationDialogOpen}
        onOpenChange={setDeleteAccountConfirmationDialogOpen}
        onConfirm={handleDeleteAccountConfirmation}
      />

      {/* Delete Account Password Dialog */}
      <DeleteAccountPasswordDialog
        open={deleteAccountPasswordDialogOpen}
        onOpenChange={setDeleteAccountPasswordDialogOpen}
        onConfirm={handleDeleteAccountPasswordConfirm}
        isLoading={isLoading}
      />

      {/* 2FA Setup Dialog */}
      <TwoFactorSetupDialog
        open={twoFactorSetupDialogOpen}
        onOpenChange={(open) => {
          setTwoFactorSetupDialogOpen(open);
        }}
        onSuccess={() => {
          // User state is automatically updated by verify2FA in the dialog
          // The Toggle will automatically reflect the updated user.has2FA state
        }}
      />

      {/* Recovery Codes Dialog */}
      <RecoveryCodesDialog
        open={recoveryCodesDialogOpen}
        onOpenChange={setRecoveryCodesDialogOpen}
        backupCodes={newRecoveryCodes}
      />
    </PageTemplate>
  );
}
