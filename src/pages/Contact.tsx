import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Globe, Mail, MapPin, Palette, Phone, Send, Settings } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { toast } from 'sonner';

export default function Contact() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const contactSchema = React.useMemo(() => z.object({
    name: z.string().min(2, t('validation.nameMin')),
    email: z.string().email(t('validation.invalidEmail')),
    subject: z.string().min(5, t('validation.subjectMin')),
    message: z.string().min(10, t('validation.messageMin'))
  }), [t]);

  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Mock API call - hier würde normalerweise die E-Mail versendet werden
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Contact form submission:', data);
      
      toast.success(t('contact.messageSent'), {
        description: t('contact.thankYouMessage')
      });
      
      reset();
    } catch (error) {
      toast.error(t('common.error'), {
        description: t('common.error')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('contact.back')}
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('contact.title')}</h1>
                <p className="text-xs text-muted-foreground">Sportify by Leon Stadler</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Desktop: Language & Theme Switchers */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent transition-colors">
                <LanguageSwitcher />
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent transition-colors">
                <ThemeSwitcher />
              </div>
            </div>
            
            {/* Mobile: Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t('landing.openSettings')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('landing.settings')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{t('landing.language')}</span>
                  </div>
                  <LanguageSwitcher />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span>{t('landing.theme')}</span>
                  </div>
                  <ThemeSwitcher />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/auth/login">{t('auth.login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">{t('auth.register')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('contact.contactUs')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>{t('contact.contactInfo')}</CardTitle>
                <CardDescription>
                  {t('contact.contactWays')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('contact.email')}</p>
                    <p className="text-sm text-muted-foreground">contact@sportify.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('contact.phone')}</p>
                    <p className="text-sm text-muted-foreground">+49 (0) 123 456 789</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('contact.address')}</p>
                    <p className="text-sm text-muted-foreground">
                      Musterstraße 123<br />
                      12345 Musterstadt<br />
                      Deutschland
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('contact.responseTime')}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.sendMessage')}</CardTitle>
                <CardDescription>
                  {t('contact.formDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.name')} *</Label>
                      <Input
                        id="name"
                        placeholder={t('contact.namePlaceholder')}
                        {...register('name')}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('authPages.emailVerification.emailPlaceholder')}
                        {...register('email')}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.subject')} *</Label>
                    <Input
                      id="subject"
                      placeholder={t('contact.subjectPlaceholder')}
                      {...register('subject')}
                      className={errors.subject ? 'border-destructive' : ''}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.message')} *</Label>
                    <Textarea
                      id="message"
                      placeholder={t('contact.messagePlaceholder')}
                      rows={6}
                      {...register('message')}
                      className={errors.message ? 'border-destructive' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Alert>
                    <AlertDescription>
                      {t('contact.privacyNote')}{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        {t('contact.privacyLink')}
                      </Link>.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                        {t('contact.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('contact.sendMessageButton')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            {t('contact.faqTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('contact.faq.freeTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('contact.faq.freeAnswer')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('contact.faq.secureTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('contact.faq.secureAnswer')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('contact.faq.devicesTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('contact.faq.devicesAnswer')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('contact.faq.deleteTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('contact.faq.deleteAnswer')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            {t('common.copyright')}
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              {t('landing.footerLinks.privacy')}
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              {t('landing.footerLinks.terms')}
            </Link>
            <Link to="/imprint" className="text-sm text-muted-foreground hover:text-foreground">
              {t('landing.footerLinks.imprint')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 