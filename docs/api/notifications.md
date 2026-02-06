# Notifications API

## GET /api/notifications

Listet die letzten Benachrichtigungen (max. 100).

**Auth:** erforderlich

**Antwort (200, Auszug):**

```json
[
  {
    "id": "uuid",
    "type": "workout-reaction",
    "title": "Neue Reaktion",
    "message": "...",
    "payload": { "workoutId": "..." },
    "isRead": false,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "firstName": "...",
    "lastName": "...",
    "nickname": "...",
    "avatarUrl": "..."
  }
]
```

## POST /api/notifications/mark-read

Markiert **alle** Benachrichtigungen als gelesen.

**Auth:** erforderlich

## GET /api/notifications/public-key

Liefert VAPID Public Key für Push (falls konfiguriert).

**Antwort (200):**

```json
{ "publicKey": "...", "enabled": true }
```

## POST /api/notifications/subscriptions

Registriert Push‑Subscription.

**Body (JSON):**

```json
{ "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } }
```

## DELETE /api/notifications/subscriptions

Löscht eine Push‑Subscription.

**Body (JSON):**

```json
{ "endpoint": "..." }
```

**Antwort:** `204 No Content`
