# Feed API

## GET /api/feed

Activity‑Feed (Workouts) von dir und deinen Freunden.

**Auth:** erforderlich

**Query (wichtigste Felder):**

- `page` (default 1)
- `limit` (1–50, default 5)
- `period` = `week | month | quarter | year | all`
- `start`, `end` (ISO‑Datum für expliziten Bereich)

**Response (Beispiel):**

```json
{
  "workouts": [
    {
      "workoutId": "uuid",
      "workoutTitle": "Training",
      "workoutNotes": "optional",
      "startTimeTimestamp": "2025-01-01T18:30:00.000Z",
      "userId": "uuid",
      "userName": "Max",
      "userAvatar": "...",
      "isOwnWorkout": false,
      "activities": [
        { "id": "uuid", "activityType": "exercise-id", "amount": 20, "points": 12 }
      ],
      "reactions": [
        { "emoji": "👍", "count": 3, "users": [ { "id": "...", "name": "..." } ] }
      ],
      "totalPoints": 42
    }
  ],
  "hasFriends": true,
  "pagination": { "currentPage": 1, "totalPages": 2, "totalItems": 8, "hasNext": true, "hasPrev": false }
}
```

**Fehlerfälle:**

- `400` ungültiger Zeitraum
- `500` Serverfehler

**Hinweise:**

- Feed enthält **eigene** und **Freundes‑Workouts**.
- Reaktionen werden je nach Owner‑Preferences angezeigt (`preferences.reactions.*`).
