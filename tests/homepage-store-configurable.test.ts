/**
 * Tests for homepage store configurable products filtering
 * Verifies that the homepage store correctly filters and handles configurable products
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest';
import { useHomepageStore } from '../src/stores/homepageStore';
import { ProductSchema } from '../src/lib/interfaces/schema';

// Mock the GraphQL request function
jest.mock('../src/lib/woocommerce', () => ({
  runClientRequest: jest.fn()
}));

// Mock the contentful functions
jest.mock('../src/lib/contentful/contentful', () => ({
  mapWooToProductSchema: jest.fn((product) => product),
  getProducts: jest.fn()
}));

describe('Homepage Store Configurable Products', () => {
  const mockGraphQLResponse = {
    products: {
      nodes: [
        {
          id: '1',
          databaseId: 1,
          name: 'Configurable Stairlift',
          slug: 'configurable-stairlift',
          description: 'A configurable stairlift',
          shortDescription: 'Configurable',
          productSpecifications: '',
          relatedOptions: [1, 2, 3], // Has configurable options
          image: { sourceUrl: 'stairlift.jpg' },
          galleryImages: { nodes: [] },
          price: 2500,
          regularPrice: 2500,
          salePrice: null
        },
        {
          id: '2',
          databaseId: 2,
          name: 'Basic Chair',
          slug: 'basic-chair',
          description: 'A basic chair',
          shortDescription: 'Basic',
          productSpecifications: '',
          relatedOptions: [], // No configurable options
          image: { sourceUrl: 'chair.jpg' },
          galleryImages: { nodes: [] },
          price: 500,
          regularPrice: 500,
          salePrice: null
        },
        {
          id: '3',
          databaseId: 3,
          name: 'Configurable Lift Chair',
          slug: 'configurable-lift-chair',
          description: 'A configurable lift chair',
          shortDescription: 'Configurable',
          productSpecifications: '',
          relatedOptions: [4, 5, 6], // Has configurable options
          image: { sourceUrl: 'lift-chair.jpg' },
          galleryImages: { nodes: [] },
          price: 1500,
          regularPrice: 1500,
          salePrice: null
        },
        {
          id: '4',
          databaseId: 4,
          name: 'Simple Product',
          slug: 'simple-product',
          description: 'A simple product',
          shortDescription: 'Simple',
          productSpecifications: '',
          relatedOptions: null, // Null options
          image: { sourceUrl: 'simple.jpg' },
          galleryImages: { nodes: [] },
          price: 300,
          regularPrice: 300,
          salePrice: null
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.warn to avoid test output noise
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchFeaturedProducts', () => {
    it('should filter out non-configurable products', async () => {
      const { runClientRequest } = require('../src/lib/woocommerce');
      const { mapWooToProductSchema } = require('../src/lib/contentful/contentful');
      
      // Mock successful GraphQL response
      runClientRequest.mockResolvedValue(mockGraphQLResponse);
      mapWooToProductSchema.mockImplementation((product) => ({
        ...product,
        title: product.name,
        featuredImage: product.image?.sourceUrl,
        relatedOptions: product.relatedOptions
      }));

      const store = useHomepageStore.getState();
      await store.fetchFeaturedProducts();

      // Should only include products with configurable options
      expect(store.featuredProducts).toHaveLength(2);
      expect(store.featuredProducts.map(p => p.slug)).toEqual([
        'configurable-stairlift',
        'configurable-lift-chair'
      ]);
    });

    it('should log warning when insufficient configurable products', async () => {
      const { runClientRequest } = require('../src/lib/woocommerce');
      const { mapWooToProductSchema } = require('../src/lib/contentful/contentful');
      
      // Mock response with only 1 configurable product (need 4)
      const limitedResponse = {
        products: {
          nodes: [
            {
              id: '1',
              databaseId: 1,
              name: 'Only Configurable Product',
              slug: 'only-configurable',
              description: 'Only configurable product',
              shortDescription: 'Only',
              productSpecifications: '',
              relatedOptions: [1, 2],
              image: { sourceUrl: 'only.jpg' },
              galleryImages: { nodes: [] },
              price: 1000,
              regularPrice: 1000,
              salePrice: null
            }
          ]
        }
      };

      runClientRequest.mockResolvedValue(limitedResponse);
      mapWooToProductSchema.mockImplementation((product) => ({
        ...product,
        title: product.name,
        featuredImage: product.image?.sourceUrl,
        relatedOptions: product.relatedOptions
      }));

      const consoleSpy = jest.spyOn(console, 'warn');
      
      const store = useHomepageStore.getState();
      await store.fetchFeaturedProducts();

      // Should log warning about insufficient products
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Only 1 configurable products found')
      );
    });

    it('should handle fallback when GraphQL fails', async () => {
      const { runClientRequest } = require('../src/lib/woocommerce');
      const { getProducts } = require('../src/lib/contentful/contentful');
      
      // Mock GraphQL failure
      runClientRequest.mockRejectedValue(new Error('GraphQL Error'));
      
      // Mock successful fallback
      getProducts.mockResolvedValue({
        items: [
          {
            id: 'fallback-1',
            databaseId: 101,
            slug: 'fallback-configurable',
            title: 'Fallback Configurable',
            description: 'Fallback configurable product',
            shortDescription: 'Fallback',
            price: 1200,
            regularPrice: 1200,
            salePrice: null,
            featuredImage: 'fallback.jpg',
            galleryImages: [],
            productSpecifications: '',
            relatedOptions: [10, 11],
            _related_options: [10, 11],
            affiliate: false,
            type: 'simple'
          }
        ]
      });

      const store = useHomepageStore.getState();
      await store.fetchFeaturedProducts();

      // Should use fallback and filter for configurable products
      expect(store.featuredProducts).toHaveLength(1);
      expect(store.featuredProducts[0].slug).toBe('fallback-configurable');
    });

    it('should handle complete failure gracefully', async () => {
      const { runClientRequest } = require('../src/lib/woocommerce');
      const { getProducts } = require('../src/lib/contentful/contentful');
      
      // Mock both GraphQL and fallback failures
      runClientRequest.mockRejectedValue(new Error('GraphQL Error'));
      getProducts.mockRejectedValue(new Error('Fallback Error'));

      const store = useHomepageStore.getState();
      await store.fetchFeaturedProducts();

      // Should set error state
      expect(store.error).toBe('GraphQL Error');
      expect(store.loading).toBe(false);
      expect(store.featuredProducts).toHaveLength(0);
    });

    it('should set loading state correctly', async () => {
      const { runClientRequest } = require('../src/lib/woocommerce');
      const { mapWooToProductSchema } = require('../src/lib/contentful/contentful');
      
      // Mock delayed response
      runClientRequest.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockGraphQLResponse), 100))
      );
      mapWooToProductSchema.mockImplementation((product) => ({
        ...product,
        title: product.name,
        featuredImage: product.image?.sourceUrl,
        relatedOptions: product.relatedOptions
      }));

      const store = useHomepageStore.getState();
      
      // Start fetch
      const fetchPromise = store.fetchFeaturedProducts();
      
      // Should be loading
      expect(store.loading).toBe(true);
      
      // Wait for completion
      await fetchPromise;
      
      // Should not be loading anymore
      expect(store.loading).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      const store = useHomepageStore.getState();
      
      expect(store.featuredProducts).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('should clear error when starting new fetch', async () => {
      const { runClientRequest } = require('../src/lib/woocommerce');
      const { mapWooToProductSchema } = require('../src/lib/contentful/contentful');
      
      // First, set an error state
      const store = useHomepageStore.getState();
      store.error = 'Previous Error';
      
      // Mock successful response
      runClientRequest.mockResolvedValue(mockGraphQLResponse);
      mapWooToProductSchema.mockImplementation((product) => ({
        ...product,
        title: product.name,
        featuredImage: product.image?.sourceUrl,
        relatedOptions: product.relatedOptions
      }));

      // Start new fetch
      await store.fetchFeaturedProducts();
      
      // Error should be cleared
      expect(store.error).toBe(null);
    });
  });
});