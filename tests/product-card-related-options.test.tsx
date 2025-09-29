import { describe, it, expect } from 'vitest';
import { ProductCardView, mapToProductCardView } from '../src/lib/interfaces/homepage';
import { ProductSchema } from '../src/lib/interfaces/schema';
import { validateProductCardView } from '../src/lib/utils/data-validation';

describe('ProductCardView RelatedOptions Feature', () => {
  describe('mapToProductCardView', () => {
    it('should populate relatedOptions from _related_options', () => {
      const product: ProductSchema = {
        title: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        shortDescription: 'Short description',
        featuredImage: '/test-image.jpg',
        productSpecifications: 'Test specs',
        productPictures: [],
        price: 1000,
        affiliate: false,
        productId: '123',
        _related_options: [301, 302, 303]
      };

      const result = mapToProductCardView(product);

      expect(result.relatedOptions).toEqual([301, 302, 303]);
      expect(result.optionsSummary).toBe('3 options available');
    });

    it('should handle string relatedOptions', () => {
      const product: ProductSchema = {
        title: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        shortDescription: 'Short description',
        featuredImage: '/test-image.jpg',
        productSpecifications: 'Test specs',
        productPictures: [],
        price: 1000,
        affiliate: false,
        productId: '123',
        _related_options: ['301', '302', 'invalid', '303']
      };

      const result = mapToProductCardView(product);

      expect(result.relatedOptions).toEqual([301, 302, 303]);
      expect(result.optionsSummary).toBe('3 options available');
    });

    it('should handle empty relatedOptions', () => {
      const product: ProductSchema = {
        title: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        shortDescription: 'Short description',
        featuredImage: '/test-image.jpg',
        productSpecifications: 'Test specs',
        productPictures: [],
        price: 1000,
        affiliate: false,
        productId: '123',
        _related_options: []
      };

      const result = mapToProductCardView(product);

      expect(result.relatedOptions).toEqual([]);
      expect(result.optionsSummary).toBeNull();
    });

    it('should handle undefined relatedOptions', () => {
      const product: ProductSchema = {
        title: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        shortDescription: 'Short description',
        featuredImage: '/test-image.jpg',
        productSpecifications: 'Test specs',
        productPictures: [],
        price: 1000,
        affiliate: false,
        productId: '123'
      };

      const result = mapToProductCardView(product);

      expect(result.relatedOptions).toEqual([]);
      expect(result.optionsSummary).toBeNull();
    });

    it('should handle mixed type relatedOptions', () => {
      const product: ProductSchema = {
        title: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        shortDescription: 'Short description',
        featuredImage: '/test-image.jpg',
        productSpecifications: 'Test specs',
        productPictures: [],
        price: 1000,
        affiliate: false,
        productId: '123',
        _related_options: [301, '302', null, undefined, 'invalid', 303]
      };

      const result = mapToProductCardView(product);

      expect(result.relatedOptions).toEqual([301, 302, 303]);
      expect(result.optionsSummary).toBe('3 options available');
    });
  });

  describe('validateProductCardView', () => {
    it('should validate relatedOptions field', () => {
      const validProduct: ProductCardView = {
        slug: 'test-product',
        title: 'Test Product',
        description: 'Test description',
        price: 1000,
        financingCopy: null,
        badges: [],
        imageUrl: '/test-image.jpg',
        rating: null,
        isFeatured: true,
        optionsSummary: '3 options available',
        relatedOptions: [301, 302, 303],
        productId: '123',
        databaseId: 123
      };

      const result = validateProductCardView(validProduct);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error on invalid relatedOptions type', () => {
      const invalidProduct = {
        slug: 'test-product',
        title: 'Test Product',
        description: 'Test description',
        price: 1000,
        financingCopy: null,
        badges: [],
        imageUrl: '/test-image.jpg',
        rating: null,
        isFeatured: true,
        optionsSummary: '3 options available',
        relatedOptions: 'not-an-array', // Invalid type
        productId: '123',
        databaseId: 123
      } as ProductCardView;

      const result = validateProductCardView(invalidProduct);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('relatedOptions must be an array');
    });

    it('should warn on invalid relatedOptions values', () => {
      const productWithInvalidOptions: ProductCardView = {
        slug: 'test-product',
        title: 'Test Product',
        description: 'Test description',
        price: 1000,
        financingCopy: null,
        badges: [],
        imageUrl: '/test-image.jpg',
        rating: null,
        isFeatured: true,
        optionsSummary: '3 options available',
        relatedOptions: [301, 0, -1, 302], // Invalid values: 0, -1
        productId: '123',
        databaseId: 123
      };

      const result = validateProductCardView(productWithInvalidOptions);

      expect(result.isValid).toBe(true); // Still valid, just warnings
      expect(result.warnings).toContain('Invalid relatedOptions values: 0, -1');
    });
  });

  describe('Integration with WooCommerce GraphQL', () => {
    it('should handle GraphQL relatedOptions field', () => {
      // Simulate GraphQL response with relatedOptions field
      const graphqlProduct = {
        id: '123',
        databaseId: 123,
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        shortDescription: 'Short description',
        price: 1000,
        regularPrice: '1000',
        salePrice: null,
        image: { sourceUrl: '/test-image.jpg' },
        galleryImages: { nodes: [] },
        productSpecifications: 'Test specs',
        relatedOptions: [301, 302, 303], // GraphQL field
        _related_options: [301, 302, 303] // Normalized field
      };

      // Simulate the mapping process
      const productSchema: ProductSchema = {
        title: graphqlProduct.name,
        slug: graphqlProduct.slug,
        description: graphqlProduct.description,
        shortDescription: graphqlProduct.shortDescription,
        featuredImage: graphqlProduct.image.sourceUrl,
        productSpecifications: graphqlProduct.productSpecifications,
        productPictures: [],
        price: graphqlProduct.price,
        affiliate: false,
        productId: graphqlProduct.id,
        _related_options: graphqlProduct._related_options
      };

      const result = mapToProductCardView(productSchema);

      expect(result.relatedOptions).toEqual([301, 302, 303]);
      expect(result.optionsSummary).toBe('3 options available');
    });
  });
});