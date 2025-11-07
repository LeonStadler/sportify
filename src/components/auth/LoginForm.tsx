import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/dashboard' }) => {
  const { t } = useTranslation();
  const { login, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [showBackupCodeField, setShowBackupCodeField] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lastSubmittedCode, setLastSubmittedCode] = useState<string | null>(null);
  const navigate = useNavigate();

  const loginSchema = useMemo(() => z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(6, t('validation.passwordMin')),
  }), [t]);

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();

      // If 2FA step is shown, submit with 2FA code
      if (showTwoFactor && savedCredentials) {
        if (!twoFactorCode && !backupCode) {
          return;
        }
        // Track submitted code to prevent auto-resubmit on error
        if (twoFactorCode) {
          setLastSubmittedCode(twoFactorCode);
        }
        setIsLoggingIn(true);
        try {
          const result = await login(
            savedCredentials.email,
            savedCredentials.password,
            twoFactorCode || undefined,
            backupCode || undefined
          );

          if (!result.requires2FA) {
            // Login successful (after 2FA with backup code)
            // Prüfe ob pendingInvite in localStorage vorhanden ist
            const pendingInvite = localStorage.getItem('pendingInvite');
            const finalRedirect = pendingInvite ? `/invite/${pendingInvite}` : redirectTo;

            if (onSuccess) {
              onSuccess();
            } else {
              navigate(finalRedirect);
            }
          } else {
            // If still requires 2FA after submitting, clear code
            setLastSubmittedCode(null);
            setTwoFactorCode('');
          }
        } catch (err) {
          // On error, clear the code to prevent auto-resubmit loop
          setLastSubmittedCode(null);
          setTwoFactorCode('');
        } finally {
          setIsLoggingIn(false);
        }
      } else {
        // First step: submit email and password
        setIsLoggingIn(true);
        try {
          const result = await login(data.email, data.password);

          if (result && result.requires2FA) {
            // 2FA is required, show 2FA input
            // Don't clear logging state yet - it will be cleared by AuthContext
            setSavedCredentials({ email: data.email, password: data.password });
            setShowTwoFactor(true);
            clearError();
          } else {
            // Login successful (no 2FA)
            // Prüfe ob pendingInvite in localStorage vorhanden ist
            const pendingInvite = localStorage.getItem('pendingInvite');
            const finalRedirect = pendingInvite ? `/invite/${pendingInvite}` : redirectTo;

            if (onSuccess) {
              onSuccess();
            } else {
              navigate(finalRedirect);
            }
          }
        } catch (err) {
          // Error is already handled by AuthContext
          // The error state will be displayed
        } finally {
          setIsLoggingIn(false);
        }
      }
    } catch (err) {
      // Error is already handled by AuthContext
      // Don't show error here, it will be displayed by the error state
      setIsLoggingIn(false);
    }
  };

  const handleTwoFactorInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setTwoFactorCode(cleaned);
    setBackupCode('');
    setUseBackupCode(false);
    // Reset lastSubmittedCode when user manually changes the code
    if (cleaned.length < 6 || cleaned !== lastSubmittedCode) {
      setLastSubmittedCode(null);
    }
    clearError();
  };

  const handleBackupCodeInput = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').toUpperCase().slice(0, 20);
    setBackupCode(cleaned);
    setTwoFactorCode('');
    setUseBackupCode(true);
  };

  const handleBackToEmailPassword = () => {
    setShowTwoFactor(false);
    setSavedCredentials(null);
    setTwoFactorCode('');
    setBackupCode('');
    setUseBackupCode(false);
    setShowBackupCodeField(false);
    setLastSubmittedCode(null);
    clearError();
  };

  const handleShowBackupCode = () => {
    setShowBackupCodeField(true);
    setTwoFactorCode('');
    setLastSubmittedCode(null);
  };

  // Auto-submit when 6 digits are entered in 2FA code
  useEffect(() => {
    // Only auto-submit if:
    // - 2FA step is shown
    // - Backup code field is not shown (only submit normal 2FA code automatically)
    // - Code has exactly 6 digits
    // - Credentials are saved
    // - Not currently logging in
    // - Not using backup code
    // - Code is different from last submitted code (prevents loop on error)
    if (
      showTwoFactor &&
      !showBackupCodeField &&
      twoFactorCode.length === 6 &&
      savedCredentials &&
      !isLoggingIn &&
      !backupCode &&
      twoFactorCode !== lastSubmittedCode
    ) {
      setLastSubmittedCode(twoFactorCode);
      setIsLoggingIn(true);
      const submit = async () => {
        try {
          clearError();
          const result = await login(
            savedCredentials.email,
            savedCredentials.password,
            twoFactorCode,
            undefined
          );

          if (!result.requires2FA) {
            // Login successful (after 2FA with code)
            // Prüfe ob pendingInvite in localStorage vorhanden ist
            const pendingInvite = localStorage.getItem('pendingInvite');
            const finalRedirect = pendingInvite ? `/invite/${pendingInvite}` : redirectTo;

            if (onSuccess) {
              onSuccess();
            } else {
              navigate(finalRedirect);
            }
          } else {
            // If still requires 2FA after submitting, reset to allow new code
            setLastSubmittedCode(null);
            setTwoFactorCode('');
          }
        } catch (err) {
          // On error, clear the code to prevent auto-resubmit loop
          setLastSubmittedCode(null);
          setTwoFactorCode('');
        } finally {
          setIsLoggingIn(false);
        }
      };
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twoFactorCode, showTwoFactor, showBackupCodeField, savedCredentials, isLoggingIn, backupCode, lastSubmittedCode]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t('auth.login')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && !showTwoFactor && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showTwoFactor ? (
          // 2FA Step
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <h3 className="font-semibold">Zwei-Faktor-Authentifizierung</h3>
            </div>

            <Alert>
              <AlertDescription>
                Bitte gib den 6-stelligen Code aus deiner Authenticator-App ein, um die Anmeldung abzuschließen.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!showBackupCodeField ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="twoFactorCode">2FA-Code</Label>
                    <Input
                      id="twoFactorCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="000000"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => handleTwoFactorInput(e.target.value)}
                      className="text-center text-2xl tracking-widest font-mono"
                      autoFocus
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-muted-foreground">
                      Gib den 6-stelligen Code aus deiner Authenticator-App ein
                    </p>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleShowBackupCode}
                      className="text-sm text-muted-foreground hover:text-primary underline"
                    >
                      2FA verloren?
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="backupCode">Backup-Code</Label>
                  <Input
                    id="backupCode"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX"
                    value={backupCode}
                    onChange={(e) => handleBackupCodeInput(e.target.value)}
                    className="font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Gib einen deiner Backup-Codes ein, die du beim Einrichten der 2FA erhalten hast
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBackupCodeField(false);
                      setBackupCode('');
                      setUseBackupCode(false);
                    }}
                    className="text-sm text-muted-foreground hover:text-primary underline"
                  >
                    Zurück zum 2FA-Code
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToEmailPassword}
                  className="flex-1"
                >
                  Zurück
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoggingIn || (!showBackupCodeField && !twoFactorCode) || (showBackupCodeField && !backupCode)}
                >
                  {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Anmelden
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Email/Password Step
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.email')}
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
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
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/auth/reset-password"
                className="text-sm text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.login')}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/auth/register" className="text-primary hover:underline">
            {t('auth.createAccount')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}; 