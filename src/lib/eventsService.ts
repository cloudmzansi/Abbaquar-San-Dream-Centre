import { supabase, getOptimizedImageUrl } from './supabase';
import { Event } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'events';

// Cache for events data to reduce API calls
interface EventsCache {
  data: Event[];
  timestamp: number;
  displayOn?: 'home' | 'events' | 'both';
}

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// In-memory cache for events
let eventsCache: EventsCache | null = null;

/**
 * Get events with optional filtering by display location
 * Uses caching to reduce API calls and improve performance
 */
export async function getEvents(displayOn?: 'home' | 'events' | 'both'): Promise<Event[]> {
  try {
    // Check if we have valid cached data for this request
    const now = Date.now();
    if (
      eventsCache && 
      now - eventsCache.timestamp < CACHE_EXPIRATION &&
      (!displayOn || displayOn === eventsCache.displayOn || eventsCache.displayOn === 'both')
    ) {
      // Filter cached data if needed
      if (displayOn && displayOn !== eventsCache.displayOn) {
        return eventsCache.data.filter(event => 
          event.display_on === displayOn || event.display_on === 'both'
        );
      }
      
      // Return cached data
      return eventsCache.data;
    }
    
    // Cache miss or expired, fetch from Supabase
    let query = supabase.from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (displayOn) {
      // If displayOn is specified, get items that match displayOn or 'both'
      query = query.or(`display_on.eq.${displayOn},display_on.eq.both`);
    }
    
    const { data, error } = await query;
    
    // If there's an error or no data, fall back to local sample data
    if (error || !data || data.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using sample events data due to:', error ? 'Supabase error' : 'No events in database');
        if (error) console.error('Supabase error details:', error);
      }
      
      // Import sample events from local JSON file
      const sampleEvents = await import('../data/sampleEvents.json')
        .then(module => module.default as Event[])
        .catch(err => {
          console.error('Error loading sample events:', err);
          return [] as Event[];
        });
      
      // Filter sample events based on displayOn parameter
      let filteredEvents = sampleEvents;
      if (displayOn && displayOn !== 'both') {
        filteredEvents = sampleEvents.filter(event => 
          event.display_on === displayOn || event.display_on === 'both'
        );
      }
      
      return filteredEvents;
    }
    
    // Transform data to include optimized image URLs
    const transformedData = data.map(event => ({
      ...event,
      image_path: event.image_path ? getOptimizedImageUrl(BUCKET_NAME, event.image_path) : undefined
    }));
    
    // Update cache
    eventsCache = {
      data: transformedData,
      timestamp: now,
      displayOn
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error in getEvents:', error);
    
    // Final fallback - import sample events from local JSON file
    try {
      const sampleEvents = await import('../data/sampleEvents.json')
        .then(module => module.default as Event[]);
      
      // Filter sample events based on displayOn parameter
      let filteredEvents = sampleEvents;
      if (displayOn && displayOn !== 'both') {
        filteredEvents = sampleEvents.filter(event => 
          event.display_on === displayOn || event.display_on === 'both'
        );
      }
      
      return filteredEvents;
    } catch (fallbackError) {
      console.error('Error loading fallback sample events:', fallbackError);
      return [] as Event[]; // Return empty array as last resort
    }
  }
}

// Get a single event by ID
export async function getEvent(id: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Create a new event
export async function createEvent(
  event: Omit<Event, 'id' | 'created_at'>,
  imageFile?: File
): Promise<Event> {
  let filePath = event.image_path;
  
  // If there's a new image file, upload it first
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    filePath = `${uuidv4()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
  }
  
  // Create the event record
  const { data, error } = await supabase
    .from('events')
    .insert({
      ...event,
      image_path: filePath
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Update an event
export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'created_at'>>,
  imageFile?: File
): Promise<Event> {
  let filePath = updates.image_path;
  
  // If there's a new image file, upload it and update the path
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    filePath = `${uuidv4()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    // If upload successful, check if there was a previous image to delete
    if (!uploadError && updates.image_path) {
      // Delete the old image if it exists and is different
      await supabase.storage.from(BUCKET_NAME).remove([updates.image_path]);
    }
  }
  
  // Update the event record
  const { data, error } = await supabase
    .from('events')
    .update({
      ...updates,
      image_path: filePath
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Delete an event
export async function deleteEvent(id: string): Promise<void> {
  // First get the event to get the file path
  const { data: event, error: fetchError } = await supabase
    .from('events')
    .select('image_path')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    console.error('Error fetching event for deletion:', fetchError);
    throw fetchError;
  }
  
  // If the event has an image, delete it from storage
  if (event.image_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([event.image_path]);
      
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      throw storageError;
    }
  }
  
  // Delete the event record
  const { error: dbError } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
    
  if (dbError) {
    console.error('Error deleting event record:', dbError);
    throw dbError;
  }
} 