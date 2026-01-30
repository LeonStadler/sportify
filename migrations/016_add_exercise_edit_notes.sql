ALTER TABLE exercise_edit_requests
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS admin_notes TEXT;
