"use client";

import { AnimatedSubscribeButton } from "components/btn";
import { Lens } from "components/PageLayout/lens";
import { Carousel, CarouselContent, CarouselItem } from "components/pictureCarousal";
import { useCartStore } from "stores/cartStore";
import { PrimaryButton } from 'components/ui';
import ProductOptions from 'components/ProductOptions';
import { fetchProductsByDatabaseIds, fetchProductsByIds } from 'lib/woocommerce';
import Link from "next/link";
import CartVisibilityContext from "contexts/cartVisibilityContext";
import { useContext, useState } from "react";
import { useRouter } from 'next/navigation';
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import dynamic from 'next/dynamic';
import { Document } from "@contentful/rich-text-types";
const RichContent = dynamic(() => import('components/RichContent'), { ssr: false });
import { normalizeImageUrl } from '../../lib/utils/image'
import { Reviews } from "components/reviews";
import { ProductSchema } from 'lib/interfaces';
import React from 'react';
import Image from "next/image";
import HydrationErrorBoundary from '../HydrationErrorBoundary';


interface ProductItemProps {
  product: ProductSchema & { productSpeciications?: Document };
}
const options = {
  renderNode: {
    'embedded-asset-block': (node: any) => {
      const fields = node?.data?.target?.fields;
      const file = fields?.file;
      const title = fields?.title;
      const imageUrl = file?.url;
      const imageAlt = title || 'Image';

      if (!imageUrl) return null;

      const src = imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`;

      return (
        <Image
          src={src}
          alt={imageAlt}
          className="my-4 max-w-full"
          width={600}
          height={400}
          style={{ height: 'auto', width: '100%' }}
        />
      );
    },
  },
};

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const { toggleCartVisibility } = useContext(CartVisibilityContext);
  const addToCart = useCartStore(state => state.addToCart);
  const router = useRouter();
  // Render product specifications depending on type: Contentful Document vs HTML string
  // renderSpecifications will be rendered client-side by RichContent to avoid SSR/CSR mismatch
  const spec = (product as any).productSpeciications ?? (product as any).productSpecifications;
  // Handle adding to the cart
  const handleAddToCart = (selectedOptions?: Array<{ name: string; type?: string; priceModifier?: number; selected?: boolean; quantity?: number; value?: string }>) => {
    const uuid = () => 'ci_' + Math.random().toString(36).slice(2, 9);
    const parsePrice = (val: any) => {
      if (val == null) return 0;
      const s = String(val);
      const n = Number(s.replace(/[^0-9.\-]+/g, ''));
      if (isNaN(n)) return 0;
      return n;
    };

    const cartProduct = {
      slug: product.slug,
      title: product.title,
      price: parsePrice(product.price),
      quantity: 1,
      productPictures: product.productPictures || [],
      affiliate: product.affiliate || false,
      productId: product.productId || undefined,
      variationId: selectedVariation || undefined,
      options: (selectedOptions && Array.isArray(selectedOptions) && selectedOptions.length > 0) ? selectedOptions : [],
      // Required CartProduct fields
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      featuredImage: product.featuredImage || '',
      productSpecifications: product.productSpecifications || ''
    };

    console.log('🛒 Adding to cart:', {
      slug: product.slug,
      title: product.title,
      featuredImage: product.featuredImage,
      cartProduct: cartProduct
    });

    // Add to cart using Zustand store (cartItemId will be generated automatically)
    addToCart(cartProduct);
    // Previously opened the mini-cart. Now navigate to cart page.
    router.push('/cart');
  };

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [optionsState, setOptionsState] = useState<Array<{ name: string; type?: string; priceModifier?: number; selected?: boolean; quantity?: number; value?: string }>>([]);
  const [attributeState, setAttributeState] = useState<{ [key: string]: string }>({});
  const [attributeGroups, setAttributeGroups] = useState<Array<{ name: string; values: string[] }>>([]);
  const [modalRelatedIds, setModalRelatedIds] = useState<Array<number | string>>([]);
  const [loadingRelatedIds, setLoadingRelatedIds] = useState(false);
  const [modalRelatedProducts, setModalRelatedProducts] = useState<any[] | null>(null);

  const openOptionsModal = async () => {
    // Debug: log related options presence
    console.log('openOptionsModal called for', product.slug, 'related:', product._related_options);
    // If product has variations, options, or related add-ons, show modal; otherwise add directly
    if (
      (product.variations && product.variations.length > 0) ||
      (product.options && Array.isArray(product.options) && product.options.length > 0) ||
      (product._related_options && Array.isArray(product._related_options) && product._related_options.length > 0)
    ) {
      // initialize options state snapshot
      setOptionsState((product.options && Array.isArray(product.options)) ? product.options.map((o: any) => ({ ...o })) : []);
      // build attribute groups from variations
      const groups: { [k: string]: Set<string> } = {};
      if (product.variations && Array.isArray(product.variations)) {
        for (const v of product.variations) {
          if (v.attributes && Array.isArray(v.attributes)) {
            for (const a of v.attributes) {
              if (!groups[a.name]) groups[a.name] = new Set();
              groups[a.name].add(a.value);
            }
          }
        }
      }
      setAttributeGroups(Object.keys(groups).map(k => ({ name: k, values: Array.from(groups[k]) })));
      // prefill attribute selections from selectedVariation when available
      if (selectedVariation) {
        const match = product.variations && product.variations.find((v: any) => String(v.databaseId ?? v.id) === String(selectedVariation));
        if (match && match.attributes && Array.isArray(match.attributes)) {
          const pre: { [k: string]: string } = {};
          for (const a of match.attributes) {
            pre[a.name] = a.value;
          }
          setAttributeState(pre);
        } else {
          setAttributeState({});
        }
      } else {
        setAttributeState({});
      }
      // If server didn't attach related product objects, try to fetch them now
      if ((!Array.isArray(product._related_options_products) || product._related_options_products.length === 0) && Array.isArray(product._related_options) && product._related_options.length > 0) {
        setLoadingRelatedIds(true);
        try {
          const fetched = await fetchProductsByIds(product._related_options || [], { format: 'display' });
          setModalRelatedProducts(fetched || []);
          console.log('Fetched modal related products for', product.productId, fetched);
        } catch (e) {
          console.warn('Failed to fetch related products for modal', e);
          setModalRelatedProducts([]);
        } finally {
          setLoadingRelatedIds(false);
          setShowOptionsModal(true);
        }
      } else {
        if (product._related_options && product._related_options.length > 0) setShowOptionsModal(true);
      }
      return;
    }
    handleAddToCart();
  };

  const [confirmedAddOns, setConfirmedAddOns] = useState<any[]>([]);

  const confirmAddFromModal = () => {
    // attach confirmed add-ons into optionsState so they persist on the cart item
    const opts = (optionsState && Array.isArray(optionsState)) ? optionsState.concat(confirmedAddOns) : confirmedAddOns;
    handleAddToCart(opts);
    setShowOptionsModal(false);
    setConfirmedAddOns([]);
  };

  const IMAGE_URLS: string[] = product.productPictures && product.productPictures.length > 0
    ? (product.productPictures as any[]).map((pic: any) => normalizeImageUrl(pic?.fields?.file?.url)).filter((url): url is string => url !== null)
    : product.featuredImage
      ? [normalizeImageUrl(product.featuredImage as any)].filter((url): url is string => url !== null)
      : ['/temp.webp'];
  const [selectedTab, setSelectedTab] = useState<'Overview' | 'Documentation' | 'Reviews' | 'Specifications'>('Overview');

  return (
    <div className="flex flex-col items-center py-4 mt-4 bg-[url('/nnnoise.svg')] bg-cover bg-repeat">
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-white border p-2 text-xs z-50">
          <div className="font-medium">Debug: related option IDs</div>
          <div>{JSON.stringify(product._related_options || [])}</div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-6 px-4">
        <div className="w-full md:w-2/3">
          <Carousel disableDrag index={index} onIndexChange={setIndex}>
            <CarouselContent className="relative">
              {IMAGE_URLS.map((url, idx) => (
                <CarouselItem key={idx} className="py-2">
                  <div className="flex items-center justify-center">
                    <Lens hovering={hovering} setHovering={setHovering}>
                      <img src={url || '/temp.webp'} alt={`Product Image ${idx + 1}`} className="w-full h-auto object-contain max-h-[520px]" />
                    </Lens>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="flex gap-3 mt-3 overflow-x-auto">
            {IMAGE_URLS.map((url, idx) => (
              <button key={idx} type="button" aria-label={`Go to slide ${idx + 1}`} onClick={() => setIndex(idx)} className={`h-16 w-16 flex-shrink-0 border ${idx === index ? 'border-blue-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <aside className="w-full md:w-1/3 sticky top-20 self-start">
          <div className="border-2 p-4 bg-white drop-shadow-lg rounded-lg">
            <p className="text-sm text-gray-600"><span className="font-bold">Shop • </span><span className="font-mono">{product.title}</span></p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2 mb-4">{product.title}</h1>

            <div className="mb-3">
              <p className="text-3xl font-extrabold text-blue-600">${(Number((product as any).price) || 0).toFixed(2)}</p>
              {(product as any).regularPrice && <p className="text-sm text-gray-500 line-through">${Number((product as any).regularPrice || 0).toFixed(2)}</p>}
            </div>
            <div className="mb-3 space-y-3">
              {(product as any).affiliate ? (
                <a href="#" className="block w-full text-center bg-green-600 text-white py-3 rounded">Learn More</a>
              ) : (
                <>
                  {/* Configure Button - Primary Action */}
                  <PrimaryButton
                    fullWidth
                    onClick={() => {
                      // Route to the new configurator page
                      router.push(`/product/${product.slug}/configure`);
                    }}
                  >
                    Configure This Model
                  </PrimaryButton>
                  
                  {/* Add to Cart Button - Secondary Action */}
                  <button 
                    onClick={() => {
                      if (product._related_options && Array.isArray(product._related_options) && product._related_options.length > 0) {
                        router.push(`/product/${product.slug}/options`);
                        return;
                      }
                      openOptionsModal();
                    }} 
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Quick Add to Cart
                  </button>
                </>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p>SKU: {(product as any).sku || '-'}</p>
              <p className="mt-2">{(product as any).affiliate ? 'Affiliate product' : 'Ships from our warehouse'}</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-white border rounded-lg">
          <div className="flex flex-wrap border-b">
            {['Overview', 'Documentation', 'Reviews', 'Specifications'].map((t) => (
              <button key={t} onClick={() => setSelectedTab(t as any)} className={`px-4 py-3 -mb-px ${selectedTab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="p-6">
            {selectedTab === 'Overview' && (
              <div className="prose max-w-none text-gray-700">
                {/* Render shortDescription client-side to avoid hydration mismatch */}
                <HydrationErrorBoundary>
                  <RichContent content={(product as any).shortDescription || product.description} options={options} className="prose max-w-none text-gray-700" />
                </HydrationErrorBoundary>
              </div>
            )}

            {selectedTab === 'Documentation' && (
              <div className="text-gray-700">Documentation content (if any) goes here.</div>
            )}

            {selectedTab === 'Reviews' && (
              <div className="text-gray-700"><Reviews /></div>
            )}

            {selectedTab === 'Specifications' && (
              <div className="text-gray-700">
                {spec ? (
                  <HydrationErrorBoundary>
                    <RichContent content={spec} options={options} />
                  </HydrationErrorBoundary>
                ) : (
                  <div>No specifications available.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
