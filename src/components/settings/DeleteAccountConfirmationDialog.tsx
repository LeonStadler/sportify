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
import { useTranslation } from "react-i18next";

interface DeleteAccountConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteAccountConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAccountConfirmationDialogProps) {
  const { t } = useTranslation();
  const [confirmationText, setConfirmationText] = useState("");
  const confirmationInputRef = useRef<HTMLInputElement>(null);
  const confirmationValue = t("profile.deleteAccountConfirmText");

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

  const canConfirm = confirmationText === confirmationValue;

  const handleCancel = () => {
    setConfirmationText("");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmationText !== confirmationValue) {
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
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t("profile.deleteAccountDialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("profile.deleteAccountDialogDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("profile.deleteAccountWarning")}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
                  <li>{t("profile.deleteAccountList.data")}</li>
                  <li>{t("profile.deleteAccountList.achievements")}</li>
                  <li>{t("profile.deleteAccountList.friendships")}</li>
                  <li>{t("profile.deleteAccountList.profile")}</li>
                  <li>{t("profile.deleteAccountList.irreversible")}</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation-input">
                {t("profile.deleteAccountDialogPrompt", {
                  text: confirmationValue,
                })}
              </Label>
              <Input
                id="confirmation-input"
                ref={confirmationInputRef}
                type="text"
                value={confirmationText}
                onChange={(e) => {
                  setConfirmationText(e.target.value);
                }}
                placeholder={confirmationValue}
                autoComplete="off"
                className="font-mono"
                aria-invalid={confirmationText.length > 0 && confirmationText !== confirmationValue}
              />
              {confirmationText.length > 0 &&
                confirmationText !== confirmationValue && (
                <p className="text-xs text-muted-foreground">
                  {t("profile.deleteAccountDialogHint", {
                    text: confirmationValue,
                  })}
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!canConfirm}
            >
              {t("profile.deleteAccountDialogContinue")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
