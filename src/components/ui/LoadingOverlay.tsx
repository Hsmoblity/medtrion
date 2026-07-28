"use client";

import React, { useEffect } from 'react';

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  show: boolean;
  /** Variant of the loading overlay */
  variant?: 'overlay' | 'skeleton' | 'inline';
  /** Loading message to display */
  message?: string;
  /** Custom className for styling */
  className?: string;
  /** Whether to block interaction (for overlay variant) */
  blocking?: boolean;
  /** Size of the skeleton items (for skeleton variant) */
  skeletonCount?: number;
  /** Custom spinner component */
  spinner?: React.ReactNode;
  /** Accessibility label */
  ariaLabel?: string;
  /** Whether to respect reduced motion preferences */
  respectReducedMotion?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  variant = 'overlay',
  message = 'Loading...',
  className = '',
  blocking = true,
  skeletonCount = 3,
  spinner,
  ariaLabel,
  respectReducedMotion = true,
}) => {
  // Handle reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    if (respectReducedMotion && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [respectReducedMotion]);

  // Default spinner component
  const DefaultSpinner = () => (
    <svg
      className={`animate-spin h-8 w-8 text-brand-primary ${prefersReducedMotion ? 'animate-none' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
  );

  // Skeleton item component
  const SkeletonItem = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-4 w-full mb-2"></div>
      <div className="bg-gray-200 rounded-lg h-3 w-3/4 mb-2"></div>
      <div className="bg-gray-200 rounded-lg h-3 w-1/2"></div>
    </div>
  );

  // Skeleton shimmer effect (only if motion is not reduced)
  const shimmerClass = prefersReducedMotion ? '' : 'animate-pulse';

  if (!show) return null;

  // Overlay variant - full screen blocking overlay
  if (variant === 'overlay') {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm ${className}`}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel || message}
        aria-busy="true"
      >
        <div className="flex flex-col items-center space-y-4">
          {spinner || <DefaultSpinner />}
          {message && (
            <p className="text-gray-700 text-lg font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Skeleton variant - placeholder content
  if (variant === 'skeleton') {
    return (
      <div
        className={`space-y-4 ${className}`}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel || 'Loading content'}
        aria-busy="true"
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div key={index} className={`${shimmerClass}`}>
            <div className="bg-gray-200 rounded-lg h-32 w-full mb-4"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 rounded-lg h-4 w-3/4"></div>
              <div className="bg-gray-200 rounded-lg h-3 w-1/2"></div>
              <div className="bg-gray-200 rounded-lg h-3 w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Inline variant - compact loading indicator
  if (variant === 'inline') {
    return (
      <div
        className={`flex items-center space-x-2 ${className}`}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel || message}
        aria-busy="true"
      >
        {spinner || <DefaultSpinner />}
        {message && (
          <span className="text-gray-600 text-sm">
            {message}
          </span>
        )}
      </div>
    );
  }

  return null;
};

export default LoadingOverlay;