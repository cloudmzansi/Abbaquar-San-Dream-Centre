# Supabase Configuration for Contact Form

This directory contains the necessary Supabase configuration for the contact form functionality.

## Setup Instructions

1. **Run the migration script**:
   - Log into your Supabase dashboard
   - Go to the SQL Editor
   - Copy the contents of `migrations/20250511_create_contact_messages.sql`
   - Run the SQL to create the `contact_messages` table and set up the security policies

2. **Verify Table Creation**:
   - In the Supabase dashboard, go to Table Editor
   - Confirm that the `contact_messages` table has been created with the correct columns

3. **Test the Contact Form**:
   - The contact form on the website will now store submissions in this table
   - All submissions can be viewed in the Supabase Table Editor under `contact_messages`

## Table Structure

The `contact_messages` table has the following columns:

- `id`: UUID (primary key, automatically generated)
- `name`: Text (sender's name)
- `email`: Text (sender's email)
- `subject`: Text (message subject)
- `message`: Text (message content)
- `created_at`: Timestamp (when the message was sent)
- `status`: Text (default 'new', can be updated to 'read', 'responded', etc.)
- `responded_at`: Timestamp (when a response was sent)
- `notes`: Text (admin notes about the message)

## Security

The table has Row Level Security (RLS) policies configured:

- Anonymous users can only insert new messages (for the contact form)
- Only authenticated users can view or update messages
- This ensures that contact form submissions are secure and can only be accessed by authorized personnel

## Admin Interface

To build an admin interface for managing contact messages:

1. Create a protected admin route in your application
2. Use Supabase client to fetch and display messages
3. Implement functionality to update message status, add notes, etc.

Example query to get all messages:

```typescript
const { data, error } = await supabase
  .from('contact_messages')
  .select('*')
  .order('created_at', { ascending: false });
```
