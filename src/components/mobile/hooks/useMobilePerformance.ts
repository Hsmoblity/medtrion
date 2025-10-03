import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for mobile performance monitoring and optimization
 * Provides performance metrics, monitoring, and optimization strategies
 */
export const useMobilePerformance = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
  }>({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
  });

  const [isPerformanceMonitoring, setIsPerformanceMonitoring] = useState<boolean>(false);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [networkStatus, setNetworkStatus] = useState<string>('unknown');
  
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize performance monitoring
  const initializePerformanceMonitoring = useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    startTimeRef.current = performance.now();

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            setPerformanceMetrics(prev => ({
              ...prev,
              firstContentfulPaint: fcpEntry.startTime,
            }));
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries[entries.length - 1];
          if (lcpEntry) {
            setPerformanceMetrics(prev => ({
              ...prev,
              largestContentfulPaint: lcpEntry.startTime,
            }));
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fidEntry = entries[0];
          if (fidEntry) {
            setPerformanceMetrics(prev => ({
              ...prev,
              firstInputDelay: (fidEntry as any).processingStart - fidEntry.startTime,
            }));
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          setPerformanceMetrics(prev => ({
            ...prev,
            cumulativeLayoutShift: clsValue,
          }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        performanceObserverRef.current = fcpObserver;
        setIsPerformanceMonitoring(true);
      } catch (error) {
        console.warn('Performance monitoring initialization failed:', error);
      }
    }

    // Monitor memory usage
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
      }
    };

    // Monitor network status
    const monitorNetwork = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkStatus(connection.effectiveType || 'unknown');
      }
    };

    // Initial monitoring
    monitorMemory();
    monitorNetwork();

    // Set up periodic monitoring
    const memoryInterval = setInterval(monitorMemory, 5000);
    const networkInterval = setInterval(monitorNetwork, 10000);

    return () => {
      clearInterval(memoryInterval);
      clearInterval(networkInterval);
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
    };
  }, []);

  // Calculate performance score
  const calculatePerformanceScore = useCallback(() => {
    const { firstContentfulPaint, largestContentfulPaint, firstInputDelay, cumulativeLayoutShift } = performanceMetrics;
    
    let score = 100;
    
    // FCP scoring (0-2.5s = 100, 2.5-4s = 50, >4s = 0)
    if (firstContentfulPaint > 4000) score -= 30;
    else if (firstContentfulPaint > 2500) score -= 15;
    
    // LCP scoring (0-2.5s = 100, 2.5-4s = 50, >4s = 0)
    if (largestContentfulPaint > 4000) score -= 30;
    else if (largestContentfulPaint > 2500) score -= 15;
    
    // FID scoring (0-100ms = 100, 100-300ms = 50, >300ms = 0)
    if (firstInputDelay > 300) score -= 20;
    else if (firstInputDelay > 100) score -= 10;
    
    // CLS scoring (0-0.1 = 100, 0.1-0.25 = 50, >0.25 = 0)
    if (cumulativeLayoutShift > 0.25) score -= 20;
    else if (cumulativeLayoutShift > 0.1) score -= 10;
    
    setPerformanceScore(Math.max(0, score));
  }, [performanceMetrics]);

  // Performance optimization strategies
  const getOptimizationStrategies = useCallback(() => {
    const strategies = [];
    
    if (performanceMetrics.firstContentfulPaint > 2500) {
      strategies.push('Optimize critical rendering path');
    }
    
    if (performanceMetrics.largestContentfulPaint > 2500) {
      strategies.push('Optimize images and lazy loading');
    }
    
    if (performanceMetrics.firstInputDelay > 100) {
      strategies.push('Reduce JavaScript execution time');
    }
    
    if (performanceMetrics.cumulativeLayoutShift > 0.1) {
      strategies.push('Prevent layout shifts');
    }
    
    if (memoryUsage > 50) {
      strategies.push('Optimize memory usage');
    }
    
    if (networkStatus === 'slow-2g' || networkStatus === '2g') {
      strategies.push('Implement data saver mode');
    }
    
    return strategies;
  }, [performanceMetrics, memoryUsage, networkStatus]);

  // Lazy loading optimization
  const optimizeLazyLoading = useCallback((element: HTMLElement) => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              const dataSrc = target.getAttribute('data-src');
              if (dataSrc) {
                if (target.tagName === 'IMG') {
                  (target as HTMLImageElement).src = dataSrc;
                } else if (target.tagName === 'VIDEO') {
                  (target as HTMLVideoElement).src = dataSrc;
                }
                target.removeAttribute('data-src');
                observer.unobserve(target);
              }
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      );
      
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, []);

  // Image optimization
  const optimizeImage = useCallback((src: string, width?: number, height?: number) => {
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    
    // Add quality based on network status
    const quality = networkStatus === 'slow-2g' || networkStatus === '2g' ? 60 : 80;
    params.append('q', quality.toString());
    
    // Add format based on browser support
    const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    if (supportsWebP) {
      params.append('f', 'webp');
    }
    
    return `${src}?${params.toString()}`;
  }, [networkStatus]);

  // Bundle optimization
  const optimizeBundle = useCallback(() => {
    const strategies = [];
    
    if (performanceScore < 70) {
      strategies.push('Implement code splitting');
      strategies.push('Remove unused code');
      strategies.push('Optimize bundle size');
    }
    
    if (memoryUsage > 30) {
      strategies.push('Implement memory management');
      strategies.push('Optimize component lifecycle');
    }
    
    return strategies;
  }, [performanceScore, memoryUsage]);

  // Initialize performance monitoring
  useEffect(() => {
    const cleanup = initializePerformanceMonitoring();
    return cleanup;
  }, [initializePerformanceMonitoring]);

  // Calculate performance score when metrics change
  useEffect(() => {
    calculatePerformanceScore();
  }, [calculatePerformanceScore]);

  // Performance reporting
  const reportPerformance = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: performanceMetrics,
      score: performanceScore,
      memoryUsage,
      networkStatus,
      strategies: getOptimizationStrategies(),
    };
    
    // Send to analytics (implement your analytics service)
    console.log('Performance Report:', report);
    
    return report;
  }, [performanceMetrics, performanceScore, memoryUsage, networkStatus, getOptimizationStrategies]);

  return {
    // Performance metrics
    performanceMetrics,
    performanceScore,
    memoryUsage,
    networkStatus,
    isPerformanceMonitoring,
    
    // Optimization functions
    getOptimizationStrategies,
    optimizeLazyLoading,
    optimizeImage,
    optimizeBundle,
    reportPerformance,
    
    // Performance status
    isGoodPerformance: performanceScore >= 80,
    isPoorPerformance: performanceScore < 50,
    needsOptimization: performanceScore < 70,
  };
};

export default useMobilePerformance;