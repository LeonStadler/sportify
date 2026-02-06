# Admin‑System

## Zweck

Admin‑Übersicht für Nutzer, Einladungen, Übungen und Monitoring.

## UI‑Screens

- `Admin`

## API‑Endpunkte

- `GET /api/admin/users`
- `GET /api/admin/invitations`
- `POST /api/admin/invite-user`
- `GET /api/admin/overview-stats`
- `GET /api/admin/exercises`
- `POST /api/admin/exercises`
- `PUT /api/admin/exercises/:id`
- `POST /api/admin/exercises/:id/merge`
- `POST /api/admin/exercises/:id/deactivate`
- `GET /api/admin/exercises/export`
- `POST /api/admin/exercises/import`
- `GET /api/admin/exercise-reports`
- `PUT /api/admin/exercise-reports/:id/resolve`
- `GET /api/admin/exercise-edit-requests`
- `PUT /api/admin/exercise-edit-requests/:id/resolve`
- `GET /api/admin/monitoring`
- `POST /api/admin/monitoring/cleanup-jobs`
- `POST /api/admin/monitoring/test-alert`

Details: [Admin API](../api/admin.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `users` | User‑Stamm | `email`, `role`, `created_at` |
| `invitations` | Admin‑Einladungen | `email`, `status`, `expires_at` |
| `exercises` | Übungs‑Kuration | `status`, `is_active`, `merged_into` |
| `exercise_reports` | Reports | `reason`, `status` |
| `exercise_edit_requests` | Änderungsanträge | `status`, `reviewed_by` |
| `job_runs` | Jobs | `job_name`, `status`, `started_at` |
| `email_queue` | Queue | `status`, `attempts`, `error` |
