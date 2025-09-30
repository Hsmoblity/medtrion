import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ConfigurableProductSchema } from '../lib/interfaces/configurator';

interface UsePerformanceOptimizationOptions {
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  chunkSize?: number;
  intersectionThreshold?: number;
  debounceDelay?: number;
}

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface UsePerformanceOptimizationReturn {
  // Lazy loading utilities
  lazyLoader: {
    isVisible: (ref: React.RefObject<HTMLElement>) => boolean;
    useIntersectionObserver: (
      callback: (isIntersecting: boolean) => void,
      options?: IntersectionObserverInit
    ) => React.RefObject<HTMLElement>;
  };
  
  // Virtualization utilities
  virtualizer: {
    getVisibleRange: (props: VirtualizedListProps) => { start: number; end: number; items: any[] };
    useVirtualizedList: <T>(items: T[], itemHeight: number, containerHeight: number) => {
      visibleItems: T[];
      startIndex: number;
      endIndex: number;
      totalHeight: number;
      scrollToIndex: (index: number) => void;
    };
  };
  
  // Performance utilities
  debounce: <T extends (...args: any[]) => any>(fn: T, delay?: number) => T;
  throttle: <T extends (...args: any[]) => any>(fn: T, limit?: number) => T;
  memoize: <T extends (...args: any[]) => any>(fn: T) => T;
  
  // Memory management
  cleanup: () => void;
}

