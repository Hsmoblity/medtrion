import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for mobile optimization features
 * Provides device detection, viewport management, and mobile-specific optimizations
 */
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  // Device detection based on user agent
  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
    
    const isMobileDevice = mobileRegex.test(userAgent);
    const isTabletDevice = tabletRegex.test(userAgent);
    const isDesktopDevice = !isMobileDevice && !isTabletDevice;

    setIsMobile(isMobileDevice);
    setIsTablet(isTabletDevice);
    setIsDesktop(isDesktopDevice);
  }, []);

  // Viewport detection
  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return;

    setViewportWidth(window.innerWidth);
    setViewportHeight(window.innerHeight);

    // Update device type based on viewport
    const width = window.innerWidth;
    if (width < 768) {
      setIsMobile(true);
      setIsTablet(false);
      setIsDesktop(false);
    } else if (width < 1024) {
      setIsMobile(false);
      setIsTablet(true);
      setIsDesktop(false);
    } else {
      setIsMobile(false);
      setIsTablet(false);
      setIsDesktop(true);
    }
  }, []);

  // Touch device detection
  const detectTouchDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isTouch = 'ontouchstart' in window || 
                   navigator.maxTouchPoints > 0 || 
                   (navigator as any).msMaxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  // Low-end device detection
  const detectLowEndDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                     (navigator as any).deviceMemory <= 2;
    setIsLowEndDevice(isLowEnd);
  }, []);

  // Connection type detection
  const detectConnectionType = useCallback(() => {
    if (typeof window === 'undefined') return;

    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType || 'unknown';
      setConnectionType(effectiveType);
    }
  }, []);

  // Initialize all detections
  useEffect(() => {
    detectDevice();
    updateViewport();
    detectTouchDevice();
    detectLowEndDevice();
    detectConnectionType();

    // Add event listeners
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [detectDevice, updateViewport, detectTouchDevice, detectLowEndDevice, detectConnectionType]);

  // Mobile-specific optimizations
  const getMobileOptimizations = useCallback(() => {
    return {
      // Image optimization
      imageQuality: isLowEndDevice ? 'low' : 'high',
      imageFormat: connectionType === 'slow-2g' || connectionType === '2g' ? 'webp' : 'auto',
      
      // Performance optimizations
      enableLazyLoading: true,
      enablePreloading: !isLowEndDevice,
      enableAnimations: !isLowEndDevice,
      
      // UI optimizations
      touchTargetSize: 'large', // 44px minimum for touch targets
      enableGestures: isTouchDevice,
      enableHapticFeedback: isTouchDevice,
      
      // Content optimizations
      contentPriority: isMobile ? 'high' : 'normal',
      enableProgressiveLoading: isLowEndDevice,
      
      // Network optimizations
      enableOfflineSupport: connectionType === 'slow-2g' || connectionType === '2g',
      enableDataSaver: isLowEndDevice,
    };
  }, [isMobile, isLowEndDevice, isTouchDevice, connectionType]);

  // Device-specific breakpoints
  const getBreakpoints = useCallback(() => {
    return {
      mobile: viewportWidth < 768,
      tablet: viewportWidth >= 768 && viewportWidth < 1024,
      desktop: viewportWidth >= 1024,
      large: viewportWidth >= 1280,
      xlarge: viewportWidth >= 1536,
    };
  }, [viewportWidth]);

  // Mobile-specific utilities
  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToElement = useCallback((elementId: string) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  // Mobile gesture detection
  const detectSwipe = useCallback((element: HTMLElement, onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
    if (!isTouchDevice) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Minimum swipe distance
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouchDevice]);

  return {
    // Device detection
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isLowEndDevice,
    
    // Viewport information
    viewportWidth,
    viewportHeight,
    connectionType,
    
    // Utilities
    getMobileOptimizations,
    getBreakpoints,
    scrollToTop,
    scrollToElement,
    detectSwipe,
    
    // Device type
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  };
};

export default useMobileOptimization;