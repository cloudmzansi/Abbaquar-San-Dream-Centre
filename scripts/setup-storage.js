#!/usr/bin/env node

/**
 * Setup script for Supabase storage bucket
 * This script helps set up the events storage bucket and applies the migration
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)');
  console.error('\nPlease add these to your .env file');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🚀 Setting up Supabase storage for events...\n');

  try {
    // 1. Create the events bucket
    console.log('📦 Creating events storage bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('events', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Events bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Events bucket created successfully');
    }

    // 2. Test bucket access
    console.log('\n🔍 Testing bucket access...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const eventsBucket = buckets.find(bucket => bucket.name === 'events');
    if (eventsBucket) {
      console.log('✅ Events bucket is accessible');
      console.log(`   - Public: ${eventsBucket.public}`);
      console.log(`   - File size limit: ${eventsBucket.fileSizeLimit} bytes`);
    } else {
      throw new Error('Events bucket not found after creation');
    }

    // 3. Test public URL generation
    console.log('\n🔗 Testing public URL generation...');
    const testPath = 'test-image.jpg';
    const { data: urlData } = supabase.storage.from('events').getPublicUrl(testPath);
    
    if (urlData.publicUrl) {
      console.log('✅ Public URL generation works');
      console.log(`   - Test URL: ${urlData.publicUrl}`);
    }

    console.log('\n🎉 Storage setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Apply the migration: supabase db push');
    console.log('   2. Test image upload in the admin panel');
    console.log('   3. Verify images display correctly on the frontend');

  } catch (error) {
    console.error('❌ Error setting up storage:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure you have the correct SUPABASE_SERVICE_ROLE_KEY');
    console.error('   2. Verify your Supabase project has storage enabled');
    console.error('   3. Check that your service role has admin permissions');
    process.exit(1);
  }
}

// Run the setup
setupStorage();
