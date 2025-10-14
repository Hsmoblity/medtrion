import Stripe from 'stripe';
import { GraphQLClient } from 'graphql-request';

/**
 * Webhook Handler Utilities for Stripe Payment Integration
 * 
 * This module provides utility functions for processing Stripe webhook events
 * and updating WordPress orders via GraphQL.
 */

// Lazy initialization of Stripe
let stripe: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (stripe) return stripe;
  
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });
  
  return stripe;
}

// Type definitions
export interface WebhookHandlerContext {
  wpClient: GraphQLClient | null;
  event: Stripe.Event;
}

export interface OrderUpdateData {
  orderId: number;
  status?: string;
  paymentStatus?: string;
  paymentIntentId?: string;
  stripeSessionId?: string;
  amountPaid?: number;
  currency?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

/**
 * Verify webhook signature from Stripe
 */
export function verifyWebhookSignature(
  body: Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    const stripe = getStripeInstance();
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}

/**
 * Extract WordPress order ID from various Stripe objects
 */
export function extractOrderId(stripeObject: any): string | null {
  // Try to get order ID from metadata
  if (stripeObject.metadata?.wpOrderId) {
    return stripeObject.metadata.wpOrderId;
  }

  // For checkout sessions, also check payment intent metadata
  if (stripeObject.payment_intent) {
    const paymentIntentId = stripeObject.payment_intent;
    // Note: In a real implementation, you might need to fetch the payment intent
    // to get its metadata if it's not included in the session object
    console.log('PaymentIntent ID found:', paymentIntentId);
  }

  return null;
}

/**
 * Create order update payload for WordPress
 */
export function createOrderUpdatePayload(
  orderId: string,
  eventType: string,
  stripeObject: any
): OrderUpdateData {
  const basePayload: OrderUpdateData = {
    orderId: parseInt(orderId, 10),
    metadata: {
      stripeWebhookProcessed: true,
      stripeEventType: eventType,
      processedAt: new Date().toISOString(),
    }
  };

  switch (eventType) {
    case 'checkout.session.completed':
      const session = stripeObject as Stripe.Checkout.Session;
      return {
        ...basePayload,
        status: 'processing',
        paymentStatus: 'paid',
        paymentIntentId: session.payment_intent as string,
        stripeSessionId: session.id,
        amountPaid: session.amount_total || 0,
        currency: session.currency || undefined,
        customerEmail: session.customer_details?.email || undefined,
      };

    case 'payment_intent.succeeded':
      const paymentIntent = stripeObject as Stripe.PaymentIntent;
      return {
        ...basePayload,
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
        amountPaid: paymentIntent.amount_received,
        currency: paymentIntent.currency,
      };

    case 'payment_intent.payment_failed':
      const failedPayment = stripeObject as Stripe.PaymentIntent;
      return {
        ...basePayload,
        status: 'failed',
        paymentStatus: 'failed',
        paymentIntentId: failedPayment.id,
        metadata: {
          ...basePayload.metadata,
          failureReason: failedPayment.last_payment_error?.message || 'Payment failed',
        }
      };

    default:
      return basePayload;
  }
}

/**
 * Log webhook processing for debugging and monitoring
 */
export function logWebhookProcessing(
  event: Stripe.Event,
  orderId: string | null,
  success: boolean,
  error?: string
) {
  const logData = {
    timestamp: new Date().toISOString(),
    eventId: event.id,
    eventType: event.type,
    orderId: orderId,
    success: success,
    error: error,
  };

  if (success) {
    console.log('Webhook processed successfully:', logData);
  } else {
    console.error('Webhook processing failed:', logData);
  }

  // In a production environment, you might want to send this to a monitoring service
  // like DataDog, Sentry, or CloudWatch
}

/**
 * Retry mechanism for failed webhook processing
 */
export async function retryWebhookProcessing<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Webhook processing attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Validate webhook event data
 */
export function validateWebhookEvent(event: Stripe.Event): boolean {
  // Basic validation
  if (!event.id || !event.type || !event.data || !event.data.object) {
    console.error('Invalid webhook event structure');
    return false;
  }

  // Event-specific validation
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session.id || !session.payment_status) {
        console.error('Invalid checkout session data');
        return false;
      }
      break;

    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (!paymentIntent.id || !paymentIntent.status) {
        console.error('Invalid payment intent data');
        return false;
      }
      break;
  }

  return true;
}

/**
 * Rate limiting for webhook processing
 */
const webhookProcessingCache = new Map<string, number>();

export function isRateLimited(eventId: string, windowMs: number = 60000): boolean {
  const now = Date.now();
  const lastProcessed = webhookProcessingCache.get(eventId);

  if (lastProcessed && (now - lastProcessed) < windowMs) {
    console.warn(`Webhook event ${eventId} rate limited`);
    return true;
  }

  webhookProcessingCache.set(eventId, now);
  
  // Cleanup old entries
  webhookProcessingCache.forEach((timestamp, id) => {
    if ((now - timestamp) > windowMs) {
      webhookProcessingCache.delete(id);
    }
  });

  return false;
}

/**
 * Security utilities for webhook processing
 */
export const WebhookSecurity = {
  /**
   * Sanitize event data for logging
   */
  sanitizeEventData(event: Stripe.Event): any {
    const sanitized = { ...event };
    
    // Remove sensitive data before logging
    if (sanitized.data && sanitized.data.object) {
      const obj = sanitized.data.object as any;
      
      // Remove sensitive payment method details
      if (obj.payment_method_details) {
        delete obj.payment_method_details;
      }
      
      // Remove customer details for privacy
      if (obj.customer_details?.email) {
        obj.customer_details.email = '[REDACTED]';
      }
    }
    
    return sanitized;
  },

  /**
   * Validate IP address if needed
   */
  validateSourceIp(req: any): boolean {
    // Stripe webhook IPs (you might want to validate against these in production)
    // This is optional as signature verification is the primary security measure
    return true;
  }
};