import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Globe, Mail, Palette, Send, Settings, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
import { API_URL } from '@/lib/api';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const forgotPasswordSchema = useMemo(() => z.object({
    email: z.string().email(t('validation.invalidEmail'))
  }), [t]);

  type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      // Aus Sicherheitsgründen zeigen wir immer eine Erfolgsmeldung,
      // auch wenn die E-Mail-Adresse nicht existiert
      setIsSubmitted(true);
      toast.success(t('authPages.forgotPassword.emailSent'), {
        description: response.ok
          ? t('authPages.forgotPassword.checkEmail', { email: data.email })
          : t('authPages.forgotPassword.checkEmail', { email: data.email })
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      // Aus Sicherheitsgründen zeigen wir auch bei Fehlern eine Erfolgsmeldung
      setIsSubmitted(true);
      toast.success(t('authPages.forgotPassword.emailSent'), {
        description: t('authPages.forgotPassword.checkEmail', { email: email })
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('authPages.forgotPassword.backToLogin')}
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
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('authPages.forgotPassword.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('authPages.forgotPassword.description')}
            </p>
          </div>

          {!isSubmitted ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('authPages.forgotPassword.resetTitle')}</CardTitle>
                <CardDescription>
                  {t('authPages.forgotPassword.resetDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('authPages.emailVerification.emailPlaceholder')}
                      {...register('email')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                        {t('authPages.forgotPassword.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('authPages.forgotPassword.sendResetLink')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t('authPages.forgotPassword.emailSent')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('authPages.forgotPassword.checkEmail', { email })}
                    </p>
                  </div>

                  <Alert>
                    <AlertDescription>
                      {t('authPages.forgotPassword.noEmailReceived')}{' '}
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-primary hover:underline"
                      >
                        {t('authPages.forgotPassword.tryAgain')}
                      </button>.
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth/login">{t('authPages.forgotPassword.backToLogin')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('authPages.forgotPassword.rememberPassword')}{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                {t('authPages.forgotPassword.loginHere')}
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