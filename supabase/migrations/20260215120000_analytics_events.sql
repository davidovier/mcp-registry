-- Analytics Events Table
-- Lightweight, anonymous, privacy-respecting event tracking

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    route TEXT,
    metadata JSONB DEFAULT '{}',
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for querying by event type and time range (funnel analytics)
CREATE INDEX IF NOT EXISTS idx_events_type_created
    ON events (event_type, created_at DESC);

-- Index for session-based analysis
CREATE INDEX IF NOT EXISTS idx_events_session_created
    ON events (session_id, created_at DESC)
    WHERE session_id IS NOT NULL;

-- Index for time-based queries (dashboard, retention cleanup)
CREATE INDEX IF NOT EXISTS idx_events_created
    ON events (created_at DESC);

-- RLS: Events table is write-only from API, read-only for admins
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (events come from unauthenticated visitors)
CREATE POLICY "Allow anonymous event inserts"
    ON events
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only admins can read events (for analytics dashboards)
CREATE POLICY "Admins can read events"
    ON events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Comment on table
COMMENT ON TABLE events IS 'Anonymous analytics events for funnel tracking. No PII stored.';
COMMENT ON COLUMN events.event_type IS 'Event type: page_view, search_performed, server_viewed, verification_requested, submit_started, submit_completed, external_link_clicked, filter_used, sort_changed';
COMMENT ON COLUMN events.route IS 'The route/path where the event occurred';
COMMENT ON COLUMN events.metadata IS 'Additional event data (search query, server slug, filter values, etc.)';
COMMENT ON COLUMN events.session_id IS 'Anonymous session ID generated client-side (localStorage). No cookies, no PII.';
