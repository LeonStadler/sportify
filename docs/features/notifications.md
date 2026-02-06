# Benachrichtigungen

## Zweck

In‑App‑Benachrichtigungen und optional Push‑Nachrichten.

## UI‑Screens

- `Notifications` (UI‑Komponente)

## API‑Endpunkte

- `GET /api/notifications`
- `POST /api/notifications/mark-read`
- `GET /api/notifications/public-key`
- `POST /api/notifications/subscriptions`
- `DELETE /api/notifications/subscriptions`

Details: [Notifications API](../api/notifications.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `notifications` | In‑App | `user_id`, `type`, `payload`, `read_at` |
| `push_subscriptions` | Push‑Subs | `user_id`, `endpoint`, `keys` |
