import { PageTemplate } from "@/components/PageTemplate";
import { PublicHeader } from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import {
  Award,
  BarChart3,
  Bell,
  Calendar,
  Camera,
  Heart,
  History,
  Rocket,
  Save,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "feature" | "improvement" | "fix";
  highlights: string[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: "1.5.0",
    date: "2024-12-01",
    title: "Web Push Notifications",
    description:
      "Erhalte Push-Benachrichtigungen direkt auf dein Gerät – auch wenn die App geschlossen ist.",
    icon: <Bell className="h-5 w-5" />,
    type: "feature",
    highlights: [
      "Push-Benachrichtigungen für Freundschaftsanfragen",
      "Benachrichtigungen für neue Badges und Erfolge",
      "Einfache Aktivierung in den Einstellungen",
      "Funktioniert auf Desktop und mobilen Geräten",
    ],
  },
  {
    version: "1.4.0",
    date: "2024-11-28",
    title: "Auto-Save in Einstellungen",
    description:
      "Alle Einstellungen werden jetzt automatisch gespeichert – kein Speichern-Button mehr nötig.",
    icon: <Save className="h-5 w-5" />,
    type: "improvement",
    highlights: [
      "Sofortige Speicherung bei jeder Änderung",
      "Toast-Benachrichtigung bei erfolgreicher Speicherung",
      "Kein Aufblitzen der Seite mehr beim Speichern",
      "Gilt für Profil- und Einstellungsseite",
    ],
  },
  {
    version: "1.3.0",
    date: "2024-11-25",
    title: "Freundes-Aktivitäten",
    description:
      "Neue dedizierte Seite für alle Trainingsaktivitäten von dir und deinen Freunden.",
    icon: <Users className="h-5 w-5" />,
    type: "feature",
    highlights: [
      "Übersicht aller Trainings von Freunden",
      "Filterung nach Zeitraum",
      "Kompaktes, übersichtliches Design",
      "Direkter Link zum Freundesprofil",
    ],
  },
  {
    version: "1.2.0",
    date: "2024-11-22",
    title: "Freundesprofile",
    description:
      "Sieh dir die Profile deiner Freunde an – mit Auszeichnungen, Badges und letzten Aktivitäten.",
    icon: <Heart className="h-5 w-5" />,
    type: "feature",
    highlights: [
      "Anzeige von Auszeichnungen und Badges",
      "Letzte Trainingsaktivitäten",
      "Beitrittsdatum und Statistiken",
      "Klickbare Avatare und Namen",
    ],
  },
  {
    version: "1.1.0",
    date: "2024-11-18",
    title: "Verbesserte Zeitraum-Navigation",
    description:
      "Navigiere einfach zwischen Wochen, Monaten und Jahren mit den neuen Pfeiltasten.",
    icon: <Calendar className="h-5 w-5" />,
    type: "improvement",
    highlights: [
      "Pfeiltasten für vorherige/nächste Periode",
      "Dynamische Anzeige des aktuellen Zeitraums (z.B. 'KW 48')",
      "Tooltip mit vollständigem Datumsbereich",
      "Schneller 'Aktuell'-Button",
    ],
  },
  {
    version: "1.0.0",
    date: "2024-11-15",
    title: "Notification Center",
    description:
      "Zentrales Benachrichtigungscenter für alle wichtigen Updates und Anfragen.",
    icon: <Bell className="h-5 w-5" />,
    type: "feature",
    highlights: [
      "Freundschaftsanfragen und -antworten",
      "Badge- und Award-Benachrichtigungen",
      "Ungelesene Nachrichten-Indikator",
      "Automatisches Markieren als gelesen",
    ],
  },
  {
    version: "0.9.0",
    date: "2024-11-10",
    title: "Überarbeitete Statistiken",
    description:
      "Komplett neu gestaltete Statistikseite mit detaillierten Analysen und Visualisierungen.",
    icon: <BarChart3 className="h-5 w-5" />,
    type: "improvement",
    highlights: [
      "Aktivitäts-Timeline mit Heatmap",
      "Trainingsverteilung nach Typ",
      "Erholungs- und Recovery-Metriken",
      "Wochenvergleich und Trends",
    ],
  },
  {
    version: "0.8.0",
    date: "2024-11-05",
    title: "Erfolge und Badges",
    description:
      "Verdiene Badges und Auszeichnungen für deine sportlichen Leistungen.",
    icon: <Award className="h-5 w-5" />,
    type: "feature",
    highlights: [
      "Verschiedene Badge-Kategorien",
      "Fortschrittsanzeige für Badges",
      "Wöchentliche und monatliche Awards",
      "Anzeige im Profil und bei Freunden",
    ],
  },
  {
    version: "0.7.0",
    date: "2024-10-28",
    title: "Personalisierte Profilbilder",
    description:
      "Erstelle deinen eigenen Avatar mit vielen Anpassungsmöglichkeiten.",
    icon: <Camera className="h-5 w-5" />,
    type: "feature",
    highlights: [
      "Avatar-Editor mit vielen Optionen",
      "Verschiedene Frisuren, Gesichter und Accessoires",
      "Farbauswahl für alle Elemente",
      "Zufalls-Generator für schnelle Erstellung",
    ],
  },
  {
    version: "0.6.0",
    date: "2024-10-20",
    title: "Erste öffentliche Version",
    description:
      "Der Start von Sportify – deine persönliche Fitness-Tracking-Plattform.",
    icon: <Rocket className="h-5 w-5" />,
    type: "feature",
    highlights: [
      "Workout-Tracking mit Punktesystem",
      "Rangliste mit Freunden",
      "Wochenziele setzen und verfolgen",
      "Dark Mode und Sprachauswahl",
    ],
  },
];

