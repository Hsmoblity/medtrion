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
import { calculateCartTotal } from '../../lib/utils/cartCalculations';

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
      console.error('Stripe not loaded yet');
      return;
    }

    setIsProcessing(true);
    onPaymentProcessing(true);
    setMessage('');

    try {
      console.log('Starting payment confirmation...');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
      });

      console.log('Payment confirmation result:', { error, paymentIntent });

      if (error) {
        console.error('Payment error:', error);
        setMessage(error.message || 'An error occurred during payment.');
        onPaymentError(error);
      } else if (paymentIntent) {
        console.log('Payment Intent Status:', paymentIntent.status);
        console.log('Payment Intent ID:', paymentIntent.id);
        console.log('Full Payment Intent:', paymentIntent);
        
        // Check payment intent status
        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Payment succeeded! Calling onPaymentSuccess...');
          setMessage('Payment successful! Processing your order...');
          
          // Call the success handler with the payment intent
          await onPaymentSuccess(paymentIntent);
          
        } else if (paymentIntent.status === 'processing') {
          console.log('⏳ Payment is processing...');
          setMessage('Payment is being processed. This may take a few moments...');
          
          // For processing payments, we still call success but with different messaging
          await onPaymentSuccess(paymentIntent);
          
        } else if (paymentIntent.status === 'requires_action') {
          console.log('🔐 Payment requires additional action');
          setMessage('Additional authentication required. Please complete the verification and try again.');
          
          // Don't call onPaymentSuccess yet - wait for user to complete action
          
        } else if (paymentIntent.status === 'requires_payment_method') {
          console.log('💳 Payment requires a different payment method');
          setMessage('Payment failed. Please try a different payment method.');
          onPaymentError(new Error('Payment method declined'));
          
        } else if (paymentIntent.status === 'canceled') {
          console.log('❌ Payment was canceled');
          setMessage('Payment was canceled. Please try again.');
          onPaymentError(new Error('Payment canceled'));
          
        } else {
          console.warn('⚠️ Unexpected payment intent status:', paymentIntent.status);
          setMessage(`Payment status: ${paymentIntent.status}. Please contact support if you have questions.`);
          
          // For unknown statuses, let's still try to process it
          await onPaymentSuccess(paymentIntent);
        }
      } else {
        console.error('No payment intent returned from Stripe');
        setMessage('Payment confirmation failed. Please try again.');
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
          {isProcessing ? 'Processing...' : `Pay $${calculateCartTotal(cartItems).toFixed(2)}`}
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