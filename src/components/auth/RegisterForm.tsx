import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RegisterData, useAuth } from '@/contexts/AuthContext';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  nickname: z.string().optional(),
  displayPreference: z.enum(['nickname', 'firstName', 'fullName']),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'Sie müssen den Nutzungsbedingungen zustimmen')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      displayPreference: 'firstName',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    }
  });

  const displayPreference = watch('displayPreference');
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const nickname = watch('nickname');

  const getDisplayPreview = () => {
    switch (displayPreference) {
      case 'nickname':
        return nickname || 'Dein Spitzname';
      case 'firstName':
        return firstName || 'Dein Vorname';
      case 'fullName':
        return `${firstName || 'Vorname'} ${lastName || 'Nachname'}`;
      default:
        return '';
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      
      const registerData: RegisterData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname || undefined,
        displayPreference: data.displayPreference
      };

      const result = await registerUser(registerData);
      
      if (onSuccess) {
        onSuccess();
      } else if (result.needsVerification) {
        // Umleitung zur E-Mail-Verifizierung
        navigate(`/auth/email-verification?email=${encodeURIComponent(result.email)}`);
      }
    } catch (err) {
      // Error is handled by auth context
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t('auth.createAccount')}
        </CardTitle>
        <CardDescription className="text-center">
          Erstelle dein kostenloses Sportify-Konto
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('auth.firstName')}</Label>
              <Input
                id="firstName"
                placeholder="Max"
                {...register('firstName')}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t('auth.lastName')}</Label>
              <Input
                id="lastName"
                placeholder="Mustermann"
                {...register('lastName')}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">{t('auth.nickname')} (optional)</Label>
            <Input
              id="nickname"
              placeholder="SportFreund123"
              {...register('nickname')}
            />
          </div>

          <div className="space-y-3">
            <Label>{t('profile.displayPreferences')}</Label>
            <RadioGroup
              defaultValue="firstName"
              onValueChange={(value) => setValue('displayPreference', value as 'nickname' | 'firstName' | 'fullName')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="firstName" id="firstName-option" />
                <Label htmlFor="firstName-option">{t('profile.useFirstName')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fullName" id="fullName-option" />
                <Label htmlFor="fullName-option">{t('profile.useFullName')}</Label>
              </div>
              {nickname && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nickname" id="nickname-option" />
                  <Label htmlFor="nickname-option">{t('profile.useNickname')}</Label>
                </div>
              )}
            </RadioGroup>
            <div className="text-sm text-muted-foreground">
              Anzeige: <span className="font-medium">{getDisplayPreview()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="deine@email.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
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
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              {...register('terms')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="terms" className="text-sm">
              Ich stimme den{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Nutzungsbedingungen
              </Link>{' '}
              und der{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>{' '}
              zu
            </Label>
          </div>
          {errors.terms && (
            <p className="text-sm text-destructive">{errors.terms.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.createAccount')}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            {t('auth.login')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}; 