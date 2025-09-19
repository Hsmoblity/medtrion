
import { GraphQLClient, gql } from 'graphql-request';

console.log('WP_GRAPHQL_URL:', process.env.WP_GRAPHQL_URL);
const client = new GraphQLClient(process.env.WP_GRAPHQL_URL || '');

export async function fetchGraphQLProducts() {
    const query = gql`
        query GetProducts {
            products(first: 20) {
                nodes {
                    id
                    databaseId
                    name
                    slug
                    description
                    image {
                        sourceUrl
                    }
                    galleryImages(first: 10) {
                        nodes {
                            sourceUrl
                        }
                    }
                    ... on ProductWithVariations {
                        variations(first: 10) {
                            nodes {
                                price
                                regularPrice
                                salePrice
                            }
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
                    ... on GroupProduct {
                        price
                    }
                    ... on ProductVariation {
                        price
                    }
                }
            }
        }
    `;
    try {
        const data = await client.request(query) as { products: { nodes: any[] } };
        const nodes = data.products.nodes;

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

        return nodes;
    } catch (error) {
        console.error('Error fetching products from WPGraphQL:', error);
        return [];
    }
}

export async function fetchGraphQLCart(cartKey: string) {
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
        const data = await client.request(query, { key: cartKey }) as { cart: any };
        return data.cart;
    } catch (error) {
        console.error('Error fetching cart from WPGraphQL:', error);
        return null;
    }
}
