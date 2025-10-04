"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
  LinkAuthenticationElement
} from '@stripe/react-stripe-js';
import { PrimaryButton } from '../ui';
import { CartProduct } from '../../lib/interfaces';
import PaymentConfigurationNotice from './PaymentConfigurationNotice';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Check if Stripe is properly configured
const isStripeConfigured = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return publishableKey && !publishableKey.includes('placeholder') && publishableKey.startsWith('pk_');
};

interface StripeElementsProps {
  cartItems: CartProduct[];
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  onPaymentProcessing: (processing: boolean) => void;
}

interface PaymentFormProps {
  cartItems: CartProduct[];
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  onPaymentProcessing: (processing: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  cartItems,
  onPaymentSuccess,
  onPaymentError,
  onPaymentProcessing
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [configurationError, setConfigurationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [cartItems]);

  const createPaymentIntent = async () => {
    try {
      onPaymentProcessing(true);
      
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          currency: 'cad',
          metadata: {
            source: 'stripe-elements',
            timestamp: new Date().toISOString(),
          }
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Check if response is HTML (error page)
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
          const errorMessage = `Payment API returned HTML error page (${response.status}): ${response.statusText}`;
          setConfigurationError('Payment system is not properly configured');
          throw new Error(errorMessage);
        }
        
        // Try to parse as JSON for error details
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.error || `Payment API error: ${response.statusText}`;
          
          // Check if it's a configuration error
          if (errorMessage.includes('not configured') || errorMessage.includes('configuration')) {
            setConfigurationError('Payment system is not properly configured');
          }
          
          throw new Error(errorMessage);
        } catch (parseError) {
          const errorMessage = `Payment API error (${response.status}): ${response.statusText}`;
          setConfigurationError('Payment system is not properly configured');
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setClientSecret(data.clientSecret);
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      
      // Check if it's a configuration error
      if (error.message.includes('not configured') || error.message.includes('configuration') || error.message.includes('HTML error page')) {
        setConfigurationError('Payment system is not properly configured');
        setMessage('Payment system is being set up. Please contact us for assistance.');
      } else {
        onPaymentError(error);
        setMessage('Failed to initialize payment. Please try again.');
      }
    } finally {
      onPaymentProcessing(false);
    }
  };

