#!/usr/bin/env node

/**
 * Database Backup Script for Supabase Free Tier
 * 
 * This script exports all data from your Supabase database to JSON files
 * for backup purposes before implementing performance optimizations.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BACKUP_DIR = path.join(__dirname, '../backups');
const BACKUP_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('Or create a .env file with these variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to backup
const TABLES = [
  'activities',
  'events', 
  'gallery',
  'team_members',
  'volunteers',
  'contact_messages',
  'contact_submissions',
  'donations'
];

// Create backup directory
function createBackupDirectory() {
  const backupPath = path.join(BACKUP_DIR, BACKUP_TIMESTAMP);
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  return backupPath;
}

// Backup a single table
async function backupTable(tableName, backupPath) {
  try {
    console.log(`📊 Backing up table: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`❌ Error backing up ${tableName}:`, error);
      return false;
    }
    
    const backupFile = path.join(backupPath, `${tableName}.json`);
    const backupData = {
      table: tableName,
      timestamp: new Date().toISOString(),
      recordCount: data.length,
      data: data
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ ${tableName}: ${data.length} records backed up`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error backing up ${tableName}:`, error);
    return false;
  }
}

// Create backup manifest
function createBackupManifest(backupPath, results) {
  const manifest = {
    backupTimestamp: BACKUP_TIMESTAMP,
    supabaseUrl: supabaseUrl,
    tables: Object.keys(results),
    summary: {
      totalTables: Object.keys(results).length,
      successfulBackups: Object.values(results).filter(Boolean).length,
      failedBackups: Object.values(results).filter(r => !r).length
    },
    results: results
  };
  
  const manifestFile = path.join(backupPath, 'backup-manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  
  return manifest;
}

// Main backup function
async function performBackup() {
  console.log('🚀 Starting database backup...');
  console.log(`📁 Backup directory: ${BACKUP_DIR}`);
  console.log(`⏰ Timestamp: ${BACKUP_TIMESTAMP}`);
  console.log('');
  
  // Create backup directory
  const backupPath = createBackupDirectory();
  
  // Test connection
  console.log('🔍 Testing Supabase connection...');
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error);
      process.exit(1);
    }
    
    console.log('✅ Connection successful');
    console.log('');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
  
  // Backup each table
  const results = {};
  
  for (const table of TABLES) {
    results[table] = await backupTable(table, backupPath);
  }
  
  // Create manifest
  const manifest = createBackupManifest(backupPath, results);
  
  // Summary
  console.log('');
  console.log('📋 Backup Summary:');
  console.log(`📁 Backup location: ${backupPath}`);
  console.log(`📊 Total tables: ${manifest.summary.totalTables}`);
  console.log(`✅ Successful: ${manifest.summary.successfulBackups}`);
  console.log(`❌ Failed: ${manifest.summary.failedBackups}`);
  
  if (manifest.summary.failedBackups > 0) {
    console.log('');
    console.log('⚠️  Some backups failed. Check the logs above for details.');
    console.log('💡 This might be normal if some tables don\'t exist yet.');
  }
  
  console.log('');
  console.log('🎉 Backup completed!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Verify the backup files in the backups directory');
  console.log('2. Test the backup by checking the JSON files');
  console.log('3. Store the backup in a safe location');
  console.log('4. Proceed with performance optimizations');
  
  return manifest;
}

// Restore function (for reference)
async function restoreTable(tableName, backupPath) {
  try {
    const backupFile = path.join(backupPath, `${tableName}.json`);
    
    if (!fs.existsSync(backupFile)) {
      console.log(`⚠️  No backup file found for ${tableName}`);
      return false;
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`🔄 Restoring ${tableName}: ${backupData.recordCount} records`);
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep at least one record
    
    if (deleteError) {
      console.error(`❌ Error clearing ${tableName}:`, deleteError);
      return false;
    }
    
    // Insert backup data
    if (backupData.data.length > 0) {
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(backupData.data);
      
      if (insertError) {
        console.error(`❌ Error restoring ${tableName}:`, insertError);
        return false;
      }
    }
    
    console.log(`✅ ${tableName} restored successfully`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error restoring ${tableName}:`, error);
    return false;
  }
}

// CLI handling
if (process.argv.includes('--restore')) {
  const backupPath = process.argv[process.argv.indexOf('--restore') + 1];
  
  if (!backupPath) {
    console.error('❌ Please specify backup path: node backup-database.js --restore <backup-path>');
    process.exit(1);
  }
  
  console.log(`🔄 Restoring from backup: ${backupPath}`);
  
  // Restore each table
  for (const table of TABLES) {
    await restoreTable(table, backupPath);
  }
  
  console.log('✅ Restore completed!');
} else {
  // Perform backup
  performBackup().catch(error => {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  });
} 