import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../src/stores/cartStore';
import { CartProduct } from '../../src/lib/interfaces';

// Mock cart product for testing
const mockCartProduct: CartProduct = {
  cartItemId: 'test-123',
  slug: 'test-stairlift',
  title: 'Test Stairlift',
  description: 'A test stairlift for testing purposes',
  shortDescription: 'Test stairlift',
  featuredImage: '/test.jpg',
  productSpecifications: 'Test specifications',
  price: 1000,
  quantity: 1,
  productId: 'prod-123',
  productPictures: [],
  variationId: null,
  options: [],
  affiliate: false
};

describe('Cart Store Integration Tests', () => {
  beforeEach(() => {
    // Clear cart before each test
    useCartStore.getState().clearCart();
  });

  it('should add product to cart', () => {
    const { addToCart, cart } = useCartStore.getState();
    
    addToCart(mockCartProduct);
    
    expect(cart).toHaveLength(1);
    expect(cart[0].cartItemId).toBe('test-123');
    expect(cart[0].title).toBe('Test Stairlift');
  });

  it('should remove product from cart', () => {
    const { addToCart, removeFromCart, cart } = useCartStore.getState();
    
    // Add product first
    addToCart(mockCartProduct);
    expect(cart).toHaveLength(1);
    
    // Remove product
    removeFromCart('test-123');
    expect(useCartStore.getState().cart).toHaveLength(0);
  });

  it('should clear entire cart', () => {
    const { addToCart, clearCart, cart } = useCartStore.getState();
    
    // Add multiple products
    addToCart(mockCartProduct);
    addToCart({ ...mockCartProduct, cartItemId: 'test-456', title: 'Another Product' });
    expect(cart).toHaveLength(2);
    
    // Clear cart
    clearCart();
    expect(useCartStore.getState().cart).toHaveLength(0);
  });

  it('should bulk add products to cart', () => {
    const { bulkAddToCart, cart } = useCartStore.getState();
    
    const products = [
      mockCartProduct,
      { ...mockCartProduct, cartItemId: 'test-456', title: 'Another Product' }
    ];
    
    bulkAddToCart(products);
    expect(cart).toHaveLength(2);
  });

  it('should calculate cart total correctly', () => {
    const { addToCart, cart } = useCartStore.getState();
    
    // Add products with specific quantities
    const product1 = { ...mockCartProduct, price: 1000, quantity: 2 };
    const product2 = { ...mockCartProduct, title: 'Another Product', price: 500, quantity: 1 };
    
    addToCart(product1);
    addToCart(product2);
    
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    expect(total).toBe(2500); // (1000 * 2) + (500 * 1)
  });
});