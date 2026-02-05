# Training Journal API

Alle Endpunkte sind **auth‑geschützt**.

## GET /api/training-journal

Listet Einträge mit Filtern und Pagination.

**Query (wichtigste Felder):**

- `page`, `limit`
- `mood` (z. B. `balanced`, `energized`)
- `startDate`, `endDate` (YYYY‑MM‑DD)
- `search` (Text oder Tag)

**Response (Beispiel):**

```json
{ "entries": [ { "id": "...", "entryDate": "2025-01-01", "mood": "balanced" } ], "pagination": { "currentPage": 1, "totalPages": 3, "totalItems": 25 } }
```

**Fehlerfälle:**

- `400` ungültige Parameter
- `500` Serverfehler

## GET /api/training-journal/summary

Aggregierte Werte für Zeitraum.

**Query:** `period=week|month|quarter|year`

## GET /api/training-journal/:id

Lädt einen Eintrag.

## POST /api/training-journal

Erstellt Eintrag.

**Body (Beispiel):**

```json
{
  "entryDate": "2025-01-01",
  "mood": "balanced",
  "energyLevel": 7,
  "focusLevel": 6,
  "sleepQuality": 8,
  "sorenessLevel": 2,
  "perceivedExertion": 6,
  "notes": "Text",
  "tags": ["mobility"],
  "workoutId": "optional"
}
```

**Validierung:** Notizen max. 2000 Zeichen; Skalenwerte 1–10 (Muskelkater 0–10).

## PUT /api/training-journal/:id

Aktualisiert Eintrag (Felder wie POST).

## DELETE /api/training-journal/:id

Löscht Eintrag.

## Zulässige Moods

`energized | balanced | tired | sore | stressed | motivated | relaxed | excited | focused | frustrated`
