import { supabase } from './supabase';
import { getCachedData, invalidateCachePattern } from './cacheService';

// Cache for dashboard data
let dashboardCache: any = null;
const CACHE_EXPIRATION = 2 * 60 * 1000; // 2 minutes

// Get dashboard data with optimized batch queries
export async function getDashboardData() {
  const cacheKey = 'dashboard_data';
  
  return getCachedData(cacheKey, async () => {
    try {
      // Use batch queries for better performance
      const batchQueries = [
        supabase.from('gallery').select('id, title, created_at').limit(3),
        supabase.from('activities').select('id, title, created_at').limit(3),
        supabase.from('events').select('id, title, created_at').limit(3)
      ];

      const results = await Promise.allSettled(batchQueries);
      
      // Extract data and handle errors gracefully
      let gallery: any[] = [];
      let activities: any[] = [];
      let events: any[] = [];
      
      if (results[0].status === 'fulfilled') {
        gallery = results[0].value.data || [];
      }
      if (results[1].status === 'fulfilled') {
        activities = results[1].value.data || [];
      }
      if (results[2].status === 'fulfilled') {
        events = results[2].value.data || [];
      }
      
      // Get counts with optimized queries
      const countQueries = [
        supabase.from('gallery').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true })
      ];
      
      const countResults = await Promise.allSettled(countQueries);
      
      const counts = {
        gallery: countResults[0].status === 'fulfilled' ? countResults[0].value.count || 0 : 0,
        activities: countResults[1].status === 'fulfilled' ? countResults[1].value.count || 0 : 0,
        events: countResults[2].status === 'fulfilled' ? countResults[2].value.count || 0 : 0
      };
      
      // Combine recent activity
      const recentActivity = [
        ...gallery.map((item: any) => ({ ...item, type: 'gallery', title: item.title || 'Gallery Image' })),
        ...activities.map((item: any) => ({ ...item, type: 'activity', title: item.title || 'Activity' })),
        ...events.map((item: any) => ({ ...item, type: 'event', title: item.title || 'Event' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 10);
      
      return {
        counts,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }, CACHE_EXPIRATION);
}

// Get optimized dashboard data with better error handling
export async function getDashboardDataOptimized() {
  try {
    // Use a single optimized query for counts
    const { data: countsData, error: countsError } = await supabase
      .rpc('get_dashboard_counts');
    
    if (countsError) {
      console.error('Error fetching dashboard counts:', countsError);
      // Fallback to individual queries
      return await getDashboardData();
    }
    
    // Get recent activity with optimized query
    const { data: recentData, error: recentError } = await supabase
      .rpc('get_recent_activity', { limit_count: 10 });
    
    if (recentError) {
      console.error('Error fetching recent activity:', recentError);
      // Fallback to individual queries
      return await getDashboardData();
    }
    
    return {
      counts: countsData,
      recentActivity: recentData
    };
  } catch (error) {
    console.error('Error in optimized dashboard query:', error);
    // Fallback to standard method
    return await getDashboardData();
  }
}

// Invalidate dashboard cache
export function invalidateDashboardCache() {
  invalidateCachePattern('dashboard_');
}

// Get system health status
export async function getSystemHealth() {
  const cacheKey = 'system_health';
  
  return getCachedData(cacheKey, async () => {
    try {
      const healthChecks = await Promise.allSettled([
        // Database health check
        supabase.from('events').select('id', { count: 'exact', head: true }).limit(1),
        // Storage health check
        supabase.storage.from('gallery').list('', { limit: 1 }),
        // Auth health check
        supabase.auth.getSession()
      ]);
      
      const [dbCheck, storageCheck, authCheck] = healthChecks;
      
      return {
        database: {
          status: dbCheck.status === 'fulfilled' ? 'online' : 'offline',
          message: dbCheck.status === 'fulfilled' ? 'Connected' : 'Connection failed'
        },
        storage: {
          status: storageCheck.status === 'fulfilled' ? 'online' : 'offline',
          message: storageCheck.status === 'fulfilled' ? 'Connected' : 'Connection failed'
        },
        authentication: {
          status: authCheck.status === 'fulfilled' ? 'online' : 'offline',
          message: authCheck.status === 'fulfilled' ? 'Connected' : 'Connection failed'
        }
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        database: { status: 'offline', message: 'Health check failed' },
        storage: { status: 'offline', message: 'Health check failed' },
        authentication: { status: 'offline', message: 'Health check failed' }
      };
    }
  }, 30 * 1000); // 30 second cache for health checks
}

// Get performance metrics
export async function getPerformanceMetrics() {
  const cacheKey = 'performance_metrics';
  
  return getCachedData(cacheKey, async () => {
    try {
      // Get cache statistics
      const { getCacheStats } = await import('./cacheService');
      const cacheStats = getCacheStats();
      
      // Get database performance metrics
      const startTime = performance.now();
      const { data, error } = await supabase
        .from('events')
        .select('id')
        .limit(1);
      const queryTime = performance.now() - startTime;
      
      return {
        cache: cacheStats,
        database: {
          queryTime: Math.round(queryTime),
          status: error ? 'error' : 'healthy',
          error: error?.message
        },
        memory: {
          used: performance.memory?.usedJSHeapSize || 0,
          total: performance.memory?.totalJSHeapSize || 0,
          limit: performance.memory?.jsHeapSizeLimit || 0
        }
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        cache: { totalEntries: 0, expiredEntries: 0, averageAccessCount: 0, memoryUsage: 0 },
        database: { queryTime: 0, status: 'error', error: 'Failed to get metrics' },
        memory: { used: 0, total: 0, limit: 0 }
      };
    }
  }, 60 * 1000); // 1 minute cache for performance metrics
}