import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { GraphQLClient, gql } from 'graphql-request';
import { buffer } from 'micro';

// Disable Next.js body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2024-04-10",
});

// Initialize WordPress GraphQL client
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || '';
let wpClient: GraphQLClient | null = null;
if (WP_GRAPHQL_URL) {
  try {
    new URL(WP_GRAPHQL_URL);
    wpClient = new GraphQLClient(WP_GRAPHQL_URL);
  } catch (e) {
    console.warn('Invalid WP_GRAPHQL_URL in webhook:', WP_GRAPHQL_URL, e);
    wpClient = null;
  }
} else {
  console.warn('WP_GRAPHQL_URL not set in webhook.');
}

// GraphQL mutation to update order status
const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      success
      message
      order {
        id
        orderNumber
        status
        paymentStatus
      }
      errors
    }
  }
`;

// Type definitions for GraphQL responses
interface UpdateOrderStatusResponse {
  updateOrderStatus: {
    success: boolean;
    message?: string;
    order?: {
      id: string;
      orderNumber: string;
      status: string;
      paymentStatus: string;
    };
    errors?: string[];
  };
}

export default async function webhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Get the webhook secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ 
      error: 'Webhook secret not configured',
      received: false 
    });
  }

  // Get raw body for signature verification
  let body: Buffer;
  try {
    body = await buffer(req);
  } catch (err) {
    console.error('Error reading request body:', err);
    return res.status(400).json({ 
      error: 'Error reading request body',
      received: false 
    });
  }

  // Get Stripe signature from headers
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    console.error('Missing Stripe signature');
    return res.status(400).json({ 
      error: 'Missing Stripe signature',
      received: false 
    });
  }

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature as string,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ 
      error: `Webhook signature verification failed: ${err.message}`,
      received: false 
    });
  }

  console.log(`Received Stripe webhook event: ${event.type} [${event.id}]`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    // Return success response
    res.status(200).json({ 
      received: true, 
      eventType: event.type,
      eventId: event.id 
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
    // Return 500 for retries by Stripe
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message,
      received: false 
    });
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id);

  try {
    // Extract order information from session metadata or payment intent
    const paymentIntentId = session.payment_intent as string;
    const customerEmail = session.customer_details?.email;
    const amountTotal = session.amount_total || 0;
    const currency = session.currency;

    // Get WordPress order ID from session metadata
    let wpOrderId: string | null = null;
    
    // Try to get order ID from session metadata
    if (session.metadata?.wpOrderId) {
      wpOrderId = session.metadata.wpOrderId;
    }
    
    // If no order ID in metadata, try to find order by payment intent
    if (!wpOrderId && paymentIntentId) {
      // You might need to implement a function to find order by payment intent
      console.log('No wpOrderId in session metadata, payment_intent:', paymentIntentId);
    }

    if (wpOrderId && wpClient) {
      // Update WordPress order status
      const updateInput = {
        orderId: parseInt(wpOrderId, 10),
        status: 'processing', // or 'completed' based on your business logic
        paymentStatus: 'paid',
        paymentIntentId: paymentIntentId,
        stripeSessionId: session.id,
        amountPaid: amountTotal,
        currency: currency,
        customerEmail: customerEmail,
        metadata: {
          stripeWebhookProcessed: true,
          stripeEventId: session.id,
          processedAt: new Date().toISOString(),
        }
      };

      const result = await wpClient.request<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, { input: updateInput });
      
      if (result.updateOrderStatus?.success) {
        console.log('Successfully updated WordPress order:', wpOrderId);
      } else {
        console.error('Failed to update WordPress order:', result.updateOrderStatus?.errors);
      }
    } else {
      console.warn('Cannot update order: missing wpOrderId or wpClient not configured');
    }

    // Additional processing can be added here:
    // - Send confirmation emails
    // - Update inventory
    // - Trigger fulfillment processes
    // - Analytics tracking

  } catch (error: any) {
    console.error('Error handling checkout.session.completed:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment_intent.succeeded:', paymentIntent.id);

  try {
    // Extract order information from payment intent metadata
    const wpOrderId = paymentIntent.metadata?.wpOrderId;
    const amountReceived = paymentIntent.amount_received;
    const currency = paymentIntent.currency;

    if (wpOrderId && wpClient) {
      // Update payment status in WordPress
      const updateInput = {
        orderId: parseInt(wpOrderId, 10),
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
        amountPaid: amountReceived,
        currency: currency,
        metadata: {
          stripeWebhookProcessed: true,
          stripeEventId: paymentIntent.id,
          processedAt: new Date().toISOString(),
        }
      };

      const result = await wpClient.request<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, { input: updateInput });
      
      if (result.updateOrderStatus?.success) {
        console.log('Successfully updated payment status for order:', wpOrderId);
      } else {
        console.error('Failed to update payment status:', result.updateOrderStatus?.errors);
      }
    }

  } catch (error: any) {
    console.error('Error handling payment_intent.succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

  try {
    const wpOrderId = paymentIntent.metadata?.wpOrderId;
    const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';

    if (wpOrderId && wpClient) {
      // Update order status to failed
      const updateInput = {
        orderId: parseInt(wpOrderId, 10),
        status: 'failed',
        paymentStatus: 'failed',
        paymentIntentId: paymentIntent.id,
        metadata: {
          stripeWebhookProcessed: true,
          stripeEventId: paymentIntent.id,
          failureReason: failureReason,
          processedAt: new Date().toISOString(),
        }
      };

      const result = await wpClient.request<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, { input: updateInput });
      
      if (result.updateOrderStatus?.success) {
        console.log('Successfully updated failed payment for order:', wpOrderId);
      } else {
        console.error('Failed to update failed payment status:', result.updateOrderStatus?.errors);
      }
    }

  } catch (error: any) {
    console.error('Error handling payment_intent.payment_failed:', error);
    throw error;
  }
}

/**
 * Handle successful invoice payment (for subscription scenarios)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id);

  try {
    // Handle subscription or recurring payment success
    // This might be used for future subscription features
    
    const subscriptionId = invoice.subscription as string;
    const customerId = invoice.customer as string;
    const amountPaid = invoice.amount_paid;

    console.log('Invoice payment succeeded:', {
      invoiceId: invoice.id,
      subscriptionId,
      customerId,
      amountPaid
    });

    // Add subscription-specific logic here when needed

  } catch (error: any) {
    console.error('Error handling invoice.payment_succeeded:', error);
    throw error;
  }
}