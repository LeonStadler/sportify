---
title: "Reactions API"
---

# Reactions API

Reaktionen auf Workouts.

## POST /api/reactions

Erstellt oder aktualisiert eine Reaktion.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "workoutId": "uuid", "reactionType": "like|clap|fire|..." }
```

## DELETE /api/reactions/:workoutId

Entfernt eigene Reaktion.

**Auth:** erforderlich

## GET /api/reactions/workout/:workoutId

Listet Reaktionen zu einem Workout.

**Auth:** erforderlich
