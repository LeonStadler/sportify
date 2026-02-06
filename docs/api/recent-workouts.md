# Recent Workouts API

## GET /api/recent-workouts

Schnellzugriff auf die letzten Workouts.

**Auth:** erforderlich

**Query:**

- `limit` (1–50, default 5)

**Antwort (200):**

```json
{
  "workouts": [
    {
      "id": "uuid",
      "title": "Workout",
      "workoutDate": "2025-01-01",
      "startTime": "18:30",
      "createdAt": "2025-01-01T18:30:00.000Z",
      "notes": "optional",
      "activities": [
        { "activityType": "exercise-id", "amount": 20, "unit": "reps", "points": 12.5 }
      ]
    }
  ]
}
```
