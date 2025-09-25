import { GetServerSideProps } from 'next';
import React from 'react';
import ProductOptions from 'components/ProductOptions';
import { getProducts } from 'lib/contentful/contentful';
import { fetchProductsByDatabaseIds } from 'lib/woocommerce';
import { normalizeImageUrl } from 'lib/utils/image';

const OptionsPage = ({ hero }: any) => {
    // Render ProductOptions server-provided when hero has _related_options
    if (!hero) return <div className="p-6">Product not found</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">{hero.title} — Choose Options</h1>
            <ProductOptions
                relatedIds={hero._related_options}
                relatedProducts={Array.isArray(hero._related_options_products) ? hero._related_options_products : undefined}
                parentProductId={hero.productId}
                parentProduct={hero}
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
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug ?? '');
    try {
        const { getProductBySlug } = await import('lib/contentful/contentful');
        const hero = await getProductBySlug(String(slug));
        if (!hero) {
            console.debug('Options page: hero not found via getProductBySlug for slug', slug);
            return { props: { hero: null } };
        }

        // If server did not attach the related product objects, fetch them here
        try {
            const relatedIds = Array.isArray(hero._related_options) ? hero._related_options.map((x: any) => Number(x)).filter((n: any) => !isNaN(n)) : [];
            if (relatedIds.length > 0 && (!Array.isArray(hero._related_options_products) || hero._related_options_products.length === 0)) {
                const { fetchProductsByDatabaseIds } = await import('lib/woocommerce');
                const raw = await fetchProductsByDatabaseIds(relatedIds);
                const mapped = (raw || []).map((p: any) => ({
                    id: p.id ?? null,
                    databaseId: p.databaseId ?? p.database_id ?? null,
                    // ensure name/title are present and never undefined (Next.js serializes props)
                    name: p.name ?? p.title ?? p.slug ?? null,
                    title: p.name ?? p.title ?? p.slug ?? null,
                    slug: p.slug ?? null,
                    description: p.description ?? null,
                    variableType: p.variableType || p.optionType || p.variable_type || null,
                    type: (p.type || '').toString().toLowerCase(),
                    soldIndividually: !!p.soldIndividually,
                    price: p.price ?? null,
                    regularPrice: p.regularPrice ?? null,
                    salePrice: p.salePrice ?? null,
                    image: p.image && (p.image.sourceUrl || p.image) ? (p.image.sourceUrl || p.image) : null,
                    gallery: p.galleryImages && Array.isArray(p.galleryImages.nodes) ? p.galleryImages.nodes.map((g: any) => g.sourceUrl || null) : [],
                    variations: (p.variations && Array.isArray(p.variations.nodes)) ? p.variations.nodes.map((v: any) => ({
                        id: v.id ?? null,
                        databaseId: v.databaseId ?? v.database_id ?? null,
                        name: v.name ?? null,
                        price: v.price ?? null,
                        sku: v.sku ?? null,
                        image: v.image && (v.image.sourceUrl || v.image) ? (v.image.sourceUrl || v.image) : null,
                        attributes: (v.attributes && Array.isArray(v.attributes.nodes)) ? v.attributes.nodes : (v.attributes || []),
                    })) : (Array.isArray(p.variations) ? p.variations : []),
                    _related_options: Array.isArray(p._related_options) ? p._related_options : (p.relatedOptions || []),
                }));
                hero._related_options_products = mapped;
            }
        } catch (err) {
            console.warn('Options page: failed to fetch related product objects server-side', err);
        }

        return { props: { hero } };
    } catch (e) {
        console.error('Error loading options page', e);
        return { props: { hero: null } };
    }
};

export default OptionsPage;
