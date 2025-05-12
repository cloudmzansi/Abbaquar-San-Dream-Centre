import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Define variables to be exported
let supabase: any;
let getOptimizedImageUrl: any;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  // Graceful handling for missing variables
  console.warn('Supabase environment variables are not set. Functionality will be limited.');
  // Return a dummy client or handle gracefully
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null } }),
      signUp: async () => ({ data: { user: null }, error: new Error('Supabase not configured') })
    },
    from: () => ({ select: async () => ({ data: [], count: 0, error: new Error('Supabase not configured') }) }),
    storage: { from: () => ({ getPublicUrl: () => ({ publicUrl: '' }) }) }
  };
  getOptimizedImageUrl = () => '';
  // Stop further initialization
  throw new Error('Supabase environment variables are not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
} else {
  // Create a single supabase client for interacting with your database
  // with optimized settings for better performance
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      // Optimize fetch settings
      fetch: (...args) => {
        // @ts-ignore - args typing issue with fetch
        return fetch(...args);
      }
    },
    // Add better debug information in development
    ...(process.env.NODE_ENV !== 'production' && {
      debug: false // Set to true only when actively debugging Supabase issues
    })
  });

  // Image URL cache to avoid redundant URL generation
  const imageUrlCache = new Map<string, string>();

  /**
   * Get optimized image URL with transformations and caching
   * @param bucket Storage bucket name
   * @param path Path to the image in the bucket
   * @param width Desired image width
   * @param quality Image quality (1-100)
   * @param format Image format (webp, jpeg, png)
   * @returns Optimized image URL
   */
  getOptimizedImageUrl = (
    bucket: string,
    path: string,
    width = 800,
    quality = 80,
    format = 'webp'
  ): string => {
    if (!path) return '';
    
    // Create a cache key based on all parameters
    const cacheKey = `${bucket}/${path}/${width}/${quality}/${format}`;
    
    // Check if URL is already in cache
    if (imageUrlCache.has(cacheKey)) {
      return imageUrlCache.get(cacheKey) as string;
    }
    
    // Generate and cache the URL
    const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}?width=${width}&quality=${quality}&format=${format}`;
    imageUrlCache.set(cacheKey, url);
    
    return url;
  }; 
}

// Export variables outside conditional block
export { supabase, getOptimizedImageUrl };