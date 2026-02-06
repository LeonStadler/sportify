# PWA (Progressive Web App)

Diese Seite dokumentiert **die aktuell umgesetzten PWA‑Features** in Sportify.

## Implementiert

### Service Worker & Caching

- Service Worker: `public/sw.js`
- Cache‑Strategien:
  - **Cache‑First** für statische Assets
  - **Network‑First** für API‑Requests mit Cache‑Fallback
  - **Network‑First** für HTML mit Offline‑Fallback
- Cache‑Versionierung via `CACHE_VERSION`

### Offline‑Support

- Offline‑Seite: `public/offline.html`
- Offline‑Banner: `src/components/OfflineBanner.tsx`
- Online/Offline‑Status: `src/hooks/useOnlineStatus.ts`
- Offline‑Queue: `src/utils/offlineQueue.ts`

### Install Prompt

- Komponente: `src/components/InstallPrompt.tsx`
- Unterstützt Browser‑spezifische Hinweise (iOS/Android/Chrome/Edge/Safari)

### Share Target API

- Manifest: `public/site.webmanifest`
- Handler: `src/pages/Share.tsx`

### Badge API

- Badge‑Count via `src/utils/badge.ts`

### Push Notifications (optional)

- Backend Endpunkte: `GET /api/notifications/public-key`, `POST/DELETE /api/notifications/subscriptions`
- Service Worker verarbeitet `push` + `notificationclick`

## Konfiguration

- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Alternativ `WEB_PUSH_*`

## Nicht enthalten (Stand heute)

- Hintergrund‑Sync via Background Sync API (nur Offline‑Queue)
- App‑Updates als UI‑Prompt (nur Cache‑Invalidierung)
