import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Check, Copy, Download, Shield } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type SetupStep = "qr" | "backup";

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  onSuccess,
}: TwoFactorSetupDialogProps) {
  const { enable2FA, verify2FA } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState<SetupStep>("qr");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const resetState = () => {
    setStep("qr");
    setQrCode("");
    setSecret("");
    setBackupCodes([]);
    setVerificationCode("");
    setError(null);
    setCopiedCodes(false);
    setIsLoading(false);
  };

  const initialize2FA = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await enable2FA();
      if (!result || !result.secret) {
        throw new Error(t("auth.twoFactorSetup.invalidServerResponse"));
      }
      setQrCode(result.secret.otpauthUrl);
      setSecret(result.secret.base32);
      setBackupCodes(result.backupCodes);
      setStep("qr");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("auth.twoFactorSetup.initError");
      setError(errorMessage);
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [enable2FA, toast]);

  // Load 2FA setup when dialog opens
  useEffect(() => {
    if (open) {
      initialize2FA();
    } else {
      // Reset state when dialog closes
      resetState();
    }
  }, [open, initialize2FA]);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError(t("auth.twoFactorSetup.enterSixDigits"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verify2FA(verificationCode);
      toast({
        title: t("auth.twoFactorSetup.enabledTitle"),
        description: t("auth.twoFactorSetup.enabledDesc"),
      });
      setStep("backup");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("auth.twoFactorSetup.invalidCode");
      setError(errorMessage);
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    resetState();
    onSuccess();
    onOpenChange(false);
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      toast({
        title: t("auth.twoFactorSetup.copySecretSuccessTitle"),
        description: t("auth.twoFactorSetup.copySecretSuccessDesc"),
      });
    } catch (err) {
      console.error("Fehler beim Kopieren des geheimen Schlüssels:", err);
      toast({
        title: t("auth.twoFactorSetup.copySecretErrorTitle"),
        description: t("auth.twoFactorSetup.copySecretErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const copyBackupCodes = async () => {
    try {
      const codesText = backupCodes.join("\n");
      await navigator.clipboard.writeText(codesText);
      setCopiedCodes(true);
      toast({
        title: t("auth.twoFactorSetup.copyCodesSuccessTitle"),
        description: t("auth.twoFactorSetup.copyCodesSuccessDesc"),
      });
      setTimeout(() => setCopiedCodes(false), 2000);
    } catch (err) {
      console.error("Fehler beim Kopieren der Recovery-Codes:", err);
      toast({
        title: t("auth.twoFactorSetup.copyCodesErrorTitle"),
        description: t("auth.twoFactorSetup.copyCodesErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sportify-2fa-recovery-codes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("auth.twoFactorSetup.downloadTitle"),
      description: t("auth.twoFactorSetup.downloadDesc"),
    });
  };

  const formatSecret = (secret: string) => {
    // Format secret as groups of 4 characters
    return secret.match(/.{1,4}/g)?.join(" ") || secret;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("auth.twoFactorSetup.title")}
          </DialogTitle>
          <DialogDescription>
            {t("auth.twoFactorSetup.description")}
          </DialogDescription>
        </DialogHeader>

        {isLoading && step === "qr" && !qrCode && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              {t("auth.twoFactorSetup.initializing")}
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && step === "qr" && !qrCode && !error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              {t("auth.twoFactorSetup.ready")}
            </div>
          </div>
        )}

        {step === "qr" && qrCode && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                {t("auth.twoFactorSetup.scanQr")}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={qrCode}
                  size={200}
                  level="M"
                  includeMargin={false}
                  className="w-[200px] h-[200px]"
                  aria-label={t("auth.twoFactorSetup.qrAriaLabel")}
                />
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">
                  {t("auth.twoFactorSetup.manualEntryLabel")}
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-background border rounded-lg font-mono text-sm">
                    {formatSecret(secret)}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copySecret}
                    title={t("auth.twoFactorSetup.copy")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                {t("auth.twoFactorSetup.verifyInstruction")}
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2 pt-2">
              <Label htmlFor="verification-code" className="flex-1">
                {t("auth.twoFactorSetup.codeLabel")}
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setVerificationCode(value);
                  setError(null);
                }}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && verificationCode.length === 6) {
                    handleVerify();
                  }
                }}
              />
            </div>
          </div>
        )}

        {step === "backup" && (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>{t("auth.twoFactorSetup.backupTitle")}</strong>{" "}
                {t("auth.twoFactorSetup.backupDesc")}
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t("auth.twoFactorSetup.backupLabel")}
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyBackupCodes}
                  >
                    {copiedCodes ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t("auth.twoFactorSetup.copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        {t("auth.twoFactorSetup.copy")}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadBackupCodes}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("auth.recoveryCodes.download")}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-2 bg-background border rounded text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Alert variant="default">
              <AlertDescription className="text-sm">
                {t("auth.twoFactorSetup.backupSingleUse")}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {step === "qr" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleVerify}
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading
                  ? t("auth.twoFactorSetup.verifying")
                  : t("auth.twoFactorSetup.verifyButton")}
              </Button>
            </>
          )}
          {step === "backup" && (
            <Button type="button" onClick={handleComplete} className="w-full">
              {t("auth.twoFactorSetup.complete")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
