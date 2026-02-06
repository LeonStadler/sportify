# Betrieb & Jobs

## Zweck

Systembetrieb, Cron‑Jobs und E‑Mail‑Dispatch.

## API‑Endpunkte

- `POST /api/events/weekly`
- `POST /api/events/monthly`
- `POST /api/events/emails/dispatch`
- `POST /api/events/cleanup`

Details: [Events API](../api/events.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `job_runs` | Job‑Runs | `job_name`, `status`, `started_at`, `completed_at` |
| `email_queue` | Mail‑Queue | `recipient`, `status`, `attempts`, `error` |
