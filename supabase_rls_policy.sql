-- SQL to enable read access to the events table for all users
-- Run this in the Supabase SQL Editor

-- First, check if a policy already exists
SELECT *
FROM pg_policies
WHERE tablename = 'events';

-- Create a policy that allows anyone to read events
CREATE POLICY "Enable read access for all users" 
ON "public"."events"
FOR SELECT 
USING (true);

-- Verify the policy was created
SELECT *
FROM pg_policies
WHERE tablename = 'events';

-- If you also want to allow inserting events from the client side
-- Uncomment and run this:
/*
CREATE POLICY "Enable insert for authenticated users" 
ON "public"."events"
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
*/

-- If you need to delete an existing policy
-- Uncomment and run this (replace POLICY_NAME with the actual policy name):
/*
DROP POLICY IF EXISTS "POLICY_NAME" ON "public"."events";
*/
