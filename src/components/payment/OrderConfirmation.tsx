import React from 'react';
import { formatPrice } from '../../lib/utils/priceUtils';

interface OrderConfirmationProps {
  sessionData: any;
  orderData?: any;
  onViewOrder?: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  sessionData,
  orderData,
  onViewOrder
}) => {
  const formatAmount = (amount: number, currency: string = 'cad') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-green-900">Order Confirmed</h2>
            <p className="text-green-700">
              Order #{orderData?.id || sessionData?.metadata?.orderId || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-600">Payment Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {sessionData?.payment_status === 'paid' ? 'Paid' : 'Processing'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Order Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Total:</span>
                <span className="font-semibold text-gray-900">
                  {formatAmount(sessionData?.amount_total || 0, sessionData?.currency)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="text-gray-900">Credit Card</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="text-gray-900 font-mono text-sm">
                  {sessionData?.id || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="text-gray-900">
                  {new Date().toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {sessionData?.customer_details?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">
                    {sessionData?.customer_details?.email || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Shipping Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 block">Shipping Address:</span>
                <div className="mt-1 text-gray-900">
                  {formatAddress(sessionData?.shipping_details?.address)}
                </div>
              </div>
              
              <div>
                <span className="text-gray-600 block">Delivery Method:</span>
                <span className="text-gray-900">Standard Delivery</span>
              </div>
              
              <div>
                <span className="text-gray-600 block">Estimated Delivery:</span>
                <span className="text-gray-900">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Order Items */}
            {orderData?.line_items && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {orderData.line_items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} (Qty: {item.quantity})
                      </span>
                      <span className="text-gray-900">
                        {formatPrice(parseFloat(item.price))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onViewOrder}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Full Order Details
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Important Information</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You will receive an email confirmation shortly</li>
            <li>• Installation will be scheduled within 24 hours</li>
            <li>• Please keep your order number for reference</li>
            <li>• Contact us if you have any questions about your order</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;