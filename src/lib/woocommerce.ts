
import { GraphQLClient, gql } from 'graphql-request';

// Load environment variables in Node.js environment
if (typeof window === 'undefined') {
  try {
    // Try to load dotenv if available
    if (typeof require !== 'undefined') {
      require('dotenv').config();
    }
  } catch (error) {
    // Ignore dotenv errors - Next.js should handle env vars
    console.warn('dotenv not available, relying on Next.js environment variables');
  }
}

// Environment variable priority: WP_GRAPHQL_URL (primary), NEXT_PUBLIC_WP_GRAPHQL_URL (secondary)
// Only use NEXT_PUBLIC_WP_GRAPHQL_URL when server-side var is absent
const WP_GRAPHQL_URL = (typeof process !== 'undefined' && process.env) 
  ? (process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || '')
  : '';

// Debug logging
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
  console.log('WooCommerce GraphQL URL:', WP_GRAPHQL_URL);
  console.log('Environment variables available:', {
    WP_GRAPHQL_URL: process.env.WP_GRAPHQL_URL,
    NEXT_PUBLIC_WP_GRAPHQL_URL: process.env.NEXT_PUBLIC_WP_GRAPHQL_URL
  });
}

let client: GraphQLClient | null = null;

if (WP_GRAPHQL_URL) {
    try {
        // Validate URL to avoid runtime failures when constructing a URL
        // (graphql-request will attempt to construct one internally).
        // This protects client.request calls from throwing 'Invalid URL'.
        // new URL will throw if invalid.
        // eslint-disable-next-line no-new
        new URL(WP_GRAPHQL_URL);
        
        // Configure GraphQL client with SSL handling
        const clientOptions: any = {};
        if (typeof window === 'undefined' && process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
            // Use node-fetch with SSL certificate verification disabled
            console.log('SSL certificate verification disabled for GraphQL requests');
            const fetch = require('node-fetch');
            const { Agent } = require('https');
            
            const agent = new Agent({
                rejectUnauthorized: false
            });
            
            clientOptions.fetch = (url: string, options: any) => {
                return fetch(url, {
                    ...options,
                    agent
                });
            };
        }
        
        client = new GraphQLClient(WP_GRAPHQL_URL, clientOptions);
    } catch (e) {
        console.warn('Invalid WP_GRAPHQL_URL, GraphQL client not created:', WP_GRAPHQL_URL, e);
        client = null;
    }
} else {
    // Only show warning in development, not in Storybook
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
        console.warn('WP_GRAPHQL_URL / NEXT_PUBLIC_WP_GRAPHQL_URL not set; GraphQL client not created. GraphQL-dependent features will be disabled.');
    }
}

