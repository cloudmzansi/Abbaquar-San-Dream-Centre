import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'skeleton' | 'dots';
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  className,
  size = 'lg',
  variant = 'spinner',
  text,
}) => {
  const baseClasses = 'flex items-center justify-center';
  const sizeClass = sizeClasses[size];

  if (variant === 'skeleton') {
    return (
      <div className={cn(baseClasses, 'w-full', className)}>
        <div className={cn('animate-pulse rounded-xl bg-muted', sizeClass)} />
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn(baseClasses, 'space-x-1', className)}>
        <div className="animate-bounce h-2 w-2 bg-current rounded-full" />
        <div className="animate-bounce h-2 w-2 bg-current rounded-full [animation-delay:0.1s]" />
        <div className="animate-bounce h-2 w-2 bg-current rounded-full [animation-delay:0.2s]" />
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={cn(baseClasses, 'w-full', className)}>
      <div className={cn('animate-spin rounded-full border-2 border-muted border-t-primary', sizeClass)} />
      {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// Convenience components for common use cases
export const PageLoadingFallback: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="h-screen w-full flex items-center justify-center">
    <LoadingFallback size="xl" text={text} />
  </div>
);

export const CardLoadingFallback: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="h-48 w-full flex items-center justify-center">
    <LoadingFallback size="lg" text={text} />
  </div>
);

export const SkeletonFallback: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-xl bg-muted h-12 w-12', className)} />
);

export default LoadingFallback;
