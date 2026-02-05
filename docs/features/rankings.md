# Rankings

## Zweck

Ranglisten global und nach Aktivität, plus Top‑Übungen.

## UI‑Screens

- `Scoreboard`

## API‑Endpunkte

- `GET /api/scoreboard/overall`
- `GET /api/scoreboard/activity/:activity`
- `GET /api/scoreboard/top-exercises`

Details: [Scoreboard API](../api/scoreboard.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `leaderboard_results` | Ranglisten | `user_id`, `period`, `points` |
