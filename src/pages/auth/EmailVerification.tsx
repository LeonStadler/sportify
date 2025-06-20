import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Mail, RotateCcw, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const resendSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse')
});

type ResendData = z.infer<typeof resendSchema>;

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResendData>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: email
    }
  });

  // Countdown für erneut senden
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-verify wenn Token vorhanden ist
  useEffect(() => {
    if (token && !verificationAttempted) {
      verifyEmail(token);
    }
  }, [token, verificationAttempted]);

  const verifyEmail = async (verificationToken: string) => {
    setVerificationAttempted(true);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        toast.success('E-Mail erfolgreich verifiziert!', {
          description: 'Ihr Konto ist jetzt aktiviert.'
        });
      } else {
        toast.error('Ungültiger Verifizierungslink', {
          description: data.error || 'Der Link ist abgelaufen oder ungültig.'
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error('Fehler bei der Verifizierung', {
        description: 'Bitte versuchen Sie es später erneut.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (data: ResendData) => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Verifizierungs-E-Mail erneut gesendet!', {
          description: 'Überprüfen Sie Ihr Postfach und Spam-Ordner.'
        });
        setCountdown(60); // 60 Sekunden Countdown
      } else {
        toast.error('Fehler beim Senden', {
          description: result.error || 'Bitte versuchen Sie es später erneut.'
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Fehler beim Senden', {
        description: 'Bitte versuchen Sie es später erneut.'
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
              Zur Anmeldung
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
          {isVerified ? (
            // Erfolgreich verifiziert
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                E-Mail erfolgreich verifiziert!
              </h1>
              <p className="text-muted-foreground mb-8">
                Ihr Sportify-Konto ist jetzt vollständig aktiviert. 
                Sie können sich jetzt anmelden und alle Features nutzen.
              </p>
              
              <div className="space-y-4">
                <Button size="lg" className="w-full" asChild>
                  <Link to="/auth/login">
                    Jetzt anmelden
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/">
                    Zur Startseite
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            // Noch nicht verifiziert oder fehlerhafte Verifizierung
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  E-Mail-Adresse bestätigen
                </h1>
                <p className="text-muted-foreground">
                  {token 
                    ? 'Ihre E-Mail wird verifiziert...' 
                    : 'Überprüfen Sie Ihr Postfach und klicken Sie auf den Bestätigungslink.'
                  }
                </p>
              </div>

              {isLoading && token ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground">
                        Ihre E-Mail wird verifiziert...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : !token && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bestätigungs-E-Mail erneut senden</CardTitle>
                    <CardDescription>
                      Haben Sie keine E-Mail erhalten? Senden Sie eine neue Bestätigung.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(handleResendVerification)} className="space-y-4">
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

                      <Alert>
                        <AlertDescription>
                          Überprüfen Sie auch Ihren Spam-Ordner. Die E-Mail kann bis zu 5 Minuten dauern.
                        </AlertDescription>
                      </Alert>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading || countdown > 0}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                            Wird gesendet...
                          </>
                        ) : countdown > 0 ? (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Erneut senden ({countdown}s)
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Bestätigungs-E-Mail senden
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {token && verificationAttempted && !isVerified && !isLoading && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <Alert variant="destructive">
                      <AlertDescription>
                        Der Verifizierungslink ist ungültig oder abgelaufen. 
                        Fordern Sie einen neuen Link an.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" asChild>
                        <Link to="/auth/email-verification">
                          Neuen Link anfordern
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Bereits verifiziert?{' '}
                  <Link to="/auth/login" className="text-primary hover:underline font-medium">
                    Hier anmelden
                  </Link>
                </p>
              </div>
            </div>
          )}
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