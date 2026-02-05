---
title: "Umfassender Plan: Übungsdatenbank & Workout-Vorlagen System"
---

# Umfassender Plan: Übungsdatenbank & Workout-Vorlagen System

## 📅 Projektübersicht

**Ziel:** Vollständige Erweiterung der Sportify-App um eine dynamische Übungsdatenbank und Workout-Vorlagen-System mit überarbeiteter Punkteberechnung.

**Priorität:** Alle Bereiche (A-D) parallel entwickeln, da sie stark miteinander verknüpft sind.

---

## 🎯 Projektziele & Erfolgskriterien

### Hauptziele
1. **Dynamische Übungsdatenbank** - Ersetzen aller hartkodierten Übungen durch benutzerdefinierte Übungen
2. **Workout-Vorlagen** - Speichern, teilen und wiederverwenden von Workout-Strukturen
3. **Intelligente Punkteberechnung** - Fairer Scoring-Algorithmus für alle Übungstypen
4. **Erweiterte Aktivitäten** - Bouldern/Klettern, Ausdauersport, Gewichtstraining

### Messbare Erfolgskriterien
- ✅ **Migration:** 100% der bestehenden Workouts funktionieren ohne Datenverlust
- ✅ **Benutzerfreundlichkeit:** Übungen können von jedem Nutzer angelegt werden
- ✅ **Deduplikation:** <5% doppelte Übungen durch intelligentes Matching
- ✅ **Performance:** <2s Ladezeit für Übungssuche mit 1000+ Übungen
- ✅ **Adoption:** 80% der Workouts nutzen mindestens eine benutzerdefinierte Übung

---

## 📊 Datenstruktur-Design

### Kernentitäten

#### 1. Übungen (exercises) - ERWEITERT
```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- Für URLs und Dedupe
    description TEXT,
    category TEXT NOT NULL, -- 'strength', 'endurance', 'climbing', 'flexibility'

    -- Einheiten & Messmethoden
    primary_unit TEXT NOT NULL, -- 'reps', 'time', 'distance', 'routes', 'holds'
    unit_config JSONB NOT NULL DEFAULT '{}', -- Flexible Einheiten-Konfiguration

    -- Gewichte & Zusatzlast
    supports_weight BOOLEAN DEFAULT false,
    supports_additional_weight BOOLEAN DEFAULT false,
    bodyweight_factor DECIMAL(3,2) DEFAULT 1.0, -- Multiplikator für Körpergewicht

    -- Punkteberechnung
    base_points DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    muscle_groups TEXT[], -- ['chest', 'shoulders', 'triceps']
    equipment TEXT[], -- ['dumbbell', 'barbell', 'pullup_bar']

    -- Metadaten
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- Moderation
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aliases für Dedupe
CREATE TABLE exercise_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exercise_id, alias)
);
```

#### 2. Workout-Vorlagen (workout_templates)
```sql
CREATE TABLE workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT,

    -- Sichtbarkeit
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Metadaten
    category TEXT, -- 'strength', 'endurance', 'climbing', 'mixed'
    estimated_duration INTEGER, -- in Minuten
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    tags TEXT[],

    -- Statistiken
    usage_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    total_ratings INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template-Übungen
CREATE TABLE workout_template_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

    -- Struktur
    order_index INTEGER NOT NULL,
    sets INTEGER,
    reps_min INTEGER,
    reps_max INTEGER,
    weight_kg DECIMAL(5,2), -- Vorgeschlagene Gewichte
    rest_seconds INTEGER,
    notes TEXT,

    -- Flexible Konfiguration
    config JSONB DEFAULT '{}', -- Zusätzliche Parameter (z.B. für Klettern)

    UNIQUE(template_id, order_index)
);
```

#### 3. Workout-Reaktionen & Bewertungen
```sql
-- Template-Bewertungen
CREATE TABLE workout_template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(template_id, user_id)
);

-- Template-Nutzungen tracken
CREATE TABLE workout_template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. Erweiterte Punkteberechnung
```sql
-- Übung-spezifische Punktefaktoren
CREATE TABLE exercise_scoring_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

    -- Basis-Scoring
    base_points_per_unit DECIMAL(5,2) NOT NULL,
    difficulty_multiplier DECIMAL(3,2) DEFAULT 1.0,

    -- Fortgeschrittene Faktoren (später)
    bodyweight_factor DECIMAL(3,2) DEFAULT 1.0,
    time_factor DECIMAL(3,2) DEFAULT 1.0,
    intensity_factor DECIMAL(3,2) DEFAULT 1.0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individuelle Nutzer-Performance für dynamisches Scoring
CREATE TABLE user_exercise_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

    -- Performance-Metriken
    avg_weight_kg DECIMAL(5,2),
    avg_reps DECIMAL(5,2),
    avg_time_seconds INTEGER,
    personal_record DECIMAL(8,2), -- Höchstwert je nach Einheit

    -- Statistiken
    total_sessions INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, exercise_id)
);
```

---

## 🏗️ Architektur & Implementierung

### Backend-API Erweiterungen

#### 1. Übungs-Management API (`/api/exercises/`)
```javascript
// GET /api/exercises - Suche mit Filtern
{
  exercises: [...],
  pagination: {...},
  facets: {
    categories: [...],
    muscle_groups: [...],
    equipment: [...]
  }
}