const typeColors = {
  feature:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  improvement:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  fix: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

const typeLabels = {
  feature: "Neu",
  improvement: "Verbesserung",
  fix: "Bugfix",
};

// Changelog-Content als separate Komponente für Wiederverwendung
function ChangelogContent() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {t("changelog.stayUpdated", "Bleib auf dem Laufenden")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(
                  "changelog.description",
                  "Hier findest du alle wichtigen Updates und neuen Features von Sportify."
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {changelogData.map((entry, index) => (
            <div key={entry.version} className="relative pl-16">
              {/* Timeline Dot */}
              <div className="absolute left-0 top-0 flex items-center justify-center w-14 h-14 rounded-full bg-background border-2 border-border shadow-sm">
                <div
                  className={`p-2 rounded-full ${
                    entry.type === "feature"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : entry.type === "improvement"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {entry.icon}
                </div>
              </div>

              <Card
                className={`transition-all hover:shadow-md ${
                  index === 0 ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          v{entry.version}
                        </Badge>
                        <Badge className={typeColors[entry.type]}>
                          {typeLabels[entry.type]}
                        </Badge>
                        {index === 0 && (
                          <Badge className="bg-primary text-primary-foreground">
                            {t("changelog.latest", "Aktuell")}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                    </div>
                    <time className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4">
                    {entry.description}
                  </p>
                  <Separator className="mb-4" />
                  <ul className="space-y-2">
                    {entry.highlights.map((highlight, hIndex) => (
                      <li
                        key={hIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <History className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          {t(
            "changelog.moreUpdates",
            "Weitere Updates folgen – bleib gespannt! 🚀"
          )}
        </p>
      </div>
    </div>
  );
}

export function Changelog() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Für eingeloggte Benutzer: PageTemplate verwenden
  if (isAuthenticated) {
    return (
      <PageTemplate
        title={t("changelog.title", "Changelog")}
        subtitle={t(
          "changelog.subtitle",
          "Alle Neuerungen und Verbesserungen auf einen Blick"
        )}
      >
        <ChangelogContent />
      </PageTemplate>
    );
  }

  // Für nicht-eingeloggte Benutzer: Öffentliches Layout (wie Legal-Seiten)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PublicHeader
        showBackButton={true}
        backText={t("legal.backToHome")}
        title={t("changelog.title", "Changelog")}
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Titel */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t("changelog.title", "Changelog")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "changelog.subtitle",
              "Alle Neuerungen und Verbesserungen auf einen Blick"
            )}
          </p>
        </div>

        <ChangelogContent />
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">{t("common.copyright")}</p>
          <div className="flex justify-center gap-6 mt-4 flex-wrap">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("landing.footerLinks.privacy")}
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("landing.footerLinks.terms")}
            </Link>
            <Link
              to="/imprint"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("landing.footerLinks.imprint")}
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("landing.footerLinks.contact")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
