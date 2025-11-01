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
    const { inviteFriend, isLoading } = useAuth();
    const [email, setEmail] = useState('');

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
            await inviteFriend(email);
            toast.success('Einladung gesendet', {
                description: `Eine Einladung wurde an ${email} gesendet.`,
            });
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
    );
}

