import React from 'react';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { ProductDetailPage, getServerSideProps } from '../src/pages/product/[slug]/index';
import { ProductSchema } from '../src/lib/interfaces/schema';

// Mock Next.js modules
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    asPath: '/product/test-product',
  })),
}));

jest.mock('../src/lib/graphql/configurator', () => ({
  configuratorAPI: {
    addConfigurationToCart: jest.fn(),
    getModelWithCategories: jest.fn(),
    getConfigurationCategories: jest.fn(),
    checkCompatibility: jest.fn(),
    calculateFinancing: jest.fn(),
    estimateInsurance: jest.fn(),
  },
}));

describe('Product Detail Page Name Fix', () => {
  const mockProduct: ProductSchema = {
    title: 'Test Product Title',
    slug: 'test-product',
    description: 'Test product description',
    shortDescription: 'Test short description',
    featuredImage: '/test-image.jpg',
    productSpecifications: '',
    productPictures: [],
    price: 1000,
    affiliate: false,
    productId: 'test-123',
  };

  const mockContext: GetServerSidePropsContext = {
    params: { slug: 'test-product' },
    query: {},
    req: {} as any,
    res: {} as any,
    resolvedUrl: '/product/test-product',
  };

  describe('getServerSideProps', () => {
    it('should use product.title instead of product.name for SEO meta', async () => {
      // Mock the GraphQL response
      const mockGraphQLResponse = {
        product: mockProduct,
        categories: [],
      };

      // Mock the GraphQL client
      const mockGraphQLClient = {
        request: jest.fn().mockResolvedValue(mockGraphQLResponse),
      };

      // Mock the configurator API
      const mockConfiguratorAPI = {
        getModelWithCategories: jest.fn().mockResolvedValue({
          product: mockProduct,
          categories: [],
        }),
      };

      // Mock the modules
      jest.doMock('../src/lib/graphql/configurator', () => ({
        configuratorAPI: mockConfiguratorAPI,
      }));

      jest.doMock('../src/lib/woocommerce', () => ({
        client: mockGraphQLClient,
      }));

      // Call getServerSideProps
      const result = await getServerSideProps(mockContext);

      // Verify the result
      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('seoMeta');
      expect(result.props.seoMeta.title).toBe('Test Product Title | Medtrion');
      expect(result.props.seoMeta.description).toContain('Test Product Title');
    });

    it('should handle missing product gracefully', async () => {
      // Mock the GraphQL response with no product
      const mockGraphQLResponse = {
        product: null,
        categories: [],
      };

      // Mock the GraphQL client
      const mockGraphQLClient = {
        request: jest.fn().mockResolvedValue(mockGraphQLResponse),
      };

      // Mock the modules
      jest.doMock('../src/lib/woocommerce', () => ({
        client: mockGraphQLClient,
      }));

      // Call getServerSideProps
      const result = await getServerSideProps(mockContext);

      // Verify the result handles missing product
      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('error');
    });
  });

  describe('ProductDetailPage Component', () => {
    it('should render product title correctly', () => {
      render(
        <ProductDetailPage
          product={mockProduct}
          categories={[]}
          error={null}
          seoMeta={{
            title: 'Test Product Title | Medtrion',
            description: 'Test description',
          }}
        />
      );

      // Check that product title is rendered correctly
      expect(screen.getByText('Test Product Title')).toBeInTheDocument();
    });

    it('should render breadcrumb with product title', () => {
      render(
        <ProductDetailPage
          product={mockProduct}
          categories={[]}
          error={null}
          seoMeta={{
            title: 'Test Product Title | Medtrion',
            description: 'Test description',
          }}
        />
      );

      // Check that breadcrumb contains product title
      const breadcrumb = screen.getByText('Test Product Title');
      expect(breadcrumb).toBeInTheDocument();
    });

    it('should render configuration summary with product title', () => {
      render(
        <ProductDetailPage
          product={mockProduct}
          categories={[]}
          error={null}
          seoMeta={{
            title: 'Test Product Title | Medtrion',
            description: 'Test description',
          }}
        />
      );

      // Check that configuration summary contains product title
      const configSummary = screen.getByText('Test Product Title');
      expect(configSummary).toBeInTheDocument();
    });

    it('should render configure section with product title', () => {
      render(
        <ProductDetailPage
          product={mockProduct}
          categories={[]}
          error={null}
          seoMeta={{
            title: 'Test Product Title | Medtrion',
            description: 'Test description',
          }}
        />
      );

      // Check that configure section contains product title
      const configureSection = screen.getByText('Configure Your Test Product Title');
      expect(configureSection).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle product with missing title gracefully', () => {
      const productWithoutTitle = {
        ...mockProduct,
        title: '',
      };

      render(
        <ProductDetailPage
          product={productWithoutTitle}
          categories={[]}
          error={null}
          seoMeta={{
            title: ' | Medtrion',
            description: 'Test description',
          }}
        />
      );

      // Should not crash and should render empty title
      expect(screen.getByText('')).toBeInTheDocument();
    });

    it('should handle product with undefined title gracefully', () => {
      const productWithUndefinedTitle = {
        ...mockProduct,
        title: undefined as any,
      };

      render(
        <ProductDetailPage
          product={productWithUndefinedTitle}
          categories={[]}
          error={null}
          seoMeta={{
            title: 'undefined | Medtrion',
            description: 'Test description',
          }}
        />
      );

      // Should not crash
      expect(screen.getByText('undefined')).toBeInTheDocument();
    });
  });

  describe('SEO Meta Generation', () => {
    it('should generate correct SEO meta with product title', () => {
      const seoMeta = {
        title: `${mockProduct.title} | Medtrion`,
        description: `Discover ${mockProduct.title} - ${mockProduct.shortDescription || mockProduct.description?.substring(0, 150) || 'Premium mobility solution'}. Configure your perfect mobility equipment with our comprehensive options.`
      };

      expect(seoMeta.title).toBe('Test Product Title | Medtrion');
      expect(seoMeta.description).toContain('Test Product Title');
      expect(seoMeta.description).toContain('Test short description');
    });

    it('should handle missing shortDescription in SEO meta', () => {
      const productWithoutShortDescription = {
        ...mockProduct,
        shortDescription: '',
      };

      const seoMeta = {
        title: `${productWithoutShortDescription.title} | Medtrion`,
        description: `Discover ${productWithoutShortDescription.title} - ${productWithoutShortDescription.shortDescription || productWithoutShortDescription.description?.substring(0, 150) || 'Premium mobility solution'}. Configure your perfect mobility equipment with our comprehensive options.`
      };

      expect(seoMeta.title).toBe('Test Product Title | Medtrion');
      expect(seoMeta.description).toContain('Test Product Title');
      expect(seoMeta.description).toContain('Test product description');
    });

    it('should handle missing description in SEO meta', () => {
      const productWithoutDescription = {
        ...mockProduct,
        description: '',
        shortDescription: '',
      };

      const seoMeta = {
        title: `${productWithoutDescription.title} | Medtrion`,
        description: `Discover ${productWithoutDescription.title} - ${productWithoutDescription.shortDescription || productWithoutDescription.description?.substring(0, 150) || 'Premium mobility solution'}. Configure your perfect mobility equipment with our comprehensive options.`
      };

      expect(seoMeta.title).toBe('Test Product Title | Medtrion');
      expect(seoMeta.description).toContain('Test Product Title');
      expect(seoMeta.description).toContain('Premium mobility solution');
    });
  });
});