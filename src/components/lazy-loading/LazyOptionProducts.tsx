/**
 * Comprehensive lazy loading component for option products
 * Implements all requirements from feat-lazy-load-option-data.yaml
 */

import React, { useMemo } from 'react';
import { useOptionProductsWithMetrics } from '../../hooks/useOptionProducts';
import { OptionProductsLoadingOverlay, InlineOptionLoading } from '../loading/OptionProductsLoadingOverlay';
import { 
  OptionProductsSectionSkeleton, 
  OptionCategorySkeleton,
  InlineOptionLoadingSkeleton 
} from '../skeletons/OptionProductSkeletons';
import ProductList from '../ProductList/ProductList';
import { ConfigurableProductSchema } from '../../lib/interfaces/configurator';
import { PERFORMANCE_THRESHOLDS } from '../../lib/utils/performance-tracking-lazy-load';

interface LazyOptionProductsProps {
  /** IDs of related option products to load */
  relatedOptionIds: number[];
  
  /** Whether to show loading immediately or wait for threshold */
  showLoadingImmediately?: boolean;
  
  /** Custom loading component to show during fetch */
  loadingComponent?: React.ReactNode;
  
  /** Custom error component to show on failure */
  errorComponent?: React.ReactNode;
  
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  
  /** Whether to group products by category */
  groupByCategory?: boolean;
  
  /** Maximum number of products to show per category */
  maxProductsPerCategory?: number;
  
  /** Whether to enable fallback for no-JS environments */
  enableNoJSFallback?: boolean;
  
  /** Custom CSS classes */
  className?: string;
  
  /** Performance tracking label */
  performanceLabel?: string;
  
  /** Callback when loading completes */
  onLoadComplete?: (products: ConfigurableProductSchema[]) => void;
  
  /** Callback when loading fails */
  onLoadError?: (error: string) => void;
  
  /** Callback when loading times out */
  onLoadTimeout?: () => void;
}

/**
 * Utility function to group products by category
 */
function groupProductsByCategory(products: ConfigurableProductSchema[]): Record<string, ConfigurableProductSchema[]> {
  return products.reduce((groups, product) => {
    // Extract category from product optionType or use a default
    const category = product.optionType || 'Options';
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push(product);
    return groups;
  }, {} as Record<string, ConfigurableProductSchema[]>);
}

/**
 * Renders loading state based on duration and loading state
 */
const LoadingStateRenderer: React.FC<{
  loadingState: 'none' | 'skeleton' | 'overlay';
  loadingDuration: number;
  optionCount?: number;
  onTimeout?: () => void;
  customLoadingComponent?: React.ReactNode;
  enableNoJSFallback?: boolean;
}> = ({ 
  loadingState, 
  loadingDuration, 
  optionCount, 
  onTimeout, 
  customLoadingComponent, 
  enableNoJSFallback = true 
}) => {
  // Custom loading component takes precedence
  if (customLoadingComponent) {
    return <>{customLoadingComponent}</>;
  }

  switch (loadingState) {
    case 'skeleton':
      return <OptionProductsSectionSkeleton />;
      
    case 'overlay':
      return (
        <OptionProductsLoadingOverlay
          isVisible={true}
          duration={loadingDuration}
          optionCount={optionCount}
          onTimeout={onTimeout}
          enableNoJSFallback={enableNoJSFallback}
        />
      );
      
    default:
      // Show inline loading for very short durations
      if (loadingDuration > 100) {
        return <InlineOptionLoadingSkeleton />;
      }
      return null;
  }
};

/**
 * Error state component with retry functionality
 */