// Phase 3: Performance Optimization Hook
export const usePerformanceOptimization = (
  options: UsePerformanceOptimizationOptions = {}
): UsePerformanceOptimizationReturn => {
  const {
    enableVirtualization = true,
    enableLazyLoading = true,
    chunkSize = 20,
    intersectionThreshold = 0.1,
    debounceDelay = 300
  } = options;

  // Refs for cleanup
  const intersectionObserversRef = useRef<Set<IntersectionObserver>>(new Set());
  const timeoutsRef = useRef<Set<number>>(new Set());
  const memoCache = useRef<Map<string, any>>(new Map());

  // Lazy loading utilities
  const lazyLoader = useMemo(() => ({
    isVisible: (ref: React.RefObject<HTMLElement>): boolean => {
      if (!enableLazyLoading || !ref.current) return true;
      
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      
      return (
        rect.top < windowHeight &&
        rect.bottom > 0 &&
        rect.left < windowWidth &&
        rect.right > 0
      );
    },

    useIntersectionObserver: (
      callback: (isIntersecting: boolean) => void,
      observerOptions?: IntersectionObserverInit
    ): React.RefObject<HTMLElement> => {
      const elementRef = useRef<HTMLElement>(null);

      useEffect(() => {
        if (!enableLazyLoading || !elementRef.current) return;

        const observer = new IntersectionObserver(
          ([entry]) => callback(entry.isIntersecting),
          {
            threshold: intersectionThreshold,
            ...observerOptions
          }
        );

        observer.observe(elementRef.current);
        intersectionObserversRef.current.add(observer);

        return () => {
          observer.disconnect();
          intersectionObserversRef.current.delete(observer);
        };
      }, [callback, observerOptions]);

      return elementRef;
    }
  }), [enableLazyLoading, intersectionThreshold]);

  // Virtualization utilities
  const virtualizer = useMemo(() => ({
    getVisibleRange: ({ items, itemHeight, containerHeight, overscan = 3 }: VirtualizedListProps) => {
      if (!enableVirtualization) {
        return { start: 0, end: items.length, items };
      }

      const scrollTop = 0; // This would come from scroll position in real implementation
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const end = Math.min(items.length, start + visibleCount + overscan * 2);

      return {
        start,
        end,
        items: items.slice(start, end)
      };
    },

    useVirtualizedList: <T>(items: T[], itemHeight: number, containerHeight: number) => {
      const [scrollTop, setScrollTop] = useState(0);
      const [visibleRange, setVisibleRange] = useState({ start: 0, end: chunkSize });

      useEffect(() => {
        if (!enableVirtualization) return;

        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const end = Math.min(items.length, start + visibleCount + 6);

        setVisibleRange({ start, end });
      }, [scrollTop, items.length, itemHeight, containerHeight]);

      const visibleItems = enableVirtualization 
        ? items.slice(visibleRange.start, visibleRange.end)
        : items;

      const totalHeight = items.length * itemHeight;

      const scrollToIndex = useCallback((index: number) => {
        const targetScrollTop = index * itemHeight;
        setScrollTop(targetScrollTop);
      }, [itemHeight]);

      return {
        visibleItems,
        startIndex: visibleRange.start,
        endIndex: visibleRange.end,
        totalHeight,
        scrollToIndex
      };
    }
  }), [enableVirtualization, chunkSize]);

  // Performance utilities
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    fn: T, 
    delay: number = debounceDelay
  ): T => {
    let timeoutId: number;
    
    const debouncedFn = ((...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutsRef.current.delete(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        fn(...args);
        timeoutsRef.current.delete(timeoutId);
      }, delay);
      
      timeoutsRef.current.add(timeoutId);
    }) as T;

    return debouncedFn;
  }, [debounceDelay]);

  const throttle = useCallback(<T extends (...args: any[]) => any>(
    fn: T, 
    limit: number = 100
  ): T => {
    let inThrottle: boolean;
    
    const throttledFn = ((...args: any[]) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;

    return throttledFn;
  }, []);

  const memoize = useCallback(<T extends (...args: any[]) => any>(fn: T): T => {
    const memoizedFn = ((...args: any[]) => {
      const key = JSON.stringify(args);
      
      if (memoCache.current.has(key)) {
        return memoCache.current.get(key);
      }
      
      const result = fn(...args);
      memoCache.current.set(key, result);
      
      // Prevent memory leaks by limiting cache size
      if (memoCache.current.size > 100) {
        const firstKey = memoCache.current.keys().next().value;
        if (firstKey !== undefined) {
          memoCache.current.delete(firstKey);
        }
      }
      
      return result;
    }) as T;

    return memoizedFn;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear intersection observers
    intersectionObserversRef.current.forEach(observer => observer.disconnect());
    intersectionObserversRef.current.clear();

    // Clear timeouts
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current.clear();

    // Clear memoization cache
    memoCache.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    lazyLoader,
    virtualizer,
    debounce,
    throttle,
    memoize,
    cleanup
  };
};

// Phase 3: Specialized hooks for specific performance scenarios

// Hook for optimizing option loading
export const useOptionLoadingOptimization = (options: ConfigurableProductSchema[]) => {
  const { lazyLoader, debounce, memoize } = usePerformanceOptimization();
  
  // Memoized option processing
  const processedOptions = useMemo(() => 
    memoize((opts: ConfigurableProductSchema[]) => 
      opts.map(option => ({
        ...option,
        processedAt: Date.now()
      }))
    )(options), 
    [options, memoize]
  );

  // Debounced search
  const debouncedSearch = useMemo(() => 
    debounce((query: string, callback: (results: ConfigurableProductSchema[]) => void) => {
      const filtered = processedOptions.filter(option => 
        option.name?.toLowerCase().includes(query.toLowerCase()) ||
        option.description?.toLowerCase().includes(query.toLowerCase())
      );
      callback(filtered);
    }), 
    [processedOptions, debounce]
  );

  return {
    processedOptions,
    debouncedSearch,
    lazyLoader
  };
};

// Hook for optimizing image loading
export const useImageLoadingOptimization = () => {
  const { lazyLoader } = usePerformanceOptimization();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const loadImage = useCallback((src: string): Promise<void> => {
    if (loadedImages.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [loadedImages]);

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  return {
    loadImage,
    isImageLoaded,
    lazyLoader
  };
};