// POST /api/exercises - Neue Übung vorschlagen
{
  name: "Deadlift",
  category: "strength",
  supports_weight: true,
  muscle_groups: ["back", "legs", "core"]
}

// PUT /api/exercises/:id/approve - Admin-Approval
// DELETE /api/exercises/:id/merge - Übungen zusammenführen
```

#### 2. Workout-Templates API (`/api/workout-templates/`)
```javascript
// GET /api/workout-templates - Templates mit Filtern
{
  templates: [...],
  pagination: {...},
  filters: {
    visibility: "public",
    category: "strength",
    difficulty: "intermediate"
  }
}

// POST /api/workout-templates - Template erstellen
{
  title: "Upper Body Strength",
  visibility: "public",
  exercises: [
    {
      exercise_id: "...",
      sets: 4,
      reps_min: 8,
      reps_max: 12,
      weight_kg: 80
    }
  ]
}

// POST /api/workout-templates/:id/use - Template verwenden
```

#### 3. Erweiterte Punkteberechnung
```javascript
// Service: scoringService.js
class ScoringService {
  async calculatePoints(activity, userId) {
    const exercise = await this.getExercise(activity.exercise_id);
    const userPerf = await this.getUserPerformance(userId, activity.exercise_id);

    let points = exercise.base_points_per_unit * activity.amount;

    // Zusatzgewicht-Faktor
    if (activity.weight_kg && activity.weight_kg > 0) {
      const bodyweight = await this.getUserBodyweight(userId);
      points *= (bodyweight + activity.weight_kg) / bodyweight;
    }

    // Schwierigkeits-Multiplikator
    points *= exercise.difficulty_multiplier;

    // Performance-basierte Anpassung (später)
    if (userPerf && activity.amount > userPerf.avg_reps) {
      points *= 1.2; // Bonus für persönliche Bestleistung
    }

    return Math.round(points);
  }
}
```

### Frontend-Komponenten

#### 1. Übungsverwaltung
```
src/components/exercises/
├── ExerciseSearch.tsx         # Suchkomponente mit Filtern
├── ExerciseForm.tsx           # Übung erstellen/bearbeiten
├── ExerciseCard.tsx           # Übungsvorschau
├── ExerciseModeration.tsx     # Admin-Interface
└── ExerciseSelector.tsx       # Dropdown für Workout-Form
```

#### 2. Workout-Templates
```
src/components/workouts/
├── TemplateBrowser.tsx        # Template-Übersicht
├── TemplateCreator.tsx        # Template erstellen
├── TemplateCard.tsx           # Template-Vorschau
├── TemplateUsage.tsx          # Template verwenden
└── TemplateRating.tsx         # Bewertungssystem
```

#### 3. Erweiterte Workout-Form
```typescript
interface ExerciseSelectorProps {
  onExerciseSelect: (exercise: Exercise) => void;
  filters?: {
    category?: string;
    supports_weight?: boolean;
    muscle_groups?: string[];
  };
  showSearch?: boolean;
  placeholder?: string;
}
```

---

## 🔄 Migrationsstrategie

### Phase 1: Datenbank-Migration
1. **Backup erstellen** aller relevanten Tabellen
2. **Exercises-Tabelle erweitern** mit neuen Spalten
3. **Workout-Templates-Tabelle erstellen**
4. **Performance-Tabellen erstellen**

### Phase 2: Daten-Migration
```sql
-- Bestehende Übungen migrieren
INSERT INTO exercises (id, name, slug, category, primary_unit, unit_config, base_points, difficulty_level, is_approved, created_at, updated_at)
SELECT
    id::uuid,
    name,
    LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'ä', 'ae'), 'ö', 'oe')),
    CASE
        WHEN id IN ('pullups', 'pushups', 'situps') THEN 'strength'
        WHEN id IN ('running', 'cycling') THEN 'endurance'
        ELSE 'strength'
    END,
    CASE
        WHEN id IN ('running', 'cycling') THEN 'distance'
        ELSE 'reps'
    END,
    CASE
        WHEN id IN ('running', 'cycling') THEN '{"units": [{"value": "km", "multiplier": 1}]}'
        ELSE '{"units": [{"value": "repetitions", "multiplier": 1}]}'
    END,
    points_per_unit,
    CASE
        WHEN id = 'pullups' THEN 4
        WHEN id = 'pushups' THEN 1
        WHEN id = 'situps' THEN 1
        WHEN id = 'running' THEN 2
        WHEN id = 'cycling' THEN 1
        ELSE 1
    END,
    true,
    created_at,
    updated_at
