/* eslint-disable react-hooks/exhaustive-deps */
// @refresh reset
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { loadStripe } from '@stripe/stripe-js';
import { PrimaryButton } from '../ui';
import { CartProduct } from '../../lib/interfaces';
import PaymentConfigurationNotice from './PaymentConfigurationNotice';
import { calculateCartTotal } from '../../lib/utils/cartCalculations';

// Dynamically import the entire payment form to isolate Stripe hooks from Fast Refresh
const DynamicStripePaymentForm = dynamic(() => import('./StripePaymentForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading payment form...</span>
    </div>
  )
}) as React.ComponentType<{
  clientSecret: string;
  cartItems: CartProduct[];
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  onPaymentProcessing: (processing: boolean) => void;
}>;

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

const StripeElements: React.FC<StripeElementsProps> = ({
  cartItems,
  onPaymentSuccess,
  onPaymentError,
  onPaymentProcessing
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  
  // Use refs to prevent unnecessary re-renders and multiple calls
  const intentCreatedRef = useRef(false);
  const lastCartTotalRef = useRef<number>(0);

  // Memoize cart total to prevent unnecessary re-renders
  const cartTotal = useMemo(() => {
    return calculateCartTotal(cartItems);
  }, [cartItems]);

  const createPaymentIntent = useCallback(async () => {
    if (isCreatingIntent || intentCreatedRef.current) return; // Prevent multiple simultaneous calls
    
    try {
      setIsCreatingIntent(true);
      setIsLoading(true);
      setError('');
      onPaymentProcessing(true);
      
      console.log('Creating payment intent for total:', cartTotal);
      
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

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        intentCreatedRef.current = true;
        lastCartTotalRef.current = cartTotal;
      } else {
        throw new Error('No client secret received from payment API');
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      setError(error.message);
      onPaymentError(error);
    } finally {
      setIsLoading(false);
      setIsCreatingIntent(false);
      onPaymentProcessing(false);
    }
  }, [cartItems, cartTotal, onPaymentError, onPaymentProcessing]);

  useEffect(() => {
    // Only create payment intent if we have items and cart total changed significantly
    if (cartItems.length > 0 && !clientSecret && Math.abs(cartTotal - lastCartTotalRef.current) > 0.01) {
      intentCreatedRef.current = false; // Reset flag when cart changes
      createPaymentIntent();
    }
  }, [cartTotal, clientSecret, createPaymentIntent, cartItems.length]);

  // Check if Stripe is properly configured
  if (!isStripeConfigured()) {
    return (
      <PaymentConfigurationNotice 
        className="max-w-4xl mx-auto"
      />
    );
  }

  // Show loading state while creating payment intent
  if (isLoading || !clientSecret) {
    return (
      <div className="stripe-elements-container">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Preparing payment...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const handleRetry = () => {
      setIsCreatingIntent(false);
      intentCreatedRef.current = false;
      setClientSecret('');
      createPaymentIntent();
    };

    return (
      <div className="stripe-elements-container">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-800 mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="bg-[#f7a236] hover:bg-[#3fa2a3] text-white px-6 py-3 rounded-[35px] font-primary font-semibold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-elements-container">
      <DynamicStripePaymentForm
        clientSecret={clientSecret}
        cartItems={cartItems}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        onPaymentProcessing={onPaymentProcessing}
      />
    </div>
  );
};

export default StripeElements;