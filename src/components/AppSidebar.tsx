import { BarChart, Dumbbell, Globe, Home, LogOut, Palette, Settings, Shield, Trophy, User, Users } from "lucide-react";
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
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
import { useAuth } from "@/contexts/AuthContext";
import { Notifications } from './Notifications';

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getDisplayName, isAuthenticated } = useAuth();

  // Verwende isAdmin vom User-Objekt
  const isAdmin = user?.isAdmin || false;

const menuItems = [
  {
      title: t('navigation.dashboard'),
    url: "/",
    icon: Home,
  },
  {
      title: t('navigation.scoreboard'),
    url: "/scoreboard",
    icon: Trophy,
  },
  {
      title: t('navigation.training'),
    url: "/training",
    icon: Dumbbell,
  },
  {
      title: t('navigation.stats'),
    url: "/stats",
    icon: BarChart,
  },
  {
      title: "Freunde",
      url: "/friends",
      icon: Users,
    },
    {
      title: t('navigation.profile'),
    url: "/profile",
    icon: User,
  },
];

const adminItems = [
  {
      title: t('navigation.admin'),
    url: "/admin",
      icon: Shield,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  const getUserInitials = () => {
    if (!user) return '?';
    if (user.displayPreference === 'nickname' && user.nickname) {
      return user.nickname.substring(0, 2).toUpperCase();
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  if (!isAuthenticated) {
    return null; // Don't render sidebar if not authenticated
  }


  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarHeader className="border-b border-border bg-background">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary">Sportify</h2>
          <p className="text-sm text-muted-foreground">Sports Analytics Platform</p>
        </div>
      </SidebarHeader>
        
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`
                      hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200
                      ${location.pathname === item.url ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                    `}
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator className="mx-6 my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
                <Shield size={14} className="inline mr-2" />
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
                          ${location.pathname === item.url ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                        `}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon size={20} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator className="mx-6 my-2" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-6 py-3">
            Einstellungen
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {/* Language Switch */}
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200 justify-between">
                  <div className="flex items-center gap-3">
                    <Globe size={20} />
                    <span>{t('settings.language')}</span>
                  </div>
                  <LanguageSwitcher />
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Theme Switch */}
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200 justify-between">
                  <div className="flex items-center gap-3">
                    <Palette size={20} />
                    <span>{t('settings.theme')}</span>
                  </div>
                  <ThemeSwitcher />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border bg-background mt-auto">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={getDisplayName()} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold truncate">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
              <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Einstellungen</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Abmelden</span>
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
