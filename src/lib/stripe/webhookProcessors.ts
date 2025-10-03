import Stripe from 'stripe';
import { GraphQLClient, gql } from 'graphql-request';
import { 
  logPaymentAnalytics, 
  createOrderTracking, 
  updateOrderTracking, 
  updateCustomerPaymentHistory 
} from './cmsHooks';

// Initialize WordPress GraphQL client
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || '';
let wpClient: GraphQLClient | null = null;
if (WP_GRAPHQL_URL) {
  try {
    new URL(WP_GRAPHQL_URL);
    wpClient = new GraphQLClient(WP_GRAPHQL_URL);
  } catch (e) {
    console.warn('Invalid WP_GRAPHQL_URL in webhook processors:', WP_GRAPHQL_URL, e);
    wpClient = null;
  }
} else {
  console.warn('WP_GRAPHQL_URL not set in webhook processors.');
}

// GraphQL mutations
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

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
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

const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      success
      message
      customer {
        id
        email
        firstName
        lastName
      }
      errors
    }
  }
`;

// Type definitions
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

interface CreateOrderResponse {
  createOrder: {
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

interface UpdateCustomerResponse {
  updateCustomer: {
    success: boolean;
    message?: string;
    customer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    errors?: string[];
  };
}

/**
 * Process checkout session completed event
 */
export async function processCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Processing checkout.session.completed:', session.id);

  try {
    const paymentIntentId = session.payment_intent as string;
    const customerEmail = session.customer_details?.email;
    const amountTotal = session.amount_total || 0;
    const currency = session.currency;
    const customerName = session.customer_details?.name;

    // Extract order information
    let wpOrderId: string | null = null;
    
    if (session.metadata?.wpOrderId) {
      wpOrderId = session.metadata.wpOrderId;
    } else if (session.metadata?.orderId) {
      wpOrderId = session.metadata.orderId;
    }

    // If no existing order, create one
    if (!wpOrderId && wpClient) {
      const orderData = await createOrderFromSession(session);
      if (orderData?.order?.id) {
        wpOrderId = orderData.order.id;
      }
    }

    if (wpOrderId && wpClient) {
      // Update WordPress order status
      const updateInput = {
        orderId: parseInt(wpOrderId, 10),
        status: 'processing',
        paymentStatus: 'paid',
        paymentIntentId: paymentIntentId,
        stripeSessionId: session.id,
        amountPaid: amountTotal,
        currency: currency,
        customerEmail: customerEmail,
        customerName: customerName,
        metadata: {
          stripeWebhookProcessed: true,
          stripeEventId: session.id,
          processedAt: new Date().toISOString(),
          source: 'checkout_session_completed',
        }
      };

      const result = await wpClient.request<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, { input: updateInput });
      
      if (result.updateOrderStatus?.success) {
        console.log('Successfully updated WordPress order:', wpOrderId);
        
        // Trigger additional processes
        await triggerOrderProcesses(wpOrderId, session);
      } else {
        console.error('Failed to update WordPress order:', result.updateOrderStatus?.errors);
        throw new Error(`Failed to update order: ${result.updateOrderStatus?.errors?.join(', ')}`);
      }
    } else {
      console.warn('Cannot update order: missing wpOrderId or wpClient not configured');
    }

  } catch (error: any) {
    console.error('Error processing checkout.session.completed:', error);
    throw error;
  }
}

/**
 * Process payment intent succeeded event
 */
export async function processPaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Processing payment_intent.succeeded:', paymentIntent.id);

  try {
    const wpOrderId = paymentIntent.metadata?.wpOrderId || paymentIntent.metadata?.orderId;
    const amountReceived = paymentIntent.amount_received;
    const currency = paymentIntent.currency;
    const customerId = paymentIntent.customer as string;

    if (wpOrderId && wpClient) {
      // Update payment status in WordPress
      const updateInput = {
        orderId: parseInt(wpOrderId, 10),
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
        amountPaid: amountReceived,
        currency: currency,
        stripeCustomerId: customerId,
        metadata: {
          stripeWebhookProcessed: true,
          stripeEventId: paymentIntent.id,
          processedAt: new Date().toISOString(),
          source: 'payment_intent_succeeded',
        }
      };

      const result = await wpClient.request<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, { input: updateInput });
      
      if (result.updateOrderStatus?.success) {
        console.log('Successfully updated payment status for order:', wpOrderId);
        
        // Log payment analytics to CMS
        await logPaymentAnalytics({
          paymentIntentId: paymentIntent.id,
          orderId: wpOrderId,
          customerId: customerId,
          amount: amountReceived,
          currency: currency,
          status: 'success',
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'unknown',
          timestamp: new Date().toISOString(),
          metadata: {
            stripeEventId: paymentIntent.id,
            processedAt: new Date().toISOString(),
            source: 'payment_intent_succeeded',
          },
        });

        // Create or update order tracking in CMS
        await createOrderTracking({
          orderId: wpOrderId,
          paymentIntentId: paymentIntent.id,
          status: 'processing',
          paymentStatus: 'paid',
          customerEmail: paymentIntent.receipt_email,
          amount: amountReceived,
          currency: currency,
          lineItems: parseLineItemsFromMetadata(paymentIntent.metadata),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            stripeEventId: paymentIntent.id,
            processedAt: new Date().toISOString(),
            source: 'payment_intent_succeeded',
          },
        });

        // Update customer payment history
        if (customerId) {
          await updateCustomerPaymentHistory({
            customerId: customerId,
            paymentHistory: [{
              paymentIntentId: paymentIntent.id,
              orderId: wpOrderId,
              amount: amountReceived,
              currency: currency,
              status: 'success',
              timestamp: new Date().toISOString(),
            }],
            totalSpent: amountReceived,
            lastPaymentDate: new Date().toISOString(),
            metadata: {
              stripeEventId: paymentIntent.id,
              processedAt: new Date().toISOString(),
              source: 'payment_intent_succeeded',
            },
          });
        }
        
        // Trigger order fulfillment
        await triggerOrderFulfillment(wpOrderId, paymentIntent);
      } else {
        console.error('Failed to update payment status:', result.updateOrderStatus?.errors);
        throw new Error(`Failed to update payment status: ${result.updateOrderStatus?.errors?.join(', ')}`);
      }
    }

  } catch (error: any) {
    console.error('Error processing payment_intent.succeeded:', error);
    throw error;
  }
}

/**
 * Process payment intent failed event
 */
export async function processPaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

  try {
    const wpOrderId = paymentIntent.metadata?.wpOrderId || paymentIntent.metadata?.orderId;
    const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
    const failureCode = paymentIntent.last_payment_error?.code;

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
          failureCode: failureCode,
          processedAt: new Date().toISOString(),
          source: 'payment_intent_failed',
        }
      };

      const result = await wpClient.request<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, { input: updateInput });
      
      if (result.updateOrderStatus?.success) {
        console.log('Successfully updated failed payment for order:', wpOrderId);
        
        // Trigger failure notifications
        await triggerPaymentFailureNotifications(wpOrderId, paymentIntent);
      } else {
        console.error('Failed to update failed payment status:', result.updateOrderStatus?.errors);
        throw new Error(`Failed to update failed payment status: ${result.updateOrderStatus?.errors?.join(', ')}`);
      }
    }

  } catch (error: any) {
    console.error('Error processing payment_intent.payment_failed:', error);
    throw error;
  }
}

/**
 * Process charge dispute created event
 */
export async function processChargeDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  console.log('Processing charge.dispute.created:', dispute.id);

  try {
    const chargeId = dispute.charge as string;
    const amount = dispute.amount;
    const currency = dispute.currency;
    const reason = dispute.reason;

    // Find order by charge ID
    const wpOrderId = await findOrderByChargeId(chargeId);

    if (wpOrderId && wpClient) {
      const updateInput = {
        orderId: parseInt(wpOrderId, 10),
        status: 'disputed',
        paymentStatus: 'disputed',
        metadata: {
          stripeWebhookProcessed: true,
          stripeEventId: dispute.id,
          disputeId: dispute.id,
          disputeReason: reason,
          disputeAmount: amount,
          processedAt: new Date().toISOString(),
          source: 'charge_dispute_created',
        }
      };

      const result = await wpClient.request<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, { input: updateInput });
      
      if (result.updateOrderStatus?.success) {
        console.log('Successfully updated disputed order:', wpOrderId);
        
        // Trigger dispute notifications
        await triggerDisputeNotifications(wpOrderId, dispute);
      } else {
        console.error('Failed to update disputed order:', result.updateOrderStatus?.errors);
        throw new Error(`Failed to update disputed order: ${result.updateOrderStatus?.errors?.join(', ')}`);
      }
    }

  } catch (error: any) {
    console.error('Error processing charge.dispute.created:', error);
    throw error;
  }
}

/**
 * Process invoice payment succeeded event (for subscriptions)
 */
export async function processInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Processing invoice.payment_succeeded:', invoice.id);

  try {
    const subscriptionId = invoice.subscription as string;
    const customerId = invoice.customer as string;
    const amountPaid = invoice.amount_paid;
    const currency = invoice.currency;

    console.log('Invoice payment succeeded:', {
      invoiceId: invoice.id,
      subscriptionId,
      customerId,
      amountPaid,
      currency
    });

    // Update customer payment history
    if (wpClient) {
      await updateCustomerPaymentHistory(customerId, {
        invoiceId: invoice.id,
        subscriptionId,
        amountPaid,
        currency,
        paidAt: new Date().toISOString(),
      });
    }

  } catch (error: any) {
    console.error('Error processing invoice.payment_succeeded:', error);
    throw error;
  }
}

/**
 * Create order from checkout session
 */
async function createOrderFromSession(session: Stripe.Checkout.Session): Promise<CreateOrderResponse | null> {
  if (!wpClient) return null;

  try {
    const lineItems = session.line_items?.data || [];
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const shippingAddress = session.shipping_details?.address;

    const createInput = {
      customerEmail: customerEmail,
      customerName: customerName,
      shippingAddress: shippingAddress,
      lineItems: lineItems.map(item => ({
        productId: item.price?.product as string,
        quantity: item.quantity || 1,
        unitPrice: item.price?.unit_amount || 0,
        currency: item.price?.currency || 'cad',
      })),
      paymentIntentId: session.payment_intent as string,
      stripeSessionId: session.id,
      amountTotal: session.amount_total || 0,
      currency: session.currency,
      metadata: {
        source: 'stripe_checkout_session',
        stripeEventId: session.id,
        createdAt: new Date().toISOString(),
      }
    };

    const result = await wpClient.request<CreateOrderResponse>(CREATE_ORDER, { input: createInput });
    return result;

  } catch (error: any) {
    console.error('Error creating order from session:', error);
    return null;
  }
}

/**
 * Find order by charge ID
 */
async function findOrderByChargeId(chargeId: string): Promise<string | null> {
  // This would typically query your database or WordPress to find the order
  // For now, we'll return null as this requires database integration
  console.log('Finding order by charge ID:', chargeId);
  return null;
}

/**
 * Update customer payment history
 */
async function updateCustomerPaymentHistory(customerId: string, paymentData: any): Promise<void> {
  if (!wpClient) return;

  try {
    const updateInput = {
      customerId: customerId,
      paymentHistory: paymentData,
      metadata: {
        stripeWebhookProcessed: true,
        processedAt: new Date().toISOString(),
        source: 'invoice_payment_succeeded',
      }
    };

    await wpClient.request<UpdateCustomerResponse>(UPDATE_CUSTOMER, { input: updateInput });
    console.log('Updated customer payment history:', customerId);

  } catch (error: any) {
    console.error('Error updating customer payment history:', error);
  }
}

/**
 * Trigger order processes (email notifications, inventory updates, etc.)
 */
async function triggerOrderProcesses(orderId: string, session: Stripe.Checkout.Session): Promise<void> {
  console.log('Triggering order processes for order:', orderId);
  
  // Here you would trigger:
  // - Order confirmation emails
  // - Inventory updates
  // - Analytics tracking
  // - Fulfillment processes
  // - Customer notifications
  
  // For now, just log the action
  console.log('Order processes triggered:', {
    orderId,
    sessionId: session.id,
    customerEmail: session.customer_details?.email,
    amount: session.amount_total,
  });
}

/**
 * Trigger order fulfillment
 */
async function triggerOrderFulfillment(orderId: string, paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Triggering order fulfillment for order:', orderId);
  
  // Here you would trigger:
  // - Order fulfillment workflows
  // - Shipping label generation
  // - Installation scheduling
  // - Customer notifications
  
  console.log('Order fulfillment triggered:', {
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount_received,
  });
}

/**
 * Trigger payment failure notifications
 */
async function triggerPaymentFailureNotifications(orderId: string, paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Triggering payment failure notifications for order:', orderId);
  
  // Here you would trigger:
  // - Customer notification emails
  // - Admin alerts
  // - Retry mechanisms
  // - Support ticket creation
  
  console.log('Payment failure notifications triggered:', {
    orderId,
    paymentIntentId: paymentIntent.id,
    failureReason: paymentIntent.last_payment_error?.message,
  });
}

/**
 * Trigger dispute notifications
 */
async function triggerDisputeNotifications(orderId: string, dispute: Stripe.Dispute): Promise<void> {
  console.log('Triggering dispute notifications for order:', orderId);
  
  // Here you would trigger:
  // - Admin alerts
  // - Legal team notifications
  // - Customer communication
  // - Documentation gathering
  
  console.log('Dispute notifications triggered:', {
    orderId,
    disputeId: dispute.id,
    reason: dispute.reason,
    amount: dispute.amount,
  });
}

/**
 * Parse line items from payment intent metadata
 */
function parseLineItemsFromMetadata(metadata: Record<string, string>): Array<{
  productId: string;
  title: string;
  quantity: number;
  price: number;
}> {
  try {
    const itemsMetadata = metadata.items;
    if (!itemsMetadata) {
      return [];
    }

    const items = JSON.parse(itemsMetadata);
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.warn('Failed to parse line items from metadata:', error);
    return [];
  }
}

export default {
  processCheckoutSessionCompleted,
  processPaymentIntentSucceeded,
  processPaymentIntentFailed,
  processChargeDisputeCreated,
  processInvoicePaymentSucceeded,
};