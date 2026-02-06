# Dashboard

## Zweck

Übersicht zu Zielen, Statistiken und letzten Aktivitäten.

## UI‑Screens

- `Dashboard`

## API‑Abhängigkeiten

- `GET /api/stats`
- `GET /api/goals`
- `GET /api/recent-workouts`

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `workouts` | Übersicht | `user_id`, `start_time` |
| `workout_activities` | Punkte | `points_earned` |
