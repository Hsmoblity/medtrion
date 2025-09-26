
import { GraphQLClient, gql } from 'graphql-request';
require('dotenv').config();

// Allow client-side code to use `NEXT_PUBLIC_WP_GRAPHQL_URL` while server-side
// environments may set `WP_GRAPHQL_URL`. Prefer public var when available.
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || '';
let client: GraphQLClient | null = null;
if (WP_GRAPHQL_URL) {
    try {
        // Validate URL to avoid runtime failures when constructing a URL
        // (graphql-request will attempt to construct one internally).
        // This protects client.request calls from throwing 'Invalid URL'.
        // new URL will throw if invalid.
        // eslint-disable-next-line no-new
        new URL(WP_GRAPHQL_URL);
        client = new GraphQLClient(WP_GRAPHQL_URL);
    } catch (e) {
        console.warn('Invalid WP_GRAPHQL_URL, GraphQL client not created:', WP_GRAPHQL_URL, e);
        client = null;
    }
} else {
    console.warn('WP_GRAPHQL_URL / NEXT_PUBLIC_WP_GRAPHQL_URL not set; GraphQL client not created. GraphQL-dependent features will be disabled.', process.env.WP_GRAPHQL_URL);
}

// Helper wrapper around client.request to add retry logic and better logging
async function runClientRequest(query: any, variables?: Record<string, any>) {
    if (!client) throw new Error('GraphQL client not configured');
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await client.request(query, variables);
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
        console.error('fetchGraphQLProducts: WP_GRAPHQL_URL not configured; skipping GraphQL request.');
        return [];
    }
    const query = gql`
        query GetProducts {
            products(where: { typeIn: [SIMPLE] }, first: 20) {
                nodes {
                    id
                    databaseId
                    name
                    slug
                    description
                    shortDescription
                    # Include productSpecifications as requested
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
                    slug
                    description
                    productSpecifications
                    type
                    # Prefer server-provided relatedOptions field from plugin
                    relatedOptions
                    variableType
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
        console.error('fetchProductsByDatabaseIds: GraphQL client not configured. Set WP_GRAPHQL_URL (server) or NEXT_PUBLIC_WP_GRAPHQL_URL (client) to enable fetching products by ids. Skipping GraphQL request.');
        return [];
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

// Convenience wrapper to fetch related/optional products and map to a lighter shape
export async function fetchRelatedProductsByIds(databaseIds: Array<number | string>) {
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
