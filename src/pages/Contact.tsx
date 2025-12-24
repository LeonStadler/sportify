import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  Download,
  Monitor,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

export default function Contact() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const faqItems = React.useMemo(
    () => [
      {
        id: "free",
        icon: Sparkles,
        title: t("contact.faq.freeTitle"),
        answer: t("contact.faq.freeAnswer"),
      },
      {
        id: "secure",
        icon: ShieldCheck,
        title: t("contact.faq.secureTitle"),
        answer: t("contact.faq.secureAnswer"),
      },
      {
        id: "devices",
        icon: Monitor,
        title: t("contact.faq.devicesTitle"),
        answer: t("contact.faq.devicesAnswer"),
      },
      {
        id: "app",
        icon: Smartphone,
        title: t("contact.faq.appTitle"),
        answer: t("contact.faq.appAnswer"),
      },
      {
        id: "response",
        icon: Clock,
        title: t("contact.faq.responseTitle"),
        answer: t("contact.faq.responseAnswer"),
      },
      {
        id: "export",
        icon: Download,
        title: t("contact.faq.exportTitle"),
        answer: t("contact.faq.exportAnswer"),
      },
      {
        id: "delete",
        icon: Trash2,
        title: t("contact.faq.deleteTitle"),
        answer: t("contact.faq.deleteAnswer"),
      },
    ],
    [t]
  );

  const contactSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("validation.nameMin")),
        email: z.string().email(t("validation.invalidEmail")),
        subject: z.string().min(5, t("validation.subjectMin")),
        message: z.string().min(10, t("validation.messageMin")),
      }),
    [t]
  );

  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          subject: data.subject.trim(),
          message: data.message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("common.error"));
      }

      toast.success(t("contact.messageSent"), {
        description: t("contact.thankYouMessage"),
      });

      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("common.error");
      toast.error(t("common.error"), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PublicHeader
        title={t("contact.title")}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("contact.contactUs")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("contact.description")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t("contact.sendMessage")}</CardTitle>
              <CardDescription>
                {t("contact.formDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("contact.name")} *</Label>
                    <Input
                      id="name"
                      placeholder={t("contact.namePlaceholder")}
                      {...register("name")}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t(
                        "authPages.emailVerification.emailPlaceholder"
                      )}
                      {...register("email")}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t("contact.subject")} *</Label>
                  <Input
                    id="subject"
                    placeholder={t("contact.subjectPlaceholder")}
                    {...register("subject")}
                    className={errors.subject ? "border-destructive" : ""}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("contact.message")} *</Label>
                  <Textarea
                    id="message"
                    placeholder={t("contact.messagePlaceholder")}
                    rows={6}
                    {...register("message")}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Alert>
                  <AlertDescription>
                    {t("contact.privacyNote")}{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                    >
                      {t("contact.privacyLink")}
                    </Link>
                    .
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
                      {t("contact.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t("contact.sendMessageButton")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            {t("contact.faqTitle")}
          </h2>
          <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-muted/30 via-background to-background shadow-[0_30px_60px_-45px_rgba(15,23,42,0.6)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 right-[-10%] h-44 w-44 rounded-full bg-primary/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 left-[-10%] h-44 w-44 rounded-full bg-primary/10 blur-3xl"
            />
            <CardContent className="relative p-0">
              <Accordion type="single" collapsible>
                {faqItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="border-border/60 data-[state=open]:bg-muted/20"
                    >
                      <AccordionTrigger className="group px-6 py-5 hover:no-underline data-[state=open]:bg-muted/40">
                        <div className="flex items-center gap-4 text-left">
                          <div className="h-11 w-11 rounded-2xl border border-primary/20 bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_30px_-15px_rgba(15,23,42,0.4)] group-data-[state=open]:bg-primary/20 group-data-[state=open]:border-primary/40">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div>
                            <span className="inline-flex items-center rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <p className="mt-2 text-base font-semibold text-foreground">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
