import React from 'react';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { ProductDetailPage, getServerSideProps } from '../src/pages/product/[slug]/index';

// Mock the configurator API
jest.mock('../src/lib/graphql/configurator', () => ({
  configuratorAPI: {
    getModelWithCategories: jest.fn(),
    addConfigurationToCart: jest.fn(),
    getConfigurationCategories: jest.fn(),
    checkCompatibility: jest.fn(),
    calculateFinancing: jest.fn(),
    estimateInsurance: jest.fn(),
  },
}));

// Mock the Contentful API
jest.mock('../src/lib/contentful/contentful', () => ({
  getProductBySlug: jest.fn(),
}));

describe('Product Detail GraphQL Response Fix', () => {
  const mockContext: GetServerSidePropsContext = {
    params: { slug: 'test-product' },
    query: {},
    req: {} as any,
    res: {} as any,
    resolvedUrl: '/product/test-product',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GraphQL Response Handling', () => {
    it('should handle GraphQL response with both name and title', async () => {
      const mockGraphQLResponse = {
        product: {
          id: 'test-123',
          databaseId: 123,
          name: 'Test Product Name',
          slug: 'test-product',
          title: 'Test Product Name', // GraphQL alias
          description: 'Test product description',
          shortDescription: 'Test short description',
          price: 1000,
          regularPrice: 1000,
          salePrice: null,
          sku: 'TEST-001',
          image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
          galleryImages: { nodes: [] },
          productSpecifications: '',
          relatedOptions: [],
          configuratorCategories: [],
          compatibilityRules: [],
          installationRequired: false,
          financingAvailable: true,
          insuranceCoverage: 'Standard',
          safetyRating: 'A+',
          adaCompliant: true,
          weightCapacity: 300,
        }
      };

      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      configuratorAPI.getModelWithCategories.mockResolvedValue(mockGraphQLResponse);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('seoMeta');
      expect(result.props.seoMeta.title).toBe('Test Product Name | HSMobility');
      expect(result.props.seoMeta.description).toContain('Test Product Name');
    });

    it('should handle GraphQL response with only name (no title alias)', async () => {
      const mockGraphQLResponse = {
        product: {
          id: 'test-123',
          databaseId: 123,
          name: 'Test Product Name',
          slug: 'test-product',
          // No title field
          description: 'Test product description',
          shortDescription: 'Test short description',
          price: 1000,
          regularPrice: 1000,
          salePrice: null,
          sku: 'TEST-001',
          image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
          galleryImages: { nodes: [] },
          productSpecifications: '',
          relatedOptions: [],
          configuratorCategories: [],
          compatibilityRules: [],
          installationRequired: false,
          financingAvailable: true,
          insuranceCoverage: 'Standard',
          safetyRating: 'A+',
          adaCompliant: true,
          weightCapacity: 300,
        }
      };

      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      configuratorAPI.getModelWithCategories.mockResolvedValue(mockGraphQLResponse);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('seoMeta');
      expect(result.props.seoMeta.title).toBe('Test Product Name | HSMobility');
      expect(result.props.seoMeta.description).toContain('Test Product Name');
    });

    it('should handle GraphQL response with null product', async () => {
      const mockGraphQLResponse = {
        product: null
      };

      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      configuratorAPI.getModelWithCategories.mockResolvedValue(mockGraphQLResponse);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('error');
      expect(result.props.error).toBe('Product not found');
    });

    it('should handle GraphQL response with undefined product', async () => {
      const mockGraphQLResponse = {
        // No product field
      };

      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      configuratorAPI.getModelWithCategories.mockResolvedValue(mockGraphQLResponse);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('error');
      expect(result.props.error).toBe('Product not found');
    });
  });

  describe('Contentful Fallback Handling', () => {
    it('should handle Contentful fallback with title', async () => {
      const mockContentfulProduct = {
        productId: 'test-123',
        slug: 'test-product',
        title: 'Test Product Title',
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: 1000,
        featuredImage: '/test-image.jpg',
        affiliate: false,
        productPictures: [],
        variations: [],
        options: [],
        _related_options: [],
        _related_options_products: []
      };

      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      const { getProductBySlug } = require('../src/lib/contentful/contentful');
      
      configuratorAPI.getModelWithCategories.mockRejectedValue(new Error('GraphQL failed'));
      getProductBySlug.mockResolvedValue(mockContentfulProduct);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('seoMeta');
      expect(result.props.seoMeta.title).toBe('Test Product Title | HSMobility');
      expect(result.props.seoMeta.description).toContain('Test Product Title');
    });

    it('should handle Contentful fallback with missing title', async () => {
      const mockContentfulProduct = {
        productId: 'test-123',
        slug: 'test-product',
        // No title field
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: 1000,
        featuredImage: '/test-image.jpg',
        affiliate: false,
        productPictures: [],
        variations: [],
        options: [],
        _related_options: [],
        _related_options_products: []
      };

      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      const { getProductBySlug } = require('../src/lib/contentful/contentful');
      
      configuratorAPI.getModelWithCategories.mockRejectedValue(new Error('GraphQL failed'));
      getProductBySlug.mockResolvedValue(mockContentfulProduct);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('seoMeta');
      expect(result.props.seoMeta.title).toBe('Product | HSMobility');
      expect(result.props.seoMeta.description).toContain('Product');
    });

    it('should handle both GraphQL and Contentful failures', async () => {
      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      const { getProductBySlug } = require('../src/lib/contentful/contentful');
      
      configuratorAPI.getModelWithCategories.mockRejectedValue(new Error('GraphQL failed'));
      getProductBySlug.mockResolvedValue(null);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('error');
      expect(result.props.error).toBe('Product not found');
    });
  });

  describe('Component Rendering', () => {
    it('should render product with title fallback', () => {
      const mockProduct = {
        id: 'test-123',
        databaseId: 123,
        name: 'Test Product Name',
        slug: 'test-product',
        // No title field
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: 1000,
        regularPrice: 1000,
        salePrice: null,
        sku: 'TEST-001',
        image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
        galleryImages: { nodes: [] },
        productSpecifications: '',
        relatedOptions: [],
        configuratorCategories: [],
        compatibilityRules: [],
        installationRequired: false,
        financingAvailable: true,
        insuranceCoverage: 'Standard',
        safetyRating: 'A+',
        adaCompliant: true,
        weightCapacity: 300,
      };

      render(
        <ProductDetailPage
          product={mockProduct}
          categories={[]}
          error={null}
          seoMeta={{
            title: 'Test Product Name | HSMobility',
            description: 'Test description',
          }}
        />
      );

      // Should render product name in breadcrumb
      expect(screen.getByText('Test Product Name')).toBeInTheDocument();
    });

    it('should render product with both name and title', () => {
      const mockProduct = {
        id: 'test-123',
        databaseId: 123,
        name: 'Test Product Name',
        slug: 'test-product',
        title: 'Test Product Title',
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: 1000,
        regularPrice: 1000,
        salePrice: null,
        sku: 'TEST-001',
        image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
        galleryImages: { nodes: [] },
        productSpecifications: '',
        relatedOptions: [],
        configuratorCategories: [],
        compatibilityRules: [],
        installationRequired: false,
        financingAvailable: true,
        insuranceCoverage: 'Standard',
        safetyRating: 'A+',
        adaCompliant: true,
        weightCapacity: 300,
      };

      render(
        <ProductDetailPage
          product={mockProduct}
          categories={[]}
          error={null}
          seoMeta={{
            title: 'Test Product Title | HSMobility',
            description: 'Test description',
          }}
        />
      );

      // Should render product title (preferred over name)
      expect(screen.getByText('Test Product Title')).toBeInTheDocument();
    });

    it('should render fallback when both name and title are missing', () => {
      const mockProduct = {
        id: 'test-123',
        databaseId: 123,
        slug: 'test-product',
        // No name or title fields
        description: 'Test product description',
        shortDescription: 'Test short description',
        price: 1000,
        regularPrice: 1000,
        salePrice: null,
        sku: 'TEST-001',
        image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
        galleryImages: { nodes: [] },
        productSpecifications: '',
        relatedOptions: [],
        configuratorCategories: [],
        compatibilityRules: [],
        installationRequired: false,
        financingAvailable: true,
        insuranceCoverage: 'Standard',
        safetyRating: 'A+',
        adaCompliant: true,
        weightCapacity: 300,
      };

      render(
        <ProductDetailPage
          product={mockProduct}
          categories={[]}
          error={null}
          seoMeta={{
            title: 'Product | HSMobility',
            description: 'Test description',
          }}
        />
      );

      // Should render fallback text
      expect(screen.getByText('Product')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle null product gracefully', async () => {
      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      const { getProductBySlug } = require('../src/lib/contentful/contentful');
      
      configuratorAPI.getModelWithCategories.mockResolvedValue({ product: null });
      getProductBySlug.mockResolvedValue(null);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('error');
      expect(result.props.error).toBe('Product not found');
    });

    it('should handle undefined product gracefully', async () => {
      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      const { getProductBySlug } = require('../src/lib/contentful/contentful');
      
      configuratorAPI.getModelWithCategories.mockResolvedValue({});
      getProductBySlug.mockResolvedValue(null);

      const result = await getServerSideProps(mockContext);

      expect(result).toHaveProperty('props');
      expect(result.props).toHaveProperty('error');
      expect(result.props.error).toBe('Product not found');
    });
  });
});