const ErrorStateRenderer: React.FC<{
  error: string;
  onRetry: () => void;
  customErrorComponent?: React.ReactNode;
}> = ({ error, onRetry, customErrorComponent }) => {
  if (customErrorComponent) {
    return <>{customErrorComponent}</>;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-800">
        <h3 className="font-semibold mb-2">Failed to Load Options</h3>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-[#f7a236] text-white px-6 py-3 rounded-[35px] font-primary font-semibold hover:bg-[#3fa2a3] transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

/**
 * Empty state component
 */
const EmptyStateRenderer: React.FC<{
  customEmptyComponent?: React.ReactNode;
}> = ({ customEmptyComponent }) => {
  if (customEmptyComponent) {
    return <>{customEmptyComponent}</>;
  }

  return (
    <div className="text-center py-12">
      <div className="text-gray-500">
        <h3 className="font-semibold mb-2">No Options Available</h3>
        <p className="text-sm">There are currently no product options to display.</p>
      </div>
    </div>
  );
};

/**
 * Main lazy option products component
 */
export const LazyOptionProducts: React.FC<LazyOptionProductsProps> = ({
  relatedOptionIds,
  showLoadingImmediately = false,
  loadingComponent,
  errorComponent,
  emptyComponent,
  groupByCategory = true,
  maxProductsPerCategory = 6,
  enableNoJSFallback = true,
  className = '',
  performanceLabel,
  onLoadComplete,
  onLoadError,
  onLoadTimeout,
}) => {
  // Use the enhanced hook with performance tracking
  const {
    products,
    loading,
    error,
    hasLoaded,
    loadingDuration,
    loadingState,
    performanceMetrics,
    fetchOptions,
  } = useOptionProductsWithMetrics(relatedOptionIds, {
    performanceLabel: performanceLabel || `lazy-options-${relatedOptionIds.join('-')}`,
    enablePerformanceTracking: true,
  });

  // Group products by category if requested
  const productGroups = useMemo(() => {
    if (!groupByCategory || products.length === 0) {
      return { 'Options': products };
    }
    
    const groups = groupProductsByCategory(products);
    
    // Limit products per category
    if (maxProductsPerCategory > 0) {
      Object.keys(groups).forEach(category => {
        groups[category] = groups[category].slice(0, maxProductsPerCategory);
      });
    }
    
    return groups;
  }, [products, groupByCategory, maxProductsPerCategory]);

  // Handle load completion callback
  React.useEffect(() => {
    if (hasLoaded && !loading && !error && products.length > 0) {
      onLoadComplete?.(products);
    }
  }, [hasLoaded, loading, error, products, onLoadComplete]);

  // Handle load error callback
  React.useEffect(() => {
    if (error) {
      onLoadError?.(error);
    }
  }, [error, onLoadError]);

  // Handle timeout callback
  React.useEffect(() => {
    if (loadingDuration > PERFORMANCE_THRESHOLDS.MAX_LOADING_DURATION) {
      onLoadTimeout?.();
    }
  }, [loadingDuration, onLoadTimeout]);

  // Don't render anything if no option IDs provided
  if (!relatedOptionIds || relatedOptionIds.length === 0) {
    return <EmptyStateRenderer customEmptyComponent={emptyComponent} />;
  }

  // Show loading state
  if (loading || (!hasLoaded && showLoadingImmediately)) {
    return (
      <LoadingStateRenderer
        loadingState={loadingState}
        loadingDuration={loadingDuration}
        optionCount={relatedOptionIds.length}
        onTimeout={onLoadTimeout}
        customLoadingComponent={loadingComponent}
        enableNoJSFallback={enableNoJSFallback}
      />
    );
  }

  // Show error state
  if (error && hasLoaded) {
    return (
      <ErrorStateRenderer
        error={error}
        onRetry={fetchOptions}
        customErrorComponent={errorComponent}
      />
    );
  }

  // Show empty state if no products loaded
  if (hasLoaded && products.length === 0) {
    return <EmptyStateRenderer customEmptyComponent={emptyComponent} />;
  }

  // Render products
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Performance metrics display (development only) */}
      {process.env.NODE_ENV === 'development' && performanceMetrics && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
          <details>
            <summary className="cursor-pointer font-semibold">
              Performance Metrics ({loadingDuration.toFixed(2)}ms)
            </summary>
            <pre className="mt-2 text-xs">
              {JSON.stringify(performanceMetrics, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Render product groups */}
      {Object.entries(productGroups).map(([category, categoryProducts]) => (
        <div key={category} className="space-y-4">
          {groupByCategory && Object.keys(productGroups).length > 1 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{category}</h3>
              <p className="text-gray-600 mb-6">
                {categoryProducts.length} option{categoryProducts.length !== 1 ? 's' : ''} available
              </p>
            </div>
          )}
          
          <ProductList products={categoryProducts as any} />
        </div>
      ))}
    </div>
  );
};

export default LazyOptionProducts;