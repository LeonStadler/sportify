import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function LegalFooter() {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-border/40 py-8 mt-16">
            <div className="container mx-auto px-4 text-center">
                <p className="text-muted-foreground">{t("common.copyright")}</p>
                <div className="flex justify-center gap-6 mt-4">
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
    );
}
