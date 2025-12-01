-- Migration: Add missing columns to notifications table for push notification support
-- The notificationService.js expects title, message, and payload columns

BEGIN;

-- Add title column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'title'
    ) THEN
        ALTER TABLE notifications ADD COLUMN title TEXT;
    END IF;
END $$;

-- Add message column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'message'
    ) THEN
        ALTER TABLE notifications ADD COLUMN message TEXT;
    END IF;
END $$;

-- Add payload column if not exists (using JSONB for structured data)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'payload'
    ) THEN
        ALTER TABLE notifications ADD COLUMN payload JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Migrate existing metadata to payload for consistency
UPDATE notifications 
SET payload = metadata 
WHERE payload IS NULL OR payload = '{}'::jsonb;

COMMIT;
