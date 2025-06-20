import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Shield, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const twoFactorSchema = z.object({
  code: z.string().length(6, '2FA-Code muss genau 6 Zeichen lang sein').regex(/^\d+$/, '2FA-Code darf nur Zahlen enthalten')
});

type TwoFactorData = z.infer<typeof twoFactorSchema>;

export default function TwoFactor() {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<TwoFactorData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: ''
    }
  });

  const code = watch('code');

  // Countdown für erneut senden
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: TwoFactorData) => {
    setIsLoading(true);
    
    try {
      // Mock API call - hier würde normalerweise der 2FA-Code verifiziert werden
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('2FA code submitted:', data.code);
      
      // Simulate success/failure
      if (data.code === '123456') {
        toast.success('Erfolgreich verifiziert!', {
          description: 'Sie werden zur App weitergeleitet.'
        });
        // Hier würde normalerweise die Weiterleitung zur App erfolgen
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        toast.error('Ungültiger Code', {
          description: 'Der eingegebene 2FA-Code ist nicht korrekt.'
        });
      }
    } catch (error) {
      toast.error('Fehler bei der Verifizierung', {
        description: 'Bitte versuchen Sie es später erneut.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    try {
      // Mock API call - hier würde normalerweise ein neuer 2FA-Code gesendet werden
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Neuer Code gesendet!', {
        description: 'Überprüfen Sie Ihre Authenticator-App.'
      });
      
      setCountdown(60); // 60 Sekunden Countdown
    } catch (error) {
      toast.error('Fehler beim Senden', {
        description: 'Bitte versuchen Sie es später erneut.'
      });
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (code && code.length === 6 && !errors.code) {
      handleSubmit(onSubmit)();
    }
  }, [code, errors.code, handleSubmit]);

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

          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Zwei-Faktor-Authentifizierung
            </h1>
            <p className="text-muted-foreground">
              Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein, um die Anmeldung abzuschließen.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sicherheitscode eingeben</CardTitle>
              <CardDescription>
                Der Code wird alle 30 Sekunden neu generiert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code">6-stelliger Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    {...register('code')}
                    className={`text-center text-2xl tracking-widest font-mono ${errors.code ? 'border-destructive' : ''}`}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">{errors.code.message}</p>
                  )}
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Demo-Code:</strong> Verwenden Sie <code className="bg-muted px-1 rounded">123456</code> für die Demo-Anmeldung.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={isLoading || code?.length !== 6}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                      Wird verifiziert...
                    </>
                  ) : (
                    'Code verifizieren'
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-sm"
                  >
                    {countdown > 0 
                      ? `Neuen Code anfordern (${countdown}s)`
                      : 'Neuen Code anfordern'
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Probleme mit der Authentifizierung?{' '}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                Kontaktieren Sie uns
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