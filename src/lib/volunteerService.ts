import { supabase, getOptimizedImageUrl } from './supabase';
import { Volunteer } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { convertToBestFormat } from './imageUtils';
import { getCachedData, invalidateCachePattern } from './cacheService';

const BUCKET_NAME = 'volunteers';

// Helper function to get image URL (handles both static assets and uploaded images)
const getVolunteerImageUrl = (imagePath: string | null): string | undefined => {
  if (!imagePath) return undefined;
  
  // If it's a static asset (starts with /assets/), return as is
  if (imagePath.startsWith('/assets/')) {
    return imagePath;
  }
  
  // If it's an uploaded image, get optimized URL
  return getOptimizedImageUrl(BUCKET_NAME, imagePath);
};

// Get all active volunteers
export async function getVolunteers(): Promise<Volunteer[]> {
  const cacheKey = 'volunteers';
  
  return getCachedData(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform data to include optimized image URLs
      const transformedData = data.map(volunteer => ({
        ...volunteer,
        image_path: getVolunteerImageUrl(volunteer.image_path)
      }));
      
      return transformedData;
    } catch (err) {
      console.error('Error fetching volunteers:', err);
      throw err;
    }
  }, 10 * 60 * 1000); // 10 minute cache
}

// Get all volunteers for admin interface (including inactive)
export async function getAllVolunteers(): Promise<Volunteer[]> {
  const cacheKey = 'volunteers_all';
  
  return getCachedData(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform data to include optimized image URLs
      const transformedData = data.map(volunteer => ({
        ...volunteer,
        image_path: getVolunteerImageUrl(volunteer.image_path)
      }));
      
      return transformedData;
    } catch (err) {
      console.error('Error fetching all volunteers:', err);
      throw err;
    }
  }, 5 * 60 * 1000); // 5 minute cache for admin data
}

// Get a single volunteer by ID
export async function getVolunteer(id: string): Promise<Volunteer> {
  const cacheKey = `volunteer_${id}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return {
        ...data,
        image_path: getVolunteerImageUrl(data.image_path)
      };
    } catch (err) {
      console.error('Error fetching volunteer:', err);
      throw err;
    }
  }, 10 * 60 * 1000); // 10 minute cache for individual volunteers
}

// Create a new volunteer
export async function createVolunteer(
  volunteer: Omit<Volunteer, 'id' | 'created_at' | 'updated_at'>,
  imageFile?: File
): Promise<Volunteer> {
  let filePath = volunteer.image_path;
  
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
  
  // Create the volunteer record
  const { data, error } = await supabase
    .from('volunteers')
    .insert({
      ...volunteer,
      image_path: filePath
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Invalidate cache
  invalidateCachePattern('volunteers');
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Update a volunteer
export async function updateVolunteer(
  id: string,
  updates: Partial<Omit<Volunteer, 'id' | 'created_at' | 'updated_at'>>,
  imageFile?: File
): Promise<Volunteer> {
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
  
  // Update the volunteer record
  const { data, error } = await supabase
    .from('volunteers')
    .update({
      ...updates,
      image_path: filePath
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  // Invalidate cache
  invalidateCachePattern('volunteers');
  invalidateCachePattern(`volunteer_${id}`);
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Delete a volunteer
export async function deleteVolunteer(id: string): Promise<void> {
  // Get the volunteer first to delete their image
  const volunteer = await getVolunteer(id);
  
  // Delete the image if it exists
  if (volunteer.image_path) {
    await supabase.storage.from(BUCKET_NAME).remove([volunteer.image_path]);
  }
  
  // Delete the volunteer record
  const { error } = await supabase
    .from('volunteers')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  
  // Invalidate cache
  invalidateCachePattern('volunteers');
  invalidateCachePattern(`volunteer_${id}`);
}

// Update volunteer order
export async function updateVolunteerOrder(volunteers: { id: string; sort_order: number }[]): Promise<void> {
  try {
    // Update each volunteer's sort order
    for (const volunteer of volunteers) {
      const { error } = await supabase
        .from('volunteers')
        .update({ sort_order: volunteer.sort_order })
        .eq('id', volunteer.id);
        
      if (error) throw error;
    }
    
    // Invalidate cache
    invalidateCachePattern('volunteers');
  } catch (err) {
    console.error('Error updating volunteer order:', err);
    throw err;
  }
}
