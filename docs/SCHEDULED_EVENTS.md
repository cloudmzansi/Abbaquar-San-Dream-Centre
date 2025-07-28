# Scheduled Events and Automatic Archiving

This document explains the new scheduled publishing and automatic archiving features for events.

## Features

### 1. Scheduled Publishing
- Events can be scheduled to go live at a specific date and time in SAST
- Example: An event on December 1st at 10:00 can be set to become visible on November 1st at 10:00
- Events with a future `publish_at` time are marked as "Scheduled" in the admin interface

### 2. Automatic Removal of Past Events
- Events are automatically removed from the public website at 8:00 AM the day after they occur
- This happens regardless of what time the event ended
- Example: An event ending at 23:50 on July 28th will be removed by 8:00 AM on July 29th

### 3. Archiving Past Events
- Removed events are not deleted but moved to a "Past Events" section
- Only admins can see archived events
- This maintains a historical record for stakeholders and sponsors
- Events can be restored from the archive if needed

## Database Schema Changes

The following new fields have been added to the `events` table:

- `publish_at` (TIMESTAMPTZ): When the event should become visible (SAST timezone)
- `is_archived` (BOOLEAN): Whether the event has been moved to past events
- `archived_at` (TIMESTAMPTZ): When the event was archived
- `status` (TEXT): Current status ('draft', 'published', 'archived')

## Database Functions

Two new database functions handle the automation:

### `publish_scheduled_events()`
- Publishes events that have reached their `publish_at` time
- Changes status from 'draft' to 'published'

### `archive_past_events()`
- Archives events that ended more than 1 day ago
- Sets `is_archived = true`, `status = 'archived'`, and `archived_at = NOW()`

## Admin Interface Features

### Event Form
- **Publish At**: DateTime picker for scheduling when the event should go live
- **Status**: Dropdown to set event as 'Published' or 'Draft'
- Draft events are only visible to admins

### Event List
- **Status Filter**: Filter events by 'All Status', 'Published', 'Draft', or 'Archived'
- **Status Indicators**: Visual badges showing Draft, Archived, or Scheduled status
- **Archive/Restore Buttons**: Archive events or restore them from archive
- **Run Tasks Button**: Manually trigger scheduled publishing and archiving

### Event Cards
- Status badges show current state
- Archive/restore buttons in the action menu
- Scheduled events show a "Scheduled" badge

## Setting Up Automated Scheduling

### Option 1: GitHub Actions (Recommended)
The project includes a GitHub Action that runs automatically every hour. To set it up:

1. Add these secrets to your GitHub repository:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

2. The workflow will automatically run every hour to:
   - Publish scheduled events
   - Archive past events

### Option 2: Cron Job (Alternative)
Set up a cron job to run the scheduled tasks:

```bash
# Run every hour
0 * * * * cd /path/to/your/project && npm run scheduled:tasks

# Run every 15 minutes
*/15 * * * * cd /path/to/your/project && npm run scheduled:tasks
```

### Option 2: GitHub Actions
Create a GitHub Action to run scheduled tasks:

```yaml
name: Run Scheduled Tasks
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Manual trigger

jobs:
  run-tasks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run scheduled:tasks
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Option 3: Vercel Cron Jobs
If deploying on Vercel, use Vercel Cron Jobs:

```javascript
// api/cron.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Run the scheduled tasks
    const { execSync } = require('child_process');
    execSync('npm run scheduled:tasks', { stdio: 'inherit' });
    
    res.status(200).json({ message: 'Scheduled tasks completed' });
  } catch (error) {
    console.error('Error running scheduled tasks:', error);
    res.status(500).json({ message: 'Error running scheduled tasks' });
  }
}
```

Then configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Environment Variables

Make sure these environment variables are set:

```bash
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Manual Execution

You can manually run the scheduled tasks:

```bash
npm run scheduled:tasks
```

Or from the admin interface by clicking the "Run Tasks" button.

## Migration

Run the database migration to add the new fields:

```bash
# Apply the migration
supabase db push
```

## Testing

1. Create a draft event with a future publish date
2. Run scheduled tasks manually
3. Verify the event becomes published
4. Create an event with a past date
5. Run scheduled tasks manually
6. Verify the event becomes archived

## Troubleshooting

### Events not publishing automatically
- Check that the cron job is running
- Verify environment variables are set correctly
- Check the database functions exist and are working

### Events not archiving
- Ensure the `archive_past_events()` function exists
- Check that event dates are in the correct format
- Verify the cron job has proper permissions

### Admin interface not showing status
- Clear browser cache
- Check that the TypeScript types are updated
- Verify the database migration was applied 