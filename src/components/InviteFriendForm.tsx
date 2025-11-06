import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InviteFriendFormProps {
    onSuccess?: () => void;
    className?: string;
}

export function InviteFriendForm({ onSuccess, className }: InviteFriendFormProps) {
    const { inviteFriend, sendFriendRequest, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [showUserExistsDialog, setShowUserExistsDialog] = useState(false);
    const [existingUserInfo, setExistingUserInfo] = useState<{
        userId: string;
        displayName: string;
        email: string;
    } | null>(null);
    const [isSendingRequest, setIsSendingRequest] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Bitte gib eine E-Mail-Adresse ein.');
            return;
        }

        // Einfache E-Mail-Validierung
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Bitte gib eine gültige E-Mail-Adresse ein.');
            return;
        }

        try {
            // Nur Email wird gesendet, Name und Nachname werden beim Registrieren eingegeben
            const result = await inviteFriend(email);
            
            // Wenn Benutzer bereits existiert, zeige Dialog
            if (result?.type === 'user_exists' && result.userId && result.displayName) {
                setExistingUserInfo({
                    userId: result.userId,
                    displayName: result.displayName,
                    email: result.email || email
                });
                setShowUserExistsDialog(true);
                return;
            }
            
            // Wenn bereits eine Einladung existiert, zeige Info-Nachricht
            if (result?.type === 'invitation_exists') {
                toast.info('Einladung bereits gesendet', {
                    description: result.message || `Es wurde bereits eine Einladung an ${email} gesendet.`,
                });
                setEmail('');
                return;
            }
            
            // Zeige unterschiedliche Nachrichten basierend auf Ergebnis
            if (result?.type === 'friend_request') {
                toast.success('Freundschaftsanfrage gesendet', {
                    description: `Eine Freundschaftsanfrage wurde an ${email} gesendet.`,
                });
            } else {
                toast.success('Einladung gesendet', {
                    description: `Eine Einladung wurde an ${email} gesendet.`,
                });
            }
            setEmail('');
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast.error('Fehler beim Senden der Einladung', {
                description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
            });
        }
    };

    return (
        <>
        <form onSubmit={handleSubmit} className={className}>
            <div className="space-y-3">
                <div>
                    <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="invite-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="freund@example.com"
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Die Person kann sich bei der Registrierung selbst ihren Namen angeben.
                    </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
                    {isLoading ? 'Wird gesendet...' : 'Einladung senden'}
                </Button>
            </div>
        </form>

        <AlertDialog open={showUserExistsDialog} onOpenChange={setShowUserExistsDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Benutzer bereits registriert</AlertDialogTitle>
                    <AlertDialogDescription>
                        Die E-Mail-Adresse <strong>{existingUserInfo?.email}</strong> ist bereits bei Sportify registriert.
                        {existingUserInfo?.displayName && (
                            <>
                                {' '}Der Benutzer heißt <strong>{existingUserInfo.displayName}</strong>.
                            </>
                        )}
                        <br /><br />
                        Möchtest du stattdessen eine Freundschaftsanfrage an diese Person senden?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                        setShowUserExistsDialog(false);
                        setExistingUserInfo(null);
                        setEmail('');
                    }}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            if (!existingUserInfo) return;
                            
                            setIsSendingRequest(true);
                            try {
                                await sendFriendRequest(existingUserInfo.userId);
                                toast.success('Freundschaftsanfrage gesendet', {
                                    description: `Eine Freundschaftsanfrage wurde an ${existingUserInfo.displayName} gesendet.`,
                                });
                                setShowUserExistsDialog(false);
                                setExistingUserInfo(null);
                                setEmail('');
                                if (onSuccess) {
                                    onSuccess();
                                }
                            } catch (error) {
                                toast.error('Fehler beim Senden der Freundschaftsanfrage', {
                                    description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
                                });
                            } finally {
                                setIsSendingRequest(false);
                            }
                        }}
                        disabled={isSendingRequest}
                    >
                        {isSendingRequest ? 'Wird gesendet...' : 'Freundschaftsanfrage senden'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}

