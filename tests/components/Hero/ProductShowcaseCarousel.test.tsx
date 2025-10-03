/**
 * Tests for ProductShowcaseCarousel Component
 * Rule R14: Test Requirement - Any artifact >200 lines must include or update tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductShowcaseCarousel } from '../../../src/components/Hero/ProductShowcaseCarousel';
import { ProductSchema } from '../../../src/lib/interfaces';

// Mock the homepage store
jest.mock('../../../src/lib/stores/homepageStore', () => ({
  useHomepageStore: jest.fn()
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('ProductShowcaseCarousel', () => {
  const mockProducts = ['product-1', 'product-2', 'product-3'];
  const mockOnSlideChange = jest.fn();

  const mockFeaturedProducts: ProductSchema[] = [
    {
      slug: 'acorn-stairlifts-acorn-180-curved-stairlift',
      name: 'Acorn Curved Stairlifts',
      shortDescription: 'A comfortable and reliable ride designed for any curved staircases',
      description: 'Full description',
      featuredImage: {
        sourceUrl: '/180-stairlift-moving.png',
        altText: 'Acorn Curved Stairlift'
      },
      price: 3495,
      databaseId: 1
    },
    {
      slug: 'acorn-stairlifts-acorn-130-straight-stairlift',
      name: 'Acorn Straight Stairlifts',
      shortDescription: 'The ultimate staircase solution',
      description: 'Full description',
      featuredImage: {
        sourceUrl: '/130-stairlift-hinge.jpg',
        altText: 'Acorn Straight Stairlift'
      },
      price: 2995,
      databaseId: 2
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when products are loading', () => {
    const { useHomepageStore } = require('../../../src/lib/stores/homepageStore');
    useHomepageStore.mockReturnValue({
      featuredProducts: [],
      loading: true,
      error: null
    });

    render(
      <ProductShowcaseCarousel
        products={mockProducts}
        currentSlide={0}
        onSlideChange={mockOnSlideChange}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders real products when available', () => {
    const { useHomepageStore } = require('../../../src/lib/stores/homepageStore');
    useHomepageStore.mockReturnValue({
      featuredProducts: mockFeaturedProducts,
      loading: false,
      error: null
    });

    render(
      <ProductShowcaseCarousel
        products={mockProducts}
        currentSlide={0}
        onSlideChange={mockOnSlideChange}
      />
    );

    expect(screen.getByText('Acorn Curved Stairlifts')).toBeInTheDocument();
    expect(screen.getByText('From $3495')).toBeInTheDocument();
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('falls back to mock products when no real products available', () => {
    const { useHomepageStore } = require('../../../src/lib/stores/homepageStore');
    useHomepageStore.mockReturnValue({
      featuredProducts: [],
      loading: false,
      error: null
    });

    render(
      <ProductShowcaseCarousel
        products={mockProducts}
        currentSlide={0}
        onSlideChange={mockOnSlideChange}
      />
    );

    expect(screen.getByText('Acorn Curved Stairlifts')).toBeInTheDocument();
    expect(screen.getByText('From $3,495')).toBeInTheDocument();
  });

  it('handles navigation correctly', () => {
    const { useHomepageStore } = require('../../../src/lib/stores/homepageStore');
    useHomepageStore.mockReturnValue({
      featuredProducts: mockFeaturedProducts,
      loading: false,
      error: null
    });

    render(
      <ProductShowcaseCarousel
        products={mockProducts}
        currentSlide={0}
        onSlideChange={mockOnSlideChange}
      />
    );

    // Test next button
    const nextButton = screen.getByLabelText('Next product');
    fireEvent.click(nextButton);
    expect(mockOnSlideChange).toHaveBeenCalledWith(1);

    // Test previous button
    const prevButton = screen.getByLabelText('Previous product');
    fireEvent.click(prevButton);
    expect(mockOnSlideChange).toHaveBeenCalledWith(1); // Should wrap around
  });

  it('handles dot navigation correctly', () => {
    const { useHomepageStore } = require('../../../src/lib/stores/homepageStore');
    useHomepageStore.mockReturnValue({
      featuredProducts: mockFeaturedProducts,
      loading: false,
      error: null
    });

    render(
      <ProductShowcaseCarousel
        products={mockProducts}
        currentSlide={0}
        onSlideChange={mockOnSlideChange}
      />
    );

    const dots = screen.getAllByRole('button');
    const secondDot = dots.find(button => 
      button.getAttribute('aria-label') === 'Go to slide 2'
    );
    
    if (secondDot) {
      fireEvent.click(secondDot);
      expect(mockOnSlideChange).toHaveBeenCalledWith(1);
    }
  });

  it('displays correct product information', () => {
    const { useHomepageStore } = require('../../../src/lib/stores/homepageStore');
    useHomepageStore.mockReturnValue({
      featuredProducts: mockFeaturedProducts,
      loading: false,
      error: null
    });

    render(
      <ProductShowcaseCarousel
        products={mockProducts}
        currentSlide={1}
        onSlideChange={mockOnSlideChange}
      />
    );

    expect(screen.getByText('Acorn Straight Stairlifts')).toBeInTheDocument();
    expect(screen.getByText('From $2995')).toBeInTheDocument();
    expect(screen.getByText('Best Value')).toBeInTheDocument();
  });

  it('handles missing product data gracefully', () => {
    const { useHomepageStore } = require('../../../src/lib/stores/homepageStore');
    useHomepageStore.mockReturnValue({
      featuredProducts: [
        {
          slug: 'test-product',
          name: 'Test Product',
          // Missing other required fields
        }
      ],
      loading: false,
      error: null
    });

    render(
      <ProductShowcaseCarousel
        products={mockProducts}
        currentSlide={0}
        onSlideChange={mockOnSlideChange}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Contact for pricing')).toBeInTheDocument();
  });

  it('pauses auto-play on hover', async () => {
    const { useHomepageStore } = require('../../../src/lib/stores/homepageStore');
    useHomepageStore.mockReturnValue({
      featuredProducts: mockFeaturedProducts,
      loading: false,
      error: null
    });

    render(
      <ProductShowcaseCarousel
        products={mockProducts}
        currentSlide={0}
        onSlideChange={mockOnSlideChange}
      />
    );

    const carousel = screen.getByRole('img').closest('div')?.parentElement;
    
    if (carousel) {
      fireEvent.mouseEnter(carousel);
      // Auto-play should pause, so onSlideChange shouldn't be called automatically
      await waitFor(() => {
        expect(mockOnSlideChange).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    }
  });
});