# Training & Workouts

## Zweck

Verwaltung von Trainingseinheiten inkl. Aktivitäten, Sets, Zeitangaben und Vorlagen (Templates).

## UI‑Screens

- `Training`
- `MyWorkouts`

## API‑Endpunkte

- `GET /api/workouts`
- `GET /api/workouts/:id`
- `POST /api/workouts`
- `PUT /api/workouts/:id`
- `DELETE /api/workouts/:id`
- `GET /api/workouts/templates`
- `GET /api/workouts/templates/:id`

Details: [Workouts API](../api/workouts.md)

## Systeme

- [Workout‑Vorlagen](../systems/workout-templates.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `workouts` | Trainingseinheiten | `id`, `user_id`, `title`, `start_time`, `visibility`, `is_template` |
| `workout_activities` | Aktivitäten | `workout_id`, `activity_type`, `quantity`, `unit`, `points_earned` |
