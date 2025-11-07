import { ArrowLeft, ArrowRight, Globe, Palette, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { LogoFull } from "@/components/LogoFull";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
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
  showBackButton?: boolean;
  backText?: string;
  title?: string;
  sticky?: boolean;
  showContactButton?: boolean;
}

export function PublicHeader({
  showBackButton = false,
  backText,
  title,
  sticky = false,
  showContactButton = false,
}: PublicHeaderProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const defaultBackText = backText || t("legal.backToHome");

  return (
    <header
      className={`border-b border-border/40 bg-background/95 backdrop-blur-sm ${
        sticky ? "sticky top-0 z-50 shadow-sm backdrop-blur-md" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {defaultBackText}
              </Link>
            </Button>
          )}
          {!showBackButton && (
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <LogoFull className="h-12" />
            </Link>
          )}
          {showBackButton && (
            <div className="flex items-center gap-4">
              <LogoFull className="h-12" />
              {title && (
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
              )}
            </div>
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
                <ThemeSwitcher />
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
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{t("landing.language")}</span>
                  </div>
                  <LanguageSwitcher />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span>{t("landing.theme")}</span>
                  </div>
                  <ThemeSwitcher />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons */}
            <div className="flex gap-2">
              {showContactButton && (
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link to="/contact">{t("landing.contact")}</Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/auth/login">{t("auth.login")}</Link>
              </Button>
              <Button asChild className={showContactButton ? "bg-primary hover:bg-primary/90 shadow-md" : ""}>
                <Link to="/auth/register">
                  {showContactButton ? (
                    <>
                      <span className="hidden sm:inline">{t("landing.register")}</span>
                      <span className="sm:hidden">{t("landing.registerShort")}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    t("auth.register")
                  )}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

