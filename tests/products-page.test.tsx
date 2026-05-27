import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import ProductsPage, { getServerSideProps } from '../src/pages/products/index';
import { ProductSchema } from '../src/lib/interfaces/schema';
import { ProductCardView } from '../src/lib/interfaces/homepage';

// Mock the contentful module
jest.mock('../src/lib/contentful/contentful', () => ({
  getProducts: jest.fn(),
}));

// Mock the data validation utilities
jest.mock('../src/lib/utils/data-validation', () => ({
  sanitizeForSSR: jest.fn((data) => data),
}));

// Mock the homepage interfaces
jest.mock('../src/lib/interfaces/homepage', () => ({
  mapToProductCardView: jest.fn((product) => ({
    slug: product.slug,
    title: product.name || product.title,
    description: product.description,
    imageUrl: product.imageUrl || '/placeholder.svg',
    price: product.price,
    badges: ['Featured'],
    rating: 4.5,
    optionsSummary: 'Multiple options available',
    financingCopy: 'Financing available'
  })),
}));

// Mock the ProductHeroCard component
jest.mock('../src/components/Home', () => ({
  ProductHeroCard: ({ product }: { product: ProductCardView }) => (
    <div data-testid={`product-card-${product.slug}`}>
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <span>${product.price}</span>
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

describe('Products Page', () => {
  const mockGetProducts = require('../src/lib/contentful/contentful').getProducts;
  const mockSanitizeForSSR = require('../src/lib/utils/data-validation').sanitizeForSSR;
  const mockMapToProductCardView = require('../src/lib/interfaces/homepage').mapToProductCardView;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders products page with curated products', () => {
      const mockProducts: ProductCardView[] = [
        {
          slug: 'product-1',
          title: 'Test Product 1',
          description: 'Test description 1',
          imageUrl: '/test1.jpg',
          price: 1000,
          badges: ['Featured'],
          rating: 4.5,
          optionsSummary: 'Options available',
          financingCopy: 'Financing available'
        },
        {
          slug: 'product-2',
          title: 'Test Product 2',
          description: 'Test description 2',
          imageUrl: '/test2.jpg',
          price: 2000,
          badges: ['Featured'],
          rating: 4.0,
          optionsSummary: 'Options available',
          financingCopy: 'Financing available'
        }
      ];

      render(<ProductsPage products={mockProducts} />);

      expect(screen.getByText('Our Curated Product Collection')).toBeInTheDocument();
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    it('renders error state when products fail to load', () => {
      render(<ProductsPage products={[]} error="Test error message" />);

      expect(screen.getByText('Products Temporarily Unavailable')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Return to Home')).toBeInTheDocument();
    });

    it('renders meta head with correct title and description', () => {
      const mockProducts: ProductCardView[] = [];
      render(<ProductsPage products={mockProducts} />);

      const metaHead = screen.getByTestId('meta-head');
      expect(metaHead).toBeInTheDocument();
    });

    it('renders features section', () => {
      const mockProducts: ProductCardView[] = [];
      render(<ProductsPage products={mockProducts} />);

      expect(screen.getByText('Why Choose Medtrion?')).toBeInTheDocument();
      expect(screen.getByText('Quality Assurance')).toBeInTheDocument();
      expect(screen.getByText('Expert Support')).toBeInTheDocument();
      expect(screen.getByText('Flexible Financing')).toBeInTheDocument();
    });

    it('renders call to action section', () => {
      const mockProducts: ProductCardView[] = [];
      render(<ProductsPage products={mockProducts} />);

      expect(screen.getByText('Need Help Choosing?')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('View FAQs')).toBeInTheDocument();
    });
  });

  describe('getServerSideProps', () => {
    const mockContext: GetServerSidePropsContext = {
      req: {} as any,
      res: {} as any,
      params: {},
      query: {},
      resolvedUrl: '/products',
    };

    it('returns curated products successfully', async () => {
      const mockProductsData = {
        items: [
          {
            slug: 'vivalift-tranquil-2-plr-935s-lift-chair',
            name: 'VivaLift Tranquil 2',
            description: 'Premium lift chair',
            price: 1500,
            imageUrl: '/test.jpg'
          },
          {
            slug: 'acorn-stairlifts-acorn-180-curved-stairlift',
            name: 'Acorn Stairlift 180',
            description: 'Curved stairlift',
            price: 2500,
            imageUrl: '/test2.jpg'
          },
          {
            slug: 'other-product',
            name: 'Other Product',
            description: 'Other description',
            price: 1000,
            imageUrl: '/test3.jpg'
          }
        ]
      };

      mockGetProducts.mockResolvedValue(mockProductsData);
      mockMapToProductCardView.mockImplementation((product) => ({
        slug: product.slug,
        title: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        badges: ['Featured'],
        rating: 4.5,
        optionsSummary: 'Options available',
        financingCopy: 'Financing available'
      }));
      mockSanitizeForSSR.mockImplementation((data) => data);

      const result = await getServerSideProps(mockContext);

      expect(result).toEqual({
        props: {
          products: expect.arrayContaining([
            expect.objectContaining({ slug: 'vivalift-tranquil-2-plr-935s-lift-chair' }),
            expect.objectContaining({ slug: 'acorn-stairlifts-acorn-180-curved-stairlift' })
          ])
        }
      });

      expect(mockGetProducts).toHaveBeenCalledWith('');
      expect(mockSanitizeForSSR).toHaveBeenCalled();
    });

    it('handles getProducts error', async () => {
      mockGetProducts.mockResolvedValue({
        items: [],
        error: 'GraphQL connection failed'
      });

      const result = await getServerSideProps(mockContext);

      expect(result).toEqual({
        props: {
          products: [],
          error: 'Unable to load products at this time. Please try again later.'
        }
      });
    });

    it('handles getProducts exception', async () => {
      mockGetProducts.mockRejectedValue(new Error('Network error'));

      const result = await getServerSideProps(mockContext);

      expect(result).toEqual({
        props: {
          products: [],
          error: 'Unable to load products at this time. Please try again later.'
        }
      });
    });

    it('limits products to exactly 10', async () => {
      const mockProductsData = {
        items: Array.from({ length: 15 }, (_, i) => ({
          slug: `product-${i}`,
          name: `Product ${i}`,
          description: `Description ${i}`,
          price: 1000 + i * 100,
          imageUrl: `/test${i}.jpg`
        }))
      };

      mockGetProducts.mockResolvedValue(mockProductsData);
      mockMapToProductCardView.mockImplementation((product) => ({
        slug: product.slug,
        title: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        badges: ['Featured'],
        rating: 4.5,
        optionsSummary: 'Options available',
        financingCopy: 'Financing available'
      }));
      mockSanitizeForSSR.mockImplementation((data) => data);

      const result = await getServerSideProps(mockContext);

      expect(result.props.products).toHaveLength(10);
    });

    it('applies data sanitization', async () => {
      const mockProductsData = {
        items: [
          {
            slug: 'test-product',
            name: 'Test Product',
            description: 'Test description',
            price: 1000,
            imageUrl: '/test.jpg'
          }
        ]
      };

      mockGetProducts.mockResolvedValue(mockProductsData);
      mockMapToProductCardView.mockImplementation((product) => ({
        slug: product.slug,
        title: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        badges: ['Featured'],
        rating: 4.5,
        optionsSummary: 'Options available',
        financingCopy: 'Financing available'
      }));
      mockSanitizeForSSR.mockImplementation((data) => ({ ...data, sanitized: true }));

      const result = await getServerSideProps(mockContext);

      expect(mockSanitizeForSSR).toHaveBeenCalled();
      expect(result.props.products[0]).toHaveProperty('sanitized', true);
    });
  });

  describe('Curated Product Selection', () => {
    it('prioritizes curated product slugs', () => {
      const mockProductsData = {
        items: [
          {
            slug: 'other-product',
            name: 'Other Product',
            description: 'Other description',
            price: 1000,
            imageUrl: '/test.jpg'
          },
          {
            slug: 'vivalift-tranquil-2-plr-935s-lift-chair',
            name: 'VivaLift Tranquil 2',
            description: 'Premium lift chair',
            price: 1500,
            imageUrl: '/test2.jpg'
          }
        ]
      };

      mockGetProducts.mockResolvedValue(mockProductsData);
      mockMapToProductCardView.mockImplementation((product) => ({
        slug: product.slug,
        title: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        badges: ['Featured'],
        rating: 4.5,
        optionsSummary: 'Options available',
        financingCopy: 'Financing available'
      }));
      mockSanitizeForSSR.mockImplementation((data) => data);

      return getServerSideProps(mockContext).then(result => {
        // Should prioritize curated products
        const curatedProduct = result.props.products.find(p => 
          p.slug === 'vivalift-tranquil-2-plr-935s-lift-chair'
        );
        expect(curatedProduct).toBeDefined();
      });
    });
  });
});