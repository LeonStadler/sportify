# Betrieb & Monitoring

Diese Seite beschreibt den Betrieb der Plattform, Jobs/Events, Monitoring und Alerts.

## Jobs & Events

- Wöchentliche Auswertung: `POST /api/events/weekly`
- Monatliche Auswertung: `POST /api/events/monthly`
- E‑Mail‑Dispatch: `POST /api/events/emails/dispatch`
- Cleanup: `POST /api/events/cleanup`

Details: [Events API](api/events.md)

## Monitoring

- Admin Monitoring: `GET /api/admin/monitoring`
- Cleanup stuck jobs: `POST /api/admin/monitoring/cleanup-jobs`
- Test‑Alert: `POST /api/admin/monitoring/test-alert`

## Job‑Runs & Queue

**Job‑Runs** werden in `job_runs` gespeichert.

**E‑Mail‑Queue** in `email_queue` (Status + Attempts + Errors).

## Alerts

- Alerts werden per E‑Mail versendet (z. B. stuck jobs)
- Empfänger: `ALERT_EMAIL` oder `SMTP_USER`

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `job_runs` | Job‑Status | `job_name`, `status`, `started_at`, `completed_at` |
| `email_queue` | Mail‑Queue | `recipient`, `status`, `attempts`, `error` |
