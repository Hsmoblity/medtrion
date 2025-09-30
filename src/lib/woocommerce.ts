
import { GraphQLClient } from 'graphql-request';
import { 
  GET_ALL_PRODUCTS,
  GET_PRODUCTS_BY_IDS, 
  GET_OPTION_PRODUCT_BY_ID,
  GET_OPTION_PRODUCTS_BY_IDS,
  GET_CART
} from './graphql/queries';
import { parsePrice } from './utils/priceUtils';

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
    const query = GET_ALL_PRODUCTS;
    try {
        const data = await runClientRequest(query) as { products: { nodes: any[] } };
        const nodes = data.products.nodes;
        // Normalize relatedOptions (server-provided field) into both _related_options and relatedOptions
        try {
            nodes.forEach((p: any) => {
                try {
                    let normalizedOptions: number[] = [];
                    
                    if (p.relatedOptions) {
                        // relatedOptions might be array of strings/numbers
                        if (Array.isArray(p.relatedOptions)) {
                            normalizedOptions = p.relatedOptions.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                        } else if (typeof p.relatedOptions === 'string') {
                            // sometimes GraphQL returns JSON string
                            try {
                                const parsed = JSON.parse(p.relatedOptions);
                                if (Array.isArray(parsed)) normalizedOptions = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                            } catch (e) {
                                const parts = p.relatedOptions.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                if (parts.length > 0) normalizedOptions = parts;
                            }
                        }
                    }

                    // If not set from relatedOptions, try metaData fallback
                    if (normalizedOptions.length === 0 && p.metaData) {
                        let metaNodes: any[] = [];
                        if (Array.isArray(p.metaData)) metaNodes = p.metaData;
                        else if (p.metaData && Array.isArray(p.metaData.nodes)) metaNodes = p.metaData.nodes;
                        else metaNodes = [];
                        const related = (metaNodes || []).find((m: any) => m && (m.key === '_related_options' || m.key === 'related_options' || m.key === '_related_options_raw'));
                        if (related && related.value) {
                            const raw = related.value;
                            try {
                                const parsed = JSON.parse(raw);
                                if (Array.isArray(parsed)) normalizedOptions = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                            } catch (e) {
                                if (typeof raw === 'string') {
                                    const parts = raw.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                    if (parts.length > 0) normalizedOptions = parts;
                                } else if (typeof raw === 'number') {
                                    normalizedOptions = [Number(raw)];
                                }
                            }
                        }
                    }
                    
                    // Set both field names for backward compatibility and consistency
                    p._related_options = normalizedOptions;
                    p.relatedOptions = normalizedOptions;
                } catch (e) {
                    // ignore per-item parse errors
                    p._related_options = [];
                    p.relatedOptions = [];
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
                // Use the new fetchProductsByIds with display format instead of deprecated function
                try {
                    const relatedProducts = await fetchProductsByIds(allRelatedIds as Array<number | string>, { format: 'display' });
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
    const query = GET_CART;
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
    const query = GET_PRODUCTS_BY_IDS;
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
        // Normalize relatedOptions (server-provided field) into both _related_options and relatedOptions
        try {
            nodes.forEach((p: any) => {
                try {
                    let normalizedOptions: number[] = [];
                    
                    if (p.relatedOptions) {
                        if (Array.isArray(p.relatedOptions)) {
                            normalizedOptions = p.relatedOptions.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                        } else if (typeof p.relatedOptions === 'string') {
                            try {
                                const parsed = JSON.parse(p.relatedOptions);
                                if (Array.isArray(parsed)) normalizedOptions = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                            } catch (e) {
                                const parts = p.relatedOptions.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                if (parts.length > 0) normalizedOptions = parts;
                            }
                        }
                    }

                    if (normalizedOptions.length === 0 && p.metaData) {
                        let metaNodes: any[] = [];
                        if (Array.isArray(p.metaData)) metaNodes = p.metaData;
                        else if (p.metaData && Array.isArray(p.metaData.nodes)) metaNodes = p.metaData.nodes;
                        else metaNodes = [];
                        const related = (metaNodes || []).find((m: any) => m && (m.key === '_related_options' || m.key === 'related_options' || m.key === '_related_options_raw'));
                        if (related && related.value) {
                            const raw = related.value;
                            try {
                                const parsed = JSON.parse(raw);
                                if (Array.isArray(parsed)) normalizedOptions = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                            } catch (e) {
                                if (typeof raw === 'string') {
                                    const parts = raw.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                    if (parts.length > 0) normalizedOptions = parts;
                                } else if (typeof raw === 'number') {
                                    normalizedOptions = [Number(raw)];
                                }
                            }
                        }
                    }
                    
                    // Set both field names for backward compatibility and consistency
                    p._related_options = normalizedOptions;
                    p.relatedOptions = normalizedOptions;
                } catch (e) {
                    // ignore
                    p._related_options = [];
                    p.relatedOptions = [];
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

    const query = GET_OPTION_PRODUCT_BY_ID;

    try {
        const data = await runClientRequest(query, { id }) as { product: any };
        
        if (!data.product) {
            console.warn('fetchOptionProductById: No product found for ID', id);
            return null;
        }

        const product = data.product;
        
        // Normalize relatedOptions (server-provided field) into both _related_options and relatedOptions
        try {
            let normalizedOptions: number[] = [];
            
            if (product.relatedOptions) {
                if (Array.isArray(product.relatedOptions)) {
                    normalizedOptions = product.relatedOptions.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                } else if (typeof product.relatedOptions === 'string') {
                    try {
                        const parsed = JSON.parse(product.relatedOptions);
                        if (Array.isArray(parsed)) normalizedOptions = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                    } catch (e) {
                        const parts = product.relatedOptions.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                        if (parts.length > 0) normalizedOptions = parts;
                    }
                }
            }

            // If not set from relatedOptions, try metaData fallback
            if (normalizedOptions.length === 0 && product.metaData) {
                let metaNodes: any[] = [];
                if (Array.isArray(product.metaData)) metaNodes = product.metaData;
                else if (product.metaData && Array.isArray(product.metaData.nodes)) metaNodes = product.metaData.nodes;
                else metaNodes = [];
                const related = (metaNodes || []).find((m: any) => m && (m.key === '_related_options' || m.key === 'related_options' || m.key === '_related_options_raw'));
                if (related && related.value) {
                    const raw = related.value;
                    try {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) normalizedOptions = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
                    } catch (e) {
                        if (typeof raw === 'string') {
                            const parts = raw.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                            if (parts.length > 0) normalizedOptions = parts;
                        } else if (typeof raw === 'number') {
                            normalizedOptions = [Number(raw)];
                        }
                    }
                }
            }
            
            // Set both field names for backward compatibility and consistency
            product._related_options = normalizedOptions;
            product.relatedOptions = normalizedOptions;
        } catch (e) {
            // ignore normalization errors
            product._related_options = [];
            product.relatedOptions = [];
        }

        console.log('fetchOptionProductById: fetched product for ID', id, JSON.parse(JSON.stringify(product)));
        return product;
    } catch (error) {
        console.error('Error fetching option product by ID:', error);
        return null;
    }
}

// ============================================================================
// UNIFIED PRODUCT FETCHING FUNCTION
// ============================================================================

/**
 * Unified function to fetch products by their IDs with configurable options
 * 
 * This function consolidates the functionality of fetchRelatedProductsByIds and 
 * fetchOptionProductsByIds to eliminate code duplication and provide a single 
 * source of truth for product fetching logic.
 * 
 * @param ids - Array of product database IDs (numbers or strings)
 * @param options - Configuration options
 * @param options.format - Output format: 'display' for UI display, 'configurator' for full configurator data
 * @param options.includeVariations - Whether to include product variations (defaults based on format)
 * @param options.singleIdOptimization - Whether to use single-product optimization for single IDs (default: true)
 * 
 * @returns Promise resolving to array of products in the requested format
 * 
 * @example
 * // Fetch products for display (lightweight)
 * const displayProducts = await fetchProductsByIds([1, 2, 3], { format: 'display' });
 * 
 * @example
 * // Fetch products for configurator (comprehensive)
 * const configuratorProducts = await fetchProductsByIds([4, 5, 6], { format: 'configurator' });
 * 
 * @since 1.0.0 - Consolidation of fetchRelatedProductsByIds and fetchOptionProductsByIds
 */
export async function fetchProductsByIds(
    ids: Array<number | string>,
    options: {
        format: 'display' | 'configurator';
        includeVariations?: boolean;
        singleIdOptimization?: boolean;
    } = { format: 'display' }
): Promise<any[]> {
    if (!ids || ids.length === 0) {
        console.log('fetchProductsByIds: No IDs provided, returning empty array');
        return [];
    }

    const numericIds = ids.map(id => Number(id)).filter(n => !isNaN(n));
    if (numericIds.length === 0) {
        console.warn('fetchProductsByIds: No valid numeric IDs found in:', ids);
        return [];
    }

    console.log(`fetchProductsByIds: Fetching ${numericIds.length} products in ${options.format} format`);

    // Single ID optimization (for display format only, preserving original behavior)
    if (options.format === 'display' && 
        numericIds.length === 1 && 
        options.singleIdOptimization !== false) {
        console.log('fetchProductsByIds: Using single-product optimization');
        const singleProduct = await fetchOptionProductById(numericIds[0]);
        return singleProduct ? [singleProduct] : [];
    }

    // Choose appropriate query and mapping based on format
    let query: string;
    let mapFunction: (nodes: any[]) => any[];

    if (options.format === 'configurator') {
        // Use the comprehensive query for configurator format
        query = GET_OPTION_PRODUCTS_BY_IDS;
        mapFunction = mapNodesToConfiguratorFormat;
    } else {
        // Use the basic query for display format
        query = GET_PRODUCTS_BY_IDS;
        mapFunction = mapNodesToDisplayFormat;
    }

    // Execute GraphQL query
    if (!client) {
        const errorMsg = 'GraphQL client not configured - products temporarily unavailable';
        console.error('fetchProductsByIds: WP_GRAPHQL_URL not configured');
        throw new Error(errorMsg);
    }

    try {
        const data = await runClientRequest(query, { ids: numericIds }) as { products: { nodes: any[] } };
        const nodes = data.products.nodes || [];

        if (nodes.length === 0) {
            console.warn(`fetchProductsByIds: No products found for IDs:`, numericIds);
            return [];
        }

        // Apply appropriate mapping function
        const mappedProducts = mapFunction(nodes);

        console.log(`fetchProductsByIds: Successfully mapped ${mappedProducts.length} products in ${options.format} format`);
        return mappedProducts;

    } catch (error) {
        console.error('fetchProductsByIds: Error fetching products:', error);
        if (options.format === 'configurator') {
            // For configurator, return empty array to allow graceful degradation
            return [];
        } else {
            // For display, re-throw to maintain existing error handling behavior
            throw error;
        }
    }
}

/**
 * Maps GraphQL nodes to display format (lightweight for UI)
 * Used for product options pages, add-on modals, etc.
 */
function mapNodesToDisplayFormat(nodes: any[]): any[] {
    return nodes.map((p: any) => {
        // Map to a minimal, but compatible, shape. Include `name` and
        // normalize `attributes` and `variations` to arrays because several
        // callers expect these properties to be present and iterable.
        const attrArray = (p.attributes && Array.isArray(p.attributes.nodes)) ? p.attributes.nodes : (Array.isArray(p.attributes) ? p.attributes : []);
        const variationArray = (p.variations && Array.isArray(p.variations.nodes)) ? p.variations.nodes : (Array.isArray(p.variations) ? p.variations : []);

        const variations = variationArray.map((v: any) => ({
            id: v.id ?? null,
            databaseId: v.databaseId ?? v.database_id ?? null,
            name: v.name ?? null,
            price: parsePrice(v.price),
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
}

/**
 * Maps GraphQL nodes to configurator format (comprehensive for configurator)
 * Used for model configurator functionality
 */
function mapNodesToConfiguratorFormat(nodes: any[]): any[] {
    return nodes.map((node: any) => {
        // Normalize attributes from globalAttributes and local attributes
        const globalAttrs = node.globalAttributes?.nodes || [];
        const localAttrs = node.attributes?.nodes || [];
        
        // Extract price information using safe price parsing
        const price = parsePrice(node.price);
        const regularPrice = parsePrice(node.regularPrice || node.price);
        const salePrice = node.salePrice ? parsePrice(node.salePrice) : null;

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
            variations: (node.variations?.nodes || []).map((variation: any) => {
                const variationPrice = parsePrice(variation.price);
                const variationRegularPrice = parsePrice(variation.regularPrice || variation.price);
                const variationSalePrice = variation.salePrice ? parsePrice(variation.salePrice) : null;

                return {
                    id: variation.id,
                    databaseId: variation.databaseId,
                    name: variation.name || '',
                    sku: variation.sku || '',
                    price: variationPrice,
                    regularPrice: variationRegularPrice.toString(),
                    salePrice: variationSalePrice?.toString() || null,
                    image: variation.image?.sourceUrl || '',
                    attributes: variation.attributes?.nodes || []
                };
            }),
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
}

// ============================================================================
// BACKWARD COMPATIBILITY WRAPPERS (DEPRECATED)
// ============================================================================

/**
 * @deprecated Use fetchProductsByIds(ids, { format: 'display' }) instead
 * 
 * Convenience wrapper to fetch related/optional products and map to a lighter shape
 * 
 * This function is maintained for backward compatibility. New code should use
 * the unified fetchProductsByIds function with format: 'display'.
 */
export async function fetchRelatedProductsByIds(databaseIds: Array<number | string>) {
    console.warn('fetchRelatedProductsByIds is deprecated. Use fetchProductsByIds(ids, { format: "display" }) instead.');
    return fetchProductsByIds(databaseIds, { format: 'display' });
}

/**
 * @deprecated Use fetchProductsByIds(ids, { format: 'configurator' }) instead
 * 
 * Specialized function to fetch option products for configurator use
 * 
 * This function is maintained for backward compatibility. New code should use
 * the unified fetchProductsByIds function with format: 'configurator'.
 * 
 * @param relatedOptionIds - Array of numeric database IDs from relatedOptions field
 * @returns Promise<ConfigurableProductSchema[]> - Array of option products ready for configurator
 */
export async function fetchOptionProductsByIds(relatedOptionIds: Array<number | string>) {
    console.warn('fetchOptionProductsByIds is deprecated. Use fetchProductsByIds(ids, { format: "configurator" }) instead.');
    return fetchProductsByIds(relatedOptionIds, { format: 'configurator' });
}
