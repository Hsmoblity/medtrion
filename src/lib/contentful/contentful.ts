'use server'



import { fetchGraphQLProducts } from '../woocommerce';
import { ProductSchema } from '../interfaces';

function mapWooToProductSchema(product: any): ProductSchema {
	// Lấy giá cho mọi loại sản phẩm (Simple, Variation, Group, External...)
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
	const ensureUrl = (u: any) => (u && typeof u === 'string' && u.trim().length > 0) ? u : '/temp.webp';
	const gallery = (product.galleryImages && Array.isArray(product.galleryImages.nodes))
		? product.galleryImages.nodes.map((n: any) => ensureUrl(n?.sourceUrl))
			.filter(Boolean)
		: [];
	const featured = ensureUrl(product.image?.sourceUrl);
	const pictures = gallery.length > 0 ? gallery : (featured ? [featured] : ['/temp.webp']);

	return {
		title: product.name,
		slug: product.slug,
		shortDescription: product.description || '',
		featuredImage: featured,
		productSpecifications: {} as any,
		productPictures: pictures.map((url: string) => ({ fields: { file: { url } } })),
		price,
		affiliate: false,
		productId: product.id,
	};
}

export const getProducts = async (slug: string) => {
	const wooProducts = await fetchGraphQLProducts();
	let filtered = wooProducts;
	if (slug) {
		filtered = wooProducts.filter((p: any) => p.slug === slug);
	}
	return {
		items: filtered.map(mapWooToProductSchema)
	};
};


export const getProductBySlug = async (slug: string) => {
	const products = await getProducts(slug);
	return products.items && products.items.length > 0 ? products.items[0] : null;
};

