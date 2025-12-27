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
import React, { useEffect, useRef, useState } from "react";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: (password: string) => Promise<void> | void;
  confirmLabel?: string;
  cancelLabel?: string;
  error?: string;
}

export function PasswordDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  error,
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure title and description are never empty - do this early to avoid rendering issues
  const safeTitle = React.useMemo(() => {
    if (!title || typeof title !== 'string') return "Passwort erforderlich";
    const trimmed = title.trim();
    return trimmed || "Passwort erforderlich";
  }, [title]);

  const safeDescription = React.useMemo(() => {
    if (!description || typeof description !== 'string') return "Bitte gib dein Passwort ein.";
    const trimmed = description.trim();
    return trimmed || "Bitte gib dein Passwort ein.";
  }, [description]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPassword("");
      setLocalError(error ?? undefined);
      setIsSubmitting(false);
      // Focus input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(undefined);

    if (!password || password.trim() === "") {
      setLocalError("Bitte gib ein Passwort ein.");
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(password);
      // Clear password from memory after successful submission
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
      setLocalError(errorMessage);
      // Keep password in input for user to retry, but clear it on close
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clear password from memory when canceling
    setPassword("");
    setLocalError(undefined);
    onOpenChange(false);
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
        aria-labelledby="password-dialog-title"
        aria-describedby="password-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="password-dialog-title">{safeTitle}</DialogTitle>
          <DialogDescription id="password-dialog-description">
            {safeDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password-input" className="sr-only">
                Passwort
              </Label>
              <Input
                id="password-input"
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError) {
                    setLocalError(undefined);
                  }
                }}
                placeholder="Passwort eingeben"
                disabled={isSubmitting}
                autoComplete="current-password"
                aria-invalid={!!localError}
                aria-describedby={localError ? "password-error" : undefined}
                className={localError ? "border-destructive" : ""}
              />
              {localError && (
                <p
                  id="password-error"
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {localError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird verarbeitet..." : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

