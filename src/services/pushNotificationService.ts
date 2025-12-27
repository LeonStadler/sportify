import { API_URL } from "@/lib/api";

interface PushConfig {
  publicKey: string | null;
  enabled: boolean;
}

/**
 * Prüft, ob Push-Notifications vom Browser unterstützt werden
 */
export function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Prüft den aktuellen Benachrichtigungs-Permission-Status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Fragt den Benutzer nach Benachrichtigungs-Berechtigung
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }
  return await Notification.requestPermission();
}

/**
 * Holt den VAPID Public Key vom Server
 */
export async function getPushConfig(): Promise<PushConfig> {
  const token = localStorage.getItem("token");
  if (!token) {
    return { publicKey: null, enabled: false };
  }

  try {
    const response = await fetch(`${API_URL}/notifications/public-key`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return { publicKey: null, enabled: false };
    }

    return await response.json();
  } catch (error) {
    console.error("[Push] Failed to get push config:", error);
    return { publicKey: null, enabled: false };
  }
}

/**
 * Registriert den Service Worker und gibt die Registration zurück
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    // Registriere oder hole existierende Registration
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Warte bis der Service Worker aktiv ist
    if (registration.installing) {
      await new Promise<void>((resolve) => {
        registration.installing!.addEventListener("statechange", (e) => {
          if ((e.target as ServiceWorker).state === "activated") {
            resolve();
          }
        });
      });
    }

    return registration;
  } catch (error) {
    console.error("[Push] Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Prüft, ob bereits eine Push-Subscription existiert
 */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    return null;
  }

  return await registration.pushManager.getSubscription();
}

/**
 * Konvertiert einen Base64-String zu einem Uint8Array (für applicationServerKey)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Erstellt eine neue Push-Subscription
 */
export async function subscribeToPush(): Promise<{
  success: boolean;
  error?: string;
}> {
  // Prüfe Voraussetzungen
  if (!isPushSupported()) {
    return {
      success: false,
      error:
        "Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.",
    };
  }

  // Hole VAPID Key
  const config = await getPushConfig();
  if (!config.enabled || !config.publicKey) {
    return {
      success: false,
      error: "Push-Benachrichtigungen sind serverseitig nicht konfiguriert.",
    };
  }

  // Frage nach Permission
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    return {
      success: false,
      error: "Benachrichtigungen wurden vom Benutzer nicht erlaubt.",
    };
  }

  // Hole Service Worker Registration
  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    return {
      success: false,
      error: "Service Worker konnte nicht registriert werden.",
    };
  }

  try {
    // Erstelle Subscription
    // applicationServerKey expects BufferSource; Uint8Array is valid but TS needs a narrowed type.
    const applicationServerKey = urlBase64ToUint8Array(
      config.publicKey
    ) as BufferSource;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Sende Subscription an Backend
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/notifications/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || "Subscription konnte nicht gespeichert werden."
      );
    }

    return { success: true };
  } catch (error) {
    console.error("[Push] Subscription failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
}

/**
 * Entfernt die Push-Subscription
 */
export async function unsubscribeFromPush(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const subscription = await getExistingSubscription();
    if (!subscription) {
      return { success: true }; // Keine Subscription vorhanden
    }

    // Subscription vom Browser entfernen
    await subscription.unsubscribe();

    // Subscription vom Backend entfernen
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/notifications/subscriptions`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    return { success: true };
  } catch (error) {
    console.error("[Push] Unsubscribe failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
}

/**
 * Prüft den kompletten Push-Status
 */
export interface PushStatus {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  serverEnabled: boolean;
}

export async function getPushStatus(): Promise<PushStatus> {
  const supported = isPushSupported();
  const permission = getNotificationPermission();

  if (!supported) {
    return {
      supported: false,
      permission: "denied",
      subscribed: false,
      serverEnabled: false,
    };
  }

  const [subscription, config] = await Promise.all([
    getExistingSubscription(),
    getPushConfig(),
  ]);

  return {
    supported: true,
    permission,
    subscribed: subscription !== null,
    serverEnabled: config.enabled,
  };
}
