import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for navigation with automatic scroll to top
 * This ensures consistent scrolling behavior across the application
 * 
 * @returns An object with:
 * - navigateTo: function that handles both navigation and scrolling
 * - scrollToTop: function that just handles scrolling to top
 */
export const useScrollTop = () => {
  const navigate = useNavigate();
  
  /**
   * Efficiently scrolls the window to the top with cross-browser compatibility
   * Uses multiple methods to ensure scrolling works in all browsers
   */
  const scrollToTop = useCallback(() => {
    // Use smooth scrolling for better user experience
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Also set these properties directly for older browsers
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // For Safari
  }, []);
  
  const navigateTo = useCallback((path: string) => {
    // First navigate to the path
    navigate(path);
    
    // Then use our scrollToTop function
    scrollToTop();
    
    // Also set a small timeout to handle any race conditions
    setTimeout(scrollToTop, 50);
  }, [navigate, scrollToTop]);
  
  return { navigateTo, scrollToTop };
};

export default useScrollTop;
