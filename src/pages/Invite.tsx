import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/api';
import { parseAvatarConfig } from '@/lib/avatar';
import { Check, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NiceAvatar from 'react-nice-avatar';
import { toast } from 'sonner';

interface InviterInfo {
    id: string;
    displayName: string;
    avatarUrl?: string; // Dies ist eigentlich ein JSON-String mit Avatar-Konfiguration
}

export function Invite() {
    const { userId } = useParams<{ userId: string }>();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [inviter, setInviter] = useState<InviterInfo | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchInviterInfo = async () => {
            if (!userId) {
                toast.error('Ungültiger Einladungslink.');
                navigate('/');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/friends/invite/${userId}`);

                if (!response.ok) {
                    throw new Error('Einladungslink ungültig.');
                }

                const data = await response.json();
                setInviter(data.inviter);

                // Wenn eingeloggt, prüfe ob bereits eine Anfrage existiert
                if (isAuthenticated && user) {
                    // Prüfe ob User sich selbst einlädt
                    if (user.id === userId) {
                        toast.error('Du kannst dir selbst keine Freundschaftsanfrage senden.');
                        navigate('/friends');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error fetching inviter info:', error);
                toast.error('Einladungslink ungültig oder abgelaufen.');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchInviterInfo();
    }, [userId, navigate, isAuthenticated, user]);

    const handleAcceptInvitation = async () => {
        if (!userId || !isAuthenticated) {
            navigate(`/auth/login?redirect=/invite/${userId}`);
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/friends/invite/${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Fehler beim Senden der Freundschaftsanfrage.');
            }

            const responseData = await response.json();

            if (responseData.type === 'accepted' || responseData.type === 'friendship_created') {
                toast.success('Freundschaft erstellt', {
                    description: responseData.message || `Ihr seid jetzt mit ${inviter?.displayName} befreundet.`,
                });
            } else {
                toast.success('Freundschaftsanfrage gesendet', {
                    description: responseData.message || `Eine Freundschaftsanfrage wurde an ${inviter?.displayName} gesendet.`,
                });
            }

            // Navigate to friends page after 1.5 seconds
            setTimeout(() => {
                navigate('/friends');
            }, 1500);
        } catch (error) {
            toast.error('Fehler beim Senden der Freundschaftsanfrage', {
                description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleLogin = () => {
        navigate(`/auth/login?redirect=/invite/${userId}`);
    };

    const handleRegister = () => {
        navigate(`/auth/register?invite=${userId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Lade Einladung...</p>
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
                    <CardTitle className="text-2xl">Freundschaftseinladung</CardTitle>
                    <CardDescription>
                        {inviter.displayName} möchte dich zu seinen Freunden hinzufügen
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
                                Möchtest du {inviter.displayName} als Freund hinzufügen?
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleAcceptInvitation}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    {processing ? 'Wird gesendet...' : 'Annehmen'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/friends')}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Später
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Die Freundschaft wird direkt erstellt.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground text-center">
                                Um {inviter.displayName} als Freund hinzuzufügen, musst du dich anmelden.
                            </p>
                            <div className="space-y-2">
                                <Button
                                    onClick={handleLogin}
                                    className="w-full"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Anmelden
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleRegister}
                                    className="w-full"
                                >
                                    Registrieren
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Falls du noch kein Konto hast, kannst du dich registrieren.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

