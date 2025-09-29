/**
 * Tests for shop page configurable products filtering
 * Verifies that the shop page correctly filters and handles configurable products
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest';
import { getServerSideProps } from '../src/pages/products/index';
import { getProducts } from '../src/lib/contentful/contentful';

// Mock the contentful functions
jest.mock('../src/lib/contentful/contentful', () => ({
  getProducts: jest.fn()
}));

describe('Shop Page Configurable Products', () => {
  const mockProductsData = {
    items: [
      {
        id: '1',
        databaseId: 1,
        slug: 'vivalift-tranquil-2-plr-935s-lift-chair',
        title: 'Vivalift Tranquil 2 PLR 935S Lift Chair',
        description: 'Premium lift chair',
        shortDescription: 'Premium',
        price: 2000,
        regularPrice: 2000,
        salePrice: null,
        featuredImage: 'chair1.jpg',
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
        slug: 'acorn-stairlifts-acorn-180-curved-stairlift',
        title: 'Acorn Stairlifts Acorn 180 Curved Stairlift',
        description: 'Curved stairlift',
        shortDescription: 'Curved',
        price: 3000,
        regularPrice: 3000,
        salePrice: null,
        featuredImage: 'stairlift1.jpg',
        galleryImages: [],
        productSpecifications: '',
        relatedOptions: [4, 5], // Has configurable options
        _related_options: [4, 5],
        affiliate: true,
        type: 'simple'
      },
      {
        id: '3',
        databaseId: 3,
        slug: 'basic-product',
        title: 'Basic Product',
        description: 'Basic non-configurable product',
        shortDescription: 'Basic',
        price: 500,
        regularPrice: 500,
        salePrice: null,
        featuredImage: 'basic.jpg',
        galleryImages: [],
        productSpecifications: '',
        relatedOptions: [], // No configurable options
        _related_options: [],
        affiliate: false,
        type: 'simple'
      },
      {
        id: '4',
        databaseId: 4,
        slug: 'vivalift-ultra-plr4955s-lift-chair',
        title: 'Vivalift Ultra PLR4955S Lift Chair',
        description: 'Ultra lift chair',
        shortDescription: 'Ultra',
        price: 2500,
        regularPrice: 2500,
        salePrice: null,
        featuredImage: 'chair2.jpg',
        galleryImages: [],
        productSpecifications: '',
        relatedOptions: [6, 7, 8], // Has configurable options
        _related_options: [6, 7, 8],
        affiliate: false,
        type: 'simple'
      },
      {
        id: '5',
        databaseId: 5,
        slug: 'acorn-stairlifts-acorn-130-straight-stairlift',
        title: 'Acorn Stairlifts Acorn 130 Straight Stairlift',
        description: 'Straight stairlift',
        shortDescription: 'Straight',
        price: 2200,
        regularPrice: 2200,
        salePrice: null,
        featuredImage: 'stairlift2.jpg',
        galleryImages: [],
        productSpecifications: '',
        relatedOptions: [9, 10], // Has configurable options
        _related_options: [9, 10],
        affiliate: true,
        type: 'simple'
      },
      {
        id: '6',
        databaseId: 6,
        slug: 'null-options-product',
        title: 'Null Options Product',
        description: 'Product with null options',
        shortDescription: 'Null',
        price: 800,
        regularPrice: 800,
        salePrice: null,
        featuredImage: 'null.jpg',
        galleryImages: [],
        productSpecifications: '',
        relatedOptions: null, // Null options
        _related_options: null,
        affiliate: false,
        type: 'simple'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.warn to avoid test output noise
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getServerSideProps', () => {
    it('should filter for configurable products only', async () => {
      (getProducts as jest.Mock).mockResolvedValue(mockProductsData);

      const result = await getServerSideProps({} as any);

      expect(result.props.products).toHaveLength(4); // Only configurable products
      expect(result.props.products.map((p: any) => p.slug)).toEqual([
        'vivalift-tranquil-2-plr-935s-lift-chair',
        'acorn-stairlifts-acorn-180-curved-stairlift',
        'vivalift-ultra-plr4955s-lift-chair',
        'acorn-stairlifts-acorn-130-straight-stairlift'
      ]);
    });

    it('should prioritize curated products when available', async () => {
      (getProducts as jest.Mock).mockResolvedValue(mockProductsData);

      const result = await getServerSideProps({} as any);

      // Should include curated products first
      const productSlugs = result.props.products.map((p: any) => p.slug);
      expect(productSlugs).toContain('vivalift-tranquil-2-plr-935s-lift-chair');
      expect(productSlugs).toContain('acorn-stairlifts-acorn-180-curved-stairlift');
      expect(productSlugs).toContain('vivalift-ultra-plr4955s-lift-chair');
      expect(productSlugs).toContain('acorn-stairlifts-acorn-130-straight-stairlift');
    });

    it('should log warning when insufficient configurable products', async () => {
      // Mock with only 2 configurable products (need 10)
      const limitedProductsData = {
        items: mockProductsData.items.slice(0, 2) // Only first 2 products
      };
      
      (getProducts as jest.Mock).mockResolvedValue(limitedProductsData);

      const consoleSpy = jest.spyOn(console, 'warn');
      
      const result = await getServerSideProps({} as any);

      // Should log warning about insufficient products
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Only 2 configurable products found')
      );
      
      // Should still return available products
      expect(result.props.products).toHaveLength(2);
    });

    it('should handle empty configurable products gracefully', async () => {
      // Mock with no configurable products
      const noConfigurableProductsData = {
        items: mockProductsData.items.filter(p => !p.relatedOptions || p.relatedOptions.length === 0)
      };
      
      (getProducts as jest.Mock).mockResolvedValue(noConfigurableProductsData);

      const consoleSpy = jest.spyOn(console, 'warn');
      
      const result = await getServerSideProps({} as any);

      // Should log warning about no configurable products
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Only 0 configurable products found')
      );
      
      // Should return empty products array
      expect(result.props.products).toHaveLength(0);
    });

    it('should handle API error gracefully', async () => {
      (getProducts as jest.Mock).mockResolvedValue({
        error: 'API Error'
      });

      const result = await getServerSideProps({} as any);

      expect(result.props.error).toBe('Unable to load products at this time. Please try again later.');
      expect(result.props.products).toHaveLength(0);
    });

    it('should handle complete failure gracefully', async () => {
      (getProducts as jest.Mock).mockRejectedValue(new Error('Network Error'));

      const result = await getServerSideProps({} as any);

      expect(result.props.error).toBe('Unable to load products at this time. Please try again later.');
      expect(result.props.products).toHaveLength(0);
    });

    it('should sanitize data for SSR', async () => {
      (getProducts as jest.Mock).mockResolvedValue(mockProductsData);

      const result = await getServerSideProps({} as any);

      // Should have products
      expect(result.props.products).toHaveLength(4);
      
      // Each product should have required fields
      result.props.products.forEach((product: any) => {
        expect(product.slug).toBeDefined();
        expect(product.title).toBeDefined();
        expect(product.relatedOptions).toBeDefined();
        expect(Array.isArray(product.relatedOptions)).toBe(true);
        expect(product.relatedOptions.length).toBeGreaterThan(0);
      });
    });

    it('should limit to 10 products maximum', async () => {
      // Create more than 10 configurable products
      const manyProductsData = {
        items: Array.from({ length: 15 }, (_, i) => ({
          id: `product-${i}`,
          databaseId: i + 1,
          slug: `product-${i}`,
          title: `Product ${i}`,
          description: `Product ${i} description`,
          shortDescription: `Product ${i}`,
          price: 1000 + i * 100,
          regularPrice: 1000 + i * 100,
          salePrice: null,
          featuredImage: `product-${i}.jpg`,
          galleryImages: [],
          productSpecifications: '',
          relatedOptions: [i + 1, i + 2], // All have configurable options
          _related_options: [i + 1, i + 2],
          affiliate: false,
          type: 'simple'
        }))
      };
      
      (getProducts as jest.Mock).mockResolvedValue(manyProductsData);

      const result = await getServerSideProps({} as any);

      // Should limit to 10 products
      expect(result.props.products).toHaveLength(10);
    });
  });

  describe('Product Mapping', () => {
    it('should correctly map configurable products to ProductCardView format', async () => {
      (getProducts as jest.Mock).mockResolvedValue(mockProductsData);

      const result = await getServerSideProps({} as any);

      // Check that products are properly mapped
      const product = result.props.products[0];
      expect(product).toHaveProperty('slug');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('imageUrl');
      expect(product).toHaveProperty('relatedOptions');
      expect(Array.isArray(product.relatedOptions)).toBe(true);
    });

    it('should preserve configurable options in mapped products', async () => {
      (getProducts as jest.Mock).mockResolvedValue(mockProductsData);

      const result = await getServerSideProps({} as any);

      // Check that configurable options are preserved
      result.props.products.forEach((product: any) => {
        expect(product.relatedOptions).toBeDefined();
        expect(Array.isArray(product.relatedOptions)).toBe(true);
        expect(product.relatedOptions.length).toBeGreaterThan(0);
      });
    });
  });
});