# Scoreboard API

## GET /api/scoreboard/overall

Globales oder Freunde‑Ranking.

**Auth:** erforderlich

**Query:**

- `period` = `week | month | year | all | custom`
- `start`, `end` (wenn `period=custom`)
- `scope` = `friends | global` (default `friends`)

**Antwort (200):**

```json
{ "leaderboard": [ { "id": "...", "displayName": "...", "totalPoints": 123, "rank": 1 } ] }
```

## GET /api/scoreboard/activity/:activity

Ranking pro Aktivität.

**Auth:** erforderlich

**Query:**

- `period` = `week | month | year | all | custom`
- `start`, `end` (wenn `period=custom`)
- `scope` = `personal | friends | global`

**Antwort (200):**

```json
{ "leaderboard": [ { "id": "...", "totalAmount": 200, "totalPoints": 50, "rank": 1 } ] }
```

## GET /api/scoreboard/top-exercises

Top‑Übungen nach Punkten.

**Auth:** erforderlich

**Query:**

- `period` = `week | month | year | all | custom`
- `start`, `end` (wenn `period=custom`)
- `scope` = `friends | global`
- `limit` (1–10, default 5)

**Antwort (200):**

```json
{ "exercises": [ { "id": "...", "name": "...", "totalPoints": 123 } ] }
```
