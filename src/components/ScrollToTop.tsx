import { useEffect, useRef, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollTop } from '../hooks/use-scroll-top';

/**
 * ScrollToTop component that forcefully scrolls the window to the top when the route changes
 * This ensures that when users navigate between pages, they always start at the top
 * of the new page, providing a more natural browsing experience.
 * 
 * Performance optimized with:
 * - React.memo to prevent unnecessary re-renders
 * - Reduced number of timeout calls
 * - Performance measurement for debugging
 */
const ScrollToTop = memo(() => {
  const { pathname } = useLocation();
  const lastPathRef = useRef(pathname);
  const { scrollToTop } = useScrollTop();
  
  useEffect(() => {
    // Only scroll when the path actually changes (not on initial render)
    if (lastPathRef.current !== pathname) {
      // Mark the start time for performance measurement
      const startTime = performance.now();
      
      // Use the optimized scrollToTop function from our hook
      scrollToTop();
      
      // Only use one additional timeout as a fallback for edge cases
      // This reduces the number of unnecessary function calls
      const timeoutId = setTimeout(() => {
        scrollToTop();
        
        // Measure and log the performance in development only
        if (import.meta.env.DEV) {
          const endTime = performance.now();
          console.log(`ScrollToTop execution time: ${endTime - startTime}ms`);
        }
      }, 100);
      
      // Update the ref to the current path
      lastPathRef.current = pathname;
      
      // Clean up timeout
      return () => clearTimeout(timeoutId);
    }
  }, [pathname, scrollToTop]);

  return null; // This component doesn't render anything
});

export default ScrollToTop;
