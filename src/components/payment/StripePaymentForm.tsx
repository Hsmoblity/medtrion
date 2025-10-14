"use client";

import React, { useState } from 'react';
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PrimaryButton } from '../ui';
import { CartProduct } from '../../lib/interfaces';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  cartItems: CartProduct[];
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  onPaymentProcessing: (processing: boolean) => void;
}

interface StripePaymentFormProps {
  clientSecret: string;
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
  const [message, setMessage] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    onPaymentProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        setMessage(error.message || 'An error occurred during payment.');
        onPaymentError(error);
      } else if (paymentIntent) {
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
      onPaymentProcessing(false);
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form space-y-6">
      {/* Payment Element */}
      <div className="payment-element-container">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Payment Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
            onReady={() => {
              console.log('PaymentElement ready');
              setIsComplete(true);
            }}
            onChange={(event) => {
              setIsComplete(event.complete);
            }}
          />
        </div>
      </div>

      {/* Address Element */}
      <div className="address-element-container">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Billing Address
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <AddressElement
            options={{
              mode: 'billing',
              allowedCountries: ['US', 'CA'],
            }}
          />
        </div>
      </div>

      {/* Error Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successful') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
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

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  cartItems,
  onPaymentSuccess,
  onPaymentError,
  onPaymentProcessing
}) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
      },
    },
  };

  return (
    <div className="stripe-payment-form-container">
      <Elements stripe={stripePromise} options={options}>
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

export default StripePaymentForm;