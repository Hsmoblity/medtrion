/**
 * Mobile Optimization Hook
 * 
 * This hook provides mobile-specific optimization utilities including
 * device detection, performance monitoring, and mobile-specific features.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  detectDeviceType, 
  getTouchTargetSize, 
  getMobileSpacing, 
  getMobileFontSize,
  getMobileAnimationDuration,
  mobileDebounce,
  mobileThrottle,
  getMobileLazyThreshold,
  supportsTouch,
  getMobileScrollBehavior,
  prefersReducedMotion,
  prefersDarkMode,
  getDefaultMobileConfig,
  type DeviceType,
  type MobileOptimizationConfig,
} from '../utils/mobile-optimization';

// Mobile optimization state
interface MobileOptimizationState {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  touchTargetSize: number;
  spacing: 'compact' | 'normal' | 'relaxed';
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  animationDuration: number;
  supportsTouch: boolean;
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  scrollBehavior: ScrollBehavior;
  config: MobileOptimizationConfig;
}

// Mobile optimization options
interface MobileOptimizationOptions {
  enablePerformanceMonitoring?: boolean;
  enableTouchOptimization?: boolean;
  enableImageOptimization?: boolean;
  enableLazyLoading?: boolean;
  enableReducedMotion?: boolean;
  debounceDelay?: number;
  throttleDelay?: number;
}

/**
 * Hook for mobile optimization
 */
