---
title: "Analyse: Integration des dynamischen Übungssystems"
---

# Analyse: Integration des dynamischen Übungssystems

## Aktueller Stand

### Hardcodierte Übungstypen
1. **WorkoutForm.tsx** - Array `exerciseTypes` mit fixen Übungen
2. **Training.tsx** - Array `exerciseTypes` für Filter
3. **Dashboard.tsx** - Hardcodierte Activity-Typen (pullups, pushups, running, cycling)
4. **ActivityFeed.tsx** - Hardcodierte Switch-Cases für Activity-Namen und Icons
5. **ScoreboardTable.tsx** - Vermutlich auch hardcodierte Typen

### User-Präferenzen (bereits vorhanden)
- `user.preferences.units.distance`: 'km' | 'm' | 'miles' | 'yards'
- `user.preferences.units.weight`: 'kg' | 'lbs' | 'stone'
- `user.preferences.units.temperature`: 'celsius' | 'fahrenheit'

### Datenbank-Struktur (bereits vorhanden)
- Tabelle `exercises` mit:
  - `id`, `name`, `points_per_unit`, `unit`
  - `has_weight`, `has_set_mode`
  - `unit_options` (JSONB)
  - `is_active`

## Anforderungen

### Übungstyp-Kategorien

1. **Wiederholungsübungen** (repetitions)
   - Klimmzüge, Liegestütze, Sit-ups
   - Einheit: Immer "Wiederholungen"
   - Keine User-Präferenz nötig

2. **Strecke** (distance)
   - Laufen, Radfahren
   - Einheit: Basierend auf User-Präferenz (km/m/miles/yards)
   - Standard: km
   - Konvertierung nötig wenn gespeichert vs. angezeigt

3. **Zeit** (time) - zukünftig
   - Einheit: Minuten, Stunden
   - Noch nicht implementiert

4. **Zeit + Strecke** (distance+time)
   - Radfahren, Laufen mit Pace
   - Kombiniert beide Einheiten
   - Noch nicht implementiert

## Implementierungsplan

### Phase 1: Backend API für Übungen

**Datei: `routes/workouts.routes.js`**
- Endpunkt `GET /api/workouts/exercises` hinzufügen
- Gibt alle aktiven Übungen zurück
- Parse `unit_options` aus JSONB
- Öffentlicher Endpunkt (authMiddleware, aber kein Admin)

### Phase 2: Übungstyp-Kategorisierung

**Neue Datenbank-Spalte oder Erweiterung:**
- `exercise_category`: 'repetitions' | 'distance' | 'time' | 'distance+time'
- Oder aus `unit_options` ableiten: Wenn nur "Wiederholungen" → repetitions, sonst distance

**Migration hinzufügen:**
```sql
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS exercise_category VARCHAR(20);
UPDATE exercises SET exercise_category = 
  CASE 
    WHEN unit = 'Wiederholungen' OR unit = 'Einheiten' THEN 'repetitions'
    WHEN unit = 'km' OR unit = 'm' OR unit = 'Meilen' THEN 'distance'
    ELSE 'repetitions'
  END;
```

### Phase 3: Unit-Options dynamisch generieren

**Helper-Funktion erstellen:**
```typescript
// src/lib/exerciseUtils.ts
function getUnitOptionsForExercise(
  exercise: Exercise, 
  userPreferences: User['preferences']
): UnitOption[] {
  if (exercise.exerciseCategory === 'distance') {
    const preferred = userPreferences?.units?.distance || 'km';
    // Generiere Options basierend auf Präferenz
    return [
      { value: preferred, label: getDistanceLabel(preferred), multiplier: 1 },
      // ... weitere Optionen
    ];
  }
  // Für Wiederholungsübungen: Immer aus DB unit_options
  return exercise.unitOptions || [];
}
```

### Phase 4: Frontend-Komponenten anpassen

#### 4.1 WorkoutForm.tsx
- **Entfernen:** Hardcodiertes `exerciseTypes` Array
- **Hinzufügen:** 
  - `useState` für `exercises` Array
  - `useEffect` zum Laden von `/api/workouts/exercises`
  - `getUnitOptionsForExercise()` verwenden
  - User-Präferenzen berücksichtigen bei Strecken-Übungen

