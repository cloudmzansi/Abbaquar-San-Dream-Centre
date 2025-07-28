import { supabase, getOptimizedImageUrl } from './supabase';
import { Activity } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { convertToBestFormat } from './imageUtils';
import { invalidateDashboardCache } from './dashboardService';
import { getCachedData, invalidateCachePattern } from './cacheService';

const BUCKET_NAME = 'activities';

// Get activities with optional filtering by display location
export async function getActivities(displayOn?: 'home' | 'activities' | 'both'): Promise<Activity[]> {
  const cacheKey = `activities_${displayOn || 'all'}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      let query = supabase.from('activities').select('*');
      
      if (displayOn) {
        // Use more efficient query with indexed columns
        query = query.or(`display_on.eq.${displayOn},display_on.eq.both`);
      }
      
      // Order by sort_order if available, otherwise by created_at
      query = query.order('sort_order', { ascending: true, nullsFirst: false })
                  .order('created_at', { ascending: false });
      
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
      console.error('Error fetching activities:', err);
      throw err;
    }
  }, 5 * 60 * 1000); // 5 minute cache
}

// Get activities with pagination for admin interface
export async function getActivitiesPaginated(
  page: number = 1,
  limit: number = 20,
  displayOn?: 'home' | 'activities' | 'both'
): Promise<{ data: Activity[]; total: number; page: number; totalPages: number }> {
  const cacheKey = `activities_paginated_${page}_${limit}_${displayOn || 'all'}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      let query = supabase.from('activities').select('*', { count: 'exact' });
      
      if (displayOn) {
        query = query.or(`display_on.eq.${displayOn},display_on.eq.both`);
      }
      
      // Add pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.order('sort_order', { ascending: true, nullsFirst: false })
                  .order('created_at', { ascending: false })
                  .range(from, to);
      
      const { data, error, count } = await query;
   
      if (error) {
        throw error;
      }
      
      // Transform data to include optimized image URLs
      const transformedData = data.map(activity => ({
        ...activity,
        image_path: activity.image_path ? getOptimizedImageUrl(BUCKET_NAME, activity.image_path) : undefined
      }));
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: transformedData,
        total: count || 0,
        page,
        totalPages
      };
    } catch (err) {
      console.error('Error fetching paginated activities:', err);
      throw err;
    }
  }, 2 * 60 * 1000); // 2 minute cache for admin data
}

// Get a single activity by ID
export async function getActivity(id: string): Promise<Activity> {
  const cacheKey = `activity_${id}`;
  
  return getCachedData(cacheKey, async () => {
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
  }, 10 * 60 * 1000); // 10 minute cache for individual activities
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
  
  // Invalidate related caches
  invalidateCachePattern('activities_');
  invalidateDashboardCache();
  
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
  
  // If there's a new image file, upload it first
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
  
  // Invalidate related caches
  invalidateCachePattern('activities_');
  invalidateCachePattern(`activity_${id}`);
  invalidateDashboardCache();
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
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
      console.error('Error deleting file from storage:', storageError);
      // Don't throw here, continue with database deletion
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
  
  // Invalidate related caches
  invalidateCachePattern('activities_');
  invalidateCachePattern(`activity_${id}`);
  invalidateDashboardCache();
}

// Update activity order (for drag and drop functionality)
export async function updateActivityOrder(activities: { id: string; sort_order: number }[]): Promise<void> {
  try {
    // Use a transaction-like approach with Promise.all
    const updatePromises = activities.map(({ id, sort_order }) =>
      supabase
        .from('activities')
        .update({ sort_order })
        .eq('id', id)
    );
    
    await Promise.all(updatePromises);
    
    // Invalidate related caches
    invalidateCachePattern('activities_');
    invalidateDashboardCache();
  } catch (error) {
    console.error('Error updating activity order:', error);
    throw error;
  }
} 