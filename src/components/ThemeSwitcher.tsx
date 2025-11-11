import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThemeSwitcherProps {
  className?: string;
  variant?: "dropdown" | "button" | "toggle";
}

export default function ThemeSwitcher({
  className,
  variant = "dropdown",
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 ${className || ""}`.trim()} aria-hidden="true" />
    );
  }

  const currentTheme = theme || "system";

  // Übersetzungen sicherstellen - prüfe ob Übersetzung gefunden wurde
  const themeLightLabel = t("settings.themeLight");
  const themeDarkLabel = t("settings.themeDark");
  const themeSystemLabel = t("settings.themeSystem");

  // Fallback falls Übersetzung nicht gefunden (t() gibt dann den Key zurück)
  const themes = [
    {
      value: "light",
      icon: Sun,
      label:
        themeLightLabel !== "settings.themeLight" ? themeLightLabel : "Hell",
    },
    {
      value: "dark",
      icon: Moon,
      label:
        themeDarkLabel !== "settings.themeDark" ? themeDarkLabel : "Dunkel",
    },
    {
      value: "system",
      icon: Monitor,
      label:
        themeSystemLabel !== "settings.themeSystem"
          ? themeSystemLabel
          : "Gerät",
    },
  ];

  const currentThemeConfig =
    themes.find((t) => t.value === currentTheme) || themes[2];
  const CurrentIcon = currentThemeConfig.icon;

  // Toggle Group Variante (wie LanguageSwitcher)
  if (variant === "toggle") {
    return (
      <ToggleGroup
        type="single"
        value={currentTheme}
        onValueChange={(value) => {
          if (value) setTheme(value);
        }}
        className={`gap-0 ${className || ""}`.trim()}
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <ToggleGroupItem
              key={themeOption.value}
              value={themeOption.value}
              aria-label={themeOption.label}
            >
              <Icon className="h-4 w-4" />
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    );
  }

  // Button Variante (z.B. für Mobile ohne Dropdown)
  if (variant === "button") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const currentIndex = themes.findIndex(
                  (t) => t.value === currentTheme
                );
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex].value);
              }}
              aria-label={t("settings.theme")}
              className={className}
            >
              <CurrentIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentThemeConfig.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Dropdown Variante (Standard)
  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${className || ""}`.trim()}
                aria-label={t("settings.theme")}
                aria-haspopup="true"
                aria-expanded="false"
              >
                <CurrentIcon className="h-4 w-4" />
                <span className="sr-only">{t("settings.theme")}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentThemeConfig.label}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = currentTheme === themeOption.value;
            return (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className="cursor-pointer flex items-center"
                aria-selected={isSelected}
                role="option"
              >
                <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{themeOption.label}</span>
                {isSelected && (
                  <span className="ml-auto" aria-hidden="true">
                    ✓
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
