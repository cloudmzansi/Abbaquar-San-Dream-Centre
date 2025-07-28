# Quick Setup Guide: Scheduled Events

## ✅ Database Migration Applied
The database migration has been successfully applied. Your events table now includes:
- `publish_at`: When events should become visible
- `is_archived`: Whether events are archived
- `archived_at`: When events were archived  
- `status`: Current status (draft, published, archived)

## 🚀 Features Now Available

### 1. **Scheduled Publishing**
- Set a future date/time for events to go live
- Events marked as "Draft" are only visible to admins
- Events automatically become "Published" at their scheduled time

### 2. **Automatic Archiving**
- Past events are automatically archived at 8:00 AM the next day
- Archived events are preserved but hidden from public view
- Events can be restored from the archive if needed

### 3. **Admin Interface**
- Status filter to view Draft, Published, or Archived events
- Visual status badges on event cards
- Archive/Restore buttons for manual control
- Scheduling form with publish date/time picker

## 🔧 Setting Up Automation

### Option 1: GitHub Actions (Recommended)
1. Add these secrets to your GitHub repository:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

2. The included GitHub Action will automatically run every hour

### Option 2: Manual Setup
If you prefer to set up your own automation:

```bash
# Test the scheduled tasks manually
npm run scheduled:tasks

# Set up a cron job (every hour)
0 * * * * cd /path/to/project && npm run scheduled:tasks
```

## 🧪 Testing the Features

1. **Create a Draft Event**:
   - Set status to "Draft"
   - Set a future publish date/time
   - Verify it's only visible to admins

2. **Test Scheduled Publishing**:
   - Create an event with a publish time 1-2 minutes in the future
   - Wait for the scheduled time
   - Verify it becomes published automatically

3. **Test Archiving**:
   - Create an event with a past date
   - Run scheduled tasks manually
   - Verify it becomes archived

## 📝 Usage Examples

### Example 1: Christmas Event
- **Event Date**: December 25, 2025 at 10:00 AM
- **Publish At**: November 1, 2025 at 10:00 AM
- **Result**: Event becomes visible on website November 1st, automatically archived December 26th at 8:00 AM

### Example 2: Weekly Meeting
- **Event Date**: July 30, 2025 at 6:00 PM
- **Publish At**: July 25, 2025 at 9:00 AM
- **Result**: Event visible July 25th, archived July 31st at 8:00 AM

## 🔍 Troubleshooting

### Events not publishing automatically
- Check GitHub Actions are running (if using GitHub)
- Verify environment variables are set correctly
- Run `npm run scheduled:tasks` manually to test

### Database errors
- Ensure the migration was applied: `npx supabase db push`
- Check that all new columns exist in your database

### Admin interface issues
- Clear browser cache
- Check that TypeScript types are updated
- Verify you're logged in as an admin

## 📞 Support
If you encounter any issues:
1. Check the browser console for errors
2. Verify the database migration was applied
3. Test the scheduled tasks manually
4. Check GitHub Actions logs (if using GitHub)

The system is now ready for production use! 🎉 