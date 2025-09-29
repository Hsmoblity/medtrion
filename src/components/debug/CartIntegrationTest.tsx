import React, { useState } from 'react';
import { useCartStore } from 'stores/cartStore';
import { PrimaryButton } from 'components/ui';

/**
 * Simple test component to verify cart functionality
 * This component will be temporarily added to a page to test the cart integration
 */
const CartIntegrationTest: React.FC = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useCartStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAddToCart = () => {
    addTestResult('Testing add to cart...');
    
    const testProduct = {
      slug: 'test-stairlift',
      title: 'Test Stairlift',
      description: 'A test stairlift product',
      shortDescription: 'Test product',
      featuredImage: '/temp.webp',
      productSpecifications: 'Test specifications',
      productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
      price: 2500,
      affiliate: false,
      productId: 'test-123',
      quantity: 1,
      options: []
    };

    try {
      // Test direct Zustand store addition
      addToCart(testProduct);
      
      setTimeout(() => {
        const currentCart = useCartStore.getState().cart;
        addTestResult(`✅ Added to store - Cart length: ${currentCart.length}`);
        
        const foundInStore = currentCart.find(item => item.slug === 'test-stairlift');
        if (foundInStore) {
          addTestResult(`✅ Item found in store: ${foundInStore.title}`);
        } else {
          addTestResult(`❌ Item NOT found in store`);
        }
      }, 100);
    } catch (error) {
      addTestResult(`❌ Error: ${error}`);
    }
  };

  const testRemoveFromCart = () => {
    addTestResult('Testing remove from cart...');
    
    const testItem = cart.find(item => item.slug === 'test-stairlift');
    if (testItem && testItem.cartItemId) {
      removeFromCart(testItem.cartItemId);
      addTestResult(`✅ Removed item from cart - New length: ${cart.length}`);
    } else {
      addTestResult(`❌ Test item not found in cart`);
    }
  };

  const testClearCart = () => {
    addTestResult('Testing clear cart...');
    clearCart();
    addTestResult(`✅ Cart cleared - Length: ${cart.length}`);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-bold mb-4">Cart Integration Test</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <PrimaryButton 
            onClick={testAddToCart}
          >
            Test Add to Cart
          </PrimaryButton>
          
          <button 
            onClick={testRemoveFromCart}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test Remove from Cart
          </button>
          
          <button 
            onClick={testClearCart}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Test Clear Cart
          </button>
          
          <button 
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>

        <div className="bg-white p-4 rounded border">
          <strong>Current State:</strong> Cart items: {cart.length}
        </div>

        <div className="bg-white p-4 rounded border">
          <h3 className="font-bold mb-2">Test Results:</h3>
          <div className="max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm py-1 border-b border-gray-200">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <h3 className="font-bold mb-2">Current Cart Contents:</h3>
          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            <ul className="space-y-2">
              {cart.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <strong>{item.title}</strong> - ${item.price} x {item.quantity}
                  {item.options && item.options.length > 0 && (
                    <div className="text-xs text-gray-600 ml-2">
                      Options: {item.options.map(opt => opt.name).join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartIntegrationTest;