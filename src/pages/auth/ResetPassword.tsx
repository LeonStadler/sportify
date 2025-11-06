import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Eye, EyeOff, Key, Lock, Mail, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { resetPassword, confirmResetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Token aus URL extrahieren
  // searchParams.get() dekodiert bereits automatisch, aber zur Sicherheit dekodieren wir erneut
  const rawToken = searchParams.get('token') || '';
  let token = rawToken;
  // Nur dekodieren, wenn der Token noch URL-encoded ist (enthält %)
  if (rawToken && rawToken.includes('%')) {
    try {
      token = decodeURIComponent(rawToken);
    } catch (e) {
      // Falls Dekodierung fehlschlägt, verwende den ursprünglichen Token
      token = rawToken;
    }
  }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modus 1: E-Mail anfordern
  const emailSchema = useMemo(() => z.object({
    email: z.string().email(t('validation.invalidEmail'))
  }), [t]);

  type EmailData = z.infer<typeof emailSchema>;

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    watch: watchEmail
  } = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ''
    }
  });

  const email = watchEmail('email');

  // Modus 2: Passwort zurücksetzen
  const passwordSchema = useMemo(() => z.object({
    password: z.string()
      .min(8, t('validation.passwordMin'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('validation.passwordComplexity')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMatch'),
    path: ['confirmPassword'],
  }), [t]);

  type PasswordData = z.infer<typeof passwordSchema>;

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors }
  } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmitEmail = async (data: EmailData) => {
    setIsLoading(true);

    try {
      await resetPassword(data.email.trim().toLowerCase());
      setIsSubmitted(true);
      toast.success(t('authPages.resetPassword.emailSent'), {
        description: t('authPages.resetPassword.checkEmail', { email: data.email })
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      // Aus Sicherheitsgründen zeigen wir auch bei Fehlern eine Erfolgsmeldung
      setIsSubmitted(true);
      toast.success(t('authPages.resetPassword.emailSent'), {
        description: t('authPages.resetPassword.checkEmail', { email: data.email })
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordData) => {
    if (!token) {
      toast.error(t('authPages.resetPassword.missingToken'), {
        description: t('authPages.resetPassword.requestNewLink')
      });
      return;
    }

    setIsLoading(true);

    try {
      await confirmResetPassword(token, data.password);
      setIsReset(true);
      toast.success(t('authPages.resetPassword.passwordResetSuccess'), {
        description: t('authPages.resetPassword.canLoginNow')
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('authPages.resetPassword.resetFailed');
      toast.error(t('common.error'), {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Wenn Token vorhanden ist, zeige Passwort-Reset-Formular
  if (token && !isReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
        {/* Header */}
        <AuthHeader
          backTo="/auth/login"
          backText={t('authPages.resetPassword.backToLogin')}
          showAuthButtons={true}
          authButtonType="register"
        />

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('authPages.resetPassword.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('authPages.resetPassword.description')}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('authPages.resetPassword.resetTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertDescription>
                    {t('authPages.resetPassword.tokenExpires')}
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('authPages.resetPassword.passwordPlaceholder')}
                        {...registerPassword('password')}
                        className={passwordErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.password && (
                      <p className="text-sm text-destructive">{passwordErrors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('authPages.resetPassword.confirmPasswordPlaceholder')}
                        {...registerPassword('confirmPassword')}
                        className={passwordErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                        {t('authPages.resetPassword.resetting')}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        {t('authPages.resetPassword.resetButton')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t('authPages.resetPassword.rememberPassword')}{' '}
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  {t('authPages.resetPassword.loginHere')}
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

  // Erfolg beim Passwort-Reset
  if (isReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
        <AuthHeader
          backTo="/auth/login"
          backText={t('authPages.resetPassword.backToLogin')}
          showAuthButtons={true}
          authButtonType="register"
        />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {t('authPages.resetPassword.passwordResetSuccess')}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t('authPages.resetPassword.canLoginNow')}
              </p>

              <div className="space-y-4">
                <Button size="lg" className="w-full" asChild>
                  <Link to="/auth/login">
                    {t('authPages.resetPassword.loginNow')}
                  </Link>
                </Button>

                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/">
                    {t('authPages.resetPassword.backToHome')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

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

  // Modus 1: E-Mail anfordern (Standard)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <AuthHeader
        backTo="/auth/login"
        backText={t('authPages.resetPassword.backToLogin')}
        showAuthButtons={true}
        authButtonType="register"
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('authPages.resetPassword.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('authPages.resetPassword.emailRequestDescription')}
            </p>
          </div>

          {!isSubmitted ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('authPages.resetPassword.emailRequestTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('authPages.emailVerification.emailPlaceholder')}
                      {...registerEmail('email')}
                      className={emailErrors.email ? 'border-destructive' : ''}
                    />
                    {emailErrors.email && (
                      <p className="text-sm text-destructive">{emailErrors.email.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                        {t('authPages.resetPassword.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('authPages.resetPassword.sendResetLink')}
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
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Send className="w-8 h-8 text-green-600 dark:text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t('authPages.resetPassword.emailSent')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('authPages.resetPassword.checkEmail', { email })}
                    </p>
                  </div>

                  <Alert>
                    <AlertDescription>
                      {t('authPages.resetPassword.noEmailReceived')}{' '}
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-primary hover:underline"
                      >
                        {t('authPages.resetPassword.tryAgain')}
                      </button>.
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth/login">{t('authPages.resetPassword.backToLogin')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('authPages.resetPassword.rememberPassword')}{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                {t('authPages.resetPassword.loginHere')}
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
