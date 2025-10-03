import { useState, useEffect, useCallback, useRef } from 'react';
import { useMobileOptimization } from './useMobileOptimization';
import { useMobilePerformance } from './useMobilePerformance';

/**
 * Hook for smart mobile UI features
 * Provides intelligent UI adaptations based on device capabilities, user behavior, and context
 */
export const useSmartMobileUI = () => {
  const { 
    isMobile, 
    isTablet, 
    isTouchDevice, 
    isLowEndDevice, 
    connectionType, 
    viewportWidth, 
    viewportHeight,
    getMobileOptimizations 
  } = useMobileOptimization();
  
  const { performanceScore, memoryUsage, networkStatus } = useMobilePerformance();
  
  // Smart UI state
  const [smartUIState, setSmartUIState] = useState({
    adaptiveLayout: true,
    smartAnimations: true,
    contextualUI: true,
    predictiveLoading: true,
    gestureOptimization: true,
    accessibilityEnhancement: true,
    performanceMode: false,
    userPreferences: {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      darkMode: false,
    },
    interactionPatterns: {
      swipeFrequency: 0,
      tapAccuracy: 0,
      scrollSpeed: 0,
      gestureUsage: 0,
    },
    contextAwareness: {
      timeOfDay: 'day',
      location: 'unknown',
      activity: 'browsing',
      sessionDuration: 0,
    }
  });

  const [uiAdaptations, setUIAdaptations] = useState({
    buttonSize: 'medium',
    animationSpeed: 'normal',
    imageQuality: 'high',
    contentDensity: 'normal',
    interactionFeedback: 'full',
    layoutComplexity: 'standard',
  });

  const interactionHistoryRef = useRef<any[]>([]);
  const sessionStartTimeRef = useRef(Date.now());

  // Detect user preferences from system settings
  const detectUserPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;

    const preferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      largeText: window.matchMedia('(prefers-reduced-data: no-preference)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    };

    setSmartUIState(prev => ({
      ...prev,
      userPreferences: preferences
    }));
  }, []);

  // Analyze interaction patterns for smart adaptations
  const analyzeInteractionPatterns = useCallback((interaction: any) => {
    interactionHistoryRef.current.push({
      ...interaction,
      timestamp: Date.now(),
    });

    // Keep only last 50 interactions
    if (interactionHistoryRef.current.length > 50) {
      interactionHistoryRef.current = interactionHistoryRef.current.slice(-50);
    }

    // Analyze patterns
    const recentInteractions = interactionHistoryRef.current.slice(-10);
    const swipeCount = recentInteractions.filter(i => i.type === 'swipe').length;
    const tapCount = recentInteractions.filter(i => i.type === 'tap').length;
    const scrollCount = recentInteractions.filter(i => i.type === 'scroll').length;

    const patterns = {
      swipeFrequency: swipeCount / recentInteractions.length,
      tapAccuracy: tapCount / recentInteractions.length,
      scrollSpeed: scrollCount / recentInteractions.length,
      gestureUsage: (swipeCount + tapCount) / recentInteractions.length,
    };

    setSmartUIState(prev => ({
      ...prev,
      interactionPatterns: patterns
    }));
  }, []);

  // Smart UI adaptations based on device and user behavior
  const calculateSmartAdaptations = useCallback(() => {
    const adaptations = {
      buttonSize: 'medium',
      animationSpeed: 'normal',
      imageQuality: 'high',
      contentDensity: 'normal',
      interactionFeedback: 'full',
      layoutComplexity: 'standard',
    };

    // Device-based adaptations
    if (isLowEndDevice || performanceScore < 50) {
      adaptations.buttonSize = 'large'; // Easier to tap
      adaptations.animationSpeed = 'slow';
      adaptations.imageQuality = 'medium';
      adaptations.contentDensity = 'low';
      adaptations.interactionFeedback = 'minimal';
      adaptations.layoutComplexity = 'simple';
    }

    // Connection-based adaptations
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      adaptations.imageQuality = 'low';
      adaptations.contentDensity = 'low';
      adaptations.layoutComplexity = 'simple';
    }

    // User preference adaptations
    if (smartUIState.userPreferences.reducedMotion) {
      adaptations.animationSpeed = 'none';
      adaptations.interactionFeedback = 'minimal';
    }

    if (smartUIState.userPreferences.highContrast) {
      adaptations.layoutComplexity = 'simple';
    }

    // Interaction pattern adaptations
    if (smartUIState.interactionPatterns.gestureUsage > 0.7) {
      adaptations.buttonSize = 'large';
      adaptations.interactionFeedback = 'enhanced';
    }

    if (smartUIState.interactionPatterns.tapAccuracy < 0.8) {
      adaptations.buttonSize = 'large';
    }

    // Performance-based adaptations
    if (memoryUsage > 50 || performanceScore < 70) {
      adaptations.animationSpeed = 'slow';
      adaptations.imageQuality = 'medium';
      adaptations.layoutComplexity = 'simple';
    }

    setUIAdaptations(adaptations);
  }, [
    isLowEndDevice, 
    performanceScore, 
    connectionType, 
    smartUIState.userPreferences, 
    smartUIState.interactionPatterns, 
    memoryUsage
  ]);

  // Context-aware UI adaptations
  const updateContextAwareness = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const sessionDuration = Date.now() - sessionStartTimeRef.current;

    const context = {
      timeOfDay: hour < 6 || hour > 22 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening',
      location: 'unknown', // Could be enhanced with geolocation
      activity: sessionDuration > 300000 ? 'engaged' : 'browsing', // 5 minutes
      sessionDuration: Math.floor(sessionDuration / 1000), // in seconds
    };

    setSmartUIState(prev => ({
      ...prev,
      contextAwareness: context
    }));
  }, []);

  // Smart gesture detection with learning
  const createSmartGestureHandler = useCallback((element: HTMLElement, options: any) => {
    if (!isTouchDevice) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let velocity = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

      // Analyze gesture
      const gesture = {
        type: 'swipe',
        direction: Math.abs(deltaX) > Math.abs(deltaY) ? 
          (deltaX > 0 ? 'right' : 'left') : 
          (deltaY > 0 ? 'down' : 'up'),
        distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        velocity: velocity,
        duration: deltaTime,
      };

      // Learn from gesture patterns
      analyzeInteractionPatterns(gesture);

      // Execute gesture handler
      if (options.onSwipe && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
        options.onSwipe(gesture);
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouchDevice, analyzeInteractionPatterns]);

  // Smart tap detection with accuracy learning
  const createSmartTapHandler = useCallback((element: HTMLElement, options: any) => {
    if (!isTouchDevice) return;

    let tapStartTime = 0;
    let tapCount = 0;
    let lastTapTime = 0;

    const handleTap = (e: TouchEvent) => {
      const tapTime = Date.now();
      const timeSinceLastTap = tapTime - lastTapTime;
      
      // Detect double tap
      if (timeSinceLastTap < 300) {
        tapCount++;
        if (tapCount === 2 && options.onDoubleTap) {
          options.onDoubleTap(e);
          tapCount = 0;
        }
      } else {
        tapCount = 1;
        if (options.onTap) {
          options.onTap(e);
        }
      }

      lastTapTime = tapTime;

      // Analyze tap accuracy
      const tapAccuracy = {
        type: 'tap',
        accuracy: 1, // Could be enhanced with target size analysis
        timing: tapTime - tapStartTime,
      };

      analyzeInteractionPatterns(tapAccuracy);
    };

    element.addEventListener('touchstart', () => { tapStartTime = Date.now(); });
    element.addEventListener('touchend', handleTap);

    return () => {
      element.removeEventListener('touchstart', () => {});
      element.removeEventListener('touchend', handleTap);
    };
  }, [isTouchDevice, analyzeInteractionPatterns]);

  // Smart scroll detection with behavior learning
  const createSmartScrollHandler = useCallback((element: HTMLElement, options: any) => {
    let lastScrollTime = 0;
    let scrollVelocity = 0;
    let lastScrollY = 0;

    const handleScroll = (e: Event) => {
      const currentTime = Date.now();
      const currentScrollY = element.scrollTop;
      const deltaTime = currentTime - lastScrollTime;
      const deltaY = currentScrollY - lastScrollY;

      if (deltaTime > 0) {
        scrollVelocity = Math.abs(deltaY) / deltaTime;
      }

      // Analyze scroll behavior
      const scrollBehavior = {
        type: 'scroll',
        velocity: scrollVelocity,
        direction: deltaY > 0 ? 'down' : 'up',
        distance: Math.abs(deltaY),
      };

      analyzeInteractionPatterns(scrollBehavior);

      // Execute scroll handler
      if (options.onScroll) {
        options.onScroll(scrollBehavior);
      }

      lastScrollTime = currentTime;
      lastScrollY = currentScrollY;
    };

    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [analyzeInteractionPatterns]);

  // Initialize smart UI
  useEffect(() => {
    detectUserPreferences();
    updateContextAwareness();
    
    // Update context every minute
    const contextInterval = setInterval(updateContextAwareness, 60000);
    
    return () => clearInterval(contextInterval);
  }, [detectUserPreferences, updateContextAwareness]);

  // Calculate adaptations when dependencies change
  useEffect(() => {
    calculateSmartAdaptations();
  }, [calculateSmartAdaptations]);

  // Smart UI recommendations
  const getSmartRecommendations = useCallback(() => {
    const recommendations = [];

    if (smartUIState.interactionPatterns.gestureUsage > 0.8) {
      recommendations.push({
        type: 'gesture',
        message: 'Consider adding more gesture shortcuts',
        priority: 'high'
      });
    }

    if (smartUIState.interactionPatterns.tapAccuracy < 0.7) {
      recommendations.push({
        type: 'accessibility',
        message: 'Increase touch target sizes',
        priority: 'high'
      });
    }

    if (performanceScore < 70) {
      recommendations.push({
        type: 'performance',
        message: 'Reduce animation complexity',
        priority: 'medium'
      });
    }

    if (smartUIState.contextAwareness.sessionDuration > 1800) { // 30 minutes
      recommendations.push({
        type: 'ux',
        message: 'Consider adding session management features',
        priority: 'low'
      });
    }

    return recommendations;
  }, [smartUIState, performanceScore]);

  return {
    // Smart UI state
    smartUIState,
    uiAdaptations,
    
    // Smart handlers
    createSmartGestureHandler,
    createSmartTapHandler,
    createSmartScrollHandler,
    
    // Smart recommendations
    getSmartRecommendations,
    
    // Utility functions
    analyzeInteractionPatterns,
    updateContextAwareness,
    
    // Smart UI features
    isSmartUIEnabled: smartUIState.adaptiveLayout,
    enableSmartUI: () => setSmartUIState(prev => ({ ...prev, adaptiveLayout: true })),
    disableSmartUI: () => setSmartUIState(prev => ({ ...prev, adaptiveLayout: false })),
    
    // Performance mode
    enablePerformanceMode: () => setSmartUIState(prev => ({ ...prev, performanceMode: true })),
    disablePerformanceMode: () => setSmartUIState(prev => ({ ...prev, performanceMode: false })),
  };
};

export default useSmartMobileUI;