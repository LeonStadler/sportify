import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, Send, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse')
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      // Aus Sicherheitsgründen zeigen wir immer eine Erfolgsmeldung,
      // auch wenn die E-Mail-Adresse nicht existiert
      setIsSubmitted(true);
      toast.success('E-Mail versendet!', {
        description: response.ok 
          ? 'Überprüfen Sie Ihr Postfach für weitere Anweisungen.'
          : 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie eine Reset-E-Mail.'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      // Aus Sicherheitsgründen zeigen wir auch bei Fehlern eine Erfolgsmeldung
      setIsSubmitted(true);
      toast.success('E-Mail versendet!', {
        description: 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie eine Reset-E-Mail.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Anmeldung
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sportify</h1>
              <p className="text-xs text-muted-foreground">by Leon Stadler</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/auth/register">Registrieren</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Passwort vergessen?
            </h1>
            <p className="text-muted-foreground">
              Kein Problem! Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
            </p>
          </div>

          {!isSubmitted ? (
            <Card>
              <CardHeader>
                <CardTitle>Passwort zurücksetzen</CardTitle>
                <CardDescription>
                  Geben Sie die E-Mail-Adresse Ihres Kontos ein
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ihre@email.com"
                      {...register('email')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Reset-Link senden
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      E-Mail versendet!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Wir haben eine E-Mail an <strong>{email}</strong> gesendet. 
                      Überprüfen Sie Ihr Postfach und folgen Sie den Anweisungen zum Zurücksetzen Ihres Passworts.
                    </p>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Haben Sie keine E-Mail erhalten? Überprüfen Sie auch Ihren Spam-Ordner oder{' '}
                      <button 
                        onClick={() => setIsSubmitted(false)}
                        className="text-primary hover:underline"
                      >
                        versuchen Sie es erneut
                      </button>.
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth/login">Zurück zur Anmeldung</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Erinnern Sie sich wieder an Ihr Passwort?{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Hier anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Sportify. Entwickelt mit ❤️ von Leon Stadler.
          </p>
        </div>
      </footer>
    </div>
  );
} 