"use client";

import { AnimatedSubscribeButton } from "components/btn";
import { Lens } from "components/PageLayout/lens";
import { Carousel, CarouselContent, CarouselItem } from "components/pictureCarousal";
import CartContext from "contexts/cartItemsContext";
import ProductOptions from 'components/ProductOptions';
import { fetchProductsByDatabaseIds, fetchRelatedProductsByIds } from 'lib/woocommerce';
import Link from "next/link";
import CartVisibilityContext from "contexts/cartVisibilityContext";
import { useContext, useState } from "react";
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import Types from "reducers/cart/types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";
import { normalizeImageUrl } from '../../lib/utils/image'
import { ProductSchema } from 'lib/interfaces';

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
        <img
          src={src}
          alt={imageAlt}
          className="my-4 max-w-full"
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
  const { dispatch } = useContext(CartContext); // Use CartContext to get the dispatch function
  const hasValidSpecs =
    product.productSpeciications &&
    typeof product.productSpeciications === 'object' &&
    Array.isArray((product.productSpeciications as any).content);

  const renderSpecifications = hasValidSpecs && product.productSpeciications
    ? documentToReactComponents(product.productSpeciications as Document, options)
    : null;
  // Handle adding to the cart
  const handleAddToCart = (selectedOptions?: Array<{ name: string; type?: string; priceModifier?: number; selected?: boolean; quantity?: number; value?: string }>) => {
    const uuid = () => 'ci_' + Math.random().toString(36).slice(2, 9);
    const cartProduct: any = {
      slug: product.slug,
      title: product.title,
      price: product.price,
      cartItemId: uuid(),
      quantity: 1,
      productPictures: product.productPictures,
      affiliate: product.affiliate,
      productId: product.productId,
      variations: product.variations,
    };

    if (selectedVariation) {
      cartProduct.variationId = selectedVariation;
    }

    if (selectedOptions && Array.isArray(selectedOptions) && selectedOptions.length > 0) {
      cartProduct.options = selectedOptions;
    }

    dispatch({
      type: Types.addToCart,  // Action type for adding the product to the cart
      payload: cartProduct,
    });
    toggleCartVisibility();
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
          const fetched = await fetchRelatedProductsByIds(product._related_options || []);
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
    ? (product.productPictures as any[]).map((pic: any) => normalizeImageUrl(pic?.fields?.file?.url))
    : product.featuredImage
      ? [normalizeImageUrl(product.featuredImage as any)]
      : ['/temp.webp'];


  return (
    <div className="flex flex-col items-center py-8 mt-16 bg-[url('/nnnoise.svg')] bg-cover bg-repeat">
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-white border p-2 text-xs z-50">
          <div className="font-medium">Debug: related option IDs</div>
          <div>{JSON.stringify(product._related_options || [])}</div>
        </div>
      )}
      <div className="flex flex-col md:max-w-screen-2xl md:flex-row w-full justify-center items-start gap-10 z-10">
        {/* Image Section */}
        <div className="relative w-full max-w-md py-8">
          <Carousel disableDrag index={index} onIndexChange={setIndex}>
            <CarouselContent className="relative">
              {IMAGE_URLS.map((url, idx) => (
                <CarouselItem key={idx} className="py-4">
                  <div className="flex aspect-square items-center justify-center  ">
                    <Lens hovering={hovering} setHovering={setHovering}>
                      <img
                        src={url || '/temp.webp'}
                        alt={`Product Image ${idx + 1}`}
                        className=" object-cover object-center"
                      />
                    </Lens>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex w-full justify-center space-x-3 px-4">
            {IMAGE_URLS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setIndex(idx)}
                className={`h-20 w-20 border ${idx === index
                  ? 'border-blue-500'
                  : 'border-zinc-200 dark:border-zinc-800'
                  }`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          {/* Details Section */}
          <div className="flex flex-col gap-4 md:max-w-[600px] border-2 p-4 bg-white drop-shadow-lg m-4 rounded-lg">
            {/* Product Title */}

            <p className="md:text-sm text-md text-gray-600 mx-8">
              <span className="font-bold">Shop • </span>
              <span className="font-mono hover:text-blue-300 hover:underline"> {product.title}</span>

            </p>
            <h1 className="md:text-4xl text-xl font-bold text-gray-800 mx-8 font-poppins">
              {product.title}
            </h1>
            {/* Product Description */}
            <p className="md:text-lg text-md text-gray-600 mx-8">
              {product.shortDescription}
            </p>
            <div className="md:text-lg text-md text-gray-600 mx-8">
              {renderSpecifications}
            </div>

            <div className="border-b-[0.2px]"></div>

            {/* Price and Add to Cart */}
            <div className="flex justify-between items-center mx-6">
              {product.affiliate ? (
                // Affiliate-specific UI
                <>
                  <button className="text-md font-bold text-black underline">
                    Learn More
                  </button>
                  <div className="flex items-center space-x-1.5 rounded-lg bg-black px-4 py-1.5 text-white duration-100 hover:bg-slate-800">
                    <button className="text-sm">Get a Quote</button>
                  </div>
                </>
              ) : (
                // Non-affiliate product UI
                <>
                  <div className="flex items-center space-x-1.5 rounded-lg bg-black px-4 py-1.5 text-white duration-100 hover:bg-slate-800">
                    <button onClick={() => { console.log('Add to cart button clicked for', product.slug, 'related', product._related_options); openOptionsModal(); }} className="text-sm">Add to cart</button>
                    <FaShoppingCart className="h-4 w-4" />
                  </div>
                </>
              )}

            </div>
          </div>
          <div className="flex flex-col gap-4 md:max-w-[600px] border-2 p-4 bg-white drop-shadow-lg m-4 rounded-lg">
            <div className="md:mt-10">
              <h2 className="text-2xl font-semibold text-gray-800 font-poppins ml-4">Our Bestsellers</h2>
              <div className="flex md:flex-row flex-col gap-8 mt-6">
                <div className="flex flex-col items-center  pb-2">
                  <img
                    loading="lazy"
                    src="/180-stairlift-moving.png"
                    alt="30 Pod Mix"
                    className="object-cover max-w-56 aspect-[1.61]"
                  />
                  <p className="text-xl uppercase text-gray-800 font-bold m-3">For curved staircases</p>
                  <p className="text-lg text-slate-600 md:m-2 mx-8 md:text-left text-center">The Acorn 180 stairlift for curved staircases</p>
                  <button className="relative inline-flex text-nowrap h-12 mt-4 overflow-hidden rounded-lg">
                    <span className="group inline-flex items-center bg-black text-white px-4 py-2">
                      <Link href="/product/acorn-stairlifts-acorn-130-straight-stairlift">Shop Now{" "}</Link>
                      <FaCartPlus className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-3" />
                    </span>
                  </button>


                </div>
                <div className="flex flex-col items-center pb-2">
                  <img
                    loading="lazy"
                    src="/acorn-outdoor-stair-lift-uk.jpg"
                    alt="100 Pod Box"
                    className="object-cover max-w-56 aspect-[1.61]"
                  />
                  <p className="text-xl uppercase text-gray-800 font-bold m-3">For outdoor spaces</p>
                  <p className="text-lg text-slate-600 md:m-2 mx-8 text-center">The Acorn 160 stairlift for  outdoor spaces</p>
                  <button className="relative inline-flex text-nowrap h-12 mt-4 overflow-hidden rounded-lg">
                    <span className="group inline-flex items-center bg-black text-white px-4 py-2">
                      <Link href="/product/acorn-stairlifts-acorn-130-straight-stairlift">Shop Now{" "}</Link>
                      <FaCartPlus className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-3" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm selection</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-700">Product: <span className="font-medium">{product.title}</span></p>
              {selectedVariation ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">Variation:</p>
                  <div className="mt-1 ml-2">
                    {(() => {
                      const v = product.variations?.find((x: any) => (x.databaseId || x.id) == selectedVariation);
                      if (!v) return <span className="font-medium">{selectedVariation}</span>;
                      return (
                        <div>
                          <p className="font-medium">{v.attributes && v.attributes.length > 0 ? v.attributes.map((a: any) => a.value).join(' / ') : (v.sku || `Variation ${v.databaseId || v.id}`)}</p>
                          {v.price && <p className="text-sm text-gray-600">Price: <span className="font-medium">${(Number(v.price) / 100).toFixed(2)}</span></p>}
                          {(() => {
                            const extract = (img: any) => {
                              if (!img) return null;
                              if (typeof img === 'string') return img;
                              return img.sourceUrl || img.source_url || null;
                            };
                            const url = extract(v.image);
                            if (url) return <img src={url} alt="variation" className="w-28 h-28 object-cover mt-2" />;
                            return null;
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 mt-2">Variation: <span className="font-medium">Default</span></p>
              )}

              {/* Render attribute groups (built from variations) as radio selectors */}
              {attributeGroups && attributeGroups.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700">Choose options:</p>
                  <div className="mt-2 space-y-4">
                    {attributeGroups.map((g, gi) => (
                      <div key={gi}>
                        <p className="text-sm font-medium mb-1">{g.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {g.values.map((val) => (
                            <label key={val} className="inline-flex items-center space-x-2 border rounded px-2 py-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`attr-${g.name}`}
                                value={val}
                                checked={attributeState[g.name] === val}
                                onChange={() => {
                                  setAttributeState(prev => {
                                    const next = { ...prev, [g.name]: val };
                                    // attempt to find matching variation
                                    console.log('Attribute change', g.name, val, '=>', next);
                                    console.log('Finding match in variations:', product.variations);
                                    if (product.variations && product.variations.length > 0) {
                                      const match = product.variations.find((v: any) => {
                                        if (!v.attributes) return false;
                                        // all attribute names in next must be present and equal on variation
                                        for (const k of Object.keys(next)) {
                                          const attr = v.attributes.find((a: any) => a.name === k);
                                          if (!attr || attr.value !== next[k]) return false;
                                        }
                                        return true;
                                      });
                                      if (match) {
                                        setSelectedVariation(String(match.databaseId ?? match.id));
                                      } else {
                                        setSelectedVariation(null);
                                      }
                                    }
                                    return next;
                                  });
                                }}
                              />
                              <span className="text-sm">{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* If product has related options, render ProductOptions component */}
            {(product._related_options && Array.isArray(product._related_options) && product._related_options.length > 0) || (modalRelatedIds && modalRelatedIds.length > 0) ? (
              <div className="mt-4">
                <ProductOptions
                  relatedIds={(product._related_options && product._related_options.length > 0) ? product._related_options : modalRelatedIds}
                  // Server-provided related product objects (mapped shape) to use directly.
                  // Prefer freshly fetched `modalRelatedProducts` when present (client-side fetch).
                  relatedProducts={Array.isArray(modalRelatedProducts) && modalRelatedProducts.length > 0 ? modalRelatedProducts : (Array.isArray(product._related_options_products) ? product._related_options_products : undefined)}
                  parentProductId={product.productId}
                  onConfirm={async (selectedPayloads: any[]) => {
                    if (!selectedPayloads || selectedPayloads.length === 0) {
                      handleAddToCart([]);
                      setShowOptionsModal(false);
                      return;
                    }

                    // Fetch full product objects for the selected add-ons' parents
                    try {
                      const parentIds = Array.from(new Set(selectedPayloads.map((s: any) => Number(s.productId)).filter((n: any) => !isNaN(n))));
                      let products = parentIds.length > 0 ? await fetchProductsByDatabaseIds(parentIds) : [];
                      // If GraphQL client didn't work on client, fall back to debug API
                      if ((!products || products.length === 0) && typeof window !== 'undefined' && parentIds.length > 0) {
                        try {
                          const url = `/api/debug/related-products?ids=${parentIds.join(',')}`;
                          const r = await fetch(url);
                          if (r.ok) {
                            const json = await r.json();
                            products = Array.isArray(json.products) ? json.products : (Array.isArray(json) ? json : (json?.items || []));
                          }
                        } catch (e) {
                          console.warn('Fallback fetch to /api/debug/related-products failed', e);
                        }
                      }

                      const prodMap: Record<string | number, any> = {};
                      for (const p of (products || [])) {
                        if (!p) continue;
                        // Normalize variations shape: accept { nodes: [...] } or array
                        let vars: any[] = [];
                        if (p.variations) {
                          if (Array.isArray(p.variations)) vars = p.variations;
                          else if (p.variations && Array.isArray(p.variations.nodes)) vars = p.variations.nodes;
                        }
                        const cloned = { ...p, variations: vars };
                        if (p.databaseId) prodMap[String(p.databaseId)] = cloned;
                        if (p.id) prodMap[String(p.id)] = cloned;
                      }

                      const mapped = selectedPayloads.map((s: any) => {
                        const pid = String(s.productId);
                        const prod = prodMap[pid] || null;
                        const variationId = s.variationId ? String(s.variationId) : null;
                        let variation = null;
                        const prodVars = prod && Array.isArray(prod.variations) ? prod.variations : (prod && prod.variations && Array.isArray(prod.variations.nodes) ? prod.variations.nodes : []);
                        if (variationId && prodVars && Array.isArray(prodVars)) {
                          variation = prodVars.find((v: any) => String(v.databaseId ?? v.id) === variationId) || null;
                        }

                        return {
                          name: s.title || `${s.productId}${variationId ? ' (variation)' : ''}`,
                          type: variationId ? 'radio' : 'checkbox',
                          priceModifier: s.price ? Number(s.price) : 0,
                          selected: true,
                          quantity: s.quantity || 1,
                          value: variationId ? String(variationId) : String(s.productId),
                          parentId: s.productId,
                          product: prod ? (function () {
                            const extractImage = (img: any) => {
                              if (!img) return null;
                              if (typeof img === 'string') return img;
                              return img.sourceUrl || img.source_url || null;
                            };
                            return {
                              id: prod.id,
                              databaseId: prod.databaseId,
                              name: prod.name,
                              slug: prod.slug,
                              price: prod.price,
                              regularPrice: prod.regularPrice,
                              salePrice: prod.salePrice,
                              image: extractImage(prod.image),
                              variations: Array.isArray(prod.variations) ? prod.variations : (prod.variations && Array.isArray(prod.variations.nodes) ? prod.variations.nodes : []),
                            };
                          })() : null,
                          variation: variation ? {
                            id: variation.id,
                            databaseId: variation.databaseId,
                            price: variation.price,
                            sku: variation.sku,
                            attributes: (variation.attributes && Array.isArray(variation.attributes.nodes)) ? variation.attributes.nodes : (variation.attributes || [])
                          } : null,
                        } as any;
                      });

                      // Immediately add parent + enriched options to cart
                      handleAddToCart(mapped);
                    } catch (e) {
                      console.warn('Failed to enrich selected add-ons with product objects', e);
                      // fallback: add simple mapped entries
                      const fallback = selectedPayloads.map((s: any) => ({
                        name: s.title || `${s.productId}${s.variationId ? ' (variation)' : ''}`,
                        type: s.variationId ? 'radio' : 'checkbox',
                        priceModifier: s.price ? Number(s.price) : 0,
                        selected: true,
                        quantity: s.quantity || 1,
                        value: s.variationId ? String(s.variationId) : String(s.productId),
                        parentId: s.productId
                      }));
                      handleAddToCart(fallback);
                    }

                    setShowOptionsModal(false);
                  }}
                  onDone={() => setShowOptionsModal(false)}
                />
              </div>
            ) : (
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowOptionsModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={confirmAddFromModal} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductItem;
