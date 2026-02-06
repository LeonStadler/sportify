import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { API_URL } from '@/lib/api';
import { parseAvatarConfig } from '@/lib/avatar';
import { Check, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import NiceAvatar from 'react-nice-avatar';
import { toast } from 'sonner';

interface InviterInfo {
    id: string;
    displayName: string;
    avatarUrl?: string; // Dies ist eigentlich ein JSON-String mit Avatar-Konfiguration
}

export function Invite() {
    const { t } = useTranslation();
    const { userId } = useParams<{ userId: string }>();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [inviter, setInviter] = useState<InviterInfo | null>(null);
    const [processing, setProcessing] = useState(false);

    // Prüfe localStorage für pendingInvite, falls userId aus URL fehlt
    useEffect(() => {
        const pendingInvite = localStorage.getItem('pendingInvite');
        // Wenn kein userId in URL, aber pendingInvite vorhanden, navigiere zur Invite-Seite
        if (!userId && pendingInvite) {
            navigate(`/invite/${pendingInvite}`, { replace: true });
            return;
        }
        // Wenn userId vorhanden, speichere es in localStorage
        if (userId) {
            localStorage.setItem('pendingInvite', userId);
        }
    }, [userId, navigate]);

    useEffect(() => {
        const fetchInviterInfo = async () => {
            // Verwende userId aus URL oder aus localStorage
            const inviteUserId = userId || localStorage.getItem('pendingInvite');
            
            if (!inviteUserId) {
                toast.error(t('friends.invitePage.errors.invalidLink'));
                navigate('/');
                return;
            }

            // Speichere invite userId in localStorage für den Fall, dass User sich registriert/verifiziert
            localStorage.setItem('pendingInvite', inviteUserId);

            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/friends/invite/${inviteUserId}`);

                if (!response.ok) {
                    throw new Error(t('friends.invitePage.errors.invalidLink'));
                }

                const data = await response.json();
                setInviter(data.inviter);

                // Wenn eingeloggt, prüfe ob bereits eine Anfrage existiert
                if (isAuthenticated && user) {
                    // Prüfe ob User sich selbst einlädt
                    if (user.id === inviteUserId) {
                        toast.error(t('friends.invitePage.errors.selfInvite'));
                        localStorage.removeItem('pendingInvite');
                        navigate('/friends');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error fetching inviter info:', error);
                toast.error(t('friends.invitePage.errors.invalidOrExpired'));
                localStorage.removeItem('pendingInvite');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        // Lade Daten nur wenn userId vorhanden ist
        if (userId || localStorage.getItem('pendingInvite')) {
            fetchInviterInfo();
        }
    }, [userId, navigate, isAuthenticated, user, t]);

    const handleAcceptInvitation = async () => {
        const inviteUserId = userId || localStorage.getItem('pendingInvite');
        
        if (!inviteUserId || !isAuthenticated) {
            navigate(`/auth/login?redirect=/invite/${inviteUserId}`);
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/friends/invite/${inviteUserId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || t('friends.invitePage.errors.sendRequest'));
            }

            const responseData = await response.json();

            if (responseData.type === 'accepted' || responseData.type === 'friendship_created') {
                toast.success(t('friends.invitePage.success.friendshipCreatedTitle'), {
                    description:
                        responseData.message ||
                        t('friends.invitePage.success.friendshipCreatedDesc', { name: inviter?.displayName }),
                });
            } else {
                toast.success(t('friends.invitePage.success.requestSentTitle'), {
                    description:
                        responseData.message ||
                        t('friends.invitePage.success.requestSentDesc', { name: inviter?.displayName }),
                });
            }

            // Entferne pendingInvite aus localStorage nach erfolgreicher Annahme
            localStorage.removeItem('pendingInvite');

            // Navigate to friends page after 1.5 seconds
            setTimeout(() => {
                navigate('/friends');
            }, 1500);
        } catch (error) {
            toast.error(t('friends.invitePage.errors.sendRequestTitle'), {
                description:
                    error instanceof Error ? error.message : t('friends.invitePage.errors.unknown'),
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleLogin = () => {
        const inviteUserId = userId || localStorage.getItem('pendingInvite');
        navigate(`/auth/login?redirect=/invite/${inviteUserId}`);
    };

    const handleRegister = () => {
        const inviteUserId = userId || localStorage.getItem('pendingInvite');
        navigate(`/auth/register?invite=${inviteUserId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('friends.invitePage.loading')}</p>
                </div>
            </div>
        );
    }

    if (!inviter) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{t('friends.invitePage.title')}</CardTitle>
                    <CardDescription>
                        {t('friends.invitePage.description', { name: inviter.displayName })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {(() => {
                                const avatarConfig = inviter.avatarUrl ? parseAvatarConfig(inviter.avatarUrl) : null;
                                if (avatarConfig) {
                                    return (
                                        <NiceAvatar
                                            style={{ width: '80px', height: '80px' }}
                                            {...avatarConfig}
                                        />
                                    );
                                }
                                return (
                                    <span className="text-2xl font-bold text-primary">
                                        {inviter.displayName.charAt(0).toUpperCase()}
                                    </span>
                                );
                            })()}
                        </div>
                        <p className="text-lg font-semibold">{inviter.displayName}</p>
                    </div>

                    {isAuthenticated ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground text-center">
                                {t('friends.invitePage.promptAuthenticated', { name: inviter.displayName })}
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleAcceptInvitation}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    {processing ? t('friends.invitePage.sending') : t('friends.invitePage.accept')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/friends')}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    {t('friends.invitePage.later')}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                {t('friends.invitePage.confirmInfo')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground text-center">
                                {t('friends.invitePage.promptUnauthenticated', { name: inviter.displayName })}
                            </p>
                            <div className="space-y-2">
                                <Button
                                    onClick={handleLogin}
                                    className="w-full"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {t('friends.invitePage.login')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleRegister}
                                    className="w-full"
                                >
                                    {t('friends.invitePage.register')}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                {t('friends.invitePage.registerInfo')}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
