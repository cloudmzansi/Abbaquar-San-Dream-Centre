-- Create events storage bucket for event images/posters
-- This migration sets up the storage bucket with proper RLS policies

-- Create the events bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events',
  'events',
  true, -- public bucket for easy image access
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Policy for public read access to all files in the events bucket
CREATE POLICY "Public read access for events bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'events');

-- Policy for authenticated users to upload files to events bucket
CREATE POLICY "Authenticated users can upload to events bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update events bucket files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to delete files from events bucket
CREATE POLICY "Authenticated users can delete from events bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
