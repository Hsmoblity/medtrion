import React, { ReactNode } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import MobileHeader from './MobileHeader';
import MobileFooter from './MobileFooter';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * Mobile-optimized layout component
 * Provides mobile-specific layout patterns and optimizations
 */
const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  description,
  showHeader = true,
  showFooter = true,
  className = '',
}) => {
  const { isMobile, isTablet, getMobileOptimizations, getBreakpoints } = useMobileOptimization();
  const optimizations = getMobileOptimizations();
  const breakpoints = getBreakpoints();

  // Mobile-specific styles
  const mobileStyles = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#ffffff',
    fontSize: isMobile ? '14px' : '16px',
    lineHeight: isMobile ? '1.5' : '1.6',
  };

  // Content area styles
  const contentStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    paddingTop: showHeader ? (isMobile ? '72px' : '88px') : '0',
    paddingBottom: showFooter ? (isMobile ? '60px' : '80px') : '0',
    minHeight: 'calc(100vh - 120px)',
  };

  // Mobile-specific optimizations
  const mobileOptimizations: React.CSSProperties = {
    // Disable animations on low-end devices
    animation: optimizations.enableAnimations ? 'auto' : 'none',
    
    // Optimize touch targets
    touchAction: 'manipulation',
    
    // Prevent zoom on input focus
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  };

  return (
    <div 
      className={`mobile-layout ${className}`}
      style={{
        ...mobileStyles,
        ...mobileOptimizations,
      }}
    >
      {/* Mobile Header */}
      {showHeader && (
        <MobileHeader 
          title={title}
          description={description}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      )}

      {/* Main Content Area */}
      <main 
        className="mobile-content"
        style={contentStyles}
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>

      {/* Mobile Footer */}
      {showFooter && (
        <MobileFooter 
          isMobile={isMobile}
          isTablet={isTablet}
        />
      )}

      {/* Mobile-specific meta tags */}
      <style jsx>{`
        .mobile-layout {
          /* Mobile-specific CSS */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .mobile-layout * {
          /* Prevent text selection on mobile */
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .mobile-layout input,
        .mobile-layout textarea {
          /* Allow text selection in form elements */
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }

        /* Mobile-specific responsive adjustments */
        @media (max-width: 767px) {
          .mobile-layout {
            font-size: 14px;
            line-height: 1.5;
          }
          
          .mobile-content {
            padding-left: 16px;
            padding-right: 16px;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .mobile-layout {
            font-size: 15px;
            line-height: 1.55;
          }
          
          .mobile-content {
            padding-left: 24px;
            padding-right: 24px;
          }
        }

        @media (min-width: 1024px) {
          .mobile-layout {
            font-size: 16px;
            line-height: 1.6;
          }
          
          .mobile-content {
            padding-left: 32px;
            padding-right: 32px;
          }
        }

        /* Mobile-specific performance optimizations */
        .mobile-layout img {
          /* Optimize images for mobile */
          max-width: 100%;
          height: auto;
          loading: lazy;
        }

        .mobile-layout video {
          /* Optimize videos for mobile */
          max-width: 100%;
          height: auto;
        }

        /* Mobile-specific accessibility */
        .mobile-layout:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Mobile-specific touch optimizations */
        .mobile-layout button,
        .mobile-layout a {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }

        /* Mobile-specific scroll optimizations */
        .mobile-layout {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      `}</style>
    </div>
  );
};

export default MobileLayout;