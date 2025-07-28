#!/usr/bin/env node

/**
 * Backup Verification Script
 * 
 * This script verifies the backup files and shows a summary.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '../backups');

function verifyBackup() {
  console.log('🔍 Verifying database backup...');
  console.log('');
  
  // Check if backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ Backup directory not found:', BACKUP_DIR);
    console.log('💡 Run the backup script first: node scripts/run-backup.js');
    process.exit(1);
  }
  
  // Find the most recent backup
  const backupDirs = fs.readdirSync(BACKUP_DIR)
    .filter(dir => fs.statSync(path.join(BACKUP_DIR, dir)).isDirectory())
    .sort()
    .reverse();
  
  if (backupDirs.length === 0) {
    console.error('❌ No backup directories found');
    process.exit(1);
  }
  
  const latestBackup = backupDirs[0];
  const backupPath = path.join(BACKUP_DIR, latestBackup);
  
  console.log(`📁 Latest backup: ${latestBackup}`);
  console.log(`📍 Location: ${backupPath}`);
  console.log('');
  
  // Check for manifest file
  const manifestPath = path.join(backupPath, 'backup-manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    console.log('📋 Backup Summary:');
    console.log(`⏰ Timestamp: ${manifest.backupTimestamp}`);
    console.log(`📊 Total tables: ${manifest.summary.totalTables}`);
    console.log(`✅ Successful backups: ${manifest.summary.successfulBackups}`);
    console.log(`❌ Failed backups: ${manifest.summary.failedBackups}`);
    console.log('');
    
    console.log('📊 Table Details:');
    Object.entries(manifest.results).forEach(([table, success]) => {
      const status = success ? '✅' : '❌';
      console.log(`  ${status} ${table}`);
    });
    console.log('');
  }
  
  // Check individual table files
  const tables = ['activities', 'events', 'gallery', 'contact_messages', 'donations'];
  
  console.log('📄 File Details:');
  tables.forEach(table => {
    const tableFile = path.join(backupPath, `${table}.json`);
    
    if (fs.existsSync(tableFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(tableFile, 'utf8'));
        const fileSize = fs.statSync(tableFile).size;
        const sizeKB = (fileSize / 1024).toFixed(2);
        
        console.log(`  ✅ ${table}.json (${data.recordCount} records, ${sizeKB} KB)`);
      } catch (error) {
        console.log(`  ❌ ${table}.json (corrupted)`);
      }
    } else {
      console.log(`  ⚠️  ${table}.json (not found)`);
    }
  });
  
  console.log('');
  console.log('🎉 Backup verification completed!');
  console.log('');
  console.log('💡 If all files show ✅, your backup is ready.');
  console.log('💡 Store the backup files in a safe location.');
}

verifyBackup(); 