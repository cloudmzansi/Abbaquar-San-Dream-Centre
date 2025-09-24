import { supabase, getOptimizedImageUrl } from './supabase';
import { GalleryImage } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { convertToBestFormat } from './imageUtils';
import { getCachedData, invalidateCachePattern } from './cacheService';
import { isAuthenticated } from './authService';

const BUCKET_NAME = 'gallery';

// Get all gallery images with optional filtering by category
export async function getGalleryImages(category?: string): Promise<GalleryImage[]> {
  const cacheKey = `gallery_${category || 'all'}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
      
      if (category && category !== 'All') {
        query = query.eq('category', category.toLowerCase());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching gallery images:', error);
        throw error;
      }
      
      // Transform data to include optimized image URLs with better compression
      const transformedData = data.map(image => ({
        ...image,
        image_path: getOptimizedImageUrl(BUCKET_NAME, image.image_path, 800, 85, 'webp')
      }));
      
      return transformedData;
    } catch (err) {
      console.error('Error in getGalleryImages:', err);
      throw err;
    }
  }, 5 * 60 * 1000); // 5 minute cache
}

// Get gallery images with pagination for admin interface
export async function getGalleryImagesPaginated(
  page: number = 1,
  limit: number = 20,
  category?: string
): Promise<{ data: GalleryImage[]; total: number; page: number; totalPages: number }> {
  const cacheKey = `gallery_paginated_${page}_${limit}_${category || 'all'}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      let query = supabase.from('gallery').select('*', { count: 'exact' });
      
      if (category && category !== 'All') {
        query = query.eq('category', category.toLowerCase());
      }
      
      // Add pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.order('created_at', { ascending: false })
                  .range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform data to include optimized image URLs with better compression
      const transformedData = data.map(image => ({
        ...image,
        image_path: getOptimizedImageUrl(BUCKET_NAME, image.image_path, 800, 85, 'webp')
      }));
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: transformedData,
        total: count || 0,
        page,
        totalPages
      };
    } catch (err) {
      console.error('Error fetching paginated gallery images:', err);
      throw err;
    }
  }, 2 * 60 * 1000); // 2 minute cache for admin data
}

// Upload an image to storage and add record to the gallery table
export async function uploadGalleryImage(
  file: File,
  category: 'events' | 'activities' | 'community',
  title?: string,
  altText?: string
): Promise<GalleryImage> {
  // Ensure user is authenticated before upload
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error('You must be logged in to upload images.');
  }
  try {
    // Convert image to optimized format
    const convertedImage = await convertToBestFormat(file);
    
    // Generate unique filename
    const fileExt = 'avif'; // Always use AVIF for consistency
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, convertedImage, {
        contentType: 'image/avif',
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }
    
    // Create gallery record
    const { data, error: dbError } = await supabase
      .from('gallery')
      .insert({
        image_path: fileName,
        category,
        title: title || '',
        alt_text: altText || ''
      })
      .select()
      .single();
      
    if (dbError) {
      console.error('Error creating gallery record:', dbError);
      throw dbError;
    }
    
    // Invalidate related caches
    invalidateCachePattern('gallery_');
    
    return {
      ...data,
      image_path: getOptimizedImageUrl(BUCKET_NAME, data.image_path)
    };
  } catch (error) {
    console.error('Error in uploadGalleryImage:', error);
    throw error;
  }
}

// Delete a gallery image
export async function deleteGalleryImage(id: string): Promise<void> {
  try {
    // First get the image to get the file path
    const { data: image, error: fetchError } = await supabase
      .from('gallery')
      .select('image_path')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching image for deletion:', fetchError);
      throw fetchError;
    }
    
    // Delete from storage
    if (image.image_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([image.image_path]);
        
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Don't throw here, continue with database deletion
      }
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);
      
    if (dbError) {
      console.error('Error deleting gallery record:', dbError);
      throw dbError;
    }
    
    // Invalidate related caches
    invalidateCachePattern('gallery_');
  } catch (error) {
    console.error('Error in deleteGalleryImage:', error);
    throw error;
  }
}

// Update gallery image metadata
export async function updateGalleryImage(
  id: string,
  updates: Partial<Omit<GalleryImage, 'id' | 'created_at' | 'image_path'>>
): Promise<GalleryImage> {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating gallery image:', error);
      throw error;
    }
    
    // Invalidate related caches
    invalidateCachePattern('gallery_');
    
    return {
      ...data,
      image_path: getOptimizedImageUrl(BUCKET_NAME, data.image_path)
    };
  } catch (error) {
    console.error('Error in updateGalleryImage:', error);
    throw error;
  }
} 