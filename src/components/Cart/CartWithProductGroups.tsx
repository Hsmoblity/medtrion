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
  const subTotal = useCartTotal().toFixed(2);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const router = useRouter();

  // Group cart items by main product
  const groupCartItems = (cartItems: CartProduct[]): ProductGroup[] => {
    const groups: { [key: string]: ProductGroup } = {};
    
    cartItems.forEach(item => {
      // Use cartItemId as the group key, or slug as fallback
      const groupKey = item.cartItemId || item.slug;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          mainProduct: item,
          options: [],
          configId: item.cartItemId
        };
      } else {
        // If this item has options, add them to the group
        if (item.options && Array.isArray(item.options) && item.options.length > 0) {
          groups[groupKey].options.push(...item.options);
        }
      }
    });
    
    return Object.values(groups);
  };

  const handleCheckout = async () => {
    setRedirecting(true);
    try {
      router.push('/payment');
    } finally {
      setRedirecting(false);
    }
  };

  const handleEditConfiguration = (product: CartProduct) => {
    // Debug logging for edit config
    console.log('Edit configuration clicked for product:', {
      productId: product.productId,
      slug: product.slug,
      cartItemId: product.cartItemId,
      title: product.title,
      hasOptions: product.options && product.options.length > 0,
      options: product.options
    });

    if (!product.cartItemId) {
      console.error('Cannot edit configuration: missing cartItemId');
      return;
    }

    // Generate a unique session ID for this edit session
    const sessionId = `edit_${product.cartItemId}_${Date.now()}`;
    
    // Navigate to product configuration page with edit mode parameters
    const editUrl = `/product/${product.slug}/configure?edit=true&cartItemId=${product.cartItemId}&sessionId=${sessionId}`;
    
    console.log('Navigating to edit configuration:', {
      url: editUrl,
      sessionId,
      cartItemId: product.cartItemId
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
          "fixed w-screen h-screen opacity-30 bg-[#f5ebdf] z-10",
          { hidden: !cartVisibility }
        )}
      ></div>
      <div
        className={classNames(
          "fixed sm:w-96 w-full h-screen right-0 z-10 bg-[#f5ebdf] top-14 overflow-hidden",
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
            <div className="w-full sticky h-80 bg-black -ml-2.5 border-t border-white p-6 pl-8 bottom-0">
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-white text-sm">Subtotal</span>
                <span className="text-white text-sm">${subTotal}</span>
              </div>
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-white text-sm">Taxes</span>
                <span className="text-white text-sm">
                  Calculated at checkout
                </span>
              </div>
              <div className="w-full h-px bg-gray-800 mb-4"></div>
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-white text-sm font-semibold">Total</span>
                <span className="text-white text-sm font-semibold">
                  ${subTotal}
                </span>
              </div>
              <PrimaryButton
                fullWidth
                disabled={isRedirecting}
                loading={isRedirecting}
                onClick={handleCheckout}
                className="bg-[#f5ebdf] hover:bg-gray-300 text-black border-0 py-4 text-sm uppercase"
              >
                {isRedirecting ? `Please wait...` : `Proceed to Checkout`}
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