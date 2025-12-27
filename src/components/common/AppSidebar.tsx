import {
  BarChart,
  Dumbbell,
  Globe,
  History,
  Home,
  LogOut,
  LucideIcon,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  useLocation,
  useNavigate,
  type Location,
} from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

import { LogoFull } from "@/components/common/LogoFull";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";
import { getUserInitials, parseAvatarConfig } from "@/lib/avatar";
import NiceAvatar from "react-nice-avatar";
import { Notifications } from "./Notifications";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getDisplayName, isAuthenticated } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  // Verwende role vom User-Objekt
  const isAdmin = user?.role === "admin";

  // Schließe das Sidebar auf Mobile, wenn sich die Route ändert
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const menuItems: Array<{
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: (loc: Location) => boolean;
    onClick?: () => void;
  }> = [
      {
        title: t("navigation.dashboard"),
        url: "/",
        icon: Home,
      },
      {
        title: t("navigation.scoreboard"),
        url: "/scoreboard",
        icon: Trophy,
      },
      {
        title: t("navigation.training"),
        url: "/training",
        icon: Dumbbell,
      },
      {
        title: t("navigation.stats"),
        url: "/stats",
        icon: BarChart,
      },
      {
        title: "Freunde",
        url: "/friends",
        icon: Users,
      },
      {
        title: t("navigation.profile"),
        url: "/profile",
        icon: User,
      },
      {
        title: t("changelog.title", "Changelog"),
        url: "/changelog",
        icon: History,
      },
    ];

  const adminItems = [
    {
      title: t("navigation.admin"),
      url: "/admin",
      icon: Shield,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render sidebar if not authenticated
  }

  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarHeader className="border-b border-border bg-background">
        <div className="p-6">
          <LogoFull className="h-12" />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col">
        <div className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-3">
              <SidebarMenu>
                {menuItems.map((item) => {
                  const active = item.isActive
                    ? item.isActive(location)
                    : location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`
                        hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200
                        ${active ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                      `}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (item.onClick) {
                              item.onClick();
                            } else {
                              navigate(item.url);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-left"
                        >
                          <item.icon size={36} />
                          <span className="tracking-tight">{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <>
              <SidebarSeparator className="mx-6 my-2" />
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
                  <Shield size={20} className="inline mr-2" />
                  Administration
                </SidebarGroupLabel>
                <SidebarGroupContent className="px-3">
                  <SidebarMenu>
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`
                            hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200
                            ${location.pathname === item.url ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                          `}
                        >
                          <Link
                            to={item.url}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium"
                          >
                            <item.icon size={28} />
                            <span className="tracking-tight">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </div>

        <SidebarSeparator className="mx-6 my-2" />
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
            Einstellungen
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {/* Language Switch */}
              <SidebarMenuItem>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Globe size={20} />
                    <span>{t("settings.language")}</span>
                  </div>
                  <LanguageSwitcher />
                </div>
              </SidebarMenuItem>

              {/* Theme Switch */}
              <SidebarMenuItem>
                <ThemeSwitcher variant="sidebar" />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border bg-background mt-auto">
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent transition-colors min-w-0 flex-1 overflow-hidden">
                <Avatar className="h-9 w-9 shrink-0">
                  {user?.avatar && parseAvatarConfig(user.avatar) ? (
                    <NiceAvatar
                      style={{ width: "36px", height: "36px" }}
                      {...parseAvatarConfig(user.avatar)!}
                    />
                  ) : (
                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
              <DropdownMenuLabel>
                {t("navigation.profile", "Mein Account")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" />
                <span>{t("navigation.profile", "Profil")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/profile?tab=preferences")}
              >
                <Settings className="w-4 h-4 mr-2" />
                <span>{t("navigation.settings", "Einstellungen")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>{t("navigation.logout", "Abmelden")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center">
            <Notifications />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
