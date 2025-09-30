import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { GraphQLClient, gql } from 'graphql-request';

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
    console.warn('Invalid WP_GRAPHQL_URL in verify-status:', WP_GRAPHQL_URL, e);
    wpClient = null;
  }
}

// GraphQL query to get order status
const GET_ORDER_STATUS = gql`
  query GetOrderStatus($input: GetOrderStatusInput!) {
    getOrderStatus(input: $input) {
      success
      order {
        id
        orderNumber
        status
        paymentStatus
        stripeSessionId
        stripePaymentIntentId
        metadata
        dateCreated
        dateModified
      }
      errors
    }
  }
`;

// Type definitions for GraphQL responses
interface GetOrderStatusResponse {
  getOrderStatus: {
    success: boolean;
    order?: {
      id: string;
      orderNumber: string;
      status: string;
      paymentStatus: string;
      stripeSessionId?: string;
      stripePaymentIntentId?: string;
      metadata?: string | Record<string, any>;
      dateCreated: string;
      dateModified: string;
    };
    errors?: string[];
  };
}

interface VerificationResponse {
  success: boolean;
  session?: Stripe.Checkout.Session;
  paymentIntent?: Stripe.PaymentIntent;
  orderStatus?: string;
  webhookProcessed?: boolean;
  orderData?: any;
  error?: string;
}

export default async function verifyStatusHandler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed' 
    });
  }

  const { sessionId, wpOrderId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required'
    });
  }

  try {
    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get payment intent if available
    let paymentIntent: Stripe.PaymentIntent | undefined;
    if (session.payment_intent && typeof session.payment_intent === 'object') {
      paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    } else if (session.payment_intent && typeof session.payment_intent === 'string') {
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
      } catch (error) {
        console.warn('Failed to retrieve payment intent:', error);
      }
    }

    // Determine order ID for WordPress lookup
    let orderIdForLookup = wpOrderId;
    if (!orderIdForLookup && session.metadata?.wpOrderId) {
      orderIdForLookup = session.metadata.wpOrderId;
    }
    if (!orderIdForLookup && paymentIntent?.metadata?.wpOrderId) {
      orderIdForLookup = paymentIntent.metadata.wpOrderId;
    }

    // Get order status from WordPress if available
    let orderData: any = null;
    let webhookProcessed = false;
    let orderStatus = 'unknown';

    if (orderIdForLookup && wpClient) {
      try {
        const orderResponse = await wpClient.request<GetOrderStatusResponse>(GET_ORDER_STATUS, {
          input: { orderId: parseInt(orderIdForLookup, 10) }
        });

        if (orderResponse.getOrderStatus?.success && orderResponse.getOrderStatus.order) {
          orderData = orderResponse.getOrderStatus.order;
          orderStatus = orderData.status || 'unknown';
          
          // Check if webhook has been processed
          if (orderData.metadata) {
            const metadata = typeof orderData.metadata === 'string' 
              ? JSON.parse(orderData.metadata) 
              : orderData.metadata;
            
            webhookProcessed = metadata.stripeWebhookProcessed === true || 
                              metadata.stripeWebhookProcessed === 'true';
          }
          
          // Also check if payment status indicates webhook processing
          if (orderData.paymentStatus === 'paid' && orderData.stripeSessionId === sessionId) {
            webhookProcessed = true;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch order status from WordPress:', error);
        // Continue without WordPress data
      }
    }

    // Determine webhook processing status from session/payment intent metadata
    if (!webhookProcessed) {
      // Check session metadata for webhook processing indicators
      if (session.metadata?.webhookProcessed === 'true') {
        webhookProcessed = true;
      }
      
      // Check payment intent metadata
      if (paymentIntent?.metadata?.webhookProcessed === 'true') {
        webhookProcessed = true;
      }
    }

    // Log verification for monitoring
    console.log('Payment status verification:', {
      sessionId,
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      orderStatus,
      webhookProcessed,
      wpOrderId: orderIdForLookup
    });

    // Return comprehensive status
    const response: VerificationResponse = {
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_details: session.customer_details,
        payment_method_types: session.payment_method_types,
        metadata: session.metadata,
        created: session.created,
        expires_at: session.expires_at
      } as Stripe.Checkout.Session,
      paymentIntent: paymentIntent ? {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount_received: paymentIntent.amount_received,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
        created: paymentIntent.created
      } as Stripe.PaymentIntent : undefined,
      orderStatus,
      webhookProcessed,
      orderData: orderData ? {
        id: orderData.id,
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        dateCreated: orderData.dateCreated,
        dateModified: orderData.dateModified
      } : undefined
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Payment status verification failed:', error);
    
    res.status(500).json({
      success: false,
      error: `Verification failed: ${error.message}`
    });
  }
}