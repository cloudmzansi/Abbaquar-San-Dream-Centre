import { useState, useEffect } from 'react';
import { LoadingSpinner } from './loading-spinner';
import useOptimizedImage from '@/hooks/use-optimized-image';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * OptimizedImage component for better Core Web Vitals
 * Improves LCP (Largest Contentful Paint) and CLS (Cumulative Layout Shift)
 * by properly handling image loading and providing visual feedback
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  priority = false,
  sizes,
  width,
  height,
  ...props
}: OptimizedImageProps) {
  // Use our custom hook for optimized image loading
  const { imageProps, isLoaded, error } = useOptimizedImage({
    src: src || '',
    fallbackSrc,
    priority,
  });

  // Determine if we should show the loading spinner
  const showSpinner = !isLoaded && !error;

  return (
    <div className="relative" style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}>
      {showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <img
        src={imageProps.src}
        alt={alt}
        className={`${className} ${imageProps.className}`}
        width={width}
        height={height}
        sizes={sizes}
        loading={imageProps.loading as 'eager' | 'lazy'}
        decoding={imageProps.decoding}
        fetchPriority={imageProps.fetchPriority as 'high' | 'low' | 'auto'}
        onLoad={imageProps.onLoad}
        onError={imageProps.onError}
        {...props}
      />
    </div>
  );
} 