  const handleRetry = () => {
    setConfigurationError(null);
    setMessage('');
    createPaymentIntent();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        onPaymentError(error);
        
        // Check if we can retry
        if (retryCount < maxRetries && (error.code === 'card_declined' || error.code === 'processing_error')) {
          setMessage(`Payment failed: ${error.message}. Retrying... (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          
          // Retry after a short delay
          setTimeout(() => {
            handleSubmit(event);
          }, 2000);
        } else {
          setMessage(error.message || 'Payment failed. Please try again.');
        }
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onPaymentSuccess(paymentIntent);
        setMessage('Payment successful! Redirecting...');
        setRetryCount(0); // Reset retry count on success
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      onPaymentError(error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
      },
      '.Input:focus': {
        borderColor: '#2563eb',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '8px',
      },
    },
  };

  const options = {
    clientSecret,
    appearance,
    loader: 'auto' as const,
  };

  // Show configuration notice if there's a configuration error
  if (configurationError) {
    return (
      <PaymentConfigurationNotice 
        onRetry={handleRetry}
        className="max-w-4xl mx-auto"
      />
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Progress Indicator */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Progress</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              clientSecret ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {clientSecret ? '✓' : '1'}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              clientSecret ? 'text-green-600' : 'text-gray-600'
            }`}>
              Initialize Payment
            </span>
          </div>
          
          <div className="flex-1 mx-4">
            <div className="h-1 bg-gray-200 rounded">
              <div className={`h-1 rounded transition-all duration-300 ${
                clientSecret ? 'bg-green-500 w-full' : 'bg-gray-300 w-0'
              }`}></div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isComplete ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {isComplete ? '✓' : '2'}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              isComplete ? 'text-green-600' : 'text-gray-600'
            }`}>
              Enter Details
            </span>
          </div>
          
          <div className="flex-1 mx-4">
            <div className="h-1 bg-gray-200 rounded">
              <div className={`h-1 rounded transition-all duration-300 ${
                isComplete ? 'bg-green-500 w-full' : 'bg-gray-300 w-0'
              }`}></div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isProcessing ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {isProcessing ? '⏳' : '3'}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              isProcessing ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Process Payment
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        
        {/* Link Authentication Element for saving payment methods */}
        <div className="mb-6">
          <LinkAuthenticationElement
            options={{
              defaultValues: {
                email: '',
              },
            }}
          />
        </div>

        {/* Express Checkout Options */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Express Checkout
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Apple Pay */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={async () => {
                if (!stripe || !elements) return;
                
                try {
                  // Trigger Apple Pay through Stripe Elements
                  const { error } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                      return_url: `${window.location.origin}/success`,
                    },
                    redirect: 'if_required',
                  });
                  
                  if (error) {
                    onPaymentError(error);
                    setMessage(error.message || 'Apple Pay payment failed');
                  }
                } catch (err: any) {
                  onPaymentError(err);
                  setMessage('Apple Pay is not available on this device');
                }
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-sm font-medium">Apple Pay</span>
            </button>

            {/* Google Pay */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={async () => {
                if (!stripe || !elements) return;
                
                try {
                  // Trigger Google Pay through Stripe Elements
                  const { error } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                      return_url: `${window.location.origin}/success`,
                    },
                    redirect: 'if_required',
                  });
                  
                  if (error) {
                    onPaymentError(error);
                    setMessage(error.message || 'Google Pay payment failed');
                  }
                } catch (err: any) {
                  onPaymentError(err);
                  setMessage('Google Pay is not available on this device');
                }
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium">Google Pay</span>
            </button>
          </div>
        </div>

        {/* Payment Element */}
        <div className="mb-6">
          <PaymentElement
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  name: '',
                  email: '',
                  phone: '',
                },
              },
              wallets: {
                applePay: 'auto',
                googlePay: 'auto',
              },
            }}
            onChange={(event) => {
              setIsComplete(event.complete);
            }}
          />
        </div>

        {/* Address Element for shipping */}
        <div className="mb-6">
          <AddressElement
            options={{
              mode: 'shipping',
              allowedCountries: ['US', 'CA'],
              blockPoBox: true,
            }}
          />
        </div>
      </div>

      {/* Error/Success Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successful') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {message.includes('successful') ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                )}
              </svg>
              {message}
            </div>
            
            {/* Retry Button for Failed Payments */}
            {!message.includes('successful') && !message.includes('Retrying') && retryCount >= maxRetries && (
              <button
                type="button"
                onClick={() => {
                  setRetryCount(0);
                  setMessage('');
                  createPaymentIntent();
                }}
                className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry Payment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <PrimaryButton
          type="submit"
          disabled={!stripe || !isComplete || isProcessing}
          loading={isProcessing}
          className="min-w-[200px]"
        >
          {isProcessing ? 'Processing...' : `Pay $${calculateTotal(cartItems).toFixed(2)}`}
        </PrimaryButton>
      </div>
    </form>
  );
};

const StripeElements: React.FC<StripeElementsProps> = ({
  cartItems,
  onPaymentSuccess,
  onPaymentError,
  onPaymentProcessing
}) => {
  // Check if Stripe is properly configured
  if (!isStripeConfigured()) {
    return (
      <PaymentConfigurationNotice 
        className="max-w-4xl mx-auto"
      />
    );
  }

  return (
    <div className="stripe-elements-container">
      <Elements stripe={stripePromise}>
        <PaymentForm
          cartItems={cartItems}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          onPaymentProcessing={onPaymentProcessing}
        />
      </Elements>
    </div>
  );
};

// Helper function to calculate total
const calculateTotal = (cartItems: CartProduct[]): number => {
  return cartItems.reduce((total, item) => {
    const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0);
    let optionsPrice = 0;
    
    if (item.options && Array.isArray(item.options)) {
      optionsPrice = item.options.reduce((optSum: number, option: any) => {
        const optPrice = Number(option.priceModifier || 0) || 0;
        const optQuantity = Number(option.quantity || 1) || 1;
        return optSum + (optPrice * optQuantity);
      }, 0);
    }
    
    return total + (basePrice + optionsPrice) * (Number(item.quantity) || 1);
  }, 0);
};

export default StripeElements;