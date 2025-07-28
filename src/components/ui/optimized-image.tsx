import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width = 800,
  height,
  quality = 80,
  format = 'webp',
  priority = false,
  loading = 'lazy',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [error, setError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL
  const getOptimizedUrl = (imageSrc: string, targetWidth: number, targetQuality: number, targetFormat: string) => {
    if (!imageSrc) return '';
    
    // If it's already a Supabase URL with transformations, return as is
    if (imageSrc.includes('storage/v1/object/public') && imageSrc.includes('width=')) {
      return imageSrc;
    }
    
    // If it's a Supabase URL, add transformations
    if (imageSrc.includes('storage/v1/object/public')) {
      const separator = imageSrc.includes('?') ? '&' : '?';
      return `${imageSrc}${separator}width=${targetWidth}&quality=${targetQuality}&format=${targetFormat}`;
    }
    
    // For external URLs, return as is (no transformations)
    return imageSrc;
  };

  // Generate low-res placeholder URL
  const getLowResUrl = (imageSrc: string) => {
    if (!imageSrc) return '';
    return getOptimizedUrl(imageSrc, 50, 30, 'webp');
  };

  useEffect(() => {
    if (!src) return;

    // Set initial low-res image
    setCurrentSrc(getLowResUrl(src));

    // Set up intersection observer for lazy loading
    if (!priority && loading === 'lazy' && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              observerRef.current?.disconnect();
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      setIsIntersecting(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, priority, loading]);

  useEffect(() => {
    if (isIntersecting && src) {
      // Load high-res image
      const highResUrl = getOptimizedUrl(src, width, quality, format);
      setCurrentSrc(highResUrl);
    }
  }, [isIntersecting, src, width, quality, format]);

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
    
    // Fallback to original URL if optimized URL fails
    if (currentSrc !== src) {
      setCurrentSrc(src);
    }
  };

  if (error && !src) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto'
        }}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 