import React from 'react';
import { useRouter } from 'next/router';
import { useCartStore, useCartItems } from 'stores/cartStore';
import ProductGroup from './ProductGroup';
import { CartProduct } from '../../lib/interfaces';

interface ProductGroup {
  mainProduct: CartProduct;
  options: any[];
  configId?: string;
}

const CartPageGroups: React.FC = () => {
  const cart = useCartItems();
  const router = useRouter();
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);

  // Group cart items by main product
  const groupCartItems = (cartItems: CartProduct[]): ProductGroup[] => {
    const groups: { [key: string]: ProductGroup } = {};
    
    cartItems.forEach((item, index) => {
      // Use cartItemId as the group key, or slug as fallback
      const groupKey = item.cartItemId || item.slug || `item-${index}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          mainProduct: item,
          options: [],
          configId: item.cartItemId ? String(item.cartItemId) : undefined
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

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven&apos;t added any mobility products to your cart yet.
          </p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default CartPageGroups;