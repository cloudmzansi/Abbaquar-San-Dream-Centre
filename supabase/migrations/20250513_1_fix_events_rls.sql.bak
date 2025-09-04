-- Fix RLS Policies for Events Table
-- This migration fixes the issue where authenticated users cannot update events

-- Drop the existing update policy
DROP POLICY IF EXISTS "optimized_events_update" ON events;

-- Create a more permissive update policy
CREATE POLICY "events_update_authenticated" ON events
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also ensure the select policy allows authenticated users to read all events
DROP POLICY IF EXISTS "optimized_events_select" ON events;

CREATE POLICY "events_select_all" ON events
  FOR SELECT USING (
    (SELECT auth.role()) = 'authenticated' OR 
    (SELECT auth.role()) IN ('anon', 'authenticator', 'dashboard_user')
  ); 