import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  // Priorisiere redirect aus URL, dann localStorage (Fallback), dann Standard
  const redirectFromUrl = searchParams.get('redirect');
  const pendingInvite = localStorage.getItem('pendingInvite');
  const redirectTo = redirectFromUrl || (pendingInvite ? `/invite/${pendingInvite}` : '/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <AuthHeader showAuthButtons={true} authButtonType="register" />

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