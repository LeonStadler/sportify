import { PageTemplate } from "@/components/common/PageTemplate";
import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicPageLayout } from "@/components/common/PublicPageLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  Database,
  Heart,
  History,
  Keyboard,
  LucideIcon,
  Mail,
  Rocket,
  Save,
  Share2,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface ChangelogEntry {
  version: string;
  date: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  type: "feature" | "improvement" | "fix";
  highlightKeys: string[];
}

// Changelog-Daten mit i18n-Keys
const changelogEntries: ChangelogEntry[] = [
  {
    version: "2.1.0",
    date: "2026-02-07",
    titleKey: "changelog.entries.v210.title",
    descriptionKey: "changelog.entries.v210.description",
    icon: BarChart3,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v210.highlights.0",
      "changelog.entries.v210.highlights.1",
      "changelog.entries.v210.highlights.2",
      "changelog.entries.v210.highlights.3",
      "changelog.entries.v210.highlights.4",
    ],
  },
  {
    version: "2.0.5",
    date: "2026-02-06",
    titleKey: "changelog.entries.v205.title",
    descriptionKey: "changelog.entries.v205.description",
    icon: BookOpen,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v205.highlights.0",
      "changelog.entries.v205.highlights.1",
      "changelog.entries.v205.highlights.2",
      "changelog.entries.v205.highlights.3",
      "changelog.entries.v205.highlights.4",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-02-06",
    titleKey: "changelog.entries.v200.title",
    descriptionKey: "changelog.entries.v200.description",
    icon: Database,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v200.highlights.0",
      "changelog.entries.v200.highlights.1",
      "changelog.entries.v200.highlights.2",
      "changelog.entries.v200.highlights.3",
      "changelog.entries.v200.highlights.4",
      "changelog.entries.v200.highlights.5",
      "changelog.entries.v200.highlights.6",
    ],
  },
  {
    version: "1.9.9",
    date: "2026-02-05",
    titleKey: "changelog.entries.v199.title",
    descriptionKey: "changelog.entries.v199.description",
    icon: Award,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v199.highlights.0",
      "changelog.entries.v199.highlights.1",
      "changelog.entries.v199.highlights.2",
      "changelog.entries.v199.highlights.3",
      "changelog.entries.v199.highlights.4",
      "changelog.entries.v199.highlights.5",
    ],
  },
  {
    version: "1.9.8",
    date: "2026-02-02",
    titleKey: "changelog.entries.v198.title",
    descriptionKey: "changelog.entries.v198.description",
    icon: Wrench,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v198.highlights.0",
      "changelog.entries.v198.highlights.1",
      "changelog.entries.v198.highlights.2",
      "changelog.entries.v198.highlights.3",
    ],
  },
  {
    version: "1.9.7",
    date: "2026-01-30",
    titleKey: "changelog.entries.v197.title",
    descriptionKey: "changelog.entries.v197.description",
    icon: Calendar,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v197.highlights.0",
      "changelog.entries.v197.highlights.1",
      "changelog.entries.v197.highlights.2",
      "changelog.entries.v197.highlights.3",
    ],
  },
  {
    version: "1.9.6",
    date: "2026-01-26",
    titleKey: "changelog.entries.v196.title",
    descriptionKey: "changelog.entries.v196.description",
    icon: BarChart3,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v196.highlights.0",
      "changelog.entries.v196.highlights.1",
      "changelog.entries.v196.highlights.2",
      "changelog.entries.v196.highlights.3",
    ],
  },
  {
    version: "1.9.5",
    date: "2026-01-22",
    titleKey: "changelog.entries.v195.title",
    descriptionKey: "changelog.entries.v195.description",
    icon: Sparkles,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v195.highlights.0",
      "changelog.entries.v195.highlights.1",
      "changelog.entries.v195.highlights.2",
      "changelog.entries.v195.highlights.3",
    ],
  },
  {
    version: "1.9.4",
    date: "2026-01-18",
    titleKey: "changelog.entries.v194.title",
    descriptionKey: "changelog.entries.v194.description",
    icon: BookOpen,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v194.highlights.0",
      "changelog.entries.v194.highlights.1",
    ],
  },
  {
    version: "1.9.3",
    date: "2026-01-11",
    titleKey: "changelog.entries.v193.title",
    descriptionKey: "changelog.entries.v193.description",
    icon: Users,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v193.highlights.0",
      "changelog.entries.v193.highlights.1",
      "changelog.entries.v193.highlights.2",
    ],
  },
  {
    version: "1.9.2",
    date: "2026-01-04",
    titleKey: "changelog.entries.v192.title",
    descriptionKey: "changelog.entries.v192.description",
    icon: History,
    type: "fix",
    highlightKeys: [
      "changelog.entries.v192.highlights.0",
      "changelog.entries.v192.highlights.1",
      "changelog.entries.v192.highlights.2",
    ],
  },
  {
    version: "1.9.0",
    date: "2026-01-04",
    titleKey: "changelog.entries.v190.title",
    descriptionKey: "changelog.entries.v190.description",
    icon: Heart,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v190.highlights.0",
      "changelog.entries.v190.highlights.1",
      "changelog.entries.v190.highlights.2",
      "changelog.entries.v190.highlights.3",
      "changelog.entries.v190.highlights.4",
      "changelog.entries.v190.highlights.5",
    ],
  },
  {
    version: "1.8.5",
    date: "2026-01-04",
    titleKey: "changelog.entries.v185.title",
    descriptionKey: "changelog.entries.v185.description",
    icon: Keyboard,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v185.highlights.0",
      "changelog.entries.v185.highlights.1",
      "changelog.entries.v185.highlights.2",
      "changelog.entries.v185.highlights.3",
      "changelog.entries.v185.highlights.4",
      "changelog.entries.v185.highlights.5",
      "changelog.entries.v185.highlights.6",
    ],
  },
  {
    version: "1.8.0",
    date: "2025-12-26",
    titleKey: "changelog.entries.v180.title",
    descriptionKey: "changelog.entries.v180.description",
    icon: Sparkles,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v180.highlights.0",
      "changelog.entries.v180.highlights.1",
      "changelog.entries.v180.highlights.2",
      "changelog.entries.v180.highlights.3",
      "changelog.entries.v180.highlights.4",
      "changelog.entries.v180.highlights.5",
    ],
  },
  {
    version: "1.7.0",
    date: "2024-12-15",
    titleKey: "changelog.entries.v170.title",
    descriptionKey: "changelog.entries.v170.description",
    icon: Share2,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v170.highlights.0",
      "changelog.entries.v170.highlights.1",
      "changelog.entries.v170.highlights.2",
      "changelog.entries.v170.highlights.3",
    ],
  },
  {
    version: "1.6.0",
    date: "2024-12-10",
    titleKey: "changelog.entries.v160.title",
    descriptionKey: "changelog.entries.v160.description",
    icon: Mail,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v160.highlights.0",
      "changelog.entries.v160.highlights.1",
      "changelog.entries.v160.highlights.2",
      "changelog.entries.v160.highlights.3",
    ],
  },
  {
    version: "1.5.0",
    date: "2024-12-01",
    titleKey: "changelog.entries.v150.title",
    descriptionKey: "changelog.entries.v150.description",
    icon: Bell,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v150.highlights.0",
      "changelog.entries.v150.highlights.1",
      "changelog.entries.v150.highlights.2",
      "changelog.entries.v150.highlights.3",
    ],
  },
  {
    version: "1.4.0",
    date: "2024-11-28",
    titleKey: "changelog.entries.v140.title",
    descriptionKey: "changelog.entries.v140.description",
    icon: Save,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v140.highlights.0",
      "changelog.entries.v140.highlights.1",
      "changelog.entries.v140.highlights.2",
      "changelog.entries.v140.highlights.3",
    ],
  },
  {
    version: "1.3.0",
    date: "2024-11-25",
    titleKey: "changelog.entries.v130.title",
    descriptionKey: "changelog.entries.v130.description",
    icon: Users,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v130.highlights.0",
      "changelog.entries.v130.highlights.1",
      "changelog.entries.v130.highlights.2",
      "changelog.entries.v130.highlights.3",
    ],
  },
  {
    version: "1.2.0",
    date: "2024-11-22",
    titleKey: "changelog.entries.v120.title",
    descriptionKey: "changelog.entries.v120.description",
    icon: Heart,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v120.highlights.0",
      "changelog.entries.v120.highlights.1",
      "changelog.entries.v120.highlights.2",
      "changelog.entries.v120.highlights.3",
    ],
  },
  {
    version: "1.1.0",
    date: "2024-11-18",
    titleKey: "changelog.entries.v110.title",
    descriptionKey: "changelog.entries.v110.description",
    icon: Calendar,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v110.highlights.0",
      "changelog.entries.v110.highlights.1",
      "changelog.entries.v110.highlights.2",
      "changelog.entries.v110.highlights.3",
    ],
  },
  {
    version: "1.0.0",
    date: "2024-11-15",
    titleKey: "changelog.entries.v100.title",
    descriptionKey: "changelog.entries.v100.description",
    icon: Bell,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v100.highlights.0",
      "changelog.entries.v100.highlights.1",
      "changelog.entries.v100.highlights.2",
      "changelog.entries.v100.highlights.3",
    ],
  },
  {
    version: "0.9.0",
    date: "2024-11-10",
    titleKey: "changelog.entries.v090.title",
    descriptionKey: "changelog.entries.v090.description",
    icon: BarChart3,
    type: "improvement",
    highlightKeys: [
      "changelog.entries.v090.highlights.0",
      "changelog.entries.v090.highlights.1",
      "changelog.entries.v090.highlights.2",
      "changelog.entries.v090.highlights.3",
    ],
  },
  {
    version: "0.8.0",
    date: "2024-11-05",
    titleKey: "changelog.entries.v080.title",
    descriptionKey: "changelog.entries.v080.description",
    icon: Award,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v080.highlights.0",
      "changelog.entries.v080.highlights.1",
      "changelog.entries.v080.highlights.2",
      "changelog.entries.v080.highlights.3",
    ],
  },
  {
    version: "0.7.0",
    date: "2024-10-28",
    titleKey: "changelog.entries.v070.title",
    descriptionKey: "changelog.entries.v070.description",
    icon: Camera,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v070.highlights.0",
      "changelog.entries.v070.highlights.1",
      "changelog.entries.v070.highlights.2",
      "changelog.entries.v070.highlights.3",
    ],
  },
  {
    version: "0.6.0",
    date: "2024-10-20",
    titleKey: "changelog.entries.v060.title",
    descriptionKey: "changelog.entries.v060.description",
    icon: Rocket,
    type: "feature",
    highlightKeys: [
      "changelog.entries.v060.highlights.0",
      "changelog.entries.v060.highlights.1",
      "changelog.entries.v060.highlights.2",
      "changelog.entries.v060.highlights.3",
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

// Changelog-Content als separate Komponente für Wiederverwendung
function ChangelogContent() {
  const { t, i18n } = useTranslation();

  // Type-Labels basierend auf der aktuellen Sprache
  const typeLabels = useMemo(
    () => ({
      feature: t("changelog.types.feature"),
      improvement: t("changelog.types.improvement"),
      fix: t("changelog.types.fix"),
    }),
    [t]
  );

  // Locale für Datumsformatierung
  const dateLocale = i18n.language === "de" ? "de-DE" : "en-US";

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
                {t("changelog.stayUpdated")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("changelog.description")}
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
          {changelogEntries.map((entry, index) => {
            const IconComponent = entry.icon;
            return (
              <div key={entry.version} className="relative pl-16">
                {/* Timeline Dot */}
                <div className="absolute left-0 top-0 flex items-center justify-center w-14 h-14 rounded-full bg-background border-2 border-border shadow-sm">
                  <div
                    className={`p-2 rounded-full ${entry.type === "feature"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : entry.type === "improvement"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>

                <Card
                  className={`transition-all hover:shadow-md ${index === 0 ? "ring-2 ring-primary/20" : ""
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
                              {t("changelog.latest")}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">
                          {t(entry.titleKey)}
                        </CardTitle>
                      </div>
                      <time className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString(dateLocale, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-4">
                      {t(entry.descriptionKey)}
                    </p>
                    <Separator className="mb-4" />
                    <ul className="space-y-2">
                      {entry.highlightKeys.map((highlightKey, hIndex) => (
                        <li
                          key={hIndex}
                          className="flex items-start gap-2 text-sm"
                        >
                          <History className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{t(highlightKey)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>{t("changelog.moreUpdates")}</p>
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
    <PublicPageLayout className="bg-gradient-to-br from-background via-background to-muted/20">
      <PublicHeader />

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
              {t("landing.footer.legalLinks.privacy")}
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("landing.footer.legalLinks.terms")}
            </Link>
            <Link
              to="/imprint"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("landing.footer.legalLinks.imprint")}
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("landing.footer.legalLinks.contact")}
            </Link>
            <a
              href="/docs/overview"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("landing.footer.legalLinks.documentation", "Dokumentation")}
            </a>
          </div>
        </div>
      </footer>
    </PublicPageLayout>
  );
}