#### 4.2 Training.tsx
- **Entfernen:** Hardcodiertes `exerciseTypes` Array
- **Hinzufügen:** 
  - Load exercises from API
  - Dynamische Filter-Generierung

#### 4.3 Dashboard.tsx
- **Anpassen:** Stats-Loading soll dynamisch sein
- **Hinzufügen:** Exercise-Metadaten für Activity-Namen/Icons

#### 4.4 ActivityFeed.tsx
- **Entfernen:** Hardcodierte Switch-Cases
- **Hinzufügen:** Exercise-Lookup für Namen/Icons/Units

#### 4.5 ScoreboardTable.tsx
- **Anpassen:** Dynamische Activity-Typen
- **Hinzufügen:** Exercise-Lookup

#### 4.6 Neuer Hook: `useExercises()`
```typescript
// src/hooks/useExercises.ts
export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    loadExercises();
  }, []);
  
  const getUnitOptions = (exerciseId: string) => {
    // ...
  };
  
  return { exercises, getUnitOptions, getExerciseById, ... };
}
```

### Phase 5: Konvertierung von Einheiten

**Problem:** User speichert in seiner Präferenz, aber andere User sehen vielleicht andere Einheiten

**Lösung:**
- **Immer in Standard-Einheit speichern** (km für Distanz, Wiederholungen für Reps)
- **Beim Anzeigen konvertieren** basierend auf:
  - Eigene Ansicht: User-Präferenz
  - Andere User: Standard oder deren Präferenz

**Helper-Funktion:**
```typescript
function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  exerciseCategory: string
): number {
  if (exerciseCategory === 'distance') {
    // Konvertierung zwischen km, m, miles, yards
    const conversions = {
      'km': 1,
      'm': 0.001,
      'miles': 1.60934,
      'yards': 0.0009144
    };
    return value * (conversions[fromUnit] || 1) / (conversions[toUnit] || 1);
  }
  return value; // Keine Konvertierung für Wiederholungen
}
```

### Phase 6: Migration bestehender Daten

- Alte Workouts haben `unit` im `workout_activities` Tabelle
- Diese müssen eventuell konvertiert werden
- Oder beim Laden konvertieren

## Betroffene Dateien

### Backend
- ✅ `routes/workouts.routes.js` - GET /exercises Endpunkt
- ✅ `migration.sql` - exercise_category Spalte

### Frontend Core
- `src/components/WorkoutForm.tsx` - Hauptformular
- `src/pages/Training.tsx` - Training-Übersicht
- `src/pages/Dashboard.tsx` - Dashboard Stats
- `src/components/ActivityFeed.tsx` - Activity Feed
- `src/components/ScoreboardTable.tsx` - Scoreboard
- `src/pages/Scoreboard.tsx` - Scoreboard Page
- `src/pages/Stats.tsx` - Statistiken (falls vorhanden)

### Neue Dateien
- `src/hooks/useExercises.ts` - Custom Hook für Übungen
- `src/lib/exerciseUtils.ts` - Helper-Funktionen
- `src/types/exercise.ts` - TypeScript Interfaces

### Admin (bereits vorhanden)
- `src/pages/Admin.tsx` - Wertung Tab

## Schritt-für-Schritt Umsetzung

1. ✅ Backend: GET /api/workouts/exercises Endpunkt
2. ✅ Migration: exercise_category hinzufügen
3. Frontend: useExercises Hook erstellen
4. Frontend: exerciseUtils Helper-Funktionen
5. Frontend: WorkoutForm.tsx anpassen
6. Frontend: Training.tsx anpassen
7. Frontend: Dashboard.tsx anpassen
8. Frontend: ActivityFeed.tsx anpassen
9. Frontend: ScoreboardTable.tsx anpassen
10. Testing: Alle Komponenten testen

## Wichtige Überlegungen

### Einheiten-Konvertierung
- **Speichern:** Immer in Standard (km, Wiederholungen)
- **Anzeigen:** Basierend auf User-Präferenz
- **Bei der Eingabe:** User kann in seiner Präferenz eingeben, wird konvertiert

### Performance
- Übungen einmal beim App-Start laden (Context/Provider)
- Oder pro Komponente cachen
- Nicht bei jedem Render neu laden

### Kompatibilität
- Legacy-Übungen unterstützen (Fallback)
- Alte Workouts müssen weiterhin funktionieren

