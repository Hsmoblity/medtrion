import React, { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import StripeElements from './StripeElements';
import { CartProduct } from '../../lib/interfaces';

interface PaymentMethodPanelProps {
  onPaymentMethodChange?: (method: 'card' | 'stripe') => void;
  onPaymentSuccess?: (paymentIntent: any) => void;
  onPaymentError?: (error: any) => void;
}

const PaymentMethodPanel: React.FC<PaymentMethodPanelProps> = ({
  onPaymentMethodChange,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'stripe'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const cartItems = useCartStore(state => state.cart);

  const handlePaymentMethodChange = (method: 'card' | 'stripe') => {
    setPaymentMethod(method);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }
  };

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
          Payment Method
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Choose your preferred payment method
        </p>
      </div>

      {/* Payment Method Selection */}
      <div className="payment-methods mb-6 space-y-3">
        <div 
          className={`
            payment-option p-4 rounded-lg border-2 cursor-pointer
            transition-all duration-200
            ${paymentMethod === 'card'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }
          `}
          onClick={() => handlePaymentMethodChange('card')}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={paymentMethod === 'card'}
              onChange={() => handlePaymentMethodChange('card')}
              className="w-5 h-5 text-blue-600"
              aria-label="Credit or Debit Card"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">
                Credit / Debit Card
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Visa, Mastercard, American Express, Discover
              </div>
            </div>
            <div className="flex gap-2">
              <img src="/visa.svg" alt="Visa" className="h-6" />
              <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
              <img src="/amex.svg" alt="American Express" className="h-6" />
              <img src="/discover.svg" alt="Discover" className="h-6" />
            </div>
          </div>
        </div>

        <div 
          className={`
            payment-option p-4 rounded-lg border-2 cursor-pointer
            transition-all duration-200
            ${paymentMethod === 'stripe'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }
          `}
          onClick={() => handlePaymentMethodChange('stripe')}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={paymentMethod === 'stripe'}
              onChange={() => handlePaymentMethodChange('stripe')}
              className="w-5 h-5 text-blue-600"
              aria-label="Stripe Payment"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">
                Stripe Payment
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Secure payment processing via Stripe
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form based on selected method */}
      {paymentMethod === 'card' && (
        <div className="card-form space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">Test Mode</p>
                <p>This is a demo payment form. Use test card: 4242 4242 4242 4242</p>
              </div>
            </div>
          </div>

          {/* Card Number */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Card Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              maxLength={19}
            />
          </div>

          {/* Cardholder Name */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cardholder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="MM / YY"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                maxLength={7}
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CVV <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'stripe' && (
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
      )}


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