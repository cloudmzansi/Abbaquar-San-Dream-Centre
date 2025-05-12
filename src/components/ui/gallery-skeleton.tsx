import { Skeleton } from './skeleton';

/**
 * GallerySkeleton component
 * Provides a visual placeholder while the Gallery is loading
 * Improves perceived performance and reduces layout shift
 */
export function GallerySkeleton() {
  // Create an array of 8 items for the skeleton grid
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);
  
  return (
    <div className="container mx-auto py-12">
      <div className="space-y-4 mb-8">
        <Skeleton className="h-10 w-3/4 max-w-md" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {skeletonItems.map((item) => (
          <div key={item} className="flex flex-col space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default GallerySkeleton;
