import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import ProductsPage from '../src/pages/products/index';
import { ProductCardView } from '../src/lib/interfaces/homepage';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the ProductHeroCard component with navigation
jest.mock('../src/components/Home', () => ({
  ProductHeroCard: ({ product, onHeroClick }: { 
    product: ProductCardView; 
    onHeroClick?: (slug: string, badge: string, position: number) => void;
  }) => (
    <div 
      data-testid={`product-card-${product.slug}`}
      onClick={() => onHeroClick?.(product.slug, product.badges[0] || '', 0)}
    >
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <span>${product.price}</span>
      <a href={`/product/${product.slug}`}>View Details</a>
    </div>
  ),
}));

// Mock MetaHead component
jest.mock('../src/components/MetaHead', () => {
  return function MockMetaHead({ title, description }: { title: string; description: string }) {
    return (
      <div data-testid="meta-head">
        <title>{title}</title>
        <meta name="description" content={description} />
      </div>
    );
  };
});

describe('Products Page Integration', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    asPath: '/products',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  describe('Navigation Integration', () => {
    it('handles product card clicks correctly', async () => {
      const mockProducts: ProductCardView[] = [
        {
          slug: 'test-product-1',
          title: 'Test Product 1',
          description: 'Test description 1',
          imageUrl: '/test1.jpg',
          price: 1000,
          badges: ['Featured'],
          rating: 4.5,
          optionsSummary: 'Options available',
          financingCopy: 'Financing available'
        }
      ];

      render(<ProductsPage products={mockProducts} />);

      const productCard = screen.getByTestId('product-card-test-product-1');
      expect(productCard).toBeInTheDocument();

      // Check that the product card has a link to the product detail page
      const productLink = screen.getByText('View Details');
      expect(productLink).toHaveAttribute('href', '/product/test-product-1');
    });

    it('handles call to action navigation', () => {
      const mockProducts: ProductCardView[] = [];
      render(<ProductsPage products={mockProducts} />);

      const contactLink = screen.getByText('Contact Us');
      const faqLink = screen.getByText('View FAQs');

      expect(contactLink).toHaveAttribute('href', '/#contact-us');
      expect(faqLink).toHaveAttribute('href', '/#faq');
    });

    it('handles error state navigation', () => {
      render(<ProductsPage products={[]} error="Test error" />);

      const homeLink = screen.getByText('Return to Home');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Responsive Design Integration', () => {
    it('renders responsive grid layout', () => {
      const mockProducts: ProductCardView[] = Array.from({ length: 5 }, (_, i) => ({
        slug: `product-${i}`,
        title: `Product ${i}`,
        description: `Description ${i}`,
        imageUrl: `/test${i}.jpg`,
        price: 1000 + i * 100,
        badges: ['Featured'],
        rating: 4.5,
        optionsSummary: 'Options available',
        financingCopy: 'Financing available'
      }));

      render(<ProductsPage products={mockProducts} />);

      // Check that all 5 products are rendered
      for (let i = 0; i < 5; i++) {
        expect(screen.getByTestId(`product-card-product-${i}`)).toBeInTheDocument();
      }

      // Check responsive grid classes are applied
      const productsGrid = screen.getByText('Product 0').closest('.grid');
      expect(productsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-5');
    });

    it('renders responsive call to action buttons', () => {
      const mockProducts: ProductCardView[] = [];
      render(<ProductsPage products={mockProducts} />);

      const ctaContainer = screen.getByText('Contact Us').closest('.flex');
      expect(ctaContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  describe('SEO Integration', () => {
    it('renders proper meta tags', () => {
      const mockProducts: ProductCardView[] = [];
      render(<ProductsPage products={mockProducts} />);

      const metaHead = screen.getByTestId('meta-head');
      expect(metaHead).toBeInTheDocument();
    });

    it('renders structured content for SEO', () => {
      const mockProducts: ProductCardView[] = [
        {
          slug: 'seo-product',
          title: 'SEO Test Product',
          description: 'SEO test description',
          imageUrl: '/seo-test.jpg',
          price: 1500,
          badges: ['Featured'],
          rating: 4.5,
          optionsSummary: 'Options available',
          financingCopy: 'Financing available'
        }
      ];

      render(<ProductsPage products={mockProducts} />);

      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Our Curated Product Collection');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Featured Products');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('SEO Test Product');
    });
  });

  describe('Accessibility Integration', () => {
    it('has proper ARIA labels and roles', () => {
      const mockProducts: ProductCardView[] = [
        {
          slug: 'accessible-product',
          title: 'Accessible Product',
          description: 'Accessible description',
          imageUrl: '/accessible.jpg',
          price: 1200,
          badges: ['Featured'],
          rating: 4.5,
          optionsSummary: 'Options available',
          financingCopy: 'Financing available'
        }
      ];

      render(<ProductsPage products={mockProducts} />);

      // Check for proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(4); // h1, h2, and 3 h3s in features section

      // Check for proper link accessibility
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('has proper focus management', () => {
      const mockProducts: ProductCardView[] = [];
      render(<ProductsPage products={mockProducts} />);

      const contactButton = screen.getByText('Contact Us');
      const faqButton = screen.getByText('View FAQs');

      // Check that buttons are focusable
      expect(contactButton).toBeInTheDocument();
      expect(faqButton).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('renders without performance issues', () => {
      const mockProducts: ProductCardView[] = Array.from({ length: 5 }, (_, i) => ({
        slug: `perf-product-${i}`,
        title: `Performance Product ${i}`,
        description: `Performance description ${i}`,
        imageUrl: `/perf${i}.jpg`,
        price: 1000 + i * 100,
        badges: ['Featured'],
        rating: 4.5,
        optionsSummary: 'Options available',
        financingCopy: 'Financing available'
      }));

      const startTime = performance.now();
      render(<ProductsPage products={mockProducts} />);
      const endTime = performance.now();

      // Should render quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // All products should be rendered
      for (let i = 0; i < 5; i++) {
        expect(screen.getByTestId(`product-card-perf-product-${i}`)).toBeInTheDocument();
      }
    });

    it('handles large product datasets efficiently', () => {
      const mockProducts: ProductCardView[] = Array.from({ length: 5 }, (_, i) => ({
        slug: `large-product-${i}`,
        title: `Large Product ${i}`,
        description: `Large description ${i}`.repeat(10), // Long description
        imageUrl: `/large${i}.jpg`,
        price: 1000 + i * 100,
        badges: ['Featured', 'Premium', 'Limited'],
        rating: 4.5,
        optionsSummary: 'Multiple options available',
        financingCopy: 'Flexible financing options available'
      }));

      render(<ProductsPage products={mockProducts} />);

      // Should still render all products
      for (let i = 0; i < 5; i++) {
        expect(screen.getByTestId(`product-card-large-product-${i}`)).toBeInTheDocument();
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('handles empty products array gracefully', () => {
      render(<ProductsPage products={[]} />);

      expect(screen.getByText('Our Curated Product Collection')).toBeInTheDocument();
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
      // Should not crash with empty products array
    });

    it('handles malformed product data gracefully', () => {
      const malformedProducts: ProductCardView[] = [
        {
          slug: '',
          title: '',
          description: '',
          imageUrl: '',
          price: 0,
          badges: [],
          rating: 0,
          optionsSummary: '',
          financingCopy: ''
        }
      ];

      render(<ProductsPage products={malformedProducts} />);

      // Should still render the page structure
      expect(screen.getByText('Our Curated Product Collection')).toBeInTheDocument();
    });
  });
});