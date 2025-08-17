-- Create volunteers table for managing volunteer information
CREATE TABLE IF NOT EXISTS volunteers (
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
CREATE INDEX IF NOT EXISTS idx_volunteers_sort_order ON volunteers(sort_order);
CREATE INDEX IF NOT EXISTS idx_volunteers_is_active ON volunteers(is_active);
CREATE INDEX IF NOT EXISTS idx_volunteers_created_at ON volunteers(created_at);

-- Enable Row Level Security
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Create policies for volunteers table
-- Allow public read access to active volunteers
CREATE POLICY "Allow public read access to active volunteers"
  ON volunteers
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow authenticated users to read all volunteers (for admin dashboard)
CREATE POLICY "Allow authenticated users to read all volunteers"
  ON volunteers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert volunteers
CREATE POLICY "Allow authenticated users to insert volunteers"
  ON volunteers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update volunteers
CREATE POLICY "Allow authenticated users to update volunteers"
  ON volunteers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete volunteers
CREATE POLICY "Allow authenticated users to delete volunteers"
  ON volunteers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_volunteers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION update_volunteers_updated_at();

-- Insert some initial volunteer data (without images - they will be uploaded via admin panel)
INSERT INTO volunteers (name, role, sort_order) VALUES
  ('Sarah Johnson', 'Youth Program Coordinator', 1),
  ('Michael Chen', 'Dance Instructor', 2),
  ('Lisa Rodriguez', 'Community Outreach', 3),
  ('David Thompson', 'Music Teacher', 4),
  ('Emma Wilson', 'Ballet Instructor', 5);
