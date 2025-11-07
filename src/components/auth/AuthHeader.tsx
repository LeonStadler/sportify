import { ArrowLeft, Globe, Palette, Settings } from "lucide-react";
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

interface AuthHeaderProps {
  backTo?: string;
  backText?: string;
  showAuthButtons?: boolean;
  authButtonType?: "login" | "register" | null;
}

export function AuthHeader({
  backTo = "/",
  backText,
  showAuthButtons = false,
  authButtonType = null,
}: AuthHeaderProps) {
  const { t } = useTranslation();

  const defaultBackText = backText || t("authPages.backToHome");

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={backTo}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {defaultBackText}
          </Link>
        </Button>

        <LogoFull className="h-12" />

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

          {/* Auth Buttons (optional) */}
          {showAuthButtons && (
            <div className="flex gap-2">
              {authButtonType === "login" && (
                <Button variant="outline" asChild>
                  <Link to="/auth/login">{t("auth.login")}</Link>
                </Button>
              )}
              {authButtonType === "register" && (
                <Button variant="outline" asChild>
                  <Link to="/auth/register">{t("auth.register")}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
