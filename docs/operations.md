# Betrieb & Monitoring

Diese Seite beschreibt den Betrieb der Plattform, Jobs/Events, Monitoring und Alerts.

> **Siehe auch:** [Events API](api/events.md) für die vollständige API-Referenz.

## Übersicht

Das Sportify-System verwendet ein Job-System für periodische Aufgaben wie wöchentliche und monatliche Auswertungen, E-Mail-Versand und Systembereinigung. Alle Jobs werden in der `job_runs`-Tabelle protokolliert, um den Status zu verfolgen und hängende Jobs zu erkennen.

## Jobs & Events

### 1. Wöchentliche Auswertung (`weekly-events`)

**Endpoint:** `POST /api/events/weekly`

**Zweck:** Verarbeitet die wöchentliche Auswertung aller Benutzeraktivitäten und vergibt Badges, Awards und erstellt Rankings.

**Ausführung:** Wird typischerweise am Ende jeder Woche ausgeführt (z. B. Sonntag Abend).

**Was wird verarbeitet:**

1. **Statistiken berechnen:**
   - Gesamtpunkte pro Benutzer für die Woche
   - Anzahl der Workouts
   - Anzahl der Übungen (nach Typ)
   - Aktivitäts-Totals (Pullups, Pushups, Sit-ups, Laufen, Radfahren)

2. **Ziele evaluieren:**
   - Prüft, ob Benutzer ihre wöchentlichen Übungs-Ziele erreicht haben
   - Prüft, ob Benutzer ihr Punkte-Ziel erreicht haben
   - Prüft, ob die Wochen-Challenge geschafft wurde

3. **Badges vergeben:**
   - `weekly-goal-exercises`: Wenn Übungs-Ziele erreicht wurden
   - `weekly-goal-points`: Wenn Punkte-Ziel erreicht wurde
   - `weekly-challenge-points`: Wenn Wochen-Challenge geschafft wurde

4. **Leaderboards erstellen:**
   - Berechnet Freundes-Rankings basierend auf Punkten
   - Speichert Ergebnisse in `leaderboard_results`

5. **Auszeichnungen vergeben:**
   - Leaderboard-Awards für Top 3 in Freundes-Rangliste
   - Speichert in `weekly_results.awards_awarded`

6. **E-Mails versenden:**
   - Erstellt und versendet wöchentliche Zusammenfassungs-E-Mails
   - Enthält: Statistiken, Ziele-Status, Leaderboard-Platz, neue Badges/Awards
   - Respektiert E-Mail-Präferenzen der Benutzer

**Datenbank-Tabellen:**
- `weekly_results`: Speichert Wochenstatistiken pro Benutzer
- `leaderboard_results`: Speichert Leaderboard-Rankings
- `user_badges`: Neue vergebene Badges
- `awards`: Neue vergebene Auszeichnungen
- `email_queue`: E-Mails werden in die Queue eingereiht

**Timeout:** 30 Minuten (Job wird als "failed" markiert, wenn er länger läuft)

