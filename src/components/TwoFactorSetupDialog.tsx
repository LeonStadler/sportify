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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Check, Copy, Download, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface TwoFactorSetupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

type SetupStep = "qr" | "verify" | "backup";

export function TwoFactorSetupDialog({
    open,
    onOpenChange,
    onSuccess,
}: TwoFactorSetupDialogProps) {
    const { enable2FA, verify2FA } = useAuth();
    const { toast } = useToast();
    const [step, setStep] = useState<SetupStep>("qr");
    const [qrCode, setQrCode] = useState<string>("");
    const [secret, setSecret] = useState<string>("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedCodes, setCopiedCodes] = useState(false);

    // Load 2FA setup when dialog opens
    useEffect(() => {
        if (open) {
            initialize2FA();
        } else {
            // Reset state when dialog closes
            resetState();
        }
    }, [open]);

    const resetState = () => {
        setStep("qr");
        setQrCode("");
        setSecret("");
        setBackupCodes([]);
        setVerificationCode("");
        setError(null);
        setCopiedCodes(false);
    };

    const initialize2FA = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Initializing 2FA...");
            const result = await enable2FA();
            console.log("2FA initialized, result:", result);
            if (!result || !result.secret) {
                throw new Error("Ungültige Antwort vom Server");
            }
            console.log("Setting QR code:", result.secret.otpauthUrl);
            console.log("Setting secret:", result.secret.base32);
            setQrCode(result.secret.otpauthUrl);
            setSecret(result.secret.base32);
            setBackupCodes(result.backupCodes);
            setStep("qr");
            console.log("2FA setup ready, QR code should be visible");
        } catch (err) {
            console.error("Error initializing 2FA:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Fehler beim Initialisieren der 2FA";
            setError(errorMessage);
            toast({
                title: "Fehler",
                description: errorMessage,
                variant: "destructive",
            });
            // Don't close dialog on error - let user see the error
            // onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError("Bitte gib einen 6-stelligen Code ein.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log("Verifying 2FA code:", verificationCode);
            await verify2FA(verificationCode);
            console.log("2FA verified successfully");
            toast({
                title: "2FA aktiviert",
                description: "Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert.",
            });
            setStep("backup");
        } catch (err) {
            console.error("Error verifying 2FA:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Ungültiger Code. Bitte versuche es erneut.";
            setError(errorMessage);
            toast({
                title: "Fehler",
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

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        toast({
            title: "Kopiert",
            description: "Geheimer Schlüssel wurde in die Zwischenablage kopiert.",
        });
    };

    const copyBackupCodes = () => {
        const codesText = backupCodes.join("\n");
        navigator.clipboard.writeText(codesText);
        setCopiedCodes(true);
        toast({
            title: "Kopiert",
            description: "Recovery-Codes wurden in die Zwischenablage kopiert.",
        });
        setTimeout(() => setCopiedCodes(false), 2000);
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
                        2FA einrichten
                    </DialogTitle>
                    <DialogDescription>
                        Richte die Zwei-Faktor-Authentifizierung für dein Konto ein.
                    </DialogDescription>
                </DialogHeader>

                {isLoading && step === "qr" && !qrCode && (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-muted-foreground">2FA wird initialisiert...</div>
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
                        <div className="text-sm text-muted-foreground">Bereit...</div>
                    </div>
                )}

                {step === "qr" && qrCode && (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            <p className="mb-2">
                                Scanne diesen QR-Code mit deiner Authenticator-App (z.B. Google Authenticator,
                                Authy, Microsoft Authenticator):
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
                            <div className="p-4 bg-white rounded-lg">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                                    alt="QR Code für 2FA Setup"
                                    className="w-[200px] h-[200px]"
                                />
                            </div>

                            <div className="w-full space-y-2">
                                <Label className="text-sm font-medium">Oder gib diesen Code manuell ein:</Label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-3 bg-background border rounded-lg font-mono text-sm">
                                        {formatSecret(secret)}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={copySecret}
                                        title="Kopieren"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Alert>
                            <AlertDescription className="text-sm">
                                Nach dem Scannen oder Eingeben des Codes, gib den 6-stelligen Code aus deiner App
                                ein, um die Einrichtung abzuschließen.
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center gap-2 pt-2">
                            <Label htmlFor="verification-code" className="flex-1">
                                6-stelliger Code aus deiner App:
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

                {step === "verify" && (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Bitte gib den 6-stelligen Code aus deiner Authenticator-App ein:
                        </div>
                        <Input
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
                )}

                {step === "backup" && (
                    <div className="space-y-4">
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Wichtig:</strong> Speichere diese Recovery-Codes an einem sicheren Ort. Du
                                kannst sie verwenden, um auf dein Konto zuzugreifen, falls du keinen Zugriff auf
                                deine Authenticator-App hast.
                            </AlertDescription>
                        </Alert>

                        <div className="p-4 bg-muted rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Deine Recovery-Codes:</Label>
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
                                Jeder Code kann nur einmal verwendet werden. Stelle sicher, dass du diese Codes an
                                einem sicheren Ort speicherst.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <DialogFooter>
                    {step === "qr" && (
                        <>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Abbrechen
                            </Button>
                            <Button
                                type="button"
                                onClick={handleVerify}
                                disabled={isLoading || verificationCode.length !== 6}
                            >
                                {isLoading ? "Wird verarbeitet..." : "Code verifizieren"}
                            </Button>
                        </>
                    )}
                    {step === "backup" && (
                        <Button type="button" onClick={handleComplete} className="w-full">
                            Fertig
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

