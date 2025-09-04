import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * A debug component for Supabase connection issues
 * Only shows in development mode
 */
const SupabaseDebug: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || 'Not set',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
      `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 5)}...` : 
      'Not set'
  });

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  const runTest = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      // Test basic connection
      console.log('Testing Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase.from('events').select('count');
      
      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        setTestResults({
          success: false,
          error: connectionError,
          message: 'Failed to connect to Supabase'
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Connection successful:', connectionTest);
      
      // Test events query
      const { data: events, error: eventsError } = await supabase.from('events').select('*');
      
      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        setTestResults({
          success: false,
          error: eventsError,
          message: 'Connected to Supabase but failed to fetch events'
        });
        setIsLoading(false);
        return;
      }
      
      console.log(`Successfully fetched ${events.length} events:`, events);
      
      setTestResults({
        success: true,
        events,
        message: `Successfully fetched ${events.length} events`
      });
    } catch (error) {
      console.error('Unexpected error testing Supabase:', error);
      setTestResults({
        success: false,
        error,
        message: 'Unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(prev => !prev)}
        className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
      >
        {isVisible ? 'Hide Supabase Debug' : 'Debug Supabase'}
      </button>
      
      {isVisible && (
        <div className="fixed bottom-16 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-lg max-h-[80vh] overflow-auto">
          <h3 className="text-lg font-bold mb-2">Supabase Debug</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Configuration</h4>
            <div className="text-sm bg-gray-100 p-2 rounded">
              <div><strong>URL:</strong> {supabaseConfig.url}</div>
              <div><strong>Key:</strong> {supabaseConfig.key}</div>
            </div>
          </div>
          
          <button
            onClick={runTest}
            disabled={isLoading}
            className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium mb-4 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          
          {testResults && (
            <div className={`p-3 rounded ${testResults.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <h4 className="font-semibold">{testResults.success ? 'Success' : 'Error'}</h4>
              <p className="text-sm mb-2">{testResults.message}</p>
              
              {testResults.success && testResults.events && (
                <div className="mt-2">
                  <h5 className="font-semibold text-sm">Events ({testResults.events.length})</h5>
                  <div className="max-h-60 overflow-auto bg-white p-2 rounded text-xs">
                    <pre>{JSON.stringify(testResults.events, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {!testResults.success && testResults.error && (
                <div className="mt-2">
                  <h5 className="font-semibold text-sm">Error Details</h5>
                  <div className="max-h-60 overflow-auto bg-white p-2 rounded text-xs">
                    <pre>{JSON.stringify(testResults.error, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 text-sm">
            <h4 className="font-semibold mb-1">Troubleshooting Tips</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check that your <code>.env</code> file has the correct Supabase URL and key</li>
              <li>Verify that your Supabase project is active and not in maintenance mode</li>
              <li>Make sure your database has the <code>events</code> table with the correct schema</li>
              <li>Check that Row Level Security (RLS) policies allow public access to events</li>
              <li>Verify network connectivity to Supabase servers</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseDebug;
