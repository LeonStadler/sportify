"use client";

import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Banner-Komponente die den Offline-Status anzeigt
 */
export function OfflineBanner() {
  const { isOffline } = useOnlineStatus();
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Zeige Banner nur wenn offline
    setShowBanner(isOffline);
  }, [isOffline]);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-safe-area-inset-top">
      <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950">
        <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertTitle className="text-orange-800 dark:text-orange-200">
          {t("offline.title", { defaultValue: "Offline" })}
        </AlertTitle>
        <AlertDescription className="text-orange-700 dark:text-orange-300">
          {t("offline.description", {
            defaultValue:
              "Sie sind offline. Einige Funktionen sind möglicherweise nicht verfügbar.",
          })}
        </AlertDescription>
      </Alert>
    </div>
  );
}

