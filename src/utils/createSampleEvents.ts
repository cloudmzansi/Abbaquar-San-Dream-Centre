import { supabase } from '@/lib/supabase';

/**
 * Creates sample events in the Supabase database
 * This is helpful when you need to quickly populate the events table for testing
 */
export async function createSampleEvents() {
  console.log('Creating sample events...');
  
  // Sample events data
  const sampleEvents = [
    {
      title: 'Community Outreach Day',
      date: '2025-06-15',
      time: '10:00 AM - 2:00 PM',
      venue: 'Abbaquar-san Dream Centre',
      description: 'Join us for a day of community service and outreach. We\'ll be providing free health screenings, food, and activities for children.',
      display_on: 'both' // Display on both home and events pages
    },
    {
      title: 'Youth Leadership Workshop',
      date: '2025-06-28',
      time: '9:00 AM - 12:00 PM',
      venue: 'Abbaquar-san Dream Centre',
      description: 'A workshop designed to empower young leaders with skills in communication, problem-solving, and community engagement.',
      display_on: 'both' // Display on both home and events pages
    },
    {
      title: 'Annual Fundraising Gala',
      date: '2025-07-10',
      time: '6:00 PM - 10:00 PM',
      venue: 'Sandton Convention Centre',
      description: 'Our annual fundraising event featuring dinner, entertainment, and a silent auction. All proceeds go to supporting our community programs.',
      display_on: 'home' // Display only on home page
    }
  ];
  
  try {
    // First check if there are already events in the database
    const { data: existingEvents, error: checkError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
      
    if (checkError) {
      throw checkError;
    }
    
    // If there are already events, ask for confirmation before proceeding
    if (existingEvents && existingEvents.length > 0) {
      if (!confirm('There are already events in the database. Do you want to add more sample events?')) {
        console.log('Operation cancelled by user.');
        return {
          success: false,
          message: 'Operation cancelled by user'
        };
      }
    }
    
    // Insert the sample events
    const { data, error } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select();
      
    if (error) {
      console.error('Error creating sample events:', error);
      return {
        success: false,
        error,
        message: 'Failed to create sample events'
      };
    }
    
    console.log('Successfully created sample events:', data);
    return {
      success: true,
      events: data,
      message: `Successfully created ${data.length} sample events`
    };
  } catch (error) {
    console.error('Unexpected error creating sample events:', error);
    return {
      success: false,
      error,
      message: 'Unexpected error occurred'
    };
  }
}

// Make the function available in the global scope for browser console testing
if (typeof window !== 'undefined') {
  (window as any).createSampleEvents = createSampleEvents;
}
