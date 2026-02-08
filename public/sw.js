// Service Worker für Sportify PWA
// Version für Cache-Invalidierung
const CACHE_VERSION = "v2";
const CACHE_NAME = `sportify-cache-${CACHE_VERSION}`;

// Assets die beim Install gecacht werden sollen
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/favicon.svg",
  "/favicon.ico",
  "/site.webmanifest",
  "/browserconfig.xml",
  // Wichtigste Icons für schnellen Start
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// API-Endpunkte die gecacht werden sollen (optional)
const API_CACHE_PATTERNS = [
  /^https?:\/\/.*\/api\/dashboard/,
  /^https?:\/\/.*\/api\/stats/,
];

// Install Event - Initiales Caching
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...", CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn("[Service Worker] Failed to cache some assets:", error);
        // Weiter auch wenn einige Assets fehlschlagen
        return Promise.resolve();
      });
    })
  );

  // Service Worker sofort aktivieren
  self.skipWaiting();
});

// Activate Event - Alte Caches bereinigen
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...", CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Sofort Kontrolle über alle Clients übernehmen
  return self.clients.claim();
});

// Fetch Event - Request-Handling mit verschiedenen Strategien
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome Extension und andere spezielle URLs
  if (url.protocol === "chrome-extension:" || url.protocol === "chrome:") {
    return;
  }

  // API Requests - Network First mit Fallback
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // HTML Requests - Network First mit Offline-Fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Statische Assets - Cache First
  if (
    request.url.includes(".js") ||
    request.url.includes(".css") ||
    request.url.includes(".svg") ||
    request.url.includes(".ico") ||
    request.url.includes(".png") ||
    request.url.includes(".jpg") ||
    request.url.includes(".webp") ||
    request.url.includes(".woff") ||
    request.url.includes(".woff2") ||
    request.url.includes("site.webmanifest")
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirstStrategy(request));
});

// Cache First Strategy - Für statische Assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Cache nur erfolgreiche Responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[Service Worker] Cache First failed:", error);
    // Fallback für Bilder/Icons
    if (request.url.includes(".svg") || request.url.includes(".ico")) {
      return new Response("", { status: 404 });
    }
    throw error;
  }
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error("[Service Worker] Failed to parse push payload", error);
  }

  // Titel mit App-Namen als Prefix für Wiedererkennbarkeit
  const title = data.title || "Sportify";

  const options = {
    // Nachrichtentext
    body: data.body || "",

    // Zusätzliche Daten für Click-Handler
    data: data.data || {},

    // Badge: Kleines Icon für Statusleiste (Android)
    // Sollte monochrom sein für beste Darstellung
    badge: data.badge || "/icon-192x192.png",

    // Icon: Haupticon der Notification (das Sportify-Logo)
    icon: data.icon || "/icon-192x192.png",

    // Image: Großes Bild unter dem Text (optional)
    // Wird vom Server mitgesendet wenn relevant (z.B. Aktivitätsbild)
    ...(data.image && { image: data.image }),

    // Tag: Gruppiert Notifications (gleicher Tag = Ersetzung statt Stapelung)
    tag: data.tag || "sportify-notification",

    // Renotify: Nochmal Sound/Vibration wenn Notification mit gleichem Tag ersetzt wird
    renotify: data.renotify ?? false,

    // Vibration: [vibrieren, pause, vibrieren] in ms
    vibrate: data.vibrate || [200, 100, 200],

    // Notification bleibt bis User interagiert
    requireInteraction: data.requireInteraction ?? true,

    // Silent: Keine Sounds (für weniger wichtige Notifications)
    silent: data.silent ?? false,

    // Aktions-Buttons (max 2 auf den meisten Plattformen)
    ...(data.actions && { actions: data.actions }),

    // Timestamp: Wann die Notification erstellt wurde
    timestamp: data.timestamp || Date.now(),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ("focus" in client) {
          client.postMessage({
            type: "notification-clicked",
            payload: notificationData,
          });
          return client.focus();
        }
      }

      if (clients.openWindow) {
        const path =
          notificationData.type === "app-version-update" &&
          notificationData.payload &&
          typeof notificationData.payload.path === "string"
            ? notificationData.payload.path
            : "/";
        await clients.openWindow(path);
      }
    })()
  );
});

// Network First Strategy - Für API Requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache nur erfolgreiche Responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[Service Worker] Network failed, trying cache:", request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Wenn kein Cache vorhanden und Offline, throw error
    throw error;
  }
}

// Network First mit Offline-Fallback - Für HTML
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache nur erfolgreiche Responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[Service Worker] Network failed, serving offline page");
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback auf Offline-Seite
    const offlinePage = await caches.match("/offline.html");
    if (offlinePage) {
      return offlinePage;
    }

    // Letzter Fallback
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: new Headers({
        "Content-Type": "text/html",
      }),
    });
  }
}

// Stale While Revalidate Strategy - Für dynamische Inhalte
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Starte Fetch im Hintergrund
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Gib gecachte Response zurück, während Fetch läuft
  return cachedResponse || fetchPromise;
}

// Message Handler für Service Worker Updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
