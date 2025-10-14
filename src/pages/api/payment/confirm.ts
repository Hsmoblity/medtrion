import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe lazily inside the handler
function getStripeInstance(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });
}

interface ConfirmPaymentRequest {
  paymentIntentId: string;
  metadata?: Record<string, string>;
}

interface ConfirmPaymentResponse {
  success: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  orderId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfirmPaymentResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Stripe inside the handler
    const stripe = getStripeInstance();
    
    const { paymentIntentId, metadata = {} }: ConfirmPaymentRequest = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({ error: 'Payment intent not found' });
    }

    // Check if payment was successful
    if (paymentIntent.status === 'succeeded') {
      // Create order in WordPress/WooCommerce
      const orderId = await createOrderFromPaymentIntent(paymentIntent);

      // Update payment intent with order information
      if (orderId) {
        await stripe.paymentIntents.update(paymentIntentId, {
          metadata: {
            ...paymentIntent.metadata,
            orderId: orderId.toString(),
            orderCreatedAt: new Date().toISOString(),
          },
        });
      }

      console.log('Payment confirmed successfully:', {
        paymentIntentId,
        orderId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });

      res.status(200).json({
        success: true,
        paymentIntent,
        orderId: orderId?.toString(),
      });
    } else if (paymentIntent.status === 'requires_payment_method') {
      res.status(400).json({ 
        error: 'Payment method is required. Please try again with a different payment method.' 
      });
    } else if (paymentIntent.status === 'requires_confirmation') {
      res.status(400).json({ 
        error: 'Payment requires confirmation. Please try again.' 
      });
    } else if (paymentIntent.status === 'requires_action') {
      res.status(400).json({ 
        error: 'Payment requires additional action. Please complete the payment.' 
      });
    } else if (paymentIntent.status === 'processing') {
      res.status(200).json({
        success: true,
        paymentIntent,
        // Don't create order yet, wait for webhook
      });
    } else if (paymentIntent.status === 'canceled') {
      res.status(400).json({ 
        error: 'Payment was canceled. Please try again.' 
      });
    } else {
      res.status(400).json({ 
        error: `Payment status is ${paymentIntent.status}. Please try again.` 
      });
    }

  } catch (error: any) {
    console.error('Error confirming payment:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ error: error.message });
    } else if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: 'Invalid request. Please check your data.' });
    } else if (error.type === 'StripeAPIError') {
      return res.status(500).json({ error: 'Payment service error. Please try again.' });
    } else if (error.type === 'StripeConnectionError') {
      return res.status(500).json({ error: 'Network error. Please check your connection.' });
    } else if (error.type === 'StripeAuthenticationError') {
      return res.status(500).json({ error: 'Authentication error. Please contact support.' });
    }

    res.status(500).json({ 
      error: error.message || 'An unexpected error occurred while confirming payment' 
    });
  }
}

async function createOrderFromPaymentIntent(paymentIntent: Stripe.PaymentIntent): Promise<string | null> {
  try {
    // Parse items from metadata
    const itemsMetadata = paymentIntent.metadata.items;
    if (!itemsMetadata) {
      console.warn('No items metadata found in payment intent:', paymentIntent.id);
      return null;
    }

    const items = JSON.parse(itemsMetadata);
    
    // Create order via WordPress GraphQL
    const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL;
    if (!WP_GRAPHQL_URL) {
      console.warn('WP_GRAPHQL_URL not configured, skipping order creation');
      return null;
    }

    // For now, return a mock order ID
    // In a real implementation, you would:
    // 1. Create order in WooCommerce via GraphQL
    // 2. Add line items
    // 3. Set payment method
    // 4. Set order status to 'processing'
    // 5. Return the actual order ID

    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Order created (mock):', {
      orderId: mockOrderId,
      paymentIntentId: paymentIntent.id,
      items: items.length,
      amount: paymentIntent.amount,
    });

    return mockOrderId;

  } catch (error) {
    console.error('Error creating order from payment intent:', error);
    return null;
  }
}