import React, { useState, useRef, useEffect } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { useMobilePerformance as useMobilePerf } from '../hooks/useMobilePerformance';

interface MobileImageProps {
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
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Mobile-optimized image component
 * Provides mobile-specific image optimization and loading strategies
 */
const MobileImage: React.FC<MobileImageProps> = ({
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
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const { isMobile, isLowEndDevice, connectionType, getMobileOptimizations } = useMobileOptimization();
  const { optimizeImage, optimizeLazyLoading } = useMobilePerf();
  const optimizations = getMobileOptimizations();

  // Optimize image source based on device and connection
  const getOptimizedSrc = () => {
    if (imageError && fallback) {
      return fallback;
    }

    // Use mobile performance optimization
    const optimizedSrc = optimizeImage(src, width, height);
    
    // Add quality based on device capabilities
    const finalQuality = isLowEndDevice ? Math.min(quality, 60) : quality;
    
    // Add format based on connection type
    const format = connectionType === 'slow-2g' || connectionType === '2g' ? 'webp' : 'auto';
    
    return optimizedSrc;
  };

  // Handle image load
  const handleLoad = () => {
    setImageLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  // Handle image error
  const handleError = () => {
    setImageError(true);
    if (onError) {
      onError();
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

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
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority, loading]);

  // Mobile-specific image styles
  const getImageStyles = (): React.CSSProperties => {
    const baseStyles = {
      maxWidth: '100%',
      height: 'auto',
      transition: 'opacity 0.3s ease',
      opacity: imageLoaded ? 1 : 0,
    };

    // Mobile-specific optimizations
    const mobileStyles = {
      // Optimize for mobile rendering
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      
      // Prevent layout shifts
      aspectRatio: width && height ? `${width} / ${height}` : 'auto',
      
      // Mobile-specific loading
      loading: optimizations.enableLazyLoading ? 'lazy' : 'eager',
    };

    return {
      ...baseStyles,
      ...mobileStyles,
    } as React.CSSProperties;
  };

  // Placeholder styles
  const getPlaceholderStyles = () => {
    return {
      width: width || '100%',
      height: height || '200px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      color: '#9ca3af',
      fontSize: isMobile ? '14px' : '16px',
    };
  };

  return (
    <div 
      className={`mobile-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      {/* Placeholder */}
      {!imageLoaded && !imageError && (
        <div 
          style={getPlaceholderStyles()}
          aria-label="Loading image"
        >
          {placeholder || 'Loading...'}
        </div>
      )}

      {/* Error placeholder */}
      {imageError && (
        <div 
          style={getPlaceholderStyles()}
          aria-label="Image failed to load"
        >
          {fallback || 'Image unavailable'}
        </div>
      )}

      {/* Optimized Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={getOptimizedSrc()}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          style={getImageStyles()}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-image-container {
          /* Mobile-specific image optimizations */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .mobile-image-container img {
          /* Mobile-specific image rendering */
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          backface-visibility: hidden;
          will-change: opacity;
        }

        /* Mobile-specific loading states */
        .mobile-image-container img[loading="lazy"] {
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .mobile-image-container img[loading="lazy"].loaded {
          opacity: 1;
        }

        /* Mobile-specific responsive adjustments */
        @media (max-width: 767px) {
          .mobile-image-container {
            border-radius: 6px;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .mobile-image-container {
            border-radius: 8px;
          }
        }

        @media (min-width: 1024px) {
          .mobile-image-container {
            border-radius: 12px;
          }
        }

        /* Mobile-specific accessibility */
        .mobile-image-container:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Mobile-specific performance optimizations */
        .mobile-image-container img {
          /* Optimize for mobile performance */
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        /* Mobile-specific error states */
        .mobile-image-container .error-placeholder {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        /* Mobile-specific loading states */
        .mobile-image-container .loading-placeholder {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default MobileImage;