import { lazy, Suspense, ComponentType } from 'react';

/**
 * Creates a lazily loaded component with a fallback
 * This helps reduce initial bundle size and improve performance
 * 
 * @param importFn - Dynamic import function for the component
 * @param fallback - Optional fallback component to show while loading
 * @returns Lazy loaded component wrapped in Suspense
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: React.ReactNode = null
) {
  const LazyComponent = lazy(importFn);
  
  // Create a wrapper component that handles the Suspense boundary
  const LazyLoadedComponent = (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  return LazyLoadedComponent;
}

/**
 * Creates a lazily loaded component with a loading skeleton
 * This provides a better user experience than a blank loading state
 * 
 * @param importFn - Dynamic import function for the component
 * @param skeletonImportFn - Import function for the skeleton component
 * @returns Lazy loaded component with skeleton fallback
 */
export function lazyLoadWithSkeleton<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  skeletonImportFn: () => Promise<{ default: React.ComponentType<any> }>
) {
  const LazyComponent = lazy(importFn);
  const LazySkeleton = lazy(skeletonImportFn);
  
  // Create a wrapper component that handles the Suspense boundary
  const LazyLoadedComponent = (props: React.ComponentProps<T>) => (
    <Suspense fallback={
      <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted h-48"></div>}>
        <LazySkeleton />
      </Suspense>
    }>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  return LazyLoadedComponent;
}

export default lazyLoad;
