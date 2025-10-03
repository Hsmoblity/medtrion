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
    const entry = await contentfulClient.createEntry('paymentAnalytics', {
      fields: {
        paymentIntentId: {
          'en-US': paymentData.paymentIntentId,
        },
        orderId: {
          'en-US': paymentData.orderId || '',
        },
        customerId: {
          'en-US': paymentData.customerId || '',
        },
        amount: {
          'en-US': paymentData.amount,
        },
        currency: {
          'en-US': paymentData.currency,
        },
        status: {
          'en-US': paymentData.status,
        },
        paymentMethod: {
          'en-US': paymentData.paymentMethod,
        },
        timestamp: {
          'en-US': paymentData.timestamp,
        },
        metadata: {
          'en-US': JSON.stringify(paymentData.metadata || {}),
        },
      },
    });

    console.log('Payment analytics logged to CMS:', entry.sys.id);
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
    const entry = await contentfulClient.createEntry('orderTracking', {
      fields: {
        orderId: {
          'en-US': orderData.orderId,
        },
        paymentIntentId: {
          'en-US': orderData.paymentIntentId,
        },
        status: {
          'en-US': orderData.status,
        },
        paymentStatus: {
          'en-US': orderData.paymentStatus,
        },
        customerEmail: {
          'en-US': orderData.customerEmail || '',
        },
        customerName: {
          'en-US': orderData.customerName || '',
        },
        amount: {
          'en-US': orderData.amount,
        },
        currency: {
          'en-US': orderData.currency,
        },
        lineItems: {
          'en-US': JSON.stringify(orderData.lineItems),
        },
        createdAt: {
          'en-US': orderData.createdAt,
        },
        updatedAt: {
          'en-US': orderData.updatedAt,
        },
        metadata: {
          'en-US': JSON.stringify(orderData.metadata || {}),
        },
      },
    });

    console.log('Order tracking created in CMS:', entry.sys.id);
    return true;

  } catch (error: any) {
    console.error('Error creating order tracking in CMS:', error);
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
    // Find existing entry
    const entries = await contentfulClient.getEntries({
      content_type: 'orderTracking',
      'fields.orderId': orderId,
      limit: 1,
    });

    if (entries.items.length === 0) {
      console.warn('Order tracking entry not found for order:', orderId);
      return false;
    }

    const entry = entries.items[0];
    const updateFields: any = {};

    // Map updates to Contentful fields
    if (updates.status) updateFields.status = { 'en-US': updates.status };
    if (updates.paymentStatus) updateFields.paymentStatus = { 'en-US': updates.paymentStatus };
    if (updates.customerEmail) updateFields.customerEmail = { 'en-US': updates.customerEmail };
    if (updates.customerName) updateFields.customerName = { 'en-US': updates.customerName };
    if (updates.amount) updateFields.amount = { 'en-US': updates.amount };
    if (updates.currency) updateFields.currency = { 'en-US': updates.currency };
    if (updates.lineItems) updateFields.lineItems = { 'en-US': JSON.stringify(updates.lineItems) };
    if (updates.updatedAt) updateFields.updatedAt = { 'en-US': updates.updatedAt };
    if (updates.metadata) updateFields.metadata = { 'en-US': JSON.stringify(updates.metadata) };

    await contentfulClient.updateEntry(entry.sys.id, {
      fields: updateFields,
    });

    console.log('Order tracking updated in CMS:', orderId);
    return true;

  } catch (error: any) {
    console.error('Error updating order tracking in CMS:', error);
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
    // Check if customer exists
    const entries = await contentfulClient.getEntries({
      content_type: 'customerPaymentHistory',
      'fields.customerId': customerData.customerId,
      limit: 1,
    });

    let entry;
    if (entries.items.length === 0) {
      // Create new customer entry
      entry = await contentfulClient.createEntry('customerPaymentHistory', {
        fields: {
          customerId: {
            'en-US': customerData.customerId,
          },
          email: {
            'en-US': customerData.email || '',
          },
          paymentHistory: {
            'en-US': JSON.stringify(customerData.paymentHistory),
          },
          totalSpent: {
            'en-US': customerData.totalSpent,
          },
          lastPaymentDate: {
            'en-US': customerData.lastPaymentDate || '',
          },
          metadata: {
            'en-US': JSON.stringify(customerData.metadata || {}),
          },
        },
      });
    } else {
      // Update existing customer entry
      entry = entries.items[0];
      await contentfulClient.updateEntry(entry.sys.id, {
        fields: {
          paymentHistory: {
            'en-US': JSON.stringify(customerData.paymentHistory),
          },
          totalSpent: {
            'en-US': customerData.totalSpent,
          },
          lastPaymentDate: {
            'en-US': customerData.lastPaymentDate || '',
          },
          metadata: {
            'en-US': JSON.stringify(customerData.metadata || {}),
          },
        },
      });
    }

    console.log('Customer payment history updated in CMS:', customerData.customerId);
    return true;

  } catch (error: any) {
    console.error('Error updating customer payment history in CMS:', error);
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
    return {
      orderId: entry.fields.orderId['en-US'],
      paymentIntentId: entry.fields.paymentIntentId['en-US'],
      status: entry.fields.status['en-US'],
      paymentStatus: entry.fields.paymentStatus['en-US'],
      customerEmail: entry.fields.customerEmail?.['en-US'],
      customerName: entry.fields.customerName?.['en-US'],
      amount: entry.fields.amount['en-US'],
      currency: entry.fields.currency['en-US'],
      lineItems: entry.fields.lineItems['en-US'] ? JSON.parse(entry.fields.lineItems['en-US']) : [],
      createdAt: entry.fields.createdAt['en-US'],
      updatedAt: entry.fields.updatedAt['en-US'],
      metadata: entry.fields.metadata?.['en-US'] ? JSON.parse(entry.fields.metadata['en-US']) : {},
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
    return {
      customerId: entry.fields.customerId['en-US'],
      email: entry.fields.email?.['en-US'],
      paymentHistory: entry.fields.paymentHistory['en-US'] ? JSON.parse(entry.fields.paymentHistory['en-US']) : [],
      totalSpent: entry.fields.totalSpent['en-US'],
      lastPaymentDate: entry.fields.lastPaymentDate?.['en-US'],
      metadata: entry.fields.metadata?.['en-US'] ? JSON.parse(entry.fields.metadata['en-US']) : {},
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