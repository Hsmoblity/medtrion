import { useState, useCallback, useEffect } from 'react';
import { CartProduct } from '../lib/interfaces';
import { useStripeConfig } from './useStripeConfig';

// Payment state types
export type PaymentStatus = 
  | 'idle'
  | 'initializing'
  | 'processing'
  | 'confirming'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'requires_action'
  | 'requires_payment_method';

export interface PaymentState {
  status: PaymentStatus;
  paymentIntent: any | null;
  clientSecret: string | null;
  error: string | null;
  orderId: string | null;
  customerId: string | null;
  amount: number | null;
  currency: string;
  retryCount: number;
  lastError: string | null;
  sessionId: string | null;
}

export interface PaymentActions {
  initializePayment: (cartItems: CartProduct[], metadata?: Record<string, any>) => Promise<void>;
  confirmPayment: (paymentIntentId: string) => Promise<void>;
  retryPayment: () => Promise<void>;
  cancelPayment: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Payment session storage
const PAYMENT_SESSION_KEY = 'stripe_payment_session';

interface PaymentSession {
  sessionId: string;
  cartItems: CartProduct[];
  metadata: Record<string, any>;
  timestamp: number;
  expiresAt: number;
}

export const useStripePayment = (environment?: 'test' | 'live'): PaymentState & PaymentActions => {
  // Get Stripe configuration
  const { config: stripeConfig, loading: configLoading, error: configError } = useStripeConfig({ environment });
  
  const [state, setState] = useState<PaymentState>({
    status: 'idle',
    paymentIntent: null,
    clientSecret: null,
    error: null,
    orderId: null,
    customerId: null,
    amount: null,
    currency: stripeConfig?.currency || 'USD',
    retryCount: 0,
    lastError: null,
    sessionId: null,
  });

  // Update currency when config changes
  useEffect(() => {
    if (stripeConfig?.currency) {
      setState(prev => ({
        ...prev,
        currency: stripeConfig.currency,
      }));
    }
  }, [stripeConfig?.currency]);

  // Handle configuration errors
  useEffect(() => {
    if (configError) {
      setState(prev => ({
        ...prev,
        error: `Configuration error: ${configError}`,
        status: 'failed',
      }));
    }
  }, [configError]);

  // Load payment session from storage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(PAYMENT_SESSION_KEY);
    if (savedSession) {
      try {
        const session: PaymentSession = JSON.parse(savedSession);
        const now = Date.now();
        
        // Check if session is still valid (24 hours)
        if (now < session.expiresAt) {
          setState(prev => ({
            ...prev,
            sessionId: session.sessionId,
            status: 'idle',
          }));
        } else {
          // Clear expired session
          localStorage.removeItem(PAYMENT_SESSION_KEY);
        }
      } catch (error) {
        console.warn('Failed to parse saved payment session:', error);
        localStorage.removeItem(PAYMENT_SESSION_KEY);
      }
    }
  }, []);

  // Save payment session to storage
  const savePaymentSession = useCallback((cartItems: CartProduct[], metadata: Record<string, any>) => {
    const sessionId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: PaymentSession = {
      sessionId,
      cartItems,
      metadata,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    
    localStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify(session));
    return sessionId;
  }, []);

  // Clear payment session from storage
  const clearPaymentSession = useCallback(() => {
    localStorage.removeItem(PAYMENT_SESSION_KEY);
  }, []);

  // Initialize payment intent
  const initializePayment = useCallback(async (
    cartItems: CartProduct[], 
    metadata: Record<string, any> = {}
  ) => {
    // Check if configuration is loading
    if (configLoading) {
      setState(prev => ({
        ...prev,
        status: 'initializing',
        error: 'Loading Stripe configuration...',
      }));
      return;
    }

    // Check if configuration is available
    if (!stripeConfig?.is_configured) {
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: 'Stripe is not configured. Please check your HSM plugin settings.',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      status: 'initializing',
      error: null,
      retryCount: 0,
    }));

    try {
      // Save payment session
      const sessionId = savePaymentSession(cartItems, metadata);

      // Calculate total amount
      const totalAmount = cartItems.reduce((total, item) => {
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

      // Add tax (13% for Canada)
      const taxRate = 0.13;
      const taxAmount = totalAmount * taxRate;
      const finalAmount = totalAmount + taxAmount;

      // Create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          currency: 'cad',
          metadata: {
            ...metadata,
            sessionId,
            source: 'stripe-payment-hook',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      setState(prev => ({
        ...prev,
        status: 'processing',
        clientSecret,
        paymentIntent: { id: paymentIntentId },
        amount: finalAmount,
        sessionId,
      }));

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: error.message || 'Payment initialization failed',
        lastError: error.message || 'Payment initialization failed',
      }));
    }
  }, [savePaymentSession]);

  // Confirm payment
  const confirmPayment = useCallback(async (paymentIntentId: string) => {
    setState(prev => ({
      ...prev,
      status: 'confirming',
      error: null,
    }));

    try {
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          metadata: {
            sessionId: state.sessionId,
            source: 'stripe-payment-hook',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment confirmation failed');
      }

      const { success, paymentIntent, orderId } = await response.json();

      if (success) {
        setState(prev => ({
          ...prev,
          status: 'succeeded',
          paymentIntent,
          orderId: orderId || null,
          customerId: paymentIntent?.customer || null,
        }));

        // Clear payment session on success
        clearPaymentSession();
      } else {
        throw new Error('Payment confirmation failed');
      }

    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: error.message || 'Payment confirmation failed',
        lastError: error.message || 'Payment confirmation failed',
      }));
    }
  }, [state.sessionId, clearPaymentSession]);

  // Retry payment
  const retryPayment = useCallback(async () => {
    if (state.retryCount >= 3) {
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: 'Maximum retry attempts reached',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null,
    }));

    // Get saved session
    const savedSession = localStorage.getItem(PAYMENT_SESSION_KEY);
    if (savedSession) {
      try {
        const session: PaymentSession = JSON.parse(savedSession);
        await initializePayment(session.cartItems, session.metadata);
      } catch (error) {
        console.error('Failed to retry payment:', error);
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: 'Failed to retry payment',
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: 'No payment session found for retry',
      }));
    }
  }, [state.retryCount, initializePayment]);

  // Cancel payment
  const cancelPayment = useCallback(async () => {
    if (state.paymentIntent?.id) {
      try {
        // Cancel payment intent on server
        await fetch('/api/payment/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: state.paymentIntent.id,
          }),
        });
      } catch (error) {
        console.warn('Failed to cancel payment intent:', error);
      }
    }

    setState(prev => ({
      ...prev,
      status: 'canceled',
      error: null,
    }));

    // Clear payment session
    clearPaymentSession();
  }, [state.paymentIntent?.id, clearPaymentSession]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      lastError: null,
    }));
  }, []);

  // Reset payment state
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      paymentIntent: null,
      clientSecret: null,
      error: null,
      orderId: null,
      customerId: null,
      amount: null,
      currency: 'cad',
      retryCount: 0,
      lastError: null,
      sessionId: null,
    });

    // Clear payment session
    clearPaymentSession();
  }, [clearPaymentSession]);

  return {
    ...state,
    initializePayment,
    confirmPayment,
    retryPayment,
    cancelPayment,
    clearError,
    reset,
  };
};

export default useStripePayment;