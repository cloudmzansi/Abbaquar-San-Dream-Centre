import { supabase, getOptimizedImageUrl } from './supabase';
import { GalleryImage } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { convertToBestFormat } from './imageUtils';

const BUCKET_NAME = 'gallery';

// Get all gallery images with optional filtering by category
export async function getGalleryImages(category?: string): Promise<GalleryImage[]> {
  let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
  
  if (category && category !== 'All') {
    query = query.eq('category', category.toLowerCase());
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
  
  // Transform data to include optimized image URLs
  return data.map(image => ({
    ...image,
    image_path: getOptimizedImageUrl(BUCKET_NAME, image.image_path)
  }));
}

// Upload an image to storage and add record to the gallery table
export async function uploadGalleryImage(
  file: File,
  category: 'events' | 'activities' | 'community',
  title?: string,
  altText?: string
): Promise<GalleryImage> {
  try {
    // Convert to AVIF format for better compression and quality
    const convertedImage = await convertToBestFormat(file);
    
    // Always use .avif extension for consistency
    const filePath = `${uuidv4()}.avif`;
    
    // Upload file to the storage bucket
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, convertedImage, {
        contentType: 'image/avif',
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    // Create record in the gallery table
    const { data, error: insertError } = await supabase
      .from('gallery')
      .insert({
        image_path: filePath,
        category,
        title,
        alt_text: altText
      })
      .select()
      .single();
      
    if (insertError) throw insertError;
    
    // Return the newly created gallery image
    return {
      ...data,
      image_path: getOptimizedImageUrl(BUCKET_NAME, data.image_path)
    };
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    throw error;
  }
}

// Update a gallery image metadata
export async function updateGalleryImage(
  id: string, 
  updates: { category?: string; title?: string; alt_text?: string }
): Promise<GalleryImage> {
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
  
  return {
    ...data,
    image_path: getOptimizedImageUrl(BUCKET_NAME, data.image_path)
  };
}

// Delete a gallery image and its associated file
export async function deleteGalleryImage(id: string): Promise<void> {
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
  
  // Delete the file from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([image.image_path]);
    
  if (storageError) {
    console.error('Error deleting file from storage:', storageError);
    throw storageError;
  }
  
  // Delete the record from the database
  const { error: dbError } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id);
    
  if (dbError) {
    console.error('Error deleting gallery record:', dbError);
    throw dbError;
  }
} 