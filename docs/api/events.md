# Events API

Job‑Endpoints für wöchentliche/monatliche Auswertungen und E‑Mail‑Dispatch.

> **Siehe auch:** [Betrieb & Monitoring](../operations.md) für eine vollständige Übersicht des Job-Systems.

## Auth

- `Authorization: Bearer <EVENTS_CRON_SECRET>`
- Alternativ `?secret=<EVENTS_CRON_SECRET>`

## GET /api/events/emails/unsubscribe

Abmelde‑Link für Summary‑E‑Mails. Rendert eine HTML‑Seite.

**Query:** `token`

**Response:** HTML-Seite mit Bestätigung der Abmeldung

---

## POST /api/events/weekly

Wöchentliche Auswertung. Verarbeitet alle Benutzeraktivitäten der vergangenen Woche, vergibt Badges und Awards, erstellt Leaderboards und versendet Zusammenfassungs-E-Mails.

**Query/Body:**

- `force=true` (optional): Erzwingt erneute Ausführung auch wenn bereits verarbeitet

**Response:**

```json
{
  "status": "ok",
  "skipped": false,
  "processedUsers": 123,
  "weekStart": "2026-02-03T00:00:00.000Z",
  "weekEnd": "2026-02-09T23:59:59.999Z",
  "emailResults": [
    { "userId": "...", "status": "queued" },
    {
      "userId": "...",
      "status": "skipped",
      "reason": "email-notifications-disabled"
    },
    { "userId": "...", "status": "failed", "error": "..." }
  ]
}
```

**Was passiert:**

- Berechnet Wochenstatistiken (Punkte, Workouts, Übungen)
- Evaluiert wöchentliche Ziele
- Vergibt Badges (`weekly-goal-exercises`, `weekly-goal-points`, `weekly-challenge-points`)
- Erstellt Freundes-Leaderboards
- Vergibt Leaderboard-Awards (Top 3)
- Versendet wöchentliche Zusammenfassungs-E-Mails

**Job-Name:** `weekly-events`

**Timeout:** 30 Minuten

---

## POST /api/events/monthly

Monatliche Auswertung. Verarbeitet alle Benutzeraktivitäten des vergangenen Monats, erstellt globale und Freundes-Rankings und vergibt monatliche Auszeichnungen.

**Query/Body:**

- `force=true` (optional): Erzwingt erneute Ausführung auch wenn bereits verarbeitet

**Response:**

```json
{
  "status": "ok",
  "skipped": false,
  "processedUsers": 123,
  "monthStart": "2026-01-01T00:00:00.000Z",
  "monthEnd": "2026-01-31T23:59:59.999Z",
  "emailResults": [...]
}
```

**Was passiert:**

- Berechnet Monatsstatistiken (Gesamtpunkte, Aktivitäten)
- Erstellt globale Rankings (Punkte, Pullups, Pushups, Sit-ups) - Top 3
- Erstellt Freundes-Rankings (Punkte, Aktivitäten) - Top 3
- Prüft Monats-Challenge
- Vergibt Badges (`monthly-challenge-points`)
- Vergibt Awards (`monthly-champion`, `category-rank-award`)
- Versendet monatliche Zusammenfassungs-E-Mails

**Job-Name:** `monthly-events`

**Timeout:** 30 Minuten

---

## POST /api/events/emails/dispatch

Versendet E‑Mail‑Queue. Verarbeitet ausstehende E-Mails aus der `email_queue`-Tabelle.

**Query:**

- `limit` (optional, default 25): Anzahl der E-Mails pro Durchlauf

**Response:**

```json
{
  "status": "ok",
  "processed": 10,
  "failed": 0,
  "skipped": 0
}
```

**Was passiert:**

- Liest E-Mails mit Status `pending` oder `retrying`
- Versendet E-Mails über SMTP
- Aktualisiert Status (`sent`, `failed`, `retrying`)
- Retry-Logik: Bis zu 3 Versuche mit exponential backoff

