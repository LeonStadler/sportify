# Challenges API

## GET /api/challenges/weekly

Lädt die aktuelle Wochen‑Challenge.

**Auth:** erforderlich

**Response (Beispiel):**

```json
{
  "week": { "start": "2025-01-01", "end": "2025-01-07", "daysRemaining": 4 },
  "targets": { "points": 1000, "pullups": 50, "pushups": 100, "running": 10, "cycling": 20 },
  "progress": { "totalPoints": 120, "workoutsCompleted": 2, "completionPercentage": 12 },
  "activities": {
    "pullups": { "target": 50, "current": 10, "percentage": 20 }
  },
  "leaderboard": [ { "id": "...", "displayName": "...", "totalPoints": 200, "rank": 1 } ]
}
```

**Fehlerfälle:**

- `500` Serverfehler

**Hinweis:** nutzt aktuell Legacy‑Aktivitätstypen (`pullups`, `pushups`, `running`, `cycling`).
