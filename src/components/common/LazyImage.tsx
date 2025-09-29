import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { normalizeImageUrl } from '../../lib/utils/image';

interface LazyImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: 'shimmer' | 'lqip' | 'none';
  placeholderSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'shimmer',
  placeholderSrc = '/placeholder.svg',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  priority = false,
  sizes,
  quality = 75
}) => {
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(priority);
  const [showFallback, setShowFallback] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Normalize the image source
  const normalizedSrc = normalizeImageUrl(src);
  const normalizedPlaceholderSrc = normalizeImageUrl(placeholderSrc);

  // Intersection Observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setShouldLoad(true);
      setIsLoading(true);
      // Disconnect observer once image is in view
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    }
  }, []);

  // Set up Intersection Observer
  useEffect(() => {
    if (priority || shouldLoad) return;

    const node = containerRef.current;
    if (!node) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observerRef.current.observe(node);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin, priority, shouldLoad]);

  // Reset when src changes
  useEffect(() => {
    setHasError(false);
    setShowFallback(false);
    setIsLoaded(false);
    if (shouldLoad || priority) {
      setIsLoading(true);
    }
  }, [normalizedSrc, shouldLoad, priority]);

  // Handle image load completion and error
  const handleLoadingComplete = () => {
    if (!shouldLoad) {
      return;
    }
    setIsLoaded(true);
    setIsLoading(false);
    if (!showFallback) {
      onLoad?.();
    }
  };

  const handleImageError = () => {
    if (showFallback) {
      setIsLoading(false);
      setIsLoaded(true);
      return;
    }
    setShowFallback(true);
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const useFillLayout = !width || !height;
  const baseClass = className ? className : '';
  const imageClasses = `transition-opacity duration-500 ${baseClass} ${isLoaded ? 'opacity-100' : 'opacity-0'}`.trim();
  const wrapperClasses = `relative inline-block overflow-hidden ${useFillLayout ? baseClass : ''}`.trim();

  const finalSrc = (showFallback ? normalizedPlaceholderSrc : normalizedSrc) || normalizedPlaceholderSrc;
  const imageSource = shouldLoad ? finalSrc : normalizedPlaceholderSrc;
  const blurDataURL = placeholder === 'lqip' ? normalizedPlaceholderSrc : undefined;
  const showShimmer = placeholder === 'shimmer' && (!isLoaded || isLoading);

  // Render placeholder based on type
  const renderPlaceholder = () => {
    if (placeholder === 'none') return null;

    if (placeholder === 'lqip' && placeholderSrc) {
      return (
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${baseClass} ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `url(${normalizedPlaceholderSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          aria-hidden="true"
        />
      );
    }

    // Shimmer effect
    return (
      <div
        className={`pointer-events-none absolute inset-0 ${baseClass} ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <div className="h-full w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={wrapperClasses}>
      {/* Placeholder (always rendered for layout stability) */}
      {(!isLoaded || showShimmer || !shouldLoad) && renderPlaceholder()}

      {/* Actual image */}
      <Image
        src={imageSource || '/placeholder.svg'}
        alt={alt}
        width={useFillLayout ? undefined : width}
        height={useFillLayout ? undefined : height}
        fill={useFillLayout}
        sizes={sizes || (useFillLayout ? '100vw' : undefined)}
        className={imageClasses}
        onLoadingComplete={handleLoadingComplete}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        quality={quality}
        placeholder={blurDataURL ? 'blur' : undefined}
        blurDataURL={blurDataURL}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error indicator */}
      {hasError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
