import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useHomepageStore } from '../../src/stores/homepageStore';
import TopProductsStrip from '../../src/components/Home/TopProductsStrip';
import { ProductCardView } from '../../src/lib/interfaces/homepage';

// Mock Next.js components
vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

vi.mock('next/image', () => {
  return {
    default: ({ src, alt, ...props }: any) => (
      <img src={src} alt={alt} {...props} />
    ),
  };
});

const mockFeaturedProducts: ProductCardView[] = [
  {
    slug: 'acorn-180-stairlift',
    title: 'Acorn 180 Stairlift',
    description: 'Premium curved stairlift',
    price: 2899,
    financingCopy: 'from $99/mo',
    badges: ['Top Seller'],
    imageUrl: '/180-stairlift-wh.jpg',
    rating: 4.8,
    isFeatured: true,
    optionsSummary: '12 options available',
    productId: '180',
    databaseId: 180,
  },
  {
    slug: 'acorn-130-stairlift',
    title: 'Acorn 130 Stairlift', 
    description: 'Reliable straight stairlift',
    price: 2299,
    financingCopy: null,
    badges: ['Best Value'],
    imageUrl: '/130-stairlift-wh.jpg',
    rating: null,
    isFeatured: true,
    optionsSummary: null,
    productId: '130',
    databaseId: 130,
  },
];

describe('Home Layout Integration Tests', () => {
  beforeEach(() => {
    // Clear the store before each test
    useHomepageStore.getState().fetchFeaturedProducts = vi.fn();
    useHomepageStore.setState({
      featuredProducts: [],
      loading: false,
      error: null,
    });
  });

  describe('TopProductsStrip', () => {
    it('renders featured products when data is available', async () => {
      // Mock the store with data
      useHomepageStore.setState({
        featuredProducts: mockFeaturedProducts,
        loading: false,
        error: null,
      });

      render(<TopProductsStrip enableShowcase={true} />);

      expect(screen.getByText('Featured Products')).toBeInTheDocument();
      expect(screen.getByText('Acorn 180 Stairlift')).toBeInTheDocument();
      expect(screen.getByText('Acorn 130 Stairlift')).toBeInTheDocument();
    });

    it('shows loading skeleton when loading', () => {
      useHomepageStore.setState({
        featuredProducts: [],
        loading: true,
        error: null,
      });

      render(<TopProductsStrip enableShowcase={true} />);

      expect(screen.getByText('Top Products')).toBeInTheDocument();
      // Check for loading skeletons
      const skeletons = screen.getAllByTestId(/loading-skeleton/i) || 
                       document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows error state when there is an error', () => {
      useHomepageStore.setState({
        featuredProducts: [],
        loading: false,
        error: 'Failed to load featured products',
      });

      render(<TopProductsStrip enableShowcase={true} />);

      expect(screen.getByText('Failed to load featured products')).toBeInTheDocument();
    });

    it('does not render when feature flag is disabled', () => {
      useHomepageStore.setState({
        featuredProducts: mockFeaturedProducts,
        loading: false,
        error: null,
      });

      const { container } = render(<TopProductsStrip enableShowcase={false} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('calls analytics callback when hero product is clicked', async () => {
      const mockAnalytics = vi.fn();
      
      // Mock window.gtag
      Object.defineProperty(window, 'gtag', {
        value: mockAnalytics,
        writable: true,
      });

      useHomepageStore.setState({
        featuredProducts: mockFeaturedProducts,
        loading: false,
        error: null,
      });

      render(<TopProductsStrip enableShowcase={true} />);

      // Find and click the first product link
      const productLink = screen.getByRole('link', { name: /View details for Acorn 180 Stairlift/i });
      fireEvent.click(productLink);

      // Wait for analytics to be called
      await waitFor(() => {
        expect(mockAnalytics).toHaveBeenCalledWith('event', 'hero_product_click', {
          product_slug: 'acorn-180-stairlift',
          badge: 'Top Seller',
          position: 0,
        });
      });
    });

    it('limits featured products to 4 items', () => {
      const manyProducts = Array.from({ length: 10 }, (_, i) => ({
        ...mockFeaturedProducts[0],
        slug: `product-${i}`,
        title: `Product ${i}`,
        databaseId: i,
      }));

      useHomepageStore.setState({
        featuredProducts: manyProducts,
        loading: false,
        error: null,
      });

      render(<TopProductsStrip enableShowcase={true} />);

      // Should only render 4 products max
      const productCards = screen.getAllByRole('link', { name: /View details for/i });
      expect(productCards.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Feature Flag Integration', () => {
    it('respects feature flag state changes', () => {
      useHomepageStore.setState({
        featuredProducts: mockFeaturedProducts,
        loading: false,
        error: null,
      });

      const { rerender } = render(<TopProductsStrip enableShowcase={true} />);
      expect(screen.getByText('Featured Products')).toBeInTheDocument();

      // Disable feature flag
      rerender(<TopProductsStrip enableShowcase={false} />);
      expect(screen.queryByText('Featured Products')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('renders mobile layout on small screens', () => {
      // Mock window.matchMedia for mobile
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      useHomepageStore.setState({
        featuredProducts: mockFeaturedProducts,
        loading: false,
        error: null,
      });

      render(<TopProductsStrip enableShowcase={true} />);

      // Check for mobile-specific classes
      const mobileContainer = document.querySelector('.md\\:hidden');
      expect(mobileContainer).toBeInTheDocument();
    });
  });
});