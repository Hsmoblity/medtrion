/**
 * Mobile Analytics Utilities
 * 
 * This module provides analytics tracking specifically optimized for mobile devices,
 * including performance metrics, user behavior tracking, and mobile-specific events.
 */

// Mobile analytics event types
export type MobileAnalyticsEvent = 
  | 'mobile_page_view'
  | 'mobile_component_load'
  | 'mobile_touch_interaction'
  | 'mobile_gesture'
  | 'mobile_performance'
  | 'mobile_error'
  | 'mobile_configuration'
  | 'mobile_cart_action'
  | 'mobile_payment_flow'
  | 'mobile_search'
  | 'mobile_navigation';

// Mobile device information
export interface MobileDeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  connectionType?: string;
  batteryLevel?: number;
  memoryInfo?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Mobile performance metrics
export interface MobilePerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
}

// Mobile analytics event data
export interface MobileAnalyticsEventData {
  event: MobileAnalyticsEvent;
  timestamp: number;
  deviceInfo: MobileDeviceInfo;
  performanceMetrics?: MobilePerformanceMetrics;
  customData?: Record<string, any>;
  sessionId: string;
  userId?: string;
}

/**
 * Get mobile device information
 */
export const getMobileDeviceInfo = (): MobileDeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      screenWidth: 1920,
      screenHeight: 1080,
      userAgent: 'server',
    };
  }

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const userAgent = navigator.userAgent;
  
  // Determine device type based on screen size
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (screenWidth < 768) {
    deviceType = 'mobile';
  } else if (screenWidth < 1024) {
    deviceType = 'tablet';
  }

  const deviceInfo: MobileDeviceInfo = {
    deviceType,
    screenWidth,
    screenHeight,
    userAgent,
  };

  // Add connection information if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    deviceInfo.connectionType = connection.effectiveType || connection.type;
  }

  // Add battery information if available
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      deviceInfo.batteryLevel = battery.level;
    });
  }

  // Add memory information if available
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    deviceInfo.memoryInfo = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  return deviceInfo;
};

/**
 * Get mobile performance metrics
 */
export const getMobilePerformanceMetrics = (): MobilePerformanceMetrics => {
  if (typeof window === 'undefined') {
    return {
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      speedIndex: 0,
    };
  }

  const metrics: MobilePerformanceMetrics = {
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
    totalBlockingTime: 0,
    speedIndex: 0,
  };

  // Get performance metrics from Performance Observer
  if ('PerformanceObserver' in window) {
    try {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metrics.firstContentfulPaint = fcpEntry.startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.processingStart && entry.startTime) {
            metrics.firstInputDelay = entry.processingStart - entry.startTime;
          }
        });
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
        metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  return metrics;
};

/**
 * Generate session ID
 */
