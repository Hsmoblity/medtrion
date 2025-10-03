/**
 * Mobile Optimization Utilities
 * 
 * This module provides utilities for mobile-specific optimizations including
 * device detection, performance monitoring, and mobile-specific features.
 */

// Device type definitions
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type MobileBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Mobile breakpoints (matching Tailwind CSS)
export const MOBILE_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Touch target sizes
export const TOUCH_TARGET_SIZES = {
  minimum: 44, // Apple HIG minimum
  comfortable: 48, // Material Design recommended
  large: 56, // For primary actions
} as const;

// Mobile performance budgets
export const MOBILE_PERFORMANCE_BUDGETS = {
  firstContentfulPaint: 1800, // 1.8s
  largestContentfulPaint: 2500, // 2.5s
  firstInputDelay: 100, // 100ms
  cumulativeLayoutShift: 0.1, // 0.1
  timeToInteractive: 3800, // 3.8s
} as const;

/**
 * Detect device type based on viewport width
 */
export const detectDeviceType = (width: number): DeviceType => {
  if (width < MOBILE_BREAKPOINTS.md) {
    return 'mobile';
  } else if (width < MOBILE_BREAKPOINTS.lg) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Get mobile breakpoint based on width
 */
export const getMobileBreakpoint = (width: number): MobileBreakpoint => {
  if (width < MOBILE_BREAKPOINTS.sm) return 'xs';
  if (width < MOBILE_BREAKPOINTS.md) return 'sm';
  if (width < MOBILE_BREAKPOINTS.lg) return 'md';
  if (width < MOBILE_BREAKPOINTS.xl) return 'lg';
  return 'xl';
};

/**
 * Check if device is mobile
 */
export const isMobile = (width: number): boolean => {
  return width < MOBILE_BREAKPOINTS.md;
};

/**
 * Check if device is tablet
 */
export const isTablet = (width: number): boolean => {
  return width >= MOBILE_BREAKPOINTS.md && width < MOBILE_BREAKPOINTS.lg;
};

/**
 * Check if device is desktop
 */
export const isDesktop = (width: number): boolean => {
  return width >= MOBILE_BREAKPOINTS.lg;
};

/**
 * Get optimal touch target size for device
 */
export const getTouchTargetSize = (deviceType: DeviceType): number => {
  switch (deviceType) {
    case 'mobile':
      return TOUCH_TARGET_SIZES.comfortable;
    case 'tablet':
      return TOUCH_TARGET_SIZES.minimum;
    case 'desktop':
      return TOUCH_TARGET_SIZES.minimum;
    default:
      return TOUCH_TARGET_SIZES.minimum;
  }
};

/**
 * Get mobile-optimized spacing
 */
export const getMobileSpacing = (deviceType: DeviceType, baseSpacing: number): number => {
  switch (deviceType) {
    case 'mobile':
      return Math.max(baseSpacing * 0.75, 12); // Compact spacing for mobile
    case 'tablet':
      return baseSpacing * 0.875; // Slightly reduced spacing
    case 'desktop':
      return baseSpacing; // Full spacing
    default:
      return baseSpacing;
  }
};

/**
 * Get mobile-optimized font size
 */
export const getMobileFontSize = (deviceType: DeviceType, baseSize: number): number => {
  switch (deviceType) {
    case 'mobile':
      return Math.max(baseSize * 0.875, 14); // Slightly smaller for mobile
    case 'tablet':
      return baseSize * 0.9375; // Slightly reduced
    case 'desktop':
      return baseSize; // Full size
    default:
      return baseSize;
  }
};

/**
 * Optimize image for mobile
 */
export const optimizeImageForMobile = (
  src: string,
  width: number,
  height: number,
  quality: number = 75
): string => {
  // Add mobile-specific image optimization parameters
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    q: quality.toString(),
    f: 'webp', // Use WebP for better mobile performance
    fit: 'cover',
  });
  
  return `${src}?${params.toString()}`;
};

/**
 * Get mobile-optimized image dimensions
 */
export const getMobileImageDimensions = (
  deviceType: DeviceType,
  baseWidth: number,
  baseHeight: number
): { width: number; height: number } => {
  switch (deviceType) {
    case 'mobile':
      return {
        width: Math.min(baseWidth, 400), // Max 400px width for mobile
        height: Math.min(baseHeight, 300), // Max 300px height for mobile
      };
    case 'tablet':
      return {
        width: Math.min(baseWidth, 600), // Max 600px width for tablet
        height: Math.min(baseHeight, 450), // Max 450px height for tablet
      };
    case 'desktop':
      return { width: baseWidth, height: baseHeight };
    default:
      return { width: baseWidth, height: baseHeight };
  }
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers dark mode
 */
export const prefersDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Get mobile-optimized animation duration
 */
export const getMobileAnimationDuration = (deviceType: DeviceType, baseDuration: number): number => {
  if (prefersReducedMotion()) {
    return 0; // Disable animations if user prefers reduced motion
  }
  
  switch (deviceType) {
    case 'mobile':
      return baseDuration * 0.75; // Faster animations for mobile
    case 'tablet':
      return baseDuration * 0.875; // Slightly faster
    case 'desktop':
      return baseDuration; // Full duration
    default:
      return baseDuration;
  }
};

/**
 * Debounce function optimized for mobile
 */
export const mobileDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  deviceType: DeviceType
): T => {
  const mobileDelay = deviceType === 'mobile' ? delay * 0.75 : delay;
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), mobileDelay);
  }) as T;
};

