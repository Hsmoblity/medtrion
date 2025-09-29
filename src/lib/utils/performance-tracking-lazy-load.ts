/**
 * Performance tracking utilities for lazy-loaded option data
 * Implements monitoring requirements from feat-lazy-load-option-data.yaml
 */

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
  cacheHit?: boolean;
  optionCount?: number;
  errorCount?: number;
}

interface PerformanceTrackerOptions {
  label: string;
  trackLCP?: boolean;
  trackTTI?: boolean;
  enableConsoleLogging?: boolean;
  enableAnalytics?: boolean;
}

class PerformanceTracker {
  private metrics = new Map<string, PerformanceMetrics>();
  private observers = new Map<string, PerformanceObserver>();

  /**
   * Start tracking performance for a lazy loading operation
   */
  startTracking(options: PerformanceTrackerOptions): void {
    const { label, trackLCP = true, trackTTI = true, enableConsoleLogging = true } = options;
    
    const startTime = performance.now();
    
    this.metrics.set(label, {
      startTime,
      cacheHit: false,
      optionCount: 0,
      errorCount: 0,
    });

    if (typeof window === 'undefined') return;

    // Track Largest Contentful Paint
    if (trackLCP && 'PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries[entries.length - 1] as PerformanceEntry;
          
          if (lcpEntry) {
            const metrics = this.metrics.get(label);
            if (metrics) {
              metrics.largestContentfulPaint = lcpEntry.startTime;
              this.metrics.set(label, metrics);
              
              if (enableConsoleLogging) {
                console.log(`🎯 ${label} - LCP: ${lcpEntry.startTime.toFixed(2)}ms`);
              }
            }
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set(`${label}-lcp`, lcpObserver);
      } catch (error) {
        console.warn('LCP tracking not supported:', error);
      }
    }

    // Track Time to Interactive (simplified version)
    if (trackTTI) {
      this.trackTimeToInteractive(label, enableConsoleLogging);
    }
  }

  /**
   * Mark operation as completed and calculate final metrics
   */
  endTracking(label: string, additionalData?: {
    cacheHit?: boolean;
    optionCount?: number;
    errorCount?: number;
  }): PerformanceMetrics | null {
    const metrics = this.metrics.get(label);
    if (!metrics) return null;

    const endTime = performance.now();
    const duration = endTime - metrics.startTime;

    const finalMetrics: PerformanceMetrics = {
      ...metrics,
      endTime,
      duration,
      ...additionalData,
    };

    this.metrics.set(label, finalMetrics);

    // Clean up observers
    const lcpObserver = this.observers.get(`${label}-lcp`);
    if (lcpObserver) {
      lcpObserver.disconnect();
      this.observers.delete(`${label}-lcp`);
    }

    // Log summary
    console.log(`📊 ${label} Performance Summary:`, {
      duration: `${duration.toFixed(2)}ms`,
      cacheHit: finalMetrics.cacheHit,
      optionCount: finalMetrics.optionCount,
      lcp: finalMetrics.largestContentfulPaint ? `${finalMetrics.largestContentfulPaint.toFixed(2)}ms` : 'N/A',
      tti: finalMetrics.timeToInteractive ? `${finalMetrics.timeToInteractive.toFixed(2)}ms` : 'N/A',
      errors: finalMetrics.errorCount || 0,
    });

    return finalMetrics;
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(label: string): PerformanceMetrics | null {
    return this.metrics.get(label) || null;
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Clear all metrics and observers
   */
  reset(): void {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }

  /**
   * Track Time to Interactive (simplified implementation)
   */
  private trackTimeToInteractive(label: string, enableLogging: boolean): void {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;

    const startTime = performance.now();
    
    // Use requestIdleCallback to detect when the main thread is idle
    const checkInteractive = () => {
      window.requestIdleCallback(() => {
        const metrics = this.metrics.get(label);
        if (metrics && !metrics.timeToInteractive) {
          const tti = performance.now() - startTime;
          metrics.timeToInteractive = tti;
          this.metrics.set(label, metrics);
          
          if (enableLogging) {
            console.log(`⚡ ${label} - TTI: ${tti.toFixed(2)}ms`);
          }
        }
      });
    };

    // Check multiple times to get a more accurate reading
    setTimeout(checkInteractive, 100);
    setTimeout(checkInteractive, 500);
    setTimeout(checkInteractive, 1000);
  }

  /**
   * Export metrics for analytics or reporting
   */
  exportMetrics(): Record<string, any> {
    const exported: Record<string, any> = {};
    
    this.metrics.forEach((metrics, label) => {
      exported[label] = {
        ...metrics,
        timestamp: Date.now(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      };
    });
    
    return exported;
  }
}

// Global performance tracker instance
export const optionLoadingTracker = new PerformanceTracker();

/**
 * React hook for performance tracking with lazy loading operations
 */
export function usePerformanceTracking(label: string, options: Omit<PerformanceTrackerOptions, 'label'> = {}) {
  const startTracking = () => {
    optionLoadingTracker.startTracking({ label, ...options });
  };

  const endTracking = (additionalData?: {
    cacheHit?: boolean;
    optionCount?: number;
    errorCount?: number;
  }) => {
    return optionLoadingTracker.endTracking(label, additionalData);
  };

  const getMetrics = () => {
    return optionLoadingTracker.getMetrics(label);
  };

  return { startTracking, endTracking, getMetrics };
}

/**
 * Performance thresholds for lazy loading operations
 */
export const PERFORMANCE_THRESHOLDS = {
  // Show loading overlay if fetch takes longer than this
  LOADING_OVERLAY_THRESHOLD: 150, // ms
  
  // Show skeleton if fetch takes longer than this
  SKELETON_THRESHOLD: 50, // ms
  
  // Warn if option loading takes longer than this
  SLOW_LOADING_THRESHOLD: 2000, // ms
  
  // Maximum acceptable duration for option loading
  MAX_LOADING_DURATION: 5000, // ms
  
  // Cache TTL for performance metrics
  METRICS_CACHE_TTL: 10 * 60 * 1000, // 10 minutes
};

/**
 * Utility to determine which loading state to show based on duration
 */
export function getLoadingStateForDuration(duration: number): 'none' | 'skeleton' | 'overlay' {
  if (duration < PERFORMANCE_THRESHOLDS.SKELETON_THRESHOLD) {
    return 'none';
  } else if (duration < PERFORMANCE_THRESHOLDS.LOADING_OVERLAY_THRESHOLD) {
    return 'skeleton';
  } else {
    return 'overlay';
  }
}

export type { PerformanceMetrics, PerformanceTrackerOptions };