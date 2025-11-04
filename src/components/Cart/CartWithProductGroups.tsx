import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCartStore, useCartTotal, useCartItems, useCartVisibility } from 'stores/cartStore';
import { PrimaryButton } from 'components/ui';
import ProductGroup from './ProductGroup';
import { CartProduct } from '../../lib/interfaces';
import classNames from 'classnames';

interface ProductGroup {
  mainProduct: CartProduct;
  options: any[];
  configId?: string;
}

const CartWithProductGroups: React.FC = () => {
  const [isRedirecting, setRedirecting] = useState(false);
  const cart = useCartItems();
  const cartVisibility = useCartVisibility();
  const toggleCartVisibility = useCartStore(state => state.toggleCartVisibility);
  
  // Fix: Safely handle cart total to prevent NaN display
  const rawSubTotal = useCartTotal();
  const subTotal = (isNaN(rawSubTotal) ? 0 : rawSubTotal).toFixed(2);
  
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const router = useRouter();

  // Group cart items by main product
  const groupCartItems = (cartItems: CartProduct[]): ProductGroup[] => {
    const groups: { [key: string]: ProductGroup } = {};
    
    console.log(`🔧 DEBUG: Starting to group ${cartItems.length} cart items:`, cartItems.map(item => ({
      title: item.title,
      cartItemId: item.cartItemId,
      slug: item.slug,
      productId: item.productId,
      optionsCount: item.options?.length || 0,
      options: item.options?.map(opt => ({ name: opt.name, value: opt.value })) || []
    })));
    
    cartItems.forEach(item => {
      // Use cartItemId as the unique group key to prevent duplicates
      // Each cart item should be its own group since it represents a unique configuration
      const groupKey = item.cartItemId || `item-${Math.random()}`;
      
      // Only create a group if it doesn't already exist
      if (!groups[groupKey]) {
        groups[groupKey] = {
          mainProduct: item,
          options: item.options || [], // Initialize with the item's options
          configId: item.cartItemId ? String(item.cartItemId) : undefined
        };
        
        console.log(`🔧 Created group for cart item: ${item.title} (${item.cartItemId}) with ${item.options?.length || 0} options`);
      } else {
        console.warn(`🔧 Duplicate cart item detected: ${item.title} (${item.cartItemId})`);
      }
    });
    
    const groupedItems = Object.values(groups);
    console.log(`🔧 Grouped ${cartItems.length} cart items into ${groupedItems.length} groups`);
    
    return groupedItems;
  };

  const handleCheckout = async () => {
    setRedirecting(true);
    try {
      router.push('/consultation');
    } finally {
      setRedirecting(false);
    }
  };

  const handleEditConfiguration = (product: CartProduct) => {
    // Debug logging for edit config
    console.log('🔧 Edit configuration clicked for product:', {
      productId: product.productId,
      slug: product.slug,
      cartItemId: product.cartItemId,
      title: product.title,
      hasOptions: product.options && product.options.length > 0,
      options: product.options
    });

    if (!product.cartItemId) {
      console.error('🔧 Cannot edit configuration: missing cartItemId');
      return;
    }

    if (!product.slug) {
      console.error('🔧 Cannot edit configuration: missing product slug');
      return;
    }

    // Generate a unique session ID for this edit session
    const sessionId = `edit_${product.cartItemId}_${Date.now()}`;
    
    // Store edit session data in localStorage for persistence across page navigation
    const editSessionData = {
      sessionId,
      cartItemId: product.cartItemId,
      productSlug: product.slug,
      startTime: new Date().toISOString(),
      originalOptions: product.options || []
    };
    
    try {
      localStorage.setItem(`hsm_edit_session_${sessionId}`, JSON.stringify(editSessionData));
      console.log('🔧 Stored edit session data:', editSessionData);
    } catch (error) {
      console.warn('🔧 Could not store edit session data:', error);
    }
    
    // Navigate to product configuration page with edit mode parameters
    const editUrl = `/product/${product.slug}/configure?edit=true&cartItemId=${encodeURIComponent(product.cartItemId)}&sessionId=${encodeURIComponent(sessionId)}`;
    
    console.log('🔧 Navigating to edit configuration:', {
      url: editUrl,
      sessionId,
      cartItemId: product.cartItemId,
      editSessionData
    });
    
    router.push(editUrl);
  };

  const handleRemoveProduct = (product: CartProduct) => {
    if (product.cartItemId) {
      removeFromCart(product.cartItemId);
    }
  };

  const handleUpdateQuantity = (product: CartProduct, quantity: number) => {
    if (product.cartItemId) {
      updateQuantity(product.cartItemId, quantity);
    }
  };

  const productGroups = groupCartItems(cart);

  return (
    <>
      <div
        onClick={() => router.push('/cart')}
        className={classNames(
          "fixed w-screen h-screen opacity-30 bg-gray-800 z-10",
          { hidden: !cartVisibility }
        )}
      ></div>
      <div
        className={classNames(
          "fixed sm:w-96 w-full h-screen right-0 z-10 bg-white dark:bg-gray-800 top-14 overflow-hidden",
          { hidden: !cartVisibility },
          { "flex flex-col items-center justify-center": cart.length === 0 }
        )}
      >
        {cart.length > 0 ? (
          <div className="relative h-full">
            <div className="relative w-full h-2/3 p-5 overflow-y-auto top-0">
              <h4 className="text-3xl text-black font-medium mb-8">My Cart</h4>
              
              {/* Product Groups */}
              <div className="space-y-6">
                {productGroups.map((group, index) => (
                  <ProductGroup
                    key={group.configId || `group-${index}`}
                    group={group}
                    showGroupHeader={true}
                    showGroupTotal={true}
                    onEditConfiguration={handleEditConfiguration}
                    onRemoveProduct={handleRemoveProduct}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
            </div>
            
            {/* Cart Summary */}
            <div className="w-full sticky h-80 bg-white dark:bg-gray-800 -ml-2.5 border-t border-gray-200 dark:border-gray-700 p-6 pl-8 bottom-0 shadow-lg">
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-gray-700 dark:text-gray-300 text-sm">Subtotal</span>
                <span className="text-gray-900 dark:text-white text-sm">${subTotal}</span>
              </div>
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-gray-700 dark:text-gray-300 text-sm">Taxes</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Calculated at checkout
                </span>
              </div>
              <div className="w-full h-px bg-gray-200 dark:bg-gray-700 mb-4"></div>
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-gray-900 dark:text-white text-sm font-semibold">Total</span>
                <span className="text-gray-900 dark:text-white text-sm font-semibold">
                  ${subTotal}
                </span>
              </div>
              <PrimaryButton
                fullWidth
                disabled={isRedirecting}
                loading={isRedirecting}
                onClick={handleCheckout}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 py-4 text-sm uppercase font-medium transition-colors duration-200"
              >
                {isRedirecting ? `Please wait...` : `Request Consultation`}
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <h4 className=" text-black font-poppins text-center font-medium mb-8 text-lg">
            Your cart is empty.
          </h4>
        )}
      </div>
    </>
  );
};

export default CartWithProductGroups;