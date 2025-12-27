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
import { AlertTriangle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface DeleteAccountPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteAccountPasswordDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteAccountPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPassword("");
      setError(null);
      setIsSubmitting(false);
      // Focus password input when dialog opens
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleCancel = () => {
    setPassword("");
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.trim() === "") {
      setError("Bitte gib dein Passwort ein.");
      passwordInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(password);
      // Clear state after successful submission
      setPassword("");
      setError(null);
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
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
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Konto löschen
          </DialogTitle>
          <DialogDescription>
            Bitte gib dein Passwort ein, um das Löschen deines Kontos zu bestätigen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password-input">Passwort zur Bestätigung:</Label>
              <Input
                id="password-input"
                ref={passwordInputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Dein Passwort eingeben"
                disabled={isSubmitting || isLoading}
                autoComplete="current-password"
                aria-invalid={!!error}
                aria-describedby={error ? "delete-password-error" : undefined}
                className={error ? "border-destructive" : ""}
              />
            </div>

            {error && (
              <div
                id="delete-password-error"
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || isLoading}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!password || password.trim() === "" || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? "Wird gelöscht..." : "Konto löschen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

