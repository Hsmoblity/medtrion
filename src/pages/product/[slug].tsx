import MetaHead from "components/MetaHead";
import FAQ from "components/faq";
import Banner from "components/banner";
import { Reviews } from "components/reviews";
import Form from "components/step-form";
import { useEffect, useState } from "react";
import { getProducts } from "lib/contentful/contentful";
import ProductOptions from 'components/ProductOptions';
import { fetchProductsByDatabaseIds } from 'lib/woocommerce';
import ProductList from "components/ProductList/ProductList";
import { GetServerSideProps } from 'next';
import ProductItem from "components/ProductList/ProductItem";
import { stripHtml } from "lib/utils/text";
import { normalizeImageUrl } from "lib/utils/image";
import { Document } from "@contentful/rich-text-types";

interface ContentfulProduct {
    fields: {
        title: string;
        slug: string;
        shortDescription: any;
        featuredImage?: {
            fields: {
                file: {
                    url: string;
                };
            };
        };
        productSpecifications: Document;
        productPictures?: any[];
        price: number;
        affiliate: boolean;
    };
}

type Props = {
    params: { slug: string };
    mappedProducts: any[];
    hero: any;
};

const ProductPage = ({ params, mappedProducts, hero }: Props) => {
    const { slug } = params; // Now this will definitely work
    const pageTitle = hero ? hero.title : "Product Not Found";
    const pageDescription = hero ? stripHtml(hero.shortDescription) : "Explore our mobility products.";
    const pageImage = hero && hero.productPictures && hero.productPictures[0] && hero.productPictures[0].fields?.file?.url
        ? normalizeImageUrl(hero.productPictures[0].fields.file.url)
        : normalizeImageUrl(hero && hero.featuredImage ? hero.featuredImage : '/temp.webp'); // Fallback to a default image


    return (
        <>
            <MetaHead
                title={pageTitle}
                description={pageDescription}
                featuredImage={pageImage}
            />
            {hero && <ProductItem product={hero} />}
            {/* Render related options (add-ons) when available */}
            {/* {hero && hero._related_options && Array.isArray(hero._related_options) && hero._related_options.length > 0 && (
                <div className="max-w-4xl mx-auto mt-6 px-4">
                    <ProductOptions relatedIds={hero._related_options} relatedProducts={Array.isArray((hero as any)._related_options_products) ? (hero as any)._related_options_products : undefined} fetchByIds={async (ids) => {
                        const idsList = (ids || []).map((x: any) => Number(x)).filter((n: any) => !isNaN(n));
                        if (idsList.length === 0) return [];
                        let res = await fetchProductsByDatabaseIds(idsList);
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
                        // map to shape expected by ProductOptions
                        return (res || []).map((p: any) => ({
                            id: p.databaseId ?? p.id,
                            title: p.name,
                            price: (p.price ? Number(p.price) : (p.regularPrice ?? p.salePrice) ?? null),
                            sku: p.sku ?? null,
                            type: p.__typename && String(p.__typename).toLowerCase().includes('withvariations') ? 'variable' : 'simple',
                            variations: (p.variations && p.variations.nodes) ? p.variations.nodes : (p.variations || []),
                            soldIndividually: p.soldIndividually ?? false,
                            image: p.image && (p.image.sourceUrl || p.image) ? (p.image.sourceUrl || p.image) : null,
                        }));
                    }} parentProductId={hero.productId} />
                </div>
            )} */}
            <div className="justify-center mx-auto">
                <h2 className="text-center md:text-4xl text-2xl uppercase leading-8 text-gray-800 my-6 font-bold font-poppins max-w-4xl mx-auto">
                    Explore a curated selection of top-notch mobility products crafted to elevate your lifestyle.
                </h2>
                <ProductList products={mappedProducts} />
            </div>
            <FAQ />
            <Banner />
            <div className="py-8">

                <Form />
            </div>
            <Reviews />
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const { slug } = params || {}; // Safeguard against undefined params

    if (!slug) {
        return { notFound: true }; // Optionally handle the case where slug is missing
    }

    try {
        const response = await getProducts(""); // Fetch already-mapped products
        const sanitize = (v: any): any => {
            if (v === undefined) return null;
            if (v === null) return null;
            if (Array.isArray(v)) return v.map(sanitize);
            if (typeof v === 'object') {
                const out: any = {};
                for (const k of Object.keys(v)) out[k] = sanitize(v[k]);
                return out;
            }
            return v;
        };
        const items = Array.isArray(response.items) ? response.items.map(sanitize) : [];

        // Ensure compatibility with ProductItem which expects `productSpeciications` (misspelled)
        const mappedProducts = items.map((item: any) => ({
            ...item,
            productSpeciications: item.productSpeciications || item.productSpecifications || null,
        }));

        const hero = mappedProducts.find((item: any) => item.slug === slug) || null;

        return {
            props: {
                params: { slug },
                mappedProducts,
                hero,
            },
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return {
            props: {
                params: { slug },
                mappedProducts: [],
                hero: null,
            },
        };
    }
};

export default ProductPage;
