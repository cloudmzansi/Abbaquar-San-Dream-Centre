-- Apply RLS Policy Optimizations Only
-- This script only optimizes existing RLS policies without creating tables

-- =====================================================
-- 1. ACTIVITIES TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies for activities table
DROP POLICY IF EXISTS "Admin Delete Access" ON activities;
DROP POLICY IF EXISTS "Admin Insert Access" ON activities;
DROP POLICY IF EXISTS "Admin Update Access" ON activities;
DROP POLICY IF EXISTS "Public Read Access" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to manage activities" ON activities;
DROP POLICY IF EXISTS "Allow public to read activities" ON activities;

-- Create optimized policies for activities table
-- Use (SELECT auth.role()) to prevent re-evaluation for each row
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

-- =====================================================
-- 2. EVENTS TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies for events table
DROP POLICY IF EXISTS "Admin Delete Access" ON events;
DROP POLICY IF EXISTS "Admin Insert Access" ON events;
DROP POLICY IF EXISTS "Admin Update Access" ON events;
DROP POLICY IF EXISTS "Public Read Access" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to manage events" ON events;
DROP POLICY IF EXISTS "Allow public to read events" ON events;
DROP POLICY IF EXISTS "Enable read access for all users" ON events;

-- Create optimized policies for events table
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

-- =====================================================
-- 3. GALLERY TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies for gallery table
DROP POLICY IF EXISTS "Admin Delete Access" ON gallery;
DROP POLICY IF EXISTS "Admin Insert Access" ON gallery;
DROP POLICY IF EXISTS "Admin Update Access" ON gallery;
DROP POLICY IF EXISTS "Public Read Access" ON gallery;
DROP POLICY IF EXISTS "Allow public select" ON gallery;
DROP POLICY IF EXISTS "Allow authenticated all" ON gallery;

-- Create optimized policies for gallery table
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

-- =====================================================
-- 4. CONTACT_SUBMISSIONS TABLE - Consolidate Policies
-- =====================================================

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

-- =====================================================
-- 5. PROFILES TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

-- Create optimized policy for profiles table
CREATE POLICY "optimized_profiles_manage" ON profiles
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- =====================================================
-- 6. CONTACT_MESSAGES TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies for contact_messages table
DROP POLICY IF EXISTS "Allow authenticated users to view messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow anyone to insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated users to update messages" ON contact_messages;

-- Create optimized policies for contact_messages table
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

-- =====================================================
-- 7. DONATIONS TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies for donations table
DROP POLICY IF EXISTS "Allow authenticated users to read donations" ON donations;
DROP POLICY IF EXISTS "Allow anonymous users to insert donations" ON donations;
DROP POLICY IF EXISTS "Allow authenticated users to update donations" ON donations;

-- Create optimized policies for donations table
CREATE POLICY "optimized_donations_select" ON donations
  FOR SELECT TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "optimized_donations_insert" ON donations
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "optimized_donations_update" ON donations
  FOR UPDATE TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- =====================================================
-- 8. Create Performance Indexes for RLS Optimization
-- =====================================================

-- Add indexes to support optimized RLS policies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_display_on_rls 
ON activities(display_on) WHERE display_on IN ('home', 'both');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_rls_support 
ON events(id) WHERE true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gallery_rls_support 
ON gallery(id) WHERE true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_submissions_rls_support 
ON contact_submissions(id) WHERE true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_rls 
ON profiles(id) WHERE id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_messages_rls_support 
ON contact_messages(id) WHERE true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donations_rls_support 
ON donations(id) WHERE true;

-- =====================================================
-- 9. Add Comments for Documentation
-- =====================================================

COMMENT ON POLICY "optimized_activities_select" ON activities IS 'Optimized RLS policy for activities SELECT - prevents auth function re-evaluation';
COMMENT ON POLICY "optimized_events_select" ON events IS 'Optimized RLS policy for events SELECT - prevents auth function re-evaluation';
COMMENT ON POLICY "optimized_gallery_select" ON gallery IS 'Optimized RLS policy for gallery SELECT - prevents auth function re-evaluation';
COMMENT ON POLICY "optimized_contact_submissions_insert" ON contact_submissions IS 'Consolidated INSERT policy for contact_submissions';
COMMENT ON POLICY "optimized_profiles_manage" ON profiles IS 'Optimized RLS policy for profiles - users can only manage their own profile';

-- =====================================================
-- 10. Verify RLS is Enabled on All Tables
-- =====================================================

-- Ensure RLS is enabled on all tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. Verification Query
-- =====================================================

-- Check that all policies are properly created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('activities', 'events', 'gallery', 'contact_submissions', 'profiles', 'contact_messages', 'donations')
ORDER BY tablename, policyname; 