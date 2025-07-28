import { supabase, getOptimizedImageUrl } from './supabase';
import { Event } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { getCachedData, invalidateCachePattern } from './cacheService';
import { isAuthenticated } from './authService';

const BUCKET_NAME = 'events';

/**
 * Get events with optional filtering by display location
 * Uses enhanced caching to reduce API calls and improve performance
 */
export async function getEvents(displayOn?: 'home' | 'events' | 'both'): Promise<Event[]> {
  const cacheKey = `events_${displayOn || 'all'}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      let query = supabase.from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (displayOn) {
        // Use more efficient query with indexed columns
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
  }, 5 * 60 * 1000); // 5 minute cache
}

// Get events with pagination for admin interface
export async function getEventsPaginated(
  page: number = 1,
  limit: number = 20,
  displayOn?: 'home' | 'events' | 'both'
): Promise<{ data: Event[]; total: number; page: number; totalPages: number }> {
  const cacheKey = `events_paginated_${page}_${limit}_${displayOn || 'all'}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      let query = supabase.from('events').select('*', { count: 'exact' });
      
      if (displayOn) {
        query = query.or(`display_on.eq.${displayOn},display_on.eq.both`);
      }
      
      // Add pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.order('date', { ascending: true })
                  .range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform data to include optimized image URLs
      const transformedData = data.map(event => ({
        ...event,
        image_path: event.image_path ? getOptimizedImageUrl(BUCKET_NAME, event.image_path) : undefined
      }));
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: transformedData,
        total: count || 0,
        page,
        totalPages
      };
    } catch (err) {
      console.error('Error fetching paginated events:', err);
      throw err;
    }
  }, 2 * 60 * 1000); // 2 minute cache for admin data
}

// Get a single event by ID
export async function getEvent(id: string): Promise<Event> {
  const cacheKey = `event_${id}`;
  
  return getCachedData(cacheKey, async () => {
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
  }, 10 * 60 * 1000); // 10 minute cache for individual events
}

// Create a new event
export async function createEvent(
  event: Omit<Event, 'id' | 'created_at'>,
  imageFile?: File
): Promise<Event> {
  // Ensure user is authenticated before event creation
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error('You must be logged in to create events.');
  }
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
  
  // Invalidate related caches
  invalidateCachePattern('events_');
  
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
  // Ensure user is authenticated before event update
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error('You must be logged in to update events.');
  }
  let filePath = updates.image_path;
  
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
  
  // Invalidate related caches
  invalidateCachePattern('events_');
  invalidateCachePattern(`event_${id}`);
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Delete an event
export async function deleteEvent(id: string): Promise<void> {
  // Ensure user is authenticated before event deletion
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error('You must be logged in to delete events.');
  }
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
      // Don't throw here, continue with database deletion
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
  
  // Invalidate related caches
  invalidateCachePattern('events_');
  invalidateCachePattern(`event_${id}`);
} 