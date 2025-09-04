-- Create activities table for managing activity information
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_path TEXT,
  display_on TEXT DEFAULT 'activities' CHECK (display_on IN ('home', 'activities', 'both')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_display_on ON activities(display_on);
CREATE INDEX IF NOT EXISTS idx_activities_sort_order ON activities(sort_order);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities table
-- Allow public read access to activities
CREATE POLICY "Allow public to read activities"
  ON activities
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to manage activities
CREATE POLICY "Allow authenticated users to manage activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();
