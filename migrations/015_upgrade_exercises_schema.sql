-- Upgrade legacy exercises table to support exercise database system fields

ALTER TABLE exercises
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS category VARCHAR(50),
    ADD COLUMN IF NOT EXISTS discipline VARCHAR(50),
    ADD COLUMN IF NOT EXISTS movement_pattern VARCHAR(50),
    ADD COLUMN IF NOT EXISTS measurement_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS requires_weight BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS allows_weight BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS supports_sets BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS supports_time BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS supports_distance BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS supports_grade BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS difficulty_tier INTEGER,
    ADD COLUMN IF NOT EXISTS muscle_groups TEXT[],
    ADD COLUMN IF NOT EXISTS equipment TEXT[],
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS merged_into VARCHAR(50);

-- Backfill new fields from legacy columns where possible
UPDATE exercises
SET
    requires_weight = COALESCE(requires_weight, has_weight, false),
    supports_sets = COALESCE(supports_sets, has_set_mode, true),
    measurement_type = COALESCE(
        measurement_type,
        CASE
            WHEN unit IN ('km', 'm', 'Meilen', 'Kilometer', 'Meter') THEN 'distance'
            WHEN unit IN ('Sekunden', 'Minuten', 'Stunden') THEN 'time'
            ELSE 'reps'
        END
    ),
    slug = COALESCE(
        slug,
        regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')
    ),
    status = COALESCE(status, 'approved');

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug_unique ON exercises (slug) WHERE slug IS NOT NULL;
