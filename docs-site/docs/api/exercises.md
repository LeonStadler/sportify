---
title: "Exercises API"
---

# Exercises API

Übungsdatenbank und Favoriten.

## GET /api/exercises

Listet Übungen mit Filtern.

**Auth:** erforderlich

**Query (Auszug):**

- `limit`, `offset`
- `query` (Name/Slug)
- `category`, `discipline`, `movementPattern`
- `measurementType` (reps|time|distance)
- `measurementTypes` (CSV)
- `muscleGroup`, `muscleGroups` (CSV)
- `equipment`
- `requiresWeight` (yes|no)
- `status`
- `difficultyMin`, `difficultyMax`
- `sortBy` (name|category|discipline|measurement|weight|difficulty|newest)
- `sortDirection` (asc|desc)
- `includeMeta` (true|false) – Favoriten + Nutzungsstatistiken

**Antwort (200):**

```json
{
  "data": [ { "id": "...", "name": "..." } ],
  "meta": {
    "totalItems": 123,
    "facets": { "categories": [], "muscleGroups": [], "equipment": [] }
  }
}
```

## GET /api/exercises/:id

Lädt eine Übung.

**Auth:** erforderlich

## GET /api/exercises/favorites/list

Listet Favoriten des Users.

**Auth:** erforderlich

## POST /api/exercises/:id/favorite

Toggle Favorit (setzt oder entfernt).

**Auth:** erforderlich

## POST /api/exercises

Erstellt einen Übungs‑Vorschlag (Edit/Neue Übung).

**Auth:** erforderlich

**Body (JSON, Auszug):**

```json
{
  "name": "Neue Übung",
  "category": "optional",
  "discipline": "optional",
  "movementPattern": "optional",
  "measurementType": "reps|time|distance",
  "requiresWeight": false,
  "muscleGroups": ["chest"],
  "equipment": ["dumbbell"],
  "notes": "optional"
}
```

## POST /api/exercises/:id/report

Meldet eine Übung (Fehler, Duplikat, etc.).

**Auth:** erforderlich

**Body (JSON):**

```json
{ "reason": "Text" }
```

## POST /api/exercises/:id/edit-request

Stellt einen Änderungsantrag für eine Übung.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "changes": { "name": "...", "measurementType": "reps" }, "notes": "optional" }
```
