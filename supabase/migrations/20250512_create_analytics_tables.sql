-- Create analytics tables for visitor tracking and content engagement

-- Table for tracking page views and visitor sessions
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  region TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  viewport_size TEXT,
  load_time INTEGER, -- in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking content engagement (clicks, interactions)
CREATE TABLE IF NOT EXISTS content_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'event', 'activity', 'gallery', 'donation', etc.
  content_id TEXT,
  action_type TEXT NOT NULL, -- 'view', 'click', 'share', 'download', etc.
  element_id TEXT, -- specific element that was interacted with
  page_path TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking visitor sessions
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  first_page TEXT,
  last_page TEXT,
  page_count INTEGER DEFAULT 1,
  duration_seconds INTEGER,
  is_bounce BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking popular content
CREATE TABLE IF NOT EXISTS content_popularity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_title TEXT,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0.00,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id)
);

-- Table for tracking donation analytics
CREATE TABLE IF NOT EXISTS donation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'ZAR',
  payment_method TEXT,
  donation_page_source TEXT, -- which page they came from
  ip_address INET,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_ip_address ON page_views(ip_address);

CREATE INDEX IF NOT EXISTS idx_content_engagement_session_id ON content_engagement(session_id);
CREATE INDEX IF NOT EXISTS idx_content_engagement_content_type ON content_engagement(content_type);
CREATE INDEX IF NOT EXISTS idx_content_engagement_created_at ON content_engagement(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at ON visitor_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip_address ON visitor_sessions(ip_address);

CREATE INDEX IF NOT EXISTS idx_content_popularity_content_type ON content_popularity(content_type);
CREATE INDEX IF NOT EXISTS idx_content_popularity_engagement_score ON content_popularity(engagement_score DESC);

CREATE INDEX IF NOT EXISTS idx_donation_analytics_created_at ON donation_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donation_analytics_completed ON donation_analytics(completed);

-- Add RLS policies for security
-- Only authenticated users can view analytics data
CREATE POLICY "Allow authenticated users to view analytics" 
  ON page_views
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view content engagement" 
  ON content_engagement
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view visitor sessions" 
  ON visitor_sessions
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view content popularity" 
  ON content_popularity
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view donation analytics" 
  ON donation_analytics
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow anonymous users to insert analytics data
CREATE POLICY "Allow anonymous users to insert page views" 
  ON page_views
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to insert content engagement" 
  ON content_engagement
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to insert visitor sessions" 
  ON visitor_sessions
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to insert content popularity" 
  ON content_popularity
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to insert donation analytics" 
  ON donation_analytics
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Enable Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_popularity ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_analytics ENABLE ROW LEVEL SECURITY; 