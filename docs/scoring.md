# Punkteberechnung (Sportify)

Diese Dokumentation beschreibt die aktuelle Punkteberechnung basierend auf dem Code in `utils/scoring.js` und der Workout‑Logik.

## Überblick

1. **Mess‑Typ bestimmen** (`reps`, `time`, `distance`).
2. **Menge normalisieren** (Sekunden, Kilometer).
3. **Punkte‑Faktor** aus Übung ableiten (`points_per_unit`).
4. **Basispunkte** = normalisierte Menge × `points_per_unit`.
5. **Optionaler Personen‑Faktor** (Zusatzgewicht relativ zu Körpergewicht).

## Datenquellen

### Übung (`exercises`)

- `measurement_type`: `reps | time | distance`
- `points_per_unit`: fixer Faktor
- `points_source`: `auto` oder `manual`
- `difficulty_tier`: 1–10

### Workout‑Aktivität (`workout_activities`)

- `quantity` (aktuell) / `amount` (Legacy)
- `sets_data` (Sets mit Reps/Dauer/Distanz/Weight)
- `unit` (z. B. `min`, `sec`, `km`, `miles`)
- `weight` bzw. Set‑Gewicht

## Normalisierung

### Zeit → Sekunden

- `sec` / `seconds` → Sekunden
- `min` / `minutes` → Sekunden × 60
- `hour` / `hours` → Sekunden × 3600
- unbekannt → Sekunden

### Distanz → Kilometer

- `m` → km / 1000
- `km` → km
- `miles` / `mi` → km × 1.60934
- unbekannt → km

### Sets

Falls Sets vorhanden sind, wird die **Gesamtmenge** aus Sets summiert:

- Reps: Summe aller `set.reps`
- Zeit: Summe aller `set.duration` (normalisiert)
- Distanz: Summe aller `set.distance` (normalisiert)

## Punkte pro Einheit (`points_per_unit`)

Wenn `points_source = auto`, wird der Faktor aus Mess‑Typ und `difficulty_tier` berechnet:

- Reps: `1`
- Zeit: `1/60` (Punkte pro Sekunde = 1 Punkt pro Minute)
- Distanz: `10` (Punkte pro km)

`difficulty_factor = difficulty_tier / 5` (Tier 1 → 0.2, Tier 10 → 2.0)

`points_per_unit = base × difficulty_factor`

Wenn `points_source = manual`, wird der gespeicherte Wert genutzt.

## Personen‑Faktor (Zusatzgewicht)

Optionaler Multiplikator, wenn Körpergewicht **und** Zusatzgewicht vorhanden sind.

```
raw = 1 + (extraWeightKg / bodyWeightKg)
clamp(raw, 1 - 0.2, 1 + 0.2)
```

Ergebnis liegt immer zwischen **0.8** und **1.2**.

## Hinweise

- Der Personen‑Faktor wird nur angewendet, wenn Gewichtsdaten vorhanden sind.
- Templates erhalten keine Gewichtsanpassung (nur echte Workouts).
