-- Create team_members table for managing team information
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_path TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_sort_order ON team_members(sort_order);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON team_members(created_at);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members table
-- Allow public read access to active team members
CREATE POLICY "Allow public read access to active team members"
  ON team_members
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow authenticated users to read all team members (for admin dashboard)
CREATE POLICY "Allow authenticated users to read all team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert team members
CREATE POLICY "Allow authenticated users to insert team members"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update team members
CREATE POLICY "Allow authenticated users to update team members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete team members
CREATE POLICY "Allow authenticated users to delete team members"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();

-- Insert initial team members data (without images - they will be uploaded via admin panel)
INSERT INTO team_members (name, role, sort_order) VALUES
  ('Brylan Kock', 'Paramount Chief', 1),
  ('Chief Mervyn Damas', 'District Chief', 2),
  ('Chieftess Olivia Jones', 'Chairperson', 3),
  ('Genevieve Coughlan', 'Treasurer', 4),
  ('Headwoman Nolene Ogle', 'Deputy Chairperson', 5),
  ('Jason Abrahams', 'Senior Chief', 6),
  ('Karen Smarts', 'Secretary', 7),
  ('Kevin Louw', 'District Chief', 8),
  ('Michell Houston', 'Personal Assistant to District Chiefs', 9),
  ('Stanley Smith', 'Marketing Manager', 10); 