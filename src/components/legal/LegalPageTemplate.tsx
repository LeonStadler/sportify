import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { PublicHeader } from "@/components/common/PublicHeader";
import { PublicPageLayout } from "@/components/common/PublicPageLayout";
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

  const pageContent = (
    <>
      {/* Header - ohne Seitentitel (nur Logo/Nav), Titel steht über dem Inhalt */}
      {!isAuthenticated && <PublicHeader />}

      {/* Seitentitel über dem Inhalt */}
      <div
        className={`${isAuthenticated ? "max-w-4xl" : "container mx-auto px-4 pt-8 md:pt-12 max-w-4xl"}`}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          {title}
        </h1>
      </div>

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
    </>
  );

  if (isAuthenticated) {
    return <div>{pageContent}</div>;
  }

  return (
    <PublicPageLayout className="bg-gradient-to-br from-background via-background to-muted/20">
      {pageContent}
    </PublicPageLayout>
  );
}
