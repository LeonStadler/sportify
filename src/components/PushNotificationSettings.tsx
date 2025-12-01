import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  getPushStatus,
  isPushSupported,
  type PushStatus,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/services/pushNotificationService";
import { Bell, BellOff, BellRing, Loader2, Smartphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function PushNotificationSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const pushStatus = await getPushStatus();
      setStatus(pushStatus);
    } catch (error) {
      console.error("[Push Settings] Failed to load status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleToggle = async (enabled: boolean) => {
    setIsToggling(true);
    try {
      if (enabled) {
        const result = await subscribeToPush();
        if (result.success) {
          toast({
            title: t("pushNotifications.enabled", "Push aktiviert"),
            description: t(
              "pushNotifications.enabledDescription",
              "Du erhältst jetzt Push-Benachrichtigungen."
            ),
          });
        } else {
          toast({
            title: t("pushNotifications.error", "Fehler"),
            description: result.error,
            variant: "destructive",
          });
        }
      } else {
        const result = await unsubscribeFromPush();
        if (result.success) {
          toast({
            title: t("pushNotifications.disabled", "Push deaktiviert"),
            description: t(
              "pushNotifications.disabledDescription",
              "Du erhältst keine Push-Benachrichtigungen mehr."
            ),
          });
        } else {
          toast({
            title: t("pushNotifications.error", "Fehler"),
            description: result.error,
            variant: "destructive",
          });
        }
      }
      await loadStatus();
    } finally {
      setIsToggling(false);
    }
  };

  if (!isPushSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            {t("pushNotifications.title", "Push-Benachrichtigungen")}
          </CardTitle>
          <CardDescription>
            {t(
              "pushNotifications.notSupported",
              "Dein Browser unterstützt keine Push-Benachrichtigungen."
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("pushNotifications.title", "Push-Benachrichtigungen")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!status.serverEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            {t("pushNotifications.title", "Push-Benachrichtigungen")}
          </CardTitle>
          <CardDescription>
            {t(
              "pushNotifications.serverNotConfigured",
              "Push-Benachrichtigungen sind serverseitig nicht konfiguriert."
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isEnabled = status.subscribed && status.permission === "granted";
  const isDenied = status.permission === "denied";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {isEnabled ? (
                <BellRing className="h-5 w-5 text-primary" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
              {t("pushNotifications.title", "Push-Benachrichtigungen")}
            </CardTitle>
            <CardDescription>
              {t(
                "pushNotifications.description",
                "Erhalte Benachrichtigungen auch wenn die App geschlossen ist."
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {isEnabled && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              >
                {t("pushNotifications.active", "Aktiv")}
              </Badge>
            )}
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isToggling || isDenied}
              aria-label={t(
                "pushNotifications.toggle",
                "Push-Benachrichtigungen umschalten"
              )}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDenied && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm">
            <p className="font-medium text-destructive mb-1">
              {t("pushNotifications.blocked", "Benachrichtigungen blockiert")}
            </p>
            <p className="text-muted-foreground">
              {t(
                "pushNotifications.blockedDescription",
                "Du hast Benachrichtigungen für diese Seite blockiert. Bitte erlaube sie in deinen Browser-Einstellungen."
              )}
            </p>
          </div>
        )}

        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Smartphone className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground mb-1">
              {t("pushNotifications.howItWorks", "So funktioniert's")}
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                {t(
                  "pushNotifications.feature1",
                  "Freundschaftsanfragen und -antworten"
                )}
              </li>
              <li>
                {t("pushNotifications.feature2", "Neue Badges und Erfolge")}
              </li>
              <li>
                {t(
                  "pushNotifications.feature3",
                  "Wöchentliche Zusammenfassungen"
                )}
              </li>
            </ul>
          </div>
        </div>

        {isToggling && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">
              {isEnabled
                ? t("pushNotifications.disabling", "Wird deaktiviert...")
                : t("pushNotifications.enabling", "Wird aktiviert...")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
