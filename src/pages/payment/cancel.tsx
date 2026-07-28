import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCartStore } from '../../stores/cartStore';
import MetaHead from '../../components/MetaHead';
import PageLayout from '../../components/PageLayout/PageLayout';

interface PaymentCancelProps {}

const PaymentCancel: React.FC<PaymentCancelProps> = () => {
  const router = useRouter();
  const { session_id, wp_order_id, error } = router.query;
  const { cart } = useCartStore();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Payment failure reasons mapping
  const getFailureReason = (error: string | string[] | undefined): string => {
    if (!error) return 'Payment was cancelled or failed';
    
    const errorStr = Array.isArray(error) ? error[0] : error;
    
    const errorMessages: Record<string, string> = {
      'card_declined': 'Your card was declined. Please try a different payment method.',
      'insufficient_funds': 'Insufficient funds. Please check your account balance.',
      'expired_card': 'Your card has expired. Please use a different card.',
      'incorrect_cvc': 'The security code is incorrect. Please check and try again.',
      'processing_error': 'A processing error occurred. Please try again.',
      'payment_cancelled': 'Payment was cancelled by the user.',
      'session_expired': 'Your payment session has expired. Please start over.',
    };

    return errorMessages[errorStr] || 'Payment was cancelled or failed. Please try again.';
  };

  const handleRetryPayment = async () => {
    if (cart.length === 0) {
      setRetryError('Your cart is empty. Please add items before proceeding to payment.');
      return;
    }

    setIsRetrying(true);
    setRetryError(null);

    try {
      // Navigate back to consultation page
  await router.push('/consultation/google-form');
    } catch (error) {
      console.error('Error navigating to payment:', error);
      setRetryError('Failed to redirect to consultation page. Please try again.');
      setIsRetrying(false);
    }
  };

  const handleGoToCart = async () => {
    try {
      await router.push('/cart');
    } catch (error) {
      console.error('Error navigating to cart:', error);
    }
  };

  const handleStartOver = async () => {
    try {
      await router.push('/');
    } catch (error) {
      console.error('Error navigating to home:', error);
    }
  };

  return (
    <PageLayout>
      <MetaHead
        title="Payment Cancelled"
        description="Your payment was cancelled or failed. You can try again or modify your order."
      />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Payment Cancelled Icon */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg 
                className="h-8 w-8 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Payment Cancelled
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              {getFailureReason(error)}
            </p>
          </div>

          {/* Payment Details */}
          {(session_id || wp_order_id) && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Details
              </h3>
              
              <div className="space-y-2 text-sm">
                {session_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Session ID:</span>
                    <span className="font-mono text-gray-900 break-all">
                      {Array.isArray(session_id) ? session_id[0] : session_id}
                    </span>
                  </div>
                )}
                
                {wp_order_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order Reference:</span>
                    <span className="font-mono text-gray-900">
                      {Array.isArray(wp_order_id) ? wp_order_id[0] : wp_order_id}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-red-600 font-medium">
                    Payment Cancelled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {retryError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg 
                  className="h-5 w-5 text-red-400 mt-0.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    {retryError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Primary Action - Retry Payment */}
            {cart.length > 0 && (
              <button
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className={`
                  group relative w-full flex justify-center py-3 px-4 border border-transparent 
                  text-sm font-medium rounded-md text-white transition-colors duration-200
                  ${isRetrying 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }
                `}
              >
                {isRetrying ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Redirecting...
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Try Payment Again
                  </>
                )}
              </button>
            )}

            {/* Secondary Actions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleGoToCart}
                className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" 
                  />
                </svg>
                Review Cart
              </button>

              <button
                onClick={handleStartOver}
                className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                  />
                </svg>
                Start Over
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Need Help?
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <svg 
                  className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Common Solutions:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Check your card details and try again</li>
                    <li>• Ensure you have sufficient funds</li>
                    <li>• Try a different payment method</li>
                    <li>• Contact your bank if the issue persists</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center">
                <svg 
                  className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                  />
                </svg>
                <p>
                  For support, contact us at{' '}
                  <a 
                    href="mailto:support@medtrion.ca" 
                    className="text-brand-primary hover:text-gray-500 transition-colors duration-200"
                  >
                    support@medtrion.ca
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Your payment information is secure and encrypted. No payment was processed.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PaymentCancel;