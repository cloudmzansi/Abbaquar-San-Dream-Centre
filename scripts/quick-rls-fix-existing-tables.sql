-- Quick RLS Performance Fix for Existing Tables
-- Run this in the Supabase SQL Editor to fix auth_rls_initplan issues

-- Fix activities table RLS
DROP POLICY IF EXISTS "Admin Delete Access" ON activities;
DROP POLICY IF EXISTS "Admin Insert Access" ON activities;
DROP POLICY IF EXISTS "Admin Update Access" ON activities;
DROP POLICY IF EXISTS "Public Read Access" ON activities;

CREATE POLICY "optimized_activities_select" ON activities
  FOR SELECT USING (
    (SELECT auth.role()) = 'authenticated' OR 
    ((SELECT auth.role()) = 'anon' AND display_on IN ('home', 'both'))
  );

CREATE POLICY "optimized_activities_insert" ON activities
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "optimized_activities_update" ON activities
  FOR UPDATE TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "optimized_activities_delete" ON activities
  FOR DELETE TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix events table RLS
DROP POLICY IF EXISTS "Admin Delete Access" ON events;
DROP POLICY IF EXISTS "Admin Insert Access" ON events;
DROP POLICY IF EXISTS "Admin Update Access" ON events;
DROP POLICY IF EXISTS "Public Read Access" ON events;
DROP POLICY IF EXISTS "Enable read access for all users" ON events;

CREATE POLICY "optimized_events_select" ON events
  FOR SELECT USING (
    (SELECT auth.role()) = 'authenticated' OR 
    (SELECT auth.role()) IN ('anon', 'authenticator', 'dashboard_user')
  );

CREATE POLICY "optimized_events_insert" ON events
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "optimized_events_update" ON events
  FOR UPDATE TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "optimized_events_delete" ON events
  FOR DELETE TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix gallery table RLS
DROP POLICY IF EXISTS "Admin Delete Access" ON gallery;
DROP POLICY IF EXISTS "Admin Insert Access" ON gallery;
DROP POLICY IF EXISTS "Admin Update Access" ON gallery;
DROP POLICY IF EXISTS "Public Read Access" ON gallery;
DROP POLICY IF EXISTS "Allow public select" ON gallery;
DROP POLICY IF EXISTS "Allow authenticated all" ON gallery;

CREATE POLICY "optimized_gallery_select" ON gallery
  FOR SELECT USING (
    (SELECT auth.role()) = 'authenticated' OR 
    (SELECT auth.role()) = 'anon'
  );

CREATE POLICY "optimized_gallery_insert" ON gallery
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "optimized_gallery_update" ON gallery
  FOR UPDATE TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "optimized_gallery_delete" ON gallery
  FOR DELETE TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix contact_submissions table RLS (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_submissions') THEN
        -- Drop existing policies for contact_submissions table
        DROP POLICY IF EXISTS "Allow anonymous insert" ON contact_submissions;
        DROP POLICY IF EXISTS "anon_insert" ON contact_submissions;
        DROP POLICY IF EXISTS "Allow authenticated read" ON contact_submissions;
        DROP POLICY IF EXISTS "Allow authenticated update" ON contact_submissions;
        DROP POLICY IF EXISTS "Allow authenticated delete" ON contact_submissions;
        DROP POLICY IF EXISTS "auth_all" ON contact_submissions;

        -- Create consolidated policies for contact_submissions table
        CREATE POLICY "optimized_contact_submissions_insert" ON contact_submissions
          FOR INSERT TO anon
          WITH CHECK (true);

        CREATE POLICY "optimized_contact_submissions_select" ON contact_submissions
          FOR SELECT TO authenticated
          USING ((SELECT auth.role()) = 'authenticated');

        CREATE POLICY "optimized_contact_submissions_update" ON contact_submissions
          FOR UPDATE TO authenticated
          USING ((SELECT auth.role()) = 'authenticated')
          WITH CHECK ((SELECT auth.role()) = 'authenticated');

        CREATE POLICY "optimized_contact_submissions_delete" ON contact_submissions
          FOR DELETE TO authenticated
          USING ((SELECT auth.role()) = 'authenticated');
    END IF;
END $$;

-- Fix profiles table RLS (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

        CREATE POLICY "optimized_profiles_manage" ON profiles
          FOR ALL TO authenticated
          USING ((SELECT auth.uid()) = id)
          WITH CHECK ((SELECT auth.uid()) = id);
    END IF;
END $$;

-- Fix contact_messages table RLS (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to view messages" ON contact_messages;
        DROP POLICY IF EXISTS "Allow anyone to insert messages" ON contact_messages;
        DROP POLICY IF EXISTS "Allow authenticated users to update messages" ON contact_messages;

        CREATE POLICY "optimized_contact_messages_select" ON contact_messages
          FOR SELECT TO authenticated
          USING ((SELECT auth.role()) = 'authenticated');

        CREATE POLICY "optimized_contact_messages_insert" ON contact_messages
          FOR INSERT TO anon
          WITH CHECK (true);

        CREATE POLICY "optimized_contact_messages_update" ON contact_messages
          FOR UPDATE TO authenticated
          USING ((SELECT auth.role()) = 'authenticated')
          WITH CHECK ((SELECT auth.role()) = 'authenticated');
    END IF;
END $$;

-- Add performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_display_on_rls 
ON activities(display_on) WHERE display_on IN ('home', 'both');

-- Verify the changes
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('activities', 'events', 'gallery', 'contact_submissions', 'profiles', 'contact_messages')
ORDER BY tablename, policyname; 