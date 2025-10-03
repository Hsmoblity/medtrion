import { useState, useCallback } from 'react';
import { CartProduct } from '../lib/interfaces';

interface PaymentProcessingState {
  isProcessing: boolean;
  error: string | null;
  success: boolean;
  paymentIntent: any | null;
}

interface PaymentProcessingActions {
  processPayment: (cartItems: CartProduct[], paymentData: any) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePaymentProcessing = (): PaymentProcessingState & PaymentProcessingActions => {
  const [state, setState] = useState<PaymentProcessingState>({
    isProcessing: false,
    error: null,
    success: false,
    paymentIntent: null,
  });

  const processPayment = useCallback(async (cartItems: CartProduct[], paymentData: any) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      success: false,
    }));

    try {
      // Step 1: Create payment intent
      const intentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          currency: 'cad',
          metadata: {
            source: 'payment-processing-hook',
            timestamp: new Date().toISOString(),
            ...paymentData.metadata,
          },
        }),
      });

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await intentResponse.json();

      // Step 2: Confirm payment (this would typically be done by Stripe Elements)
      // For now, we'll simulate the confirmation
      const confirmResponse = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          metadata: paymentData.metadata,
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Payment confirmation failed');
      }

      const confirmData = await confirmResponse.json();

      setState(prev => ({
        ...prev,
        isProcessing: false,
        success: true,
        paymentIntent: confirmData.paymentIntent,
      }));

    } catch (error: any) {
      console.error('Payment processing error:', error);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Payment processing failed',
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      success: false,
      paymentIntent: null,
    });
  }, []);

  return {
    ...state,
    processPayment,
    clearError,
    reset,
  };
};

export default usePaymentProcessing;