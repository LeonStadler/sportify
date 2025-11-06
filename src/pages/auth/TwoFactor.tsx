import { zodResolver } from "@hookform/resolvers/zod";
import { Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

import { AuthHeader } from "@/components/auth/AuthHeader";
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
import { toast } from "sonner";

export default function TwoFactor() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const twoFactorSchema = useMemo(
    () =>
      z.object({
        code: z
          .string()
          .length(6, t("validation.codeLength"))
          .regex(/^\d+$/, t("validation.codeNumbers")),
      }),
    [t]
  );

  type TwoFactorData = z.infer<typeof twoFactorSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TwoFactorData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: "",
    },
  });

  const code = watch("code");

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success/failure - hier würde normalerweise der Code gegen die Authenticator-App verifiziert werden
      // Placeholder: Im echten System würde hier die API-Anfrage zur Verifizierung erfolgen
      toast.error(t("common.error"), {
        description: t("common.error"),
      });
    } catch (error) {
      toast.error(t("common.error"), {
        description: t("common.error"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      // Mock API call - hier würde normalerweise ein neuer 2FA-Code gesendet werden
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(t("common.success"), {
        description: t("common.success"),
      });

      setCountdown(60); // 60 Sekunden Countdown
    } catch (error) {
      toast.error(t("common.error"), {
        description: t("common.error"),
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
      <AuthHeader
        backTo="/auth/login"
        backText={t("authPages.twoFactor.backToLogin")}
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("authPages.twoFactor.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("authPages.twoFactor.description")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("authPages.twoFactor.enterCode")}</CardTitle>
              <CardDescription>
                {t("authPages.twoFactor.codeRegenerates")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code">
                    {t("authPages.twoFactor.sixDigitCode")}
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder={t("authPages.twoFactor.codePlaceholder")}
                    maxLength={6}
                    {...register("code")}
                    className={`text-center text-2xl tracking-widest font-mono ${errors.code ? "border-destructive" : ""}`}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || code?.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                      {t("authPages.twoFactor.verifying")}
                    </>
                  ) : (
                    t("authPages.twoFactor.verifyCode")
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
                      ? t("authPages.twoFactor.requestNewCodeCountdown", {
                          count: countdown,
                        })
                      : t("authPages.twoFactor.requestNewCode")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("authPages.twoFactor.problems")}{" "}
              <Link
                to="/contact"
                className="text-primary hover:underline font-medium"
              >
                {t("authPages.twoFactor.contactUs")}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("common.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
