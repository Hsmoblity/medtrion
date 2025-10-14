import Stripe from 'stripe';
import { CartProduct } from '../interfaces';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export interface PaymentIntentOptions {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
  receiptEmail?: string;
  shipping?: Stripe.PaymentIntentCreateParams.Shipping;
}

export interface PaymentIntentResult {
  success: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  error?: string;
}

/**
 * Create a payment intent for the given amount
 */
export async function createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResult> {
  try {
    const {
      amount,
      currency = 'cad',
      customerId,
      metadata = {},
      description,
      receiptEmail,
      shipping,
    } = options;

    // Validate amount
    if (amount < 50) { // Minimum $0.50
      return {
        success: false,
        error: 'Amount must be at least $0.50',
      };
    }

    // Create or retrieve customer
    let stripeCustomerId = customerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: {
          source: 'payment-intents',
          created_at: new Date().toISOString(),
        },
      });
      stripeCustomerId = customer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      payment_method_types: ['card'], // Only allow card payments
      metadata: {
        ...metadata,
        source: 'payment-intents',
        timestamp: new Date().toISOString(),
      },
      description: description || 'Payment for HSMobility order',
      receipt_email: receiptEmail,
      shipping,
    });

    console.log('Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: paymentIntent.customer,
    });

    return {
      success: true,
      paymentIntent,
    };

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    if (error.type === 'StripeCardError') {
      return { success: false, error: error.message };
    } else if (error.type === 'StripeRateLimitError') {
      return { success: false, error: 'Too many requests. Please try again later.' };
    } else if (error.type === 'StripeInvalidRequestError') {
      return { success: false, error: 'Invalid request. Please check your data.' };
    } else if (error.type === 'StripeAPIError') {
      return { success: false, error: 'Payment service error. Please try again.' };
    } else if (error.type === 'StripeConnectionError') {
      return { success: false, error: 'Network error. Please check your connection.' };
    } else if (error.type === 'StripeAuthenticationError') {
      return { success: false, error: 'Authentication error. Please contact support.' };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred while creating payment intent',
    };
  }
}

/**
 * Retrieve a payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      paymentIntent,
    };

  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return { success: false, error: 'Payment intent not found' };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred while retrieving payment intent',
    };
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<PaymentIntentResult> {
  try {
    const confirmParams: Stripe.PaymentIntentConfirmParams = {};
    
    if (paymentMethodId) {
      confirmParams.payment_method = paymentMethodId;
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, confirmParams);

    return {
      success: true,
      paymentIntent,
    };

  } catch (error: any) {
    console.error('Error confirming payment intent:', error);
    
    if (error.type === 'StripeCardError') {
      return { success: false, error: error.message };
    } else if (error.type === 'StripeInvalidRequestError') {
      return { success: false, error: 'Invalid payment intent or payment method' };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred while confirming payment intent',
    };
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
      success: true,
      paymentIntent,
    };

  } catch (error: any) {
    console.error('Error canceling payment intent:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return { success: false, error: 'Payment intent cannot be canceled' };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred while canceling payment intent',
    };
  }
}

/**
 * Calculate total amount from cart items
 */
export function calculateCartTotal(cartItems: CartProduct[]): number {
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
}

/**
 * Calculate total with tax
 */
export function calculateTotalWithTax(amount: number, taxRate: number = 0.13): number {
  return amount + (amount * taxRate);
}

/**
 * Create payment intent from cart items
 */
export async function createPaymentIntentFromCart(
  cartItems: CartProduct[],
  options: Partial<PaymentIntentOptions> = {}
): Promise<PaymentIntentResult> {
  const subtotal = calculateCartTotal(cartItems);
  const total = calculateTotalWithTax(subtotal);
  
  const metadata = {
    ...options.metadata,
    itemCount: cartItems.length.toString(),
    items: JSON.stringify(cartItems.map(item => ({
      productId: item.productId,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
    }))),
  };

  return createPaymentIntent({
    amount: total,
    currency: 'cad',
    metadata,
    description: `Payment for ${cartItems.length} item(s) from HSMobility`,
    ...options,
  });
}

export default {
  createPaymentIntent,
  getPaymentIntent,
  confirmPaymentIntent,
  cancelPaymentIntent,
  calculateCartTotal,
  calculateTotalWithTax,
  createPaymentIntentFromCart,
};