export const useMobileOptimization = (options: MobileOptimizationOptions = {}) => {
  const {
    enablePerformanceMonitoring = true,
    enableTouchOptimization = true,
    enableImageOptimization = true,
    enableLazyLoading = true,
    enableReducedMotion = true,
    debounceDelay = 300,
    throttleDelay = 100,
  } = options;

  // State
  const [state, setState] = useState<MobileOptimizationState>(() => {
    const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const deviceType = detectDeviceType(initialWidth);
    
    return {
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      screenWidth: initialWidth,
      screenHeight: initialHeight,
      touchTargetSize: getTouchTargetSize(deviceType),
      spacing: deviceType === 'mobile' ? 'compact' : 'normal',
      fontSize: deviceType === 'mobile' ? 'sm' : 'base',
      animationDuration: getMobileAnimationDuration(deviceType, 300),
      supportsTouch: supportsTouch(),
      prefersReducedMotion: prefersReducedMotion(),
      prefersDarkMode: prefersDarkMode(),
      scrollBehavior: getMobileScrollBehavior(deviceType),
      config: getDefaultMobileConfig(deviceType),
    };
  });

  // Update state when window resizes
  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const deviceType = detectDeviceType(width);
      
      setState(prevState => ({
        ...prevState,
        deviceType,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        screenWidth: width,
        screenHeight: height,
        touchTargetSize: getTouchTargetSize(deviceType),
        spacing: deviceType === 'mobile' ? 'compact' : 'normal',
        fontSize: deviceType === 'mobile' ? 'sm' : 'base',
        animationDuration: getMobileAnimationDuration(deviceType, 300),
        scrollBehavior: getMobileScrollBehavior(deviceType),
        config: getDefaultMobileConfig(deviceType),
      }));
    };

    window.addEventListener('resize', updateState);
    return () => window.removeEventListener('resize', updateState);
  }, []);

  // Update preferences when they change
  useEffect(() => {
    const updatePreferences = () => {
      setState(prevState => ({
        ...prevState,
        prefersReducedMotion: prefersReducedMotion(),
        prefersDarkMode: prefersDarkMode(),
      }));
    };

    if (typeof window !== 'undefined') {
      const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
      const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      
      reducedMotionMedia.addEventListener('change', updatePreferences);
      darkModeMedia.addEventListener('change', updatePreferences);
      
      return () => {
        reducedMotionMedia.removeEventListener('change', updatePreferences);
        darkModeMedia.removeEventListener('change', updatePreferences);
      };
    }
  }, []);

  // Mobile-optimized debounce function
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(func: T): T => {
      return mobileDebounce(func, debounceDelay, state.deviceType);
    },
    [debounceDelay, state.deviceType]
  );

  // Mobile-optimized throttle function
  const throttle = useCallback(
    <T extends (...args: any[]) => any>(func: T): T => {
      return mobileThrottle(func, throttleDelay, state.deviceType);
    },
    [throttleDelay, state.deviceType]
  );

  // Mobile-optimized spacing
  const getSpacing = useCallback(
    (baseSpacing: number): number => {
      return getMobileSpacing(state.deviceType, baseSpacing);
    },
    [state.deviceType]
  );

  // Mobile-optimized font size
  const getFontSize = useCallback(
    (baseSize: number): number => {
      return getMobileFontSize(state.deviceType, baseSize);
    },
    [state.deviceType]
  );

  // Mobile-optimized animation duration
  const getAnimationDuration = useCallback(
    (baseDuration: number): number => {
      return getMobileAnimationDuration(state.deviceType, baseDuration);
    },
    [state.deviceType]
  );

  // Mobile-optimized lazy loading threshold
  const getLazyThreshold = useMemo(() => {
    return getMobileLazyThreshold(state.deviceType);
  }, [state.deviceType]);

  // Mobile-optimized scroll to element
  const scrollToElement = useCallback(
    (element: HTMLElement | string, options: ScrollIntoViewOptions = {}) => {
      const targetElement = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: state.scrollBehavior,
          block: 'start',
          inline: 'nearest',
          ...options,
        });
      }
    },
    [state.scrollBehavior]
  );

  // Mobile-optimized smooth scroll
  const smoothScroll = useCallback(
    (top: number, left: number = 0) => {
      window.scrollTo({
        top,
        left,
        behavior: state.scrollBehavior,
      });
    },
    [state.scrollBehavior]
  );

  // Mobile-optimized touch handler
  const createTouchHandler = useCallback(
    (handler: (event: TouchEvent) => void) => {
      return throttle(handler);
    },
    [throttle]
  );

  // Mobile-optimized click handler
  const createClickHandler = useCallback(
    (handler: (event: MouseEvent) => void) => {
      return debounce(handler);
    },
    [debounce]
  );

  // Mobile-optimized resize handler
  const createResizeHandler = useCallback(
    (handler: (event: UIEvent) => void) => {
      return throttle(handler);
    },
    [throttle]
  );

  // Mobile-optimized scroll handler
  const createScrollHandler = useCallback(
    (handler: (event: Event) => void) => {
      return throttle(handler);
    },
    [throttle]
  );

  // Mobile-optimized intersection observer
  const createIntersectionObserver = useCallback(
    (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
      const mobileOptions: IntersectionObserverInit = {
        rootMargin: '50px',
        threshold: getLazyThreshold,
        ...options,
      };
      
      return new IntersectionObserver(callback, mobileOptions);
    },
    [getLazyThreshold]
  );

  // Mobile-optimized performance monitoring
  const startPerformanceMonitoring = useCallback(
    (name: string) => {
      if (enablePerformanceMonitoring && typeof performance !== 'undefined') {
        performance.mark(`${name}_start`);
      }
    },
    [enablePerformanceMonitoring]
  );

  const endPerformanceMonitoring = useCallback(
    (name: string): number => {
      if (enablePerformanceMonitoring && typeof performance !== 'undefined') {
        performance.mark(`${name}_end`);
        performance.measure(name, `${name}_start`, `${name}_end`);
        
        const measure = performance.getEntriesByName(name)[0];
        return measure ? measure.duration : 0;
      }
      return 0;
    },
    [enablePerformanceMonitoring]
  );

  // Mobile-optimized image loading
  const optimizeImage = useCallback(
    (src: string, width: number, height: number, quality: number = 75) => {
      if (enableImageOptimization) {
        const params = new URLSearchParams({
          w: width.toString(),
          h: height.toString(),
          q: quality.toString(),
          f: 'webp',
          fit: 'cover',
        });
        
        return `${src}?${params.toString()}`;
      }
      return src;
    },
    [enableImageOptimization]
  );

  // Mobile-optimized lazy loading
  const createLazyLoader = useCallback(
    (callback: () => void) => {
      if (enableLazyLoading) {
        const observer = createIntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              callback();
              observer.disconnect();
            }
          });
        });
        
        return observer;
      } else {
        // Execute immediately if lazy loading is disabled
        callback();
        return null;
      }
    },
    [enableLazyLoading, createIntersectionObserver]
  );

  // Mobile-optimized error handling
  const handleMobileError = useCallback(
    (error: Error, context: string) => {
      console.error(`Mobile Error [${context}]:`, error);
      
      // Track error for analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'mobile_error', {
          event_category: 'mobile',
          event_label: context,
          custom_map: {
            error_message: error.message,
            error_stack: error.stack,
            device_type: state.deviceType,
          },
        });
      }
    },
    [state.deviceType]
  );

  // Mobile-optimized accessibility
  const getAccessibilityProps = useCallback(
    (elementType: 'button' | 'input' | 'link' | 'custom') => {
      const baseProps = {
        'aria-label': undefined as string | undefined,
        'aria-describedby': undefined as string | undefined,
        'aria-expanded': undefined as boolean | undefined,
        'aria-pressed': undefined as boolean | undefined,
      };

      if (elementType === 'button') {
        return {
          ...baseProps,
          'aria-label': 'Button',
          role: 'button',
          tabIndex: 0,
        };
      }

      if (elementType === 'input') {
        return {
          ...baseProps,
          'aria-label': 'Input field',
          'aria-describedby': 'input-description',
        };
      }

      if (elementType === 'link') {
        return {
          ...baseProps,
          'aria-label': 'Link',
          role: 'link',
          tabIndex: 0,
        };
      }

      return baseProps;
    },
    []
  );

  // Mobile-optimized focus management
  const focusElement = useCallback(
    (element: HTMLElement | string) => {
      const targetElement = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;
      
      if (targetElement) {
        targetElement.focus();
        
        // Scroll to element if it's not visible
        if (state.isMobile) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }
    },
    [state.isMobile]
  );

  // Mobile-optimized keyboard navigation
  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent, elements: HTMLElement[]) => {
      const currentIndex = elements.findIndex(el => el === document.activeElement);
      
      if (event.key === 'ArrowDown' || event.key === 'Tab') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % elements.length;
        elements[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
        elements[prevIndex]?.focus();
      }
    },
    []
  );

  return {
    // State
    ...state,
    
    // Utilities
    debounce,
    throttle,
    getSpacing,
    getFontSize,
    getAnimationDuration,
    getLazyThreshold,
    
    // Navigation
    scrollToElement,
    smoothScroll,
    
    // Event handlers
    createTouchHandler,
    createClickHandler,
    createResizeHandler,
    createScrollHandler,
    
    // Observers
    createIntersectionObserver,
    createLazyLoader,
    
    // Performance
    startPerformanceMonitoring,
    endPerformanceMonitoring,
    
    // Image optimization
    optimizeImage,
    
    // Error handling
    handleMobileError,
    
    // Accessibility
    getAccessibilityProps,
    focusElement,
    handleKeyboardNavigation,
  };
};

export default useMobileOptimization;