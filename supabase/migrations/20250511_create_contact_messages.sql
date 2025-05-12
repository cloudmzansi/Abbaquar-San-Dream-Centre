-- Create a table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new',
  responded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Add RLS policies to secure the table
-- Only authenticated users can view messages
CREATE POLICY "Allow authenticated users to view messages" 
  ON contact_messages
  FOR SELECT 
  TO authenticated
  USING (true);

-- Anyone can insert a new message (for the contact form)
CREATE POLICY "Allow anyone to insert messages" 
  ON contact_messages
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Only authenticated users can update messages
CREATE POLICY "Allow authenticated users to update messages" 
  ON contact_messages
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