export const generateSessionId = (): string => {
  return `mobile_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session ID
 */
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = sessionStorage.getItem('mobile_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('mobile_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Mobile Analytics Class
 */
export class MobileAnalytics {
  private sessionId: string;
  private userId?: string;
  private eventQueue: MobileAnalyticsEventData[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.sessionId = getSessionId();
    this.setupOnlineListener();
  }

  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;
    
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEventQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Track mobile event
   */
  track(event: MobileAnalyticsEvent, customData?: Record<string, any>): void {
    const eventData: MobileAnalyticsEventData = {
      event,
      timestamp: Date.now(),
      deviceInfo: getMobileDeviceInfo(),
      customData,
      sessionId: this.sessionId,
      userId: this.userId,
    };

    // Add performance metrics for performance events
    if (event === 'mobile_performance') {
      eventData.performanceMetrics = getMobilePerformanceMetrics();
    }

    this.queueEvent(eventData);
  }

  /**
   * Track mobile page view
   */
  trackPageView(page: string, customData?: Record<string, any>): void {
    this.track('mobile_page_view', {
      page,
      ...customData,
    });
  }

  /**
   * Track mobile component load
   */
  trackComponentLoad(componentName: string, loadTime: number, customData?: Record<string, any>): void {
    this.track('mobile_component_load', {
      componentName,
      loadTime,
      ...customData,
    });
  }

  /**
   * Track mobile touch interaction
   */
  trackTouchInteraction(element: string, action: string, customData?: Record<string, any>): void {
    this.track('mobile_touch_interaction', {
      element,
      action,
      ...customData,
    });
  }

  /**
   * Track mobile gesture
   */
  trackGesture(gestureType: string, direction: string, customData?: Record<string, any>): void {
    this.track('mobile_gesture', {
      gestureType,
      direction,
      ...customData,
    });
  }

  /**
   * Track mobile performance
   */
  trackPerformance(metricName: string, value: number, customData?: Record<string, any>): void {
    this.track('mobile_performance', {
      metricName,
      value,
      ...customData,
    });
  }

  /**
   * Track mobile error
   */
  trackError(error: Error, context: string, customData?: Record<string, any>): void {
    this.track('mobile_error', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      ...customData,
    });
  }

  /**
   * Track mobile configuration
   */
  trackConfiguration(action: string, productId: string, customData?: Record<string, any>): void {
    this.track('mobile_configuration', {
      action,
      productId,
      ...customData,
    });
  }

  /**
   * Track mobile cart action
   */
  trackCartAction(action: string, productId: string, quantity: number, customData?: Record<string, any>): void {
    this.track('mobile_cart_action', {
      action,
      productId,
      quantity,
      ...customData,
    });
  }

  /**
   * Track mobile payment flow
   */
  trackPaymentFlow(step: string, customData?: Record<string, any>): void {
    this.track('mobile_payment_flow', {
      step,
      ...customData,
    });
  }

  /**
   * Track mobile search
   */
  trackSearch(query: string, results: number, customData?: Record<string, any>): void {
    this.track('mobile_search', {
      query,
      results,
      ...customData,
    });
  }

  /**
   * Track mobile navigation
   */
  trackNavigation(from: string, to: string, customData?: Record<string, any>): void {
    this.track('mobile_navigation', {
      from,
      to,
      ...customData,
    });
  }

  /**
   * Queue event for sending
   */
  private queueEvent(eventData: MobileAnalyticsEventData): void {
    this.eventQueue.push(eventData);
    
    if (this.isOnline) {
      this.flushEventQueue();
    }
  }

  /**
   * Flush event queue
   */
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(eventsToSend);
    } catch (error) {
      console.warn('Failed to send mobile analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Send events to analytics service
   */
  private async sendEvents(events: MobileAnalyticsEventData[]): Promise<void> {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      events.forEach(eventData => {
        (window as any).gtag('event', eventData.event, {
          event_category: 'mobile',
          event_label: eventData.deviceInfo.deviceType,
          custom_map: {
            device_type: eventData.deviceInfo.deviceType,
            screen_width: eventData.deviceInfo.screenWidth,
            screen_height: eventData.deviceInfo.screenHeight,
            session_id: eventData.sessionId,
            ...eventData.customData,
          },
        });
      });
    }

    // Send to custom analytics endpoint
    try {
      await fetch('/api/analytics/mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.warn('Failed to send to custom analytics endpoint:', error);
    }
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    sessionId: string;
    userId?: string;
    eventCount: number;
    deviceInfo: MobileDeviceInfo;
  } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventCount: this.eventQueue.length,
      deviceInfo: getMobileDeviceInfo(),
    };
  }
}

// Export default instance
export const mobileAnalytics = new MobileAnalytics();

/**
 * Mobile Analytics Hooks
 */

/**
 * Hook for tracking mobile page views
 */
export const useMobilePageTracking = (page: string) => {
  if (typeof window === 'undefined') return;
  
  React.useEffect(() => {
    mobileAnalytics.trackPageView(page);
  }, [page]);
};

/**
 * Hook for tracking mobile component performance
 */
export const useMobileComponentTracking = (componentName: string) => {
  const startTime = React.useRef<number>(0);
  
  React.useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime.current;
      mobileAnalytics.trackComponentLoad(componentName, loadTime);
    };
  }, [componentName]);
};

/**
 * Hook for tracking mobile touch interactions
 */
export const useMobileTouchTracking = (elementRef: React.RefObject<HTMLElement>, elementName: string) => {
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = () => {
      mobileAnalytics.trackTouchInteraction(elementName, 'touch_start');
    };

    const handleTouchEnd = () => {
      mobileAnalytics.trackTouchInteraction(elementName, 'touch_end');
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, elementName]);
};

/**
 * Mobile Analytics Utilities
 */

/**
 * Track mobile performance metrics
 */
export const trackMobilePerformance = (): void => {
  const metrics = getMobilePerformanceMetrics();
  
  Object.entries(metrics).forEach(([metricName, value]) => {
    mobileAnalytics.trackPerformance(metricName, value);
  });
};

/**
 * Track mobile error
 */
export const trackMobileError = (error: Error, context: string, customData?: Record<string, any>): void => {
  mobileAnalytics.trackError(error, context, customData);
};

/**
 * Track mobile configuration
 */
export const trackMobileConfiguration = (action: string, productId: string, customData?: Record<string, any>): void => {
  mobileAnalytics.trackConfiguration(action, productId, customData);
};

/**
 * Track mobile cart action
 */
export const trackMobileCartAction = (action: string, productId: string, quantity: number, customData?: Record<string, any>): void => {
  mobileAnalytics.trackCartAction(action, productId, quantity, customData);
};

/**
 * Track mobile payment flow
 */
export const trackMobilePaymentFlow = (step: string, customData?: Record<string, any>): void => {
  mobileAnalytics.trackPaymentFlow(step, customData);
};

/**
 * Track mobile search
 */
export const trackMobileSearch = (query: string, results: number, customData?: Record<string, any>): void => {
  mobileAnalytics.trackSearch(query, results, customData);
};

/**
 * Track mobile navigation
 */
export const trackMobileNavigation = (from: string, to: string, customData?: Record<string, any>): void => {
  mobileAnalytics.trackNavigation(from, to, customData);
};

export default {
  getMobileDeviceInfo,
  getMobilePerformanceMetrics,
  generateSessionId,
  getSessionId,
  mobileAnalytics,
  useMobilePageTracking,
  useMobileComponentTracking,
  useMobileTouchTracking,
  trackMobilePerformance,
  trackMobileError,
  trackMobileConfiguration,
  trackMobileCartAction,
  trackMobilePaymentFlow,
  trackMobileSearch,
  trackMobileNavigation,
};