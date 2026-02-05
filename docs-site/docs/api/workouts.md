---
title: "Workouts API"
---

# Workouts API

Workout-Management und Templates.

## GET /api/workouts

Listet Workouts des Users.

**Auth:** erforderlich

**Query (Auszug):**

- `limit`, `offset`
- `startDate`, `endDate` (YYYY-MM-DD)
- `visibility` (private|friends|public)
- `includeActivities` (true|false)

**Antwort (200):** Liste von Workouts.

## GET /api/workouts/:id

Lädt ein einzelnes Workout inkl. Aktivitäten.

**Auth:** erforderlich

## POST /api/workouts

Erstellt ein Workout oder Template.

**Auth:** erforderlich

**Body (JSON):**

```json
{
  "title": "Push Day",
  "description": "optional",
  "workoutDate": "2025-01-12",
  "startTime": "18:30",
  "endTime": "19:15",
  "useEndTime": true,
  "duration": 45,
  "visibility": "private|friends|public",
  "isTemplate": false,
  "difficulty": 5,
  "sessionType": "optional",
  "rounds": 3,
  "restBetweenSetsSeconds": 60,
  "restBetweenActivitiesSeconds": 90,
  "restBetweenRoundsSeconds": 120,
  "category": "optional",
  "discipline": "optional",
  "movementPattern": "optional",
  "movementPatterns": ["optional"],
  "sourceTemplateId": "optional",
  "activities": [
    {
      "activityType": "exercise-id",
      "quantity": 20,
      "amount": 20,
      "unit": "reps|min|sec|km|m",
      "duration": 600,
      "distance": 2.5,
      "sets": [
        { "reps": 10, "weight": 20, "duration": 60, "distance": 0, "notes": "optional" }
      ]
    }
  ]
}
```

**Hinweise:**

- `quantity` ist das aktuelle Feld, `amount` wird aus Legacy-Gründen akzeptiert.
- Für Sets wird die Gesamtmenge aus den Sets summiert.

## PUT /api/workouts/:id

Aktualisiert ein Workout (Felder wie bei POST).

**Auth:** erforderlich

## DELETE /api/workouts/:id

Löscht ein Workout.

**Auth:** erforderlich

## Templates

### GET /api/workouts/templates

Listet Workout-Templates.

**Auth:** erforderlich

### GET /api/workouts/templates/:id

Lädt ein Template inkl. Aktivitäten.

**Auth:** erforderlich
