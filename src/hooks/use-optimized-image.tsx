import { useState, useEffect } from 'react';

interface UseOptimizedImageProps {
  src: string;
  fallbackSrc?: string;
  priority?: boolean;
}

/**
 * Custom hook for optimized image loading
 * Helps improve Core Web Vitals (LCP and CLS) by properly handling image loading
 */
export function useOptimizedImage({
  src,
  fallbackSrc = '/placeholder.svg',
  priority = false,
}: UseOptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setImgSrc(src);
    setIsLoaded(false);
    setError(false);

    // For high priority images, preload them
    if (priority && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
      };
      img.onerror = () => {
        setError(true);
        setImgSrc(fallbackSrc);
      };
    }
  }, [src, fallbackSrc, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setImgSrc(fallbackSrc);
  };

  const imageProps = {
    src: imgSrc,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' : 'lazy' as const,
    fetchPriority: priority ? 'high' : 'auto' as const,
    decoding: 'async' as const,
    className: `${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`,
  };

  return {
    imageProps,
    isLoaded,
    error,
  };
}

export default useOptimizedImage;
