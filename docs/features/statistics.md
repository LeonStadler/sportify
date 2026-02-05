# Statistiken

## Zweck

Analytics zu Workouts, Volumen, Frequenzen und Trends.

## UI‑Screens

- `Stats`

## API‑Endpunkte

- `GET /api/stats`
- `GET /api/stats/analytics`
- `GET /api/stats/monthly-goal`
- `GET /api/stats/public`

Details: [Stats API](../api/stats.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `workouts` | Trainings | `user_id`, `start_time`, `duration` |
| `workout_activities` | Aktivitätsdaten | `activity_type`, `quantity`, `points_earned` |
| `leaderboard_results` | Aggregationen | `user_id`, `period`, `points` |
