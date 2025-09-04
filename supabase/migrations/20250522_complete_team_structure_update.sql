-- Complete team structure update to reflect new organization hierarchy
-- Leadership (Royal House), Management, and Volunteers
-- This migration includes ALL members from the old structure

-- First, let's add a category field to both tables to distinguish between Leadership, Management, and Volunteers
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'management';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'volunteers';

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_team_members_category ON team_members(category);
CREATE INDEX IF NOT EXISTS idx_volunteers_category ON volunteers(category);

-- Clear existing data to start fresh with new structure
DELETE FROM team_members;
DELETE FROM volunteers;

-- Insert Leadership (Royal House) into team_members table
INSERT INTO team_members (name, role, category, sort_order) VALUES
  ('His Royal Majesty King Mervyn Roland Dunn', 'King', 'leadership', 1),
  ('Her Royal Majesty Queen Anne Cheryl Dunn', 'Queen', 'leadership', 2),
  ('Paramount Chief Jason Abrahams', 'Paramount Chief', 'leadership', 3),
  ('1st Lady Joanne Abrahams', '1st Lady', 'leadership', 4),
  ('Senior Cultural Chieftess Olivia Jones', 'Senior Cultural Chieftess', 'leadership', 5),
  ('Headman Jerome Jones', 'Headman', 'leadership', 6),
  ('Headwoman Nolene Fynn', 'Headwoman', 'leadership', 7);

-- Insert Management into team_members table
INSERT INTO team_members (name, role, category, sort_order) VALUES
  ('Chief Financial Officer Genevieve Coughlan', 'Chief Financial Officer', 'management', 8),
  ('Program Director Rochelle Dunn', 'Program Director', 'management', 9),
  ('Youth Director Dyllo''n Jones', 'Youth Director', 'management', 10),
  ('Events Co-ordinator Pauline Pepper', 'Events Co-ordinator', 'management', 11);

-- Insert ALL Volunteers into volunteers table (including all missing members from old structure)
INSERT INTO volunteers (name, role, category, sort_order) VALUES
  ('Administrator Candice George', 'Administrator', 'volunteers', 1),
  ('Youth Liaison Officer Tyrese Johnson', 'Youth Liaison Officer', 'volunteers', 2),
  ('Youth Liaison Officer Declan Jones', 'Youth Liaison Officer', 'volunteers', 3),
  ('Youth Director Assistant Sithembiso Magwala', 'Youth Director Assistant', 'volunteers', 4),
  ('Safety Officer Raquel Hammond', 'Safety Officer', 'volunteers', 5);

-- Update RLS policies to include category filtering
DROP POLICY IF EXISTS "Allow public read access to active team members" ON team_members;
DROP POLICY IF EXISTS "Allow public read access to active volunteers" ON volunteers;

-- Create new policies with category support
CREATE POLICY "Allow public read access to active team members"
  ON team_members
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow public read access to active volunteers"
  ON volunteers
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Add comments for documentation
COMMENT ON COLUMN team_members.category IS 'Category: leadership, management, or volunteers';
COMMENT ON COLUMN volunteers.category IS 'Category: leadership, management, or volunteers';

-- Verify the data was inserted correctly
SELECT 'Leadership Members:' as section, count(*) as count FROM team_members WHERE category = 'leadership'
UNION ALL
SELECT 'Management Members:' as section, count(*) as count FROM team_members WHERE category = 'management'
UNION ALL
SELECT 'Volunteers:' as section, count(*) as count FROM volunteers WHERE category = 'volunteers';
