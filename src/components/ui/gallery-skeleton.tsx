import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  width, 
  height, 
  rounded = true 
}) => (
  <div
    className={cn(
      'animate-pulse bg-gray-200',
      rounded && 'rounded',
      className
    )}
    style={{
      width: width,
      height: height
    }}
  />
);

interface GallerySkeletonProps {
  count?: number;
  className?: string;
}

const GallerySkeleton: React.FC<GallerySkeletonProps> = ({ 
  count = 6, 
  className 
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="w-full aspect-square" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface ActivitySkeletonProps {
  count?: number;
  className?: string;
}

const ActivitySkeleton: React.FC<ActivitySkeletonProps> = ({ 
  count = 4, 
  className 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex space-x-4 p-4 border rounded-lg">
          <Skeleton className="w-20 h-20 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface EventSkeletonProps {
  count?: number;
  className?: string;
}

const EventSkeleton: React.FC<EventSkeletonProps> = ({ 
  count = 3, 
  className 
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border rounded-lg p-6">
          <div className="flex space-x-4">
            <Skeleton className="w-24 h-24 rounded" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface DashboardSkeletonProps {
  className?: string;
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg border">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => {
  return (
    <div className={cn('bg-white rounded-lg border overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export {
  Skeleton,
  GallerySkeleton,
  ActivitySkeleton,
  EventSkeleton,
  DashboardSkeleton,
  TableSkeleton
};
