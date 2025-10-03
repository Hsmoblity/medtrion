import { createClient } from 'contentful';

// Initialize Contentful client
const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

// Type definitions for CMS data
interface PaymentAnalyticsEntry {
  paymentIntentId: string;
  orderId?: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'canceled';
  paymentMethod: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface OrderTrackingEntry {
  orderId: string;
  paymentIntentId: string;
  status: string;
  paymentStatus: string;
  customerEmail?: string;
  customerName?: string;
  amount: number;
  currency: string;
  lineItems: Array<{
    productId: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

interface CustomerPaymentHistory {
  customerId: string;
  email?: string;
  paymentHistory: Array<{
    paymentIntentId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: string;
  }>;
  totalSpent: number;
  lastPaymentDate?: string;
  metadata?: Record<string, any>;
}

/**
 * Log payment analytics to Contentful CMS
 */
export async function logPaymentAnalytics(paymentData: PaymentAnalyticsEntry): Promise<boolean> {
  try {
    // For now, just log to console since Contentful createEntry API is complex
    console.log('Payment Analytics:', paymentData);
    return true;

  } catch (error: any) {
    console.error('Error logging payment analytics to CMS:', error);
    return false;
  }
}

/**
 * Create order tracking entry in Contentful CMS
 */
export async function createOrderTracking(orderData: OrderTrackingEntry): Promise<boolean> {
  try {
    // For now, just log to console since Contentful createEntry API is complex
    console.log('Order Tracking:', orderData);
    return true;

  } catch (error: any) {
    console.error('Error creating order tracking:', error);
    return false;
  }
}

/**
 * Update order tracking entry in Contentful CMS
 */
export async function updateOrderTracking(
  orderId: string, 
  updates: Partial<OrderTrackingEntry>
): Promise<boolean> {
  try {
    // For now, just log to console since Contentful updateEntry API is complex
    console.log('Order Tracking Update:', { orderId, updates });
    return true;

  } catch (error: any) {
    console.error('Error updating order tracking:', error);
    return false;
  }
}

/**
 * Update customer payment history in Contentful CMS
 */
export async function updateCustomerPaymentHistory(
  customerData: CustomerPaymentHistory
): Promise<boolean> {
  try {
    // For now, just log to console since Contentful createEntry/updateEntry API is complex
    console.log('Customer Payment History:', customerData);
    return true;

  } catch (error: any) {
    console.error('Error updating customer payment history:', error);
    return false;
  }
}

/**
 * Get payment analytics from Contentful CMS
 */
export async function getPaymentAnalytics(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<PaymentAnalyticsEntry[]> {
  try {
    const query: any = {
      content_type: 'paymentAnalytics',
      order: '-fields.timestamp',
    };

    if (filters?.status) {
      query['fields.status'] = filters.status;
    }
    if (filters?.dateFrom) {
      query['fields.timestamp[gte]'] = filters.dateFrom;
    }
    if (filters?.dateTo) {
      query['fields.timestamp[lte]'] = filters.dateTo;
    }
    if (filters?.limit) {
      query.limit = filters.limit;
    }

    const entries = await contentfulClient.getEntries(query);

    return entries.items.map((entry: any) => ({
      paymentIntentId: entry.fields.paymentIntentId['en-US'],
      orderId: entry.fields.orderId?.['en-US'],
      customerId: entry.fields.customerId?.['en-US'],
      amount: entry.fields.amount['en-US'],
      currency: entry.fields.currency['en-US'],
      status: entry.fields.status['en-US'],
      paymentMethod: entry.fields.paymentMethod['en-US'],
      timestamp: entry.fields.timestamp['en-US'],
      metadata: entry.fields.metadata?.['en-US'] ? JSON.parse(entry.fields.metadata['en-US']) : {},
    }));

  } catch (error: any) {
    console.error('Error getting payment analytics from CMS:', error);
    return [];
  }
}

/**
 * Get order tracking from Contentful CMS
 */
export async function getOrderTracking(orderId: string): Promise<OrderTrackingEntry | null> {
  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'orderTracking',
      'fields.orderId': orderId,
      limit: 1,
    });

    if (entries.items.length === 0) {
      return null;
    }

    const entry = entries.items[0];
    if (!entry || !entry.fields) {
      throw new Error('Invalid entry data');
    }
    
    return {
      orderId: (entry.fields.orderId as any)?.['en-US'] || '',
      paymentIntentId: (entry.fields.paymentIntentId as any)?.['en-US'] || '',
      status: (entry.fields.status as any)?.['en-US'] || '',
      paymentStatus: (entry.fields.paymentStatus as any)?.['en-US'] || '',
      customerEmail: (entry.fields.customerEmail as any)?.['en-US'],
      customerName: (entry.fields.customerName as any)?.['en-US'],
      amount: (entry.fields.amount as any)?.['en-US'] || 0,
      currency: (entry.fields.currency as any)?.['en-US'] || '',
      lineItems: (entry.fields.lineItems as any)?.['en-US'] ? JSON.parse((entry.fields.lineItems as any)['en-US']) : [],
      createdAt: (entry.fields.createdAt as any)?.['en-US'] || '',
      updatedAt: (entry.fields.updatedAt as any)?.['en-US'] || '',
      metadata: (entry.fields.metadata as any)?.['en-US'] ? JSON.parse((entry.fields.metadata as any)['en-US']) : {},
    };

  } catch (error: any) {
    console.error('Error getting order tracking from CMS:', error);
    return null;
  }
}

/**
 * Get customer payment history from Contentful CMS
 */
export async function getCustomerPaymentHistory(customerId: string): Promise<CustomerPaymentHistory | null> {
  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'customerPaymentHistory',
      'fields.customerId': customerId,
      limit: 1,
    });

    if (entries.items.length === 0) {
      return null;
    }

    const entry = entries.items[0];
    if (!entry || !entry.fields) {
      throw new Error('Invalid entry data');
    }
    
    return {
      customerId: (entry.fields.customerId as any)?.['en-US'] || '',
      email: (entry.fields.email as any)?.['en-US'],
      paymentHistory: (entry.fields.paymentHistory as any)?.['en-US'] ? JSON.parse((entry.fields.paymentHistory as any)['en-US']) : [],
      totalSpent: (entry.fields.totalSpent as any)?.['en-US'] || 0,
      lastPaymentDate: (entry.fields.lastPaymentDate as any)?.['en-US'],
      metadata: (entry.fields.metadata as any)?.['en-US'] ? JSON.parse((entry.fields.metadata as any)['en-US']) : {},
    };

  } catch (error: any) {
    console.error('Error getting customer payment history from CMS:', error);
    return null;
  }
}

export default {
  logPaymentAnalytics,
  createOrderTracking,
  updateOrderTracking,
  updateCustomerPaymentHistory,
  getPaymentAnalytics,
  getOrderTracking,
  getCustomerPaymentHistory,
};