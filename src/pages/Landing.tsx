import {
    ArrowRight,
    BarChart3,
    Check,
    Shield,
    Smartphone,
    Star,
    Trophy,
    Users,
    Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Trophy,
      title: 'Live Scoreboard',
      description: 'Verfolge deine Leistungen in Echtzeit und vergleiche dich mit anderen Athleten.'
    },
    {
      icon: BarChart3,
      title: 'Detaillierte Statistiken',
      description: 'Analysiere deine Fortschritte mit umfassenden Charts und Metriken.'
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Verbinde dich mit Freunden, lade sie ein und motiviert euch gegenseitig.'
    },
    {
      icon: Zap,
      title: 'Echtzeit Updates',
      description: 'Erhalte sofortige Updates über deine Aktivitäten und Erfolge.'
    },
    {
      icon: Shield,
      title: 'Sichere Daten',
      description: 'Deine persönlichen Daten sind mit modernster Verschlüsselung geschützt.'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Perfekt optimiert für mobile Geräte - trainiere und tracke überall.'
    }
  ];

  const testimonials = [
    {
      name: 'Max Mustermann',
      role: 'Personal Trainer',
      content: 'Sportify hat meine Art zu trainieren revolutioniert. Die Statistiken helfen mir enorm.',
      rating: 5
    },
    {
      name: 'Anna Schmidt',
      role: 'Hobby-Athletin',
      content: 'Endlich eine App, die alle meine Fitnessdaten übersichtlich zusammenfasst.',
      rating: 5
    },
    {
      name: 'Tom Weber',
      role: 'Crossfit Athlete',
      content: 'Das Scoreboard motiviert mich täglich, meine Grenzen zu überwinden.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
            <Button variant="ghost" asChild>
              <Link to="/contact">Kontakt</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth/login">Anmelden</Link>
            </Button>
            <Button asChild>
              <Link to="/auth/register">Registrieren</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          🚀 Neu: Multi-Language Support
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Deine ultimative
          <span className="text-primary"> Sports Analytics</span>
          <br />Plattform
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Tracke deine Workouts, analysiere deine Fortschritte und erreiche deine Fitnessziele 
          mit der modernsten Sports Analytics Plattform von Leon Stadler.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="text-lg px-8">
            <Link to="/auth/register">
              Kostenlos starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-lg px-8">
            <Link to="/contact">Kontakt aufnehmen</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          ✨ Keine Kreditkarte erforderlich • 🔒 100% sicher • 🎯 Sofort loslegen
        </p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Alles was du brauchst
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Von Live-Tracking bis zu detaillierten Analytics - Sportify bietet 
            alle Tools für deinen Fitness-Erfolg.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Was unsere Nutzer sagen
            </h2>
            <p className="text-xl text-muted-foreground">
              Tausende von Athleten vertrauen bereits auf Sportify
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Bereit durchzustarten?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Schließe dich tausenden von Athleten an und beginne noch heute 
          deine Fitness-Reise mit Sportify.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="text-lg px-8">
            <Link to="/auth/register">
              Jetzt kostenlos registrieren
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-muted-foreground">Kostenlos starten</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-muted-foreground">Keine Bindung</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-muted-foreground">Sofort loslegen</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Sportify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Die moderne Sports Analytics Plattform für ambitionierte Athleten.
                Entwickelt mit ❤️ von Leon Stadler.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Live Scoreboard</li>
                <li>Workout Tracking</li>
                <li>Statistiken & Analytics</li>
                <li>Community Features</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Entwickler</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Leon Stadler</li>
                <li>React & TypeScript</li>
                <li>Moderne Web-Technologien</li>
                <li>Open Source Komponenten</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Rechtliches</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground">Datenschutz</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">AGB</Link></li>
                <li><Link to="/imprint" className="hover:text-foreground">Impressum</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Kontakt</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Sportify. Alle Rechte vorbehalten. Entwickelt von Leon Stadler.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 