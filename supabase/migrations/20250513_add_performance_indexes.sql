-- Add performance indexes for better query performance
-- This migration adds composite and partial indexes for common query patterns

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_display_date ON events(display_on, date);
CREATE INDEX IF NOT EXISTS idx_events_date_asc ON events(date ASC);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_display_sort ON activities(display_on, sort_order);
CREATE INDEX IF NOT EXISTS idx_activities_sort_order ON activities(sort_order ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Gallery table indexes
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Donations table indexes
CREATE INDEX IF NOT EXISTS idx_donations_status_created ON donations(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount_net DESC);

-- Indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_events_home_display ON events(display_on, date) WHERE display_on IN ('home', 'both');
CREATE INDEX IF NOT EXISTS idx_activities_home_display ON activities(display_on, sort_order) WHERE display_on IN ('home', 'both');

-- Additional performance indexes for better query optimization
-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_display_sort_created 
ON activities(display_on, sort_order, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_display_date_created 
ON events(display_on, date, created_at DESC);

-- Covering indexes for frequent queries (includes commonly selected columns)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_covering 
ON activities(id, title, description, image_path, display_on, sort_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_covering 
ON events(id, title, description, date, time, venue, display_on);

-- Partial indexes for active content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_activities 
ON activities(sort_order) WHERE display_on IN ('home', 'both');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_events 
ON events(date) WHERE display_on IN ('home', 'both');

-- Indexes for admin dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_messages_recent 
ON contact_messages(created_at DESC) WHERE status = 'new';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donations_recent 
ON donations(created_at DESC) WHERE payment_status = 'COMPLETE'; 