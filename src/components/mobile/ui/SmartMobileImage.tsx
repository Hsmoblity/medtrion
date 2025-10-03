import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { useSmartMobileUI } from '../hooks/useSmartMobileUI';

interface SmartMobileImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  fallback?: string;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager' | 'smart';
  onLoad?: () => void;
  onError?: () => void;
  smartFeatures?: {
    adaptiveQuality?: boolean;
    predictiveLoading?: boolean;
    contextualOptimization?: boolean;
    gestureSupport?: boolean;
    accessibilityEnhancement?: boolean;
    performanceOptimization?: boolean;
  };
  context?: {
    viewportPosition?: 'above' | 'visible' | 'below';
    userActivity?: 'scrolling' | 'browsing' | 'interacting';
    networkCondition?: 'fast' | 'slow' | 'offline';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

/**
 * Smart mobile-optimized image component
 * Provides intelligent loading, quality adaptation, and contextual optimization
 */
const SmartMobileImage: React.FC<SmartMobileImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder,
  fallback,
  sizes,
  quality = 80,
  loading = 'smart',
  onLoad,
  onError,
  smartFeatures = {
    adaptiveQuality: true,
    predictiveLoading: true,
    contextualOptimization: true,
    gestureSupport: true,
    accessibilityEnhancement: true,
    performanceOptimization: true,
  },
  context,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState(0);
  const [loadDuration, setLoadDuration] = useState(0);
  const [imageQuality, setImageQuality] = useState(quality);
  const [showZoom, setShowZoom] = useState(false);
  const [gestureState, setGestureState] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
    isGesturing: false,
  });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
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
    createSmartGestureHandler,
    analyzeInteractionPatterns 
  } = useSmartMobileUI();

  // Smart quality calculation
  const calculateSmartQuality = useCallback(() => {
    let smartQuality = quality;

    if (smartFeatures.adaptiveQuality) {
      // Device-based quality
      if (isLowEndDevice) {
        smartQuality = Math.min(quality, 60);
      }

      // Connection-based quality
      if (connectionType === 'slow-2g' || connectionType === '2g') {
        smartQuality = Math.min(quality, 50);
      } else if (connectionType === '3g') {
        smartQuality = Math.min(quality, 70);
      }

      // Context-based quality
      if (context?.networkCondition === 'slow') {
        smartQuality = Math.min(quality, 60);
      }

      // Performance-based quality
      if (uiAdaptations.imageQuality === 'low') {
        smartQuality = Math.min(quality, 50);
      } else if (uiAdaptations.imageQuality === 'medium') {
        smartQuality = Math.min(quality, 70);
      }

      // Time-based quality (lower quality at night for battery saving)
      if (context?.timeOfDay === 'night') {
        smartQuality = Math.min(quality, 70);
      }
    }

    setImageQuality(smartQuality);
    return smartQuality;
  }, [
    quality, 
    smartFeatures.adaptiveQuality, 
    isLowEndDevice, 
    connectionType, 
    context, 
    uiAdaptations.imageQuality
  ]);

  // Smart loading strategy
  const getSmartLoadingStrategy = useCallback(() => {
    if (loading !== 'smart') return loading;

    // Predictive loading based on user behavior
    if (smartFeatures.predictiveLoading) {
      // Load eagerly if user is actively scrolling
      if (context?.userActivity === 'scrolling') {
        return 'eager';
      }

      // Load eagerly if image is above viewport
      if (context?.viewportPosition === 'above') {
        return 'eager';
      }

      // Load lazily if user is browsing slowly
      if (context?.userActivity === 'browsing') {
        return 'lazy';
      }
    }

    // Default smart loading
    return priority ? 'eager' : 'lazy';
  }, [loading, smartFeatures.predictiveLoading, context, priority]);

  // Optimize image source with smart features
  const getSmartOptimizedSrc = useCallback(() => {
    if (imageError && fallback) {
      return fallback;
    }

    const smartQuality = calculateSmartQuality();
    const params = new URLSearchParams();
    
    // Smart sizing based on viewport and device
    const smartWidth = width ? Math.min(width, viewportWidth) : viewportWidth;
    const smartHeight = height ? Math.min(height, viewportHeight * 0.6) : height;
    
    if (smartWidth) params.append('w', smartWidth.toString());
    if (smartHeight) params.append('h', smartHeight.toString());
    
    // Smart quality
    params.append('q', smartQuality.toString());
    
    // Smart format based on browser support and connection
    const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    const supportsAVIF = document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;
    
    if (supportsAVIF && connectionType !== 'slow-2g') {
      params.append('f', 'avif');
    } else if (supportsWebP) {
      params.append('f', 'webp');
    }
    
    // Smart compression
    if (smartFeatures.performanceOptimization) {
      params.append('compress', 'true');
    }
    
    return `${src}?${params.toString()}`;
  }, [
    imageError, 
    fallback, 
    calculateSmartQuality, 
    width, 
    height, 
    viewportWidth, 
    viewportHeight, 
    connectionType, 
    smartFeatures.performanceOptimization
  ]);

  // Smart intersection observer
  const setupSmartObserver = useCallback(() => {
    if (!containerRef.current || getSmartLoadingStrategy() === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: smartFeatures.predictiveLoading ? '100px' : '50px',
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [getSmartLoadingStrategy, smartFeatures.predictiveLoading]);

  // Handle image load with smart tracking
  const handleLoad = useCallback(() => {
    const loadTime = Date.now() - loadStartTime;
    setLoadDuration(loadTime);
    setImageLoaded(true);
    setIsLoading(false);

    // Analyze loading performance
    analyzeInteractionPatterns({
      type: 'image_load',
      duration: loadTime,
      quality: imageQuality,
      size: `${width}x${height}`,
    });

    if (onLoad) {
      onLoad();
    }
  }, [loadStartTime, imageQuality, width, height, analyzeInteractionPatterns, onLoad]);

  // Handle image error with smart fallback
  const handleError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);

    // Analyze error patterns
    analyzeInteractionPatterns({
      type: 'image_error',
      src: src,
      quality: imageQuality,
    });

    if (onError) {
      onError();
    }
  }, [src, imageQuality, analyzeInteractionPatterns, onError]);

  // Smart gesture handling for zoom and pan
  const setupSmartGestures = useCallback(() => {
    if (!imgRef.current || !smartFeatures.gestureSupport) return;

    const cleanup = createSmartGestureHandler(imgRef.current, {
      onSwipe: (gesture: any) => {
        if (gesture.direction === 'left' || gesture.direction === 'right') {
          // Handle horizontal swipe for image navigation
          console.log(`Swipe ${gesture.direction} detected`);
        }
      }
    });

    // Pinch to zoom gesture
    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialScale = gestureState.scale;
        setGestureState(prev => ({ ...prev, isGesturing: true }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const scale = Math.max(1, Math.min(3, initialScale * (currentDistance / initialDistance)));
        setGestureState(prev => ({ ...prev, scale }));
      }
    };

    const handleTouchEnd = () => {
      setGestureState(prev => ({ ...prev, isGesturing: false }));
    };

    const img = imgRef.current;
    img.addEventListener('touchstart', handleTouchStart);
    img.addEventListener('touchmove', handleTouchMove);
    img.addEventListener('touchend', handleTouchEnd);

    return () => {
      cleanup?.();
      img.removeEventListener('touchstart', handleTouchStart);
      img.removeEventListener('touchmove', handleTouchMove);
      img.removeEventListener('touchend', handleTouchEnd);
    };
  }, [smartFeatures.gestureSupport, createSmartGestureHandler, gestureState.scale]);

  // Initialize smart features
  useEffect(() => {
    calculateSmartQuality();
    setupSmartObserver();
  }, [calculateSmartQuality, setupSmartObserver]);

  // Setup gestures when image loads
  useEffect(() => {
    if (imageLoaded) {
      const cleanup = setupSmartGestures();
      return cleanup;
    }
  }, [imageLoaded, setupSmartGestures]);

  // Start loading when in view
  useEffect(() => {
    if (isInView && !imageLoaded && !imageError) {
      setIsLoading(true);
      setLoadStartTime(Date.now());
    }
  }, [isInView, imageLoaded, imageError]);

  // Smart image styles
  const getSmartImageStyles = (): React.CSSProperties => {
    const baseStyles = {
      maxWidth: '100%',
      height: 'auto',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      opacity: imageLoaded ? 1 : 0,
      transform: `scale(${gestureState.scale}) translate(${gestureState.translateX}px, ${gestureState.translateY}px)`,
    };

    // Smart rendering optimizations
    const optimizationStyles = {
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      willChange: gestureState.isGesturing ? 'transform' : 'auto',
    };

    // Smart aspect ratio
    const aspectRatioStyles = width && height ? {
      aspectRatio: `${width} / ${height}`,
    } : {};

    return {
      ...baseStyles,
      ...optimizationStyles,
      ...aspectRatioStyles,
    } as React.CSSProperties;
  };

  // Smart placeholder styles
  const getSmartPlaceholderStyles = () => {
    return {
      width: width || '100%',
      height: height || '200px',
      backgroundColor: context?.timeOfDay === 'night' ? '#374151' : '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      color: context?.timeOfDay === 'night' ? '#d1d5db' : '#9ca3af',
      fontSize: isMobile ? '14px' : '16px',
      transition: 'all 0.3s ease',
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`smart-mobile-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        backgroundColor: context?.timeOfDay === 'night' ? '#1f2937' : '#ffffff',
      }}
    >
      {/* Smart placeholder */}
      {!imageLoaded && !imageError && (
        <div 
          style={getSmartPlaceholderStyles()}
          aria-label="Loading image"
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: smartUIState.userPreferences.reducedMotion ? 'none' : 'spin 1s linear infinite',
                }}
              />
              <span>{placeholder || 'Loading...'}</span>
            </div>
          ) : (
            placeholder || 'Loading...'
          )}
        </div>
      )}

      {/* Smart error placeholder */}
      {imageError && (
        <div 
          style={{
            ...getSmartPlaceholderStyles(),
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          }}
          aria-label="Image failed to load"
        >
          {fallback || 'Image unavailable'}
        </div>
      )}

      {/* Smart optimized image */}
      {isInView && (
        <img
          ref={imgRef}
          src={getSmartOptimizedSrc()}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={getSmartLoadingStrategy()}
          style={getSmartImageStyles()}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          draggable={false}
          data-smart-quality={imageQuality}
          data-load-duration={loadDuration}
        />
      )}

      {/* Smart zoom indicator */}
      {smartFeatures.gestureSupport && imageLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            opacity: gestureState.scale > 1 ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        >
          {Math.round(gestureState.scale * 100)}%
        </div>
      )}

      {/* Smart loading progress */}
      {isLoading && smartFeatures.performanceOptimization && (
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '2px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '0 0 12px 12px',
              animation: 'loading-progress 2s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Smart mobile styles */}
      <style jsx>{`
        .smart-mobile-image-container {
          /* Smart mobile optimizations */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .smart-mobile-image-container img {
          /* Smart image rendering */
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          backface-visibility: hidden;
          will-change: auto;
        }

        .smart-mobile-image-container img:active {
          will-change: transform;
        }

        /* Smart loading animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes loading-progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }

        /* Smart responsive adjustments */
        @media (max-width: 767px) {
          .smart-mobile-image-container {
            border-radius: 8px;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .smart-mobile-image-container {
            border-radius: 10px;
          }
        }

        @media (min-width: 1024px) {
          .smart-mobile-image-container {
            border-radius: 12px;
          }
        }

        /* Smart accessibility */
        .smart-mobile-image-container:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Smart performance optimizations */
        .smart-mobile-image-container img {
          /* Optimize for mobile performance */
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        /* Smart gesture feedback */
        .smart-mobile-image-container img:active {
          cursor: grab;
        }

        .smart-mobile-image-container img:active:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default SmartMobileImage;