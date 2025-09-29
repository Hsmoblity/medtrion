/**
 * Test suite for product sanitization utilities
 * Ensures SSR serialization compatibility for Next.js
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  sanitizeProductForSSR, 
  sanitizeConfigurableProduct, 
  sanitizeSSRProps,
  isSSRSerializable 
} from '../../../src/lib/utils/product-sanitizer';

describe('Product Sanitizer', () => {
  describe('sanitizeProductForSSR', () => {
    it('should convert undefined values to null', () => {
      const input = {
        name: 'Test Product',
        price: 100,
        salePrice: undefined,
        sku: undefined,
        description: 'Valid description'
      };

      const result = sanitizeProductForSSR(input);

      expect(result.name).toBe('Test Product');
      expect(result.price).toBe(100);
      expect(result.salePrice).toBe(null);
      expect(result.sku).toBe(null);
      expect(result.description).toBe('Valid description');
    });

    it('should handle nested objects with undefined values', () => {
      const input = {
        product: {
          name: 'Test',
          metadata: {
            color: 'red',
            weight: undefined,
            dimensions: {
              width: 10,
              height: undefined
            }
          }
        }
      };

      const result = sanitizeProductForSSR(input);

      expect(result.product.name).toBe('Test');
      expect(result.product.metadata.color).toBe('red');
      expect(result.product.metadata.weight).toBe(null);
      expect(result.product.metadata.dimensions.width).toBe(10);
      expect(result.product.metadata.dimensions.height).toBe(null);
    });

    it('should handle arrays with undefined values', () => {
      const input = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: undefined },
          { id: undefined, name: 'Item 3' }
        ]
      };

      const result = sanitizeProductForSSR(input);

      expect(result.items[0]).toEqual({ id: 1, name: 'Item 1' });
      expect(result.items[1]).toEqual({ id: 2, name: null });
      expect(result.items[2]).toEqual({ id: null, name: 'Item 3' });
    });

    it('should handle primitive values correctly', () => {
      expect(sanitizeProductForSSR(undefined)).toBe(null);
      expect(sanitizeProductForSSR(null)).toBe(null);
      expect(sanitizeProductForSSR('string')).toBe('string');
      expect(sanitizeProductForSSR(42)).toBe(42);
      expect(sanitizeProductForSSR(true)).toBe(true);
      expect(sanitizeProductForSSR(false)).toBe(false);
    });
  });

  describe('sanitizeConfigurableProduct', () => {
    it('should sanitize a configurable product model', () => {
      const mockProduct = {
        id: 'test-product',
        name: 'Test Stairlift',
        price: 2500,
        salePrice: undefined,
        sku: undefined,
        databaseId: undefined,
        safetyRating: undefined,
        weightCapacity: undefined,
        image: undefined,
        configuratorCategories: [],
        compatibilityRules: [],
        insuranceCoverage: [],
        productPictures: [],
        variations: [],
        options: [],
        _related_options: [],
        _related_options_products: []
      };

      const result = sanitizeConfigurableProduct(mockProduct as any);

      expect(result.id).toBe('test-product');
      expect(result.name).toBe('Test Stairlift');
      expect(result.price).toBe(2500);
      expect(result.salePrice).toBe(null);
      expect(result.sku).toBe(null);
      expect(result.databaseId).toBe(null);
      expect(result.safetyRating).toBe(null);
      expect(result.weightCapacity).toBe(null);
      expect(result.image).toBe(null);
    });
  });

  describe('sanitizeSSRProps', () => {
    it('should sanitize props object for getServerSideProps', () => {
      const props = {
        baseModel: {
          name: 'Test Product',
          salePrice: undefined,
          options: [
            { id: 1, value: undefined }
          ]
        },
        categories: [],
        error: null,
        metadata: undefined
      };

      const result = sanitizeSSRProps(props);

      expect(result.baseModel.name).toBe('Test Product');
      expect(result.baseModel.salePrice).toBe(null);
      expect(result.baseModel.options[0].value).toBe(null);
      expect(result.categories).toEqual([]);
      expect(result.error).toBe(null);
      expect(result.metadata).toBe(null);
    });
  });

  describe('isSSRSerializable', () => {
    it('should correctly identify serializable values', () => {
      expect(isSSRSerializable(null)).toBe(true);
      expect(isSSRSerializable('string')).toBe(true);
      expect(isSSRSerializable(42)).toBe(true);
      expect(isSSRSerializable(true)).toBe(true);
      expect(isSSRSerializable([])).toBe(true);
      expect(isSSRSerializable({})).toBe(true);
      
      expect(isSSRSerializable(undefined)).toBe(false);
      expect(isSSRSerializable(() => {})).toBe(false);
      expect(isSSRSerializable(Symbol('test'))).toBe(false);
    });

    it('should check nested objects and arrays', () => {
      expect(isSSRSerializable({ name: 'test', price: 100 })).toBe(true);
      expect(isSSRSerializable({ name: 'test', fn: () => {} })).toBe(false);
      expect(isSSRSerializable({ name: 'test', value: undefined })).toBe(false);
      
      expect(isSSRSerializable([1, 2, 3])).toBe(true);
      expect(isSSRSerializable(['a', 'b', undefined])).toBe(false);
      expect(isSSRSerializable([{ id: 1 }, { id: 2 }])).toBe(true);
      expect(isSSRSerializable([{ id: 1 }, { fn: () => {} }])).toBe(false);
    });
  });

  describe('Real-world configurator scenarios', () => {
    it('should handle typical product data from Contentful', () => {
      const contentfulProduct = {
        productId: '123',
        title: 'Acorn 130 Stairlift',
        price: '2500',
        description: 'Premium stairlift solution',
        featuredImage: 'https://example.com/image.jpg',
        salePrice: undefined, // This causes SSR errors
        sku: undefined,
        affiliate: false,
        productPictures: [],
        variations: [],
        options: [],
        _related_options: [],
        _related_options_products: []
      };

      // Simulate the configure page baseModel creation
      const baseModel = {
        id: contentfulProduct.productId,
        name: contentfulProduct.title,
        price: parseFloat(contentfulProduct.price),
        salePrice: undefined, // This is the problematic line
        sku: undefined,
        description: contentfulProduct.description,
        featuredImage: contentfulProduct.featuredImage,
        affiliate: contentfulProduct.affiliate,
        productPictures: contentfulProduct.productPictures,
        variations: contentfulProduct.variations,
        options: contentfulProduct.options,
        _related_options: contentfulProduct._related_options,
        _related_options_products: contentfulProduct._related_options_products
      };

      const sanitized = sanitizeConfigurableProduct(baseModel as any);

      // Verify all undefined values are now null (SSR-safe)
      expect(sanitized.salePrice).toBe(null);
      expect(sanitized.sku).toBe(null);
      expect(isSSRSerializable(sanitized)).toBe(true);
    });

    it('should handle getServerSideProps return structure', () => {
      const serverSideProps = {
        baseModel: {
          id: 'test',
          salePrice: undefined,
          weightCapacity: undefined
        },
        categories: [],
        seoMeta: {
          title: 'Configure Product',
          description: undefined
        },
        isEditMode: false,
        editSessionData: null,
        error: null
      };

      const sanitized = sanitizeSSRProps(serverSideProps);

      expect(isSSRSerializable(sanitized)).toBe(true);
      expect(sanitized.baseModel.salePrice).toBe(null);
      expect(sanitized.baseModel.weightCapacity).toBe(null);
      expect(sanitized.seoMeta.description).toBe(null);
    });
  });
});