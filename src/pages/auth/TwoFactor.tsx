import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Globe, Palette, Settings, Shield, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { toast } from 'sonner';

export default function TwoFactor() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const twoFactorSchema = useMemo(() => z.object({
    code: z.string().length(6, t('validation.codeLength')).regex(/^\d+$/, t('validation.codeNumbers'))
  }), [t]);

  type TwoFactorData = z.infer<typeof twoFactorSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<TwoFactorData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: ''
    }
  });

  const code = watch('code');

  // Countdown für erneut senden
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: TwoFactorData) => {
    setIsLoading(true);
    
    try {
      // Mock API call - hier würde normalerweise der 2FA-Code verifiziert werden
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success/failure - hier würde normalerweise der Code gegen die Authenticator-App verifiziert werden
      // Placeholder: Im echten System würde hier die API-Anfrage zur Verifizierung erfolgen
      toast.error(t('common.error'), {
        description: t('common.error')
      });
    } catch (error) {
      toast.error(t('common.error'), {
        description: t('common.error')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    try {
      // Mock API call - hier würde normalerweise ein neuer 2FA-Code gesendet werden
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('common.success'), {
        description: t('common.success')
      });
      
      setCountdown(60); // 60 Sekunden Countdown
    } catch (error) {
      toast.error(t('common.error'), {
        description: t('common.error')
      });
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (code && code.length === 6 && !errors.code) {
      handleSubmit(onSubmit)();
    }
  }, [code, errors.code, handleSubmit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('authPages.twoFactor.backToLogin')}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('authPages.twoFactor.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('authPages.twoFactor.description')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('authPages.twoFactor.enterCode')}</CardTitle>
              <CardDescription>
                {t('authPages.twoFactor.codeRegenerates')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code">{t('authPages.twoFactor.sixDigitCode')}</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder={t('authPages.twoFactor.codePlaceholder')}
                    maxLength={6}
                    {...register('code')}
                    className={`text-center text-2xl tracking-widest font-mono ${errors.code ? 'border-destructive' : ''}`}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">{errors.code.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || code?.length !== 6}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                      {t('authPages.twoFactor.verifying')}
                    </>
                  ) : (
                    t('authPages.twoFactor.verifyCode')
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-sm"
                  >
                    {countdown > 0 
                      ? t('authPages.twoFactor.requestNewCodeCountdown', { count: countdown })
                      : t('authPages.twoFactor.requestNewCode')
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('authPages.twoFactor.problems')}{' '}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                {t('authPages.twoFactor.contactUs')}
              </Link>
            </p>
          </div>
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