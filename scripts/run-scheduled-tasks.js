import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runScheduledTasks() {
  try {
    console.log('Running scheduled tasks...');
    
    // Run the database functions
    const { error: publishError } = await supabase.rpc('publish_scheduled_events');
    if (publishError) {
      console.error('Error publishing scheduled events:', publishError);
    } else {
      console.log('✓ Published scheduled events');
    }
    
    const { error: archiveError } = await supabase.rpc('archive_past_events');
    if (archiveError) {
      console.error('Error archiving past events:', archiveError);
    } else {
      console.log('✓ Archived past events');
    }
    
    console.log('Scheduled tasks completed successfully!');
  } catch (error) {
    console.error('Error running scheduled tasks:', error);
    process.exit(1);
  }
}

// Run the tasks
runScheduledTasks(); 