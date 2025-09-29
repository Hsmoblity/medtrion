import { useState, useEffect, useCallback, useRef } from 'react';
import { ConfigurableProductSchema } from '../lib/interfaces/configurator';

interface UseOptionProductsState {
  products: ConfigurableProductSchema[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
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
  } = options;

  const [state, setState] = useState<UseOptionProductsState>({
    products: [],
    loading: false,
    error: null,
    hasLoaded: false,
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key from related option IDs
  const effectiveCacheKey = cacheKey || `options_${relatedOptionIds.sort().join(',')}`;

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
      console.log('useOptionProducts: Using cached data for', effectiveCacheKey);
      return cachedData;
    }

    console.log('useOptionProducts: Fetching option products for IDs:', relatedOptionIds);

    try {
      // Import dynamically to avoid SSR issues
      const { fetchRelatedProductsByIds } = await import('../lib/woocommerce');
      
      // Create abort controller for timeout
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);

      const relatedProducts = await fetchRelatedProductsByIds(relatedOptionIds);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      if (!relatedProducts || relatedProducts.length === 0) {
        console.warn('useOptionProducts: No related products returned for IDs:', relatedOptionIds);
        return [];
      }

      // Convert raw WooCommerce products to ConfigurableProductSchema format
      const mappedProducts: ConfigurableProductSchema[] = relatedProducts.map((rawProduct: any) => ({
        id: rawProduct.id || rawProduct.databaseId?.toString() || '',
        databaseId: rawProduct.databaseId || undefined,
        name: rawProduct.name || '',
        slug: rawProduct.slug || '',
        title: rawProduct.name || '',
        description: rawProduct.description || '',
        shortDescription: rawProduct.description || '',
        featuredImage: rawProduct.image || '',
        image: rawProduct.image ? {
          sourceUrl: rawProduct.image,
          altText: `${rawProduct.name} image`
        } : undefined,
        price: 0, // Options might not have individual prices
        productPictures: [],
        variations: rawProduct.variations || [],
        options: [],
        _related_options: [],
        _related_options_products: [],
        productSpecifications: rawProduct.productSpecifications || ''
      }));

      // Cache the results
      if (effectiveCacheKey) {
        optionProductsCache.set(effectiveCacheKey, {
          data: mappedProducts,
          timestamp: Date.now(),
          ttl: DEFAULT_CACHE_TTL,
        });
      }

      console.log('useOptionProducts: Successfully fetched and mapped', mappedProducts.length, 'option products');
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

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const products = await fetchOptionProducts();
      
      setState({
        products,
        loading: false,
        error: null,
        hasLoaded: true,
      });
      
      retryCountRef.current = 0; // Reset retry count on success

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch option products';
      
      // Retry logic
      if (retry && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.warn(`useOptionProducts: Retry attempt ${retryCountRef.current}/${maxRetries} for error:`, errorMessage);
        
        // Exponential backoff
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        setTimeout(() => {
          fetchOptions();
        }, delay);
        
        return;
      }

      console.error('useOptionProducts: Failed to fetch option products:', error);
      setState({
        products: [],
        loading: false,
        error: errorMessage,
        hasLoaded: true,
      });
    }
  }, [relatedOptionIds, fetchOptionProducts, retry, maxRetries]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (effectiveCacheKey) {
      optionProductsCache.delete(effectiveCacheKey);
    }
  }, [effectiveCacheKey]);

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
 * Hook for lazy loading option products with performance tracking
 */
export function useOptionProductsWithMetrics(
  relatedOptionIds: number[],
  options: UseOptionProductsOptions & {
    /** Performance tracking label */
    performanceLabel?: string;
  } = {}
) {
  const { performanceLabel, ...hookOptions } = options;
  
  const result = useOptionProducts(relatedOptionIds, hookOptions);

  // Track performance metrics
  useEffect(() => {
    if (performanceLabel && result.hasLoaded && !result.loading) {
      const startTime = performance.now();
      
      // Track largest contentful paint for option loading
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint');
            
            if (lcpEntry) {
              console.log(`${performanceLabel} - LCP:`, lcpEntry.startTime);
            }
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          return () => observer.disconnect();
        } catch (error) {
          console.warn('Performance tracking not supported:', error);
        }
      }
    }
  }, [performanceLabel, result.hasLoaded, result.loading]);

  return result;
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