/**
 * Performance tracking utilities for lazy loading optimization
 */

export interface PerformanceMetrics {
  /** Time to first byte */
  ttfb?: number;
  /** Largest contentful paint */
  lcp?: number;
  /** First input delay */
  fid?: number;
  /** Cumulative layout shift */
  cls?: number;
  /** Time to interactive */
  tti?: number;
  /** First contentful paint */
  fcp?: number;
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  /**
   * Start tracking performance for a specific operation
   */
  startTracking(label: string): void {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const startTime = performance.now();
    this.metrics.set(label, {});
    
    // Track navigation timing
    this.trackNavigationTiming(label);
    
    // Track paint timing
    this.trackPaintTiming(label);
    
    // Track layout shift
    this.trackLayoutShift(label);
    
    console.log(`Performance tracking started for: ${label}`);
  }

  /**
   * End tracking and log results
   */
  endTracking(label: string): PerformanceMetrics | null {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const metrics = this.metrics.get(label);
    if (!metrics) {
      console.warn(`No metrics found for label: ${label}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - (metrics.ttfb || 0);

    console.log(`Performance tracking completed for: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
      metrics,
    });

    // Store in performance API for later analysis
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`${label}-end`);
      performance.measure(`${label}-duration`, `${label}-start`, `${label}-end`);
    }

    return metrics;
  }

  /**
   * Track navigation timing metrics
   */
  private trackNavigationTiming(label: string): void {
    if (!('performance' in window) || !('getEntriesByType' in performance)) {
      return;
    }

    try {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        const metrics = this.metrics.get(label) || {};
        
        this.metrics.set(label, {
          ...metrics,
          ttfb: nav.responseStart - nav.requestStart,
        });
      }
    } catch (error) {
      console.warn('Failed to track navigation timing:', error);
    }
  }

  /**
   * Track paint timing metrics
   */
  private trackPaintTiming(label: string): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const metrics = this.metrics.get(label) || {};
        
        entries.forEach((entry) => {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            metrics.lcp = entry.startTime;
          }
        });
        
        this.metrics.set(label, metrics);
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to track paint timing:', error);
    }
  }

  /**
   * Track layout shift metrics
   */
  private trackLayoutShift(label: string): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const metrics = this.metrics.get(label) || {};
        
        let clsValue = 0;
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        metrics.cls = clsValue;
        this.metrics.set(label, metrics);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to track layout shift:', error);
    }
  }

  /**
   * Track custom timing
   */
  mark(label: string, name: string): void {
    if (typeof window === 'undefined' || !('performance' in window) || !('mark' in performance)) {
      return;
    }

    performance.mark(`${label}-${name}`);
  }

  /**
   * Measure between two marks
   */
  measure(label: string, startMark: string, endMark: string): number | null {
    if (typeof window === 'undefined' || !('performance' in window) || !('measure' in performance)) {
      return null;
    }

    try {
      performance.measure(label, startMark, endMark);
      const measures = performance.getEntriesByName(label, 'measure');
      return measures.length > 0 ? measures[0].duration : null;
    } catch (error) {
      console.warn('Failed to measure performance:', error);
      return null;
    }
  }

  /**
   * Get all metrics for a label
   */
  getMetrics(label: string): PerformanceMetrics | null {
    return this.metrics.get(label) || null;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, PerformanceMetrics> {
    return Object.fromEntries(this.metrics);
  }
}

// Singleton instance
export const performanceTracker = new PerformanceTracker();

/**
 * Hook for tracking component performance
 */
export function usePerformanceTracking(label: string) {
  const startTracking = () => {
    performanceTracker.startTracking(label);
  };

  const endTracking = () => {
    return performanceTracker.endTracking(label);
  };

  const mark = (name: string) => {
    performanceTracker.mark(label, name);
  };

  const measure = (startMark: string, endMark: string) => {
    return performanceTracker.measure(label, startMark, endMark);
  };

  return {
    startTracking,
    endTracking,
    mark,
    measure,
  };
}

/**
 * Utility to measure page load performance
 */
export function measurePageLoadPerformance(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      resolve({});
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    function collectMetrics() {
      try {
        // Navigation timing
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0];
          metrics.ttfb = nav.responseStart - nav.requestStart;
        }

        // Paint timing
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
          }
        });

        // Largest contentful paint
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint');
            if (lcpEntry) {
              metrics.lcp = lcpEntry.startTime;
            }
            observer.disconnect();
          });

          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        resolve(metrics);
      } catch (error) {
        console.warn('Failed to collect performance metrics:', error);
        resolve(metrics);
      }
    }
  });
}

/**
 * Utility to compare performance before/after changes
 */
export function comparePerformanceMetrics(
  before: PerformanceMetrics,
  after: PerformanceMetrics
): {
  improvement: boolean;
  changes: Record<string, { before: number; after: number; improvement: number }>;
} {
  const changes: Record<string, { before: number; after: number; improvement: number }> = {};
  let overallImprovement = true;

  const metrics = ['ttfb', 'lcp', 'fcp', 'cls'] as const;
  
  metrics.forEach(metric => {
    const beforeValue = before[metric];
    const afterValue = after[metric];
    
    if (beforeValue && afterValue) {
      const improvement = beforeValue - afterValue; // Positive means improvement
      changes[metric] = {
        before: beforeValue,
        after: afterValue,
        improvement,
      };
      
      if (improvement < 0) {
        overallImprovement = false;
      }
    }
  });

  return {
    improvement: overallImprovement,
    changes,
  };
}