**Empfohlene Ausführung:** Alle 15 Minuten

---

## POST /api/events/cleanup

Bereinigt hängende Jobs. Findet Jobs, die länger als 1 Stunde laufen und markiert sie als fehlgeschlagen.

**Response:**

```json
{
  "status": "ok",
  "cleaned": 2,
  "jobs": [
    {
      "id": "...",
      "jobName": "weekly-events",
      "scheduledFor": "2026-02-09T00:00:00.000Z",
      "startedAt": "2026-02-08T23:00:00.000Z"
    }
  ]
}
```

**Was passiert:**

- Sucht nach Jobs mit Status `running` die länger als 1 Stunde laufen
- Markiert sie als `failed` mit Cleanup-Grund
- Sendet Alert-E-Mail an Admin

**Schwellwert:** 1 Stunde (`STUCK_JOB_THRESHOLD_MS`)

**Empfohlene Ausführung:** Täglich

---

## Konfiguration

### Umgebungsvariablen

| Variable                             | Beschreibung                                                     | Standard |
| ------------------------------------ | ---------------------------------------------------------------- | -------- |
| `EVENTS_CRON_SECRET` / `CRON_SECRET` | Secret für Cron-Request-Authentifizierung                        | -        |
| `EVENTS_BASE_URL`                    | Basis-URL für Event-Endpoints (z.B. `https://vertic-id.com`)     | -        |
| `FRONTEND_URL`                       | Frontend-URL (wird als Fallback für `EVENTS_BASE_URL` verwendet) | -        |

**Wichtig:** Die API-Endpunkte laufen unter derselben Domain wie das Frontend. Wenn `FRONTEND_URL` auf `https://vertic-id.com` gesetzt ist, sind die Endpunkte unter `https://vertic-id.com/api/events/*` erreichbar. Dies wird durch die `vercel.json`-Konfiguration sichergestellt, die alle `/api/*`-Requests an die Serverless-Funktion weiterleitet.
| `EMAIL_PREFERENCES_SECRET` | Secret für E-Mail-Abmeldungs-Tokens | - |
| `EMAIL_PREFERENCES_TOKEN_TTL` | Gültigkeitsdauer für Abmeldungs-Tokens | - |
| `EVENTS_UTC_OFFSET_MINUTES` / `EVENTS_TIMEZONE_OFFSET_MINUTES` | UTC-Offset für Wochen/Monats-Berechnungen | 0 |
| `ALERT_EMAIL` / `SMTP_USER` | E-Mail-Adresse für Alerts | - |

### Beispiel-Cron-Jobs

```bash
# Wöchentliche Auswertung (Sonntag, 23:00 UTC)
0 23 * * 0 curl -X POST "https://your-domain.com/api/events/weekly" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Monatliche Auswertung (Letzter Tag des Monats, 23:00 UTC)
0 23 28-31 * * [ $(date -d tomorrow +\%d) -eq 1 ] && \
  curl -X POST "https://your-domain.com/api/events/monthly" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# E-Mail-Dispatch (alle 15 Minuten)
*/15 * * * * curl -X POST "https://your-domain.com/api/events/emails/dispatch?limit=25" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Cleanup (täglich, 02:00 UTC)
0 2 * * * curl -X POST "https://your-domain.com/api/events/cleanup" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Fehlerbehandlung

- Alle Jobs haben ein Timeout von 30 Minuten
- Fehler werden in `job_runs.metadata` gespeichert
- Bei kritischen Fehlern werden Alert-E-Mails versendet
- E-Mails werden bis zu 3 Mal wiederholt mit exponential backoff

---

## Siehe auch

- [Betrieb & Monitoring](../operations.md) - Ausführliche Dokumentation der Jobs
- [Admin API - Monitoring](admin.md#monitoring) - Monitoring-Endpunkte
