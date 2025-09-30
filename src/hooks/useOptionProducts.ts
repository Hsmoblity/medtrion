import { useState, useEffect, useCallback, useRef } from 'react';
import { ConfigurableProductSchema } from '../lib/interfaces/configurator';
import { 
  usePerformanceTracking, 
  PERFORMANCE_THRESHOLDS,
  getLoadingStateForDuration
} from '../lib/utils/performance-tracking-lazy-load';

interface UseOptionProductsState {
  products: ConfigurableProductSchema[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
  loadingDuration: number;
  loadingState: 'none' | 'skeleton' | 'overlay';
  performanceMetrics?: any;
}

interface UseOptionProductsOptions {
  /** Whether to fetch immediately on mount */
  immediate?: boolean;
  /** Cache key for storing results */
  cacheKey?: string;
  /** Timeout for requests (ms) */
  timeout?: number;
  /** Whether to retry on failure */
  retry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Enable performance tracking */
  enablePerformanceTracking?: boolean;
  /** Performance tracking label */
  trackingLabel?: string;
}

// Simple in-memory cache for option products
const optionProductsCache = new Map<string, {
  data: ConfigurableProductSchema[];
  timestamp: number;
  ttl: number;
}>();

// Cache TTL: 5 minutes
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Hook for lazy loading option products with caching and error handling
 */
export function useOptionProducts(
  relatedOptionIds: number[],
  options: UseOptionProductsOptions = {}
): UseOptionProductsState & {
  fetchOptions: () => Promise<void>;
  clearCache: () => void;
} {
  const {
    immediate = true,
    cacheKey,
    timeout = 10000,
    retry = true,
    maxRetries = 2,
    enablePerformanceTracking = true,
    trackingLabel,
  } = options;

  const [state, setState] = useState<UseOptionProductsState>({
    products: [],
    loading: false,
    error: null,
    hasLoaded: false,
    loadingDuration: 0,
    loadingState: 'none',
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingStartTimeRef = useRef<number>(0);

  // Generate cache key from related option IDs
  const effectiveCacheKey = cacheKey || `options_${relatedOptionIds.sort().join(',')}`;

  // Performance tracking setup
  const performanceLabel = trackingLabel || `option-products-${effectiveCacheKey}`;
  const { startTracking, endTracking, getMetrics } = usePerformanceTracking(performanceLabel, {
    trackLCP: enablePerformanceTracking,
    trackTTI: enablePerformanceTracking,
    enableConsoleLogging: enablePerformanceTracking,
  });

  // Check cache first
  const getCachedData = useCallback(() => {
    if (!effectiveCacheKey) return null;
    
    const cached = optionProductsCache.get(effectiveCacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    // Remove expired cache entry
    if (cached) {
      optionProductsCache.delete(effectiveCacheKey);
    }
    
    return null;
  }, [effectiveCacheKey]);

  // Fetch option products from GraphQL
  const fetchOptionProducts = useCallback(async (): Promise<ConfigurableProductSchema[]> => {
    if (!relatedOptionIds || relatedOptionIds.length === 0) {
      return [];
    }

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      if (process.env.NODE_ENV === 'development') {
        console.log('useOptionProducts: Using cached data for', effectiveCacheKey);
      }
      return cachedData;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('useOptionProducts: Fetching option products for IDs:', relatedOptionIds);
    }

    try {
      // Import the new specialized function for option products
      const { fetchOptionProductsByIds } = await import('../lib/woocommerce');
      
      // Create abort controller for timeout
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);

      // Use the specialized option products fetcher that implements the GetProductsByIds query
      const optionProducts = await fetchOptionProductsByIds(relatedOptionIds);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      if (!optionProducts || optionProducts.length === 0) {
        console.warn('useOptionProducts: No option products returned for IDs:', relatedOptionIds);
        return [];
      }

      // Products are already in ConfigurableProductSchema format from fetchOptionProductsByIds
      const mappedProducts: ConfigurableProductSchema[] = optionProducts;

      // Cache the results
      if (effectiveCacheKey) {
        optionProductsCache.set(effectiveCacheKey, {
          data: mappedProducts,
          timestamp: Date.now(),
          ttl: DEFAULT_CACHE_TTL,
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('useOptionProducts: Successfully fetched and cached', mappedProducts.length, 'option products with full specifications');
      }
      return mappedProducts;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }, [relatedOptionIds, getCachedData, effectiveCacheKey, timeout]);

  // Main fetch function with retry logic
  const fetchOptions = useCallback(async () => {
    if (!relatedOptionIds || relatedOptionIds.length === 0) {
      setState(prev => ({ ...prev, loading: false, hasLoaded: true }));
      return;
    }

    // Start performance tracking and loading duration
    loadingStartTimeRef.current = Date.now();
    if (enablePerformanceTracking) {
      startTracking();
    }

    setState(prev => ({ ...prev, loading: true, error: null, loadingDuration: 0 }));

    try {
      const products = await fetchOptionProducts();
      const finalDuration = Date.now() - loadingStartTimeRef.current;
      
      // End performance tracking
      const performanceMetrics = enablePerformanceTracking ? endTracking({
        cacheHit: false, // Will be set by fetchOptionProducts if cache hit
        optionCount: products.length,
        errorCount: 0,
      }) : undefined;
      
      setState(prev => ({
        ...prev,
        products,
        loading: false,
        error: null,
        hasLoaded: true,
        loadingDuration: finalDuration,
        loadingState: 'none',
        performanceMetrics,
      }));
      
      retryCountRef.current = 0; // Reset retry count on success

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch option products';
      
      // Retry logic
      if (retry && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        if (process.env.NODE_ENV === 'development') {
          console.warn(`useOptionProducts: Retry attempt ${retryCountRef.current}/${maxRetries} for error:`, errorMessage);
        }
        
        // Exponential backoff
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        setTimeout(() => {
          fetchOptions();
        }, delay);
        
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('useOptionProducts: Failed to fetch option products:', error);
      }
      
      const finalDuration = Date.now() - loadingStartTimeRef.current;
      
      // End performance tracking with error
      const performanceMetrics = enablePerformanceTracking ? endTracking({
        cacheHit: false,
        optionCount: 0,
        errorCount: 1,
      }) : undefined;

      setState(prev => ({
        ...prev,
        products: [],
        loading: false,
        error: errorMessage,
        hasLoaded: true,
        loadingDuration: finalDuration,
        loadingState: 'none',
        performanceMetrics,
      }));
    }
  }, [relatedOptionIds, fetchOptionProducts, retry, maxRetries]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (effectiveCacheKey) {
      optionProductsCache.delete(effectiveCacheKey);
    }
  }, [effectiveCacheKey]);

  // Effect for real-time loading duration and state updates
  useEffect(() => {
    if (!state.loading) return;

    const interval = setInterval(() => {
      const currentDuration = Date.now() - loadingStartTimeRef.current;
      const currentLoadingState = getLoadingStateForDuration(currentDuration);

      setState(prev => ({
        ...prev,
        loadingDuration: currentDuration,
        loadingState: currentLoadingState,
      }));
    }, 50); // Update every 50ms for smooth progress

    return () => clearInterval(interval);
  }, [state.loading]);

  // Effect for immediate fetching
  useEffect(() => {
    if (immediate && !state.hasLoaded && !state.loading) {
      fetchOptions();
    }
  }, [immediate, state.hasLoaded, state.loading, fetchOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    fetchOptions,
    clearCache,
  };
}

/**
 * Hook for lazy loading option products with enhanced performance tracking
 * Now uses the base hook's built-in performance tracking capabilities
 */
export function useOptionProductsWithMetrics(
  relatedOptionIds: number[],
  options: UseOptionProductsOptions & {
    /** Performance tracking label */
    performanceLabel?: string;
  } = {}
) {
  const { performanceLabel, ...hookOptions } = options;
  
  // Use the enhanced base hook with performance tracking enabled
  return useOptionProducts(relatedOptionIds, {
    ...hookOptions,
    enablePerformanceTracking: true,
    trackingLabel: performanceLabel,
  });
}

/**
 * Utility function to clear all option products cache
 */
export function clearAllOptionProductsCache(): void {
  optionProductsCache.clear();
}

/**
 * Utility function to get cache statistics
 */
export function getOptionProductsCacheStats(): {
  size: number;
  entries: string[];
  totalSize: number;
} {
  const entries = Array.from(optionProductsCache.keys());
  const totalSize = entries.reduce((size, key) => {
    const cached = optionProductsCache.get(key);
    return size + (cached ? JSON.stringify(cached.data).length : 0);
  }, 0);

  return {
    size: optionProductsCache.size,
    entries,
    totalSize,
  };
}