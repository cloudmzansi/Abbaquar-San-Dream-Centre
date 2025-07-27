-- Fix analytics RLS policies to allow proper access

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to view analytics" ON page_views;
DROP POLICY IF EXISTS "Allow authenticated users to view content engagement" ON content_engagement;
DROP POLICY IF EXISTS "Allow authenticated users to view visitor sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to view content popularity" ON content_popularity;
DROP POLICY IF EXISTS "Allow authenticated users to view donation analytics" ON donation_analytics;

DROP POLICY IF EXISTS "Allow anonymous users to insert page views" ON page_views;
DROP POLICY IF EXISTS "Allow anonymous users to insert content engagement" ON content_engagement;
DROP POLICY IF EXISTS "Allow anonymous users to insert visitor sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow anonymous users to insert content popularity" ON content_popularity;
DROP POLICY IF EXISTS "Allow anonymous users to insert donation analytics" ON donation_analytics;

-- Create simpler, more permissive policies
-- Allow all authenticated users to read analytics data
CREATE POLICY "analytics_select_policy" ON page_views
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "analytics_select_policy" ON content_engagement
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "analytics_select_policy" ON visitor_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "analytics_select_policy" ON content_popularity
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "analytics_select_policy" ON donation_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow anonymous users to insert analytics data
CREATE POLICY "analytics_insert_policy" ON page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "analytics_insert_policy" ON content_engagement
  FOR INSERT WITH CHECK (true);

CREATE POLICY "analytics_insert_policy" ON visitor_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "analytics_insert_policy" ON content_popularity
  FOR INSERT WITH CHECK (true);

CREATE POLICY "analytics_insert_policy" ON donation_analytics
  FOR INSERT WITH CHECK (true);

-- Also allow updates for content_popularity
CREATE POLICY "analytics_update_policy" ON content_popularity
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_popularity ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_analytics ENABLE ROW LEVEL SECURITY; 