import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { PublicHeader } from '@/components/common/PublicHeader';
import { LegalFooter } from '@/components/legal/LegalFooter';

export default function Register() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  // Lade inviteUserId: Primär aus URL, Fallback aus localStorage
  const [inviteUserId, setInviteUserId] = useState(() => {
    const inviteFromUrl = searchParams.get('invite');
    // Speichere in localStorage nur wenn aus URL (als Fallback)
    if (inviteFromUrl) {
      localStorage.setItem('pendingInvite', inviteFromUrl);
      return inviteFromUrl;
    }
    // Fallback: aus localStorage (z.B. wenn von Invite-Seite kommt)
    return localStorage.getItem('pendingInvite') || '';
  });

  // Update localStorage wenn invite in URL geändert wird
  useEffect(() => {
    const inviteUserIdFromUrl = searchParams.get('invite');
    if (inviteUserIdFromUrl && inviteUserIdFromUrl !== inviteUserId) {
      localStorage.setItem('pendingInvite', inviteUserIdFromUrl);
      setInviteUserId(inviteUserIdFromUrl);
    }
  }, [searchParams, inviteUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <PublicHeader variant="minimal" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('authPages.startFree')}
            </h1>
            <p className="text-muted-foreground">
              {t('authPages.createAccount')}
            </p>
          </div>
          <RegisterForm redirectTo={inviteUserId ? `/invite/${inviteUserId}` : undefined} />
        </div>
      </div>

      <LegalFooter />
    </div>
  );
} 