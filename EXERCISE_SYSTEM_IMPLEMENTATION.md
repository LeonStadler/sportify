# Implementierungsplan: Vollständig dynamisches Übungssystem

## Strategische Entscheidung

✅ **Vollständig dynamisches System mit Datenbank**
- Alle Übungen in der Datenbank
- Nutzer können eigene Übungen erstellen
- Vorbereitung für Übungs- und Workout-Bibliothek

## Architektur-Überlegungen

### Datenmodell-Erweiterungen

#### 1. Exercises Tabelle (erweitern)
```sql
CREATE TABLE exercises (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,                    -- Neu: Beschreibung
    points_per_unit DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    exercise_category VARCHAR(20),       -- Neu: 'repetitions' | 'distance' | 'time' | 'distance+time'
    has_weight BOOLEAN DEFAULT false,
    has_set_mode BOOLEAN DEFAULT true,
    unit_options JSONB DEFAULT '[]'::jsonb,
    icon_emoji TEXT,                     -- Neu: Emoji für Darstellung
    color_class TEXT,                    -- Neu: CSS-Farbklasse
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,    -- Neu: System-Übung (nicht löschbar)
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- Neu: Ersteller
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2. Neue Tabelle: user_exercises
```sql
CREATE TABLE user_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id VARCHAR(50) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    custom_points_per_unit DECIMAL(10, 2),  -- Optional: Nutzer-spezifische Punkte
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);
```

#### 3. Neue Tabelle: exercise_library (zukünftig)
```sql
CREATE TABLE exercise_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id VARCHAR(50) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    category TEXT,                         -- z.B. 'strength', 'cardio', 'flexibility'
    difficulty TEXT,                       -- 'beginner', 'intermediate', 'advanced'
    muscle_groups TEXT[],                  -- ['chest', 'back', 'legs']
    equipment_needed TEXT[],              -- ['none', 'dumbbells', 'barbell']
    instructions TEXT,                    -- Anleitung
    video_url TEXT,                       -- Video-Link
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. Neue Tabelle: workout_templates (zukünftig)
```sql
CREATE TABLE workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    difficulty TEXT,
    duration_minutes INTEGER,
    exercises JSONB NOT NULL,            -- Array von Übungen mit Sets/Reps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Implementierungs-Phasen

### Phase 1: Datenbank-Migration (Sofort)

**Datei: `migration.sql`**

```sql
-- Erweitere exercises Tabelle
ALTER TABLE exercises 
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS exercise_category VARCHAR(20),
    ADD COLUMN IF NOT EXISTS icon_emoji TEXT,
    ADD COLUMN IF NOT EXISTS color_class TEXT,
    ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Update bestehende Übungen
UPDATE exercises SET 
    exercise_category = CASE 
        WHEN unit = 'Wiederholungen' OR unit = 'Einheiten' THEN 'repetitions'
        WHEN unit = 'km' OR unit = 'm' OR unit LIKE '%Meil%' THEN 'distance'
        ELSE 'repetitions'
    END,
    icon_emoji = CASE id
        WHEN 'pullups' THEN '💪'
        WHEN 'pushups' THEN '🔥'
        WHEN 'situps' THEN '🚀'
        WHEN 'running' THEN '🏃'
        WHEN 'cycling' THEN '🚴'
        WHEN 'other' THEN '🔗'
        ELSE '💪'
    END,
    color_class = CASE id
        WHEN 'pullups' THEN 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        WHEN 'pushups' THEN 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        WHEN 'situps' THEN 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
        WHEN 'running' THEN 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        WHEN 'cycling' THEN 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
        ELSE 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    END,
    is_system = true;

