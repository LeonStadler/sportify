import {
    ArrowRight,
    BarChart3,
    Heart,
    Trophy,
    Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

type PublicFooterProps = {
    onNavigateToSection?: (id: string) => void;
};

export function PublicFooter({ onNavigateToSection }: PublicFooterProps) {
    const { t } = useTranslation();

    const handleNavigate = (sectionId: string) => {
        if (onNavigateToSection) {
            onNavigateToSection(sectionId);
        }
    };

    return (
        <footer
            className="border-t border-border/40 bg-muted/20 dark:bg-muted/10 py-16 md:py-20"
            role="contentinfo"
        >
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                                <Trophy className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-2xl text-foreground">
                                Sportify
                            </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                            {t("landing.footer.description")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t("landing.footer.madeWith")}{" "}
                            <Heart
                                className="w-4 h-4 inline text-red-500 mx-1"
                                aria-label="Love"
                            />{" "}
                            {t("landing.footer.by")}
                        </p>
                    </div>

                    {/* Features */}
                    <nav aria-label={t("landing.footer.features")}>
                        <h3 className="font-semibold text-foreground mb-4">
                            {t("landing.footer.features")}
                        </h3>
                        <ul className="space-y-3">
                            {[
                                {
                                    sectionId: "features",
                                    label: t("landing.footer.featuresList.scoreboard"),
                                },
                                {
                                    sectionId: "features",
                                    label: t("landing.footer.featuresList.stats"),
                                },
                                {
                                    sectionId: "features",
                                    label: t("landing.footer.featuresList.friends"),
                                },
                                {
                                    sectionId: "showcase",
                                    label: t("landing.footer.featuresList.training"),
                                },
                                {
                                    sectionId: "highlights",
                                    label: t("landing.footer.featuresList.highlights"),
                                },
                            ].map((item, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleNavigate(item.sectionId)}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded cursor-pointer"
                                    >
                                        {item.label}
                                        <ArrowRight
                                            className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Developer */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">
                            {t("landing.footer.developer")}
                        </h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="text-sm">Leon Stadler</li>
                            <li className="flex items-center gap-2 text-sm">
                                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                                React & TypeScript
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <Zap className="w-4 h-4" aria-hidden="true" />
                                {t("landing.footer.tech.modern")}
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <nav aria-label={t("landing.footer.legal")}>
                        <h3 className="font-semibold text-foreground mb-4">
                            {t("landing.footer.legal")}
                        </h3>
                        <ul className="space-y-3">
                            {[
                                {
                                    to: "/privacy",
                                    label: t("landing.footer.legalLinks.privacy"),
                                },
                                {
                                    to: "/terms",
                                    label: t("landing.footer.legalLinks.terms"),
                                },
                                {
                                    to: "/imprint",
                                    label: t("landing.footer.legalLinks.imprint"),
                                },
                                {
                                    to: "/contact",
                                    label: t("landing.footer.legalLinks.contact"),
                                },
                                {
                                    to: "/changelog",
                                    label: t("landing.footer.legalLinks.changelog"),
                                },
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <a
                                    href="/docs/overview"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                                >
                                    {t("landing.footer.legalLinks.documentation", "Dokumentation")}
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="border-t border-border/40 mt-12 pt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("landing.footer.copyright")}
                    </p>
                </div>
            </div>
        </footer>
    );
}

