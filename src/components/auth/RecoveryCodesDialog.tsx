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
  const [copiedCodes, setCopiedCodes] = useState(false);

  const copyBackupCodes = async () => {
    try {
      const codesText = backupCodes.join("\n");
      await navigator.clipboard.writeText(codesText);
      setCopiedCodes(true);
      toast({
        title: "Kopiert",
        description: "Recovery-Codes wurden in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopiedCodes(false), 2000);
    } catch (err) {
      console.error("Fehler beim Kopieren der Recovery-Codes:", err);
      toast({
        title: "Fehler",
        description: "Die Recovery-Codes konnten nicht kopiert werden.",
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
      title: "Download gestartet",
      description: "Recovery-Codes wurden heruntergeladen.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Neue Recovery-Codes
          </DialogTitle>
          <DialogDescription>
            Deine Recovery-Codes wurden zurückgesetzt. Speichere diese neuen Codes sicher.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Wichtig:</strong> Speichere diese Recovery-Codes an
              einem sicheren Ort. Du kannst sie verwenden, um auf dein Konto
              zuzugreifen, falls du keinen Zugriff auf deine Authenticator-App
              hast.
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Deine Recovery-Codes:
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
                      Kopiert
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Kopieren
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
                  Download
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
              Jeder Code kann nur einmal verwendet werden. Stelle sicher, dass
              du diese Codes an einem sicheren Ort speicherst.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)} className="w-full">
            Fertig
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


