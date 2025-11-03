import { ArrowLeft, Globe, Palette, Settings, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import { LoginForm } from '@/components/auth/LoginForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Login() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  // Prüfe ob ein Invite-Parameter im localStorage gespeichert ist
  const pendingInvite = localStorage.getItem('pendingInvite');
  const redirectFromUrl = searchParams.get('redirect');
  // Priorisiere URL-Parameter, dann localStorage, dann Standard
  const redirectTo = redirectFromUrl || (pendingInvite ? `/invite/${pendingInvite}` : '/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('authPages.backToHome')}
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sportify</h1>
              <p className="text-xs text-muted-foreground">by Leon Stadler</p>
            </div>
          </div>

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
                  <span className="sr-only">{t('landing.openSettings')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('landing.settings')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{t('landing.language')}</span>
                  </div>
                  <LanguageSwitcher />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span>{t('landing.theme')}</span>
                  </div>
                  <ThemeSwitcher />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/auth/register">{t('auth.register')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('authPages.welcomeBack')}
            </h1>
            <p className="text-muted-foreground">
              {t('authPages.continueJourney')}
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t('common.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
} 