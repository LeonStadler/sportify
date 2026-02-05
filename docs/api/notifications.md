# Notifications API

## GET /api/notifications

Listet Benachrichtigungen.

**Auth:** erforderlich

## POST /api/notifications/mark-read

Markiert Benachrichtigungen als gelesen.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "ids": ["uuid", "..."] }
```

## GET /api/notifications/public-key

Liefert VAPID Public Key für Push.

**Auth:** erforderlich

## POST /api/notifications/subscriptions

Registriert Push‑Subscription.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "subscription": { "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } } }
```

## DELETE /api/notifications/subscriptions

Löscht Push‑Subscription.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "endpoint": "..." }
```
