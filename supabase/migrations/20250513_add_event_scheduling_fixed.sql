-- Add scheduled publishing and archiving fields to events table
-- This migration adds:
-- 1. publish_at: When the event should become visible (SAST timezone)
-- 2. is_archived: Whether the event has been moved to past events
-- 3. archived_at: When the event was archived
-- 4. status: Current status of the event (draft, published, archived)

-- Add new columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

-- Create index for efficient querying of published events
CREATE INDEX IF NOT EXISTS idx_events_publish_at ON events(publish_at);
CREATE INDEX IF NOT EXISTS idx_events_is_archived ON events(is_archived);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Create a function to automatically archive past events
CREATE OR REPLACE FUNCTION archive_past_events()
RETURNS void AS $$
BEGIN
  -- Archive events that ended more than 1 day ago (before 8:00 AM the next day)
  UPDATE events 
  SET 
    is_archived = TRUE,
    archived_at = NOW(),
    status = 'archived'
  WHERE 
    is_archived = FALSE 
    AND status != 'archived'
    AND date::date < CURRENT_DATE - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Create a function to publish scheduled events
CREATE OR REPLACE FUNCTION publish_scheduled_events()
RETURNS void AS $$
BEGIN
  -- Publish events that have reached their publish_at time
  UPDATE events 
  SET 
    status = 'published'
  WHERE 
    status = 'draft' 
    AND publish_at IS NOT NULL 
    AND publish_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to handle archived events
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage events" ON events;
DROP POLICY IF EXISTS "Allow public to read events" ON events;

-- Create new policies that handle archived events
CREATE POLICY "Allow authenticated users to manage all events"
  ON events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can only see published, non-archived events
CREATE POLICY "Allow public to read published events"
  ON events
  FOR SELECT
  TO anon
  USING (
    status = 'published' 
    AND is_archived = FALSE 
    AND (publish_at IS NULL OR publish_at <= NOW())
  );

-- Create a comment explaining the new fields
COMMENT ON COLUMN events.publish_at IS 'When the event should become visible to the public (SAST timezone)';
COMMENT ON COLUMN events.is_archived IS 'Whether the event has been moved to past events';
COMMENT ON COLUMN events.archived_at IS 'When the event was archived';
COMMENT ON COLUMN events.status IS 'Current status: draft, published, or archived'; 