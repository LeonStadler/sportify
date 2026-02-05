# Datenbank

## Überblick

- PostgreSQL
- Migrationen in `migrations/`
- Zugriff über `pg` Pool (`DATABASE_URL`)

## Zentrale Tabellen (Auszug)

- `users` – Profile, Auth, Preferences, Rollen
- `workouts` – Workouts inkl. Sichtbarkeit/Metadaten
- `workout_activities` – Aktivitäten, Sets, Punkte
- `exercises` – Übungsdatenbank
- `exercise_favorites`, `exercise_aliases`, `exercise_edit_requests`
- `training_journal_entries`
- `friendships`, `friend_requests`
- `notifications`, `push_subscriptions`
- `invitations`, `user_backup_codes`
- `job_runs`, `awards`, `user_badges`, `leaderboard_results`

## Migrationen

Migrationen liegen in `migrations/*.sql` und werden beim Server‑Start ausgeführt. Für Vercel kann `RUN_MIGRATIONS_ON_REQUEST=true` genutzt werden.

## Hinweise

Die DB ist stark normalisiert. Details zu Punkten und Einheiten siehe [scoring.md](scoring.md).
