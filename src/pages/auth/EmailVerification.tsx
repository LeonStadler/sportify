import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Mail, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { PublicHeader } from "@/components/common/PublicHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
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
import { toast } from "sonner";

export default function EmailVerification() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const verificationAttemptedRef = useRef(false);

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  // Lade inviteUserId: Primär aus URL, Fallback aus localStorage
  const [inviteUserId, setInviteUserId] = useState(() => {
    const inviteFromUrl = searchParams.get("invite");
    // Speichere in localStorage nur wenn aus URL (als Fallback für Login)
    if (inviteFromUrl) {
      localStorage.setItem("pendingInvite", inviteFromUrl);
      return inviteFromUrl;
    }
    // Fallback: aus localStorage
    return localStorage.getItem("pendingInvite") || "";
  });

  // Update localStorage wenn invite in URL geändert wird
  useEffect(() => {
    const inviteFromUrl = searchParams.get("invite");
    if (inviteFromUrl && inviteFromUrl !== inviteUserId) {
      localStorage.setItem("pendingInvite", inviteFromUrl);
      setInviteUserId(inviteFromUrl);
    }
  }, [searchParams, inviteUserId]);

  const resendSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("validation.invalidEmail")),
      }),
    [t]
  );

  type ResendData = z.infer<typeof resendSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendData>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: email,
    },
  });

  // Countdown für erneut senden
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-verify wenn Token vorhanden ist (nur einmal)
  useEffect(() => {
    if (token && !verificationAttemptedRef.current && !isVerified) {
      verificationAttemptedRef.current = true;
      verifyEmail(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: verificationToken }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        toast.success(t("authPages.emailVerification.emailVerified"), {
          description: t("authPages.emailVerification.accountActivated"),
        });
        // Auto-redirect to login with invite parameter if present
        const pendingInvite =
          inviteUserId || localStorage.getItem("pendingInvite");
        if (pendingInvite) {
          setTimeout(() => {
            navigate(`/auth/login?redirect=/invite/${pendingInvite}`);
          }, 1500);
        }
      } else {
        toast.error(t("common.error"), {
          description:
            data.error || t("authPages.emailVerification.invalidLink"),
        });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error(t("common.error"), {
        description: t("common.error"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (data: ResendData) => {
    if (countdown > 0) return;

    setIsLoading(true);

    try {
      // Verwende E-Mail aus URL-Parameter, falls vorhanden, sonst aus Form
      const emailToUse = email || data.email;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: emailToUse }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(t("authPages.emailVerification.resendButton"), {
          description: t("authPages.emailVerification.checkSpam"),
        });
        setCountdown(60); // 60 Sekunden Countdown
      } else {
        toast.error(t("common.error"), {
          description: result.error || t("common.error"),
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error(t("common.error"), {
        description: t("common.error"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <PublicHeader variant="minimal" />

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
                {t("authPages.emailVerification.emailVerified")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t("authPages.emailVerification.accountActivated")}
              </p>

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    const pendingInvite =
                      inviteUserId || localStorage.getItem("pendingInvite");
                    const loginUrl = pendingInvite
                      ? `/auth/login?redirect=/invite/${pendingInvite}`
                      : "/auth/login";
                    navigate(loginUrl);
                  }}
                >
                  {t("authPages.emailVerification.loginNow")}
                </Button>

                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/">
                    {t("authPages.emailVerification.backToHome")}
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
                  {t("authPages.emailVerification.verifyTitle")}
                </h1>
                <p className="text-muted-foreground">
                  {token
                    ? t("authPages.emailVerification.verifying")
                    : t("authPages.emailVerification.checkInbox")}
                </p>
              </div>

              {isLoading && token ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground">
                        {t("authPages.emailVerification.verifying")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                !token && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("authPages.emailVerification.resendTitle")}
                      </CardTitle>
                      <CardDescription>
                        {email
                          ? t("authPages.emailVerification.resendDescription", {
                            email,
                          })
                          : t(
                            "authPages.emailVerification.resendDescriptionAlt"
                          )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleSubmit(handleResendVerification)}
                        className="space-y-4"
                      >
                        {!email && (
                          <div className="space-y-2">
                            <Label htmlFor="email">
                              {t("authPages.emailVerification.emailLabel")}
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder={t(
                                "authPages.emailVerification.emailPlaceholder"
                              )}
                              {...register("email")}
                              className={
                                errors.email ? "border-destructive" : ""
                              }
                            />
                            {errors.email && (
                              <p className="text-sm text-destructive">
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                        )}
                        {email && (
                          <div className="space-y-2">
                            <Label htmlFor="email">
                              {t("authPages.emailVerification.emailLabel")}
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        )}

                        <Alert>
                          <AlertDescription>
                            {t("authPages.emailVerification.checkSpam")}
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
                              {t("authPages.emailVerification.sending")}
                            </>
                          ) : countdown > 0 ? (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              {t(
                                "authPages.emailVerification.resendCountdown",
                                { count: countdown }
                              )}
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              {t("authPages.emailVerification.resendButton")}
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )
              )}

              {token &&
                verificationAttemptedRef.current &&
                !isVerified &&
                !isLoading && (
                  <Card className="mt-6">
                    <CardContent className="pt-6">
                      <Alert variant="destructive">
                        <AlertDescription>
                          {t("authPages.emailVerification.invalidLink")}
                        </AlertDescription>
                      </Alert>

                      <div className="mt-4 text-center">
                        <Button variant="outline" asChild>
                          <Link to="/auth/email-verification">
                            {t("authPages.emailVerification.requestNewLink")}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("authPages.emailVerification.alreadyVerified")}{" "}
                  <Link
                    to="/auth/login"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("authPages.emailVerification.loginHere")}
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <LegalFooter />
    </div>
  );
}
