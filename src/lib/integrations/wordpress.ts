import { GraphQLClient, gql } from 'graphql-request';

// Initialize WordPress GraphQL client
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || '';
let wpClient: GraphQLClient | null = null;
if (WP_GRAPHQL_URL) {
  try {
    new URL(WP_GRAPHQL_URL);
    wpClient = new GraphQLClient(WP_GRAPHQL_URL);
  } catch (e) {
    console.warn('Invalid WP_GRAPHQL_URL in WordPress integration:', WP_GRAPHQL_URL, e);
    wpClient = null;
  }
} else {
  console.warn('WP_GRAPHQL_URL not set in WordPress integration.');
}

// GraphQL queries and mutations for WordPress/WooCommerce integration
const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      status
      paymentStatus
      total
      currency
      customer {
        id
        email
        firstName
        lastName
      }
      lineItems {
        nodes {
          id
          product {
            id
            name
            sku
          }
          variation {
            id
            name
            sku
          }
          quantity
          total
        }
      }
      billingAddress {
        firstName
        lastName
        address1
        city
        state
        postcode
        country
        email
        phone
      }
      shippingAddress {
        firstName
        lastName
        address1
        city
        state
        postcode
        country
      }
      metaData {
        key
        value
      }
    }
  }
`;

const GET_CUSTOMER = gql`
  query GetCustomer($id: ID!) {
    customer(id: $id) {
      id
      email
      firstName
      lastName
      billingAddress {
        firstName
        lastName
        address1
        city
        state
        postcode
        country
        email
        phone
      }
      metaData {
        key
        value
      }
    }
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      sku
      stockQuantity
      stockStatus
      price
      metaData {
        key
        value
      }
    }
  }
`;

const UPDATE_ORDER_META = gql`
  mutation UpdateOrderMeta($input: UpdateOrderMetaInput!) {
    updateOrderMeta(input: $input) {
      success
      message
      order {
        id
        orderNumber
        metaData {
          key
          value
        }
      }
      errors
    }
  }
`;

const UPDATE_CUSTOMER_META = gql`
  mutation UpdateCustomerMeta($input: UpdateCustomerMetaInput!) {
    updateCustomerMeta(input: $input) {
      success
      message
      customer {
        id
        email
        metaData {
          key
          value
        }
      }
      errors
    }
  }
