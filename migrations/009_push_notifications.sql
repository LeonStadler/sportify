BEGIN;

ALTER TABLE leaderboard_results
    ADD COLUMN IF NOT EXISTS participant_count INTEGER NOT NULL DEFAULT 0;

UPDATE leaderboard_results
SET participant_count = GREATEST(participant_count, 1);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    expiration_time TIMESTAMPTZ,
    keys JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

COMMIT;