**Parameter:**
- `force=true`: Erzwingt erneute Ausführung auch wenn bereits verarbeitet

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
    { "userId": "...", "status": "skipped", "reason": "email-notifications-disabled" }
  ]
}
```

---

### 2. Monatliche Auswertung (`monthly-events`)

**Endpoint:** `POST /api/events/monthly`

**Zweck:** Verarbeitet die monatliche Auswertung aller Benutzeraktivitäten, erstellt globale und Freundes-Rankings und vergibt monatliche Auszeichnungen.

**Ausführung:** Wird typischerweise am letzten Tag des Monats ausgeführt.

**Was wird verarbeitet:**

1. **Statistiken berechnen:**
   - Gesamtpunkte pro Benutzer für den Monat
   - Aktivitäts-Totals nach Typ

2. **Rankings berechnen:**
   - **Globale Rankings** (nur für Benutzer mit `show_in_global_rankings = true`):
     - Punkte-Ranking (Top 3)
     - Aktivitäts-Rankings für Pullups, Pushups, Sit-ups (jeweils Top 3)
   - **Freundes-Rankings** (für alle Benutzer):
     - Punkte-Ranking innerhalb des Freundeskreises (Top 3)
     - Aktivitäts-Rankings innerhalb des Freundeskreises (Top 3)

3. **Monats-Challenge prüfen:**
   - Prüft, ob Benutzer die monatliche Punkte-Challenge erreicht haben
   - Standard-Schwelle: `DEFAULT_MONTHLY_POINT_CHALLENGE`

4. **Badges vergeben:**
   - `monthly-challenge-points`: Wenn Monats-Challenge geschafft wurde

5. **Auszeichnungen vergeben:**
   - `monthly-champion`: Für erreichte Monats-Challenge
   - `category-rank-award`: Für Top 3 Plätze in verschiedenen Kategorien:
     - Global: Punkte, Pullups, Pushups, Sit-ups
     - Freunde: Punkte, Pullups, Pushups, Sit-ups

6. **E-Mails versenden:**
   - Erstellt und versendet monatliche Zusammenfassungs-E-Mails
   - Enthält: Statistiken, Rankings, Challenge-Status, neue Badges/Awards
   - Respektiert E-Mail-Präferenzen der Benutzer

**Datenbank-Tabellen:**
- `monthly_results`: Speichert Monatsstatistiken pro Benutzer
- `user_badges`: Neue vergebene Badges
- `awards`: Neue vergebene Auszeichnungen
- `email_queue`: E-Mails werden in die Queue eingereiht

**Timeout:** 30 Minuten

**Parameter:**
- `force=true`: Erzwingt erneute Ausführung auch wenn bereits verarbeitet

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

---

### 3. E-Mail-Dispatch (`emails/dispatch`)

**Endpoint:** `POST /api/events/emails/dispatch`

**Zweck:** Verarbeitet die E-Mail-Warteschlange und versendet ausstehende E-Mails.

**Ausführung:** Sollte mehrmals täglich ausgeführt werden (z. B. alle 15 Minuten).

**Was wird verarbeitet:**

1. **E-Mail-Queue abarbeiten:**
   - Liest E-Mails aus `email_queue` mit Status `pending` oder `retrying`
   - Standard-Limit: 25 E-Mails pro Durchlauf (konfigurierbar)

2. **E-Mails versenden:**
   - Versendet E-Mails über SMTP (Nodemailer)
   - Aktualisiert Status auf `sent` bei Erfolg
   - Bei Fehler: Erhöht `attempts` und setzt Status auf `retrying` oder `failed`

3. **Retry-Logik:**
   - E-Mails werden bis zu 3 Mal wiederholt
   - Nach 3 fehlgeschlagenen Versuchen: Status `failed`
   - `failed_after_retries` wird gesetzt für Monitoring

**Datenbank-Tabellen:**
- `email_queue`: Status wird aktualisiert (`sent`, `failed`, `retrying`)

**Parameter:**
- `limit`: Anzahl der E-Mails pro Durchlauf (Standard: 25)

**Response:**
```json
{
  "status": "ok",
  "processed": 10,
  "failed": 0,
  "skipped": 0
}
```

---

### 4. Cleanup (`cleanup`)

**Endpoint:** `POST /api/events/cleanup`

**Zweck:** Findet und bereinigt hängende Jobs (Jobs, die länger als 1 Stunde laufen).

**Ausführung:** Sollte täglich oder bei Bedarf ausgeführt werden.

**Was wird verarbeitet:**

1. **Stuck Jobs finden:**
   - Sucht nach Jobs mit Status `running` die länger als 1 Stunde laufen
   - Schwellwert: `STUCK_JOB_THRESHOLD_MS = 60 * 60 * 1000` (1 Stunde)

2. **Jobs markieren:**
   - Setzt Status auf `failed`
   - Setzt `completed_at` auf aktuelle Zeit
   - Fügt `cleanup_reason` in Metadaten hinzu

3. **Alert versenden:**
   - Sendet E-Mail-Alert an `ALERT_EMAIL` oder `SMTP_USER`
   - Enthält Liste aller bereinigten Jobs

**Datenbank-Tabellen:**
- `job_runs`: Status wird aktualisiert

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

---

## Job-Status & Monitoring

### Job-Status-Werte

- `pending`: Job wurde geplant, aber noch nicht gestartet
- `running`: Job läuft aktuell
- `completed`: Job wurde erfolgreich abgeschlossen
- `failed`: Job ist fehlgeschlagen

### Job-Runs Tabelle

Die `job_runs`-Tabelle speichert alle Job-Ausführungen:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | UUID | Eindeutige Job-Run-ID |
| `job_name` | String | Name des Jobs (z. B. "weekly-events") |
| `scheduled_for` | Timestamp | Geplantes Ausführungsdatum |
| `status` | String | Aktueller Status |
| `started_at` | Timestamp | Startzeitpunkt |
| `completed_at` | Timestamp | Abschlusszeitpunkt |
| `metadata` | JSONB | Zusätzliche Metadaten (Fehler, Statistiken, etc.) |

**Eindeutigkeit:** Kombination aus `job_name` und `scheduled_for` ist eindeutig (verhindert doppelte Ausführung)

### Monitoring-API

**Endpoint:** `GET /api/admin/monitoring`

Gibt umfassende Monitoring-Daten zurück:

```json
{
  "jobs": {
    "stats": [
      {
        "jobName": "weekly-events",
        "status": "completed",
        "count": 4,
        "lastRun": "2026-02-09T00:00:00.000Z",
        "failedCount": 0,
        "runningCount": 0,
        "completedCount": 4
      }
    ],
    "recentFailures": [
      {
        "jobName": "monthly-events",
        "count": 1
      }
    ],
    "stuckJobs": [
      {
        "id": "...",
        "jobName": "weekly-events",
        "scheduledFor": "2026-02-09T00:00:00.000Z",
        "startedAt": "2026-02-08T23:00:00.000Z"
      }
    ]
  },
  "emails": {
    "stats": [
      {
        "status": "sent",
        "count": 150,
        "failedAfterRetries": 0
      },
      {
        "status": "failed",
        "count": 2,
        "failedAfterRetries": 1
      }
    ],
    "recent": [...]
  }
}
```

**Zeitraum:** 
- Job-Statistiken: Letzte 30 Tage
- Job-Fehler: Letzte 7 Tage
- E-Mail-Statistiken: Letzte 7 Tage
- E-Mail-Recent: Letzte 24 Stunden

---

## Konfiguration

### Umgebungsvariablen

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `EVENTS_CRON_SECRET` / `CRON_SECRET` | Secret für Cron-Request-Authentifizierung | - |
| `EVENTS_BASE_URL` | Basis-URL für Event-Endpoints (z.B. `https://vertic-id.com`) | - |
| `FRONTEND_URL` | Frontend-URL (wird als Fallback für `EVENTS_BASE_URL` verwendet) | - |

