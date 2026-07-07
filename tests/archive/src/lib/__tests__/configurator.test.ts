/**
 * Tests for configurator GraphQL mapping functions
 * 
 * Tests the variation image mapping fix to ensure proper object structure
 */

import { normalizeSlugQueryResponse } from '../graphql/configurator';

describe('Configurator GraphQL Mapping', () => {
  describe('normalizeSlugQueryResponse', () => {
    it('should map variation images to proper object structure with sourceUrl and altText', () => {
      // Mock WooCommerce product data with variations
      const mockWooProduct = {
        id: '1',
        name: 'Test Product',
        price: '100.00',
        variations: {
          nodes: [
            {
              id: 'variation-1',
              databaseId: 101,
              name: 'Red Variation',
              price: '120.00',
              sku: 'RED-VAR-001',
              image: {
                sourceUrl: 'https://example.com/red-variation.jpg',
                altText: 'Red variation product image'
              },
              attributes: {
                nodes: [
                  {
                    id: 'color-attr',
                    name: 'Color',
                    value: 'Red'
                  }
                ]
              }
            },
            {
              id: 'variation-2',
              databaseId: 102,
              name: 'Blue Variation',
              price: '110.00',
              sku: 'BLUE-VAR-001',
              image: {
                sourceUrl: 'https://example.com/blue-variation.jpg',
                altText: null // Test missing altText
              },
              attributes: {
                nodes: [
                  {
                    id: 'color-attr',
                    name: 'Color',
                    value: 'Blue'
                  }
                ]
              }
            },
            {
              id: 'variation-3',
              databaseId: 103,
              name: 'Green Variation',
              price: '115.00',
              sku: 'GREEN-VAR-001',
              image: null, // Test missing image
              attributes: {
                nodes: [
                  {
                    id: 'color-attr',
                    name: 'Color',
                    value: 'Green'
                  }
                ]
              }
            }
          ]
        }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);

      // Test first variation with complete image data
      expect(result.variations[0].image).toEqual({
        sourceUrl: 'https://example.com/red-variation.jpg',
        altText: 'Red variation product image'
      });

      // Test second variation with missing altText (should fallback to variation name)
      expect(result.variations[1].image).toEqual({
        sourceUrl: 'https://example.com/blue-variation.jpg',
        altText: 'Blue Variation'
      });

      // Test third variation with missing image (should be undefined)
      expect(result.variations[2].image).toBeUndefined();
    });

    it('should handle variations with empty image sourceUrl', () => {
      const mockWooProduct = {
        id: '1',
        name: 'Test Product',
        price: '100.00',
        variations: {
          nodes: [
            {
              id: 'variation-1',
              databaseId: 101,
              name: 'Empty Image Variation',
              price: '100.00',
              sku: 'EMPTY-001',
              image: {
                sourceUrl: '',
                altText: 'Empty image'
              },
              attributes: { nodes: [] }
            }
          ]
        }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      expect(result.variations[0].image).toBeUndefined();
    });

    it('should handle variations with missing image object', () => {
      const mockWooProduct = {
        id: '1',
        name: 'Test Product',
        price: '100.00',
        variations: {
          nodes: [
            {
              id: 'variation-1',
              databaseId: 101,
              name: 'No Image Variation',
              price: '100.00',
              sku: 'NO-IMG-001',
              image: undefined,
              attributes: { nodes: [] }
            }
          ]
        }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      expect(result.variations[0].image).toBeUndefined();
    });

    it('should handle variations with no name fallback for altText', () => {
      const mockWooProduct = {
        id: '1',
        name: 'Test Product',
        price: '100.00',
        variations: {
          nodes: [
            {
              id: 'variation-1',
              databaseId: 101,
              name: '',
              price: '100.00',
              sku: 'NO-NAME-001',
              image: {
                sourceUrl: 'https://example.com/image.jpg',
                altText: null
              },
              attributes: { nodes: [] }
            }
          ]
        }
      };

      const result = normalizeSlugQueryResponse(mockWooProduct);
      expect(result.variations[0].image).toEqual({
        sourceUrl: 'https://example.com/image.jpg',
        altText: 'Product variation image'
      });
    });
  });
});