import { supabase } from './supabase';

// Types for analytics data
export interface PageView {
  id: string;
  session_id: string;
  page_path: string;
  page_title?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  region?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  viewport_size?: string;
  load_time?: number;
  created_at: string;
}

export interface ContentEngagement {
  id: string;
  session_id: string;
  content_type: string;
  content_id?: string;
  action_type: string;
  element_id?: string;
  page_path: string;
  ip_address?: string;
  created_at: string;
}

export interface VisitorSession {
  id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  region?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  first_page: string;
  last_page: string;
  page_count: number;
  duration_seconds?: number;
  is_bounce: boolean;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface ContentPopularity {
  id: string;
  content_type: string;
  content_id: string;
  content_title?: string;
  view_count: number;
  click_count: number;
  share_count: number;
  engagement_score: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DonationAnalytics {
  id: string;
  session_id?: string;
  amount?: number;
  currency: string;
  payment_method?: string;
  donation_page_source?: string;
  ip_address?: string;
  country?: string;
  device_type?: string;
  browser?: string;
  completed: boolean;
  created_at: string;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  topContent: Array<{ content: string; engagement: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  browserBreakdown: Array<{ browser: string; count: number }>;
  geographicData: Array<{ country: string; count: number }>;
  donationStats: {
    totalDonations: number;
    averageDonation: number;
    conversionRate: number;
  };
}

// Generate a unique session ID
export const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get client information
export const getClientInfo = () => {
  const userAgent = navigator.userAgent;
  const screen = window.screen;
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Detect device type
  let deviceType = 'desktop';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/iPad|Android/i.test(userAgent)) {
    deviceType = 'tablet';
  }

  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // Detect OS
  let os = 'unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return {
    userAgent,
    deviceType,
    browser,
    os,
    screenResolution: `${screen.width}x${screen.height}`,
    viewportSize: `${viewport.width}x${viewport.height}`
  };
};

// Track page view
export const trackPageView = async (
  sessionId: string,
  pagePath: string,
  pageTitle?: string,
  loadTime?: number
) => {
  // Don't track in development environment
  if (import.meta.env.DEV) {
    console.log('Analytics tracking disabled in development mode');
    return;
  }

  try {
    const clientInfo = getClientInfo();
    const referrer = document.referrer || undefined;

    const { error } = await supabase.from('page_views').insert({
      session_id: sessionId,
      page_path: pagePath,
      page_title: pageTitle || document.title,
      referrer,
      user_agent: clientInfo.userAgent,
      device_type: clientInfo.deviceType,
      browser: clientInfo.browser,
      os: clientInfo.os,
      screen_resolution: clientInfo.screenResolution,
      viewport_size: clientInfo.viewportSize,
      load_time: loadTime
    });

    if (error) {
      // Check if it's a table not found error
      if (error.message?.includes('404') || error.message?.includes('relation "page_views" does not exist')) {
        console.warn('Analytics tables not found. Please run the migration first.');
        return;
      }
      // Check if it's a permission error
      if (error.message?.includes('403') || error.message?.includes('permission denied')) {
        console.warn('Analytics permission error. Please check RLS policies.');
        return;
      }
      console.error('Failed to track page view:', error);
    }
  } catch (error) {
    // Don't log errors if tables don't exist yet
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('403'))) {
      console.warn('Analytics setup issue. Please check tables and policies.');
      return;
    }
    console.error('Error tracking page view:', error);
  }
};

// Track content engagement
export const trackContentEngagement = async (
  sessionId: string,
  contentType: string,
  actionType: string,
  pagePath: string,
  contentId?: string,
  elementId?: string
) => {
  try {
    const { error } = await supabase.from('content_engagement').insert({
      session_id: sessionId,
      content_type: contentType,
      content_id: contentId,
      action_type: actionType,
      element_id: elementId,
      page_path: pagePath
    });

    if (error) {
      console.error('Failed to track content engagement:', error);
    }
  } catch (error) {
    console.error('Error tracking content engagement:', error);
  }
};

