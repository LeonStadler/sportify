import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PublicHeader } from "@/components/PublicHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

interface LegalPageTemplateProps {
  title: string;
  content: ReactNode;
  icon?: ReactNode;
}

export function LegalPageTemplate({
  title,
  content,
  icon,
}: LegalPageTemplateProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div
      className={
        isAuthenticated
          ? ""
          : "min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      }
    >
      {/* Header - nur anzeigen wenn nicht eingeloggt */}
      {!isAuthenticated && (
        <PublicHeader
          showBackButton={true}
          backText={t("legal.backToHome")}
          title={title}
        />
      )}

      {/* Titel für eingeloggte Benutzer */}
      {isAuthenticated && (
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`${isAuthenticated ? "max-w-4xl" : "container mx-auto px-4 py-8 md:py-12 max-w-4xl"}`}
      >
        {/* Legal Notice */}
        <Alert className="mb-8 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertDescription className="text-sm space-y-1">
            <p className="font-semibold">{t("legal.disclaimer.title")}</p>
            <p>{t("legal.disclaimer.germanLawApplies")}</p>
            <p>{t("legal.disclaimer.translationOnly")}</p>
            <p className="font-semibold">
              {t("legal.disclaimer.germanVersionValid")}
            </p>
          </AlertDescription>
        </Alert>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {content}
        </div>

        {/* Language Note */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t("legal.languageNote")}
          </p>
        </div>
      </div>

      {/* Footer - nur anzeigen wenn nicht eingeloggt */}
      {!isAuthenticated && (
        <footer className="border-t border-border/40 py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">{t("common.copyright")}</p>
            <div className="flex justify-center gap-6 mt-4">
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
      )}
    </div>
  );
}
