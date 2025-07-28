# 🔒 Database Backup Guide

## Overview
This guide explains how to backup your Supabase database before implementing performance optimizations. Since you're on the free tier, we'll export data to JSON files.

## 📋 Prerequisites

1. **Environment Variables**: Ensure your `.env` file contains:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Node.js**: Make sure Node.js is installed and accessible

## 🚀 Quick Backup

### Step 1: Run the Backup
```bash
node scripts/run-backup.js
```

This will:
- Load your environment variables
- Connect to your Supabase database
- Export all tables to JSON files
- Create a backup manifest

### Step 2: Verify the Backup
```bash
node scripts/verify-backup.js
```

This will:
- Check all backup files
- Show a summary of what was backed up
- Verify file integrity

## 📁 Backup Structure

Your backup will be created in the `backups/` directory with this structure:

```
backups/
└── 2024-01-15T10-30-45-123Z/
    ├── activities.json
    ├── events.json
    ├── gallery.json
    ├── contact_messages.json
    ├── donations.json
    └── backup-manifest.json
```

## 📊 What Gets Backed Up

The backup includes all data from these tables:
- **activities**: All activity records
- **events**: All event records  
- **gallery**: All gallery images and metadata
- **contact_messages**: All contact form submissions
- **donations**: All donation records

## 🔍 Backup Verification

After running the backup, you should see output like:

```
🔍 Verifying database backup...
📁 Latest backup: 2024-01-15T10-30-45-123Z
📍 Location: /path/to/backups/2024-01-15T10-30-45-123Z

📋 Backup Summary:
⏰ Timestamp: 2024-01-15T10-30-45-123Z
📊 Total tables: 5
✅ Successful backups: 5
❌ Failed backups: 0

📊 Table Details:
  ✅ activities
  ✅ events
  ✅ gallery
  ✅ contact_messages
  ✅ donations

📄 File Details:
  ✅ activities.json (12 records, 2.45 KB)
  ✅ events.json (8 records, 1.23 KB)
  ✅ gallery.json (15 records, 3.67 KB)
  ✅ contact_messages.json (5 records, 0.89 KB)
  ✅ donations.json (3 records, 0.45 KB)
```

## 🛡️ Safety Measures

### Before Running Backup
1. **Test Connection**: The script tests the connection first
2. **Error Handling**: Failed backups are logged but don't stop the process
3. **File Validation**: Each backup file is validated for integrity

### Backup Files
- **JSON Format**: Human-readable and easily parseable
- **Complete Data**: All fields and relationships preserved
- **Metadata**: Includes timestamps and record counts
- **Manifest**: Summary file with backup details

## 🔄 Restore Process (If Needed)

If you need to restore from backup:

```bash
node scripts/backup-database.js --restore backups/2024-01-15T10-30-45-123Z
```

**⚠️ Warning**: This will overwrite existing data in your database.

## 📝 Next Steps

After successful backup:

1. **Verify Files**: Check that all JSON files contain your data
2. **Store Safely**: Copy the backup directory to a safe location
3. **Test Restore**: Optionally test the restore process on a test database
4. **Proceed**: You can now safely implement performance optimizations

## 🚨 Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Check your `.env` file exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

**"Failed to connect to Supabase"**
- Check your internet connection
- Verify your Supabase credentials are correct
- Ensure your Supabase project is active

**"Some backups failed"**
- This is normal if some tables don't exist yet
- Check the logs for specific error messages
- Tables that don't exist will be skipped

### Getting Help

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your Supabase project is accessible
3. Ensure your environment variables are correct
4. Try running the verification script to see what succeeded

## ✅ Success Checklist

- [ ] Backup script runs without errors
- [ ] All expected tables are backed up
- [ ] Verification script shows all ✅ marks
- [ ] Backup files are stored in a safe location
- [ ] You're ready to proceed with optimizations

---

**Last Updated**: January 2024
**Status**: Ready for use 