// Helper wrapper around client.request to add retry logic and better logging
export async function runClientRequest(query: any, variables?: Record<string, any>) {
    if (!client) throw new Error('GraphQL client not configured');

    // console.log('GraphQL query:', query);

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const body = JSON.stringify({ query, variables });
            const fetchOptions: RequestInit = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            };

            // In Node.js environment, handle SSL certificate issues if NODE_TLS_REJECT_UNAUTHORIZED is set
            if (typeof window === 'undefined' && process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
                // For server-side requests with SSL issues, we need to use a custom agent
                // This is already handled by the environment variable
            }

            const response = await fetch(WP_GRAPHQL_URL, fetchOptions);

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`GraphQL request failed with status ${response.status}: ${errorBody}`);
            }

            const json = await response.json();

            if (json.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`);
            }

            return json.data;
        } catch (err: any) {
            // Provide detailed log to help diagnose fetch failures (DNS, TLS, CORS, network)
            console.error(`GraphQL request failed (attempt ${attempt}/${maxAttempts})`, {
                url: WP_GRAPHQL_URL,
                attempt,
                message: err && err.message ? err.message : String(err),
                stack: err && err.stack ? err.stack : undefined,
            });
            if (attempt === maxAttempts) throw err;
            // backoff before retrying
            await new Promise(res => setTimeout(res, attempt * 300));
        }
    }
}

export async function fetchGraphQLProducts() {
    if (!client) {
        const errorMsg = 'GraphQL client not configured - products temporarily unavailable';
        if (process.env.NODE_ENV === 'development') {
            console.error('fetchGraphQLProducts: WP_GRAPHQL_URL not configured; skipping GraphQL request.');
            console.error('Available environment variables:', {
                WP_GRAPHQL_URL: process.env.WP_GRAPHQL_URL,
                NEXT_PUBLIC_WP_GRAPHQL_URL: process.env.NEXT_PUBLIC_WP_GRAPHQL_URL,
                NODE_ENV: process.env.NODE_ENV
            });
        } else {
            console.warn('fetchGraphQLProducts: GraphQL client not configured');
        }
        throw new Error(errorMsg);
    }
    const query = gql`
        query GetProducts {
            products(where: { typeIn: [SIMPLE, VARIABLE] }, first: 50) {
                nodes {
                    id
                    databaseId
                    name
                    slug
                    description
                    shortDescription
                    productSpecifications
                    
                    # New GraphQL field added by WP plugin: relatedOptions
                    relatedOptions
                    image {
                        sourceUrl
                    }
                    galleryImages(first: 10) {
                        nodes {
                            sourceUrl
                        }
                    }
                    ... on SimpleProduct {
                        price
                        regularPrice
                        salePrice
                    }
                    ... on ProductWithPricing {
                        price
                        regularPrice
                        salePrice
                    }
                    ... on ExternalProduct {
                        price
                    }
                    ... on VariableProduct {
                        price
                        regularPrice
                        salePrice
                        variations(first: 20) {
                            nodes {
                                id
                                databaseId
                                name
                                slug
                                price
                                regularPrice
                                salePrice
                                sku
                                image {
                                    sourceUrl
                                }
                                attributes {
                                    nodes {
                                        id
                                        name
                                        value
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    try {
        const data = await runClientRequest(query) as { products: { nodes: any[] } };
        const nodes = data.products.nodes;
        // Normalize relatedOptions (server-provided field) into _related_options, falling back to metaData parsing
        try {
            nodes.forEach((p: any) => {
                try {
                    if (p.relatedOptions) {
                        // relatedOptions might be array of strings/numbers
                        if (Array.isArray(p.relatedOptions)) {
                            p._related_options = p.relatedOptions.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                        } else if (typeof p.relatedOptions === 'string') {
                            // sometimes GraphQL returns JSON string
                            try {
                                const parsed = JSON.parse(p.relatedOptions);
                                if (Array.isArray(parsed)) p._related_options = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                            } catch (e) {
                                const parts = p.relatedOptions.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                if (parts.length > 0) p._related_options = parts;
                            }
                        }
                    }

                    // If not set from relatedOptions, try metaData fallback
                    if ((!p._related_options || p._related_options.length === 0) && p.metaData) {
                        let metaNodes: any[] = [];
                        if (Array.isArray(p.metaData)) metaNodes = p.metaData;
                        else if (p.metaData && Array.isArray(p.metaData.nodes)) metaNodes = p.metaData.nodes;
                        else metaNodes = [];
                        const related = (metaNodes || []).find((m: any) => m && (m.key === '_related_options' || m.key === 'related_options' || m.key === '_related_options_raw'));
                        if (related && related.value) {
                            const raw = related.value;
                            try {
                                const parsed = JSON.parse(raw);
                                if (Array.isArray(parsed)) p._related_options = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                            } catch (e) {
                                if (typeof raw === 'string') {
                                    const parts = raw.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                    if (parts.length > 0) p._related_options = parts;
                                } else if (typeof raw === 'number') {
                                    p._related_options = [Number(raw)];
                                }
                            }
                        }
                    }
                } catch (e) {
                    // ignore per-item parse errors
                }
            });
        } catch (e) {
            // ignore
        }

        console.log('fetchGraphQLProducts: fetched product nodes:', JSON.parse(JSON.stringify(nodes)));

        // If GraphQL doesn't return media, try the WP REST API as a fallback.
        // This helps when WPGraphQL media fields are null but attachments exist.
        const fetchMediaForProduct = async (databaseId: number) => {
            try {
                const wpBase = process.env.WP_REST_URL || (process.env.WP_GRAPHQL_URL || '').replace(/\/graphql\/?$/i, '');
                if (!wpBase) return [];
                const url = `${wpBase.replace(/\/$/, '')}/wp-json/wp/v2/media?parent=${databaseId}&per_page=20`;
                const res = await fetch(url);
                if (!res.ok) return [];
                const json = await res.json();
                return Array.isArray(json) ? json : [];
            } catch (e) {
                console.warn('Failed to fetch media from REST API for product', databaseId, e);
                return [];
            }
        };

        // Enrich nodes with REST media when GraphQL image/gallery are empty
        await Promise.all(nodes.map(async (p) => {
            try {
                const hasImage = p.image && p.image.sourceUrl;
                const hasGallery = p.galleryImages && Array.isArray(p.galleryImages.nodes) && p.galleryImages.nodes.length > 0;
                if (!hasImage && !hasGallery && p.databaseId) {
                    const media = await fetchMediaForProduct(Number(p.databaseId));
                    if (media && media.length > 0) {
                        // Use first attachment as featured image and map the rest as gallery
                        p.image = { sourceUrl: media[0].source_url || media[0].sourceUrl };
                        p.galleryImages = { nodes: media.map((m: any) => ({ sourceUrl: m.source_url || m.sourceUrl })) };
                    }
                }
            } catch (e) {
                // ignore per-item errors
            }
        }));

        // If any product declares related options, fetch those related product
        // objects now so the client doesn't need to fetch them later.
        try {
            const allRelatedIds = Array.from(new Set(nodes.reduce((acc: number[], p: any) => {
                const ids = Array.isArray(p._related_options) ? p._related_options.map((n: any) => Number(n)).filter((x: any) => !isNaN(x)) : [];
                return acc.concat(ids);
            }, [])));

            if (allRelatedIds.length > 0) {
                // fetchRelatedProductsByIds is defined later in this module
                try {
                    const relatedProducts = await fetchRelatedProductsByIds(allRelatedIds);
                    const relatedMap: Record<number, any> = {};
                    (relatedProducts || []).forEach((rp: any) => {
                        if (rp && rp.databaseId) relatedMap[Number(rp.databaseId)] = rp;
                    });

                    nodes.forEach((p: any) => {
                        try {
                            const ids = Array.isArray(p._related_options) ? p._related_options.map((n: any) => Number(n)).filter((x: any) => !isNaN(x)) : [];
                            p._related_options_products = ids.map((id: number) => relatedMap[id]).filter(Boolean);
                        } catch (e) {
                            p._related_options_products = [];
                        }
                    });
                } catch (e) {
                    console.warn('fetchGraphQLProducts: failed to fetch related products', e);
                    // ensure property exists
                    nodes.forEach((p: any) => { p._related_options_products = p._related_options_products || []; });
                }
            } else {
                // ensure property exists even when there are no related ids
                nodes.forEach((p: any) => { p._related_options_products = p._related_options_products || []; });
            }
        } catch (e) {
            // ignore
            nodes.forEach((p: any) => { p._related_options_products = p._related_options_products || []; });
        }

        return nodes;
    } catch (error) {
        console.error('Error fetching products from WPGraphQL:', error);
        return [];
    }
}

export async function fetchGraphQLCart(cartKey: string) {
    if (!client) {
        console.error('fetchGraphQLCart: WP_GRAPHQL_URL not configured; skipping GraphQL request.');
        return null;
    }
    const query = gql`
        query GetCart($key: String!) {
            cart(key: $key) {
                contents {
                    nodes {
                        product {
                            node {
                                id
                                name
                                image {
                                    sourceUrl
                                }
                            }
                        }
                        quantity
                        total
                    }
                }
                total
            }
        }
    `;
    try {
        const data = await runClientRequest(query, { key: cartKey }) as { cart: any };
        return data.cart;
    } catch (error) {
        console.error('Error fetching cart from WPGraphQL:', error);
        return null;
    }
}

export async function fetchProductsByDatabaseIds(databaseIds: Array<number | string>) {
    if (!databaseIds || databaseIds.length === 0) return [];
    const idsList = databaseIds.map(id => Number(id)).filter(n => !isNaN(n));
    if (idsList.length === 0) return [];
    const query = gql`
        query GetProductsByIds($ids: [Int]) {
            products(where: { include: $ids,  typeIn: [VARIABLE] }) {
                nodes {
                    id
                    databaseId
                    name
                    slug
                    __typename
                    description
                    shortDescription
                    productSpecifications
                    globalAttributes { 
                        nodes { 
                            label 
                            terms { 
                                nodes { 
                                    name 
                                } 
                            } 
                        } 
                    }
                    type
                    # Prefer server-provided relatedOptions field from plugin
                    relatedOptions
                    variableType
                    image { sourceUrl }
                    galleryImages(first: 10) { 
                        nodes { 
                            sourceUrl 
                        } 
                    }
                    ... on SimpleProduct { 
                        price 
                        regularPrice 
                        salePrice 
                    }
                    ... on ProductWithVariations {
                        attributes{
                            nodes{
                                name
                            }
                        }
                        variations(first: 50) {
                            nodes {
                                id
                                databaseId
                                sku
                                price
                                regularPrice
                                salePrice
                                image { sourceUrl }
                                attributes { nodes { id name value } }
                            }
                        }
                    }
                }
            }
        }
    `;
    if (!client) {
        const errorMsg = 'GraphQL client not configured - products temporarily unavailable';
        if (process.env.NODE_ENV === 'development') {
            console.error('fetchProductsByDatabaseIds: WP_GRAPHQL_URL not configured; skipping GraphQL request.');
        } else {
            console.warn('fetchProductsByDatabaseIds: GraphQL client not configured');
        }
        throw new Error(errorMsg);
    }

    try {
        const data = await runClientRequest(query, { ids: idsList }) as { products: { nodes: any[] } };
        const nodes = data.products.nodes || [];
        // Normalize relatedOptions (server-provided field) into _related_options, falling back to metaData parsing
        try {
            nodes.forEach((p: any) => {
                try {
                    if (p.relatedOptions) {
                        if (Array.isArray(p.relatedOptions)) {
                            p._related_options = p.relatedOptions.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                        } else if (typeof p.relatedOptions === 'string') {
                            try {
                                const parsed = JSON.parse(p.relatedOptions);
                                if (Array.isArray(parsed)) p._related_options = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                            } catch (e) {
                                const parts = p.relatedOptions.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                if (parts.length > 0) p._related_options = parts;
                            }
                        }
                    }

                    if ((!p._related_options || p._related_options.length === 0) && p.metaData) {
                        let metaNodes: any[] = [];
                        if (Array.isArray(p.metaData)) metaNodes = p.metaData;
                        else if (p.metaData && Array.isArray(p.metaData.nodes)) metaNodes = p.metaData.nodes;
                        else metaNodes = [];
                        const related = (metaNodes || []).find((m: any) => m && (m.key === '_related_options' || m.key === 'related_options' || m.key === '_related_options_raw'));
                        if (related && related.value) {
                            const raw = related.value;
                            try {
                                const parsed = JSON.parse(raw);
                                if (Array.isArray(parsed)) p._related_options = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                            } catch (e) {
                                if (typeof raw === 'string') {
                                    const parts = raw.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                    if (parts.length > 0) p._related_options = parts;
                                } else if (typeof raw === 'number') {
                                    p._related_options = [Number(raw)];
                                }
                            }
                        }
                    }
                } catch (e) {
                    // ignore
                }
            });
        } catch (e) {
            // ignore
        }

        console.log('fetchProductsByDatabaseIds: fetched product nodes for ids', idsList, JSON.parse(JSON.stringify(nodes)));
        return nodes;
    } catch (e) {
        console.error('Error fetching products by ids', e);
        return [];
    }
}

// Single-purpose query for fetching one option product by database ID
export async function fetchOptionProductById(databaseId: number | string) {
    if (!databaseId) return null;
    
    const id = Number(databaseId);
    if (isNaN(id)) return null;

    if (!client) {
        const errorMsg = 'GraphQL client not configured - option product temporarily unavailable';
        if (process.env.NODE_ENV === 'development') {
            console.error('fetchOptionProductById: WP_GRAPHQL_URL not configured; skipping GraphQL request.');
        } else {
            console.warn('fetchOptionProductById: GraphQL client not configured');
        }
        throw new Error(errorMsg);
    }

    const query = gql`
        query GetOptionProductById($id: ID!) {
            product(id: $id, idType: DATABASE_ID) {
                id
                databaseId
                name
                slug
                description
                shortDescription
                productSpecifications
                type
                relatedOptions
                image {
                    sourceUrl
                    altText
                }
                galleryImages(first: 10) {
                    nodes {
                        sourceUrl
                        altText
                    }
                }
                ... on SimpleProduct {
                    price
                    regularPrice
                    salePrice
                    sku
                }
                ... on VariableProduct {
                    price
                    regularPrice
                    salePrice
                    sku
                    variableType
                    attributes {
                        nodes {
                            id
                            name
                        }
                    }
                    variations(first: 50) {
                        nodes {
                            id
                            databaseId
                            name
                            price
                            regularPrice
                            salePrice
                            sku
                            image {
                                sourceUrl
                                altText
                            }
                            attributes {
                                nodes {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const data = await runClientRequest(query, { id }) as { product: any };
        
        if (!data.product) {
            console.warn('fetchOptionProductById: No product found for ID', id);
            return null;
        }

        const product = data.product;
        
        // Normalize relatedOptions (server-provided field) into _related_options, falling back to metaData parsing
        try {
            if (product.relatedOptions) {
                if (Array.isArray(product.relatedOptions)) {
                    product._related_options = product.relatedOptions.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                } else if (typeof product.relatedOptions === 'string') {
                    try {
                        const parsed = JSON.parse(product.relatedOptions);
                        if (Array.isArray(parsed)) product._related_options = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                    } catch (e) {
                        const parts = product.relatedOptions.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                        if (parts.length > 0) product._related_options = parts;
                    }
                }
            }

            // If not set from relatedOptions, try metaData fallback
            if ((!product._related_options || product._related_options.length === 0) && product.metaData) {
                let metaNodes: any[] = [];
                if (Array.isArray(product.metaData)) metaNodes = product.metaData;
                else if (product.metaData && Array.isArray(product.metaData.nodes)) metaNodes = product.metaData.nodes;
                else metaNodes = [];
                const related = (metaNodes || []).find((m: any) => m && (m.key === '_related_options' || m.key === 'related_options' || m.key === '_related_options_raw'));
                if (related && related.value) {
                    const raw = related.value;
                    try {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) product._related_options = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                    } catch (e) {
                        if (typeof raw === 'string') {
                            const parts = raw.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                            if (parts.length > 0) product._related_options = parts;
                        } else if (typeof raw === 'number') {
                            product._related_options = [Number(raw)];
                        }
                    }
                }
            }
        } catch (e) {
            // ignore normalization errors
        }

        console.log('fetchOptionProductById: fetched product for ID', id, JSON.parse(JSON.stringify(product)));
        return product;
    } catch (error) {
        console.error('Error fetching option product by ID:', error);
        return null;
    }
}

// Convenience wrapper to fetch related/optional products and map to a lighter shape
export async function fetchRelatedProductsByIds(databaseIds: Array<number | string>) {
    // Use single-purpose query for single ID case
    if (databaseIds.length === 1) {
        const singleProduct = await fetchOptionProductById(databaseIds[0]);
        return singleProduct ? [singleProduct] : [];
    }
    
    // Use multi-purpose query for multiple IDs
    const raw = await fetchProductsByDatabaseIds(databaseIds);
    if (!raw || raw.length === 0) return [];

    console.log('fetchRelatedProductsByIds: fetched raw products', raw);

    const mapped = raw.map((p: any) => {
        // Map to a minimal, but compatible, shape. Include `name` and
        // normalize `attributes` and `variations` to arrays because several
        // callers expect these properties to be present and iterable.
        const attrArray = (p.attributes && Array.isArray(p.attributes.nodes)) ? p.attributes.nodes : (Array.isArray(p.attributes) ? p.attributes : []);
        const variationArray = (p.variations && Array.isArray(p.variations.nodes)) ? p.variations.nodes : (Array.isArray(p.variations) ? p.variations : []);

        const variations = variationArray.map((v: any) => ({
            id: v.id ?? null,
            databaseId: v.databaseId ?? v.database_id ?? null,
            name: v.name ?? null,
            price: v.price ?? null,
            sku: v.sku ?? null,
            image: v.image && (v.image.sourceUrl || v.image) ? (v.image.sourceUrl || v.image) : null,
            attributes: (v.attributes && Array.isArray(v.attributes.nodes)) ? v.attributes.nodes : (Array.isArray(v.attributes) ? v.attributes : []),
        }));

        return {
            id: p.id ?? null,
            databaseId: p.databaseId ?? null,
            slug: p.slug ?? null,
            name: attrArray[0]?.name ?? p.name ?? p.title ?? p.slug ?? null,
            // Pass through productSpecifications when present
            productSpecifications: p.productSpecifications ?? null,
            description: p.description ?? null,
            type: p.type ?? null,
            relatedOptions: p.relatedOptions ?? null,
            variableType: p.variableType ?? null,
            attributes: attrArray,
            variations,
        };
    });

    console.log('fetchRelatedProductsByIds: mapped related products for ids', databaseIds, JSON.parse(JSON.stringify(mapped)));
    return mapped;
}

/**
 * Specialized function to fetch option products using the GetProductsByIds query
 * This implements the feat-option-query-followup.yaml requirements
 * 
 * @param relatedOptionIds - Array of numeric database IDs from relatedOptions field
 * @returns Promise<ConfigurableProductSchema[]> - Array of option products ready for configurator
 */
export async function fetchOptionProductsByIds(relatedOptionIds: Array<number | string>) {
    if (!relatedOptionIds || relatedOptionIds.length === 0) {
        console.log('fetchOptionProductsByIds: No related option IDs provided, skipping query');
        return [];
    }

    const numericIds = relatedOptionIds.map(id => Number(id)).filter(n => !isNaN(n));
    if (numericIds.length === 0) {
        console.warn('fetchOptionProductsByIds: No valid numeric IDs found in:', relatedOptionIds);
        return [];
    }

    console.log('fetchOptionProductsByIds: Fetching option products for IDs:', numericIds);

    if (!client) {
        const errorMsg = 'GraphQL client not configured - option products temporarily unavailable';
        console.error('fetchOptionProductsByIds: WP_GRAPHQL_URL not configured');
        throw new Error(errorMsg);
    }

    // Use the complete GetProductsByIds query template with all required fields for options
    const query = gql`
        query GetProductsByIds($ids: [Int]) {
            products(where: { include: $ids, typeIn: [VARIABLE] }) {
                nodes {
                    id
                    databaseId
                    name
                    slug
                    __typename
                    description
                    shortDescription
                    productSpecifications
                    globalAttributes { 
                        nodes { 
                            label 
                            terms { 
                                nodes { 
                                    name 
                                } 
                            } 
                        } 
                    }
                    type
                    relatedOptions
                    variableType
                    image { sourceUrl }
                    galleryImages(first: 10) { 
                        nodes { 
                            sourceUrl 
                        } 
                    }
                    ... on SimpleProduct { 
                        price 
                        regularPrice 
                        salePrice 
                        sku
                    }
                    ... on ProductWithVariations {
                        attributes {
                            nodes {
                                name
                                label
                                options
                            }
                        }
                        variations(first: 50) {
                            nodes {
                                id
                                databaseId
                                name
                                sku
                                price
                                regularPrice
                                salePrice
                                image { sourceUrl }
                                attributes { 
                                    nodes { 
                                        id 
                                        name 
                                        value 
                                    } 
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const data = await runClientRequest(query, { ids: numericIds }) as { products: { nodes: any[] } };
        const nodes = data.products.nodes || [];

        if (nodes.length === 0) {
            console.warn('fetchOptionProductsByIds: No option products found for IDs:', numericIds);
            return [];
        }

        // Map to ConfigurableProductSchema format for configurator use
        const optionProducts = nodes.map((node: any) => {
            // Normalize attributes from globalAttributes and local attributes
            const globalAttrs = node.globalAttributes?.nodes || [];
            const localAttrs = node.attributes?.nodes || [];
            
            // Extract price information
            const price = node.price ? parseFloat(node.price.replace(/[^0-9.-]/g, '')) : 0;
            const regularPrice = node.regularPrice ? parseFloat(node.regularPrice.replace(/[^0-9.-]/g, '')) : price;
            const salePrice = node.salePrice ? parseFloat(node.salePrice.replace(/[^0-9.-]/g, '')) : null;

            // Normalize related options for nested option products
            let normalizedRelatedOptions: number[] = [];
            if (node.relatedOptions) {
                if (Array.isArray(node.relatedOptions)) {
                    normalizedRelatedOptions = node.relatedOptions.map((v: any) => Number(v)).filter((n: number) => !isNaN(n));
                } else if (typeof node.relatedOptions === 'string') {
                    try {
                        const parsed = JSON.parse(node.relatedOptions);
                        if (Array.isArray(parsed)) {
                            normalizedRelatedOptions = parsed.map((v: any) => Number(v)).filter((n: number) => !isNaN(n));
                        }
                    } catch (e) {
                        const parts = node.relatedOptions.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                        normalizedRelatedOptions = parts;
                    }
                }
            }

            const configurableProduct: any = {
                id: node.id || node.databaseId?.toString() || '',
                databaseId: node.databaseId || undefined,
                name: node.name || '',
                slug: node.slug || '',
                title: node.name || '',
                description: node.description || '',
                shortDescription: node.shortDescription || node.description || '',
                featuredImage: node.image?.sourceUrl || '',
                image: node.image ? {
                    sourceUrl: node.image.sourceUrl,
                    altText: `${node.name} option image`
                } : undefined,
                price: price,
                regularPrice: regularPrice?.toString() || undefined,
                salePrice: salePrice?.toString() || null,
                sku: node.sku || undefined,
                type: node.type || 'simple',
                affiliate: false,
                productId: node.databaseId?.toString() || '',
                
                // Configurator-specific fields
                baseModel: false, // Option products are not base models
                configuratorCategories: [],
                compatibilityRules: [],
                installationRequired: false,
                financingAvailable: false,
                insuranceCoverage: [],
                safetyRating: undefined,
                adaCompliant: false,
                weightCapacity: undefined,
                
                // Product data arrays
                productPictures: (node.galleryImages?.nodes || []).map((img: any) => img.sourceUrl).filter(Boolean),
                variations: (node.variations?.nodes || []).map((variation: any) => ({
                    id: variation.id,
                    databaseId: variation.databaseId,
                    name: variation.name || '',
                    sku: variation.sku || '',
                    price: variation.price ? parseFloat(variation.price.replace(/[^0-9.-]/g, '')) : 0,
                    regularPrice: variation.regularPrice || variation.price || '',
                    salePrice: variation.salePrice || null,
                    image: variation.image?.sourceUrl || '',
                    attributes: variation.attributes?.nodes || []
                })),
                options: [], // Will be populated by parent component if needed
                _related_options: normalizedRelatedOptions,
                _related_options_products: [] as any[], // Will be populated if nested options exist
                
                // Additional fields for configurator
                productSpecifications: node.productSpecifications || '',
                globalAttributes: globalAttrs,
                localAttributes: localAttrs,
                __typename: node.__typename || 'SimpleProduct'
            };

            return configurableProduct;
        });

        console.log('fetchOptionProductsByIds: Successfully mapped', optionProducts.length, 'option products with specifications and attributes');
        console.log('fetchOptionProductsByIds: Option products preview:', optionProducts.map(p => ({ 
            id: p.id, 
            name: p.name, 
            price: p.price,
            type: p.type,
            hasSpecs: !!p.productSpecifications,
            hasGlobalAttrs: p.globalAttributes?.length > 0,
            hasVariations: p.variations?.length > 0
        })));

        return optionProducts;

    } catch (error) {
        console.error('fetchOptionProductsByIds: Error fetching option products:', error);
        // Don't throw - return empty array to allow graceful degradation
        return [];
    }
}