-- User Exercises Tabelle
CREATE TABLE IF NOT EXISTS user_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id VARCHAR(50) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    custom_points_per_unit DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_user_exercises_user_id ON user_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercises_exercise_id ON user_exercises(exercise_id);
```

### Phase 2: Backend API Endpunkte

**Datei: `routes/exercises.routes.js` (NEU)**

```javascript
export const createExercisesRouter = (pool) => {
    const router = express.Router();

    // GET /api/exercises - Öffentliche Übungen (aktive System-Übungen)
    router.get('/', authMiddleware, async (req, res) => {
        // System-Übungen + User-eigene Übungen
    });

    // GET /api/exercises/:id - Einzelne Übung
    router.get('/:id', authMiddleware, async (req, res) => {
        // Übung mit Details
    });

    // POST /api/exercises - Nutzer erstellt eigene Übung
    router.post('/', authMiddleware, async (req, res) => {
        // Neue Übung erstellen
        // created_by = req.user.id
        // is_system = false
    });

    // PUT /api/exercises/:id - Übung aktualisieren (nur eigene)
    router.put('/:id', authMiddleware, async (req, res) => {
        // Nur wenn created_by = req.user.id
    });

    // DELETE /api/exercises/:id - Übung löschen (nur eigene)
    router.delete('/:id', authMiddleware, async (req, res) => {
        // Nur wenn created_by = req.user.id && is_system = false
    });

    // POST /api/exercises/:id/favorite - Zu Favoriten hinzufügen
    router.post('/:id/favorite', authMiddleware, async (req, res) => {
        // In user_exercises eintragen
    });

    return router;
};
```

**Datei: `routes/workouts.routes.js` (Erweitern)**
- GET /api/workouts/exercises bleibt für Kompatibilität
- Oder Redirect zu /api/exercises

### Phase 3: Frontend Core Libraries

**Datei: `src/types/exercise.ts` (NEU)**
```typescript
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  pointsPerUnit: number;
  unit: string;
  exerciseCategory: 'repetitions' | 'distance' | 'time' | 'distance+time';
  hasWeight: boolean;
  hasSetMode: boolean;
  unitOptions: Array<{
    value: string;
    label: string;
    multiplier: number;
  }>;
  iconEmoji?: string;
  colorClass?: string;
  isActive: boolean;
  isSystem: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserExercise extends Exercise {
  isFavorite?: boolean;
  customPointsPerUnit?: number;
}
```

**Datei: `src/lib/exerciseUtils.ts` (NEU)**
```typescript
import { Exercise, User } from '@/types';

export function getUnitOptionsForExercise(
  exercise: Exercise,
  userPreferences?: User['preferences']
): Array<{ value: string; label: string; multiplier: number }> {
  
  if (exercise.exerciseCategory === 'distance') {
    const preferred = userPreferences?.units?.distance || 'km';
    const options = {
      'km': { label: 'Kilometer', multiplier: 1 },
      'm': { label: 'Meter', multiplier: 0.001 },
      'miles': { label: 'Meilen', multiplier: 1.60934 },
      'yards': { label: 'Yards', multiplier: 0.0009144 }
    };
    
    // Preferred zuerst
    const sorted = [
      { value: preferred, ...options[preferred] },
      ...Object.entries(options)
        .filter(([key]) => key !== preferred)
        .map(([value, data]) => ({ value, ...data }))
    ];
    
    return sorted;
  }
  
  // Für Wiederholungsübungen: Aus DB unit_options
  return exercise.unitOptions || [{ value: 'Wiederholungen', label: 'Wiederholungen', multiplier: 1 }];
}

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: string
): number {
  if (category !== 'distance') return value;
  
  const conversions: Record<string, number> = {
    'km': 1,
    'm': 0.001,
    'miles': 1.60934,
    'yards': 0.0009144,
    'Meilen': 1.60934
  };
  
  const fromMultiplier = conversions[fromUnit] || 1;
  const toMultiplier = conversions[toUnit] || 1;
  
  return (value * fromMultiplier) / toMultiplier;
}

export function getExerciseIcon(exercise: Exercise): string {
  return exercise.iconEmoji || '💪';
}

export function getExerciseColor(exercise: Exercise): string {
  return exercise.colorClass || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}
