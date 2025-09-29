/**
 * Skeleton loading components for option products lazy loading
 * Provides smooth loading experience while fetching option data
 */

import React from 'react';

interface SkeletonBaseProps {
  className?: string;
  animate?: boolean;
}

/**
 * Base skeleton element with shimmer animation
 */
export const SkeletonBase: React.FC<SkeletonBaseProps> = ({ 
  className = '', 
  animate = true 
}) => (
  <div 
    className={`
      bg-gray-200 rounded 
      ${animate ? 'animate-pulse' : ''} 
      ${className}
    `}
    role="presentation"
    aria-label="Loading content"
  />
);

/**
 * Skeleton for individual option product item
 */
export const OptionProductSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <div className={`border rounded-lg p-4 space-y-3 ${className}`}>
    {/* Product image skeleton */}
    <SkeletonBase className="w-full h-48 rounded-md" />
    
    {/* Product title skeleton */}
    <div className="space-y-2">
      <SkeletonBase className="h-4 w-3/4" />
      <SkeletonBase className="h-4 w-1/2" />
    </div>
    
    {/* Price skeleton */}
    <SkeletonBase className="h-6 w-24" />
    
    {/* Description skeleton */}
    <div className="space-y-2">
      <SkeletonBase className="h-3 w-full" />
      <SkeletonBase className="h-3 w-4/5" />
      <SkeletonBase className="h-3 w-2/3" />
    </div>
    
    {/* Action button skeleton */}
    <SkeletonBase className="h-10 w-full rounded-md" />
  </div>
);

/**
 * Skeleton for a list of option products
 */
interface OptionProductListSkeletonProps {
  count?: number;
  className?: string;
  layout?: 'grid' | 'list';
}

export const OptionProductListSkeleton: React.FC<OptionProductListSkeletonProps> = ({ 
  count = 3,
  className = '',
  layout = 'grid'
}) => {
  const gridClasses = layout === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div className={`${gridClasses} ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <OptionProductSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
};

/**
 * Skeleton for option category section
 */
interface OptionCategorySkeletonProps {
  className?: string;
  showHeader?: boolean;
  productCount?: number;
}

export const OptionCategorySkeleton: React.FC<OptionCategorySkeletonProps> = ({
  className = '',
  showHeader = true,
  productCount = 3
}) => (
  <div className={`space-y-6 ${className}`}>
    {showHeader && (
      <div className="space-y-2">
        {/* Category title skeleton */}
        <SkeletonBase className="h-8 w-64" />
        {/* Category description skeleton */}
        <SkeletonBase className="h-4 w-96" />
      </div>
    )}
    
    {/* Products list skeleton */}
    <OptionProductListSkeleton count={productCount} />
  </div>
);

/**
 * Comprehensive skeleton for entire option products section
 */
interface OptionProductsSectionSkeletonProps {
  categoryCount?: number;
  productsPerCategory?: number;
  className?: string;
  showTitle?: boolean;
}

export const OptionProductsSectionSkeleton: React.FC<OptionProductsSectionSkeletonProps> = ({
  categoryCount = 2,
  productsPerCategory = 3,
  className = '',
  showTitle = true
}) => (
  <div className={`space-y-12 ${className}`}>
    {showTitle && (
      <div className="text-center space-y-3">
        <SkeletonBase className="h-10 w-80 mx-auto" />
        <SkeletonBase className="h-5 w-96 mx-auto" />
      </div>
    )}
    
    {Array.from({ length: categoryCount }, (_, index) => (
      <OptionCategorySkeleton 
        key={`category-skeleton-${index}`}
        productCount={productsPerCategory}
      />
    ))}
  </div>
);

/**
 * Inline loading skeleton for when options are being fetched
 */
export const InlineOptionLoadingSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <div className={`flex items-center space-x-3 p-4 ${className}`}>
    <SkeletonBase className="w-6 h-6 rounded-full" />
    <div className="flex-1 space-y-2">
      <SkeletonBase className="h-4 w-48" />
      <SkeletonBase className="h-3 w-32" />
    </div>
  </div>
);

/**
 * Shimmer effect CSS for enhanced skeleton animation
 */
export const SkeletonShimmerStyles = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }
    
    .skeleton-shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite;
    }
  `}</style>
);

/**
 * Enhanced skeleton with shimmer effect
 */
export const ShimmerSkeleton: React.FC<SkeletonBaseProps> = ({ 
  className = '' 
}) => (
  <>
    <SkeletonShimmerStyles />
    <div 
      className={`skeleton-shimmer rounded ${className}`}
      role="presentation"
      aria-label="Loading content with shimmer effect"
    />
  </>
);

/**
 * Progressive loading skeleton that adjusts based on loading duration
 */
interface ProgressiveSkeletonProps {
  duration: number;
  children: React.ReactNode;
  className?: string;
}

export const ProgressiveSkeleton: React.FC<ProgressiveSkeletonProps> = ({
  duration,
  children,
  className = ''
}) => {
  // Show more detailed skeleton for longer loading times
  const showEnhanced = duration > 500;
  const showShimmer = duration > 1000;
  
  if (showShimmer && showEnhanced) {
    return (
      <div className={`space-y-4 ${className}`}>
        <ShimmerSkeleton className="h-8 w-3/4" />
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-5/6" />
        <ShimmerSkeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (showEnhanced) {
    return (
      <div className={`space-y-3 ${className}`}>
        <SkeletonBase className="h-6 w-2/3" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-20 w-full" />
      </div>
    );
  }
  
  return (
    <div className={className}>
      <SkeletonBase className="h-12 w-full" />
    </div>
  );
};

export default {
  SkeletonBase,
  OptionProductSkeleton,
  OptionProductListSkeleton,
  OptionCategorySkeleton,
  OptionProductsSectionSkeleton,
  InlineOptionLoadingSkeleton,
  ShimmerSkeleton,
  ProgressiveSkeleton,
};