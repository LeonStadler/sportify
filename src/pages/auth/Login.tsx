import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { LoginForm } from '@/components/auth/LoginForm';
import { LegalFooter } from '@/components/LegalFooter';
import { PublicHeader } from '@/components/PublicHeader';

export default function Login() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  // Priorisiere redirect aus URL, dann localStorage (Fallback), dann Standard
  const redirectFromUrl = searchParams.get('redirect');
  const pendingInvite = localStorage.getItem('pendingInvite');
  const redirectTo = redirectFromUrl || (pendingInvite ? `/invite/${pendingInvite}` : '/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <PublicHeader variant="minimal" />

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

      <LegalFooter />
    </div>
  );
} 