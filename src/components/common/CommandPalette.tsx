import {
  Activity,
  BarChart,
  Bell,
  BellOff,
  Check,
  ChevronLeft,
  Clock,
  Dumbbell,
  FileText,
  Globe,
  Heart,
  History,
  Home,
  Mail,
  MailX,
  Monitor,
  Moon,
  Plus,
  Ruler,
  Search,
  Settings,
  Shield,
  Sun,
  Target,
  Thermometer,
  User,
  UserPlus,
  Users,
  Weight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { API_URL } from "@/lib/api";

type Page = "root" | "templates";

interface Friend {
  id: string;
  displayName: string;
}

interface Template {
  id: string;
  title: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<Page>("root");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  const isAdmin = user?.role === "admin";

  // Keyboard shortcut: Cmd+K / Ctrl+K (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  // Load friends when palette opens
  useEffect(() => {
    if (!open) return;

    const loadFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          setFriends([]);
          return;
        }
        const data = await response.json();
        setFriends(
          Array.isArray(data)
            ? data.map((f: Record<string, string>) => ({
              id: f.id,
              displayName:
                f.displayName ||
                f.display_name ||
                f.firstName ||
                f.first_name ||
                t("commandPalette.unknownFriend"),
            }))
            : []
        );
      } catch {
        // silently ignore
      }
    };

    loadFriends();
  }, [open, t]);

  // Load templates when entering template page
  const loadTemplates = useCallback(async () => {
    if (loadingTemplates) return;
    setLoadingTemplates(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/workouts/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setTemplates([]);
        return;
      }
      const data = await response.json();
      setTemplates(
        Array.isArray(data.templates)
          ? data.templates.map((tmpl: Record<string, string>) => ({
            id: tmpl.id,
            title: tmpl.title || t("commandPalette.defaultTemplateTitle"),
          }))
          : []
      );
    } catch {
      // silently ignore
    } finally {
      setLoadingTemplates(false);
    }
  }, [loadingTemplates, t]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage("root");
    }
  }, [open]);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  // Navigate helper that forces re-render even when already on the same route
  const navigateTo = useCallback(
    (path: string) => {
      runCommand(() => {
        const currentPath = location.pathname + location.search;
        if (currentPath === path) {
          navigate(path, { replace: true });
          // React Router may not re-run loaders; dispatch so pages can refresh
          window.dispatchEvent(new CustomEvent("command-palette-navigate", { detail: { path } }));
        } else {
          navigate(path);
        }
      });
    },
    [navigate, runCommand, location.pathname, location.search]
  );

  // Handle back navigation in sub-pages
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (page !== "root" && e.key === "Backspace" && search === "") {
        e.preventDefault();
        setPage("root");
      }
    },
    [page, search]
  );

  // Build full profile update payload (same pattern as Profile.tsx savePreference)
  const buildPreferenceUpdate = useCallback(
    (preferenceOverrides: Record<string, unknown>) => {
      const currentPrefs = user?.preferences;
      const mergedPreferences = {
        timeFormat: currentPrefs?.timeFormat || "24h",
        units: {
          distance: currentPrefs?.units?.distance || "km",
          weight: currentPrefs?.units?.weight || "kg",
          temperature: currentPrefs?.units?.temperature || "celsius",
        },
        notifications: {
          push: currentPrefs?.notifications?.push ?? true,
          email: currentPrefs?.notifications?.email ?? true,
        },
        privacy: {
          publicProfile: currentPrefs?.privacy?.publicProfile ?? true,
        },
        reactions: {
          friendsCanSee: currentPrefs?.reactions?.friendsCanSee ?? true,
          showNames: currentPrefs?.reactions?.showNames ?? true,
        },
        theme: currentPrefs?.theme || "system",
        metrics: {
          bodyWeightKg: currentPrefs?.metrics?.bodyWeightKg ?? null,
          activityLevel: currentPrefs?.metrics?.activityLevel || "medium",
        },
      };

      // Deep merge overrides
      for (const [key, value] of Object.entries(preferenceOverrides)) {
        if (key === "units" && typeof value === "object" && value !== null) {
          Object.assign(mergedPreferences.units, value);
        } else if (key === "notifications" && typeof value === "object" && value !== null) {
          Object.assign(mergedPreferences.notifications, value);
        } else {
          (mergedPreferences as Record<string, unknown>)[key] = value;
        }
      }

      return {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        nickname: user?.nickname || "",
        displayPreference: user?.displayPreference || "firstName",
        languagePreference: user?.languagePreference || "de",
        preferences: mergedPreferences,
        avatar: user?.avatar || undefined,
        showInGlobalRankings: user?.showInGlobalRankings ?? true,
      } as Parameters<typeof updateProfile>[0];
    },
    [user]
  );

  const savePreference = useCallback(
    (preferenceOverrides: Record<string, unknown>) => {
      const payload = buildPreferenceUpdate(preferenceOverrides);
      updateProfile(payload, true);
    },
    [buildPreferenceUpdate, updateProfile]
  );

  // Current preference values for checkmarks
  const currentLang = i18n.language;
  const currentTheme = theme || "system";
  const currentTimeFormat = user?.preferences?.timeFormat || "24h";
  const currentWeight = user?.preferences?.units?.weight || "kg";
  const currentDistance = user?.preferences?.units?.distance || "km";
  const currentTemp = user?.preferences?.units?.temperature || "celsius";
  const pushEnabled = user?.preferences?.notifications?.push ?? true;
  const emailEnabled = user?.preferences?.notifications?.email ?? true;

  // Memoize friends list for rendering
  const friendItems = useMemo(
    () => friends.slice(0, 15),
    [friends]
  );

  if (page === "templates") {
    return (
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        dialogTitle={t("commandPalette.dialogTitle")}
        dialogDescription={t("commandPalette.dialogDescription")}
      >
        <CommandInput
          placeholder={t("commandPalette.groups.templates")}
          value={search}
          onValueChange={setSearch}
          onKeyDown={handleKeyDown}
        />
        <CommandList className="max-h-[min(70vh,420px)]">
          <CommandEmpty>{t("commandPalette.noResults")}</CommandEmpty>
          <CommandGroup heading={t("commandPalette.groups.templates")}>
            <CommandItem
              onSelect={() => {
                setPage("root");
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("commandPalette.items.back")}
            </CommandItem>
            <CommandItem
              onSelect={() => navigateTo("/training")}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              {t("commandPalette.items.ownTraining")}
            </CommandItem>
            {templates.map((template) => (
              <CommandItem
                key={template.id}
                value={template.title}
                onSelect={() =>
                  navigateTo(`/training?templateId=${template.id}`)
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                {template.title}
              </CommandItem>
            ))}
            {loadingTemplates && (
              <CommandItem disabled>
                <span className="text-muted-foreground text-sm">
                  {t("common.loading")}
                </span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    );
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      dialogTitle={t("commandPalette.dialogTitle")}
      dialogDescription={t("commandPalette.dialogDescription")}
    >
      <CommandInput
        placeholder={t("commandPalette.searchPlaceholder")}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[min(70vh,420px)]">
        <CommandEmpty>{t("commandPalette.noResults")}</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading={t("commandPalette.groups.navigation")}>
          <CommandItem
            value="dashboard"
            onSelect={() => navigateTo("/dashboard")}
            keywords={["home", "start", "übersicht", "overview"]}
          >
            <Home className="mr-2 h-4 w-4" />
            {t("commandPalette.items.dashboard")}
          </CommandItem>
          <CommandItem
            value="scoreboard friends rangliste freunde"
            onSelect={() => navigateTo("/scoreboard?scope=friends")}
            keywords={["ranking", "leaderboard"]}
          >
            <Users className="mr-2 h-4 w-4" />
            {t("commandPalette.items.scoreboardFriends")}
          </CommandItem>
          <CommandItem
            value="scoreboard global rangliste"
            onSelect={() => navigateTo("/scoreboard?scope=global")}
            keywords={["ranking", "leaderboard", "welt"]}
          >
            <Globe className="mr-2 h-4 w-4" />
            {t("commandPalette.items.scoreboardGlobal")}
          </CommandItem>
          <CommandItem
            value="vergangene workouts past"
            onSelect={() => navigateTo("/my-workouts")}
            keywords={["historie", "history", "workout"]}
          >
            <History className="mr-2 h-4 w-4" />
            {t("commandPalette.items.pastWorkouts")}
          </CommandItem>
          <CommandItem
            value="statistiken statistics stats"
            onSelect={() => navigateTo("/stats")}
            keywords={["analytics", "auswertung", "chart"]}
          >
            <BarChart className="mr-2 h-4 w-4" />
            {t("commandPalette.items.statistics")}
          </CommandItem>
          <CommandItem
            value="changelog updates version"
            onSelect={() => navigateTo("/changelog")}
            keywords={["news", "neuigkeiten"]}
          >
            <History className="mr-2 h-4 w-4" />
            {t("commandPalette.items.changelog")}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Training */}
        <CommandGroup heading={t("commandPalette.groups.training")}>
          <CommandItem
            value="training starten eigenes start"
            onSelect={() => navigateTo("/training")}
            keywords={["workout", "beginnen"]}
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            {t("commandPalette.items.startTraining")}
          </CommandItem>
          <CommandItem
            value="training vorlage template"
            onSelect={() => {
              setPage("templates");
              setSearch("");
              loadTemplates();
            }}
            keywords={["workout", "plan"]}
          >
            <FileText className="mr-2 h-4 w-4" />
            {t("commandPalette.items.trainingFromTemplate")}
          </CommandItem>
          <CommandItem
            value="erholung recovery tagebuch diary"
            onSelect={() => navigateTo("/training?tab=recovery")}
            keywords={["regeneration", "schlaf", "sleep"]}
          >
            <Heart className="mr-2 h-4 w-4" />
            {t("commandPalette.items.recoveryDiary")}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Übungen */}
        <CommandGroup heading={t("commandPalette.groups.exercises")}>
          <CommandItem
            value="übung erstellen create exercise"
            onSelect={() => navigateTo("/exercises")}
            keywords={["neu", "new", "anlegen"]}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("commandPalette.items.createExercise")}
          </CommandItem>
          <CommandItem
            value="übungen durchsuchen browse exercises"
            onSelect={() => navigateTo("/exercises?section=browse")}
            keywords={["suchen", "search", "finden"]}
          >
            <Search className="mr-2 h-4 w-4" />
            {t("commandPalette.items.browseExercises")}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Social */}
        <CommandGroup heading={t("commandPalette.groups.social")}>
          <CommandItem
            value="freunde friends"
            onSelect={() => navigateTo("/friends")}
            keywords={["social", "kontakte"]}
          >
            <Users className="mr-2 h-4 w-4" />
            {t("commandPalette.items.friends")}
          </CommandItem>
          <CommandItem
            value="freunde aktivitäten activities"
            onSelect={() => navigateTo("/friends/activities")}
            keywords={["feed", "neuigkeiten"]}
          >
            <Activity className="mr-2 h-4 w-4" />
            {t("commandPalette.items.friendsActivity")}
          </CommandItem>
          <CommandItem
            value="freunde einladen invite"
            onSelect={() => navigateTo("/profile?tab=profile")}
            keywords={["email", "einladung"]}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t("commandPalette.items.inviteFriends")}
          </CommandItem>
          <CommandItem
            value="profil profile"
            onSelect={() => navigateTo("/profile")}
            keywords={["konto", "account", "mein"]}
          >
            <User className="mr-2 h-4 w-4" />
            {t("commandPalette.items.profile")}
          </CommandItem>
        </CommandGroup>

        {/* Friends list */}
        {friendItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("commandPalette.groups.friends")}>
              {friendItems.map((friend) => (
                <CommandItem
                  key={friend.id}
                  value={`freund friend ${friend.displayName}`}
                  onSelect={() => navigateTo(`/friends/${friend.id}`)}
                >
                  <User className="mr-2 h-4 w-4" />
                  {friend.displayName}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        {/* Einstellungen Navigation */}
        <CommandGroup heading={t("commandPalette.groups.settings")}>
          <CommandItem
            value="einheitenpräferenzen unit preferences einheiten"
            onSelect={() => navigateTo("/profile?tab=preferences")}
            keywords={["gewicht", "distanz", "temperatur"]}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t("commandPalette.items.unitPreferences")}
          </CommandItem>
          <CommandItem
            value="benutzereinstellungen user settings"
            onSelect={() => navigateTo("/profile?tab=preferences")}
            keywords={["einstellungen", "preferences"]}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t("commandPalette.items.userSettings")}
          </CommandItem>
          <CommandItem
            value="profilinformationen profile information"
            onSelect={() => navigateTo("/profile?tab=profile")}
            keywords={["name", "nickname", "avatar"]}
          >
            <User className="mr-2 h-4 w-4" />
            {t("commandPalette.items.profileInfo")}
          </CommandItem>
          <CommandItem
            value="wochenziele weekly goals ziele"
            onSelect={() => navigateTo("/profile?tab=goals")}
            keywords={["targets", "punkte", "points"]}
          >
            <Target className="mr-2 h-4 w-4" />
            {t("commandPalette.items.weeklyGoals")}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading={t("commandPalette.groups.quickActions")}>
          {/* Language */}
          <CommandItem
            value="sprache deutsch german language"
            onSelect={() =>
              runCommand(() => {
                i18n.changeLanguage("de");
                const payload = buildPreferenceUpdate({});
                (payload as Record<string, unknown>).languagePreference = "de";
                updateProfile(payload, true);
              })
            }
          >
            <Globe className="mr-2 h-4 w-4" />
            {t("commandPalette.items.language")}: {t("commandPalette.languageDe")}
            {currentLang === "de" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>
          <CommandItem
            value="sprache english language"
            onSelect={() =>
              runCommand(() => {
                i18n.changeLanguage("en");
                const payload = buildPreferenceUpdate({});
                (payload as Record<string, unknown>).languagePreference = "en";
                updateProfile(payload, true);
              })
            }
          >
            <Globe className="mr-2 h-4 w-4" />
            {t("commandPalette.items.language")}: {t("commandPalette.languageEn")}
            {currentLang === "en" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>

          {/* Theme */}
          <CommandItem
            value="theme hell light"
            onSelect={() => runCommand(() => setTheme("light"))}
          >
            <Sun className="mr-2 h-4 w-4" />
            {t("commandPalette.items.themeLight")}
            {currentTheme === "light" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>
          <CommandItem
            value="theme dunkel dark"
            onSelect={() => runCommand(() => setTheme("dark"))}
          >
            <Moon className="mr-2 h-4 w-4" />
            {t("commandPalette.items.themeDark")}
            {currentTheme === "dark" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>
          <CommandItem
            value="theme system gerät device auto"
            onSelect={() => runCommand(() => setTheme("system"))}
          >
            <Monitor className="mr-2 h-4 w-4" />
            {t("commandPalette.items.themeSystem")}
            {currentTheme === "system" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>

          {/* Time Format */}
          <CommandItem
            value="zeitformat 24 stunden time format uhrzeit"
            onSelect={() =>
              runCommand(() => savePreference({ timeFormat: "24h" }))
            }
          >
            <Clock className="mr-2 h-4 w-4" />
            {t("commandPalette.items.timeFormat24")}
            {currentTimeFormat === "24h" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>
          <CommandItem
            value="zeitformat 12 stunden time format uhrzeit"
            onSelect={() =>
              runCommand(() => savePreference({ timeFormat: "12h" }))
            }
          >
            <Clock className="mr-2 h-4 w-4" />
            {t("commandPalette.items.timeFormat12")}
            {currentTimeFormat === "12h" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>

          {/* Weight Unit */}
          <CommandItem
            value="gewicht kg kilogramm weight"
            onSelect={() =>
              runCommand(() => savePreference({ units: { weight: "kg" } }))
            }
          >
            <Weight className="mr-2 h-4 w-4" />
            {t("commandPalette.items.weightKg")}
            {currentWeight === "kg" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>
          <CommandItem
            value="gewicht lbs pounds weight"
            onSelect={() =>
              runCommand(() => savePreference({ units: { weight: "lbs" } }))
            }
          >
            <Weight className="mr-2 h-4 w-4" />
            {t("commandPalette.items.weightLbs")}
            {currentWeight === "lbs" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>

          {/* Distance Unit */}
          <CommandItem
            value="distanz km kilometer distance"
            onSelect={() =>
              runCommand(() => savePreference({ units: { distance: "km" } }))
            }
          >
            <Ruler className="mr-2 h-4 w-4" />
            {t("commandPalette.items.distanceKm")}
            {(currentDistance === "km" || currentDistance === "m") && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>
          <CommandItem
            value="distanz meilen miles distance"
            onSelect={() =>
              runCommand(() => savePreference({ units: { distance: "miles" } }))
            }
          >
            <Ruler className="mr-2 h-4 w-4" />
            {t("commandPalette.items.distanceMiles")}
            {(currentDistance === "miles" || currentDistance === "yards") && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>

          {/* Temperature Unit */}
          <CommandItem
            value="temperatur celsius °C temperature"
            onSelect={() =>
              runCommand(() => savePreference({ units: { temperature: "celsius" } }))
            }
          >
            <Thermometer className="mr-2 h-4 w-4" />
            {t("commandPalette.items.tempCelsius")}
            {currentTemp === "celsius" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>
          <CommandItem
            value="temperatur fahrenheit °F temperature"
            onSelect={() =>
              runCommand(() => savePreference({ units: { temperature: "fahrenheit" } }))
            }
          >
            <Thermometer className="mr-2 h-4 w-4" />
            {t("commandPalette.items.tempFahrenheit")}
            {currentTemp === "fahrenheit" && (
              <Check className="ml-auto h-4 w-4 text-primary" />
            )}
          </CommandItem>

          {/* Notifications */}
          <CommandItem
            value="push benachrichtigungen notifications"
            onSelect={() =>
              runCommand(() =>
                savePreference({ notifications: { push: !pushEnabled } })
              )
            }
          >
            {pushEnabled ? (
              <Bell className="mr-2 h-4 w-4" />
            ) : (
              <BellOff className="mr-2 h-4 w-4" />
            )}
            {t("commandPalette.items.pushNotifications")}
            <span className="ml-auto text-xs text-muted-foreground">
              {pushEnabled
                ? t("commandPalette.items.on")
                : t("commandPalette.items.off")}
            </span>
          </CommandItem>
          <CommandItem
            value="email benachrichtigungen notifications"
            onSelect={() =>
              runCommand(() =>
                savePreference({ notifications: { email: !emailEnabled } })
              )
            }
          >
            {emailEnabled ? (
              <Mail className="mr-2 h-4 w-4" />
            ) : (
              <MailX className="mr-2 h-4 w-4" />
            )}
            {t("commandPalette.items.emailNotifications")}
            <span className="ml-auto text-xs text-muted-foreground">
              {emailEnabled
                ? t("commandPalette.items.on")
                : t("commandPalette.items.off")}
            </span>
          </CommandItem>
        </CommandGroup>

        {/* Admin */}
        {isAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("commandPalette.groups.admin")}>
              <CommandItem
                value="admin übersicht overview"
                onSelect={() => navigateTo("/admin?tab=overview")}
                keywords={["panel", "dashboard"]}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("commandPalette.items.adminOverview")}
              </CommandItem>
              <CommandItem
                value="admin benutzerverwaltung user management users"
                onSelect={() => navigateTo("/admin?tab=users")}
                keywords={["benutzer", "nutzer"]}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("commandPalette.items.adminUsers")}
              </CommandItem>
              <CommandItem
                value="admin übungsverwaltung exercise management exercises"
                onSelect={() => navigateTo("/admin?tab=exercise-management")}
                keywords={["übungen"]}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("commandPalette.items.adminExercises")}
              </CommandItem>
              <CommandItem
                value="admin moderation reports"
                onSelect={() => navigateTo("/admin?tab=moderation")}
                keywords={["meldungen", "berichte"]}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("commandPalette.items.adminModeration")}
              </CommandItem>
              <CommandItem
                value="admin monitoring system"
                onSelect={() => navigateTo("/admin?tab=monitoring")}
                keywords={["server", "jobs", "status"]}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("commandPalette.items.adminMonitoring")}
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          {typeof navigator !== "undefined" &&
          /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? "")
            ? t("commandPalette.shortcutMac")
            : t("commandPalette.shortcutWin")}
        </kbd>
        <span>{t("commandPalette.searchPlaceholder")}</span>
      </div>
    </CommandDialog>
  );
}
