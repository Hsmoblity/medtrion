import type { NextApiRequest, NextApiResponse } from "next";
import { CartProduct } from "lib/interfaces";
import Stripe from "stripe";
import { GraphQLClient, gql } from 'graphql-request';
import { CREATE_HEADLESS_STRIPE_SESSION } from '../../lib/graphql/queries';

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.trim() === "") {
  console.warn('STRIPE_SECRET_KEY is not set. /api/stripe will attempt to delegate session creation to WP if supported.');
}

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== "") {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });
}

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || '';
let wpClient: GraphQLClient | null = null;
if (WP_GRAPHQL_URL) {
  try {
    // eslint-disable-next-line no-new
    new URL(WP_GRAPHQL_URL);
    wpClient = new GraphQLClient(WP_GRAPHQL_URL);
  } catch (e) {
    console.warn('Invalid WP_GRAPHQL_URL in /api/stripe:', WP_GRAPHQL_URL, e);
    wpClient = null;
  }
} else {
  console.warn('WP_GRAPHQL_URL not set in /api/stripe.');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const items = req.body.items || [];
      const wpOrderId = req.body.wpOrderId || null;

      // If a WP order id is provided, ask WP to create a session for that order
      if (!stripe && wpOrderId) {
        const orderMutation = gql`
          mutation CreateSessionForOrder($input: CreateSessionForOrderInput!) {
            createStripeSessionForOrder(input: $input) {
              sessionId
              publishableKey
              errors
            }
          }
        `;

        try {
          // Enhanced WordPress session creation with webhook URLs
          const input = { 
            orderId: parseInt(wpOrderId, 10), 
            successUrl: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&wp_order_id=${wpOrderId}`, 
            cancelUrl: `${req.headers.origin}/payment/cancel?session_id={CHECKOUT_SESSION_ID}&wp_order_id=${wpOrderId}`,
            metadata: {
              source: 'headless-nextjs-webhook-enhanced',
              timestamp: new Date().toISOString(),
            }
          };
          if (!wpClient) {
            res.status(500).json({ message: 'WP_GRAPHQL_URL not configured or invalid; cannot create session via WP.' });
            return;
          }
          const data: any = await wpClient.request(orderMutation, { input });
          const resp = data?.createStripeSessionForOrder;
          if (!resp) {
            res.status(500).json({ message: 'WP did not return a session for order.' });
            return;
          }
          if (resp.errors && resp.errors.length) {
            res.status(500).json({ message: 'WP returned errors', errors: resp.errors });
            return;
          }
          res.status(200).json({ id: resp.sessionId, publishableKey: resp.publishableKey });
          return;
        } catch (err: any) {
          console.error('WP create session for order failed', err);
          res.status(500).json({ message: 'WP create session for order failed', error: err.message || err });
          return;
        }
      }

      // If server has a Stripe secret key configured, use it directly (existing flow)
      if (stripe) {
        const line_items = items.map((item: any) => {
          const imgUrl = item.productPictures?.[0]?.url || "";

          return {
            price_data: {
              currency: "CAD",
              product_data: {
                name: item.title,
                images: imgUrl ? [imgUrl] : [],
              },
              unit_amount: Math.round((item.price || 0) * 100),
            },
            adjustable_quantity: { enabled: true, minimum: 1 },
            quantity: item.quantity || 1,
          };
        });

        // Fetch shipping rates and create a session
        const shippingRates = await stripe.shippingRates.list({ limit: 5 });
        const shippingOptions = shippingRates.data.map(rate => ({ shipping_rate: rate.id }));

        // Enhanced session creation with webhook metadata
        const session = await stripe.checkout.sessions.create({
          submit_type: "pay",
          payment_method_types: ["card"],
          billing_address_collection: "auto",
          shipping_address_collection: { allowed_countries: ["US", "CA"] },
          shipping_options: shippingOptions,
          line_items,
          mode: "payment",
          success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
          // Enhanced metadata for webhook processing
          metadata: {
            source: 'headless-nextjs',
            cartItems: JSON.stringify(items.map((item: any) => ({
              productId: item.productId,
              variationId: item.variationId,
              quantity: item.quantity,
              title: item.title
            }))),
            timestamp: new Date().toISOString(),
          },
          // Enhanced payment intent data for webhook processing
          payment_intent_data: {
            metadata: {
              source: 'headless-nextjs',
              itemCount: items.length.toString(),
              timestamp: new Date().toISOString(),
            }
          }
        });

        res.status(200).json({
          id: session.id,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
          raw: session,
        });
        return;
      }

      // If no server-side Stripe key, attempt to ask WP to create an order and generate a Stripe session/key.
      // Expectation: WPGraphQL has a mutation (custom) that accepts line items and returns { sessionId, publishableKey }
      // We'll attempt a best-effort call to a mutation named `createHeadlessStripeSession`.


      const input = {
        lineItems: items.map((it: any) => ({
          productId: it.productId,
          variationId: it.variationId || null,
          quantity: it.quantity || 1,
          unitPrice: Math.round((it.price || 0) * 100),
        })),
        metadata: {
          source: 'headless-nextjs-webhook-enhanced',
          timestamp: new Date().toISOString(),
          itemCount: items.length.toString(),
        },
        successUrl: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${req.headers.origin}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
      };

      try {
        if (!wpClient) {
          res.status(500).json({ message: 'WP_GRAPHQL_URL not configured or invalid; cannot create session via WP.' });
          return;
        }
        const data: any = await wpClient.request(CREATE_HEADLESS_STRIPE_SESSION, { input });
        const resp = data?.createHeadlessStripeSession;

        if (!resp) {
          res.status(500).json({ message: 'WP did not return a session. Ensure WP implements createHeadlessStripeSession.' });
          return;
        }

        if (resp.errors && resp.errors.length > 0) {
          res.status(500).json({ message: 'WP returned errors', errors: resp.errors });
          return;
        }

        res.status(200).json({ id: resp.sessionId, publishableKey: resp.publishableKey, order: resp.order });
        return;
      } catch (wpErr: any) {
        console.error('WP GraphQL call failed:', wpErr);
        res.status(500).json({ message: 'WP GraphQL call failed', error: wpErr.message || wpErr });
        return;
      }
    } catch (error: any) {
      console.error("Stripe session creation failed:", error);
      res.status(500).json({
        message: "Failed to create checkout session",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

