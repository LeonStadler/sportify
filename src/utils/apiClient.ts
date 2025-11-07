/**
 * API Client mit automatischer Offline-Queue Unterstützung
 * Nutzt automatisch die Offline-Queue wenn offline
 */

import { API_URL } from "@/lib/api";
import { addToQueue } from "./offlineQueue";

/**
 * Prüft ob der Browser online ist
 */
function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

/**
 * Extrahiert den Endpoint aus einer vollständigen URL
 */
function extractEndpoint(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // Falls keine vollständige URL, nehme als Endpoint
    return url.startsWith("/") ? url : `/${url}`;
  }
}

export interface ApiRequestOptions extends RequestInit {
  /**
   * Wenn true, wird die Request in die Offline-Queue eingereiht wenn offline
   * Standard: true für POST, PUT, DELETE, PATCH
   */
  queueIfOffline?: boolean;

  /**
   * Wenn true, wird ein Fehler geworfen wenn offline (statt in Queue)
   * Standard: false
   */
  throwIfOffline?: boolean;
}

/**
 * Erweiterte Fetch-Funktion mit Offline-Queue Support
 */
export async function apiFetch(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const {
    queueIfOffline,
    throwIfOffline = false,
    method = "GET",
    ...fetchOptions
  } = options;

  // Bestimme ob Request in Queue soll (Standard: POST, PUT, DELETE, PATCH)
  const shouldQueue =
    queueIfOffline ?? ["POST", "PUT", "DELETE", "PATCH"].includes(method);

  // Prüfe ob offline
  if (!isOnline()) {
    if (throwIfOffline) {
      throw new Error("Offline: Request kann nicht ausgeführt werden");
    }

    // Wenn GET Request und offline, versuche aus Cache zu holen
    if (method === "GET") {
      // Service Worker sollte das bereits handhaben
      // Hier können wir noch einen zusätzlichen Fallback machen
    }

    // Wenn POST/PUT/DELETE/PATCH und offline, füge zur Queue hinzu
    if (shouldQueue && method !== "GET") {
      const endpointPath = extractEndpoint(endpoint);
      const fullUrl = endpoint.startsWith("http")
        ? endpoint
        : `${API_URL}${endpointPath}`;

      // Extrahiere Body falls vorhanden
      let body: unknown = undefined;
      if (fetchOptions.body) {
        if (typeof fetchOptions.body === "string") {
          try {
            body = JSON.parse(fetchOptions.body);
          } catch {
            body = fetchOptions.body;
          }
        } else {
          body = fetchOptions.body;
        }
      }

      // Füge zur Queue hinzu
      const actionId = addToQueue(
        endpointPath,
        method,
        body,
        fetchOptions.headers as Record<string, string>
      );

      console.log(
        "[ApiClient] Request zur Offline-Queue hinzugefügt:",
        actionId
      );

      // Simuliere erfolgreiche Response für bessere UX
      // Der Request wird später synchronisiert
      return new Response(
        JSON.stringify({
          success: true,
          queued: true,
          message:
            "Request wurde in die Offline-Queue eingereiht und wird später synchronisiert",
        }),
        {
          status: 202, // Accepted
          statusText: "Accepted (Offline Queue)",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  // Normale Fetch-Request wenn online
  const fullUrl = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint}`;

  return fetch(fullUrl, {
    method,
    ...fetchOptions,
  });
}

/**
 * Convenience-Funktionen für verschiedene HTTP-Methoden
 */
export const api = {
  get: (endpoint: string, options?: ApiRequestOptions) =>
    apiFetch(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
      },
    }),

  put: (endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
      },
    }),

  delete: (endpoint: string, options?: ApiRequestOptions) =>
    apiFetch(endpoint, { ...options, method: "DELETE" }),

  patch: (endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
      },
    }),
};
