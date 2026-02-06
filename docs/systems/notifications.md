# Benachrichtigungssystem

Das Benachrichtigungssystem kombiniert In‑App Notifications und Push‑Subscriptions.

## Zweck

- Wichtige Ereignisse für Nutzer sichtbar machen
- Push‑Benachrichtigungen für relevante Events ermöglichen

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `notifications` | In‑App Benachrichtigungen | `id`, `user_id`, `type`, `related_user_id`, `metadata`, `created_at`, `read_at` |
| `push_subscriptions` | Push‑Subscriptions | `user_id`, `endpoint`, `keys`, `created_at` |

## API‑Bezug

- `GET /api/notifications` – Liste der Benachrichtigungen
- `POST /api/notifications/mark-read` – alles gelesen
- `GET /api/notifications/public-key` – VAPID Public Key
- `POST /api/notifications/subscriptions` – Subscription speichern
- `DELETE /api/notifications/subscriptions` – Subscription entfernen

## Typen & Payload

- `type` bestimmt Anzeige/Template
- `metadata` speichert Kontext (z. B. IDs von Workouts, Nutzer, Events)

## Zustände

- `read_at` (nullable) steuert „gelesen“
- `isRead` in API‑Antworten wird aus `read_at` abgeleitet
