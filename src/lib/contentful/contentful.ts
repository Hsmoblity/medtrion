'use server'



import { fetchGraphQLProducts } from '../woocommerce';
import { ProductSchema } from '../interfaces';

function mapWooToProductSchema(product: any): ProductSchema {
	// Enhanced price parsing with fallback from description
	let price = 0;
	
	// WPGraphQL may provide price in different places depending on type
	const parsePrice = (p: any) => {
		if (p == null) return null;
		if (typeof p === 'number') return p;
		if (typeof p === 'string') {
			// remove any non-digit/period characters like $ or commas
			const cleaned = p.replace(/[^0-9.\-]/g, '');
			const n = Number(cleaned);
			return !isNaN(n) ? n : null;
		}
		return null;
	};

	// try product-level prices first
	const cand = parsePrice(product.price) ?? parsePrice(product.regularPrice) ?? parsePrice(product.salePrice);
	if (cand != null) {
		price = cand;
	} else if (product.variations && product.variations.nodes && product.variations.nodes.length > 0) {
		for (const v of product.variations.nodes) {
			const pv = parsePrice(v.price) ?? parsePrice(v.regularPrice) ?? parsePrice(v.salePrice);
			if (pv != null) {
				price = pv;
				break;
			}
		}
	}
	
	// Enhanced image handling with better fallbacks
	const ensureUrl = (u: any) => {
		if (u && typeof u === 'string' && u.trim().length > 0) {
			return u;
		}
		return '/placeholder.svg'; // Consistent fallback image
	};
	
	const gallery = (product.galleryImages && Array.isArray(product.galleryImages.nodes))
		? product.galleryImages.nodes.map((n: any) => ensureUrl(n?.sourceUrl))
			.filter(Boolean)
		: [];
	const featured = ensureUrl(product.image?.sourceUrl);
	const pictures = gallery.length > 0 ? gallery : (featured ? [featured] : ['/placeholder.svg']);

	return {
		title: product.name,
		slug: product.slug,
		shortDescription: product.shortDescription || '',
		description: product.description || '',
		featuredImage: featured,
		productSpecifications: product.productSpecifications || {} as any,
		productPictures: pictures.map((url: string) => ({ fields: { file: { url } } })),
		price,
		affiliate: false,
		productId: product.id,
		// Read related options from common GraphQL meta shapes if present
		// Prefer normalized `_related_options` if present (set by `fetchGraphQLProducts`),
		// otherwise fall back to parsing common meta shapes.
		_related_options: (() => {
			if (product && Array.isArray(product._related_options) && product._related_options.length > 0) return product._related_options;
			try {
				const candidates = [product.meta, product.metaData, product.metaFields, product._meta];
				for (const c of candidates) {
					if (!c) continue;
					if (Array.isArray(c)) {
						const found = c.find((m: any) => m?.key === '_related_options' || m?.metaKey === '_related_options');
						if (found) {
							const v = found?.value ?? found?.metaValue ?? found?.valueRaw;
							try { const parsed = JSON.parse(String(v)); return Array.isArray(parsed) ? parsed : []; } catch (e) { return String(v).split(',').map(x => x.trim()).filter(Boolean); }
						}
					}
					if (typeof c === 'object') {
						const val = c['_related_options'] ?? c['_related_options_raw'] ?? c['_related_options_value'];
						if (val != null) {
							try { const parsed = JSON.parse(String(val)); return Array.isArray(parsed) ? parsed : []; } catch (e) { return String(val).split(',').map(x => x.trim()).filter(Boolean); }
						}
					}
				}
				return [];
			} catch (e) { return []; }
		})(),
		// Map to camelCase relatedOptions for consistency with TypeScript conventions
		relatedOptions: (() => {
			// First try to get from GraphQL relatedOptions field
			if (product && Array.isArray(product.relatedOptions) && product.relatedOptions.length > 0) {
				return product.relatedOptions.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
			}
			// Fall back to _related_options if available
			if (product && Array.isArray(product._related_options) && product._related_options.length > 0) {
				return product._related_options;
			}
			// Parse from meta data as last resort
			try {
				const candidates = [product.meta, product.metaData, product.metaFields, product._meta];
				for (const c of candidates) {
					if (!c) continue;
					if (Array.isArray(c)) {
						const found = c.find((m: any) => m?.key === '_related_options' || m?.metaKey === '_related_options');
						if (found) {
							const v = found?.value ?? found?.metaValue ?? found?.valueRaw;
							try { const parsed = JSON.parse(String(v)); return Array.isArray(parsed) ? parsed : []; } catch (e) { return String(v).split(',').map(x => x.trim()).filter(Boolean); }
						}
					}
					if (typeof c === 'object') {
						const val = c['_related_options'] ?? c['_related_options_raw'] ?? c['_related_options_value'];
						if (val != null) {
							try { const parsed = JSON.parse(String(val)); return Array.isArray(parsed) ? parsed : []; } catch (e) { return String(val).split(',').map(x => x.trim()).filter(Boolean); }
						}
					}
				}
				return [];
			} catch (e) { return []; }
		})(),
		// Include variations (always an empty array for simple products)
		variations: [],
	};
}

export const getProducts = async (slug: string) => {
	try {
		const wooProducts = await fetchGraphQLProducts();
		let filtered = wooProducts;
		if (slug) {
			filtered = wooProducts.filter((p: any) => p.slug === slug);
		}
		return {
			items: filtered.map(mapWooToProductSchema)
		};
	} catch (error) {
		console.error('getProducts: Failed to fetch products from GraphQL:', error);
		// Return empty array with error info for debugging
		return {
			items: [],
			error: error instanceof Error ? error.message : 'Unknown error fetching products'
		};
	}
};


export const getProductBySlug = async (slug: string) => {
	const products = await getProducts(slug);
	return products.items && products.items.length > 0 ? products.items[0] : null;
};

// Legacy Contentful client shim - DEPRECATED
// This is kept for backward compatibility but should not be used for new features.
// All new data access should go through WooCommerce GraphQL via lib/woocommerce.ts
const client = {
	getEntries: async (opts: any) => {
		console.warn('DEPRECATED: Contentful client.getEntries() is deprecated. Use WooCommerce GraphQL instead.');
		throw new Error('Contentful client is deprecated. Use WooCommerce GraphQL via lib/woocommerce.ts instead.');
	}
};

export { client, mapWooToProductSchema };

