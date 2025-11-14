import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/api";

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
  const [enabled, setEnabled] = useState(false);
  const isSupported = useMemo(
    () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window,
    []
  );

  useEffect(() => {
    if (!isSupported) {
      setEnabled(false);
    }
  }, [isSupported]);

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
        setEnabled(true);
        return true;
      } catch (error) {
        console.error("Push subscription error:", error);
        setEnabled(false);
      } finally {
        setIsRegistering(false);
      }
    }

    return false;
  }, [isSupported, registerSubscription]);

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    if (permission !== "granted") {
      setEnabled(false);
      return;
    }

    let active = true;
    setIsRegistering(true);
    registerSubscription()
      .then(() => {
        if (active) {
          setEnabled(true);
        }
      })
      .catch((error) => {
        console.error("Push subscription sync failed:", error);
        if (active) {
          setEnabled(false);
        }
      })
      .finally(() => {
        if (active) {
          setIsRegistering(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isSupported, permission, registerSubscription]);

  return {
    isSupported,
    permission,
    enabled,
    isRegistering,
    requestPermission,
  };
};

export type UsePushNotificationsResult = ReturnType<typeof usePushNotifications>;
