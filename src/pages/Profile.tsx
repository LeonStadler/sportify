import { PasswordDialog } from "@/components/auth/PasswordDialog";
import { RecoveryCodesDialog } from "@/components/auth/RecoveryCodesDialog";
import { TwoFactorSetupDialog } from "@/components/auth/TwoFactorSetupDialog";
import { PageTemplate } from "@/components/common/PageTemplate";
import { GlobalRankingWarningDialog } from "@/components/ranking/GlobalRankingWarningDialog";
import { AvatarEditor } from "@/components/settings/AvatarEditor";
import { DeleteAccountConfirmationDialog } from "@/components/settings/DeleteAccountConfirmationDialog";
import { DeleteAccountPasswordDialog } from "@/components/settings/DeleteAccountPasswordDialog";
import { InviteFriendForm } from "@/components/settings/InviteFriendForm";
import { PushNotificationSettings } from "@/components/settings/PushNotificationSettings";
import { WeeklyGoals, WeeklyGoalsForm } from "@/components/settings/WeeklyGoalsForm";
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
import { DEFAULT_WEEKLY_POINTS_GOAL } from "@/config/events";
import { Invitation } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
import { getUserInitials, parseAvatarConfig } from "@/lib/avatar";
import { getBadgeText } from "@/lib/badges";
import type { Exercise } from "@/types/exercise";
import { convertWeightFromKg, convertWeightToKg } from "@/utils/units";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import {
  Award,
  Camera,
  Check,
  Copy,
  Key,
  Lock,
  Mail,
  Medal,
  RefreshCw,
  Share2,
  Shield,
  Trash2,
  Trophy,
} from "lucide-react";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NiceAvatar, { NiceAvatarProps } from "react-nice-avatar";
import { useNavigate, useSearchParams } from "react-router-dom";

interface UserBadge {
  id: string;
  slug: string;
  label: string;
  description?: string;
  icon?: string | null;
  category: string;
  level?: number | null;
  earnedAt?: string;
}

interface UserAward {
  id: string;
  type: string;
  label: string;
  periodStart?: string;
  periodEnd?: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
}

interface BadgeProgress {
  [slug: string]: {
    counter: number;
    updatedAt: string;
  };
}

interface AchievementsData {
  badges: UserBadge[];
  awards: UserAward[];
  progress: BadgeProgress;
}

