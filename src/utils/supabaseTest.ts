import { supabase } from '@/lib/supabase';

/**
 * Test function to check Supabase connection and fetch events
 * This can be called from the browser console to debug Supabase issues
 */
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase.from('events').select('count');
    
    if (connectionError) {
      console.error('Supabase connection error:', connectionError);
      return {
        success: false,
        error: connectionError,
        message: 'Failed to connect to Supabase'
      };
    }
    
    console.log('Connection successful:', connectionTest);
    
    // Test events query
    const { data: events, error: eventsError } = await supabase.from('events').select('*');
    
    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return {
        success: false,
        error: eventsError,
        message: 'Connected to Supabase but failed to fetch events'
      };
    }
    
    console.log(`Successfully fetched ${events.length} events:`, events);
    
    return {
      success: true,
      events,
      message: `Successfully fetched ${events.length} events`
    };
  } catch (error) {
    console.error('Unexpected error testing Supabase:', error);
    return {
      success: false,
      error,
      message: 'Unexpected error occurred'
    };
  }
}

// Make the function available in the global scope for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}
