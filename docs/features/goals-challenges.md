# Ziele & Challenges

## Zweck

Wochenziele (pro Aktivitätstyp) und wöchentliche Challenges.

## UI‑Screens

- `Dashboard`
- `Stats`

## API‑Endpunkte

- `GET /api/goals`
- `PUT /api/goals`
- `GET /api/challenges/weekly`

Details: [Goals API](../api/goals.md), [Challenges API](../api/challenges.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `weekly_results` | Wochen‑Auswertung | `user_id`, `week_start`, `points` |
| `monthly_results` | Monats‑Auswertung | `user_id`, `month_start`, `points` |
| `awards` | Awards | `user_id`, `award_type`, `created_at` |
| `user_badges` | Badges | `user_id`, `badge_id`, `awarded_at` |
