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
  // If front-end only provided minimal cart items (cookies store only slug+quantity),
  // attempt to hydrate missing productId values by querying WPGraphQL for product ids by slug.
  let itemsToUse = Array.isArray(lineItems) ? [...lineItems] : [];

  // Map of slug -> numeric databaseId (as string). We'll populate for both main items and option-products.
  const slugToId: Record<string, string> = {};

  const itemsMissingProductId = itemsToUse.filter((it: any) => !it.productId && it.slug);
  if (itemsMissingProductId.length > 0) {
    try {
      const slugs = Array.from(new Set(itemsMissingProductId.map((it: any) => it.slug)));
      const lookupQuery = `query GetProductIds($slugs: [String]) { products(where: { slugIn: $slugs }) { nodes { id slug databaseId } } }`;
      if (!client) {
        throw new Error('WP_GRAPHQL_URL is not configured or invalid on the server.');
      }
      const lookupRes = await client.request(lookupQuery, { slugs }) as any;
      const nodes = lookupRes?.products?.nodes || [];
      for (const n of nodes) {
        // Use databaseId (numeric) for server-side order creation. GraphQL 'id' is a global base64 id and
        // the WooCommerce PHP code expects numeric post IDs.
        if (n?.slug && (n?.databaseId || n?.id)) slugToId[String(n.slug)] = String(n.databaseId ?? n.id);
      }

      itemsToUse = itemsToUse.map((it: any) => {
        if (!it.productId && it.slug && slugToId[it.slug]) {
          return { ...it, productId: slugToId[it.slug] };
        }
        return it;
      });
    } catch (e) {
      // If lookup fails, continue — later validation will catch missing ids.
      console.warn('Product lookup by slug failed', e);
    }
  }

  // Also collect option product slugs (options may reference related products by slug)
  try {
    const optionSlugsSet = new Set<string>();
    for (const it of itemsToUse) {
      const opts = Array.isArray(it.options) ? it.options : [];
      for (const o of opts) {
        const s = o.slug ?? o.productSlug ?? null;
        if (s && !slugToId[String(s)]) optionSlugsSet.add(String(s));
      }
    }
    const optionSlugs = Array.from(optionSlugsSet);
    if (optionSlugs.length > 0 && client) {
      const lookupQuery = `query GetProductIds($slugs: [String]) { products(where: { slugIn: $slugs }) { nodes { id slug databaseId } } }`;
      const lookupRes = await client.request(lookupQuery, { slugs: optionSlugs }) as any;
      const nodes = lookupRes?.products?.nodes || [];
      for (const n of nodes) {
        if (n?.slug && (n?.databaseId || n?.id)) slugToId[String(n.slug)] = String(n.databaseId ?? n.id);
      }
    }
  } catch (e) {
    console.warn('Option product slug lookup failed', e);
  }

  // Helper: try to normalize GraphQL global IDs (base64 like 'cG9zdDozMjM=') to numeric database IDs
  const normalizeToDatabaseId = (val: any) => {
    if (!val && val !== 0) return null;
    // Already numeric or numeric string
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && /^\d+$/.test(val)) return Number(val);
    if (typeof val === 'string') {
      try {
        // GraphQL global IDs are base64-encoded strings like 'post:123'
        const decoded = Buffer.from(val, 'base64').toString('utf8');
        const parts = decoded.split(':');
        const maybeNum = parts[1] ?? parts[0];
        if (/^\d+$/.test(String(maybeNum))) return Number(maybeNum);
      } catch (e) {
        // ignore decode errors
      }
    }
    return null;
  };

  // Transform customer shape to match WP plugin expectations: HeadlessStripeCustomerInput
  // only declares 'billing' and 'shipping' as String. We must not include any
  // additional fields (like 'note' or 'meta'), otherwise GraphQL will reject the input.
  let customerToSend: any = null;
  try {
    if (!customer) {
      customerToSend = null;
    } else {
      const ship = customer.shipping && typeof customer.shipping === 'object'
        ? JSON.stringify(customer.shipping)
        : (typeof customer.shipping === 'string' ? customer.shipping : null);
      const bill = customer.billing && typeof customer.billing === 'object'
        ? JSON.stringify(customer.billing)
        : (typeof customer.billing === 'string' ? customer.billing : null);
      customerToSend = { shipping: ship, billing: bill };
    }
  } catch (e) {
    // Fall back to null to avoid sending invalid shapes
    customerToSend = null;
  }

  const input = {
    // Build expanded line items:
    // - main product line contains options metadata (names, selected values)
    // - any option that represents a related product (by slug or productId) becomes a separate line item
    lineItems: (() => {
      const out: any[] = [];

      // Helper to push a normalized line item
      const pushLineItem = (raw: any) => {
        out.push({
          productId: normalizeToDatabaseId(raw.productId) || null,
          variationId: normalizeToDatabaseId(raw.variationId) || null,
          quantity: raw.quantity || 1,
          unitPrice: Math.round((raw.price || 0) * 100),
          options: raw.options ?? undefined,
          slug: raw.slug ?? undefined,
        });
      };

      for (const item of itemsToUse) {
        // Build options metadata to attach to the main product
        const optionMeta: any[] = [];

        const opts = Array.isArray(item.options) ? item.options : [];
        for (const o of opts) {
          // Keep a lightweight metadata object for WP (name, type, value, priceModifier, quantity)
          const metaItem: any = {
            name: o.name ?? null,
            type: o.type ?? null,
            value: o.value ?? (o.selected ? true : null),
            priceModifier: typeof o.priceModifier === 'number' ? o.priceModifier : (o.priceModifier ? Number(o.priceModifier) : null),
            quantity: o.quantity ?? null,
          };
          optionMeta.push(metaItem);

          // If option points to another product (as slug or productId), create separate line item
          const optProductSlug = o.slug ?? o.productSlug ?? null;
          const optProductIdRaw = o.productId ?? o.relatedProductId ?? null;
          if (optProductSlug || optProductIdRaw) {
            // prefer resolved numeric id if available
            const resolvedId = normalizeToDatabaseId(optProductIdRaw);
            const li: any = {
              productId: resolvedId || (optProductSlug ? String(optProductSlug) : null),
              variationId: normalizeToDatabaseId(o.variationId) || null,
              quantity: o.quantity || 1,
              price: o.price ?? 0,
              options: undefined,
              slug: optProductSlug ?? undefined,
            };
            pushLineItem(li);
          }
        }

        // Push the main product with options metadata attached
        const mainRaw: any = {
          productId: item.productId ?? item.slug ?? null,
          variationId: item.variationId ?? null,
          quantity: item.quantity ?? 1,
          price: item.price ?? 0,
          options: optionMeta.length ? optionMeta : undefined,
          slug: item.slug ?? undefined,
        };
        pushLineItem(mainRaw);
      }

      return out;
    })(),
    customer: customerToSend,
  };

  // For debugging in relaxed mode, return the prepared input so it's easy to inspect
  if (process.env.NEXT_RELAX_CREATE_ORDER === '1') {
    return res.status(200).json({ debug: true, input });
  }

  // Validate line items before sending to WP
  const missingProductIds = input.lineItems.filter((li: any) => !li.productId);
  if (missingProductIds.length > 0) {
    const relax = process.env.NEXT_RELAX_CREATE_ORDER === '1';
    const details = {
      receivedCount: Array.isArray(lineItems) ? lineItems.length : 0,
      itemsToUseCount: itemsToUse.length,
      missingProductIdsCount: missingProductIds.length,
      missingSamples: missingProductIds.slice(0, 3),
    };
    console.warn('create-order: missing productId in line items', details);
    if (!relax) {
      return res.status(400).json({ error: 'Some line items are missing productId', details });
    }
    // If relaxed, proceed but strip out invalid items to avoid WP errors
    input.lineItems = input.lineItems.filter((li: any) => !!li.productId);
  }

  try {
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
    console.debug('create-order: WP response', resp);

    const outPayload = { order: resp.order, skippedStripe: !!resp.skippedStripe };

    // Normal response
    console.debug('create-order: responding', outPayload);
    res.status(200).json(outPayload);
  } catch (error: any) {
    console.error('create-order: exception', { message: error?.message, details: error?.response?.errors || error });
    res.status(500).json({ error: error.message, details: error.response?.errors });
  }
}
