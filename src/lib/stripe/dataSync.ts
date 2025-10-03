import { GraphQLClient, gql } from 'graphql-request';

// Initialize WordPress GraphQL client
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || '';
let wpClient: GraphQLClient | null = null;
if (WP_GRAPHQL_URL) {
  try {
    new URL(WP_GRAPHQL_URL);
    wpClient = new GraphQLClient(WP_GRAPHQL_URL);
  } catch (e) {
    console.warn('Invalid WP_GRAPHQL_URL in data sync:', WP_GRAPHQL_URL, e);
    wpClient = null;
  }
} else {
  console.warn('WP_GRAPHQL_URL not set in data sync.');
}

// GraphQL mutations for data synchronization
const SYNC_ORDER_DATA = gql`
  mutation SyncOrderData($input: SyncOrderDataInput!) {
    syncOrderData(input: $input) {
      success
      message
      order {
        id
        orderNumber
        status
        paymentStatus
        stripePaymentIntentId
        stripeCustomerId
      }
      errors
    }
  }
`;

const SYNC_CUSTOMER_DATA = gql`
  mutation SyncCustomerData($input: SyncCustomerDataInput!) {
    syncCustomerData(input: $input) {
      success
      message
      customer {
        id
        email
        firstName
        lastName
        stripeCustomerId
      }
      errors
    }
  }
`;

const UPDATE_INVENTORY = gql`
  mutation UpdateInventory($input: UpdateInventoryInput!) {
    updateInventory(input: $input) {
      success
      message
      product {
        id
        name
        stockQuantity
        stockStatus
      }
      errors
    }
  }
`;

const LOG_WEBHOOK_EVENT = gql`
  mutation LogWebhookEvent($input: LogWebhookEventInput!) {
    logWebhookEvent(input: $input) {
      success
      message
      logEntry {
        id
        eventType
        eventId
        processedAt
        status
      }
      errors
    }
  }
`;

// Type definitions
interface SyncOrderDataResponse {
  syncOrderData: {
    success: boolean;
    message?: string;
    order?: {
      id: string;
      orderNumber: string;
      status: string;
      paymentStatus: string;
      stripePaymentIntentId: string;
      stripeCustomerId: string;
    };
    errors?: string[];
  };
}

interface SyncCustomerDataResponse {
  syncCustomerData: {
    success: boolean;
    message?: string;
    customer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      stripeCustomerId: string;
    };
    errors?: string[];
  };
}

interface UpdateInventoryResponse {
  updateInventory: {
    success: boolean;
    message?: string;
    product?: {
      id: string;
      name: string;
      stockQuantity: number;
      stockStatus: string;
    };
    errors?: string[];
  };
}

interface LogWebhookEventResponse {
  logWebhookEvent: {
    success: boolean;
    message?: string;
    logEntry?: {
      id: string;
      eventType: string;
      eventId: string;
      processedAt: string;
      status: string;
    };
    errors?: string[];
  };
}

/**
 * Synchronize order data between Stripe and WordPress
 */