export function Profile() {
  const { t, i18n } = useTranslation();
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
  const dateLocale = i18n.language === "en" ? enUS : de;
  const dateLocaleString = i18n.language === "en" ? "en-US" : "de-DE";

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
      weight: "kg" | "lbs";
      temperature: "celsius" | "fahrenheit";
    };
    notifications: {
      push: boolean;
      email: boolean;
    };
    privacy: {
      publicProfile: boolean;
    };
    reactions: {
      friendsCanSee: boolean;
      showNames: boolean;
    };
    theme: "light" | "dark" | "system";
    metrics: {
      bodyWeightKg: number | null;
      activityLevel: "low" | "medium" | "high";
    };
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
    reactions: {
      friendsCanSee: user?.preferences?.reactions?.friendsCanSee ?? true,
      showNames: user?.preferences?.reactions?.showNames ?? true,
    },
    theme:
      (theme && (theme === "light" || theme === "dark" || theme === "system")
        ? theme
        : "system") || "system",
    metrics: {
      bodyWeightKg: user?.preferences?.metrics?.bodyWeightKg ?? null,
      activityLevel: user?.preferences?.metrics?.activityLevel ?? "medium",
    },
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
  const defaultGoals: WeeklyGoals = useMemo(
    () => ({
      points: { target: DEFAULT_WEEKLY_POINTS_GOAL, current: 0 },
      exercises: [],
    }),
    []
  );
  const [goals, setGoals] = useState<WeeklyGoals>(defaultGoals);
  const [goalsForm, setGoalsForm] = useState<WeeklyGoals>(defaultGoals);
  const [goalExercises, setGoalExercises] = useState<Exercise[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [achievements, setAchievements] = useState<AchievementsData>({
    badges: [],
    awards: [],
    progress: {},
  });
  const [loadingAchievements, setLoadingAchievements] = useState(false);

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

  const loadAchievements = useCallback(async () => {
    setLoadingAchievements(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/profile/achievements`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: AchievementsData = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoadingAchievements(false);
    }
  }, []);

  const loadGoalExercises = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${API_URL}/exercises?limit=500`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setGoalExercises(Array.isArray(data.exercises) ? data.exercises : []);
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  }, []);

  const loadGoals = useCallback(async () => {
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
          points: {
            target: data.points?.target ?? defaultGoals.points.target,
            current: data.points?.current ?? defaultGoals.points.current,
          },
          exercises: Array.isArray(data.exercises) ? data.exercises : [],
        };
        setGoals(mergedGoals);
        setGoalsForm(mergedGoals);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoadingGoals(false);
    }
  }, [defaultGoals]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadInvitations();
      loadGoals();
      loadGoalExercises();
      loadAchievements();
    }
  }, [user, loadInvitations, loadGoals, loadGoalExercises, loadAchievements]);

  const handleSaveGoals = async (newGoals: WeeklyGoals) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("errors.notAuthenticated"));
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
          .catch(() => ({ error: t("goals.saveError") }));
        throw new Error(
          errorData.error || t("goals.saveError")
        );
      }

      const updatedGoals = (await response.json()) || {};
      const mergedGoals: WeeklyGoals = {
        points: {
          target: updatedGoals.points?.target ?? newGoals.points?.target ?? defaultGoals.points.target,
          current: updatedGoals.points?.current ?? newGoals.points?.current ?? goals.points?.current ?? 0,
        },
        exercises: Array.isArray(updatedGoals.exercises)
          ? updatedGoals.exercises
          : newGoals.exercises,
      };

      setGoals(mergedGoals);
      setGoalsForm(mergedGoals);
      toast({
        title: t("goals.saved"),
        description: t(
          "goals.savedDescription"
        ),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("goals.saveError"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleGoalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveGoals(goalsForm);
  };

  const handleResetGoals = () => {
    setGoalsForm(defaultGoals);
  };

  // Global Rankings state
  const [showInGlobalRankings, setShowInGlobalRankings] = useState(
    user?.showInGlobalRankings ?? true
  );
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        nickname: user.nickname || "",
        displayPreference: user.displayPreference || "firstName",
      });
      setShowInGlobalRankings(user.showInGlobalRankings ?? true);
    }
  }, [user]);

  const handleGlobalRankingToggle = (checked: boolean) => {
    if (!checked) {
      setShowWarningDialog(true);
    } else {
      performGlobalRankingUpdate(true);
    }
  };

  const performGlobalRankingUpdate = async (checked: boolean) => {
    setShowInGlobalRankings(checked);
    try {
      await updateProfile(
        {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          nickname: user?.nickname || "",
          displayPreference: user?.displayPreference || "firstName",
          showInGlobalRankings: checked,
        },
        true
      );
      toast({
        title: t("settings.saved"),
        description: t(
          "settings.settingSaved",
          { setting: t("profile.globalRankingSetting") }
        ),
      });
    } catch (error) {
      setShowInGlobalRankings(!checked); // Revert on error
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("settings.saveError"),
        variant: "destructive",
      });
    }
  };

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
        showInGlobalRankings,
      });
      toast({
        title: t("profile.avatarSaved"),
        description: t("profile.avatarSavedDesc"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("profile.avatarError"),
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
        showInGlobalRankings,
      });
      toast({
        title: t("profile.avatarRemoved"),
        description: t("profile.avatarRemovedDesc"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("profile.avatarRemoveError"),
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
      errors.firstName = t("profile.firstNameRequired");
    }

    if (!profileForm.lastName || profileForm.lastName.trim() === "") {
      errors.lastName = t("profile.lastNameRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Auto-Save für einzelne Profilfelder
  const saveProfileField = async (
    fieldName: string,
    profileOverride?: typeof profileForm
  ) => {
    const currentProfileForm = profileOverride ?? profileForm;

    // Validierung
    if (fieldName === "firstName" && !currentProfileForm.firstName?.trim()) {
      setValidationErrors((prev) => ({
        ...prev,
        firstName: t("profile.firstNameRequired"),
      }));
      return;
    }
    if (fieldName === "lastName" && !currentProfileForm.lastName?.trim()) {
      setValidationErrors((prev) => ({
        ...prev,
        lastName: t("profile.lastNameRequired"),
      }));
      return;
    }

    if (currentProfileForm.nickname?.trim() && /\s/.test(currentProfileForm.nickname.trim())) {
      toast({
        title: t("common.error"),
        description: t(
          "profile.nicknameNoSpaces",
          "Ein Spitzname darf keine Leerzeichen enthalten."
        ),
        variant: "destructive",
      });
      return;
    }
    if (
      currentProfileForm.nickname?.trim() &&
      !/^[A-Za-z0-9_]+$/.test(currentProfileForm.nickname.trim())
    ) {
      toast({
        title: t("common.error"),
        description: t(
          "profile.nicknameInvalidFormat",
          "Ein Spitzname darf nur Buchstaben, Zahlen und Unterstriche enthalten."
        ),
        variant: "destructive",
      });
      return;
    }

    // Check if displayPreference is 'nickname' but no nickname is provided
    if (
      currentProfileForm.displayPreference === "nickname" &&
      (!currentProfileForm.nickname || currentProfileForm.nickname.trim() === "")
    ) {
      toast({
        title: t("common.error"),
        description: t("profile.nicknameRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfile(
        {
          ...currentProfileForm,
          avatar: user?.avatar || undefined,
          showInGlobalRankings,
        },
        true // silent mode - kein globaler Loading-State
      );
      setValidationErrors({});

      const fieldLabels: Record<string, string> = {
        firstName: t("profile.firstName"),
        lastName: t("profile.lastName"),
        nickname: t("profile.nicknameLabel"),
        displayPreference: t("profile.displayNameLabel"),
      };

      toast({
        title: t("settings.saved"),
        description: t(
          "settings.settingSaved",
          { setting: fieldLabels[fieldName] || fieldName }
        ),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("profile.profileSaveError"),
        variant: "destructive",
      });
    }
  };

  // Auto-Save Funktion für einzelne Einstellungen
  const savePreference = async (
    updates: Partial<typeof preferencesForm>,
    settingName: string
  ) => {
    const newPreferences = { ...preferencesForm, ...updates };
    setPreferencesForm(newPreferences);

    try {
      await updateProfile(
        {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          nickname: user?.nickname || "",
          displayPreference: user?.displayPreference || "firstName",
          languagePreference: newPreferences.languagePreference as "de" | "en",
          preferences: newPreferences,
          avatar: user?.avatar || undefined,
          showInGlobalRankings,
        },
        true // silent mode - kein globaler Loading-State
      );
      toast({
        title: t("settings.saved"),
        description: t(
          "settings.settingSaved",
          { setting: settingName }
        ),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("settings.saveError"),
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
        title: t("common.error"),
        description: t("profile.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: t("common.error"),
        description: t("profile.passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    if (!passwordForm.currentPassword) {
      toast({
        title: t("common.error"),
        description: t("profile.currentPasswordRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!passwordForm.newPassword) {
      toast({
        title: t("common.error"),
        description: t("profile.newPasswordRequired"),
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
        title: t("profile.passwordChanged"),
        description: t("profile.passwordChangedDesc"),
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
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("profile.passwordChangeError"),
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
        title: t("profile.disable2FATitle"),
        description: t("profile.disable2FAPrompt"),
        confirmLabel: t("auth.disable2FA"),
        onConfirm: async (password: string) => {
          try {
            await disable2FA(password);
            toast({
              title: t("profile.disable2FA"),
              description: t("profile.disable2FADesc"),
            });
          } catch (error) {
            toast({
              title: t("common.error"),
              description:
                error instanceof Error
                  ? error.message
                  : t("profile.disable2FAError"),
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

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_URL}/profile/invitations/${invitationId}/resend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: t("profile.invitationResendError"),
        }));
        throw new Error(
          errorData.error || t("profile.invitationResendError")
        );
      }

      toast({
        title: t("profile.invitationResent"),
        description: t("profile.invitationResentDesc"),
      });

      await loadInvitations();
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("profile.invitationResendErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_URL}/profile/invitations/${invitationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: t("profile.invitationDeleteError"),
        }));
        throw new Error(errorData.error || t("profile.invitationDeleteError"));
      }

      toast({
        title: t("profile.invitationDeleted"),
        description: t("profile.invitationDeletedDesc"),
      });

      await loadInvitations();
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("profile.invitationDeleteErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = async () => {
    const frontendUrl = window.location.origin;
    const inviteLink = `${frontendUrl}/invite/${user?.id}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: t("profile.linkCopied"),
        description: t("profile.linkCopiedDesc"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("profile.linkCopyError"),
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
        title: t("profile.accountDeleted"),
        description: t("profile.accountDeletedDesc"),
      });
      setDeleteAccountPasswordDialogOpen(false);
      // Redirect to login after successful account deletion
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("profile.deleteAccountError"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const getInvitationStatusBadge = (invitation: Invitation) => {
    if (invitation.status === "accepted" || invitation.used) {
      return (
        <Badge variant="default" className="bg-green-500">
          {t("profile.invitationStatus.accepted")}
        </Badge>
      );
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return <Badge variant="secondary">{t("profile.invitationStatus.expired")}</Badge>;
    }
    return <Badge variant="outline">{t("profile.invitationStatus.pending")}</Badge>;
  };

  if (!user) {
    return <div>{t("profile.loading")}</div>;
  }

  return (
    <PageTemplate
      title={t("profile.title")}
      subtitle={t("profile.subtitle")}
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
          <TabsTrigger value="profile">{t("profile.tabs.profile")}</TabsTrigger>
          <TabsTrigger value="preferences">
            {t("profile.tabs.preferences")}
          </TabsTrigger>
          <TabsTrigger value="goals">{t("profile.tabs.goals")}</TabsTrigger>
          <TabsTrigger value="achievements">
            {t("profile.tabs.achievements")}
          </TabsTrigger>
          <TabsTrigger value="security">{t("profile.tabs.security")}</TabsTrigger>
          <TabsTrigger value="danger" className="text-destructive">
            {t("profile.tabs.danger")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.profileInfo")}</CardTitle>
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
                        title={t("profile.removeAvatar")}
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
                        {t("profile.administrator")}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="bg-accent p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    {t("profile.emailVerification")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.isEmailVerified
                      ? t("profile.emailVerified")
                      : t("profile.emailNotVerified")}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="firstName">
                      {t("profile.firstName")} {t("profile.required")}
                    </Label>
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
                      onBlur={() => saveProfileField("firstName")}
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
                    <Label htmlFor="lastName">
                      {t("profile.lastName")} {t("profile.required")}
                    </Label>
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
                      onBlur={() => saveProfileField("lastName")}
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
                    <Label htmlFor="nickname">{t("profile.nickname")}</Label>
                    <Input
                      id="nickname"
                      value={profileForm.nickname}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          nickname: e.target.value,
                        }))
                      }
                      onBlur={() => saveProfileField("nickname")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="displayPreference">
                      {t("profile.displayNameLabel")}
                    </Label>
                    <Select
                      value={profileForm.displayPreference}
                      onValueChange={(value) => {
                        if (
                          value === "nickname" &&
                          (!profileForm.nickname ||
                            profileForm.nickname.trim() === "")
                        ) {
                          toast({
                            title: t("common.error"),
                            description: t("profile.nicknameRequired"),
                            variant: "destructive",
                          });
                          return;
                        }
                        if (
                          value === "nickname" &&
                          /\s/.test(profileForm.nickname.trim())
                        ) {
                          toast({
                            title: t("common.error"),
                            description: t(
                              "profile.nicknameNoSpaces",
                              "Ein Spitzname darf keine Leerzeichen enthalten."
                            ),
                            variant: "destructive",
                          });
                          return;
                        }
                        if (
                          value === "nickname" &&
                          !/^[A-Za-z0-9_]+$/.test(profileForm.nickname.trim())
                        ) {
                          toast({
                            title: t("common.error"),
                            description: t(
                              "profile.nicknameInvalidFormat",
                              "Ein Spitzname darf nur Buchstaben, Zahlen und Unterstriche enthalten."
                            ),
                            variant: "destructive",
                          });
                          return;
                        }
                        const nextProfileForm = {
                          ...profileForm,
                          displayPreference: value as
                            | "nickname"
                            | "firstName"
                            | "fullName",
                        };
                        setProfileForm(nextProfileForm);
                        void saveProfileField("displayPreference", nextProfileForm);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="firstName">
                          {t("profile.firstNameOption")}
                        </SelectItem>
                        <SelectItem value="fullName">
                          {t("profile.fullNameOption")}
                        </SelectItem>
                        <SelectItem
                          value="nickname"
                          disabled={
                            !profileForm.nickname ||
                            profileForm.nickname.trim() === "" ||
                            /\s/.test(profileForm.nickname.trim()) ||
                            !/^[A-Za-z0-9_]+$/.test(profileForm.nickname.trim())
                          }
                        >
                          {t("profile.nicknameOption")}{" "}
                          {(!profileForm.nickname ||
                            profileForm.nickname.trim() === "") &&
                            t("profile.nicknameNotSet")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {profileForm.displayPreference === "nickname" &&
                      (!profileForm.nickname ||
                        profileForm.nickname.trim() === "") && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("profile.nicknameRequiredForDisplay")}
                        </p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("profile.bodyWeightOptional", "Körpergewicht (optional)")}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={
                          preferencesForm.metrics.bodyWeightKg
                            ? convertWeightFromKg(
                                preferencesForm.metrics.bodyWeightKg,
                                preferencesForm.units.weight
                              ).toFixed(1)
                            : ""
                        }
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);
                          const kgValue = Number.isFinite(raw)
                            ? convertWeightToKg(raw, preferencesForm.units.weight)
                            : null;
                          savePreference(
                            {
                              metrics: {
                                ...preferencesForm.metrics,
                                bodyWeightKg:
                                  kgValue && kgValue > 0 ? kgValue : null,
                              },
                            },
                            t("profile.bodyWeightOptional", "Körpergewicht")
                          );
                        }}
                        placeholder={t("profile.bodyWeightPlaceholder", "z. B. 72")}
                      />
                      <span className="text-xs text-muted-foreground">
                        {preferencesForm.units.weight}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "profile.bodyWeightHint",
                        "Optional: verbessert die Genauigkeit der Punkteberechnung. Ohne Angabe bleibt alles fair."
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invite Friends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  {t("profile.inviteFriends")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("profile.inviteFriendsDesc")}
                </p>

                <InviteFriendForm onSuccess={handleInviteSuccess} />

                <Separator />

                <div>
                  <Label htmlFor="invite-link">{t("profile.yourInviteLink")}</Label>
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
                    {t("profile.invitedFriends")}
                  </h4>
                  {loadingInvitations ? (
                    <p className="text-sm text-muted-foreground">
                      {t("profile.loadingInvitations")}
                    </p>
                  ) : invitations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("profile.noInvitations")}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {invitations.map((invitation) => {
                        const isExpired =
                          new Date(invitation.expiresAt) < new Date();
                        const isAccepted =
                          invitation.status === "accepted" || invitation.used;

                        return (
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
                                    ).toLocaleDateString(dateLocaleString)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-2 flex items-center gap-2">
                              {getInvitationStatusBadge(invitation)}
                              {isExpired && !isAccepted && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleResendInvitation(invitation.id)
                                    }
                                    className="h-8 w-8 p-0"
                                    title={t("profile.invitationResend")}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteInvitation(invitation.id)
                                    }
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    title={t("common.delete")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                  {t("profile.changePassword")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">
                      {t("profile.currentPassword")}
                    </Label>
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
                    <Label htmlFor="new-password">
                      {t("profile.newPassword")}
                    </Label>
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
                      {t("profile.confirmPassword")}
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
                    {isLoading
                      ? t("profile.passwordChanging")
                      : t("profile.changePassword")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {t("profile.twoFactorAuth")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("profile.enable2FA")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.enable2FADesc")}
                    </p>
                    <p className="text-sm">
                      {t("profile.status")}:{" "}
                      {user.has2FA
                        ? t("profile.activated")
                        : t("profile.deactivated")}
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
                        <p className="font-medium">
                          {t("profile.twoFactorDetails")}
                        </p>
                        <p className="text-muted-foreground">
                          {t("profile.enabledAt")}{" "}
                          {user.twoFactorEnabledAt &&
                            user.twoFactorEnabledAt !== null &&
                            user.twoFactorEnabledAt !== undefined &&
                            user.twoFactorEnabledAt !== "" &&
                            !isNaN(new Date(user.twoFactorEnabledAt).getTime())
                            ? new Date(
                              user.twoFactorEnabledAt
                            ).toLocaleDateString(dateLocaleString, {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : t("profile.notAvailable")}
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
                              title: t("profile.recoveryKeysReset"),
                              description: t("profile.recoveryKeysResetDesc"),
                            });
                          } catch (error) {
                            toast({
                              title: t("common.error"),
                              description:
                                error instanceof Error
                                  ? error.message
                                  : t("profile.recoveryKeysResetError"),
                              variant: "destructive",
                            });
                          }
                        }}
                        className="w-full"
                      >
                        {t("profile.resetRecoveryKeys")}
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
                  {t("profile.accountSecurity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {t("profile.lastLogin")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.lastLoginAt &&
                        user.lastLoginAt !== null &&
                        user.lastLoginAt !== undefined &&
                        user.lastLoginAt !== "" &&
                        !isNaN(new Date(user.lastLoginAt).getTime())
                        ? new Date(user.lastLoginAt).toLocaleDateString(
                          dateLocaleString,
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                        : t("profile.never")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {t("profile.lastPasswordChange")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.passwordChangedAt &&
                        user.passwordChangedAt !== null &&
                        user.passwordChangedAt !== undefined &&
                        user.passwordChangedAt !== "" &&
                        !isNaN(new Date(user.passwordChangedAt).getTime())
                        ? new Date(user.passwordChangedAt).toLocaleDateString(
                          dateLocaleString,
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                        : t("profile.neverChanged")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {t("profile.emailVerification")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.isEmailVerified ? (
                        <span className="text-green-600 dark:text-green-400">
                          {t("profile.verified")}
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {t("profile.notVerified")}
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* Benutzereinstellungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("profile.userPreferences")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("profile.userPreferencesDesc")}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sprache */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("profile.language")}
                  </Label>
                  <Select
                    value={preferencesForm.languagePreference}
                    onValueChange={(value) =>
                      savePreference(
                        { languagePreference: value as "de" | "en" },
                        t("profile.language")
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">{t("profile.german")}</SelectItem>
                      <SelectItem value="en">{t("profile.english")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Uhrzeitformat */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("profile.timeFormat")}
                  </Label>
                  <Select
                    value={preferencesForm.timeFormat}
                    onValueChange={(value) =>
                      savePreference(
                        { timeFormat: value as "12h" | "24h" },
                        t("profile.timeFormat")
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">
                        {t("profile.timeFormat24h")}
                      </SelectItem>
                      <SelectItem value="12h">
                        {t("profile.timeFormat12h")}
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
                      savePreference(
                        { theme: value as "light" | "dark" | "system" },
                        t("profile.theme")
                      );
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
                  {t("profile.unitsPreferences")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("profile.unitsPreferencesDesc")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Distanz */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("profile.distance")}
                  </Label>
                  <Select
                    value={preferencesForm.units.distance}
                    onValueChange={(value) =>
                      savePreference(
                        {
                          units: {
                            ...preferencesForm.units,
                            distance: value as "km" | "m" | "miles" | "yards",
                          },
                        },
                        t("profile.distance")
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">{t("profile.distanceKm")}</SelectItem>
                      <SelectItem value="m">{t("profile.distanceM")}</SelectItem>
                      <SelectItem value="miles">
                        {t("profile.distanceMiles")}
                      </SelectItem>
                      <SelectItem value="yards">
                        {t("profile.distanceYards")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gewicht */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("profile.weight")}
                  </Label>
                  <Select
                    value={preferencesForm.units.weight}
                    onValueChange={(value) =>
                      savePreference(
                        {
                          units: {
                            ...preferencesForm.units,
                            weight: value as "kg" | "lbs",
                          },
                        },
                        t("profile.weight")
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">{t("profile.weightKg")}</SelectItem>
                      <SelectItem value="lbs">{t("profile.weightLbs")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperatur */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("profile.temperature")}
                  </Label>
                  <Select
                    value={preferencesForm.units.temperature}
                    onValueChange={(value) =>
                      savePreference(
                        {
                          units: {
                            ...preferencesForm.units,
                            temperature: value as "celsius" | "fahrenheit",
                          },
                        },
                        t("profile.temperature")
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">
                        {t("profile.temperatureCelsius")}
                      </SelectItem>
                      <SelectItem value="fahrenheit">
                        {t("profile.temperatureFahrenheit")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* App-Einstellungen */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("profile.appSettings")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("profile.emailNotifications")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.emailNotificationsDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={preferencesForm.notifications.email}
                    onCheckedChange={(checked) =>
                      savePreference(
                        {
                          notifications: {
                            ...preferencesForm.notifications,
                            email: checked,
                          },
                        },
                        t("profile.emailNotifications")
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("profile.publicProfileSetting")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.publicProfileDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={preferencesForm.privacy.publicProfile}
                    onCheckedChange={(checked) =>
                      savePreference(
                        {
                          privacy: {
                            ...preferencesForm.privacy,
                            publicProfile: checked,
                          },
                        },
                        t("profile.publicProfileSetting")
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("profile.globalRankingSetting")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.globalRankingDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={showInGlobalRankings}
                    onCheckedChange={handleGlobalRankingToggle}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {t("settings.reactions.friendsCanSee")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.reactions.friendsCanSeeDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.reactions.friendsCanSee}
                      onCheckedChange={(checked) =>
                        savePreference(
                          {
                            reactions: {
                              ...preferencesForm.reactions,
                              friendsCanSee: checked,
                              // Wenn friendsCanSee deaktiviert wird, auch showNames deaktivieren
                              showNames: checked ? preferencesForm.reactions.showNames : false,
                            },
                          },
                          t("settings.reactions.friendsCanSee")
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {t("settings.reactions.showNames")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.reactions.showNamesDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.reactions.showNames}
                      disabled={!preferencesForm.reactions.friendsCanSee}
                      onCheckedChange={(checked) =>
                        savePreference(
                          {
                            reactions: {
                              ...preferencesForm.reactions,
                              showNames: checked,
                            },
                          },
                          t("settings.reactions.showNames")
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Push-Benachrichtigungen */}
          <PushNotificationSettings />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.weeklyGoalsTitle")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {t("profile.weeklyGoalsDesc")}
              </p>
            </CardHeader>
            <CardContent>
              {loadingGoals ? (
                <p className="text-muted-foreground">{t("profile.loading")}</p>
              ) : (
                <form onSubmit={handleGoalsSubmit}>
                  <WeeklyGoalsForm
                    goals={goalsForm}
                    exercises={goalExercises}
                    onChangePoints={(target) => {
                      setGoalsForm((prev) => ({
                        ...prev,
                        points: { ...prev.points, target: Math.max(0, target) },
                      }));
                    }}
                    onChangeExercise={(index, exerciseId) => {
                      setGoalsForm((prev) => {
                        const next = [...prev.exercises];
                        next[index] = { ...next[index], exerciseId };
                        return { ...prev, exercises: next };
                      });
                    }}
                    onChangeExerciseUnit={(index, unit) => {
                      setGoalsForm((prev) => {
                        const next = [...prev.exercises];
                        next[index] = { ...next[index], unit };
                        return { ...prev, exercises: next };
                      });
                    }}
                    onChangeExerciseTarget={(index, target) => {
                      setGoalsForm((prev) => {
                        const next = [...prev.exercises];
                        next[index] = { ...next[index], target: Math.max(0, target) };
                        return { ...prev, exercises: next };
                      });
                    }}
                    onAddExercise={() => {
                      setGoalsForm((prev) => ({
                        ...prev,
                        exercises:
                          prev.exercises.length >= 5
                            ? prev.exercises
                            : [...prev.exercises, { exerciseId: "", target: 0 }],
                      }));
                    }}
                    onRemoveExercise={(index) => {
                      setGoalsForm((prev) => ({
                        ...prev,
                        exercises: prev.exercises.filter((_, idx) => idx !== index),
                      }));
                    }}
                  />
                  <div className="flex flex-col gap-3 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResetGoals}
                      disabled={savingGoals || isLoading}
                    >
                      {t("common.reset")}
                    </Button>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={savingGoals || isLoading}
                    >
                      {savingGoals
                        ? t("profile.weeklyGoalsSaving")
                        : t("profile.weeklyGoalsSaveAction")}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("profile.monthlyGoalTitle", "Monatsziel")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {t(
                  "profile.monthlyGoalDesc",
                  "Lege dein Aktivitätsniveau fest, damit dein Monatsziel realistisch bleibt."
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("profile.activityLevelLabel", "Aktivitätsniveau")}
                </Label>
                <Select
                  value={preferencesForm.metrics.activityLevel}
                  onValueChange={(value) =>
                    savePreference(
                      {
                        metrics: {
                          ...preferencesForm.metrics,
                          activityLevel: value as "low" | "medium" | "high",
                        },
                      },
                      t("profile.activityLevelLabel", "Aktivitätsniveau")
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      {t("profile.activityLevelLow", "Einsteiger")}
                    </SelectItem>
                    <SelectItem value="medium">
                      {t("profile.activityLevelMedium", "Fortgeschritten")}
                    </SelectItem>
                    <SelectItem value="high">
                      {t("profile.activityLevelHigh", "Sehr aktiv")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "profile.activityLevelHint",
                    "Das beeinflusst das automatische Monatsziel, besonders wenn dir noch keine Trainingshistorie vorliegt."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {loadingAchievements ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Awards Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    {t("profile.achievements.awards")}
                  </CardTitle>
                  <Badge variant="outline">{achievements.awards.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.awards.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {t("profile.achievements.noAwards")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("profile.achievements.noAwardsHint")}
                      </p>
                    </div>
                  ) : (
                    achievements.awards.map((award) => (
                      <div
                        key={award.id}
                        className="rounded-lg border bg-card p-4 flex flex-col gap-2 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{award.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {award.type}
                          </Badge>
                        </div>
                        {(award.periodStart || award.periodEnd) && (
                          <p className="text-xs text-muted-foreground">
                            {award.periodStart && award.periodEnd
                              ? `${format(new Date(award.periodStart), "dd.MM.yyyy", { locale: dateLocale })} – ${format(new Date(award.periodEnd), "dd.MM.yyyy", { locale: dateLocale })}`
                              : award.periodStart
                                ? format(
                                  new Date(award.periodStart),
                                  "dd.MM.yyyy",
                                  { locale: dateLocale }
                                )
                                : ""}
                          </p>
                        )}
                        {award.metadata &&
                          Object.keys(award.metadata).length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {Object.entries(award.metadata)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(" · ")}
                            </p>
                          )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Badges Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Medal className="h-5 w-5 text-primary" />
                    {t("profile.achievements.badges")}
                  </CardTitle>
                  <Badge variant="outline">{achievements.badges.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.badges.length === 0 ? (
                    <div className="text-center py-8">
                      <Medal className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {t("profile.achievements.noBadges")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("profile.achievements.noBadgesHint")}
                      </p>
                    </div>
                  ) : (
                    achievements.badges.map((badge) => {
                      const badgeText = getBadgeText(badge, t);
                      return (
                        <div
                          key={badge.id}
                          className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-semibold leading-none mb-1">
                              {badgeText.label}
                            </p>
                            {badgeText.description && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {badgeText.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">
                                {badgeText.category || badge.category}
                              </span>
                              {badge.level && (
                                <>
                                  <span>·</span>
                                  <span>
                                    {t("profile.achievements.level")}{" "}
                                    {badge.level}
                                  </span>
                                </>
                              )}
                              {badge.earnedAt && (
                                <>
                                  <span>·</span>
                                  <span>
                                    {format(
                                      new Date(badge.earnedAt),
                                      "dd.MM.yyyy",
                                      { locale: dateLocale }
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {badge.icon && (
                            <Badge
                              variant="secondary"
                              className="text-xs uppercase ml-3"
                            >
                              {badgeText.icon || badge.icon.replace("badge-", "")}
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progress Summary */}
          {!loadingAchievements &&
            Object.keys(achievements.progress).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-500" />
                    {t("profile.achievements.progress")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(achievements.progress).map(
                      ([slug, data]) => (
                        <div
                          key={slug}
                          className="rounded-lg border bg-muted/30 p-3"
                        >
                          <p className="text-sm font-medium capitalize">
                            {slug.replace(/-/g, " ")}
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {data.counter}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(
                              "profile.achievements.timesAchieved"
                            )}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Empty State */}
          {!loadingAchievements &&
            achievements.badges.length === 0 &&
            achievements.awards.length === 0 &&
            Object.keys(achievements.progress).length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {t("profile.achievements.startYourJourney")}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t("profile.achievements.startYourJourneyDescription")}
                  </p>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" />
                {t("profile.dangerZone")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-destructive mb-2">
                    {t("profile.deleteAccount")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("profile.deleteAccountWarning")}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
                    <li>{t("profile.deleteAccountList.data")}</li>
                    <li>{t("profile.deleteAccountList.achievements")}</li>
                    <li>{t("profile.deleteAccountList.friendships")}</li>
                    <li>{t("profile.deleteAccountList.profile")}</li>
                    <li>{t("profile.deleteAccountList.irreversible")}</li>
                  </ul>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  {t("profile.deleteAccount")}
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

      <GlobalRankingWarningDialog
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={() => performGlobalRankingUpdate(false)}
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
