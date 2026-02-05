# Events API

Job‑Endpoints für wöchentliche/monatliche Auswertungen und E‑Mail‑Dispatch.

## Auth

- `Authorization: Bearer <EVENTS_CRON_SECRET>`
- Alternativ `?secret=<EVENTS_CRON_SECRET>`

## GET /api/events/emails/unsubscribe

Abmelde‑Link für Summary‑E‑Mails. Rendert eine HTML‑Seite.

**Query:** `token`

## POST /api/events/weekly

Wöchentliche Auswertung.

**Query/Body:** `force=true` (optional)

**Response (Beispiel):**

```json
{ "status": "ok", "processed": 123 }
```

## POST /api/events/monthly

Monatliche Auswertung.

**Query/Body:** `force=true` (optional)

## POST /api/events/emails/dispatch

Versendet E‑Mail‑Queue.

**Query:** `limit` (default 25)

**Response (Beispiel):**

```json
{ "status": "ok", "processed": 10, "failed": 0 }
```

## POST /api/events/cleanup

Bereinigt hängende Jobs.

## Konfiguration

- `EVENTS_CRON_SECRET` / `CRON_SECRET`
- `EVENTS_BASE_URL`
- `EMAIL_PREFERENCES_SECRET`
- `EMAIL_PREFERENCES_TOKEN_TTL`
- `EVENTS_UTC_OFFSET_MINUTES` / `EVENTS_TIMEZONE_OFFSET_MINUTES`
