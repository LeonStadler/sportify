# Datenbank & Migrationen

## Überblick

- PostgreSQL
- Migrationen in `migrations/`
- Zugriff über `pg` Pool (`DATABASE_URL`)

## Migrationen

### Lifecycle

1. **Lokal**: Migrationen laufen beim Server‑Start.
2. **CI/Deploy**: Migrationen werden im Deploy‑Prozess ausgeführt.
3. **Prod**: Nur kontrolliert ausführen, Monitoring prüfen.

### Ausführung

- Migrationen laufen **beim Server‑Start**.
- Für Vercel kann zusätzlich `RUN_MIGRATIONS_ON_REQUEST=true` genutzt werden.

### Status

- `GET /api/health` liefert `migrations` (ran/inFlight/error).

### Struktur

- `db/migrations.js` enthält Runner
- `migrations/*.sql` sind in Reihenfolge nummeriert

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
- `email_queue`

## Hinweise

- Schemaänderungen ausschließlich über Migrationen.
- In Produktionsumgebungen Migrationen nur in kontrollierten Deployments.
