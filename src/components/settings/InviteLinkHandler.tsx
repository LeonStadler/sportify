import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function InviteLinkHandler() {
  const { isAuthenticated, acceptInvitation } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const invitationToken = searchParams.get('token');

  useEffect(() => {
    if (isAuthenticated && invitationToken) {
      const handleInvitation = async () => {
        try {
          await acceptInvitation(invitationToken);
          toast({
            title: t("auth.invitation.acceptedTitle"),
            description: t("auth.invitation.acceptedDesc"),
          });
          // Remove token from URL
          searchParams.delete('token');
          setSearchParams(searchParams, { replace: true });
        } catch (error) {
          toast({
            title: t("auth.invitation.errorTitle"),
            description:
              error instanceof Error
                ? error.message
                : t("auth.invitation.errorDesc"),
            variant: "destructive",
          });
          // Remove token from URL even on error
          searchParams.delete('token');
          setSearchParams(searchParams, { replace: true });
        }
      };

      handleInvitation();
    }
  }, [isAuthenticated, invitationToken, acceptInvitation, toast, searchParams, setSearchParams, t]);

  return null;
}
