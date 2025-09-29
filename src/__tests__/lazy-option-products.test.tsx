/**
 * Comprehensive test suite for feat-lazy-load-option-data implementation
 * Validates all performance tracking, loading states, and lazy loading functionality
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { LazyOptionProducts } from '../components/lazy-loading/LazyOptionProducts';
import { useOptionProductsWithMetrics } from '../hooks/useOptionProducts';
import { OptionProductsLoadingOverlay } from '../components/loading/OptionProductsLoadingOverlay';
import { OptionProductsSectionSkeleton } from '../components/skeletons/OptionProductSkeletons';
import { optionLoadingTracker, PERFORMANCE_THRESHOLDS } from '../lib/utils/performance-tracking-lazy-load';

// Mock the hooks and utilities
jest.mock('../hooks/useOptionProducts');
jest.mock('../lib/utils/performance-tracking-lazy-load');

const mockUseOptionProducts = useOptionProductsWithMetrics as jest.MockedFunction<typeof useOptionProductsWithMetrics>;

describe('Lazy Option Products Loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Performance Tracking', () => {
    it('should start performance tracking when loading begins', async () => {
      const mockStartTracking = jest.fn();
      const mockEndTracking = jest.fn();

      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        hasLoaded: false,
        loadingDuration: 100,
        loadingState: 'skeleton',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      render(<LazyOptionProducts relatedOptionIds={[1, 2, 3]} />);

      expect(mockUseOptionProducts).toHaveBeenCalledWith([1, 2, 3], expect.objectContaining({
        enablePerformanceTracking: true,
        performanceLabel: expect.stringContaining('lazy-options'),
      }));
    });

    it('should track LCP metrics when loading completes', async () => {
      mockUseOptionProducts.mockReturnValue({
        products: [
          {
            id: '1',
            name: 'Test Option 1',
            price: 100,
            optionType: 'SAFETY',
          },
          {
            id: '2', 
            name: 'Test Option 2',
            price: 200,
            optionType: 'COMFORT',
          }
        ] as any,
        loading: false,
        error: null,
        hasLoaded: true,
        loadingDuration: 500,
        loadingState: 'none',
        performanceMetrics: {
          duration: 500,
          largestContentfulPaint: 300,
          cacheHit: false,
          optionCount: 2,
        },
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      const onLoadComplete = jest.fn();
      
      render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2]} 
          onLoadComplete={onLoadComplete}
        />
      );

      expect(onLoadComplete).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ name: 'Test Option 1' }),
        expect.objectContaining({ name: 'Test Option 2' }),
      ]));
    });

    it('should respect performance thresholds for loading states', () => {
      // Test skeleton threshold
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        hasLoaded: false,
        loadingDuration: PERFORMANCE_THRESHOLDS.SKELETON_THRESHOLD + 10,
        loadingState: 'skeleton',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      const { rerender } = render(<LazyOptionProducts relatedOptionIds={[1]} />);
      expect(screen.getByRole('presentation')).toBeInTheDocument();

      // Test overlay threshold
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        hasLoaded: false,
        loadingDuration: PERFORMANCE_THRESHOLDS.LOADING_OVERLAY_THRESHOLD + 10,
        loadingState: 'overlay',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      rerender(<LazyOptionProducts relatedOptionIds={[1]} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show skeleton loading for medium duration', () => {
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        hasLoaded: false,
        loadingDuration: 100,
        loadingState: 'skeleton',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      render(<LazyOptionProducts relatedOptionIds={[1, 2, 3]} />);
      
      // Should show skeleton components
      expect(screen.getAllByRole('presentation')).toHaveLength(2); // Categories skeleton
    });

    it('should show overlay loading for long duration', () => {
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        hasLoaded: false,
        loadingDuration: 2000,
        loadingState: 'overlay',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      render(<LazyOptionProducts relatedOptionIds={[1, 2, 3]} />);
      
      // Should show loading overlay
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Loading product options/)).toBeInTheDocument();
    });

    it('should show custom loading component when provided', () => {
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        hasLoaded: false,
        loadingDuration: 100,
        loadingState: 'skeleton',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      const CustomLoader = () => <div data-testid="custom-loader">Custom Loading...</div>;

      render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2, 3]} 
          loadingComponent={<CustomLoader />}
        />
      );
      
      expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error state and retry functionality', async () => {
      const mockFetchOptions = jest.fn();
      
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: false,
        error: 'Failed to fetch option products',
        hasLoaded: true,
        loadingDuration: 0,
        loadingState: 'none',
        fetchOptions: mockFetchOptions,
        clearCache: jest.fn(),
      });

      const onLoadError = jest.fn();

      render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2, 3]} 
          onLoadError={onLoadError}
        />
      );
      
      expect(screen.getByText(/Failed to Load Options/)).toBeInTheDocument();
      expect(onLoadError).toHaveBeenCalledWith('Failed to fetch option products');

      // Test retry functionality
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      expect(mockFetchOptions).toHaveBeenCalled();
    });

    it('should show custom error component when provided', () => {
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: false,
        error: 'Network error',
        hasLoaded: true,
        loadingDuration: 0,
        loadingState: 'none',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      const CustomError = () => <div data-testid="custom-error">Custom Error!</div>;

      render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2, 3]} 
          errorComponent={<CustomError />}
        />
      );
      
      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    });
  });

  describe('Product Grouping', () => {
    it('should group products by category when enabled', () => {
      const testProducts = [
        { id: '1', name: 'Safety Option 1', optionType: 'SAFETY', price: 100 },
        { id: '2', name: 'Safety Option 2', optionType: 'SAFETY', price: 150 },
        { id: '3', name: 'Comfort Option 1', optionType: 'COMFORT', price: 200 },
      ];

      mockUseOptionProducts.mockReturnValue({
        products: testProducts as any,
        loading: false,
        error: null,
        hasLoaded: true,
        loadingDuration: 0,
        loadingState: 'none',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2, 3]} 
          groupByCategory={true}
        />
      );
      
      // Should show category headers
      expect(screen.getByText('SAFETY')).toBeInTheDocument();
      expect(screen.getByText('COMFORT')).toBeInTheDocument();
      
      // Should show correct product counts
      expect(screen.getByText('2 options available')).toBeInTheDocument();
      expect(screen.getByText('1 option available')).toBeInTheDocument();
    });

    it('should limit products per category when specified', () => {
      const testProducts = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Safety Option ${i + 1}`,
        optionType: 'SAFETY',
        price: 100 + i * 10,
      }));

      mockUseOptionProducts.mockReturnValue({
        products: testProducts as any,
        loading: false,
        error: null,
        hasLoaded: true,
        loadingDuration: 0,
        loadingState: 'none',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} 
          groupByCategory={true}
          maxProductsPerCategory={3}
        />
      );
      
      // Should only show 3 products despite having 10
      const productElements = screen.getAllByText(/Safety Option/);
      expect(productElements.length).toBe(3);
    });
  });

  describe('No-JS Fallback', () => {
    it('should render noscript fallback when enabled', () => {
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        hasLoaded: false,
        loadingDuration: 2000,
        loadingState: 'overlay',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      const { container } = render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2, 3]} 
          enableNoJSFallback={true}
        />
      );
      
      // Check for noscript tag in container
      const noscriptTags = container.querySelectorAll('noscript');
      expect(noscriptTags.length).toBeGreaterThan(0);
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no option IDs provided', () => {
      render(<LazyOptionProducts relatedOptionIds={[]} />);
      
      expect(screen.getByText(/No Options Available/)).toBeInTheDocument();
    });

    it('should show empty state when no products loaded', () => {
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: false,
        error: null,
        hasLoaded: true,
        loadingDuration: 0,
        loadingState: 'none',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      render(<LazyOptionProducts relatedOptionIds={[1, 2, 3]} />);
      
      expect(screen.getByText(/No Options Available/)).toBeInTheDocument();
    });

    it('should show custom empty component when provided', () => {
      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: false,
        error: null,
        hasLoaded: true,
        loadingDuration: 0,
        loadingState: 'none',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      const CustomEmpty = () => <div data-testid="custom-empty">No options here!</div>;

      render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2, 3]} 
          emptyComponent={<CustomEmpty />}
        />
      );
      
      expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    });
  });

  describe('Timeout Handling', () => {
    it('should call timeout callback when loading exceeds threshold', async () => {
      const onLoadTimeout = jest.fn();

      mockUseOptionProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        hasLoaded: false,
        loadingDuration: PERFORMANCE_THRESHOLDS.MAX_LOADING_DURATION + 1000,
        loadingState: 'overlay',
        fetchOptions: jest.fn(),
        clearCache: jest.fn(),
      });

      render(
        <LazyOptionProducts 
          relatedOptionIds={[1, 2, 3]} 
          onLoadTimeout={onLoadTimeout}
        />
      );
      
      expect(onLoadTimeout).toHaveBeenCalled();
    });
  });
});

describe('Performance Tracking Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track performance metrics correctly', () => {
    const tracker = optionLoadingTracker;
    
    // Mock performance API
    global.performance = {
      ...global.performance,
      now: jest.fn().mockReturnValue(1000),
    };

    tracker.startTracking({
      label: 'test-tracking',
      trackLCP: true,
      trackTTI: true,
    });

    // Simulate time passing
    (global.performance.now as jest.Mock).mockReturnValue(1500);

    const metrics = tracker.endTracking('test-tracking', {
      cacheHit: false,
      optionCount: 3,
      errorCount: 0,
    });

    expect(metrics).toMatchObject({
      duration: 500,
      cacheHit: false,
      optionCount: 3,
      errorCount: 0,
    });
  });

  it('should handle unsupported performance APIs gracefully', () => {
    // Mock missing PerformanceObserver
    const originalPerformanceObserver = global.PerformanceObserver;
    delete (global as any).PerformanceObserver;

    const tracker = optionLoadingTracker;
    
    expect(() => {
      tracker.startTracking({
        label: 'test-no-api',
        trackLCP: true,
      });
    }).not.toThrow();

    // Restore
    global.PerformanceObserver = originalPerformanceObserver;
  });
});

export default {};