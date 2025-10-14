import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from 'micro';
import {
  processCheckoutSessionCompleted,
  processPaymentIntentSucceeded,
  processPaymentIntentFailed,
  processChargeDisputeCreated,
  processInvoicePaymentSucceeded,
} from '../../../lib/stripe/webhookProcessors';
import { logWebhookEvent } from '../../../lib/stripe/dataSync';

// Disable Next.js body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Lazy initialization of Stripe
function getStripeInstance(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });
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
    const stripe = getStripeInstance();
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
    // Log webhook event start
    await logWebhookEvent({
      eventType: event.type,
      eventId: event.id,
      status: 'processing',
      metadata: {
        source: 'stripe_webhook_handler',
        timestamp: new Date().toISOString(),
      }
    });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await processCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await processPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await processPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'charge.dispute.created':
        await processChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;
      
      case 'invoice.payment_succeeded':
        await processInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    // Log successful processing
    await logWebhookEvent({
      eventType: event.type,
      eventId: event.id,
      status: 'success',
      metadata: {
        source: 'stripe_webhook_handler',
        processedAt: new Date().toISOString(),
      }
    });

    // Return success response
    res.status(200).json({ 
      received: true, 
      eventType: event.type,
      eventId: event.id 
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
    // Log failed processing
    await logWebhookEvent({
      eventType: event.type,
      eventId: event.id,
      status: 'failed',
      errorMessage: error.message,
      metadata: {
        source: 'stripe_webhook_handler',
        failedAt: new Date().toISOString(),
      }
    });
    
    // Return 500 for retries by Stripe
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message,
      received: false 
    });
  }
}
