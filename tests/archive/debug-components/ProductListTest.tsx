import React, { useContext } from 'react';
import { useCartStore } from 'stores/cartStore';
import CartVisibilityContext from 'contexts/cartVisibilityContext';
import { useRouter } from 'next/router';

/**
 * Minimal test component that simulates ProductList add-to-cart functionality
 */
const ProductListTest: React.FC = () => {
  const addToCart = useCartStore(state => state.addToCart);
  const { toggleCartVisibility } = useContext(CartVisibilityContext);
  const router = useRouter();

  const testAddToCart = () => {
    const uuid = () => 'ci_' + Math.random().toString(36).slice(2, 9);
    
    const mockProduct = {
      slug: 'acorn-130-straight-stairlift',
      title: 'Acorn 130 Straight Stairlift',
      cartItemId: uuid(),
      price: 2995,
      quantity: 1,
      productPictures: [{ fields: { file: { url: '/130-stairlift-seated.jpg' } } }],
      affiliate: false,
      productId: 'acorn-130',
      description: 'Reliable straight stairlift',
      shortDescription: 'Perfect for straight staircases',
      featuredImage: '/130-stairlift-seated.jpg',
      productSpecifications: 'Weight capacity: 300lbs'
    };

    console.log('🛒 ProductListTest: Adding product to cart', mockProduct);

    // Add to cart using Zustand store
    addToCart(mockProduct);

    // Navigate to cart page like the real ProductList does
    console.log('🛒 ProductListTest: Navigating to cart page');
    router.push('/cart');
  };

  return (
    <div style={{ 
      border: '2px solid #28a745', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3 style={{ color: '#28a745', marginBottom: '15px' }}>🛍️ ProductList Test</h3>
      <p style={{ marginBottom: '15px', color: '#666' }}>
        This simulates the add-to-cart flow from ProductList component
      </p>
      <button 
        onClick={testAddToCart}
        style={{ 
          padding: '12px 24px', 
          backgroundColor: '#28a745', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Add Test Product to Cart
      </button>
    </div>
  );
};

export default ProductListTest;