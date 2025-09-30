import React from 'react';

interface OptionCardSkeletonProps {
  variant?: 'default' | 'compact' | 'featured';
  size?: 'small' | 'medium' | 'large';
  count?: number;
  enhanced?: boolean; // Phase 2: Enhanced UX Features
}

const OptionCardSkeleton: React.FC<OptionCardSkeletonProps> = ({
  variant = 'default',
  size = 'medium',
  count = 1,
  enhanced = true // Phase 2: Enable enhanced animations by default
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

  // Phase 2: Enhanced shimmer animation classes
  const getShimmerClasses = () => {
    if (!enhanced) return 'animate-pulse';
    
    return `
      animate-pulse
      before:absolute before:inset-0 before:-translate-x-full 
      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:animate-[shimmer_2s_infinite] relative overflow-hidden
    `;
  };

  const SkeletonCard = ({ index }: { index: number }) => (
    <div 
      className={`
        bg-white rounded-lg shadow-md border-2 border-gray-200 
        ${getSizeClasses()} ${getVariantClasses()}
        ${getShimmerClasses()}
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[1.02]
      `}
      style={{
        // Phase 2: Staggered animation delay for multiple cards
        animationDelay: enhanced ? `${index * 150}ms` : '0ms'
      }}
      role="status"
      aria-label="Loading option card"
    >
      {/* Image Skeleton */}
      <div className={`
        bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-md 
        ${variant === 'featured' ? 'h-48' : 'h-32'}
        ${variant === 'compact' ? 'w-full' : 'mb-4'}
        ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}
        relative overflow-hidden
      `}>
        {/* Phase 2: Enhanced shimmer overlay for image */}
        {enhanced && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        )}
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 space-y-3">
        {/* Title */}
        <div className={`
          h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 
          ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite_200ms]' : ''}
          relative overflow-hidden
        `}>
          {enhanced && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite_200ms]" />
          )}
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className={`
            h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full 
            ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite_400ms]' : ''}
            relative overflow-hidden
          `}>
            {enhanced && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite_400ms]" />
            )}
          </div>
          <div className={`
            h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 
            ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite_600ms]' : ''}
            relative overflow-hidden
          `}>
            {enhanced && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite_600ms]" />
            )}
          </div>
        </div>
        
        {/* Price */}
        <div className={`
          h-8 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 rounded w-1/2 
          ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite_800ms]' : ''}
          relative overflow-hidden
        `}>
          {enhanced && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite_800ms]" />
          )}
        </div>
        
        {/* SKU */}
        <div className={`
          h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 
          ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite_1000ms]' : ''}
          relative overflow-hidden
        `}>
          {enhanced && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite_1000ms]" />
          )}
        </div>
        
        {/* Badges */}
        <div className="flex gap-2">
          <div className={`
            h-6 bg-gradient-to-r from-green-100 via-green-50 to-green-100 rounded-full w-16 
            ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite_1200ms]' : ''}
            relative overflow-hidden
          `}>
            {enhanced && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite_1200ms]" />
            )}
          </div>
          <div className={`
            h-6 bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 rounded-full w-20 
            ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite_1400ms]' : ''}
            relative overflow-hidden
          `}>
            {enhanced && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite_1400ms]" />
            )}
          </div>
        </div>
      </div>
      
      {/* Actions Skeleton */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className={`
          h-10 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded w-full 
          ${enhanced ? 'animate-[pulse_2s_ease-in-out_infinite_1600ms]' : ''}
          relative overflow-hidden
        `}>
          {enhanced && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite_1600ms]" />
          )}
        </div>
      </div>
      
      {/* Screen reader text */}
      <span className="sr-only">Loading option details...</span>
    </div>
  );

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </>
  );
};

export default OptionCardSkeleton;