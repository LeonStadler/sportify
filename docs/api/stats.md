# Stats API

## GET /api/stats/public

Öffentliche Statistiken (Landing).

**Antwort (200):**

```json
{ "users": 123, "exercises": 456, "reps": 7890, "free": 100 }
```

## GET /api/stats

Übersicht für einen Zeitraum.

**Auth:** erforderlich

**Query:**

- `period` = `week | month | year | all` (default `week`)

## GET /api/stats/analytics

Erweiterte Analytics, inkl. Custom Range.

**Auth:** erforderlich

**Query:**

- `period` = `week | month | year | all | custom`
- `start`, `end` (ISO‑Datum, wenn `period=custom`)

## GET /api/stats/monthly-goal

Monatliche Zielerreichung.

**Auth:** erforderlich

**Query:**

- `offset` (Monate zurück, default 0)

**Hinweis:** Baseline wird aus `preferences.metrics.activityLevel` abgeleitet (`low|medium|high`).
