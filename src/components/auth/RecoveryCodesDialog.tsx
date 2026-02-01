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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, Download, Shield } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface RecoveryCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupCodes: string[];
}

export function RecoveryCodesDialog({
  open,
  onOpenChange,
  backupCodes,
}: RecoveryCodesDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [copiedCodes, setCopiedCodes] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("auth.recoveryCodes.title")}
          </DialogTitle>
          <DialogDescription>
            {t("auth.recoveryCodes.description")}
          </DialogDescription>
        </DialogHeader>

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
                      {t("auth.recoveryCodes.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      {t("auth.recoveryCodes.copy")}
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

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)} className="w-full">
            {t("auth.recoveryCodes.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

