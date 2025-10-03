import React, { useState, useRef, useEffect } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { useSmartMobileUI } from '../hooks/useSmartMobileUI';

interface SmartMobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onLongPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large' | 'adaptive';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  smartFeatures?: {
    adaptiveSize?: boolean;
    contextualVariant?: boolean;
    gestureSupport?: boolean;
    hapticFeedback?: boolean;
    predictiveLoading?: boolean;
    accessibilityEnhancement?: boolean;
  };
  context?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    userActivity?: 'browsing' | 'shopping' | 'configuring' | 'checkout';
    sessionDuration?: number;
    previousInteractions?: number;
  };
}

/**
 * Smart mobile-optimized button component
 * Provides intelligent UI adaptations, gesture support, and contextual behavior
 */
const SmartMobileButton: React.FC<SmartMobileButtonProps> = ({
  children,
  onClick,
  onDoubleClick,
  onLongPress,
  variant = 'primary',
  size = 'adaptive',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ariaLabel,
  smartFeatures = {
    adaptiveSize: true,
    contextualVariant: true,
    gestureSupport: true,
    hapticFeedback: true,
    predictiveLoading: true,
    accessibilityEnhancement: true,
  },
  context,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isMobile, isTouchDevice, isLowEndDevice } = useMobileOptimization();
  const { 
    smartUIState, 
    uiAdaptations, 
    createSmartTapHandler, 
    createSmartGestureHandler,
    analyzeInteractionPatterns 
  } = useSmartMobileUI();

  // Smart size calculation
  const getSmartSize = () => {
    if (size !== 'adaptive') return size;
    
    // Adaptive sizing based on device and user behavior
    if (smartFeatures.adaptiveSize) {
      if (isLowEndDevice || smartUIState.interactionPatterns.tapAccuracy < 0.8) {
        return 'large';
      }
      if (smartUIState.interactionPatterns.gestureUsage > 0.7) {
        return 'large';
      }
      if (uiAdaptations.buttonSize === 'large') {
        return 'large';
      }
    }
    
    return 'medium';
  };

  // Smart variant calculation
  const getSmartVariant = () => {
    if (!smartFeatures.contextualVariant) return variant;
    
    // Contextual variant based on time, activity, and user behavior
    if (context?.timeOfDay === 'night') {
      return variant === 'primary' ? 'secondary' : variant;
    }
    
    if (context?.userActivity === 'checkout') {
      return 'success';
    }
    
    if (context?.userActivity === 'configuring' && interactionCount > 5) {
      return 'warning';
    }
    
    return variant;
  };

  // Smart button styles
  const getSmartButtonStyles = () => {
    const smartSize = getSmartSize();
    const smartVariant = getSmartVariant();
    
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: 'none',
      borderRadius: '12px', // More rounded for modern look
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
    };

    // Size-specific styles with smart adaptations
    const sizeStyles = {
      small: {
        padding: isMobile ? '8px 16px' : '10px 20px',
        fontSize: isMobile ? '14px' : '16px',
        minHeight: '36px',
        minWidth: '36px',
      },
      medium: {
        padding: isMobile ? '12px 24px' : '14px 28px',
        fontSize: isMobile ? '16px' : '18px',
        minHeight: '44px', // Minimum touch target
        minWidth: '44px',
      },
      large: {
        padding: isMobile ? '16px 32px' : '18px 36px',
        fontSize: isMobile ? '18px' : '20px',
        minHeight: '52px',
        minWidth: '52px',
      },
    };

    // Smart variant styles with contextual adaptations
    const variantStyles = {
      primary: {
        backgroundColor: context?.timeOfDay === 'night' ? '#1e40af' : '#3b82f6',
        color: '#ffffff',
        border: '1px solid transparent',
        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
      },
      secondary: {
        backgroundColor: '#6b7280',
        color: '#ffffff',
        border: '1px solid #6b7280',
        boxShadow: '0 4px 14px rgba(107, 114, 128, 0.3)',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#3b82f6',
        border: '2px solid #3b82f6',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#374151',
        border: '1px solid transparent',
        boxShadow: 'none',
      },
      danger: {
        backgroundColor: '#ef4444',
        color: '#ffffff',
        border: '1px solid #ef4444',
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
      },
      success: {
        backgroundColor: '#10b981',
        color: '#ffffff',
        border: '1px solid #10b981',
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
      },
      warning: {
        backgroundColor: '#f59e0b',
        color: '#ffffff',
        border: '1px solid #f59e0b',
        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
      },
    };

    // Interactive states
    const interactiveStyles = {
      transform: isPressed ? 'scale(0.95)' : 'scale(1)',
      opacity: disabled || loading ? 0.6 : 1,
      filter: isPressed ? 'brightness(0.95)' : 'brightness(1)',
    };

    // Smart animations based on device capabilities
    const animationStyles = smartUIState.userPreferences.reducedMotion ? {
      transition: 'none',
    } : {
      transition: uiAdaptations.animationSpeed === 'slow' ? 'all 0.5s ease' : 
                 uiAdaptations.animationSpeed === 'fast' ? 'all 0.1s ease' : 
                 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // Full width styles
    const fullWidthStyles = fullWidth ? {
      width: '100%',
    } : {};

    return {
      ...baseStyles,
      ...sizeStyles[smartSize],
      ...variantStyles[smartVariant],
      ...interactiveStyles,
      ...animationStyles,
      ...fullWidthStyles,
    };
  };

  // Handle click with smart features
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    // Track interaction
    setInteractionCount(prev => prev + 1);
    analyzeInteractionPatterns({
      type: 'tap',
      target: 'button',
      accuracy: 1,
      timing: Date.now(),
    });

    // Haptic feedback
    if (smartFeatures.hapticFeedback && isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Visual feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (onClick) {
      onClick();
    }
  };

  // Handle long press
  const handleLongPress = () => {
    if (disabled || loading) return;
    
    setIsLongPressing(true);
    
    // Enhanced haptic feedback for long press
    if (smartFeatures.hapticFeedback && isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
    
    if (onLongPress) {
      onLongPress();
    }
    
    setTimeout(() => setIsLongPressing(false), 200);
  };

  // Setup smart touch handlers
  useEffect(() => {
    if (!buttonRef.current || !smartFeatures.gestureSupport) return;

    const cleanupGesture = createSmartGestureHandler(buttonRef.current, {
      onSwipe: (gesture) => {
        // Handle swipe gestures
        if (gesture.direction === 'left' && gesture.velocity > 0.5) {
          // Swipe left action
          console.log('Swipe left detected');
        }
      }
    });

    const cleanupTap = createSmartTapHandler(buttonRef.current, {
      onTap: () => {
        // Single tap handled by onClick
      },
      onDoubleTap: () => {
        if (onDoubleClick) {
          onDoubleClick();
        }
      }
    });

    return () => {
      cleanupGesture();
      cleanupTap();
    };
  }, [smartFeatures.gestureSupport, createSmartGestureHandler, createSmartTapHandler, onDoubleClick]);

  // Setup long press detection
  useEffect(() => {
    if (!buttonRef.current || !onLongPress) return;

    const handleTouchStart = () => {
      longPressTimerRef.current = setTimeout(handleLongPress, 500);
    };

    const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const button = buttonRef.current;
    button.addEventListener('touchstart', handleTouchStart);
    button.addEventListener('touchend', handleTouchEnd);
    button.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      button.removeEventListener('touchstart', handleTouchStart);
      button.removeEventListener('touchend', handleTouchEnd);
      button.removeEventListener('touchcancel', handleTouchEnd);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [onLongPress]);

  // Smart tooltip for accessibility
  useEffect(() => {
    if (!smartFeatures.accessibilityEnhancement || !ariaLabel) return;

    const handleMouseEnter = () => {
      tooltipTimerRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 1000);
    };

    const handleMouseLeave = () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }
      setShowTooltip(false);
    };

    const button = buttonRef.current;
    if (button) {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (button) {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, [smartFeatures.accessibilityEnhancement, ariaLabel]);

  return (
    <>
      <button
        ref={buttonRef}
        type={type}
        className={`smart-mobile-button ${className}`}
        style={getSmartButtonStyles()}
        onClick={handleClick}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
        aria-pressed={isPressed}
        data-smart-features={JSON.stringify(smartFeatures)}
        data-context={context ? JSON.stringify(context) : undefined}
      >
        {/* Loading spinner with smart animation */}
        {loading && (
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: smartUIState.userPreferences.reducedMotion ? 'none' : 'spin 1s linear infinite',
            }}
          />
        )}
        
        {/* Button content with smart adaptations */}
        <span style={{ 
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s ease',
        }}>
          {children}
        </span>

        {/* Smart interaction indicator */}
        {isLongPressing && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              border: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'pulse 0.5s ease-in-out',
            }}
          />
        )}

        {/* Smart ripple effect */}
        {isPressed && !smartUIState.userPreferences.reducedMotion && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              borderRadius: 'inherit',
              animation: 'ripple 0.6s ease-out',
            }}
          />
        )}
      </button>

      {/* Smart tooltip */}
      {showTooltip && smartFeatures.accessibilityEnhancement && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            marginBottom: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {ariaLabel}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1f2937',
            }}
          />
        </div>
      )}

      {/* Smart mobile styles */}
      <style jsx>{`
        .smart-mobile-button {
          /* Smart mobile optimizations */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          will-change: transform;
          backface-visibility: hidden;
        }

        .smart-mobile-button:active {
          transform: scale(0.95) !important;
        }

        .smart-mobile-button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .smart-mobile-button:focus:not(:focus-visible) {
          outline: none;
        }

        /* Smart animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.7; }
        }

        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }

        /* Smart hover effects */
        @media (hover: hover) {
          .smart-mobile-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
        }

        /* Smart disabled states */
        .smart-mobile-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Smart responsive adjustments */
        @media (max-width: 767px) {
          .smart-mobile-button {
            font-size: 16px !important; /* Prevent zoom on iOS */
          }
        }

        /* Smart accessibility */
        .smart-mobile-button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Smart performance optimizations */
        .smart-mobile-button * {
          will-change: auto;
        }

        .smart-mobile-button:hover *,
        .smart-mobile-button:active * {
          will-change: transform;
        }
      `}</style>
    </>
  );
};

export default SmartMobileButton;