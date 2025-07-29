import { supabase, getOptimizedImageUrl } from './supabase';
import { TeamMember } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { convertToBestFormat } from './imageUtils';
import { getCachedData, invalidateCachePattern } from './cacheService';

const BUCKET_NAME = 'team';

// Helper function to get image URL (handles both static assets and uploaded images)
const getTeamMemberImageUrl = (imagePath: string | null): string | undefined => {
  if (!imagePath) return undefined;
  
  // If it's a static asset (starts with /assets/), return as is
  if (imagePath.startsWith('/assets/')) {
    return imagePath;
  }
  
  // If it's an uploaded image, get optimized URL
  return getOptimizedImageUrl(BUCKET_NAME, imagePath);
};

// Get all active team members
export async function getTeamMembers(): Promise<TeamMember[]> {
  const cacheKey = 'team_members';
  
  return getCachedData(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform data to include optimized image URLs
      const transformedData = data.map(member => ({
        ...member,
        image_path: getTeamMemberImageUrl(member.image_path)
      }));
      
      return transformedData;
    } catch (err) {
      console.error('Error fetching team members:', err);
      throw err;
    }
  }, 10 * 60 * 1000); // 10 minute cache
}

// Get all team members for admin interface (including inactive)
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const cacheKey = 'team_members_all';
  
  return getCachedData(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform data to include optimized image URLs
      const transformedData = data.map(member => ({
        ...member,
        image_path: getTeamMemberImageUrl(member.image_path)
      }));
      
      return transformedData;
    } catch (err) {
      console.error('Error fetching all team members:', err);
      throw err;
    }
  }, 5 * 60 * 1000); // 5 minute cache for admin data
}

// Get a single team member by ID
export async function getTeamMember(id: string): Promise<TeamMember> {
  const cacheKey = `team_member_${id}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return {
        ...data,
        image_path: getTeamMemberImageUrl(data.image_path)
      };
    } catch (err) {
      console.error('Error fetching team member:', err);
      throw err;
    }
  }, 10 * 60 * 1000); // 10 minute cache for individual team members
}

// Create a new team member
export async function createTeamMember(
  member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>,
  imageFile?: File
): Promise<TeamMember> {
  let filePath = member.image_path;
  
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
  
  // Create the team member record
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      ...member,
      image_path: filePath
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Invalidate cache
  invalidateCachePattern('team_members');
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Update a team member
export async function updateTeamMember(
  id: string,
  updates: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>,
  imageFile?: File
): Promise<TeamMember> {
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
  
  // Update the team member record
  const { data, error } = await supabase
    .from('team_members')
    .update({
      ...updates,
      image_path: filePath
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  // Invalidate cache
  invalidateCachePattern('team_members');
  invalidateCachePattern(`team_member_${id}`);
  
  return {
    ...data,
    image_path: data.image_path ? getOptimizedImageUrl(BUCKET_NAME, data.image_path) : undefined
  };
}

// Delete a team member
export async function deleteTeamMember(id: string): Promise<void> {
  // Get the team member first to delete their image
  const member = await getTeamMember(id);
  
  // Delete the image if it exists
  if (member.image_path) {
    await supabase.storage.from(BUCKET_NAME).remove([member.image_path]);
  }
  
  // Delete the team member record
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  
  // Invalidate cache
  invalidateCachePattern('team_members');
  invalidateCachePattern(`team_member_${id}`);
}

// Update team member order
export async function updateTeamMemberOrder(members: { id: string; sort_order: number }[]): Promise<void> {
  try {
    // Update each team member's sort order
    for (const member of members) {
      const { error } = await supabase
        .from('team_members')
        .update({ sort_order: member.sort_order })
        .eq('id', member.id);
        
      if (error) throw error;
    }
    
    // Invalidate cache
    invalidateCachePattern('team_members');
  } catch (err) {
    console.error('Error updating team member order:', err);
    throw err;
  }
} 