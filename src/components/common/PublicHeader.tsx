import {
  Globe,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { Logo } from "@/components/common/Logo";
import { LogoFull } from "@/components/common/LogoFull";
import ThemeSwitcher from "@/components/common/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

interface PublicHeaderProps {
  title?: string;
  sticky?: boolean;
  showContactButton?: boolean;
  variant?: "default" | "minimal";
}

export function PublicHeader({
  title,
  sticky = true,
  showContactButton = false,
  variant = "default",
}: PublicHeaderProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = theme || "system";
  const themes = [
    { value: "light", icon: Sun, label: t("settings.themeLight") },
    { value: "dark", icon: Moon, label: t("settings.themeDark") },
    { value: "system", icon: Monitor, label: t("settings.themeSystem") },
  ];

  // Route-Erkennung
  const isLoginPage = location.pathname.startsWith("/auth/login");
  const isRegisterPage = location.pathname.startsWith("/auth/register");
  const isAuthPage = location.pathname.startsWith("/auth/");
  const isContactPage = location.pathname === "/contact";
  const isNotAuthPage = !isAuthPage;

  // Zeige Auth-Buttons nur wenn nicht authentifiziert
  const shouldShowAuthButtons = !isAuthenticated;

  // Auf nicht-Auth-Seiten: Immer Login- und Register-Button (außer auf der jeweiligen Seite)
  const showLoginButton = shouldShowAuthButtons && (isNotAuthPage && !isLoginPage) || (isAuthPage && (isRegisterPage || (!isLoginPage && !isRegisterPage)));
  const showRegisterButton = shouldShowAuthButtons && (isNotAuthPage && !isRegisterPage) || (isAuthPage && (isLoginPage || (!isLoginPage && !isRegisterPage)));

  // Kontakt-Button: Nur wenn showContactButton=true, nicht auf Contact-Seite, und bei genug Platz (sm+)
  const showContactButtonDisplay = shouldShowAuthButtons && showContactButton && isNotAuthPage && !isContactPage;

  return (
    <header
      className={`border-b border-border/40 shadow-none bg-background/95 backdrop-blur-md ${sticky ? "sticky top-0 z-50 shadow-lg border-border/60 bg-background/75 backdrop-blur-md" : ""} ${variant === "minimal" ? "py-3" : "py-4"}`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo - immer zuerst (ganz links) */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            {variant === "minimal" ? (
              <LogoFull
                className="h-10 sm:h-12"
                alt={t("profile.logo.title")}
                byline={t("profile.logo.byline")}
              />
            ) : (
              <>
                {/* Mobile: Nur Icon */}
                <Logo variant="icon" className="xs:hidden h-10 w-10" />
                {/* Desktop: Volles Logo */}
                <LogoFull
                  className="h-12 hidden xs:block"
                  alt={t("profile.logo.title")}
                  byline={t("profile.logo.byline")}
                />
              </>
            )}
          </Link>
          {/* Title - optional */}
          {title && (
            <h1 className="text-xl font-bold text-foreground hidden sm:block">
              {title}
            </h1>
          )}
        </div>
        {!isAuthenticated && (
          <div className="flex items-center gap-3">
            {/* Desktop: Language & Theme Switchers */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent transition-colors">
                <LanguageSwitcher />
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent transition-colors">
                <ThemeSwitcher variant="toggle" />
              </div>
            </div>

            {/* Mobile: Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t("landing.openSettings")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("landing.settings")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center justify-between cursor-default">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{t("landing.language")}</span>
                  </div>
                  <LanguageSwitcher />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("landing.theme")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {mounted &&
                      themes.map((themeOption) => {
                        const Icon = themeOption.icon;
                        const isSelected = currentTheme === themeOption.value;
                        return (
                          <Button
                            key={themeOption.value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme(themeOption.value)}
                            className="flex flex-col items-center gap-1 h-auto py-2 px-1"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs">{themeOption.label}</span>
                          </Button>
                        );
                      })}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons - auf nicht-Auth-Seiten immer Login/Register, Kontakt bei Platz */}
            {shouldShowAuthButtons && (
              <div className="flex gap-2">
                {/* Kontakt-Button: nur bei genug Platz (md+), nicht auf Contact-Seite */}
                {showContactButtonDisplay && (
                  <Button variant="outline" asChild className="hidden md:flex hover:bg-accent/80">
                    <Link to="/contact">{t("landing.contact")}</Link>
                  </Button>
                )}
                {/* Login-Button: auf allen nicht-Auth-Seiten außer Login-Seite, oder auf Auth-Seiten (Register oder andere) */}
                {showLoginButton && (
                  <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground">
                    <Link to="/auth/login">{t("auth.login")}</Link>
                  </Button>
                )}
                {/* Register-Button: auf allen nicht-Auth-Seiten außer Register-Seite, oder auf Auth-Seiten (Login oder andere) */}
                {showRegisterButton && (
                  <Button
                    asChild
                    className={
                      showContactButtonDisplay
                        ? "bg-primary hover:bg-primary/90 shadow-md"
                        : ""
                    }
                  >
                    <Link to="/auth/register">
                      {showContactButtonDisplay
                        ? t("landing.register")
                        : t("auth.register")}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
