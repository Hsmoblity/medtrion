import { describe, it, expect } from 'vitest';

describe('Product Detail Slug Query Implementation', () => {
  describe('GraphQL Query Template', () => {
    it('should have GetProductBySlug query defined', () => {
      const { CONFIGURATOR_QUERIES } = require('../src/lib/graphql/configurator');
      
      expect(CONFIGURATOR_QUERIES.GET_PRODUCT_BY_SLUG).toBeDefined();
      expect(typeof CONFIGURATOR_QUERIES.GET_PRODUCT_BY_SLUG).toBe('string');
    });

    it('should have correct GraphQL query structure', () => {
      const { CONFIGURATOR_QUERIES } = require('../src/lib/graphql/configurator');
      const query = CONFIGURATOR_QUERIES.GET_PRODUCT_BY_SLUG;
      
      // Check for required query structure
      expect(query).toContain('query GetProductBySlug($slug: String!)');
      expect(query).toContain('products(where: { slugIn: [$slug] }, first: 1)');
      expect(query).toContain('nodes {');
      expect(query).toContain('id');
      expect(query).toContain('databaseId');
      expect(query).toContain('name');
      expect(query).toContain('slug');
      expect(query).toContain('__typename');
      expect(query).toContain('shortDescription');
      expect(query).toContain('description');
      expect(query).toContain('relatedOptions');
    });

    it('should include local and global attributes', () => {
      const { CONFIGURATOR_QUERIES } = require('../src/lib/graphql/configurator');
      const query = CONFIGURATOR_QUERIES.GET_PRODUCT_BY_SLUG;
      
      expect(query).toContain('localAttributes');
      expect(query).toContain('globalAttributes');
      expect(query).toContain('label');
      expect(query).toContain('options');
      expect(query).toContain('terms');
    });

    it('should include image fields', () => {
      const { CONFIGURATOR_QUERIES } = require('../src/lib/graphql/configurator');
      const query = CONFIGURATOR_QUERIES.GET_PRODUCT_BY_SLUG;
      
      expect(query).toContain('image {');
      expect(query).toContain('sourceUrl');
      expect(query).toContain('altText');
      expect(query).toContain('galleryImages(first: 10)');
    });

    it('should include product type fragments', () => {
      const { CONFIGURATOR_QUERIES } = require('../src/lib/graphql/configurator');
      const query = CONFIGURATOR_QUERIES.GET_PRODUCT_BY_SLUG;
      
      expect(query).toContain('... on SimpleProduct');
      expect(query).toContain('... on VariableProduct');
      expect(query).toContain('price');
      expect(query).toContain('regularPrice');
      expect(query).toContain('salePrice');
      expect(query).toContain('sku');
    });

    it('should include variations for variable products', () => {
      const { CONFIGURATOR_QUERIES } = require('../src/lib/graphql/configurator');
      const query = CONFIGURATOR_QUERIES.GET_PRODUCT_BY_SLUG;
      
      expect(query).toContain('variations(first: 50)');
      expect(query).toContain('variableType');
      expect(query).toContain('attributes');
    });
  });

  describe('API Wrapper', () => {
    it('should have getProductBySlug function', () => {
      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      
      expect(configuratorAPI.getProductBySlug).toBeDefined();
      expect(typeof configuratorAPI.getProductBySlug).toBe('function');
    });

    it('should handle empty results gracefully', () => {
      const { configuratorAPI } = require('../src/lib/graphql/configurator');
      
      // Test that the function exists and can be called
      expect(() => configuratorAPI.getProductBySlug('non-existent-slug')).not.toThrow();
    });
  });

  describe('Response Normalization', () => {
    it('should have normalizeSlugQueryResponse function', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      expect(normalizeSlugQueryResponse).toBeDefined();
      expect(typeof normalizeSlugQueryResponse).toBe('function');
    });

    it('should handle null input', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const result = normalizeSlugQueryResponse(null);
      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const result = normalizeSlugQueryResponse(undefined);
      expect(result).toBeNull();
    });

    it('should normalize basic product fields', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        description: 'Test description',
        shortDescription: 'Short description',
        price: 99.99,
        regularPrice: 119.99,
        salePrice: 99.99,
        sku: 'TEST-123',
        image: {
          sourceUrl: 'https://example.com/image.jpg',
          altText: 'Test image'
        },
        galleryImages: {
          nodes: [
            { sourceUrl: 'https://example.com/gallery1.jpg', altText: 'Gallery 1' },
            { sourceUrl: 'https://example.com/gallery2.jpg', altText: 'Gallery 2' }
          ]
        },
        relatedOptions: [1, 2, 3],
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('gid://shopify/Product/123');
      expect(result.databaseId).toBe(123);
      expect(result.name).toBe('Test Product');
      expect(result.slug).toBe('test-product');
      expect(result.title).toBe('Test Product');
      expect(result.description).toBe('Test description');
      expect(result.shortDescription).toBe('Short description');
      expect(result.price).toBe(99.99);
      expect(result.regularPrice).toBe(119.99);
      expect(result.salePrice).toBe(99.99);
      expect(result.sku).toBe('TEST-123');
    });

    it('should normalize related options', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        relatedOptions: [1, 2, 3],
        image: { sourceUrl: '' },
        galleryImages: { nodes: [] },
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result._related_options).toEqual([1, 2, 3]);
    });

    it('should normalize related options from string', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        relatedOptions: '1,2,3',
        image: { sourceUrl: '' },
        galleryImages: { nodes: [] },
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result._related_options).toEqual([1, 2, 3]);
    });

    it('should normalize images', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        image: {
          sourceUrl: 'https://example.com/image.jpg',
          altText: 'Test image'
        },
        galleryImages: {
          nodes: [
            { sourceUrl: 'https://example.com/gallery1.jpg', altText: 'Gallery 1' },
            { sourceUrl: 'https://example.com/gallery2.jpg', altText: 'Gallery 2' }
          ]
        },
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result.featuredImage).toBe('https://example.com/image.jpg');
      expect(result.image.sourceUrl).toBe('https://example.com/image.jpg');
      expect(result.image.altText).toBe('Test image');
      expect(result.productPictures).toEqual([
        'https://example.com/gallery1.jpg',
        'https://example.com/gallery2.jpg'
      ]);
    });

    it('should normalize variations', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'VariableProduct',
        image: { sourceUrl: '' },
        galleryImages: { nodes: [] },
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: {
          nodes: [
            {
              id: 'gid://shopify/ProductVariant/1',
              databaseId: 1,
              name: 'Small',
              price: 99.99,
              regularPrice: 119.99,
              salePrice: 99.99,
              sku: 'TEST-SMALL',
              image: { sourceUrl: 'https://example.com/small.jpg', altText: 'Small variant' },
              attributes: { nodes: [{ id: '1', name: 'Size' }] }
            },
            {
              id: 'gid://shopify/ProductVariant/2',
              databaseId: 2,
              name: 'Large',
              price: 129.99,
              regularPrice: 149.99,
              salePrice: 129.99,
              sku: 'TEST-LARGE',
              image: { sourceUrl: 'https://example.com/large.jpg', altText: 'Large variant' },
              attributes: { nodes: [{ id: '2', name: 'Size' }] }
            }
          ]
        }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result.variations).toHaveLength(2);
      expect(result.variations[0].id).toBe('gid://shopify/ProductVariant/1');
      expect(result.variations[0].databaseId).toBe(1);
      expect(result.variations[0].name).toBe('Small');
      expect(result.variations[0].price).toBe(99.99);
      expect(result.variations[0].sku).toBe('TEST-SMALL');
      expect(result.variations[0].image).toBe('https://example.com/small.jpg');
      expect(result.variations[0].attributes).toEqual([{ id: '1', name: 'Size' }]);
    });

    it('should set configurator-specific fields', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        image: { sourceUrl: '' },
        galleryImages: { nodes: [] },
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result.baseModel).toBe(true);
      expect(result.configuratorCategories).toEqual([]);
      expect(result.compatibilityRules).toEqual([]);
      expect(result.installationRequired).toBe(false);
      expect(result.financingAvailable).toBe(false);
      expect(result.insuranceCoverage).toEqual([]);
      expect(result.safetyRating).toBeUndefined();
      expect(result.adaCompliant).toBe(false);
      expect(result.weightCapacity).toBeUndefined();
    });

    it('should preserve raw data', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        image: { sourceUrl: '' },
        galleryImages: { nodes: [] },
        localAttributes: { nodes: [{ label: 'Color', options: ['Red', 'Blue'] }] },
        globalAttributes: { nodes: [{ label: 'Brand', terms: { nodes: [{ name: 'Nike' }] } }] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result.localAttributes).toEqual([{ label: 'Color', options: ['Red', 'Blue'] }]);
      expect(result.globalAttributes).toEqual([{ label: 'Brand', terms: { nodes: [{ name: 'Nike' }] } }]);
      expect(result.rawData).toBe(mockWooProduct);
    });
  });

  describe('Product Detail Page Integration', () => {
    it('should have updated getServerSideProps', () => {
      const fs = require('fs');
      const path = require('path');
      
      const productDetailPath = path.join(process.cwd(), 'src/pages/product/[slug]/index.tsx');
      const productDetailContent = fs.readFileSync(productDetailPath, 'utf8');
      
      // Check for new slug query implementation
      expect(productDetailContent).toContain('configuratorAPI.getProductBySlug');
      expect(productDetailContent).toContain('normalizeSlugQueryResponse');
      expect(productDetailContent).toContain('slugResult');
    });

    it('should handle slug query errors gracefully', () => {
      const fs = require('fs');
      const path = require('path');
      
      const productDetailPath = path.join(process.cwd(), 'src/pages/product/[slug]/index.tsx');
      const productDetailContent = fs.readFileSync(productDetailPath, 'utf8');
      
      // Check for error handling
      expect(productDetailContent).toContain('slugResult.error');
      expect(productDetailContent).toContain('Product not found');
      expect(productDetailContent).toContain('Product data normalization failed');
    });

    it('should log product information', () => {
      const fs = require('fs');
      const path = require('path');
      
      const productDetailPath = path.join(process.cwd(), 'src/pages/product/[slug]/index.tsx');
      const productDetailContent = fs.readFileSync(productDetailPath, 'utf8');
      
      // Check for logging
      expect(productDetailContent).toContain('Found product via slug query');
      expect(productDetailContent).toContain('Related options');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed relatedOptions', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        relatedOptions: 'invalid-json',
        image: { sourceUrl: '' },
        galleryImages: { nodes: [] },
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      // Should handle gracefully and return empty array
      expect(result._related_options).toEqual([]);
    });

    it('should handle missing image data', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        image: null,
        galleryImages: null,
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result.featuredImage).toBe('');
      expect(result.image).toBeUndefined();
      expect(result.productPictures).toEqual([]);
    });

    it('should handle missing variation data', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'VariableProduct',
        image: { sourceUrl: '' },
        galleryImages: { nodes: [] },
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: null
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      expect(result.variations).toEqual([]);
    });
  });

  describe('Integration with Lazy Loading', () => {
    it('should work with lazy loading implementation', () => {
      const fs = require('fs');
      const path = require('path');
      
      const productDetailPath = path.join(process.cwd(), 'src/pages/product/[slug]/index.tsx');
      const productDetailContent = fs.readFileSync(productDetailPath, 'utf8');
      
      // Check that lazy loading is still integrated
      expect(productDetailContent).toContain('useOptionProductsWithMetrics');
      expect(productDetailContent).toContain('will be loaded client-side');
    });

    it('should preserve related options for lazy loading', () => {
      const { normalizeSlugQueryResponse } = require('../src/lib/graphql/configurator');
      
      const mockWooProduct = {
        id: 'gid://shopify/Product/123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        __typename: 'SimpleProduct',
        relatedOptions: [1, 2, 3],
        image: { sourceUrl: '' },
        galleryImages: { nodes: [] },
        localAttributes: { nodes: [] },
        globalAttributes: { nodes: [] },
        variations: { nodes: [] }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      
      // Should preserve related options for lazy loading
      expect(result._related_options).toEqual([1, 2, 3]);
      expect(result._related_options_products).toEqual([]);
    });
  });
});