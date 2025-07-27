-- Clear existing analytics data that was created during development
-- This will remove all the fake page views that were created during testing

-- Clear all analytics tables
DELETE FROM page_views;
DELETE FROM content_engagement;
DELETE FROM visitor_sessions;
DELETE FROM content_popularity;
DELETE FROM donation_analytics;

-- Reset the sequences (if any)
-- Note: This is just for cleanup, the analytics will start fresh

-- Verify tables are empty
SELECT 'page_views' as table_name, COUNT(*) as count FROM page_views
UNION ALL
SELECT 'content_engagement' as table_name, COUNT(*) as count FROM content_engagement
UNION ALL
SELECT 'visitor_sessions' as table_name, COUNT(*) as count FROM visitor_sessions
UNION ALL
SELECT 'content_popularity' as table_name, COUNT(*) as count FROM content_popularity
UNION ALL
SELECT 'donation_analytics' as table_name, COUNT(*) as count FROM donation_analytics; 