export async function syncOrderData(orderData: {
  orderId: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  paymentStatus: string;
  orderStatus: string;
  amountPaid: number;
  currency: string;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  if (!wpClient) {
    console.warn('WordPress client not configured for order sync');
    return false;
  }

  try {
    const syncInput = {
      orderId: parseInt(orderData.orderId, 10),
      stripePaymentIntentId: orderData.stripePaymentIntentId,
      stripeCustomerId: orderData.stripeCustomerId,
      paymentStatus: orderData.paymentStatus,
      orderStatus: orderData.orderStatus,
      amountPaid: orderData.amountPaid,
      currency: orderData.currency,
      metadata: {
        ...orderData.metadata,
        syncedAt: new Date().toISOString(),
        source: 'stripe_webhook_sync',
      }
    };

    const result = await wpClient.request<SyncOrderDataResponse>(SYNC_ORDER_DATA, { input: syncInput });
    
    if (result.syncOrderData?.success) {
      console.log('Successfully synced order data:', orderData.orderId);
      return true;
    } else {
      console.error('Failed to sync order data:', result.syncOrderData?.errors);
      return false;
    }

  } catch (error: any) {
    console.error('Error syncing order data:', error);
    return false;
  }
}

/**
 * Synchronize customer data between Stripe and WordPress
 */
export async function syncCustomerData(customerData: {
  customerId: string;
  stripeCustomerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  paymentMethods?: any[];
  metadata?: Record<string, any>;
}): Promise<boolean> {
  if (!wpClient) {
    console.warn('WordPress client not configured for customer sync');
    return false;
  }

  try {
    const syncInput = {
      customerId: parseInt(customerData.customerId, 10),
      stripeCustomerId: customerData.stripeCustomerId,
      email: customerData.email,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      paymentMethods: customerData.paymentMethods,
      metadata: {
        ...customerData.metadata,
        syncedAt: new Date().toISOString(),
        source: 'stripe_webhook_sync',
      }
    };

    const result = await wpClient.request<SyncCustomerDataResponse>(SYNC_CUSTOMER_DATA, { input: syncInput });
    
    if (result.syncCustomerData?.success) {
      console.log('Successfully synced customer data:', customerData.customerId);
      return true;
    } else {
      console.error('Failed to sync customer data:', result.syncCustomerData?.errors);
      return false;
    }

  } catch (error: any) {
    console.error('Error syncing customer data:', error);
    return false;
  }
}

/**
 * Update inventory based on order data
 */
export async function updateInventoryFromOrder(orderData: {
  orderId: string;
  lineItems: Array<{
    productId: string;
    quantity: number;
    variationId?: string;
  }>;
  operation: 'decrease' | 'increase'; // decrease for sales, increase for returns
}): Promise<boolean> {
  if (!wpClient) {
    console.warn('WordPress client not configured for inventory update');
    return false;
  }

  try {
    const updatePromises = orderData.lineItems.map(async (item) => {
      const updateInput = {
        productId: item.productId,
        variationId: item.variationId,
        quantityChange: orderData.operation === 'decrease' ? -item.quantity : item.quantity,
        reason: `Order ${orderData.operation}: ${orderData.orderId}`,
        metadata: {
          orderId: orderData.orderId,
          operation: orderData.operation,
          syncedAt: new Date().toISOString(),
          source: 'stripe_webhook_sync',
        }
      };

      const result = await wpClient!.request<UpdateInventoryResponse>(UPDATE_INVENTORY, { input: updateInput });
      
      if (result.updateInventory?.success) {
        console.log(`Successfully updated inventory for product ${item.productId}:`, item.quantity);
        return true;
      } else {
        console.error(`Failed to update inventory for product ${item.productId}:`, result.updateInventory?.errors);
        return false;
      }
    });

    const results = await Promise.all(updatePromises);
    return results.every(result => result);

  } catch (error: any) {
    console.error('Error updating inventory:', error);
    return false;
  }
}

/**
 * Log webhook event for tracking and debugging
 */
export async function logWebhookEvent(eventData: {
  eventType: string;
  eventId: string;
  status: 'success' | 'failed' | 'processing';
  orderId?: string;
  customerId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  if (!wpClient) {
    console.warn('WordPress client not configured for webhook logging');
    return false;
  }

  try {
    const logInput = {
      eventType: eventData.eventType,
      eventId: eventData.eventId,
      status: eventData.status,
      orderId: eventData.orderId ? parseInt(eventData.orderId, 10) : null,
      customerId: eventData.customerId ? parseInt(eventData.customerId, 10) : null,
      errorMessage: eventData.errorMessage,
      metadata: {
        ...eventData.metadata,
        loggedAt: new Date().toISOString(),
        source: 'stripe_webhook_sync',
      }
    };

    const result = await wpClient.request<LogWebhookEventResponse>(LOG_WEBHOOK_EVENT, { input: logInput });
    
    if (result.logWebhookEvent?.success) {
      console.log('Successfully logged webhook event:', eventData.eventId);
      return true;
    } else {
      console.error('Failed to log webhook event:', result.logWebhookEvent?.errors);
      return false;
    }

  } catch (error: any) {
    console.error('Error logging webhook event:', error);
    return false;
  }
}

/**
 * Process order completion workflow
 */
export async function processOrderCompletion(orderId: string, paymentData: any): Promise<boolean> {
  try {
    console.log('Processing order completion workflow for order:', orderId);

    // 1. Sync order data
    const orderSyncSuccess = await syncOrderData({
      orderId,
      stripePaymentIntentId: paymentData.paymentIntentId,
      stripeCustomerId: paymentData.customerId,
      paymentStatus: 'paid',
      orderStatus: 'processing',
      amountPaid: paymentData.amount,
      currency: paymentData.currency,
      metadata: paymentData.metadata,
    });

    if (!orderSyncSuccess) {
      console.error('Failed to sync order data for order:', orderId);
      return false;
    }

    // 2. Update inventory
    if (paymentData.lineItems) {
      const inventoryUpdateSuccess = await updateInventoryFromOrder({
        orderId,
        lineItems: paymentData.lineItems,
        operation: 'decrease',
      });

      if (!inventoryUpdateSuccess) {
        console.error('Failed to update inventory for order:', orderId);
        // Don't return false here as order sync was successful
      }
    }

    // 3. Log the event
    await logWebhookEvent({
      eventType: 'order_completed',
      eventId: paymentData.paymentIntentId,
      status: 'success',
      orderId,
      customerId: paymentData.customerId,
      metadata: paymentData.metadata,
    });

    console.log('Successfully completed order workflow for order:', orderId);
    return true;

  } catch (error: any) {
    console.error('Error processing order completion:', error);
    
    // Log the error
    await logWebhookEvent({
      eventType: 'order_completion_error',
      eventId: paymentData.paymentIntentId,
      status: 'failed',
      orderId,
      errorMessage: error.message,
      metadata: paymentData.metadata,
    });

    return false;
  }
}

/**
 * Process payment failure workflow
 */
export async function processPaymentFailure(orderId: string, failureData: any): Promise<boolean> {
  try {
    console.log('Processing payment failure workflow for order:', orderId);

    // 1. Update order status
    const orderSyncSuccess = await syncOrderData({
      orderId,
      stripePaymentIntentId: failureData.paymentIntentId,
      paymentStatus: 'failed',
      orderStatus: 'failed',
      amountPaid: 0,
      currency: failureData.currency,
      metadata: {
        ...failureData.metadata,
        failureReason: failureData.failureReason,
        failureCode: failureData.failureCode,
      },
    });

    if (!orderSyncSuccess) {
      console.error('Failed to sync failed order data for order:', orderId);
      return false;
    }

    // 2. Log the event
    await logWebhookEvent({
      eventType: 'payment_failed',
      eventId: failureData.paymentIntentId,
      status: 'success',
      orderId,
      errorMessage: failureData.failureReason,
      metadata: failureData.metadata,
    });

    console.log('Successfully processed payment failure for order:', orderId);
    return true;

  } catch (error: any) {
    console.error('Error processing payment failure:', error);
    return false;
  }
}

export default {
  syncOrderData,
  syncCustomerData,
  updateInventoryFromOrder,
  logWebhookEvent,
  processOrderCompletion,
  processPaymentFailure,
};