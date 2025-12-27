import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { PublicHeader } from "@/components/common/PublicHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
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
      {!isAuthenticated && <LegalFooter />}
    </div>
  );
}
