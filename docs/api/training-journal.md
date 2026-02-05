# Training Journal API

## GET /api/training-journal

Listet Einträge.

**Auth:** aktuell **nicht** erforderlich (öffentlich). In der App wird es dennoch als Nutzerbereich verwendet.

**Query:** `limit`, `offset`

## GET /api/training-journal/summary

Statistik/Übersicht der Einträge.

## GET /api/training-journal/:id

Eintrag laden.

## POST /api/training-journal

Eintrag erstellen.

**Body (JSON, Auszug):**

```json
{
  "title": "Training",
  "content": "Text",
  "mood": "optional",
  "tags": ["..."],
  "workoutId": "optional"
}
```

## PUT /api/training-journal/:id

Eintrag aktualisieren.

## DELETE /api/training-journal/:id

Eintrag löschen.
