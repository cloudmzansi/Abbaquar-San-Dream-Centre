# Supabase Storage Setup Guide

## Overview
This guide helps you set up the Supabase storage bucket for event images/posters.

## Prerequisites
- Supabase project with storage enabled
- Access to your Supabase dashboard

## Manual Setup (Recommended)

### 1. Create the Storage Bucket

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Configure the bucket:
   - **Name**: `events`
   - **Public bucket**: ✅ Check this (allows public read access)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg` 
     - `image/png`
     - `image/webp`
     - `image/gif`
6. Click **Create bucket**

### 2. Set Up Row Level Security (RLS) Policies

1. In your Supabase dashboard, go to **Storage** → **Policies**
2. Click on the `events` bucket
3. Add the following policies:

#### Public Read Access
```sql
CREATE POLICY "Public read access for events bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'events');
```

#### Authenticated Upload Access
```sql
CREATE POLICY "Authenticated users can upload to events bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);
```

#### Authenticated Update Access
```sql
CREATE POLICY "Authenticated users can update events bucket files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);
```

#### Authenticated Delete Access
```sql
CREATE POLICY "Authenticated users can delete from events bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);
```

### 3. Apply the Migration

Run the migration to ensure all policies are properly set:

```bash
# If you have Supabase CLI installed
supabase db push

# Or manually run the SQL in the Supabase SQL editor
```

## Automated Setup (Alternative)

If you have your Supabase service role key, you can use the automated script:

1. Add your service role key to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. Run the setup script:
   ```bash
   node scripts/setup-storage.js
   ```

## Testing the Setup

1. **Test Upload**: Go to your admin panel and try uploading an image to an event
2. **Test Display**: Check if the image appears correctly in the event modal
3. **Test Public Access**: Verify images load on the public-facing pages

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**
   - Ensure the bucket name is exactly `events`
   - Check that storage is enabled in your Supabase project

2. **"Permission denied" error**
   - Verify RLS policies are correctly applied
   - Check that you're authenticated when uploading

3. **Images not displaying**
   - Ensure the bucket is set to public
   - Check that the image path is correctly stored in the database

### Environment Variables

Make sure these are set in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Security Notes

- The `events` bucket is public for read access (necessary for displaying images)
- Only authenticated users can upload/update/delete files
- File size is limited to 5MB
- Only image file types are allowed
- Consider implementing additional validation in your application code
