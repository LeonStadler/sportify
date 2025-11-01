import { ArrowLeft, FileText, Globe, Palette, Settings } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';

interface LegalPageTemplateProps {
  title: string;
  content: ReactNode;
  icon?: ReactNode;
}

export function LegalPageTemplate({ title, content, icon }: LegalPageTemplateProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('legal.backToHome')}
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                {icon || <FileText className="w-5 h-5 text-primary-foreground" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
                <p className="text-xs text-muted-foreground">Sportify by Leon Stadler</p>
              </div>
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
                <Link to="/auth/login">{t('auth.login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">{t('auth.register')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Legal Notice */}
        <Alert className="mb-8 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertDescription className="text-sm space-y-1">
            <p className="font-semibold">{t('legal.disclaimer.title')}</p>
            <p>{t('legal.disclaimer.germanLawApplies')}</p>
            <p>{t('legal.disclaimer.translationOnly')}</p>
            <p className="font-semibold">{t('legal.disclaimer.germanVersionValid')}</p>
          </AlertDescription>
        </Alert>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {content}
        </div>

        {/* Language Note */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t('legal.languageNote')}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            {t('common.copyright')}
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              {t('landing.footerLinks.privacy')}
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              {t('landing.footerLinks.terms')}
            </Link>
            <Link to="/imprint" className="text-sm text-muted-foreground hover:text-foreground">
              {t('landing.footerLinks.imprint')}
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              {t('landing.footerLinks.contact')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

