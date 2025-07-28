#!/usr/bin/env node

/**
 * Simple Backup Runner
 * 
 * This script loads environment variables and runs the database backup.
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
config({ path: path.join(__dirname, '../.env') });

console.log('🚀 Starting database backup...');
console.log('📁 Loading environment variables...');

// Check if environment variables are loaded
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please check your .env file contains:');
  console.error('VITE_SUPABASE_URL=your_supabase_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🔗 Supabase URL:', supabaseUrl.substring(0, 20) + '...');
console.log('');

// Run the backup script
const backupScript = path.join(__dirname, 'backup-database.js');

console.log('📊 Running backup script...');
console.log('');

const child = spawn('node', [backupScript], {
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('');
    console.log('🎉 Backup completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Check the backups/ directory for your backup files');
    console.log('2. Verify the data in the JSON files');
    console.log('3. Store the backup in a safe location');
    console.log('4. You can now proceed with performance optimizations');
  } else {
    console.error('❌ Backup failed with code:', code);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to run backup script:', error);
  process.exit(1);
}); 