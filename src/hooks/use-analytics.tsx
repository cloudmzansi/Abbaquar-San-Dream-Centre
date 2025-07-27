import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackPageView, 
  trackContentEngagement, 
  generateSessionId, 
  getClientInfo 
} from '@/lib/analyticsService';

// Store session ID in sessionStorage to persist across page reloads
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Track page load time
const getPageLoadTime = (): number => {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return Math.round(navigation.loadEventEnd - navigation.loadEventStart);
    }
  }
  return 0;
};

export const useAnalytics = () => {
  const location = useLocation();
  const sessionId = useRef(getSessionId());
  const startTime = useRef(Date.now());
  const lastTrackedPath = useRef<string>('');

  // Track page view on route change (but only for public pages, not admin)
  useEffect(() => {
    // Don't track in development environment
    if (import.meta.env.DEV) {
      console.log('Analytics tracking disabled in development mode');
      return;
    }

    // Don't track admin page views to avoid inflating analytics
    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/admin')) {
      return;
    }

    // Don't track the same page multiple times in the same session
    if (lastTrackedPath.current === location.pathname) {
      return;
    }

    const loadTime = getPageLoadTime();
    
    // Track page view
    trackPageView(
      sessionId.current,
      location.pathname,
      document.title,
      loadTime
    );

    // Update tracking state
    lastTrackedPath.current = location.pathname;
    startTime.current = Date.now();
  }, [location.pathname]);

  // Track content engagement
  const trackEngagement = (
    contentType: string,
    actionType: string,
    contentId?: string,
    elementId?: string
  ) => {
    trackContentEngagement(
      sessionId.current,
      contentType,
      actionType,
      location.pathname,
      contentId,
      elementId
    );
  };

  // Track clicks on specific elements
  const trackClick = (contentType: string, contentId?: string, elementId?: string) => {
    trackEngagement(contentType, 'click', contentId, elementId);
  };

  // Track views of specific content
  const trackView = (contentType: string, contentId?: string, elementId?: string) => {
    trackEngagement(contentType, 'view', contentId, elementId);
  };

  // Track shares
  const trackShare = (contentType: string, contentId?: string, elementId?: string) => {
    trackEngagement(contentType, 'share', contentId, elementId);
  };

  // Track form submissions
  const trackFormSubmit = (formType: string, formId?: string) => {
    trackEngagement('form', 'submit', formId, formType);
  };

  // Track donation attempts
  const trackDonationAttempt = (amount: number, source: string) => {
    trackEngagement('donation', 'attempt', undefined, `amount_${amount}_source_${source}`);
  };

  // Track donation completion
  const trackDonationComplete = (amount: number, source: string) => {
    trackEngagement('donation', 'complete', undefined, `amount_${amount}_source_${source}`);
  };

  return {
    sessionId: sessionId.current,
    trackEngagement,
    trackClick,
    trackView,
    trackShare,
    trackFormSubmit,
    trackDonationAttempt,
    trackDonationComplete
  };
};

// Hook for tracking specific content interactions
export const useContentTracking = (contentType: string, contentId?: string) => {
  const { trackClick, trackView, trackShare } = useAnalytics();

  const handleClick = (elementId?: string) => {
    trackClick(contentType, contentId, elementId);
  };

  const handleView = (elementId?: string) => {
    trackView(contentType, contentId, elementId);
  };

  const handleShare = (elementId?: string) => {
    trackShare(contentType, contentId, elementId);
  };

  return {
    handleClick,
    handleView,
    handleShare
  };
};

// Hook for tracking form interactions
export const useFormTracking = (formType: string, formId?: string) => {
  const { trackFormSubmit } = useAnalytics();

  const handleSubmit = () => {
    trackFormSubmit(formType, formId);
  };

  return {
    handleSubmit
  };
};

// Hook for tracking donation interactions
export const useDonationTracking = () => {
  const { trackDonationAttempt, trackDonationComplete } = useAnalytics();

  const handleDonationAttempt = (amount: number, source: string) => {
    trackDonationAttempt(amount, source);
  };

  const handleDonationComplete = (amount: number, source: string) => {
    trackDonationComplete(amount, source);
  };

  return {
    handleDonationAttempt,
    handleDonationComplete
  };
}; 