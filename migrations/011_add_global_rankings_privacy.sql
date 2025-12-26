-- Add show_in_global_rankings column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_in_global_rankings BOOLEAN DEFAULT TRUE;

