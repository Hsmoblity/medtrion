import { NextApiRequest, NextApiResponse } from 'next';
import { GraphQLClient, gql } from 'graphql-request';
import fetch from 'node-fetch';

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || '';
let client: GraphQLClient | null = null;
if (WP_GRAPHQL_URL) {
  try {
    // Validate URL
    // eslint-disable-next-line no-new
    new URL(WP_GRAPHQL_URL);
    client = new GraphQLClient(WP_GRAPHQL_URL);
  } catch (e) {
    console.warn('Invalid WP_GRAPHQL_URL in create-order API route:', WP_GRAPHQL_URL, e);
    client = null;
  }
} else {
  console.warn('WP_GRAPHQL_URL not set in create-order API route.');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lineItems, customer } = req.body;

  const mutation = gql`
    mutation CreateHeadlessOrder($input: CreateHeadlessOrderInput!) {
      createHeadlessOrder(input: $input) {
        order { id orderNumber }
        errors
      }
    }
  `;

  const origin = (req.headers.origin as string) || (process.env.NEXT_PUBLIC_BASE_URL || '');
  const input = {
    lineItems: lineItems.map((item: any) => ({
      productId: item.productId,
      variationId: item.variationId || null,
      quantity: item.quantity || 1,
      unitPrice: Math.round((item.price || 0) * 100),
    })),
    customer,
  };

  try {
    // Development/testing shortcut: if NEXT_FAKE_SKIP_STRIPE=1, return a fake order and indicate Stripe was skipped.
    if (process.env.NEXT_FAKE_SKIP_STRIPE === '1') {
      return res.status(200).json({ order: { id: 99999, orderNumber: 'TEST-99999' }, skippedStripe: true });
    }
    // Quick health check: ensure WP GraphQL endpoint is reachable
    const wpUrl = process.env.WP_GRAPHQL_URL || '';
    if (!wpUrl) {
      return res.status(500).json({ error: 'WP_GRAPHQL_URL is not configured on the Next server.' });
    }

    try {
      const ping = await fetch(wpUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '{ __typename }' }), timeout: 5000 });
      if (!ping || !ping.ok) {
        return res.status(502).json({ error: 'Could not reach WP GraphQL endpoint', details: { status: ping?.status, statusText: ping?.statusText } });
      }
    } catch (pingErr: any) {
      return res.status(502).json({ error: 'WP GraphQL endpoint unreachable', details: pingErr?.message || String(pingErr) });
    }

    if (!client) {
      return res.status(500).json({ error: 'WP_GRAPHQL_URL is not configured or invalid on the server.' });
    }

    const data = await client.request(mutation, { input }) as any;
    const resp = data.createHeadlessOrder;
    if (!resp) {
      return res.status(500).json({ error: 'WP did not return an order.' });
    }
    if (resp.errors && resp.errors.length) {
      return res.status(500).json({ error: 'WP returned errors', details: resp.errors });
    }

    res.status(200).json({ order: resp.order, skippedStripe: !!resp.skippedStripe });
  } catch (error: any) {
    res.status(500).json({ error: error.message, details: error.response?.errors });
  }
}