// Track donation analytics
export const trackDonationAnalytics = async (
  sessionId: string,
  amount: number,
  paymentMethod: string,
  donationPageSource: string,
  completed: boolean = false
) => {
  // Don't track in development environment
  if (import.meta.env.DEV) {
    console.log('Donation analytics tracking disabled in development mode');
    return;
  }

  try {
    const clientInfo = getClientInfo();
    
    const { error } = await supabase.from('donation_analytics').insert({
      session_id: sessionId,
      amount,
      currency: 'ZAR', // Explicitly set to South African Rands
      payment_method: paymentMethod,
      donation_page_source: donationPageSource,
      device_type: clientInfo.deviceType,
      browser: clientInfo.browser,
      completed
    });

    if (error) {
      console.error('Failed to track donation analytics:', error);
    }
  } catch (error) {
    console.error('Error tracking donation analytics:', error);
  }
};

// Update content popularity
export const updateContentPopularity = async (
  contentType: string,
  contentId: string,
  contentTitle: string,
  actionType: 'view' | 'click' | 'share'
) => {
  try {
    // First, try to get existing record
    const { data: existing } = await supabase
      .from('content_popularity')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single();

    if (existing) {
      // Update existing record
      const updates: any = {
        last_viewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (actionType === 'view') updates.view_count = existing.view_count + 1;
      if (actionType === 'click') updates.click_count = existing.click_count + 1;
      if (actionType === 'share') updates.share_count = existing.share_count + 1;

      // Calculate engagement score (weighted average)
      const totalInteractions = updates.view_count + updates.click_count + updates.share_count;
      updates.engagement_score = ((updates.click_count * 2) + (updates.share_count * 3)) / totalInteractions;

      const { error } = await supabase
        .from('content_popularity')
        .update(updates)
        .eq('id', existing.id);

      if (error) {
        console.error('Failed to update content popularity:', error);
      }
    } else {
      // Create new record
      const newRecord = {
        content_type: contentType,
        content_id: contentId,
        content_title: contentTitle,
        view_count: actionType === 'view' ? 1 : 0,
        click_count: actionType === 'click' ? 1 : 0,
        share_count: actionType === 'share' ? 1 : 0,
        engagement_score: actionType === 'view' ? 0 : actionType === 'click' ? 1 : 1.5,
        last_viewed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('content_popularity')
        .insert(newRecord);

      if (error) {
        console.error('Failed to create content popularity record:', error);
      }
    }
  } catch (error) {
    console.error('Error updating content popularity:', error);
  }
};

// Get analytics summary
export const getAnalyticsSummary = async (days: number = 30): Promise<AnalyticsSummary> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Check if tables exist first
    const { error: tableCheckError } = await supabase
      .from('page_views')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      console.warn('Analytics tables not found or permission denied. Please check migration and policies.');
      return {
        totalVisitors: 0,
        totalPageViews: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        topContent: [],
        deviceBreakdown: [],
        browserBreakdown: [],
        geographicData: [],
        donationStats: {
          totalDonations: 0,
          averageDonation: 0,
          conversionRate: 0
        }
      };
    }

    // Get total visitors and page views
    const [visitorsResult, pageViewsResult] = await Promise.all([
      supabase
        .from('visitor_sessions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('page_views')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
    ]);

    // Get top pages
    const { data: topPages } = await supabase
      .from('page_views')
      .select('page_path')
      .gte('created_at', startDate.toISOString())
      .then(result => {
        if (result.data) {
          const pageCounts = result.data.reduce((acc: any, view) => {
            acc[view.page_path] = (acc[view.page_path] || 0) + 1;
            return acc;
          }, {});
          return {
            data: Object.entries(pageCounts)
              .map(([page, views]) => ({ page, views: views as number }))
              .sort((a, b) => b.views - a.views)
              .slice(0, 10)
          };
        }
        return { data: [] };
      });

    // Get top content by engagement
    const { data: topContent } = await supabase
      .from('content_popularity')
      .select('content_title, engagement_score')
      .order('engagement_score', { ascending: false })
      .limit(10);

    // Get device breakdown
    const { data: deviceData } = await supabase
      .from('page_views')
      .select('device_type')
      .gte('created_at', startDate.toISOString())
      .then(result => {
        if (result.data) {
          const deviceCounts = result.data.reduce((acc: any, view) => {
            acc[view.device_type || 'unknown'] = (acc[view.device_type || 'unknown'] || 0) + 1;
            return acc;
          }, {});
          return {
            data: Object.entries(deviceCounts).map(([device, count]) => ({
              device,
              count: count as number
            }))
          };
        }
        return { data: [] };
      });

    // Get browser breakdown
    const { data: browserData } = await supabase
      .from('page_views')
      .select('browser')
      .gte('created_at', startDate.toISOString())
      .then(result => {
        if (result.data) {
          const browserCounts = result.data.reduce((acc: any, view) => {
            acc[view.browser || 'unknown'] = (acc[view.browser || 'unknown'] || 0) + 1;
            return acc;
          }, {});
          return {
            data: Object.entries(browserCounts).map(([browser, count]) => ({
              browser,
              count: count as number
            }))
          };
        }
        return { data: [] };
      });

    // Get donation attempts (from donation_analytics table)
    const { data: donationAttempts } = await supabase
      .from('donation_analytics')
      .select('amount, completed, currency')
      .gte('created_at', startDate.toISOString());

    // Get completed donations (from donations table)
    const { data: completedDonations } = await supabase
      .from('donations')
      .select('amount_net, currency')
      .eq('payment_status', 'COMPLETE')
      .gte('created_at', startDate.toISOString());

    const totalDonations = completedDonations?.length || 0;
    const totalAttempts = donationAttempts?.length || 0;
    const totalAmount = completedDonations?.reduce((sum, d) => sum + (d.amount_net || 0), 0) || 0;
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    const conversionRate = totalAttempts > 0 ? (totalDonations / totalAttempts) * 100 : 0;

    const donationStats = {
      totalDonations,
      averageDonation,
      conversionRate
    };

    // Calculate session metrics
    const { data: sessionData } = await supabase
      .from('visitor_sessions')
      .select('duration_seconds, is_bounce')
      .gte('created_at', startDate.toISOString());

    const averageSessionDuration = sessionData?.length ?
      sessionData.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / sessionData.length : 0;

    const bounceRate = sessionData?.length ?
      (sessionData.filter(session => session.is_bounce).length / sessionData.length) * 100 : 0;

    return {
      totalVisitors: visitorsResult.count || 0,
      totalPageViews: pageViewsResult.count || 0,
      averageSessionDuration,
      bounceRate,
      topPages: topPages || [],
      topContent: topContent?.map(content => ({
        content: content.content_title || 'Unknown',
        engagement: content.engagement_score
      })) || [],
      deviceBreakdown: deviceData || [],
      browserBreakdown: browserData || [],
      geographicData: [], // TODO: Implement geographic data
      donationStats
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return {
      totalVisitors: 0,
      totalPageViews: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      topPages: [],
      topContent: [],
      deviceBreakdown: [],
      browserBreakdown: [],
      geographicData: [],
      donationStats: {
        totalDonations: 0,
        averageDonation: 0,
        conversionRate: 0
      }
    };
  }
};

// Get detailed analytics data
export const getDetailedAnalytics = async (days: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [pageViews, contentEngagement, visitorSessions, contentPopularity] = await Promise.all([
      supabase
        .from('page_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('content_engagement')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('visitor_sessions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('content_popularity')
        .select('*')
        .order('engagement_score', { ascending: false })
    ]);

    return {
      pageViews: pageViews.data || [],
      contentEngagement: contentEngagement.data || [],
      visitorSessions: visitorSessions.data || [],
      contentPopularity: contentPopularity.data || []
    };
  } catch (error) {
    console.error('Error getting detailed analytics:', error);
    return {
      pageViews: [],
      contentEngagement: [],
      visitorSessions: [],
      contentPopularity: []
    };
  }
}; 