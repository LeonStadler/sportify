-- Migration: Create notifications table for user notifications
-- This table stores notifications for friend requests and other events

DO $$
DECLARE
    user_id_type text;
BEGIN
    -- Determine user ID type
    SELECT format_type(atttypid, atttypmod)
    INTO user_id_type
    FROM pg_attribute
    WHERE attrelid = 'users'::regclass
      AND attname = 'id'
      AND NOT attisdropped;

    IF user_id_type IS NULL THEN
        user_id_type := 'uuid';
    END IF;

    -- Create notifications table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id %s NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            is_read BOOLEAN DEFAULT false,
            related_user_id %s REFERENCES users(id) ON DELETE SET NULL,
            metadata JSONB DEFAULT ''{}''::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            read_at TIMESTAMPTZ
        );
    ', user_id_type, user_id_type);

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

    RAISE NOTICE '[Migration] Notifications table created successfully';
END $$;

