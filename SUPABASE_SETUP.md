# Supabase Setup Guide

This guide will help you set up your Supabase project to work with the website.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one.
2. Click on "New Project" and fill in the details:
   - Name your project (e.g., "Abbaquar Centre")
   - Set a secure database password
   - Choose a region closest to your users
3. Click "Create New Project" and wait for it to be created (this may take a few minutes).

## 2. Get Your API Keys

1. Once your project is ready, go to the project dashboard.
2. In the left sidebar, click on "Settings" > "API".
3. You'll see two keys:
   - `anon` public key (safe to use in browser)
   - `service_role` key (keep this secret)
4. Copy the `URL` and `anon key` - you'll need these for your `.env` file.

## 3. Set Up Auth

1. In the left sidebar, click on "Authentication" > "Settings".
2. Under "Auth Providers", make sure "Email" is enabled.
3. Under "Site URL", enter your website's URL (or `http://localhost:5173` for local development).
4. Save changes.

## 4. Create Storage Buckets

1. In the left sidebar, click on "Storage".
2. Create three new buckets:
   - `gallery` - for gallery images
   - `activities` - for activity images
   - `events` - for event images
3. For each bucket, go to "Policies" tab and add the following policies:

### Public Read Access
```sql
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING (bucket_id IN ('gallery', 'activities', 'events'));
```

### Admin Insert/Update/Delete Access
```sql
CREATE POLICY "Admin Insert Access"
ON storage.objects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin Update Access"
ON storage.objects
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Delete Access"
ON storage.objects
FOR DELETE
USING (auth.role() = 'authenticated');
```

## 5. Create Database Tables

1. In the left sidebar, click on "Table Editor".
2. Create the following tables:

### Gallery Table
```sql
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  image_path TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('events', 'activities', 'community')),
  title TEXT,
  alt_text TEXT
);

-- Add Row Level Security
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Allow public to read
CREATE POLICY "Public Read Access"
ON gallery
FOR SELECT
USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Admin Insert Access"
ON gallery
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin Update Access"
ON gallery
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Delete Access"
ON gallery
FOR DELETE
USING (auth.role() = 'authenticated');
```

### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_path TEXT,
  display_on TEXT NOT NULL CHECK (display_on IN ('home', 'activities', 'both'))
);

-- Add Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow public to read
CREATE POLICY "Public Read Access"
ON activities
FOR SELECT
USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Admin Insert Access"
ON activities
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin Update Access"
ON activities
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Delete Access"
ON activities
FOR DELETE
USING (auth.role() = 'authenticated');
```

### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  description TEXT NOT NULL,
  image_path TEXT,
  display_on TEXT NOT NULL CHECK (display_on IN ('home', 'events', 'both'))
);

-- Add Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public to read
CREATE POLICY "Public Read Access"
ON events
FOR SELECT
USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Admin Insert Access"
ON events
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin Update Access"
ON events
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Delete Access"
ON events
FOR DELETE
USING (auth.role() = 'authenticated');
```

## 6. Create an Admin User

1. In the left sidebar, click on "Authentication" > "Users".
2. Click "Invite" to invite a new user.
3. Enter the email address and click "Invite".
4. Check the email for the invite link and set a password.

## 7. Set Up Environment Variables

1. In your project root, create a `.env` file based on `.env.example`.
2. Add your Supabase URL and anon key:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 8. Test Your Setup

1. Start your development server with `npm run dev`.
2. Navigate to `/admin/login` and sign in with your admin user.
3. Try uploading an image to the gallery to confirm everything is working.

## 9. Deploy to Vercel

When deploying to Vercel, make sure to add the environment variables in the Vercel project settings. 