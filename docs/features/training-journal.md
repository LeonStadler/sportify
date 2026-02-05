# Training Journal

## Zweck

Tagebuch‑Einträge mit Stimmung, Tags und optionaler Workout‑Verknüpfung.

## UI‑Screens

- `Training` (Journal‑Bereich)

## API‑Endpunkte

- `GET /api/training-journal`
- `GET /api/training-journal/summary`
- `GET /api/training-journal/:id`
- `POST /api/training-journal`
- `PUT /api/training-journal/:id`
- `DELETE /api/training-journal/:id`

Details: [Training Journal API](../api/training-journal.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `training_journal_entries` | Journal‑Einträge | `user_id`, `entry_date`, `mood`, `notes`, `tags`, `metrics` |
