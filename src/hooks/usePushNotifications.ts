import { API_URL } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const getToken = () => localStorage.getItem("token");

interface SubscriptionResponse {
  publicKey: string | null;
  enabled: boolean;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "default" : Notification.permission
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const isSupported = useMemo(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window,
    []
  );

  // Prüft nur ob eine Subscription existiert, erstellt keine neue
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      return false;
    }
  }, [isSupported]);

  // Registriert eine neue Subscription
  const registerSubscription = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    const token = getToken();
    if (!token) {
      throw new Error("not-authenticated");
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const response = await fetch(`${API_URL}/notifications/public-key`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("public-key-unavailable");
      }

      const data: SubscriptionResponse = await response.json();
      if (!data?.publicKey) {
        throw new Error("push-not-configured");
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
    }

    const body = JSON.stringify(subscription.toJSON());
    const saveResponse = await fetch(`${API_URL}/notifications/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!saveResponse.ok) {
      throw new Error("subscription-save-failed");
    }

    setSubscribed(true);
    return true;
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported || typeof Notification === "undefined") {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      setIsRegistering(true);
      try {
        await registerSubscription();
        return true;
      } catch (error) {
        console.error("Push subscription error:", error);
        setSubscribed(false);
      } finally {
        setIsRegistering(false);
      }
    }

    return false;
  }, [isSupported, registerSubscription]);

  // Beim Mount nur Status prüfen, nicht automatisch re-registrieren
  useEffect(() => {
    if (!isSupported) {
      setSubscribed(false);
      return;
    }

    checkSubscriptionStatus().then((hasSubscription) => {
      setSubscribed(hasSubscription);
    });
  }, [isSupported, checkSubscriptionStatus]);

  // Permission-Änderungen beobachten
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    isSupported,
    permission,
    enabled: subscribed && permission === "granted",
    isRegistering,
    requestPermission,
  };
};

export type UsePushNotificationsResult = ReturnType<
  typeof usePushNotifications
>;
