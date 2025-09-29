import React from 'react';

interface OptionCardSkeletonProps {
  variant?: 'default' | 'compact' | 'featured';
  size?: 'small' | 'medium' | 'large';
  count?: number;
}

const OptionCardSkeleton: React.FC<OptionCardSkeletonProps> = ({
  variant = 'default',
  size = 'medium',
  count = 1
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-4 min-h-[160px] min-w-[240px]';
      case 'large':
        return 'p-8 min-h-[260px] min-w-[320px]';
      default:
        return 'p-6 min-h-[200px] min-w-[280px]';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'grid grid-cols-1 gap-3';
      case 'featured':
        return 'grid grid-rows-[1fr_auto] gap-4';
      default:
        return 'flex flex-col';
    }
  };

  const SkeletonCard = () => (
    <div 
      className={`
        bg-white rounded-lg shadow-md border-2 border-gray-200 
        ${getSizeClasses()} ${getVariantClasses()}
        animate-pulse
      `}
      role="status"
      aria-label="Loading option card"
    >
      {/* Image Skeleton */}
      <div className={`
        bg-gray-200 rounded-md 
        ${variant === 'featured' ? 'h-48' : 'h-32'}
        ${variant === 'compact' ? 'w-full' : 'mb-4'}
      `} />
      
      {/* Content Skeleton */}
      <div className="flex-1 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Price */}
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        
        {/* SKU */}
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        
        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
      
      {/* Actions Skeleton */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
      
      {/* Screen reader text */}
      <span className="sr-only">Loading option details...</span>
    </div>
  );

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </>
  );
};

export default OptionCardSkeleton;