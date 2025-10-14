import React, { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import StripeElements from './StripeElements';
import { CartProduct } from '../../lib/interfaces';

interface PaymentMethodPanelProps {
  onPaymentMethodChange?: (method: 'stripe') => void;
  onPaymentSuccess?: (paymentIntent: any) => void;
  onPaymentError?: (error: any) => void;
}

const PaymentMethodPanel: React.FC<PaymentMethodPanelProps> = ({
  onPaymentMethodChange,
  onPaymentSuccess,
  onPaymentError
}) => {
  // Always use Stripe payment method - no dummy payment option
  const [paymentMethod] = useState<'stripe'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const cartItems = useCartStore(state => state.cart);

  // Notify parent component about payment method (always Stripe)
  React.useEffect(() => {
    if (onPaymentMethodChange) {
      onPaymentMethodChange('stripe');
    }
  }, [onPaymentMethodChange]);

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentIntent);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  const handlePaymentProcessing = (processing: boolean) => {
    setIsProcessing(processing);
  };

  return (
    <div className="payment-method-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {/* Panel Header */}
      <div className="panel-header mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Payment Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Secure payment processing via Stripe
        </p>
      </div>

      {/* Stripe Payment Form */}
      <div className="stripe-form">
        {cartItems.length > 0 ? (
          <StripeElements
            cartItems={cartItems}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onPaymentProcessing={handlePaymentProcessing}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm">Add some items to your cart to proceed with payment</p>
            </div>
          </div>
        )}
      </div>


      {/* Security Information */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Your payment information is secure</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
          We use industry-standard encryption to protect your payment details.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodPanel;