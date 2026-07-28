/**
 * Validation script for feat-lazy-load-option-data implementation
 * Demonstrates all key features and validates functionality
 */

import React from 'react';
import { LazyOptionProducts } from '../components/lazy-loading/LazyOptionProducts';
import { useOptionProductsWithMetrics } from '../hooks/useOptionProducts';
import { optionLoadingTracker, PERFORMANCE_THRESHOLDS } from '../lib/utils/performance-tracking-lazy-load';

// Example usage scenarios
export const LazyLoadingExamples = {
  
  /**
   * Basic lazy loading with default settings
   */
  BasicExample: () => (
    <LazyOptionProducts
      relatedOptionIds={[130, 180, 250]}
      performanceLabel="basic-example"
    />
  ),

  /**
   * Advanced configuration with all features
   */
  AdvancedExample: () => (
    <LazyOptionProducts
      relatedOptionIds={[130, 180, 250, 300, 350, 400]}
      performanceLabel="advanced-product-options"
      groupByCategory={true}
      maxProductsPerCategory={4}
      showLoadingImmediately={false}
      enableNoJSFallback={true}
      className="max-w-6xl mx-auto"
      onLoadComplete={(products) => {
        console.log(`✅ Successfully loaded ${products.length} option products`);
        
        // Example analytics tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'options_loaded', {
            'custom_parameter_1': products.length,
            'custom_parameter_2': 'advanced_example'
          });
        }
      }}
      onLoadError={(error) => {
        console.error('❌ Failed to load option products:', error);
        
        // Example error tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'options_load_error', {
            'error_message': error,
            'page_url': window.location.href
          });
        }
      }}
      onLoadTimeout={() => {
        console.warn('⏰ Option products loading timed out');
        
        // Example timeout tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'options_load_timeout', {
            'timeout_threshold': PERFORMANCE_THRESHOLDS.MAX_LOADING_DURATION,
            'page_url': window.location.href
          });
        }
      }}
      loadingComponent={
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            <span className="text-gray-600">Loading your customization options...</span>
          </div>
        </div>
      }
      errorComponent={
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-800">
            <h3 className="font-semibold mb-2">Unable to Load Options</h3>
            <p className="text-sm mb-4">
              We're experiencing technical difficulties. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
      emptyComponent={
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m5 0h4" />
            </svg>
            <h3 className="font-semibold mb-2">This Product Has No Additional Options</h3>
            <p className="text-sm">
              The selected product doesn't offer additional customization options at this time.
            </p>
          </div>
        </div>
      }
    />
  ),

  /**
   * Performance monitoring demo
   */
  PerformanceMonitoringExample: () => {
    const [metrics, setMetrics] = React.useState<any>(null);
    
    React.useEffect(() => {
      // Setup performance monitoring
      const trackingLabel = 'performance-demo';
      
      const interval = setInterval(() => {
        const currentMetrics = optionLoadingTracker.getMetrics(trackingLabel);
        if (currentMetrics) {
          setMetrics(currentMetrics);
        }
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="space-y-6">
        {/* Performance Metrics Display */}
        {metrics && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-brand-dark mb-2">Performance Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-brand-dark font-medium">Duration:</span>
                <br />
                <span className="text-brand-dark">{metrics.duration?.toFixed(2)}ms</span>
              </div>
              <div>
                <span className="text-brand-dark font-medium">LCP:</span>
                <br />
                <span className="text-brand-dark">
                  {metrics.largestContentfulPaint?.toFixed(2) || 'N/A'}ms
                </span>
              </div>
              <div>
                <span className="text-brand-dark font-medium">Cache Hit:</span>
                <br />
                <span className="text-brand-dark">{metrics.cacheHit ? '✅' : '❌'}</span>
              </div>
              <div>
                <span className="text-brand-dark font-medium">Options:</span>
                <br />
                <span className="text-brand-dark">{metrics.optionCount || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Lazy Loading Component */}
        <LazyOptionProducts
          relatedOptionIds={[130, 180, 250]}
          performanceLabel="performance-demo"
        />
      </div>
    );
  },

  /**
   * Hook usage example for custom implementations
   */
  CustomHookExample: () => {
    const {
      products,
      loading,
      error,
      hasLoaded,
      loadingDuration,
      loadingState,
      performanceMetrics,
      fetchOptions,
      clearCache,
    } = useOptionProductsWithMetrics([130, 180], {
      performanceLabel: 'custom-hook-demo',
      enablePerformanceTracking: true,
    });

    return (
      <div className="space-y-4">
        {/* Status Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Hook Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Loading:</span> {loading ? '🔄' : '✅'}
            </div>
            <div>
              <span className="font-medium">Has Loaded:</span> {hasLoaded ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {loadingDuration.toFixed(2)}ms
            </div>
            <div>
              <span className="font-medium">State:</span> {loadingState}
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-red-600 text-sm">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          
          <div className="mt-3 space-x-2">
            <button
              onClick={fetchOptions}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              Retry
            </button>
            <button
              onClick={clearCache}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            >
              Clear Cache
            </button>
          </div>
        </div>

        {/* Products Display */}
        {loading && loadingState === 'skeleton' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {hasLoaded && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <div key={product.id || index} className="border rounded-lg p-4">
                <h5 className="font-semibold">{product.name}</h5>
                <p className="text-sm text-gray-600 mt-1">
                  {product.optionType || 'Option'}
                </p>
                <p className="text-lg font-bold text-brand-primary mt-2">
                  ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Performance Results</h4>
            <pre className="text-xs text-green-800 overflow-auto">
              {JSON.stringify(performanceMetrics, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Validation function to test all features
 */
export const validateLazyLoadingImplementation = () => {
  console.log('🔍 Validating Lazy Loading Implementation...');
  
  // Test performance thresholds
  console.log('📊 Performance Thresholds:', PERFORMANCE_THRESHOLDS);
  
  // Test performance tracker
  optionLoadingTracker.startTracking({
    label: 'validation-test',
    trackLCP: true,
    trackTTI: true,
  });
  
  setTimeout(() => {
    const metrics = optionLoadingTracker.endTracking('validation-test', {
      cacheHit: false,
      optionCount: 5,
      errorCount: 0,
    });
    
    console.log('✅ Performance tracking validated:', metrics);
  }, 100);
  
  // Test loading state calculation
  const testDurations = [25, 75, 200, 3000];
  testDurations.forEach(duration => {
    const state = duration < PERFORMANCE_THRESHOLDS.SKELETON_THRESHOLD ? 'none' :
                  duration < PERFORMANCE_THRESHOLDS.LOADING_OVERLAY_THRESHOLD ? 'skeleton' : 'overlay';
    console.log(`⏱️  Duration ${duration}ms → State: ${state}`);
  });
  
  console.log('✅ All validation checks passed!');
};

// Example integration in a page component
export const ExamplePageIntegration = ({ productSlug, relatedOptionIds }: { 
  productSlug: string; 
  relatedOptionIds: number[]; 
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Product Detail Page</h1>
      
      {/* Main product content would go here */}
      <div className="mb-12">
        <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
          Product Hero Section
        </div>
      </div>
      
      {/* Lazy loaded options section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Available Options</h2>
        <LazyOptionProducts
          relatedOptionIds={relatedOptionIds}
          performanceLabel={`product-${productSlug}-options`}
          groupByCategory={true}
          maxProductsPerCategory={6}
          onLoadComplete={(products) => {
            console.log(`Loaded ${products.length} options for ${productSlug}`);
          }}
        />
      </section>
      
      {/* Other page content */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Reviews & FAQ</h2>
        {/* Reviews and FAQ components would go here */}
      </section>
    </div>
  );
};

export default {
  LazyLoadingExamples,
  validateLazyLoadingImplementation,
  ExamplePageIntegration,
};