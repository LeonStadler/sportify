# Goals API

## GET /api/goals

Lädt Wochenziele des Users.

**Auth:** erforderlich

## PUT /api/goals

Setzt/aktualisiert Wochenziele.

**Auth:** erforderlich

**Body (JSON, Auszug):**

```json
{
  "goals": [
    { "activityType": "running", "target": 10 }
  ]
}
```
