# Datenbank

Diese Dokumentation beschreibt das Datenbank-Schema, Migrationen und Datenmodell von Sportify.

## Datenbank-System

- **Typ**: PostgreSQL
- **Hosting**: Neon (kann auch lokal oder andere PostgreSQL-Instanzen sein)
- **SSL**: Optional, konfigurierbar über Umgebungsvariablen

## Schema-Übersicht

### Haupttabellen

#### users

Benutzer-Daten und Authentifizierung.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    display_preference TEXT DEFAULT 'firstName',
    is_email_verified BOOLEAN DEFAULT false,
    has_2fa BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    avatar TEXT,
    preferences JSONB DEFAULT '{}',
    language_preference VARCHAR(5) DEFAULT 'de',
    weekly_goals JSONB DEFAULT '{}',
    -- ... weitere Spalten
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### workouts

Workout-Einträge.

```sql
CREATE TABLE workouts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### workout_activities

Aktivitäten innerhalb eines Workouts.

```sql
CREATE TABLE workout_activities (
    id UUID PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    unit TEXT NOT NULL,
    unit_value DECIMAL(10, 2) NOT NULL,
    sets_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### exercises

Übungstypen und Konfiguration.

```sql
CREATE TABLE exercises (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    points_per_unit DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    has_weight BOOLEAN DEFAULT false,
    has_set_mode BOOLEAN DEFAULT true,
    unit_options JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### training_journal_entries

Trainingstagebuch-Einträge.

```sql
CREATE TABLE training_journal_entries (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood TEXT NOT NULL,
    energy_level SMALLINT,
    focus_level SMALLINT,
    sleep_quality SMALLINT,
    soreness_level SMALLINT,
    perceived_exertion SMALLINT,
    notes TEXT,
    tags TEXT[],
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### friendships & friend_requests

Freundschaftssystem.

```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY,
    user_one_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_two_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_one_id, user_two_id)
);

CREATE TABLE friend_requests (
    id UUID PRIMARY KEY,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (requester_id, target_id)
);
```

#### invitations

Einladungssystem.

```sql
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    token_hash TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (email, status)
);
```

#### password_reset_tokens & email_verification_tokens

Token-Management.

```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Migrationen

### Migration-System

Migrationen werden automatisch beim Serverstart ausgeführt.

- **Runner**: `db/migrations.js`
- **Dateien**: `migrations/001_initial_schema.sql`, etc.
- **Reihenfolge**: Numerisch sortiert

### Migrationen ausführen

Automatisch:
- Beim Serverstart
- Beim ersten Serverless Function Call (Vercel)

Manuell:
```javascript
import { createMigrationRunner } from './db/migrations.js';
await createMigrationRunner(pool)();
```

### Neue Migration erstellen

1. Erstelle neue SQL-Datei: `migrations/XXX_description.sql`
2. Verwende `IF NOT EXISTS` für idempotente Migrationen
3. Teste lokal vor Deployment

## Indizes

Wichtige Indizes für Performance:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_language_preference ON users(language_preference);

-- Workouts
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_start_time ON workouts(start_time DESC);

-- Training Journal
CREATE INDEX idx_training_journal_user_date ON training_journal_entries(user_id, entry_date DESC);
CREATE INDEX idx_training_journal_mood ON training_journal_entries(mood);
CREATE INDEX idx_training_journal_tags ON training_journal_entries USING GIN (tags);

-- Exercises
CREATE INDEX idx_exercises_active ON exercises(is_active);
```

## Beziehungen

### Foreign Keys

Alle Foreign Keys haben `ON DELETE CASCADE` für automatische Bereinigung:

- `workouts.user_id` → `users.id`
- `workout_activities.workout_id` → `workouts.id`
- `training_journal_entries.user_id` → `users.id`
- `friendships.user_one_id` → `users.id`
- `friendships.user_two_id` → `users.id`
- etc.

Ausnahme: `invitations.invited_by` hat `ON DELETE SET NULL` (historische Daten bleiben erhalten).

## Datenmodell

### Benutzer-Flow

1. **Registrierung**: User wird erstellt, E-Mail-Verifizierungstoken generiert
2. **E-Mail-Verifizierung**: Token wird verwendet und markiert
3. **Login**: JWT-Token wird generiert
4. **2FA** (optional): TOTP-Secret wird gespeichert

### Workout-Flow

1. **Workout erstellen**: `workouts` Tabelle
2. **Aktivitäten hinzufügen**: `workout_activities` Tabelle
3. **Punkte berechnen**: Basierend auf `exercises.points_per_unit`

### Freundschafts-Flow

1. **Anfrage senden**: `friend_requests` Tabelle
2. **Anfrage akzeptieren**: Eintrag in `friendships`, Request gelöscht
3. **Ablehnen**: Request gelöscht

## Backup & Restore

### Backup

```bash
pg_dump -h host -U user -d database > backup.sql
```

### Restore

```bash
psql -h host -U user -d database < backup.sql
```

## Wartung

### Vakuum

Regelmäßiges VACUUM für Performance:

```sql
VACUUM ANALYZE;
```

### Statistiken aktualisieren

```sql
ANALYZE;
```

## Troubleshooting

### Verbindungsprobleme

- Prüfe `DATABASE_URL` Format
- Prüfe SSL-Einstellungen
- Prüfe Firewall-Regeln

### Migration-Fehler

- Prüfe Migration-Logs
- Prüfe Datenbank-Zugriffsrechte
- Prüfe ob Migrationen bereits ausgeführt wurden

### Performance-Probleme

- Prüfe Indizes: `\d+ table_name`
- Prüfe Query-Pläne: `EXPLAIN ANALYZE`
- Prüfe langsame Queries: PostgreSQL Logs

## Utility-Skripte

SQL-Utility-Skripte befinden sich in `db/scripts/`:

- `check_cascade.sql`: Prüft Foreign Key Constraints
- `check_start_time.sql`: Prüft start_time Datentyp

## Weitere Ressourcen

- [PostgreSQL Dokumentation](https://www.postgresql.org/docs/)
- [Neon Dokumentation](https://neon.tech/docs)

