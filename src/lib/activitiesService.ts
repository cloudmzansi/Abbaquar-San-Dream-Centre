import { supabase, getOptimizedImageUrl } from './supabase';
import { Activity } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { convertToBestFormat } from './imageUtils';

const BUCKET_NAME = 'activities';

// Get activities with optional filtering by display location
export async function getActivities(displayOn?: 'home' | 'activities' | 'both'): Promise<Activity[]> {
  try {
    let query = supabase.from('activities').select('*');
    
    if (displayOn) {
      // If displayOn is specified, get items that match displayOn or 'both'
      const filterCondition = `display_on.eq.${displayOn},display_on.eq.both`;
      query = query.or(filterCondition);
    }
    
    // Order by sort_order if available, otherwise by created_at
    query = query.order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform data to include optimized image URLs
    const transformedData = data.map(activity => ({
      ...activity,
      image_path: activity.image_path ? getOptimizedImageUrl(BUCKET_NAME, activity.image_path) : undefined
    }));
    
    return transformedData;
  } catch (err) {
    throw err;
  }
}

// Get a single activity by ID
export async function getActivity(id: string): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw error;
  }
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Create a new activity
export async function createActivity(
  activity: Omit<Activity, 'id' | 'created_at'>,
  imageFile?: File
): Promise<Activity> {
  let filePath = activity.image_path;
  
  // If there's a new image file, convert and upload it
  if (imageFile) {
    // Convert to AVIF format for better compression and quality
    const convertedImage = await convertToBestFormat(imageFile);
    
    // Always use .avif extension for consistency
    filePath = `${uuidv4()}.avif`;
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, convertedImage, {
        contentType: 'image/avif',
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
  }
  
  // Create the activity record
  const { data, error } = await supabase
    .from('activities')
    .insert({
      ...activity,
      image_path: filePath
    })
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Update an activity
export async function updateActivity(
  id: string,
  updates: Partial<Omit<Activity, 'id' | 'created_at'>>,
  imageFile?: File
): Promise<Activity> {
  let filePath = updates.image_path;
  
  // If there's a new image file, convert and upload it
  if (imageFile) {
    // Convert to AVIF format for better compression and quality
    const convertedImage = await convertToBestFormat(imageFile);
    
    // Always use .avif extension for consistency
    filePath = `${uuidv4()}.avif`;
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, convertedImage, {
        contentType: 'image/avif',
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
  
  // Update the activity record
  const { data, error } = await supabase
    .from('activities')
    .update({
      ...updates,
      image_path: filePath
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Update activity sort order
export async function updateActivityOrder(id: string, sortOrder: number): Promise<void> {
  const { error } = await supabase
    .from('activities')
    .update({ sort_order: sortOrder })
    .eq('id', id);
    
  if (error) {
    throw error;
  }
}

// Delete an activity
export async function deleteActivity(id: string): Promise<void> {
  // First get the activity to get the file path
  const { data: activity, error: fetchError } = await supabase
    .from('activities')
    .select('image_path')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    throw fetchError;
  }
  
  // If the activity has an image, delete it from storage
  if (activity.image_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([activity.image_path]);
      
    if (storageError) {
      throw storageError;
    }
  }
  
  // Delete the activity record
  const { error: dbError } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);
    
  if (dbError) {
    throw dbError;
  }
} 