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

// WordPress REST API configuration
const WP_REST_URL = process.env.WP_GRAPHQL_URL ? process.env.WP_GRAPHQL_URL.replace('/graphql', '') : 'https://cms.hsmobility.ca';

interface OrderUpdateResponse {
  success: boolean;
  message?: string;
  order?: {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: string;
    currency: string;
    paymentMethod: string;
    transactionId: string;
  };
}

interface UpdatePaymentStatusRequest {
  paymentIntentId: string;
  orderId?: string;
  status: 'succeeded' | 'failed' | 'processing' | 'requires_action';
}

interface UpdatePaymentStatusResponse {
  success: boolean;
  paymentIntent?: any;
  order?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdatePaymentStatusResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Initialize Stripe inside the handler
    const stripe = getStripeInstance();
    
    const { paymentIntentId, orderId, status }: UpdatePaymentStatusRequest = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, error: 'Payment intent ID is required' });
    }

    console.log('🔄 Updating payment status for:', { paymentIntentId, orderId, status });

    // Retrieve the current payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('📄 Current payment intent status:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

    // Update order status if orderId is provided
    let orderUpdateResult = null;
    if (orderId) {
      try {
        console.log('📋 Updating order status via WordPress REST API:', { orderId, paymentStatus: paymentIntent.status });
        
        // Prepare order update data
        const updateData = {
          orderId: parseInt(orderId, 10),
          status: paymentIntent.status === 'succeeded' ? 'processing' : 'pending',
          paymentStatus: paymentIntent.status === 'succeeded' ? 'paid' : 'pending',
          paymentIntentId: paymentIntent.id,
          amountPaid: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: {
            stripeProcessed: true,
            lastStatusUpdate: new Date().toISOString(),
            source: 'payment_update_status_api',
          }
        };

        // Call WordPress REST API to update order
        const response = await fetch(`${WP_REST_URL}/wp-json/hsm-stripe/v1/orders/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          throw new Error(`WordPress API returned ${response.status}: ${response.statusText}`);
        }

        const result: OrderUpdateResponse = await response.json();
        
        if (result.success) {
          console.log('✅ Successfully updated WordPress order via REST API:', orderId, result.order);
          orderUpdateResult = {
            orderId,
            status: result.order?.status || 'processing',
            paymentStatus: result.order?.paymentStatus || 'paid',
            paymentMethod: 'stripe',
            paymentIntentId: paymentIntent.id,
            updatedAt: new Date().toISOString(),
            wpOrderData: result.order
          };
        } else {
          console.error('❌ Failed to update WordPress order via REST API:', result.message);
          throw new Error(`WordPress order update failed: ${result.message}`);
        }
        
      } catch (orderError) {
        console.error('❌ Failed to update order status in WordPress:', orderError);
        
        // Fall back to logging the attempted update
        console.log('📋 Fallback: Would update order status:', { orderId, paymentStatus: paymentIntent.status });
        orderUpdateResult = {
          orderId,
          status: paymentIntent.status === 'succeeded' ? 'processing' : 'pending',
          paymentMethod: 'stripe',
          paymentIntentId: paymentIntent.id,
          updatedAt: new Date().toISOString(),
          error: orderError instanceof Error ? orderError.message : 'Unknown error'
        };
      }
    }

    // Update payment intent metadata to track our processing
    try {
      const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          ...paymentIntent.metadata,
          lastStatusCheck: new Date().toISOString(),
          orderProcessed: orderId ? 'true' : 'false',
          orderStatus: orderUpdateResult?.status || 'unknown'
        }
      });

      console.log('✅ Payment intent metadata updated successfully');

      return res.status(200).json({
        success: true,
        paymentIntent: {
          id: updatedPaymentIntent.id,
          status: updatedPaymentIntent.status,
          amount: updatedPaymentIntent.amount,
          currency: updatedPaymentIntent.currency,
          metadata: updatedPaymentIntent.metadata
        },
        order: orderUpdateResult
      });

    } catch (stripeError) {
      console.error('❌ Failed to update Stripe payment intent metadata:', stripeError);
      
      // Still return success if the main operation worked
      return res.status(200).json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        },
        order: orderUpdateResult
      });
    }

  } catch (error: any) {
    console.error('❌ Error updating payment status:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ success: false, error: 'Invalid payment intent ID' });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update payment status' 
    });
  }
}