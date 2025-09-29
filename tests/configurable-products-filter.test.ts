/**
 * Tests for configurable products filtering functionality
 * Verifies that only products with non-empty relatedOptions are returned
 */

import { describe, it, expect } from 'vitest';
import { filterConfigurableProducts, handleInsufficientConfigurableProducts, getCuratedFallbackProducts } from '../src/lib/utils/data-validation';
import { ProductSchema } from '../src/lib/interfaces/schema';

describe('Configurable Products Filter', () => {
  const mockProducts: ProductSchema[] = [
    {
      id: '1',
      databaseId: 1,
      slug: 'configurable-product-1',
      title: 'Configurable Product 1',
      description: 'A configurable product',
      shortDescription: 'Configurable',
      price: 1000,
      regularPrice: 1200,
      salePrice: null,
      featuredImage: 'image1.jpg',
      galleryImages: [],
      productSpecifications: '',
      relatedOptions: [1, 2, 3], // Has configurable options
      _related_options: [1, 2, 3],
      affiliate: false,
      type: 'simple'
    },
    {
      id: '2',
      databaseId: 2,
      slug: 'non-configurable-product',
      title: 'Non-Configurable Product',
      description: 'A non-configurable product',
      shortDescription: 'Non-configurable',
      price: 500,
      regularPrice: 500,
      salePrice: null,
      featuredImage: 'image2.jpg',
      galleryImages: [],
      productSpecifications: '',
      relatedOptions: [], // Empty options
      _related_options: [],
      affiliate: false,
      type: 'simple'
    },
    {
      id: '3',
      databaseId: 3,
      slug: 'null-options-product',
      title: 'Null Options Product',
      description: 'A product with null options',
      shortDescription: 'Null options',
      price: 750,
      regularPrice: 750,
      salePrice: null,
      featuredImage: 'image3.jpg',
      galleryImages: [],
      productSpecifications: '',
      relatedOptions: null, // Null options
      _related_options: null,
      affiliate: false,
      type: 'simple'
    },
    {
      id: '4',
      databaseId: 4,
      slug: 'configurable-product-2',
      title: 'Configurable Product 2',
      description: 'Another configurable product',
      shortDescription: 'Configurable 2',
      price: 1500,
      regularPrice: 1500,
      salePrice: null,
      featuredImage: 'image4.jpg',
      galleryImages: [],
      productSpecifications: '',
      relatedOptions: [4, 5], // Has configurable options
      _related_options: [4, 5],
      affiliate: false,
      type: 'simple'
    },
    {
      id: '5',
      databaseId: 5,
      slug: 'option-product-1',
      title: 'Option Product 1',
      description: 'An option product (should be excluded)',
      shortDescription: 'Option product',
      price: 200,
      regularPrice: 200,
      salePrice: null,
      featuredImage: 'image5.jpg',
      galleryImages: [],
      productSpecifications: '',
      relatedOptions: [6, 7], // Has configurable options but slug contains 'option'
      _related_options: [6, 7],
      affiliate: false,
      type: 'simple'
    },
    {
      id: '6',
      databaseId: 6,
      slug: 'invalid-product',
      title: '', // Invalid - no title
      description: 'Invalid product',
      shortDescription: 'Invalid',
      price: 300,
      regularPrice: 300,
      salePrice: null,
      featuredImage: 'image5.jpg',
      galleryImages: [],
      productSpecifications: '',
      relatedOptions: [6, 7], // Has options but invalid product
      _related_options: [6, 7],
      affiliate: false,
      type: 'simple'
    }
  ];

  describe('filterConfigurableProducts', () => {
    it('should filter out products without configurable options', () => {
      const result = filterConfigurableProducts(mockProducts);
      
      expect(result).toHaveLength(2);
      expect(result.map(p => p.slug)).toEqual([
        'configurable-product-1',
        'configurable-product-2'
      ]);
    });

    it('should exclude products with empty relatedOptions array', () => {
      const result = filterConfigurableProducts(mockProducts);
      
      expect(result.find(p => p.slug === 'non-configurable-product')).toBeUndefined();
    });

    it('should exclude products with null relatedOptions', () => {
      const result = filterConfigurableProducts(mockProducts);
      
      expect(result.find(p => p.slug === 'null-options-product')).toBeUndefined();
    });

    it('should exclude products with "option" in slug (option products)', () => {
      const result = filterConfigurableProducts(mockProducts);
      
      expect(result.find(p => p.slug === 'option-product-1')).toBeUndefined();
    });

    it('should exclude invalid products (missing title or slug)', () => {
      const result = filterConfigurableProducts(mockProducts);
      
      expect(result.find(p => p.slug === 'invalid-product')).toBeUndefined();
    });

    it('should return empty array when no configurable products exist', () => {
      const nonConfigurableProducts = mockProducts.filter(p => 
        !p.relatedOptions || p.relatedOptions.length === 0
      );
      
      const result = filterConfigurableProducts(nonConfigurableProducts);
      
      expect(result).toHaveLength(0);
    });

    it('should handle empty input array', () => {
      const result = filterConfigurableProducts([]);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('handleInsufficientConfigurableProducts', () => {
    it('should return fallback true when configurable count is less than required', () => {
      const result = handleInsufficientConfigurableProducts(2, 4, 'Test Context');
      
      expect(result.shouldShowFallback).toBe(true);
      expect(result.message).toContain('Limited selection: 2 configurable products available');
    });

    it('should return fallback false when configurable count meets requirement', () => {
      const result = handleInsufficientConfigurableProducts(5, 4, 'Test Context');
      
      expect(result.shouldShowFallback).toBe(false);
      expect(result.message).toBeUndefined();
    });

    it('should provide specific message when no configurable products exist', () => {
      const result = handleInsufficientConfigurableProducts(0, 4, 'Test Context');
      
      expect(result.shouldShowFallback).toBe(true);
      expect(result.message).toContain('No configurable products available');
    });

    it('should provide limited selection message when some products exist', () => {
      const result = handleInsufficientConfigurableProducts(2, 4, 'Test Context');
      
      expect(result.shouldShowFallback).toBe(true);
      expect(result.message).toContain('Limited selection: 2 configurable products available');
    });
  });

  describe('getCuratedFallbackProducts', () => {
    it('should return array of curated product slugs', () => {
      const result = getCuratedFallbackProducts();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(slug => typeof slug === 'string')).toBe(true);
    });

    it('should include expected high-quality product slugs', () => {
      const result = getCuratedFallbackProducts();
      
      expect(result).toContain('vivalift-tranquil-2-plr-935s-lift-chair');
      expect(result).toContain('acorn-stairlifts-acorn-180-curved-stairlift');
      expect(result).toContain('vivalift-ultra-plr4955s-lift-chair');
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with real-world product data structure', () => {
      const realWorldProducts: ProductSchema[] = [
        {
          id: 'product-1',
          databaseId: 101,
          slug: 'acorn-stairlifts-acorn-130-straight-stairlift',
          title: 'Acorn Stairlifts Acorn 130 Straight Stairlift',
          description: 'Professional straight stairlift',
          shortDescription: 'Straight stairlift',
          price: 2500,
          regularPrice: 2500,
          salePrice: null,
          featuredImage: 'stairlift.jpg',
          galleryImages: [],
          productSpecifications: '',
          relatedOptions: [10, 11, 12, 13],
          _related_options: [10, 11, 12, 13],
          affiliate: true,
          type: 'simple'
        },
        {
          id: 'product-2',
          databaseId: 102,
          slug: 'basic-chair',
          title: 'Basic Chair',
          description: 'Basic non-configurable chair',
          shortDescription: 'Basic',
          price: 500,
          regularPrice: 500,
          salePrice: null,
          featuredImage: 'chair.jpg',
          galleryImages: [],
          productSpecifications: '',
          relatedOptions: [],
          _related_options: [],
          affiliate: false,
          type: 'simple'
        }
      ];

      const configurableProducts = filterConfigurableProducts(realWorldProducts);
      const fallbackCheck = handleInsufficientConfigurableProducts(
        configurableProducts.length, 
        4, 
        'Integration Test'
      );

      expect(configurableProducts).toHaveLength(1);
      expect(configurableProducts[0].slug).toBe('acorn-stairlifts-acorn-130-straight-stairlift');
      expect(fallbackCheck.shouldShowFallback).toBe(true);
      expect(fallbackCheck.message).toContain('Limited selection: 1 configurable products available');
    });
  });
});