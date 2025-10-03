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
        setMessage(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onPaymentSuccess(paymentIntent);
        setMessage('Payment successful! Redirecting...');
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