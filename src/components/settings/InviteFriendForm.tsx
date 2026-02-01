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
import { useAuth } from '@/hooks/use-auth';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface InviteFriendFormProps {
    onSuccess?: () => void;
    className?: string;
}

export function InviteFriendForm({ onSuccess, className }: InviteFriendFormProps) {
    const { inviteFriend, sendFriendRequest, isLoading } = useAuth();
    const { t } = useTranslation();
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
            toast.error(t('inviteFriendForm.errors.enterEmail'));
            return;
        }

        // Einfache E-Mail-Validierung
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error(t('inviteFriendForm.errors.invalidEmail'));
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
                toast.info(t('inviteFriendForm.info.inviteAlreadySentTitle'), {
                    description:
                        result.message ||
                        t('inviteFriendForm.info.inviteAlreadySentDesc', {
                            email,
                        }),
                });
                setEmail('');
                return;
            }
            
            // Zeige unterschiedliche Nachrichten basierend auf Ergebnis
            if (result?.type === 'friend_request') {
                toast.success(t('inviteFriendForm.success.requestSentTitle'), {
                    description: t('inviteFriendForm.success.requestSentDesc', {
                        target: email,
                    }),
                });
            } else {
                toast.success(t('inviteFriendForm.success.inviteSentTitle'), {
                    description: t('inviteFriendForm.success.inviteSentDesc', {
                        target: email,
                    }),
                });
            }
            setEmail('');
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast.error(t('inviteFriendForm.errors.sendInvite'), {
                description:
                    error instanceof Error
                        ? error.message
                        : t('inviteFriendForm.errors.unknown'),
            });
        }
    };

    return (
        <>
        <form onSubmit={handleSubmit} className={className}>
            <div className="space-y-3">
                <div>
                    <Label htmlFor="invite-email">
                        {t('inviteFriendForm.emailLabel')}
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="invite-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('inviteFriendForm.emailPlaceholder')}
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t('inviteFriendForm.nameHint')}
                    </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
                    {isLoading
                        ? t('inviteFriendForm.actions.sending')
                        : t('inviteFriendForm.actions.sendInvite')}
                </Button>
            </div>
        </form>

        <AlertDialog open={showUserExistsDialog} onOpenChange={setShowUserExistsDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('inviteFriendForm.userExists.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('inviteFriendForm.userExists.description', {
                            email: existingUserInfo?.email,
                        })}{' '}
                        {existingUserInfo?.displayName && (
                            <>
                                {t('inviteFriendForm.userExists.nameLabel', {
                                    name: existingUserInfo.displayName,
                                })}{' '}
                            </>
                        )}
                        <br /><br />
                        {t('inviteFriendForm.userExists.question')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                        setShowUserExistsDialog(false);
                        setExistingUserInfo(null);
                        setEmail('');
                    }}>
                        {t('inviteFriendForm.actions.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            if (!existingUserInfo) return;
                            
                            setIsSendingRequest(true);
                            try {
                                await sendFriendRequest(existingUserInfo.userId);
                                toast.success(
                                    t('inviteFriendForm.success.requestSentTitle'),
                                    {
                                        description: t(
                                            'inviteFriendForm.success.requestSentDesc',
                                            { target: existingUserInfo.displayName }
                                        ),
                                    }
                                );
                                setShowUserExistsDialog(false);
                                setExistingUserInfo(null);
                                setEmail('');
                                if (onSuccess) {
                                    onSuccess();
                                }
                            } catch (error) {
                                toast.error(
                                    t('inviteFriendForm.errors.sendRequest'),
                                    {
                                        description:
                                            error instanceof Error
                                                ? error.message
                                                : t('inviteFriendForm.errors.unknown'),
                                    }
                                );
                            } finally {
                                setIsSendingRequest(false);
                            }
                        }}
                        disabled={isSendingRequest}
                    >
                        {isSendingRequest
                            ? t('inviteFriendForm.actions.sending')
                            : t('inviteFriendForm.actions.sendRequest')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
