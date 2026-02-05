# Übungen

## Zweck

Kuratierte Übungsdatenbank, inkl. Filter, Favoriten und Änderungsanträgen.

## UI‑Screens

- `Exercises`

## API‑Endpunkte

- `GET /api/exercises`
- `GET /api/exercises/:id`
- `GET /api/exercises/favorites/list`
- `POST /api/exercises/:id/favorite`
- `POST /api/exercises`
- `POST /api/exercises/:id/report`
- `POST /api/exercises/:id/edit-request`

Details: [Exercises API](../api/exercises.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `exercises` | Übungsstamm | `id`, `name`, `slug`, `measurement_type`, `difficulty_tier` |
| `exercise_favorites` | Favoriten | `user_id`, `exercise_id` |
| `exercise_edit_requests` | Änderungsanträge | `exercise_id`, `change_request`, `status` |
| `exercise_reports` | Reports | `exercise_id`, `reason`, `status` |
