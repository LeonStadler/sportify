import { BarChart, Dumbbell, Globe, Home, LogOut, Menu, Monitor, Moon, Palette, Settings, Shield, Sun, Trophy, User, UserPlus } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export function MobileBottomNav() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getDisplayName, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock admin check
  const isAdmin = user?.email === 'admin@sportify.com';

const navItems = [
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
  ];

  const adminItems = [
    {
      title: t('navigation.admin'),
      url: "/admin",
      icon: Settings,
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: Shield,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const getUserInitials = () => {
    if (!user) return '?';
    if (user.displayPreference === 'nickname' && user.nickname) {
      return user.nickname.substring(0, 2).toUpperCase();
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const handleNavigation = (url: string) => {
    navigate(url);
    setIsMenuOpen(false);
  };

  if (!isAuthenticated) {
    return null; // Don't render nav if not authenticated
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-2 py-2 md:hidden z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
        
        {/* Burger Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg h-auto"
            >
              <Menu size={20} />
              <span className="text-xs font-medium">Menü</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <ScrollArea className="h-full">
              <SheetHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.avatar} alt={getDisplayName()} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <SheetTitle className="text-lg">{getDisplayName()}</SheetTitle>
                    <SheetDescription className="text-sm">{user?.email}</SheetDescription>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit">
                  Sportify by Leon Stadler
                </Badge>
              </SheetHeader>

              <div className="px-6 space-y-6">
                {/* Profile Quick Actions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    {t('navigation.profile')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => handleNavigation('/profile')}
                    >
                      <div className="text-left">
                        <User className="h-4 w-4 mb-1" />
                        <div className="text-xs">{t('navigation.profile')}</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => handleNavigation('/friends/invite')}
                    >
                      <div className="text-left">
                        <UserPlus className="h-4 w-4 mb-1" />
                        <div className="text-xs">{t('navigation.friends')}</div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Settings */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    {t('navigation.settings')}
                  </h3>
                  
                  {/* Language Setting */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">{t('settings.language')}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {i18n.language === 'de' ? '🇩🇪' : '🇺🇸'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('settings.language')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleLanguageChange('de')}>
                          🇩🇪 Deutsch
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                          🇺🇸 English
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Theme Setting */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span className="text-sm">{t('settings.theme')}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {theme === 'light' ? <Sun className="h-4 w-4" /> : 
                           theme === 'dark' ? <Moon className="h-4 w-4" /> : 
                           <Monitor className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('settings.theme')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setTheme('light')}>
                          <Sun className="mr-2 h-4 w-4" />
                          {t('settings.light')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>
                          <Moon className="mr-2 h-4 w-4" />
                          {t('settings.dark')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>
                          <Monitor className="mr-2 h-4 w-4" />
                          {t('settings.system')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {isAdmin && (
                  <>
                    <Separator />
                    {/* Admin Section */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        <Shield className="inline h-3 w-3 mr-1" />
                        Administration
                      </h3>
                      <div className="space-y-2">
                        {adminItems.map((item) => (
                          <Button
                            key={item.title}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleNavigation(item.url)}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Logout */}
                <div className="pb-6">
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('navigation.logout')}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
