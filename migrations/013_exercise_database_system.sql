CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS exercises (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT,
    category VARCHAR(50),
    discipline VARCHAR(50),
    movement_pattern VARCHAR(50),
    measurement_type VARCHAR(20),
    points_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
    unit TEXT NOT NULL DEFAULT 'Wiederholungen',
    has_weight BOOLEAN DEFAULT false,
    has_set_mode BOOLEAN DEFAULT true,
    requires_weight BOOLEAN DEFAULT false,
    allows_weight BOOLEAN DEFAULT false,
    supports_sets BOOLEAN DEFAULT true,
    supports_time BOOLEAN DEFAULT false,
    supports_distance BOOLEAN DEFAULT false,
    supports_grade BOOLEAN DEFAULT false,
    difficulty_tier INTEGER,
    muscle_groups TEXT[],
    equipment TEXT[],
    unit_options JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    merged_into VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id)
);

CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises (is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug_unique ON exercises (slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS exercise_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id VARCHAR(50) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    alias_slug TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_aliases_exercise_id ON exercise_aliases (exercise_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_aliases_unique ON exercise_aliases (exercise_id, alias_slug);

CREATE TABLE IF NOT EXISTS exercise_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id VARCHAR(50) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_reports_status ON exercise_reports (status);

CREATE TABLE IF NOT EXISTS exercise_edit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id VARCHAR(50) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    change_request JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_edit_requests_status ON exercise_edit_requests (status);
