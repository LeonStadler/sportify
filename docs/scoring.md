# Punkteberechnung (Sportify)

Diese Dokumentation beschreibt, wie Sportify aktuell Punkte für Workouts berechnet, welche Eingaben verwendet werden und wie Einheiten, Zusatzgewicht und Körpergewicht berücksichtigt werden.

## Überblick (Kurzform)
1. **Übung + Mess-Typ bestimmen** (Reps / Zeit / Distanz).
2. **Menge normalisieren** (Sekunden, Kilometer, Wiederholungen).
3. **Punkte pro Einheit** aus der Übung lesen (automatisch oder manuell).
4. **Basispunkte** = `normalisierte Menge × points_per_unit`.
5. **Optionaler Personen‑Faktor** (Zusatzgewicht relativ zum Körpergewicht, gedeckelt).
6. **Endpunkte** = Basispunkte × Personen‑Faktor, auf 2 Nachkommastellen gerundet.

---

## Datenquellen

### Übung (`exercises`)
- `measurement_type`: `"reps" | "time" | "distance"`
- `supports_time`, `supports_distance`: nur UI‑Hint (nicht für Scoring)
- `points_per_unit`: numerischer Faktor je Einheit
- `points_source`: `"auto"` oder `"manual"`
- `difficulty_tier`: Schwierigkeitsgrad (1–10), für automatische Punkte

### Workout-Aktivität (`workout_activities`)
- `quantity`: Gesamtmenge
- `sets_data`: optionale Sets (Reps, Dauer, Distanz, Gewicht)
- `unit`: Einheiten‑Hint (z. B. `min`, `sec`, `km`, `miles`)
- `weight`: (max.) Zusatzgewicht (in kg, siehe unten)

---

## Schritt 1: Mess‑Typ bestimmen
Maßgeblich ist `measurement_type` der Übung.
  - `"reps"` → Wiederholungen
  - `"time"` → Zeit
  - `"distance"` → Distanz

> Hinweis: `supports_time`/`supports_distance` steuern aktuell nur die UI. Für das Scoring wird **ausschließlich** `measurement_type` verwendet. Wenn eine Übung mehrere Messarten erlaubt, sollte `measurement_type` den primären Scoring‑Typ widerspiegeln.

---

## Schritt 2: Menge normalisieren
Je nach Mess‑Typ wird die Gesamtmenge in eine Standard‑Einheit umgerechnet:

### Zeit → Sekunden
```
sec / seconds  -> Sekunden
min / minutes  -> Sekunden × 60
hour / hours   -> Sekunden × 3600
sonst          -> wird als Sekunden interpretiert
```

### Distanz → Kilometer
```
m      -> km / 1000
km     -> km
miles  -> km × 1.60934
mi     -> km × 1.60934
sonst  -> wird als km interpretiert
```

### Wiederholungen
Reps werden **nicht** umgerechnet.

### Sets
Wenn Sets vorhanden sind, wird die Gesamtmenge **aus den Sets summiert**:
- Reps: Summe aller `set.reps`
- Zeit: Summe aller `set.duration` (normiert auf Sekunden)
- Distanz: Summe aller `set.distance` (normiert auf km)
- Zusatzgewicht: **maximales** Gewicht aus allen Sets

Wenn keine Sets vorhanden sind, wird `quantity/amount` als Gesamtmenge verwendet.

---

## Schritt 3: Punkte pro Einheit (`points_per_unit`)
Die Übung hat einen festen Faktor `points_per_unit`:

### Automatisch (`points_source = "auto"`)
```
points_per_unit = baseFactor(measurement_type) × difficultyFactor(difficulty_tier)
```

**Base‑Faktoren:**
- Reps: `1`
- Zeit: `1/60` (1 Punkt pro Minute)
- Distanz: `10` (10 Punkte pro km)

**Difficulty‑Faktor:**
```
difficultyFactor = difficulty_tier / 5
```
Beispiele:
- Tier 1 → 0.2×
- Tier 5 → 1.0×
- Tier 10 → 2.0×

### Manuell (`points_source = "manual"`)
`points_per_unit` wird direkt gespeichert und verwendet.

---

## Schritt 4: Basispunkte
```
basePoints = normalizedAmount × points_per_unit
```

Wenn `basePoints <= 0` → Ergebnis ist `0`.

---

## Schritt 5: Personen‑Faktor (Zusatzgewicht + Körpergewicht)
Wird **nur für echte Workouts (nicht Templates)** angewendet und nur, wenn ein Körpergewicht vorliegt.

```
raw = 1 + (extraWeightKg / bodyWeightKg)
factor = clamp(raw, 1 - 0.2, 1 + 0.2)
```

**Ergebnis:** Faktor liegt immer zwischen **0.8 und 1.2**.

**Wenn kein Körpergewicht vorhanden** oder kein Zusatzgewicht → Faktor = 1.

---

## Endpunkte
```
points = round(basePoints × factor, 2)
```

---

## Beispiele

### 1) Reps (Liegestütze)
- `measurement_type = reps`
- `difficulty_tier = 5` → factor 1.0
- `points_per_unit = 1`
- 50 Reps → `50 × 1 = 50 Punkte`

### 2) Zeit (Plank)
- `measurement_type = time`
- `difficulty_tier = 6` → factor 1.2
- `points_per_unit = (1/60) × 1.2 = 0.02`
- 90 Sekunden → `90 × 0.02 = 1.8 Punkte`

### 3) Distanz (Laufen)
- `measurement_type = distance`
- `difficulty_tier = 4` → factor 0.8
- `points_per_unit = 10 × 0.8 = 8`
- 5 km → `5 × 8 = 40 Punkte`

### 4) Zusatzgewicht + Körpergewicht (Klimmzug)
- `measurement_type = reps`
- `points_per_unit = 1`
- 10 Reps → `base = 10`
- Körpergewicht 70 kg, Zusatzgewicht 20 kg:
  - raw = 1 + 20/70 = 1.285
  - clamp auf 1.2
  - Punkte = 10 × 1.2 = 12 Punkte

---

## Wichtige Hinweise / Grenzen
- **Nur `measurement_type` bestimmt das Scoring.**  
  Kombi‑Übungen (z. B. Zeit + Distanz) werden aktuell nur in *einem* Mess‑Typ bewertet.
- **Körpergewicht ist optional.**  
  Ohne Körpergewicht kein Bonus/Malus.
- **Zusatzgewicht basiert auf dem Maximal‑Set** (nicht Durchschnitt).

---

## Wo im Code?
- **Punkteberechnung:** `routes/workouts.routes.js`  
  (`calculateActivityScore`, `normalizeDurationToSeconds`, `normalizeDistanceToKm`)
- **Faktoren & Normalisierung:** `utils/scoring.js`
- **Automatische Punkte je Übung:** `computePointsPerUnit(...)` in `utils/scoring.js`
- **Übung anlegen:** `routes/exercises.routes.js` (setzt `points_per_unit`)
