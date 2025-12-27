import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface DeleteAccountConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const CONFIRMATION_TEXT = "LÖSCHEN";

export function DeleteAccountConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAccountConfirmationDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const confirmationInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setConfirmationText("");
      // Focus confirmation input when dialog opens
      setTimeout(() => {
        confirmationInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const canConfirm = confirmationText === CONFIRMATION_TEXT;

  const handleCancel = () => {
    setConfirmationText("");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmationText !== CONFIRMATION_TEXT) {
      return;
    }

    onConfirm();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent
        onKeyDown={handleKeyDown}
        className="sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Konto löschen
          </DialogTitle>
          <DialogDescription>
            Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            Alle deine Daten werden unwiderruflich gelöscht.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich gelöscht.
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
                  <li>Alle deine Trainingsdaten werden gelöscht</li>
                  <li>Deine Erfolge und Statistiken gehen verloren</li>
                  <li>Alle Freundschaften werden beendet</li>
                  <li>Dein Profil ist nicht mehr erreichbar</li>
                  <li>Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation-input">
                Gib <span className="font-mono font-bold">{CONFIRMATION_TEXT}</span> ein, um fortzufahren:
              </Label>
              <Input
                id="confirmation-input"
                ref={confirmationInputRef}
                type="text"
                value={confirmationText}
                onChange={(e) => {
                  setConfirmationText(e.target.value);
                }}
                placeholder={CONFIRMATION_TEXT}
                autoComplete="off"
                className="font-mono"
                aria-invalid={confirmationText.length > 0 && confirmationText !== CONFIRMATION_TEXT}
              />
              {confirmationText.length > 0 && confirmationText !== CONFIRMATION_TEXT && (
                <p className="text-xs text-muted-foreground">
                  Bitte gib genau "{CONFIRMATION_TEXT}" ein (Großbuchstaben erforderlich).
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!canConfirm}
            >
              Weiter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

