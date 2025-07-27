-- Fix events table schema to match TypeScript interface
-- The database has a 'time' column but the interface uses 'start_time' and 'end_time'

-- First, let's check what columns exist
-- This migration will:
-- 1. Add start_time and end_time columns if they don't exist
-- 2. Make the time column nullable (since we're using start_time/end_time instead)
-- 3. Update any existing data if needed

-- Add start_time and end_time columns if they don't exist
DO $$ 
BEGIN
    -- Add start_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE events ADD COLUMN start_time TEXT;
    END IF;
    
    -- Add end_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE events ADD COLUMN end_time TEXT;
    END IF;
END $$;

-- Make the time column nullable (since we're using start_time/end_time instead)
-- Only if the time column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'time'
    ) THEN
        ALTER TABLE events ALTER COLUMN time DROP NOT NULL;
    END IF;
END $$;

-- Update RLS policies to allow authenticated users to manage events
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to manage events" ON events;
DROP POLICY IF EXISTS "Allow public to read events" ON events;

-- Create new policies
CREATE POLICY "Allow authenticated users to manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to read events"
  ON events
  FOR SELECT
  TO anon
  USING (true); 