FROM exercises_legacy;
```

### Phase 3: Code-Migration
1. **WorkoutForm.tsx** - ExerciseSelector integrieren
2. **Training.tsx** - Dynamische Filter aktualisieren
3. **Dashboard** - Neue Übungstypen unterstützen
4. **API-Routen** - Neue Endpoints hinzufügen

---

## 🎨 UI/UX Design

### Übungssuche & -auswahl
- **Combobox** mit Autocomplete und Kategorien-Filtern
- **Vorschau-Karten** mit Bildern/Icons, Schwierigkeitsgrad, Muskelgruppen
- **Schnellfilter**: "Meine Übungen", "Beliebt", "Nach Muskelgruppe"

### Workout-Template Browser
- **Grid-Layout** mit Template-Karten
- **Filter-Sidebar**: Kategorie, Schwierigkeit, Dauer, Bewertung
- **Template-Detailansicht** mit Übungsliste und Anweisungen

### Punkteberechnung Transparenz
- **Hover-Tooltips** zeigen Berechnung: "10 Pull-ups × 3 Punkte × 1.2 Schwierigkeit = 36 Punkte"
- **Persönliche Benchmarks** im Profil: "Dein Durchschnitt: 25 Pull-ups"

---

## 🔒 Sicherheit & Moderation

### Content-Moderation
- **Automatische Dedupe** bei Übungserstellung
- **Admin-Review** für neue Übungen
- **Community-Reporting** für unangemessene Inhalte

### API-Sicherheit
- **Rate-Limiting** für Übungserstellung (max 10/Tag pro User)
- **Input-Validation** mit Zod-Schemas
- **SQL-Injection-Schutz** durch Prepared Statements

---

## 📈 Performance-Optimierung

### Datenbank-Indizes
```sql
CREATE INDEX idx_exercises_search ON exercises USING GIN (to_tsvector('german', name || ' ' || description));
CREATE INDEX idx_exercises_category_active ON exercises (category, is_active);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN (muscle_groups);
CREATE INDEX idx_workout_templates_visibility ON workout_templates (visibility, updated_at DESC);
CREATE INDEX idx_workout_templates_category ON workout_templates (category);
```

### Caching-Strategie
- **Redis** für häufige Übungssuchen
- **Browser-Cache** für Exercise-Listen
- **CDN** für Exercise-Icons/Bilder

### Lazy-Loading
- **Virtualisierung** für lange Übungslisten
- **Pagination** für Template-Browser
- **On-Demand Loading** für Exercise-Details

---

## 🧪 Testing-Strategie

### Unit-Tests
```javascript
// scoringService.test.js
describe('ScoringService', () => {
  test('calculates points correctly for weighted exercises', async () => {
    const activity = { exercise_id: 'deadlift', weight_kg: 100, reps: 5 };
    const points = await scoringService.calculatePoints(activity, userId);
    expect(points).toBeGreaterThan(50); // Gewichtete Übung sollte mehr Punkte geben
  });
});
```

### Integration-Tests
- **Template-Erstellung** → **Verwendung** → **Workout-Erstellung**
- **Übungssuche** → **Filter** → **Auswahl**
- **Punkteberechnung** → **Dashboard-Update** → **Leaderboard**

### E2E-Tests
- **Vollständiger Workout-Flow**: Übung suchen → Template erstellen → Workout durchführen
- **Moderation-Workflow**: Übung vorschlagen → Admin genehmigen → In Workout verwenden

---

## 🚀 Rollout-Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Datenbank-Schema erweitern
- [ ] Grundlegende API-Endpunkte implementieren
- [ ] ExerciseSelector Komponente erstellen

### Phase 2: Core Features (Week 3-4)
- [ ] Workout-Templates implementieren
- [ ] Neue Punkteberechnung integrieren
- [ ] UI-Komponenten fertigstellen

### Phase 3: Advanced Features (Week 5-6)
- [ ] Bouldern/Klettern-Unterstützung
- [ ] Performance-Tracking für dynamisches Scoring
- [ ] Moderationssystem

### Phase 4: Polish & Launch (Week 7-8)
- [ ] Migration der bestehenden Daten
- [ ] Performance-Optimierung
- [ ] User-Testing & Bugfixes

---

## 📋 Risiken & Mitigation

### Technische Risiken
- **Datenverlust bei Migration**: Vollständige Backups + Rollback-Scripts
- **Performance-Einbruch**: Indizes + Caching + Monitoring
- **API-Kompatibilität**: Versionierte API + Feature-Flags

### Geschäftsrisiken
- **User Adoption**: Intuitive UI + Onboarding-Flows
- **Content Quality**: Moderationssystem + Community-Guidelines
- **Feature Complexity**: Progressive Disclosure + Defaults

---

## 🎯 KPIs & Monitoring

### Technische Metriken
- **API Response Times**: <500ms für Exercise-Suche
- **Database Query Performance**: <100ms für komplexe Joins
- **Error Rates**: <1% für neue Features

### Business Metriken
- **User Engagement**: +20% täglich aktive Nutzer
- **Content Creation**: +50% neue Übungen/Monat
- **Template Usage**: 30% der Workouts basieren auf Templates

### Qualitätsmetriken
- **Code Coverage**: >85% für neue Features
- **User Satisfaction**: >4.0/5.0 in Post-Launch Survey
- **Bug Reports**: <10 kritische Issues im ersten Monat

---

*Dieser Plan ist umfassend und skalierbar. Die Priorisierung kann angepasst werden basierend auf User-Feedback und technischen Herausforderungen.*