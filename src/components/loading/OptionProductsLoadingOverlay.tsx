/**
 * Enhanced loading overlay component for option products lazy loading
 * Provides comprehensive loading states with fallback handling
 */

import React, { useEffect, useState } from 'react';
import { PERFORMANCE_THRESHOLDS } from '../../lib/utils/performance-tracking-lazy-load';

interface LoadingOverlayProps {
  isVisible: boolean;
  duration?: number;
  optionCount?: number;
  className?: string;
  onTimeout?: () => void;
  fallbackComponent?: React.ReactNode;
  enableNoJSFallback?: boolean;
}

/**
 * Loading spinner component with customizable size and color
 */
const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}> = ({ 
  size = 'md', 
  color = 'text-brand-primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`inline-block ${className}`}>
      <svg 
        className={`animate-spin ${sizeClasses[size]} ${color}`}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        role="img"
        aria-label="Loading"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

/**
 * Progress indicator for longer loading operations
 */
const LoadingProgress: React.FC<{
  duration: number;
  maxDuration?: number;
  className?: string;
}> = ({ 
  duration, 
  maxDuration = PERFORMANCE_THRESHOLDS.MAX_LOADING_DURATION,
  className = '' 
}) => {
  const progress = Math.min((duration / maxDuration) * 100, 100);
  
  return (
    <div className={`w-full max-w-xs ${className}`}>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Loading options...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-brand-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

/**
 * Loading message component with dynamic content based on duration
 */
const LoadingMessage: React.FC<{
  duration: number;
  optionCount?: number;
}> = ({ duration, optionCount }) => {
  const getMessage = () => {
    if (duration < 500) {
      return 'Loading product options...';
    } else if (duration < 2000) {
      return optionCount 
        ? `Loading ${optionCount} product options...`
        : 'Fetching available options...';
    } else if (duration < 5000) {
      return 'This is taking longer than expected...';
    } else {
      return 'Still loading... Please check your connection.';
    }
  };

  const getSubMessage = () => {
    if (duration > 2000) {
      return 'Thank you for your patience';
    }
    return null;
  };

  return (
    <div className="text-center space-y-2">
      <p className="text-gray-700 font-medium">
        {getMessage()}
      </p>
      {getSubMessage() && (
        <p className="text-sm text-gray-500">
          {getSubMessage()}
        </p>
      )}
    </div>
  );
};

/**
 * No-JS fallback component for when JavaScript is disabled
 */
const NoJSFallback: React.FC = () => (
  <noscript>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
      <div className="text-yellow-800">
        <h3 className="font-semibold mb-2">JavaScript Required</h3>
        <p className="text-sm">
          Product options require JavaScript to load dynamically. 
          Please enable JavaScript in your browser to view available options.
        </p>
        <p className="text-xs mt-2 text-yellow-600">
          Alternative: Contact us directly for product customization options.
        </p>
      </div>
    </div>
  </noscript>
);

/**
 * Main loading overlay component
 */
export const OptionProductsLoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  duration = 0,
  optionCount,
  className = '',
  onTimeout,
  fallbackComponent,
  enableNoJSFallback = true,
}) => {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Update duration in real-time
  useEffect(() => {
    if (!isVisible) {
      setCurrentDuration(0);
      setHasTimedOut(false);
      return;
    }

    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setCurrentDuration(elapsed);

      // Check for timeout
      if (elapsed > PERFORMANCE_THRESHOLDS.MAX_LOADING_DURATION && !hasTimedOut) {
        setHasTimedOut(true);
        onTimeout?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, hasTimedOut, onTimeout]);

  if (!isVisible) {
    return enableNoJSFallback ? <NoJSFallback /> : null;
  }

  // Show fallback component if timed out
  if (hasTimedOut && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  const showProgress = currentDuration > PERFORMANCE_THRESHOLDS.LOADING_OVERLAY_THRESHOLD;
  const isSlowLoading = currentDuration > PERFORMANCE_THRESHOLDS.SLOW_LOADING_THRESHOLD;

  return (
    <div 
      className={`
        fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
        transition-opacity duration-300 ease-in-out
        ${className}
      `}
      role="dialog"
      aria-modal="true"
      aria-label="Loading product options"
    >
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Loading spinner */}
          <LoadingSpinner 
            size={isSlowLoading ? 'lg' : 'md'}
            color={isSlowLoading ? 'text-yellow-600' : 'text-brand-primary'}
          />
          
          {/* Loading message */}
          <LoadingMessage 
            duration={currentDuration} 
            optionCount={optionCount}
          />
          
          {/* Progress bar for longer operations */}
          {showProgress && (
            <LoadingProgress duration={currentDuration} />
          )}
          
          {/* Timeout warning */}
          {hasTimedOut && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                Loading has timed out. Please refresh the page or try again.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* No-JS fallback */}
      {enableNoJSFallback && <NoJSFallback />}
    </div>
  );
};

/**
 * Inline loading component for smaller loading states
 */
export const InlineOptionLoading: React.FC<{
  isVisible: boolean;
  duration?: number;
  size?: 'sm' | 'md';
  className?: string;
}> = ({
  isVisible,
  duration = 0,
  size = 'sm',
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div className={`flex items-center space-x-3 py-4 ${className}`}>
      <LoadingSpinner size={size} />
      <div className="text-gray-600">
        {duration < 1000 ? 'Loading options...' : 'Still loading...'}
      </div>
    </div>
  );
};

/**
 * Loading state manager hook for option products
 */
export function useOptionLoadingState(isLoading: boolean, startTime?: number) {
  const [duration, setDuration] = useState(0);
  const [loadingState, setLoadingState] = useState<'none' | 'skeleton' | 'inline' | 'overlay'>('none');

  useEffect(() => {
    if (!isLoading) {
      setDuration(0);
      setLoadingState('none');
      return;
    }

    const start = startTime || Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setDuration(elapsed);

      // Determine loading state based on duration
      if (elapsed < PERFORMANCE_THRESHOLDS.SKELETON_THRESHOLD) {
        setLoadingState('none');
      } else if (elapsed < PERFORMANCE_THRESHOLDS.LOADING_OVERLAY_THRESHOLD) {
        setLoadingState('skeleton');
      } else if (elapsed < 2000) {
        setLoadingState('inline');
      } else {
        setLoadingState('overlay');
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isLoading, startTime]);

  return { duration, loadingState };
}

export default OptionProductsLoadingOverlay;