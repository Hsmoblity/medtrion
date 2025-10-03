import React from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

/**
 * Mobile-optimized button component
 * Provides touch-friendly interactions and mobile-specific optimizations
 */
const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ariaLabel,
}) => {
  const { isMobile, isTouchDevice } = useMobileOptimization();

  // Mobile-specific button styles
  const getButtonStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: 'none',
      borderRadius: '8px',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };

    // Size-specific styles
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
        minHeight: '44px', // Minimum touch target size
        minWidth: '44px',
      },
      large: {
        padding: isMobile ? '16px 32px' : '18px 36px',
        fontSize: isMobile ? '18px' : '20px',
        minHeight: '52px',
        minWidth: '52px',
      },
    };

    // Variant-specific styles
    const variantStyles = {
      primary: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: '1px solid #3b82f6',
      },
      secondary: {
        backgroundColor: '#6b7280',
        color: '#ffffff',
        border: '1px solid #6b7280',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#3b82f6',
        border: '1px solid #3b82f6',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#374151',
        border: '1px solid transparent',
      },
      danger: {
        backgroundColor: '#ef4444',
        color: '#ffffff',
        border: '1px solid #ef4444',
      },
    };

    // Disabled styles
    const disabledStyles = disabled || loading ? {
      opacity: 0.6,
      cursor: 'not-allowed',
    } : {};

    // Full width styles
    const fullWidthStyles = fullWidth ? {
      width: '100%',
    } : {};

    // Mobile-specific optimizations
    const mobileStyles = {
      // Prevent text selection on mobile
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      MsUserSelect: 'none',
      userSelect: 'none',
      
      // Optimize for touch
      WebkitTouchCallout: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyles,
      ...fullWidthStyles,
      ...mobileStyles,
    };
  };

  // Handle click with mobile optimizations
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    // Add haptic feedback for touch devices
    if (isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Add visual feedback
    const button = e.currentTarget;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

    if (onClick) {
      onClick();
    }
  };

  // Handle touch events for better mobile experience
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const button = e.currentTarget;
    button.style.transform = 'scale(0.95)';
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.style.transform = 'scale(1)';
  };

  return (
    <button
      type={type}
      className={`mobile-button ${className}`}
      style={getButtonStyles()}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
    >
      {/* Loading spinner */}
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      
      {/* Button content */}
      <span style={{ opacity: loading ? 0.7 : 1 }}>
        {children}
      </span>

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-button {
          /* Mobile-specific button optimizations */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .mobile-button:active {
          transform: scale(0.95) !important;
        }

        .mobile-button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .mobile-button:focus:not(:focus-visible) {
          outline: none;
        }

        /* Loading animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile-specific hover effects */
        @media (hover: hover) {
          .mobile-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        }

        /* Mobile-specific active states */
        .mobile-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        /* Mobile-specific disabled states */
        .mobile-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Mobile-specific responsive adjustments */
        @media (max-width: 767px) {
          .mobile-button {
            font-size: 16px !important; /* Prevent zoom on iOS */
          }
        }

        /* Mobile-specific accessibility */
        .mobile-button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Mobile-specific performance optimizations */
        .mobile-button {
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
    </button>
  );
};

export default MobileButton;