/**
 * Throttle function optimized for mobile
 */
export const mobileThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  deviceType: DeviceType
): T => {
  const mobileDelay = deviceType === 'mobile' ? delay * 0.75 : delay;
  let lastCall = 0;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= mobileDelay) {
      lastCall = now;
      func(...args);
    }
  }) as T;
};

/**
 * Get mobile-optimized lazy loading threshold
 */
export const getMobileLazyThreshold = (deviceType: DeviceType): number => {
  switch (deviceType) {
    case 'mobile':
      return 0.1; // Load earlier on mobile for better UX
    case 'tablet':
      return 0.2; // Standard threshold
    case 'desktop':
      return 0.3; // Can load later on desktop
    default:
      return 0.2;
  }
};

/**
 * Check if device supports touch
 */
export const supportsTouch = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get mobile-optimized scroll behavior
 */
export const getMobileScrollBehavior = (deviceType: DeviceType): ScrollBehavior => {
  switch (deviceType) {
    case 'mobile':
      return 'smooth'; // Smooth scrolling for mobile
    case 'tablet':
      return 'smooth'; // Smooth scrolling for tablet
    case 'desktop':
      return 'auto'; // Default behavior for desktop
    default:
      return 'auto';
  }
};

/**
 * Get mobile-optimized viewport meta tag
 */
export const getMobileViewportMeta = (): string => {
  return 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
};

/**
 * Check if current environment is mobile
 */
export const isMobileEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
};

/**
 * Get mobile-optimized bundle size limit
 */
export const getMobileBundleSizeLimit = (deviceType: DeviceType): number => {
  switch (deviceType) {
    case 'mobile':
      return 250 * 1024; // 250KB for mobile
    case 'tablet':
      return 400 * 1024; // 400KB for tablet
    case 'desktop':
      return 500 * 1024; // 500KB for desktop
    default:
      return 300 * 1024; // Default 300KB
  }
};

/**
 * Mobile performance monitoring
 */
export class MobilePerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  startTiming(name: string): void {
    this.metrics.set(`${name}_start`, performance.now());
  }
  
  endTiming(name: string): number {
    const startTime = this.metrics.get(`${name}_start`);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.metrics.set(`${name}_duration`, duration);
    return duration;
  }
  
  getMetric(name: string): number {
    return this.metrics.get(`${name}_duration`) || 0;
  }
  
  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      if (key.endsWith('_duration')) {
        result[key.replace('_duration', '')] = value;
      }
    });
    return result;
  }
  
  checkPerformanceBudget(metricName: string, budget: number): boolean {
    const value = this.getMetric(metricName);
    return value <= budget;
  }
}

// Export default instance
export const mobilePerformanceMonitor = new MobilePerformanceMonitor();

/**
 * Mobile optimization configuration
 */
export interface MobileOptimizationConfig {
  deviceType: DeviceType;
  enableTouchOptimization: boolean;
  enablePerformanceMonitoring: boolean;
  enableImageOptimization: boolean;
  enableLazyLoading: boolean;
  enableReducedMotion: boolean;
}

/**
 * Get default mobile optimization configuration
 */
export const getDefaultMobileConfig = (deviceType: DeviceType): MobileOptimizationConfig => {
  return {
    deviceType,
    enableTouchOptimization: deviceType === 'mobile',
    enablePerformanceMonitoring: true,
    enableImageOptimization: true,
    enableLazyLoading: true,
    enableReducedMotion: prefersReducedMotion(),
  };
};

/**
 * Apply mobile optimizations to element
 */
export const applyMobileOptimizations = (
  element: HTMLElement,
  config: MobileOptimizationConfig
): void => {
  if (config.enableTouchOptimization) {
    const touchSize = getTouchTargetSize(config.deviceType);
    element.style.minHeight = `${touchSize}px`;
    element.style.minWidth = `${touchSize}px`;
  }
  
  if (config.enableReducedMotion) {
    element.style.animationDuration = '0s';
    element.style.transitionDuration = '0s';
  }
};

export default {
  detectDeviceType,
  getMobileBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  getTouchTargetSize,
  getMobileSpacing,
  getMobileFontSize,
  optimizeImageForMobile,
  getMobileImageDimensions,
  prefersReducedMotion,
  prefersDarkMode,
  getMobileAnimationDuration,
  mobileDebounce,
  mobileThrottle,
  getMobileLazyThreshold,
  supportsTouch,
  getMobileScrollBehavior,
  getMobileViewportMeta,
  isMobileEnvironment,
  getMobileBundleSizeLimit,
  mobilePerformanceMonitor,
  getDefaultMobileConfig,
  applyMobileOptimizations,
};