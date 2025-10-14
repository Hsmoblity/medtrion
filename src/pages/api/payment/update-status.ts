import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

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
        // Here you would typically update your order management system
        // For now, we'll just log that we would update the order
        console.log('📋 Would update order status:', { orderId, paymentStatus: paymentIntent.status });
        
        // If you have a WordPress/WooCommerce backend, you might do something like:
        // await updateWooCommerceOrderStatus(orderId, paymentIntent.status);
        
        orderUpdateResult = {
          orderId,
          status: paymentIntent.status === 'succeeded' ? 'processing' : 'pending',
          paymentMethod: 'stripe',
          paymentIntentId: paymentIntent.id,
          updatedAt: new Date().toISOString()
        };
      } catch (orderError) {
        console.error('❌ Failed to update order status:', orderError);
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