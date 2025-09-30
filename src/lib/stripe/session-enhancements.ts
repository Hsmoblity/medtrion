import Stripe from 'stripe';

/**
 * Session Enhancement Utilities for Stripe Payment Integration
 * 
 * This module provides enhancements to the existing Stripe session creation
 * to support webhook processing and improved error handling.
 */

// Type definitions
export interface SessionEnhancementOptions {
  includeWebhookMetadata?: boolean;
  includePaymentIntentMetadata?: boolean;
  customMetadata?: Record<string, string>;
  enhancedUrls?: boolean;
}

export interface CartItem {
  productId?: string;
  variationId?: string;
  quantity: number;
  price: number;
  title: string;
  slug?: string;
}

/**
 * Enhance Stripe session metadata for webhook processing
 */
export function enhanceSessionMetadata(
  items: CartItem[],
  options: SessionEnhancementOptions = {}
): Record<string, string> {
  const baseMetadata: Record<string, string> = {
    source: 'headless-nextjs-webhook-enhanced',
    timestamp: new Date().toISOString(),
    itemCount: items.length.toString(),
  };

  if (options.includeWebhookMetadata) {
    // Add cart items summary for webhook processing
    const itemsSummary = items.map(item => ({
      productId: item.productId,
      variationId: item.variationId,
      quantity: item.quantity,
      title: item.title.substring(0, 50), // Truncate for metadata limits
    }));

    // Stripe metadata has a 500 character limit per value
    baseMetadata.cartItems = JSON.stringify(itemsSummary).substring(0, 500);
  }

  if (options.customMetadata) {
    Object.assign(baseMetadata, options.customMetadata);
  }

  return baseMetadata;
}

/**
 * Enhance payment intent metadata for webhook processing
 */
export function enhancePaymentIntentMetadata(
  items: CartItem[],
  options: SessionEnhancementOptions = {}
): Record<string, string> {
  const baseMetadata: Record<string, string> = {
    source: 'headless-nextjs',
    itemCount: items.length.toString(),
    timestamp: new Date().toISOString(),
  };

  if (options.includePaymentIntentMetadata) {
    // Calculate total value for payment intent metadata
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    baseMetadata.totalValue = totalValue.toString();

    // Add product categories if available
    const productIds = items.map(item => item.productId).filter(Boolean);
    if (productIds.length > 0) {
      baseMetadata.productIds = productIds.join(',').substring(0, 500);
    }
  }

  if (options.customMetadata) {
    Object.assign(baseMetadata, options.customMetadata);
  }

  return baseMetadata;
}

/**
 * Generate enhanced success and cancel URLs with session tracking
 */
export function generateEnhancedUrls(
  origin: string,
  wpOrderId?: string
): { successUrl: string; cancelUrl: string } {
  const baseParams = wpOrderId ? `&wp_order_id=${wpOrderId}` : '';
  
  return {
    successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}${baseParams}`,
    cancelUrl: `${origin}/payment/cancel?session_id={CHECKOUT_SESSION_ID}${baseParams}`,
  };
}

/**
 * Enhanced error handling for session creation
 */
export class SessionCreationError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'SessionCreationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Retry mechanism for session creation with exponential backoff
 */
export async function retrySessionCreation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for certain types of errors
      if (error.type === 'StripeInvalidRequestError') {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`Session creation attempt ${attempt} failed, retrying in ${Math.round(delay)}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new SessionCreationError(
    'Session creation failed after multiple attempts',
    'RETRY_EXHAUSTED',
    { originalError: lastError, attempts: maxRetries }
  );
}

/**
 * Validate session creation input
 */
export function validateSessionInput(items: CartItem[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!items || items.length === 0) {
    errors.push('Cart is empty');
  }

  items.forEach((item, index) => {
    if (!item.title || item.title.trim().length === 0) {
      errors.push(`Item ${index + 1}: Missing title`);
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Invalid quantity`);
    }

    if (item.price === undefined || item.price < 0) {
      errors.push(`Item ${index + 1}: Invalid price`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Enhanced shipping options handling
 */
export async function getEnhancedShippingOptions(
  stripe: Stripe,
  items: CartItem[]
): Promise<Array<{ shipping_rate: string }>> {
  try {
    // Get shipping rates with enhanced filtering
    const shippingRates = await stripe.shippingRates.list({ 
      limit: 10,
      active: true 
    });

    // Filter shipping rates based on cart contents if needed
    // For now, return all active rates
    return shippingRates.data.map(rate => ({ shipping_rate: rate.id }));
  } catch (error: any) {
    console.warn('Failed to fetch shipping rates:', error.message);
    
    // Return empty array as fallback - Stripe will use default shipping
    return [];
  }
}

/**
 * Calculate order totals for metadata
 */
export function calculateOrderTotals(items: CartItem[]): {
  subtotal: number;
  itemCount: number;
  averageItemPrice: number;
} {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const averageItemPrice = totalItems > 0 ? subtotal / totalItems : 0;

  return {
    subtotal,
    itemCount: totalItems,
    averageItemPrice: Math.round(averageItemPrice * 100) / 100
  };
}

/**
 * Enhanced logging for session creation
 */
export function logSessionCreation(
  sessionId: string,
  items: CartItem[],
  success: boolean,
  error?: string
) {
  const totals = calculateOrderTotals(items);
  
  const logData = {
    timestamp: new Date().toISOString(),
    sessionId,
    success,
    error,
    orderSummary: {
      itemCount: items.length,
      totalQuantity: totals.itemCount,
      subtotal: totals.subtotal,
      averageItemPrice: totals.averageItemPrice,
    }
  };

  if (success) {
    console.log('Enhanced session created successfully:', logData);
  } else {
    console.error('Enhanced session creation failed:', logData);
  }

  // In production, you might want to send this to analytics
  // analytics.track('stripe_session_created', logData);
}