import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import Item from '../src/components/PageLayout/Cart/Item';
import BaseProductCard from '../src/components/Cart/BaseProductCard';
import { CartProduct } from '../src/lib/interfaces/cart';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the cart store
jest.mock('../src/stores/cartStore', () => ({
  useCartStore: jest.fn(() => ({
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    setEditStatus: jest.fn(),
  })),
  useEditStatus: jest.fn(() => 'idle'),
}));

// Mock the session context
jest.mock('../src/contexts/SessionContext', () => ({
  useSession: jest.fn(() => ({
    startEditSession: jest.fn(),
    addNotification: jest.fn(),
  })),
}));

describe('Cart View More Functionality', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    asPath: '/cart',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  describe('Cart Item Component', () => {
    const mockProduct: CartProduct = {
      cartItemId: 'ci_test123',
      slug: 'test-product-slug',
      title: 'Test Product',
      description: 'Test product description',
      shortDescription: 'Short description',
      price: 1000,
      quantity: 1,
      productPictures: [],
      featuredImage: '/test-image.jpg',
      productSpecifications: '',
      affiliate: false,
    };

    it('should render View More link when slug is present', () => {
      render(<Item product={mockProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      expect(viewMoreLink).toBeInTheDocument();
      expect(viewMoreLink).toHaveAttribute('href', '/product/test-product-slug');
    });

    it('should navigate to product detail page when View More is clicked', () => {
      render(<Item product={mockProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      fireEvent.click(viewMoreLink);

      expect(mockPush).toHaveBeenCalledWith('/product/test-product-slug');
    });

    it('should show fallback message when slug is missing', () => {
      const productWithoutSlug = { ...mockProduct, slug: '' };
      render(<Item product={productWithoutSlug} />);

      expect(screen.getByText('Product details unavailable')).toBeInTheDocument();
      expect(screen.queryByText('View More →')).not.toBeInTheDocument();
    });

    it('should show fallback message when slug is null', () => {
      const productWithoutSlug = { ...mockProduct, slug: null as any };
      render(<Item product={productWithoutSlug} />);

      expect(screen.getByText('Product details unavailable')).toBeInTheDocument();
      expect(screen.queryByText('View More →')).not.toBeInTheDocument();
    });

    it('should prevent default link behavior and use router navigation', () => {
      render(<Item product={mockProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      fireEvent.click(viewMoreLink, clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/product/test-product-slug');
    });
  });

  describe('Base Product Card Component', () => {
    const mockProduct: CartProduct = {
      cartItemId: 'ci_test123',
      slug: 'test-product-slug',
      title: 'Test Product',
      description: 'Test product description',
      shortDescription: 'Short description',
      price: 1000,
      quantity: 1,
      productPictures: [],
      featuredImage: '/test-image.jpg',
      productSpecifications: '',
      affiliate: false,
    };

    it('should render View More link when slug is present', () => {
      render(<BaseProductCard product={mockProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      expect(viewMoreLink).toBeInTheDocument();
      expect(viewMoreLink).toHaveAttribute('href', '/product/test-product-slug');
    });

    it('should navigate to product detail page when View More is clicked', () => {
      render(<BaseProductCard product={mockProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      fireEvent.click(viewMoreLink);

      expect(mockPush).toHaveBeenCalledWith('/product/test-product-slug');
    });

    it('should show fallback message when slug is missing', () => {
      const productWithoutSlug = { ...mockProduct, slug: '' };
      render(<BaseProductCard product={productWithoutSlug} />);

      expect(screen.getByText('Product details unavailable')).toBeInTheDocument();
      expect(screen.queryByText('View More →')).not.toBeInTheDocument();
    });

    it('should show fallback message when slug is null', () => {
      const productWithoutSlug = { ...mockProduct, slug: null as any };
      render(<BaseProductCard product={productWithoutSlug} />);

      expect(screen.getByText('Product details unavailable')).toBeInTheDocument();
      expect(screen.queryByText('View More →')).not.toBeInTheDocument();
    });
  });

  describe('Cart Item Data Validation', () => {
    it('should handle products with valid slug data', () => {
      const validProduct: CartProduct = {
        cartItemId: 'ci_valid123',
        slug: 'acorn-stairlifts-acorn-180-curved-stairlift',
        title: 'Acorn 180 Curved Stairlift',
        description: 'Premium curved stairlift',
        shortDescription: 'Curved stairlift',
        price: 15000,
        quantity: 1,
        productPictures: [],
        featuredImage: '/acorn-stairlift.jpg',
        productSpecifications: '',
        affiliate: false,
      };

      render(<Item product={validProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      expect(viewMoreLink).toHaveAttribute('href', '/product/acorn-stairlifts-acorn-180-curved-stairlift');
    });

    it('should handle products with complex slug data', () => {
      const complexProduct: CartProduct = {
        cartItemId: 'ci_complex123',
        slug: 'vivalift-tranquil-2-plr-935s-lift-chair',
        title: 'VivaLift Tranquil 2 PLR 935S Lift Chair',
        description: 'Advanced lift chair with multiple features',
        shortDescription: 'Lift chair',
        price: 2500,
        quantity: 2,
        productPictures: [],
        featuredImage: '/vivalift-chair.jpg',
        productSpecifications: '',
        affiliate: false,
        options: [
          {
            name: 'Extended Warranty',
            type: 'checkbox',
            priceModifier: 200,
            selected: true,
            quantity: 1,
            value: 'warranty-001'
          }
        ]
      };

      render(<Item product={complexProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      expect(viewMoreLink).toHaveAttribute('href', '/product/vivalift-tranquil-2-plr-935s-lift-chair');
    });

    it('should handle products with missing or invalid slug gracefully', () => {
      const invalidProducts = [
        { ...mockProduct, slug: undefined },
        { ...mockProduct, slug: null },
        { ...mockProduct, slug: '' },
        { ...mockProduct, slug: '   ' },
      ];

      invalidProducts.forEach((product, index) => {
        const { unmount } = render(<Item product={product} />);
        
        expect(screen.getByText('Product details unavailable')).toBeInTheDocument();
        expect(screen.queryByText('View More →')).not.toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Navigation Integration', () => {
    it('should handle router navigation errors gracefully', () => {
      const mockRouterWithError = {
        push: jest.fn().mockRejectedValue(new Error('Navigation failed')),
        asPath: '/cart',
      };
      (useRouter as jest.Mock).mockReturnValue(mockRouterWithError);

      const mockProduct: CartProduct = {
        cartItemId: 'ci_test123',
        slug: 'test-product-slug',
        title: 'Test Product',
        description: 'Test product description',
        shortDescription: 'Short description',
        price: 1000,
        quantity: 1,
        productPictures: [],
        featuredImage: '/test-image.jpg',
        productSpecifications: '',
        affiliate: false,
      };

      render(<Item product={mockProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      
      // Should not throw error when navigation fails
      expect(() => fireEvent.click(viewMoreLink)).not.toThrow();
    });

    it('should maintain cart state during navigation', () => {
      const mockProduct: CartProduct = {
        cartItemId: 'ci_test123',
        slug: 'test-product-slug',
        title: 'Test Product',
        description: 'Test product description',
        shortDescription: 'Short description',
        price: 1000,
        quantity: 1,
        productPictures: [],
        featuredImage: '/test-image.jpg',
        productSpecifications: '',
        affiliate: false,
      };

      render(<Item product={mockProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      fireEvent.click(viewMoreLink);

      // Cart item should still be rendered after navigation attempt
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/product/test-product-slug');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility attributes for View More link', () => {
      const mockProduct: CartProduct = {
        cartItemId: 'ci_test123',
        slug: 'test-product-slug',
        title: 'Test Product',
        description: 'Test product description',
        shortDescription: 'Short description',
        price: 1000,
        quantity: 1,
        productPictures: [],
        featuredImage: '/test-image.jpg',
        productSpecifications: '',
        affiliate: false,
      };

      render(<Item product={mockProduct} />);

      const viewMoreLink = screen.getByText('View More →');
      expect(viewMoreLink).toHaveAttribute('href', '/product/test-product-slug');
      expect(viewMoreLink).toHaveClass('text-sm', 'text-brand-primary', 'hover:text-brand-dark', 'hover:underline');
    });

    it('should have proper accessibility attributes for fallback message', () => {
      const productWithoutSlug = {
        cartItemId: 'ci_test123',
        slug: '',
        title: 'Test Product',
        description: 'Test product description',
        shortDescription: 'Short description',
        price: 1000,
        quantity: 1,
        productPictures: [],
        featuredImage: '/test-image.jpg',
        productSpecifications: '',
        affiliate: false,
      };

      render(<Item product={productWithoutSlug} />);

      const fallbackMessage = screen.getByText('Product details unavailable');
      expect(fallbackMessage).toHaveClass('text-sm', 'text-gray-400', 'font-medium');
    });
  });
});