```

**Datei: `src/hooks/useExercises.ts` (NEU)**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/api';
import { Exercise, UserExercise } from '@/types/exercise';

export function useExercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [userExercises, setUserExercises] = useState<UserExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/exercises`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load exercises');
      
      const data = await response.json();
      setExercises(data.exercises || []);
      setUserExercises(data.userExercises || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadExercises();
    }
  }, [user, loadExercises]);

  const createExercise = async (exerciseData: Partial<Exercise>) => {
    // ...
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    // ...
  };

  const deleteExercise = async (id: string) => {
    // ...
  };

  const toggleFavorite = async (id: string) => {
    // ...
  };

  const getAllExercises = () => {
    return [...exercises, ...userExercises];
  };

  const getExerciseById = (id: string): Exercise | undefined => {
    return getAllExercises().find(ex => ex.id === id);
  };

  return {
    exercises,
    userExercises,
    allExercises: getAllExercises(),
    isLoading,
    error,
    loadExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    toggleFavorite,
    getExerciseById
  };
}
```

### Phase 4: Frontend Komponenten

**WorkoutForm.tsx - Anpassung**
```typescript
import { useExercises } from '@/hooks/useExercises';
import { getUnitOptionsForExercise } from '@/lib/exerciseUtils';

export function WorkoutForm({ ... }) {
  const { allExercises, isLoading: exercisesLoading } = useExercises();
  const { user } = useAuth();

  // Statt hardcodiertem exerciseTypes:
  const availableExercises = allExercises.filter(ex => ex.isActive);

  // Bei Übungswahl:
  const exercise = availableExercises.find(ex => ex.id === activity.activityType);
  const unitOptions = exercise 
    ? getUnitOptionsForExercise(exercise, user?.preferences)
    : [];
}
```

**Training.tsx - Anpassung**
```typescript
import { useExercises } from '@/hooks/useExercises';

export function Training() {
  const { allExercises } = useExercises();
  
  // Dynamische Filter-Optionen
  const exerciseTypes = [
    { id: "all", name: "Alle Übungen" },
    ...allExercises
      .filter(ex => ex.isActive)
      .map(ex => ({ id: ex.id, name: ex.name }))
  ];
}
```

**ActivityFeed.tsx, Dashboard.tsx, etc. - Anpassung**
```typescript
import { useExercises } from '@/hooks/useExercises';
import { getExerciseIcon, getExerciseColor } from '@/lib/exerciseUtils';

// Statt Switch-Cases:
const exercise = getExerciseById(activityType);
const icon = exercise ? getExerciseIcon(exercise) : '💪';
const color = exercise ? getExerciseColor(exercise) : 'bg-gray-100';
const name = exercise ? exercise.name : activityType;
```

### Phase 5: Nutzer-Übungen erstellen (UI)

**Neue Komponente: `src/components/CreateExerciseDialog.tsx`**
- Modal/Dialog zum Erstellen eigener Übungen
- Formular ähnlich Admin-Panel
- Validierung
- In WorkoutForm integrieren

### Phase 6: Performance & Caching

**Context Provider für Exercises:**
```typescript
// src/contexts/ExercisesContext.tsx
export const ExercisesProvider = ({ children }) => {
  // Globaler State für alle Übungen
  // Wird einmal beim App-Start geladen
  // Alle Komponenten teilen sich diesen State
};
```

## Migration bestehender Daten

### Alte Workouts
- Alte `workout_activities` haben `activity_type` als String
- Diese müssen weiterhin funktionieren
- Fallback: Wenn Übung nicht gefunden → Anzeige mit ID/Name

### Kompatibilität
```typescript
function getExerciseName(activityType: string, exercises: Exercise[]): string {
  const exercise = exercises.find(ex => ex.id === activityType);
  return exercise?.name || activityType;
}
```

## Roadmap für zukünftige Features

### Übungsbibliothek (Phase 7)
- Kategorisierung (Kraft, Cardio, etc.)
- Schwierigkeitsgrad
- Muskelgruppen
- Equipment
- Video-Anleitungen
- Nutzer können Übungen aus Bibliothek zu ihren Favoriten hinzufügen

### Workout-Bibliothek (Phase 8)
- Vorgefertigte Trainingspläne
- Erstellt von Admins oder Nutzern
- Öffentlich oder privat
- Nutzer können Templates als Workout übernehmen
- Anpassung möglich

## Zusammenfassung

✅ **Vollständig dynamisch:**
- Alle Übungen in DB
- Nutzer können eigene erstellen
- Skalierbar für Bibliotheken
- Einheitliche Architektur

✅ **Vorteile:**
- Flexibilität
- Skalierbarkeit
- User-Experience
- Wartbarkeit

✅ **Implementierung:**
- Schrittweise (6 Phasen)
- Rückwärtskompatibel
- Performance-optimiert

