import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { useSmartMobileUI } from '../hooks/useSmartMobileUI';
import MobileHeader from './MobileHeader';
import MobileFooter from './MobileFooter';

interface SmartMobileLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  smartFeatures?: {
    adaptiveLayout?: boolean;
    contextualUI?: boolean;
    performanceOptimization?: boolean;
    accessibilityEnhancement?: boolean;
    gestureOptimization?: boolean;
    predictiveLoading?: boolean;
  };
  context?: {
    pageType?: 'home' | 'product' | 'configurator' | 'cart' | 'payment' | 'blog';
    userActivity?: 'browsing' | 'shopping' | 'configuring' | 'checkout';
    sessionDuration?: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    networkCondition?: 'fast' | 'slow' | 'offline';
    userPreferences?: {
      reducedMotion?: boolean;
      highContrast?: boolean;
      largeText?: boolean;
      darkMode?: boolean;
    };
  };
}

/**
 * Smart mobile-optimized layout component
 * Provides intelligent layout adaptations based on context, user behavior, and device capabilities
 */
const SmartMobileLayout: React.FC<SmartMobileLayoutProps> = ({
  children,
  title,
  description,
  showHeader = true,
  showFooter = true,
  className = '',
  smartFeatures = {
    adaptiveLayout: true,
    contextualUI: true,
    performanceOptimization: true,
    accessibilityEnhancement: true,
    gestureOptimization: true,
    predictiveLoading: true,
  },
  context,
}) => {
  const [layoutState, setLayoutState] = useState({
    isCompact: false,
    isExpanded: false,
    isNightMode: false,
    isHighContrast: false,
    isLargeText: false,
    isReducedMotion: false,
    currentLayout: 'standard',
  });

  const [performanceState, setPerformanceState] = useState({
    isLowPerformance: false,
    isSlowNetwork: false,
    isMemoryConstrained: false,
    optimizationLevel: 'standard',
  });

  const { 
    isMobile, 
    isTablet, 
    isLowEndDevice, 
    connectionType, 
    viewportWidth, 
    viewportHeight,
    getMobileOptimizations 
  } = useMobileOptimization();
  
  const { 
    smartUIState, 
    uiAdaptations, 
    getSmartRecommendations,
    updateContextAwareness 
  } = useSmartMobileUI();

  // Smart layout calculation based on context and device
  const calculateSmartLayout = useCallback(() => {
    let layout = 'standard';
    let isCompact = false;
    let isExpanded = false;

    // Context-based layout adaptations
    if (smartFeatures.contextualUI && context) {
      switch (context.pageType) {
        case 'configurator':
          layout = 'expanded';
          isExpanded = true;
          break;
        case 'cart':
        case 'payment':
          layout = 'compact';
          isCompact = true;
          break;
        case 'product':
          layout = 'standard';
          break;
        case 'home':
          layout = 'expanded';
          isExpanded = true;
          break;
        default:
          layout = 'standard';
      }

      // Activity-based adaptations
      if (context.userActivity === 'checkout') {
        layout = 'compact';
        isCompact = true;
      } else if (context.userActivity === 'configuring') {
        layout = 'expanded';
        isExpanded = true;
      }
    }

    // Device-based adaptations
    if (isLowEndDevice || performanceState.isLowPerformance) {
      layout = 'compact';
      isCompact = true;
    }

    // Network-based adaptations
    if (connectionType === 'slow-2g' || connectionType === '2g' || performanceState.isSlowNetwork) {
      layout = 'compact';
      isCompact = true;
    }

    // Viewport-based adaptations
    if (viewportHeight < 600) {
      layout = 'compact';
      isCompact = true;
    } else if (viewportHeight > 800) {
      layout = 'expanded';
      isExpanded = true;
    }

    setLayoutState(prev => ({
      ...prev,
      currentLayout: layout,
      isCompact,
      isExpanded,
    }));
  }, [
    smartFeatures.contextualUI, 
    context, 
    isLowEndDevice, 
    performanceState, 
    connectionType, 
    viewportHeight
  ]);

  // Smart performance optimization
  const calculatePerformanceOptimizations = useCallback(() => {
    const isLowPerformance = isLowEndDevice || smartUIState.performanceMode;
    const isSlowNetwork = connectionType === 'slow-2g' || connectionType === '2g';
    const isMemoryConstrained = smartUIState.memoryUsage > 50;

    let optimizationLevel = 'standard';
    if (isLowPerformance || isSlowNetwork || isMemoryConstrained) {
      optimizationLevel = 'aggressive';
    } else if (connectionType === '3g') {
      optimizationLevel = 'moderate';
    }

    setPerformanceState({
      isLowPerformance,
      isSlowNetwork,
      isMemoryConstrained,
      optimizationLevel,
    });
  }, [
    isLowEndDevice, 
    smartUIState.performanceMode, 
    connectionType, 
    smartUIState.memoryUsage
  ]);

  // Smart accessibility adaptations
  const calculateAccessibilityAdaptations = useCallback(() => {
    const userPrefs = context?.userPreferences || smartUIState.userPreferences;
    
    setLayoutState(prev => ({
      ...prev,
      isNightMode: userPrefs.darkMode || context?.timeOfDay === 'night',
      isHighContrast: userPrefs.highContrast,
      isLargeText: userPrefs.largeText,
      isReducedMotion: userPrefs.reducedMotion,
    }));
  }, [context, smartUIState.userPreferences]);

  // Smart mobile styles based on calculated state
  const getSmartLayoutStyles = () => {
    const baseStyles = {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: layoutState.isNightMode ? '#0f172a' : '#ffffff',
      color: layoutState.isNightMode ? '#f1f5f9' : '#1f2937',
      fontSize: layoutState.isLargeText ? '18px' : isMobile ? '14px' : '16px',
      lineHeight: layoutState.isLargeText ? '1.7' : '1.6',
      transition: layoutState.isReducedMotion ? 'none' : 'all 0.3s ease',
    };

    // Performance-based optimizations
    const performanceStyles = performanceState.optimizationLevel === 'aggressive' ? {
      // Disable expensive CSS features
      backdropFilter: 'none',
      filter: 'none',
      boxShadow: 'none',
      // Use simpler animations
      transition: 'none',
    } : performanceState.optimizationLevel === 'moderate' ? {
      // Reduce some expensive features
      backdropFilter: 'blur(5px)',
      filter: 'brightness(1)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    } : {
      // Full features
      backdropFilter: 'blur(10px)',
      filter: 'brightness(1)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    };

    // Layout-specific styles
    const layoutStyles = layoutState.isCompact ? {
      padding: '8px',
      gap: '8px',
    } : layoutState.isExpanded ? {
      padding: '24px',
      gap: '24px',
    } : {
      padding: '16px',
      gap: '16px',
    };

    // Accessibility styles
    const accessibilityStyles = {
      // High contrast mode
      ...(layoutState.isHighContrast && {
        backgroundColor: '#000000',
        color: '#ffffff',
        borderColor: '#ffffff',
      }),
      // Large text mode
      ...(layoutState.isLargeText && {
        fontSize: '20px',
        lineHeight: '1.8',
      }),
    };

    return {
      ...baseStyles,
      ...performanceStyles,
      ...layoutStyles,
      ...accessibilityStyles,
    };
  };

  // Smart content area styles
  const getSmartContentStyles = () => {
    const baseStyles = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      paddingTop: showHeader ? (layoutState.isCompact ? '50px' : isMobile ? '60px' : '80px') : '0',
      paddingBottom: showFooter ? (layoutState.isCompact ? '50px' : isMobile ? '60px' : '80px') : '0',
      minHeight: `calc(100vh - ${showHeader ? (layoutState.isCompact ? '100px' : '120px') : '0px'} - ${showFooter ? (layoutState.isCompact ? '100px' : '120px') : '0px'})`,
    };

    // Performance-based content optimizations
    const performanceStyles = performanceState.optimizationLevel === 'aggressive' ? {
      // Disable expensive layout features
      transform: 'none',
      willChange: 'auto',
    } : {
      // Enable smooth scrolling and transforms
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
    };

    return {
      ...baseStyles,
      ...performanceStyles,
    };
  };

  // Initialize smart layout calculations
  useEffect(() => {
    calculateSmartLayout();
    calculatePerformanceOptimizations();
    calculateAccessibilityAdaptations();
  }, [
    calculateSmartLayout, 
    calculatePerformanceOptimizations, 
    calculateAccessibilityAdaptations
  ]);

  // Update context awareness
  useEffect(() => {
    if (smartFeatures.contextualUI) {
      updateContextAwareness();
    }
  }, [smartFeatures.contextualUI, updateContextAwareness]);

  // Smart recommendations
  const smartRecommendations = getSmartRecommendations();

  return (
    <div 
      className={`smart-mobile-layout ${className}`}
      style={getSmartLayoutStyles()}
      data-smart-layout={layoutState.currentLayout}
      data-performance-level={performanceState.optimizationLevel}
      data-context={context ? JSON.stringify(context) : undefined}
    >
      {/* Smart Header */}
      {showHeader && (
        <MobileHeader 
          title={title}
          description={description}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      )}

      {/* Smart Content Area */}
      <main 
        className="smart-mobile-content"
        style={getSmartContentStyles()}
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>

      {/* Smart Footer */}
      {showFooter && (
        <MobileFooter 
          isMobile={isMobile}
          isTablet={isTablet}
        />
      )}

      {/* Smart Performance Indicator (Development only) */}
      {process.env.NODE_ENV === 'development' && smartFeatures.performanceOptimization && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 9999,
            fontFamily: 'monospace',
          }}
        >
          <div>Layout: {layoutState.currentLayout}</div>
          <div>Performance: {performanceState.optimizationLevel}</div>
          <div>Network: {connectionType}</div>
          <div>Memory: {smartUIState.memoryUsage?.toFixed(1)}MB</div>
        </div>
      )}

      {/* Smart Recommendations Panel (Development only) */}
      {process.env.NODE_ENV === 'development' && smartRecommendations.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '200px',
            zIndex: 9999,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Smart Recommendations:</div>
          {smartRecommendations.map((rec, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              <span style={{ 
                backgroundColor: rec.priority === 'high' ? '#ef4444' : 
                                rec.priority === 'medium' ? '#f59e0b' : '#10b981',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                marginRight: '6px',
              }}>
                {rec.priority}
              </span>
              {rec.message}
            </div>
          ))}
        </div>
      )}

      {/* Smart mobile styles */}
      <style jsx>{`
        .smart-mobile-layout {
          /* Smart mobile optimizations */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .smart-mobile-layout * {
          /* Prevent text selection on mobile */
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .smart-mobile-layout input,
        .smart-mobile-layout textarea {
          /* Allow text selection in form elements */
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }

        /* Smart responsive adjustments */
        @media (max-width: 767px) {
          .smart-mobile-layout {
            font-size: 14px;
            line-height: 1.5;
          }
          
          .smart-mobile-content {
            padding-left: 16px;
            padding-right: 16px;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .smart-mobile-layout {
            font-size: 15px;
            line-height: 1.55;
          }
          
          .smart-mobile-content {
            padding-left: 24px;
            padding-right: 24px;
          }
        }

        @media (min-width: 1024px) {
          .smart-mobile-layout {
            font-size: 16px;
            line-height: 1.6;
          }
          
          .smart-mobile-content {
            padding-left: 32px;
            padding-right: 32px;
          }
        }

        /* Smart performance optimizations */
        .smart-mobile-layout img {
          /* Optimize images for mobile */
          max-width: 100%;
          height: auto;
          loading: lazy;
        }

        .smart-mobile-layout video {
          /* Optimize videos for mobile */
          max-width: 100%;
          height: auto;
        }

        /* Smart accessibility */
        .smart-mobile-layout:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Smart touch optimizations */
        .smart-mobile-layout button,
        .smart-mobile-layout a {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }

        /* Smart scroll optimizations */
        .smart-mobile-layout {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Smart dark mode */
        .smart-mobile-layout[data-smart-layout] {
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Smart performance mode */
        .smart-mobile-layout[data-performance-level="aggressive"] {
          /* Disable expensive CSS features */
          backdrop-filter: none !important;
          filter: none !important;
          box-shadow: none !important;
          transform: none !important;
          transition: none !important;
        }

        /* Smart compact mode */
        .smart-mobile-layout[data-smart-layout="compact"] {
          /* Reduce spacing and padding */
          padding: 8px !important;
          gap: 8px !important;
        }

        /* Smart expanded mode */
        .smart-mobile-layout[data-smart-layout="expanded"] {
          /* Increase spacing and padding */
          padding: 24px !important;
          gap: 24px !important;
        }
      `}</style>
    </div>
  );
};

export default SmartMobileLayout;