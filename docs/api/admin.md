# Admin API

Alle Endpunkte benötigen Auth + Admin‑Rolle.

## Benutzer & Einladungen

### GET /api/admin/users

Listet Benutzer.

**Response (Beispiel):**

```json
[{ "id": "uuid", "email": "...", "firstName": "...", "lastName": "...", "role": "admin|user" }]
```

### GET /api/admin/invitations

Listet Einladungen.

### POST /api/admin/invite-user

Erstellt eine Einladung und versendet E‑Mail.

**Body:**

```json
{ "email": "...", "firstName": "...", "lastName": "..." }
```

**Response (Beispiel):**

```json
{ "message": "Einladung gesendet.", "invitation": { "id": "...", "email": "..." } }
```

## Admin‑Dashboard

### GET /api/admin/overview-stats

Zähler für Admin‑Dashboard.

**Response (Beispiel):**

```json
{ "users": 10, "workouts": 50, "templates": 0, "exercises": 200, "badges": 5 }
```

## Übungen (Admin)

### GET /api/admin/exercises

**Query:** `status`, `includeInactive=true|false`

### GET /api/admin/exercises/:id

Lädt eine Übung.

### POST /api/admin/exercises

Übung erstellen.

**Body (Beispiel):**

```json
{
  "name": "Pull Ups",
  "unit": "reps",
  "category": "strength",
  "discipline": "calisthenics",
  "movementPattern": "pull",
  "measurementType": "reps",
  "difficultyTier": 5,
  "pointsSource": "auto|manual",
  "pointsPerUnit": 1,
  "aliases": ["pull-ups"],
  "isActive": true,
  "status": "approved"
}
```

### PUT /api/admin/exercises/:id

Übung aktualisieren (inkl. Aliases).

### POST /api/admin/exercises/:id/merge

Merge Übung in Zielübung.

**Body:** `{ "targetExerciseId": "uuid" }`

### POST /api/admin/exercises/:id/deactivate

Deaktiviert Übung.

### GET /api/admin/exercises/export

Export‑Template (CSV oder JSON). `?format=csv|json`

### POST /api/admin/exercises/import

Bulk‑Import.

**Body:** `{ "exercises": [ ... ] }`

**Import‑Felder:** `name, description, category, discipline, movementPattern, measurementTypes, distanceUnit, timeUnit, difficultyTier, requiresWeight, allowsWeight, supportsSets, muscleGroups, equipment, aliases`

## Reports & Edit Requests

### GET /api/admin/exercise-reports

**Query:** `status=pending|resolved|...`

### PUT /api/admin/exercise-reports/:id/resolve

**Body:** `{ "status": "resolved" }`

### GET /api/admin/exercise-edit-requests

**Query:** `status=pending|approved|rejected`

### PUT /api/admin/exercise-edit-requests/:id/resolve

**Body:** `{ "status": "approved|rejected", "adminNotes": "optional" }`

## Monitoring & Alerts

### GET /api/admin/monitoring

Liefert Job‑Stats, Fehler und E‑Mail‑Queue‑Status.

**Response (Beispiel):**

```json
{
  "jobs": {
    "stats": [
      { "job_name": "weekly", "status": "completed", "count": 4, "last_run": "..." }
    ],
    "recentFailures": [ { "job_name": "monthly", "count": 1 } ],
    "stuckJobs": [ { "id": "...", "job_name": "emails", "started_at": "..." } ]
  },
  "emails": {
    "stats": [ { "status": "pending", "count": 5, "failedAfterRetries": 1 } ],
    "recent": [ { "id": "...", "recipient": "...", "status": "sent" } ]
  }
}
```

### POST /api/admin/monitoring/cleanup-jobs

Bereinigt hängende Jobs. Antwort enthält `cleaned` und `jobs`.

### POST /api/admin/monitoring/test-alert

Sendet Test‑Alert für E‑Mail‑Queue.
