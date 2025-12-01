import {
  Globe,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
  Trophy,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PWAAuth() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  useEffect(() => setMounted(true), []);

  const currentTheme = theme || "system";
  const themes = [
    { value: "light", icon: Sun, label: t("settings.themeLight") },
    { value: "dark", icon: Moon, label: t("settings.themeDark") },
    { value: "system", icon: Monitor, label: t("settings.themeSystem") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Minimaler Header für PWA */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground leading-tight">
                Sportify
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                by Leon Stadler
              </span>
            </div>
          </div>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
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
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 py-6 overflow-auto">
        {/* Willkommensbereich */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {activeTab === "login"
              ? t("authPages.welcomeBack")
              : t("pwaAuth.welcomeTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeTab === "login"
              ? t("authPages.continueJourney")
              : t("pwaAuth.welcomeSubtitle")}
          </p>
        </div>

        {/* Tabs für Login/Register */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "login" | "register")}
          className="w-full max-w-md mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-sm">
              {t("auth.login")}
            </TabsTrigger>
            <TabsTrigger value="register" className="text-sm">
              {t("auth.register")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <LoginForm redirectTo="/dashboard" />
          </TabsContent>

          <TabsContent value="register" className="mt-0">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t("common.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
