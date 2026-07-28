import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCartStore } from '../../stores/cartStore';

interface PaymentRetryProps {
  sessionId?: string;
  wpOrderId?: string;
  errorReason?: string;
  onRetrySuccess?: () => void;
  onRetryError?: (error: string) => void;
  className?: string;
}

interface RetryOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<void>;
  primary?: boolean;
}

const PaymentRetry: React.FC<PaymentRetryProps> = ({
  sessionId,
  wpOrderId,
  errorReason,
  onRetrySuccess,
  onRetryError,
  className = ''
}) => {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Retry with same cart items
  const retryPayment = async () => {
    if (cart.length === 0) {
      onRetryError?.('Your cart is empty. Please add items before proceeding to payment.');
      return;
    }

    setIsProcessing('retry');
    try {
  await router.push('/consultation/google-form');
      onRetrySuccess?.();
    } catch (error) {
      console.error('Error navigating to consultation:', error);
      onRetryError?.('Failed to redirect to consultation page. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  // Create new Stripe session (for expired sessions)
  const createNewSession = async () => {
    if (cart.length === 0) {
      onRetryError?.('Your cart is empty. Please add items before proceeding to payment.');
      return;
    }

    setIsProcessing('new-session');
    try {
      // Create a new payment session
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            variationId: item.variationId,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
            productPictures: item.productPictures || []
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { id: newSessionId, publishableKey } = await response.json();
      
      if (!newSessionId || !publishableKey) {
        throw new Error('Invalid response from payment session creation');
      }

      // Redirect to Stripe Checkout with new session
      const stripe = await import('@stripe/stripe-js').then(mod => mod.loadStripe(publishableKey));
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: newSessionId
      });

      if (error) {
        throw new Error(error.message);
      }

      onRetrySuccess?.();
    } catch (error: any) {
      console.error('Error creating new session:', error);
      onRetryError?.(`Failed to create new payment session: ${error.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  // Modify cart and retry
  const modifyCartAndRetry = async () => {
    setIsProcessing('modify-cart');
    try {
      await router.push('/cart');
      onRetrySuccess?.();
    } catch (error) {
      console.error('Error navigating to cart:', error);
      onRetryError?.('Failed to redirect to cart page. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  // Clear cart and start over
  const startOver = async () => {
    setIsProcessing('start-over');
    try {
      clearCart();
      await router.push('/');
      onRetrySuccess?.();
    } catch (error) {
      console.error('Error navigating to home:', error);
      onRetryError?.('Failed to redirect to home page. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  // Contact support
  const contactSupport = async () => {
    const subject = encodeURIComponent('Payment Issue - Need Assistance');
    const body = encodeURIComponent(
      `I encountered a payment issue and need assistance.\n\n` +
      `Details:\n` +
      `- Session ID: ${sessionId || 'N/A'}\n` +
      `- Order Reference: ${wpOrderId || 'N/A'}\n` +
      `- Error: ${errorReason || 'Payment cancelled or failed'}\n` +
      `- Items in cart: ${cart.length}\n\n` +
      `Please help me complete my order.`
    );
    
    window.location.href = `mailto:support@medtrion.ca?subject=${subject}&body=${body}`;
  };

  const retryOptions: RetryOption[] = [
    {
      id: 'retry',
      label: 'Try Payment Again',
      description: 'Use the same cart items with the same payment method',
      primary: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      action: retryPayment
    },
    {
      id: 'new-session',
      label: 'Create New Payment Session',
      description: 'Start a fresh payment session (recommended for expired sessions)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      action: createNewSession
    },
    {
      id: 'modify-cart',
      label: 'Review & Modify Cart',
      description: 'Change items, quantities, or options before trying again',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
        </svg>
      ),
      action: modifyCartAndRetry
    },
    {
      id: 'start-over',
      label: 'Start Over',
      description: 'Clear cart and begin a new shopping session',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      action: startOver
    }
  ];

  return (
    <div className={`payment-retry-component ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Choose How to Proceed
        </h3>
        
        <div className="grid gap-3">
          {retryOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              disabled={isProcessing === option.id}
              className={`
                relative group flex items-start p-4 border rounded-lg transition-all duration-200
                ${option.primary 
                  ? 'border-orange-300 bg-orange-50 hover:bg-orange-100' 
                  : 'border-gray-300 bg-white hover:bg-gray-50'
                }
                ${isProcessing === option.id 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
            >
              <div className={`
                flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg
                ${option.primary ? 'bg-orange-100 text-brand-primary' : 'bg-gray-100 text-gray-600'}
              `}>
                {isProcessing === option.id ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  option.icon
                )}
              </div>
              
              <div className="ml-4 flex-1 text-left">
                <div className={`
                  text-sm font-medium
                  ${option.primary ? 'text-brand-dark' : 'text-gray-900'}
                `}>
                  {option.label}
                </div>
                <div className={`
                  text-sm mt-1
                  ${option.primary ? 'text-brand-dark' : 'text-gray-500'}
                `}>
                  {option.description}
                </div>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <svg 
                  className={`
                    w-5 h-5 transition-transform duration-200 group-hover:translate-x-1
                    ${option.primary ? 'text-brand-primary' : 'text-gray-400'}
                  `} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Contact Support Option */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={contactSupport}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support for Help
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentRetry;