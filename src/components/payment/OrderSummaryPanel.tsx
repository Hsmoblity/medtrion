import React from 'react';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice } from '../../lib/utils/priceUtils';
import { CartProduct } from '../../lib/interfaces';
import { extractImageUrl } from '../../lib/utils/image';
import { calculateCartSubtotal, calculateTax, getShippingCost, calculateCartTotal } from '../../lib/utils/cartCalculations';

interface OrderSummaryPanelProps {
  showEditButton?: boolean;
  onEditCart?: () => void;
}

const OrderSummaryPanel: React.FC<OrderSummaryPanelProps> = ({
  showEditButton = true,
  onEditCart
}) => {
  const { cart } = useCartStore();

  // Calculate totals using shared utilities
  const subtotal = calculateCartSubtotal(cart);
  const shipping = getShippingCost();
  const tax = calculateTax(subtotal);
  const total = calculateCartTotal(cart);

  return (
    <div className="order-summary-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
      {/* Panel Header */}
      <div className="panel-header mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Order Summary
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {cart.length} {cart.length === 1 ? 'item' : 'items'} in your order
        </p>
      </div>

      {/* Order Items */}
      <div className="order-items mb-6 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p>Your cart is empty</p>
          </div>
        ) : (
          cart.map((item: CartProduct) => {
            const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0) || 0;
            let optionsPrice = 0;
            const optionLines: any[] = [];
            
            if (item.options && Array.isArray(item.options)) {
              item.options.forEach((option: any) => {
                const optPrice = Number(option.priceModifier || 0) || 0;
                const optQuantity = Number(option.quantity || 1) || 1;
                optionsPrice += optPrice * optQuantity;
                optionLines.push({
                  name: option.name || option.value,
                  price: optPrice,
                  quantity: optQuantity
                });
              });
            }
            
            const itemTotal = (basePrice + optionsPrice) * (Number(item.quantity) || 1);
            
            return (
              <div 
                key={item.cartItemId} 
                className="order-item flex gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                {/* Item Image */}
                <div className="item-image w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={extractImageUrl(item.featuredImage) || '/placeholder.svg'} 
                    alt={item.title || 'Product'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>

                {/* Item Details */}
                <div className="item-details flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title || 'Product'}
                  </h4>
                  
                  {/* Configuration Options - Enhanced Display */}
                  {optionLines.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Configuration Options:
                      </div>
                      <div className="space-y-1 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
                        {optionLines.map((option, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              • {option.name}
                              {option.quantity > 1 && <span className="ml-1 text-gray-500">x{option.quantity}</span>}
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {formatPrice(option.price * option.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
                          <div className="flex justify-between items-center text-xs font-medium">
                            <span className="text-gray-700 dark:text-gray-300">Options Total:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatPrice(optionsPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Quantity and Price */}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(itemTotal)}
                    </span>
                  </div>
                  
                  {/* Option Details */}
                  {optionLines.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {optionLines.map((option, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>{option.name}{option.quantity > 1 ? ` x${option.quantity}` : ''}</span>
                          <span>{formatPrice(option.price * option.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Price Breakdown */}
      {cart.length > 0 && (
        <>
          <div className="price-breakdown space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="price-row flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="price-row flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </span>
            </div>

            <div className="price-row flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tax (estimated):
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatPrice(tax)}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="order-total flex justify-between items-center mb-6">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Total:
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(total)}
            </span>
          </div>
        </>
      )}

      {/* Edit Cart Button */}
      {showEditButton && (
        <button
          onClick={onEditCart}
          className="
            w-full px-6 py-3 rounded-lg
            border-2 border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700
            text-gray-700 dark:text-gray-300
            font-medium
            hover:bg-gray-50 dark:hover:bg-gray-600
            hover:border-gray-400 dark:hover:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
            />
          </svg>
          Edit Cart
        </button>
      )}

      {/* Security Badge */}
      <div className="security-badge mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Secure Checkout
      </div>
    </div>
  );
};

export default OrderSummaryPanel;