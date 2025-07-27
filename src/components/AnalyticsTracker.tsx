import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/use-analytics';

interface AnalyticsTrackerProps {
  children: React.ReactNode;
}

const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ children }) => {
  const location = useLocation();
  const analytics = useAnalytics();

  // Track page views automatically
  useEffect(() => {
    // The useAnalytics hook already handles page view tracking
    // This component just ensures the hook is initialized
  }, [location.pathname]);

  return <>{children}</>;
};

export default AnalyticsTracker; 