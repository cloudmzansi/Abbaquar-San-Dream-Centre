import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const EventsDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  const createSampleEvents = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
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
      
      // Insert the sample events
      const { data, error } = await supabase
        .from('events')
        .insert(sampleEvents)
        .select();
        
      if (error) {
        console.error('Error creating sample events:', error);
        setResult({
          success: false,
          error,
          message: 'Failed to create sample events'
        });
      } else {
        console.log('Successfully created sample events:', data);
        setResult({
          success: true,
          events: data,
          message: `Successfully created ${data.length} sample events`
        });
      }
    } catch (error) {
      console.error('Unexpected error creating sample events:', error);
      setResult({
        success: false,
        error,
        message: 'Unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(prev => !prev)}
        className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium"
      >
        {isVisible ? 'Hide Events Debug' : 'Events Debug'}
      </button>
      
      {isVisible && (
        <div className="fixed top-16 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md">
          <h3 className="text-lg font-bold mb-4">Events Debug Panel</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Your Supabase connection is working, but there are no events in your database.
              Click the button below to create sample events.
            </p>
            
            <button
              onClick={createSampleEvents}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Sample Events'}
            </button>
          </div>
          
          {result && (
            <div className={`p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <h4 className="font-semibold">{result.success ? 'Success' : 'Error'}</h4>
              <p className="text-sm">{result.message}</p>
              
              {result.success && result.events && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Created Events:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {result.events.map((event: any) => (
                      <li key={event.id}>{event.title}</li>
                    ))}
                  </ul>
                  <div className="mt-2 text-sm">
                    <p className="font-medium">Next Steps:</p>
                    <ol className="list-decimal pl-5">
                      <li>Refresh the page to see the events</li>
                      <li>Check both the home page and events page</li>
                    </ol>
                  </div>
                </div>
              )}
              
              {!result.success && result.error && (
                <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsDebugPanel;
