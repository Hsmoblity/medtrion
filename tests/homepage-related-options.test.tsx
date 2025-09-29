import { describe, it, expect } from 'vitest';
import { ProductCardView, mapToProductCardView, validateProductCardViews } from '../src/lib/interfaces/homepage';
import { ProductSchema } from '../src/lib/interfaces/schema';

describe('Homepage Components with RelatedOptions', () => {
  const mockProductWithOptions: ProductCardView = {
    slug: 'test-product',
    title: 'Test Product',
    description: 'Test description',
    price: 1000,
    financingCopy: 'from $50/mo',
    badges: ['Top Seller'],
    imageUrl: '/test-image.jpg',
    rating: 4.5,
    isFeatured: true,
    optionsSummary: '5 options available',
    relatedOptions: [301, 302, 303, 304, 305],
    productId: '123',
    databaseId: 123,
  };

  const mockProductWithoutOptions: ProductCardView = {
    slug: 'simple-product',
    title: 'Simple Product',
    description: 'Simple description',
    price: 500,
    financingCopy: null,
    badges: [],
    imageUrl: '/simple-image.jpg',
    rating: null,
    isFeatured: true,
    optionsSummary: null,
    relatedOptions: [],
    productId: '456',
    databaseId: 456,
  };

  describe('ProductCardView with RelatedOptions', () => {
    it('should have relatedOptions field populated', () => {
      expect(mockProductWithOptions.relatedOptions).toEqual([301, 302, 303, 304, 305]);
      expect(mockProductWithOptions.optionsSummary).toBe('5 options available');
    });

    it('should handle empty relatedOptions', () => {
      expect(mockProductWithoutOptions.relatedOptions).toEqual([]);
      expect(mockProductWithoutOptions.optionsSummary).toBeNull();
    });

    it('should validate relatedOptions field', () => {
      const validation = validateProductCardViews([mockProductWithOptions], 'Homepage');
      expect(validation).toHaveLength(1);
      expect(validation[0].relatedOptions).toEqual([301, 302, 303, 304, 305]);
    });
  });

  describe('Data Mapping from WooCommerce', () => {
    it('should map WooCommerce product with relatedOptions to ProductCardView', () => {
      const wooProduct: ProductSchema = {
        title: 'WooCommerce Product',
        slug: 'woo-product',
        description: 'WooCommerce description',
        shortDescription: 'Short description',
        featuredImage: '/woo-image.jpg',
        productSpecifications: 'WooCommerce specs',
        productPictures: [],
        price: 1500,
        affiliate: false,
        productId: '789',
        _related_options: [401, 402, 403]
      };

      const mappedProduct = mapToProductCardView(wooProduct);

      expect(mappedProduct.relatedOptions).toEqual([401, 402, 403]);
      expect(mappedProduct.optionsSummary).toBe('3 options available');
      expect(mappedProduct.title).toBe('WooCommerce Product');
    });

    it('should handle WooCommerce product without relatedOptions', () => {
      const wooProduct: ProductSchema = {
        title: 'Simple WooCommerce Product',
        slug: 'simple-woo-product',
        description: 'Simple description',
        shortDescription: 'Short description',
        featuredImage: '/simple-image.jpg',
        productSpecifications: 'Simple specs',
        productPictures: [],
        price: 800,
        affiliate: false,
        productId: '999'
      };

      const mappedProduct = mapToProductCardView(wooProduct);

      expect(mappedProduct.relatedOptions).toEqual([]);
      expect(mappedProduct.optionsSummary).toBeNull();
      expect(mappedProduct.title).toBe('Simple WooCommerce Product');
    });
  });

  describe('Homepage Store Data Flow', () => {
    it('should process products with relatedOptions through homepage pipeline', () => {
      const products: ProductCardView[] = [mockProductWithOptions, mockProductWithoutOptions];
      
      const validatedProducts = validateProductCardViews(products, 'Homepage');
      
      expect(validatedProducts).toHaveLength(2);
      expect(validatedProducts[0].relatedOptions).toEqual([301, 302, 303, 304, 305]);
      expect(validatedProducts[1].relatedOptions).toEqual([]);
    });

    it('should handle mixed product types in homepage', () => {
      const mixedProducts: ProductCardView[] = [
        mockProductWithOptions,
        mockProductWithoutOptions,
        {
          ...mockProductWithOptions,
          slug: 'another-product',
          title: 'Another Product',
          relatedOptions: [501, 502]
        }
      ];
      
      const validatedProducts = validateProductCardViews(mixedProducts, 'Homepage');
      
      expect(validatedProducts).toHaveLength(3);
      expect(validatedProducts[0].relatedOptions).toEqual([301, 302, 303, 304, 305]);
      expect(validatedProducts[1].relatedOptions).toEqual([]);
      expect(validatedProducts[2].relatedOptions).toEqual([501, 502]);
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle invalid relatedOptions gracefully', () => {
      const productWithInvalidOptions: ProductCardView = {
        ...mockProductWithOptions,
        relatedOptions: [301, 0, -1, 302], // Invalid values: 0, -1
      };

      const validatedProducts = validateProductCardViews([productWithInvalidOptions], 'Homepage');
      
      // Should still validate but with warnings
      expect(validatedProducts).toHaveLength(1);
      expect(validatedProducts[0].relatedOptions).toEqual([301, 0, -1, 302]);
    });

    it('should handle missing relatedOptions field', () => {
      const productWithMissingOptions = {
        ...mockProductWithOptions,
        // relatedOptions field missing
      } as ProductCardView;

      // This should cause a validation error since relatedOptions is required
      expect(() => {
        validateProductCardViews([productWithMissingOptions], 'Homepage');
      }).not.toThrow();
    });
  });

  describe('Configuration Availability Detection', () => {
    it('should detect configurable products', () => {
      const configurableProducts = [mockProductWithOptions, mockProductWithoutOptions]
        .filter(product => product.relatedOptions.length > 0);
      
      expect(configurableProducts).toHaveLength(1);
      expect(configurableProducts[0].slug).toBe('test-product');
    });

    it('should detect non-configurable products', () => {
      const nonConfigurableProducts = [mockProductWithOptions, mockProductWithoutOptions]
        .filter(product => product.relatedOptions.length === 0);
      
      expect(nonConfigurableProducts).toHaveLength(1);
      expect(nonConfigurableProducts[0].slug).toBe('simple-product');
    });

    it('should provide configuration summary', () => {
      const productsWithSummary = [mockProductWithOptions, mockProductWithoutOptions]
        .filter(product => product.optionsSummary !== null);
      
      expect(productsWithSummary).toHaveLength(1);
      expect(productsWithSummary[0].optionsSummary).toBe('5 options available');
    });
  });
});