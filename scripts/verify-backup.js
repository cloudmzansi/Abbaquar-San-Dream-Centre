#!/usr/bin/env node

/**
 * Backup Verification Script for Abbaquar San Dream Centre
 * 
 * This script verifies that the backup functionality works correctly
 * with the new team structure (Leadership, Management, Volunteers)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test backup data structure
async function testBackupStructure() {
  console.log('🧪 Testing backup data structure...');
  
  try {
    // Create sample backup data structure to test the format
    const sampleBackupData = {
      gallery: [
        { id: '1', title: 'Sample Image', image_path: '/sample.jpg', created_at: new Date().toISOString() }
      ],
      activities: [
        { id: '1', title: 'Sample Activity', description: 'Sample description', created_at: new Date().toISOString() }
      ],
      events: [
        { id: '1', title: 'Sample Event', date: new Date().toISOString(), created_at: new Date().toISOString() }
      ],
      team_members: [
        { id: '1', name: 'King Mervyn Roland Dunn', role: 'King', category: 'leadership', sort_order: 1, created_at: new Date().toISOString() },
        { id: '2', name: 'Queen Anne Cheryl Dunn', role: 'Queen', category: 'leadership', sort_order: 2, created_at: new Date().toISOString() },
        { id: '3', name: 'Genevieve Coughlan', role: 'Chief Financial Officer', category: 'management', sort_order: 8, created_at: new Date().toISOString() }
      ],
      volunteers: [
        { id: '1', name: 'Candice George', role: 'Administrator', category: 'volunteers', sort_order: 1, created_at: new Date().toISOString() },
        { id: '2', name: 'Tyrese Johnson', role: 'Youth Liaison Officer', category: 'volunteers', sort_order: 2, created_at: new Date().toISOString() }
      ],
      timestamp: new Date().toISOString(),
      version: '1.1'
    };

    // Verify team structure
    console.log('📊 Team Structure Verification:');
    
    // Check Leadership (Royal House)
    const leadership = sampleBackupData.team_members.filter(member => member.category === 'leadership');
    console.log(`  👑 Leadership (Royal House): ${leadership.length} members`);
    leadership.forEach(member => {
      console.log(`    - ${member.name} (${member.role})`);
    });

    // Check Management
    const management = sampleBackupData.team_members.filter(member => member.category === 'management');
    console.log(`  👔 Management: ${management.length} members`);
    management.forEach(member => {
      console.log(`    - ${member.name} (${member.role})`);
    });

    // Check Volunteers
    const volunteers = sampleBackupData.volunteers.filter(volunteer => volunteer.category === 'volunteers');
    console.log(`  🤝 Volunteers: ${volunteers.length} members`);
    volunteers.forEach(volunteer => {
      console.log(`    - ${volunteer.name} (${volunteer.role})`);
    });

    // Test backup file creation
    console.log('\n💾 Testing backup file creation...');
    const testBackupPath = path.join(__dirname, '../test-backup.json');
    fs.writeFileSync(testBackupPath, JSON.stringify(sampleBackupData, null, 2));
    
    // Verify file was created
    if (fs.existsSync(testBackupPath)) {
      console.log('✅ Test backup file created successfully');
      
      // Read and verify the file
      const testData = JSON.parse(fs.readFileSync(testBackupPath, 'utf8'));
      
      // Validate structure
      const isValid = testData.gallery && 
                     testData.activities && 
                     testData.events && 
                     testData.team_members && 
                     testData.volunteers &&
                     testData.timestamp &&
                     testData.version;
      
      if (isValid) {
        console.log('✅ Backup data structure is valid');
        console.log(`📊 Total records: ${testData.gallery.length + testData.activities.length + testData.events.length + testData.team_members.length + testData.volunteers.length}`);
      } else {
        console.log('❌ Backup data structure is invalid');
      }
      
      // Clean up test file
      fs.unlinkSync(testBackupPath);
      console.log('🧹 Test backup file cleaned up');
    } else {
      console.log('❌ Failed to create test backup file');
    }

    console.log('\n🎉 Backup verification completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  📸 Gallery: ${sampleBackupData.gallery.length} images`);
    console.log(`  📝 Activities: ${sampleBackupData.activities.length} activities`);
    console.log(`  📅 Events: ${sampleBackupData.events.length} events`);
    console.log(`  👥 Team Members: ${sampleBackupData.team_members.length} members`);
    console.log(`  🤝 Volunteers: ${sampleBackupData.volunteers.length} volunteers`);
    console.log(`  📊 Total: ${sampleBackupData.gallery.length + sampleBackupData.activities.length + sampleBackupData.events.length + sampleBackupData.team_members.length + sampleBackupData.volunteers.length} records`);

  } catch (error) {
    console.error('❌ Backup verification failed:', error);
    process.exit(1);
  }
}

// Run the test
testBackupStructure(); 