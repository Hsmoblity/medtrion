import { GetServerSideProps } from 'next';
import React from 'react';
import ProductOptions from 'components/ProductOptions';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
const OptionsClientWrapper = dynamic(() => import('components/OptionsClientWrapper'), { ssr: false });
import { getProducts } from 'lib/contentful/contentful';
import { fetchProductsByDatabaseIds } from 'lib/woocommerce';
import { normalizeImageUrl } from 'lib/utils/image';

const OptionsPage = ({ product, editingCartItem }: any) => {
    // Render ProductOptions server-provided when product has _related_options
    if (!product) return <div className="p-6">Product not found</div>;

    // If editing an existing cart item (cartItemId present in the query),
    // render the client-only editor. Otherwise render the server-side
    // ProductOptions UI directly so it can be used for new purchases.
    return (
        <div>
            <div className="py-24 mx-auto p-6 max-w-screen-xl px-5">
                <h1 className="text-2xl font-bold mb-4">{product.title} — Choose Options</h1>
                {editingCartItem ? (
                    // Client-side wrapper will hide/replace server UI when appropriate
                    <OptionsClientWrapper product={product} />
                ) : (
                    <div>
                        <ProductOptions
                            relatedIds={product._related_options}
                            relatedProducts={Array.isArray(product._related_options_products) ? product._related_options_products : undefined}
                            parentProductId={product.productId}
                            parentProduct={product}
                            fetchByIds={async (ids) => {
                                const idsList = (ids || []).map((x: any) => Number(x)).filter((n: any) => !isNaN(n));
                                if (idsList.length === 0) return [];
                                let res: any[] = [];
                                try {
                                    res = await fetchProductsByDatabaseIds(idsList);
                                } catch (e) {
                                    // ignore, will try fallback
                                    res = [];
                                }
                                if ((!res || res.length === 0) && typeof window !== 'undefined') {
                                    try {
                                        const url = `/api/debug/related-products?ids=${idsList.join(',')}`;
                                        const r = await fetch(url);
                                        if (r.ok) {
                                            const json = await r.json();
                                            res = Array.isArray(json?.products) ? json.products : (Array.isArray(json) ? json : (json?.items || []));
                                        }
                                    } catch (e) {
                                        console.warn('Fallback fetch to /api/debug/related-products failed', e);
                                    }
                                }
                                return (res || []).map((p: any) => ({
                                    id: p.databaseId ?? p.id,
                                    databaseId: p.databaseId ?? p.id,
                                    title: p.name,
                                    price: (p.price ? Number(p.price) : (p.regularPrice ?? p.salePrice) ?? null),
                                    sku: p.sku ?? null,
                                    type: (p.__typename && String(p.__typename).toLowerCase().includes('withvariations')) || (String(p.type || '').toLowerCase() === 'variable') ? 'variable' : 'simple',
                                    variations: (p.variations && p.variations.nodes) ? p.variations.nodes.map((v: any) => ({
                                        id: v.id,
                                        databaseId: v.databaseId ?? v.id,
                                        name: v.name ?? null,
                                        price: v.price ?? null,
                                        sku: v.sku ?? null,
                                        attributes: (v.attributes && Array.isArray(v.attributes.nodes)) ? v.attributes.nodes : (v.attributes || []),
                                        image: v.image && (v.image.sourceUrl || v.image) ? (v.image.sourceUrl || v.image) : null,
                                    })) : (p.variations || []),
                                    soldIndividually: !!p.soldIndividually,
                                    image: p.image && (p.image.sourceUrl || p.image) ? (p.image.sourceUrl || p.image) : null,
                                    variableType: p.variableType || p.optionType || p.variable_type || null,
                                }));
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { params } = context || {};
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug ?? '');
    try {
        const { getProductBySlug } = await import('lib/contentful/contentful');
        const product = await getProductBySlug(String(slug));
        if (!product) {
            console.debug('Options page: product not found via getProductBySlug for slug', slug);
            return { props: { product: null } };
        }

        // If server did not attach the related product objects, fetch them here
        try {
            const relatedIds = Array.isArray(product._related_options) ? product._related_options.map((x: any) => Number(x)).filter((n: any) => !isNaN(n)) : [];
            if (relatedIds.length > 0 && (!Array.isArray(product._related_options_products) || product._related_options_products.length === 0)) {
                const { fetchRelatedProductsByIds } = await import('lib/woocommerce');
                try {
                    const related = await fetchRelatedProductsByIds(relatedIds);
                    // Attach the exact shape produced by fetchRelatedProductsByIds so
                    // server and client share the same minimal shape.
                    product._related_options_products = Array.isArray(related) ? related : [];
                } catch (err) {
                    console.warn('Options page: failed to fetch related product objects server-side (relatedProducts)', err);
                    product._related_options_products = product._related_options_products || [];
                }
            }
        } catch (err) {
            console.warn('Options page: failed to fetch related product objects server-side', err);
        }

        // Determine whether the incoming request intends to edit an existing cart item
        // by checking for a cartItemId query parameter on the server side. This lets
        // us render the client editor only when needed.
        const url = (context && context.req && context.req.url) ? String(context.req.url) : '';
        const editing = url.includes('cartItemId=');
        return { props: { product, editingCartItem: editing } };
    } catch (e) {
        console.error('Error loading options page', e);
        return { props: { product: null } };
    }
};

export default OptionsPage;
