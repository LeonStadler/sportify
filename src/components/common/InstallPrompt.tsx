"use client";

import { ArrowRight, Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);

  useEffect(() => {
    // Prüfe ob die App bereits installiert ist
    const checkIfInstalled = () => {
      // Prüfe ob im Standalone-Modus (installiert)
      if (window.matchMedia("(display-mode: standalone)").matches) {
        return true;
      }

      // Prüfe ob auf iOS (Safari) im Standalone-Modus
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode =
        (window.navigator as NavigatorStandalone).standalone === true;

      if (isIOS && isInStandaloneMode) {
        return true;
      }

      // Prüfe ob bereits installiert wurde (localStorage)
      const installAccepted = localStorage.getItem("pwa-install-accepted");
      if (installAccepted) {
        return true;
      }

      return false;
    };

    // Initiale Prüfung
    if (checkIfInstalled()) {
      setIsInstalled(true);
      return;
    }

    // Prüfe ob bereits abgelehnt wurde
    const installDismissed = localStorage.getItem("pwa-install-dismissed");
    if (installDismissed) {
      return;
    }

    // Event Listener für beforeinstallprompt (Android/Chrome/Desktop)
    let hasDeferredPrompt = false;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      hasDeferredPrompt = true;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Event Listener für appinstalled (wenn Installation abgeschlossen)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem("pwa-install-accepted", "true");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Für Safari/iOS und als Fallback: Zeige Prompt automatisch nach kurzer Verzögerung
    // Safari unterstützt beforeinstallprompt nicht
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Zeige Prompt auf iOS/Safari (Mobile oder Desktop) oder als Fallback für Desktop
    const timer = setTimeout(() => {
      // Prüfe nochmal ob inzwischen installiert wurde
      if (checkIfInstalled()) {
        setIsInstalled(true);
        return;
      }

      // Wenn kein beforeinstallprompt Event kam, zeige Prompt trotzdem
      // (für Safari/iOS/Desktop oder als Fallback)
      if (isIOS || isSafari || !hasDeferredPrompt) {
        setIsVisible(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Safari (iOS oder Desktop) - zeige visuellen Dialog mit Anleitung
      setShowInstructionsDialog(true);
      return;
    }

    try {
      // Zeige den Install-Prompt (funktioniert auf Desktop und Mobile)
      await deferredPrompt.prompt();

      // Warte auf die Benutzer-Auswahl
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsVisible(false);
        localStorage.setItem("pwa-install-accepted", "true");
        // Auf Desktop wird die App jetzt zum Dock/Desktop hinzugefügt
      } else {
        localStorage.setItem("pwa-install-dismissed", "true");
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Fehler beim Installieren:", error);
      // Bei Fehler trotzdem ausblenden
      setIsVisible(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Bestimme welche Anleitung angezeigt werden soll
  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isChrome =
      /Chrome/.test(navigator.userAgent) &&
      !/Edge|Opera/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    const isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // iOS (Safari Mobile)
    if (isIOS) {
      return {
        title: t("pwa.iosInstallTitle", {
          defaultValue: "Sportify auf iOS installieren",
        }),
        steps: [
          t("pwa.iosStep1", {
            defaultValue:
              "Tippe auf das Teilen-Symbol in der Safari-Adressleiste",
          }),
          t("pwa.iosStep2", { defaultValue: "Wähle 'Zum Home-Bildschirm'" }),
          t("pwa.iosStep3", { defaultValue: "Tippe auf 'Hinzufügen'" }),
        ],
      };
    }

    // Android Chrome
    if (isAndroid && isChrome && isMobile) {
      return {
        title: t("pwa.androidChromeInstallTitle", {
          defaultValue: "Sportify auf Android installieren",
        }),
        steps: [
          t("pwa.androidChromeStep1", {
            defaultValue: "Tippe auf das Menü-Symbol (drei Punkte) oben rechts",
          }),
          t("pwa.androidChromeStep2", {
            defaultValue:
              "Wähle 'Zum Startbildschirm hinzufügen' oder 'App installieren'",
          }),
          t("pwa.androidChromeStep3", {
            defaultValue: "Bestätige die Installation",
          }),
        ],
      };
    }

    // Chrome Desktop
    if (isChrome && !isMobile) {
      return {
        title: t("pwa.chromeDesktopInstallTitle", {
          defaultValue: "Sportify in Chrome installieren",
        }),
        steps: [
          t("pwa.chromeDesktopStep1", {
            defaultValue:
              "Klicke auf das Install-Symbol in der Adressleiste (oder im Menü)",
          }),
          t("pwa.chromeDesktopStep2", {
            defaultValue: "Bestätige die Installation im Dialog",
          }),
        ],
      };
    }

    // Firefox Mobile
    if (isFirefox && isMobile) {
      return {
        title: t("pwa.firefoxMobileInstallTitle", {
          defaultValue: "Sportify in Firefox installieren",
        }),
        steps: [
          t("pwa.firefoxMobileStep1", {
            defaultValue: "Tippe auf das Menü-Symbol (drei Punkte) oben rechts",
          }),
          t("pwa.firefoxMobileStep2", {
            defaultValue: "Wähle 'Seite' → 'Zum Startbildschirm hinzufügen'",
          }),
        ],
      };
    }

    // Firefox Desktop
    if (isFirefox && !isMobile) {
      return {
        title: t("pwa.firefoxDesktopInstallTitle", {
          defaultValue: "Sportify in Firefox installieren",
        }),
        steps: [
          t("pwa.firefoxDesktopStep1", {
            defaultValue:
              "Klicke auf das Menü-Symbol (drei Striche) oben rechts",
          }),
          t("pwa.firefoxDesktopStep2", {
            defaultValue: "Wähle 'Mehr' → 'Diese Seite als App installieren'",
          }),
        ],
      };
    }

    // Edge
    if (isEdge) {
      return {
        title: t("pwa.edgeInstallTitle", {
          defaultValue: "Sportify in Edge installieren",
        }),
        steps: [
          t("pwa.edgeStep1", {
            defaultValue:
              "Klicke auf das Menü-Symbol (drei Punkte) oben rechts",
          }),
          t("pwa.edgeStep2", {
            defaultValue: "Wähle 'Apps' → 'Diese Seite als App installieren'",
          }),
        ],
      };
    }

    // Safari Desktop (Mac)
    if (isSafari && isMac) {
      return {
        title: t("pwa.safariDesktopInstallTitle", {
          defaultValue: "Sportify zum Dock hinzufügen",
        }),
        steps: [
          t("pwa.safariDesktopStep1", {
            defaultValue: "Klicke im Safari-Menü auf 'Datei'",
          }),
          t("pwa.safariDesktopStep2", {
            defaultValue: "Wähle 'Zum Dock hinzufügen'",
          }),
        ],
        alternative: t("pwa.safariDesktopAlternative", {
          defaultValue:
            "Alternativ: Klicke auf das Teilen-Symbol in der Adressleiste und wähle 'Zum Dock hinzufügen'",
        }),
      };
    }

    // Safari (andere)
    if (isSafari) {
      return {
        title: t("pwa.safariInstallTitle", {
          defaultValue: "Sportify installieren",
        }),
        steps: [
          t("pwa.safariStep1", {
            defaultValue: "Klicke auf das Teilen-Symbol in der Adressleiste",
          }),
          t("pwa.safariStep2", {
            defaultValue:
              "Wähle 'Zum Startbildschirm hinzufügen' oder 'Zum Desktop hinzufügen'",
          }),
        ],
      };
    }

    // Generische Anleitung (Fallback)
    return {
      title: t("pwa.genericInstallTitle", {
        defaultValue: "Sportify installieren",
      }),
      steps: [
        t("pwa.genericStep1", {
          defaultValue: "Verwende die Install-Option in deinem Browser-Menü",
        }),
      ],
    };
  };

  const instructions = getInstallInstructions();

  // Zeige nichts wenn bereits installiert oder nicht sichtbar
  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4 md:bottom-4 md:left-auto md:right-4 md:w-96">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground mb-1">
              {t("pwa.installTitle", { defaultValue: "Sportify installieren" })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const isMobile =
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                  );
                if (isMobile) {
                  return t("pwa.installDescription", {
                    defaultValue:
                      "Installiere die App für schnelleren Zugriff und Offline-Nutzung",
                  });
                }
                return t("pwa.installDescriptionDesktop", {
                  defaultValue:
                    "Installiere die App zum Dock/Desktop für schnelleren Zugriff",
                });
              })()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-1" />
              {t("pwa.install", { defaultValue: "Installieren" })}
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              aria-label={t("pwa.dismiss", { defaultValue: "Schließen" })}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Installations-Anleitung Dialog */}
      <Dialog
        open={showInstructionsDialog}
        onOpenChange={setShowInstructionsDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              {instructions.title}
            </DialogTitle>
            <DialogDescription>
              {t("pwa.instructionsDescription", {
                defaultValue:
                  "Folge diesen Schritten, um Sportify zu installieren:",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <ol className="space-y-3">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pt-0.5">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
            {instructions.alternative && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
                  {instructions.alternative}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInstructionsDialog(false)}
            >
              {t("pwa.close", { defaultValue: "Schließen" })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