**Wichtig:** Die API-Endpunkte laufen unter derselben Domain wie das Frontend. Wenn `FRONTEND_URL` auf `https://vertic-id.com` gesetzt ist, sind die Endpunkte unter `https://vertic-id.com/api/events/*` erreichbar. Dies wird durch die `vercel.json`-Konfiguration sichergestellt, die alle `/api/*`-Requests an die Serverless-Funktion weiterleitet.
| `EVENTS_UTC_OFFSET_MINUTES` / `EVENTS_TIMEZONE_OFFSET_MINUTES` | UTC-Offset für Wochen/Monats-Berechnungen | 0 |
| `ALERT_EMAIL` / `SMTP_USER` | E-Mail-Adresse für Alerts | - |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP-Konfiguration für E-Mail-Versand | - |

### Cron-Job Einrichtung

**Empfohlene Cron-Konfiguration:**

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

### Job-Fehler

- Jobs haben ein Timeout von 30 Minuten
- Bei Fehler wird Status auf `failed` gesetzt
- Fehlerdetails werden in `metadata` gespeichert
- Bei kritischen Fehlern wird ein Alert-E-Mail versendet

### E-Mail-Fehler

- E-Mails werden bis zu 3 Mal wiederholt
- Fehler werden in `email_queue.error` gespeichert
- Nach 3 Versuchen: Status `failed`
- `failed_after_retries` wird für Monitoring gesetzt

### Stuck Jobs

- Jobs, die länger als 1 Stunde laufen, werden als "stuck" erkannt
- Cleanup-Job markiert sie als `failed` mit Cleanup-Grund
- Alert-E-Mail wird an Admin versendet

---

## Datenmodell

| Tabelle | Zweck | Wichtige Felder |
|---------|-------|-----------------|
| `job_runs` | Job-Status | `job_name`, `status`, `started_at`, `completed_at`, `metadata` |
| `email_queue` | Mail-Queue | `recipient`, `status`, `attempts`, `error`, `failed_after_retries` |
| `weekly_results` | Wochenstatistiken | `user_id`, `week_start`, `total_points`, `badges_awarded`, `awards_awarded` |
| `monthly_results` | Monatsstatistiken | `user_id`, `month_start`, `total_points`, `badges_awarded`, `awards_awarded` |
| `leaderboard_results` | Leaderboard-Rankings | `week_start`, `user_id`, `rank`, `total_points`, `participant_count` |

---

## API-Endpunkte

Details zu allen Endpunkten: [Events API](api/events.md)

- `POST /api/events/weekly` - Wöchentliche Auswertung
- `POST /api/events/monthly` - Monatliche Auswertung
- `POST /api/events/emails/dispatch` - E-Mail-Dispatch
- `POST /api/events/cleanup` - Cleanup hängender Jobs
- `GET /api/admin/monitoring` - Monitoring-Daten
- `POST /api/admin/monitoring/cleanup-jobs` - Manueller Cleanup
- `POST /api/admin/monitoring/test-alert` - Test-Alert versenden

---

## Alerts

- Alerts werden per E-Mail versendet (z. B. stuck jobs, Job-Fehler)
- Empfänger: `ALERT_EMAIL` oder `SMTP_USER`
- Format: `[Sportify Alert] <Titel>`
- Enthält Details zu fehlgeschlagenen Jobs oder Systemproblemen