`;

const UPDATE_PRODUCT_STOCK = gql`
  mutation UpdateProductStock($input: UpdateProductStockInput!) {
    updateProductStock(input: $input) {
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

// Type definitions
interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  currency: string;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  lineItems: {
    nodes: Array<{
      id: string;
      product: {
        id: string;
        name: string;
        sku: string;
      };
      variation?: {
        id: string;
        name: string;
        sku: string;
      };
      quantity: number;
      total: string;
    }>;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  metaData: Array<{
    key: string;
    value: string;
  }>;
}

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  metaData: Array<{
    key: string;
    value: string;
  }>;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  stockStatus: string;
  price: string;
  metaData: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Get order by ID from WordPress/WooCommerce
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  if (!wpClient) {
    console.warn('WordPress client not configured');
    return null;
  }

  try {
    const result = await wpClient.request<{ order: Order }>(GET_ORDER, { id: orderId });
    return result.order || null;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Get customer by ID from WordPress/WooCommerce
 */
export async function getCustomer(customerId: string): Promise<Customer | null> {
  if (!wpClient) {
    console.warn('WordPress client not configured');
    return null;
  }

  try {
    const result = await wpClient.request<{ customer: Customer }>(GET_CUSTOMER, { id: customerId });
    return result.customer || null;
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

/**
 * Get product by ID from WordPress/WooCommerce
 */
export async function getProduct(productId: string): Promise<Product | null> {
  if (!wpClient) {
    console.warn('WordPress client not configured');
    return null;
  }

  try {
    const result = await wpClient.request<{ product: Product }>(GET_PRODUCT, { id: productId });
    return result.product || null;
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Update order metadata in WordPress/WooCommerce
 */
export async function updateOrderMeta(
  orderId: string, 
  metaData: Record<string, string>
): Promise<boolean> {
  if (!wpClient) {
    console.warn('WordPress client not configured');
    return false;
  }

  try {
    const metaEntries = Object.entries(metaData).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }));

    const result = await wpClient.request(UPDATE_ORDER_META, {
      input: {
        orderId: parseInt(orderId, 10),
        metaData: metaEntries,
      }
    });

    return (result as any).updateOrderMeta?.success || false;
  } catch (error: any) {
    console.error('Error updating order meta:', error);
    return false;
  }
}

/**
 * Update customer metadata in WordPress/WooCommerce
 */
export async function updateCustomerMeta(
  customerId: string, 
  metaData: Record<string, string>
): Promise<boolean> {
  if (!wpClient) {
    console.warn('WordPress client not configured');
    return false;
  }

  try {
    const metaEntries = Object.entries(metaData).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }));

    const result = await wpClient.request(UPDATE_CUSTOMER_META, {
      input: {
        customerId: parseInt(customerId, 10),
        metaData: metaEntries,
      }
    });

    return (result as any).updateCustomerMeta?.success || false;
  } catch (error: any) {
    console.error('Error updating customer meta:', error);
    return false;
  }
}

/**
 * Update product stock in WordPress/WooCommerce
 */
export async function updateProductStock(
  productId: string,
  stockQuantity: number,
  stockStatus?: string
): Promise<boolean> {
  if (!wpClient) {
    console.warn('WordPress client not configured');
    return false;
  }

  try {
    const result = await wpClient.request(UPDATE_PRODUCT_STOCK, {
      input: {
        productId: parseInt(productId, 10),
        stockQuantity,
        stockStatus: stockStatus || (stockQuantity > 0 ? 'instock' : 'outofstock'),
      }
    });

    return (result as any).updateProductStock?.success || false;
  } catch (error: any) {
    console.error('Error updating product stock:', error);
    return false;
  }
}

/**
 * Add Stripe metadata to order
 */
export async function addStripeOrderMetadata(
  orderId: string,
  stripeData: {
    paymentIntentId: string;
    customerId?: string;
    sessionId?: string;
    chargeId?: string;
    amountPaid: number;
    currency: string;
    paymentStatus: string;
  }
): Promise<boolean> {
  const metaData: Record<string, string> = {
    stripe_payment_intent_id: stripeData.paymentIntentId,
    stripe_customer_id: stripeData.customerId || '',
    stripe_session_id: stripeData.sessionId || '',
    stripe_charge_id: stripeData.chargeId || '',
    stripe_amount_paid: stripeData.amountPaid.toString(),
    stripe_currency: stripeData.currency,
    stripe_payment_status: stripeData.paymentStatus,
    stripe_webhook_processed: 'true',
    stripe_webhook_processed_at: new Date().toISOString(),
  };

  return updateOrderMeta(orderId, metaData);
}

/**
 * Add Stripe metadata to customer
 */
export async function addStripeCustomerMetadata(
  customerId: string,
  stripeData: {
    stripeCustomerId: string;
    paymentMethodsCount?: number;
    defaultPaymentMethod?: string;
  }
): Promise<boolean> {
  const metaData: Record<string, string> = {
    stripe_customer_id: stripeData.stripeCustomerId,
    stripe_payment_methods_count: stripeData.paymentMethodsCount?.toString() || '0',
    stripe_default_payment_method: stripeData.defaultPaymentMethod || '',
    stripe_customer_synced: 'true',
    stripe_customer_synced_at: new Date().toISOString(),
  };

  return updateCustomerMeta(customerId, metaData);
}

/**
 * Update order status and payment status
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentStatus: string,
  additionalMeta?: Record<string, string>
): Promise<boolean> {
  const metaData = {
    order_status: status,
    payment_status: paymentStatus,
    status_updated_at: new Date().toISOString(),
    ...additionalMeta,
  };

  return updateOrderMeta(orderId, metaData);
}

/**
 * Process inventory update for order
 */
export async function processOrderInventory(
  orderId: string,
  lineItems: Array<{
    productId: string;
    variationId?: string;
    quantity: number;
  }>,
  operation: 'decrease' | 'increase'
): Promise<boolean> {
  try {
    const updatePromises = lineItems.map(async (item) => {
      const product = await getProduct(item.productId);
      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        return false;
      }

      const currentStock = product.stockQuantity;
      const newStock = operation === 'decrease' 
        ? currentStock - item.quantity 
        : currentStock + item.quantity;

      const success = await updateProductStock(
        item.productId,
        Math.max(0, newStock), // Don't allow negative stock
        newStock > 0 ? 'instock' : 'outofstock'
      );

      if (success) {
        console.log(`Updated stock for product ${item.productId}: ${currentStock} -> ${newStock}`);
      }

      return success;
    });

    const results = await Promise.all(updatePromises);
    return results.every(result => result);

  } catch (error: any) {
    console.error('Error processing order inventory:', error);
    return false;
  }
}

/**
 * Find order by Stripe payment intent ID
 */
export async function findOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
  // This would typically involve a custom GraphQL query or database search
  // For now, we'll return null as this requires custom implementation
  console.log('Finding order by payment intent ID:', paymentIntentId);
  return null;
}

/**
 * Find customer by Stripe customer ID
 */
export async function findCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
  // This would typically involve a custom GraphQL query or database search
  // For now, we'll return null as this requires custom implementation
  console.log('Finding customer by Stripe customer ID:', stripeCustomerId);
  return null;
}

export default {
  getOrder,
  getCustomer,
  getProduct,
  updateOrderMeta,
  updateCustomerMeta,
  updateProductStock,
  addStripeOrderMetadata,
  addStripeCustomerMetadata,
  updateOrderStatus,
  processOrderInventory,
  findOrderByPaymentIntent,
  findCustomerByStripeId,
};