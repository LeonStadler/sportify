import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function InviteLinkHandler() {
  const { isAuthenticated, acceptInvitation } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const invitationToken = searchParams.get('token');

  useEffect(() => {
    if (isAuthenticated && invitationToken) {
      const handleInvitation = async () => {
        try {
          await acceptInvitation(invitationToken);
          toast({
            title: "Freundschaft angenommen",
            description: "Die Freundschaft wurde erfolgreich erstellt!",
          });
          // Remove token from URL
          searchParams.delete('token');
          setSearchParams(searchParams, { replace: true });
        } catch (error) {
          toast({
            title: "Fehler",
            description: error instanceof Error ? error.message : "Fehler beim Akzeptieren der Einladung",
            variant: "destructive",
          });
          // Remove token from URL even on error
          searchParams.delete('token');
          setSearchParams(searchParams, { replace: true });
        }
      };

      handleInvitation();
    }
  }, [isAuthenticated, invitationToken, acceptInvitation, toast, searchParams, setSearchParams]);

  return null;
}

