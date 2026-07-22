"use client";

import React, { useEffect, useState, useContext } from 'react';
import { useCartStore } from 'stores/cartStore';
import CartVisibilityContext from '../contexts/cartVisibilityContext';
import { normalizeImageUrl } from '../lib/utils/image';
import Image from 'next/image';
import { ProductSchema } from '../lib/interfaces';
import { useRouter } from 'next/navigation';

// Reuse ProductSchema's _related_options_products shape for strong typing
type RelatedProduct = NonNullable<ProductSchema['_related_options_products']>[number];

// Internal shape expected by the component UI
interface AddOnProduct {
    id: string | number;
    databaseId?: number | string;
    title: string;
    price?: number | string | null;
    sku?: string | null;
    type?: 'simple' | 'variable';
    variations?: Array<any & { id?: string | number; databaseId?: number | string; name?: string | null; price?: any; sku?: string | null; attributes?: any; image?: string | null }>;
    soldIndividually?: boolean;
    variableType?: string | null;
    image?: string | null;
}

interface Props {
    relatedIds?: ProductSchema['_related_options'];
    fetchByIds?: (ids: Array<string | number>) => Promise<AddOnProduct[]>;
    // Optional server-provided related product objects (mapped shape). When
    // present the component will use these directly and skip client fetches.
    relatedProducts?: ProductSchema['_related_options_products'];
    parentProductId?: string | number;
    parentProduct?: Partial<ProductSchema>;
    onDone?: () => void;
    onConfirm?: (selectedOptions: any[]) => void;
    
    // Edit mode props
    initialSelectedOptionIds?: string[];
    onConfigurationChange?: (optionIds: string[]) => void;
    onSelectionChange?: (selectedOptions: any[]) => void;
    editMode?: boolean;
    originalPrice?: number;
}

const ProductOptions: React.FC<Props> = ({ 
    relatedIds, 
    fetchByIds, 
    relatedProducts, 
    parentProductId, 
    parentProduct, 
    onDone, 
    onConfirm,
    initialSelectedOptionIds,
    onConfigurationChange,
    onSelectionChange,
    editMode = false,
    originalPrice
}) => {
    const addToCart = useCartStore(state => state.addToCart);
    const { toggleCartVisibility } = useContext(CartVisibilityContext);
    const router = useRouter();
    const [addOns, setAddOns] = useState<AddOnProduct[]>([]);
    const [selected, setSelected] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // When editing an existing cart item, parentProduct may include an `options`
    // array that represents previously selected add-ons. When addOns are
    // resolved, initialize the selected state from parentProduct.options so
    // the UI pre-fills the controls for editing.
    useEffect(() => {
        if (!parentProduct || !Array.isArray((parentProduct as any).options) || addOns.length === 0) return;
        try {
            const opts: any[] = (parentProduct as any).options || [];
            const initSelected: Record<string, any> = {};
            for (const o of opts) {
                // o.productId references the addon product id
                const prodId = o.productId ?? o.productId;
                // try to find matching addon by id or databaseId
                const a = addOns.find(x => String(x.id) === String(prodId) || String(x.databaseId) === String(prodId));
                if (!a) continue;
                // If a variationId is present, this was a variable selection
                if (o.variationId) {
                    const vid = String(o.variationId);
                    const isRadio = !!(a.variableType && String(a.variableType).toLowerCase() === 'radio');
                    if (isRadio) {
                        initSelected[`radio_${a.id}`] = vid;
                    } else {
                        initSelected[`${a.id}:${vid}`] = true;
                    }
                } else {
                    // simple product option
                    initSelected[String(a.id)] = true;
                }
            }
            // Merge into existing selected state so external interactions still work
            setSelected(prev => ({ ...prev, ...initSelected }));
        } catch (e) {
            // ignore faults during prefill
            /* noop */
        }
    }, [addOns, parentProduct]);

    // Initialize selected options from edit session data
    useEffect(() => {
        if (!editMode || !initialSelectedOptionIds || !addOns.length) return;
        
        try {
            const initSelected: Record<string, any> = {};
            
            for (const optionId of initialSelectedOptionIds) {
                // Find the addon that matches this option ID
                const addon = addOns.find(a => 
                    String(a.id) === String(optionId) || 
                    String(a.databaseId) === String(optionId) ||
                    (a.variations && a.variations.some(v => 
                        String(v.id) === String(optionId) || 
                        String(v.databaseId) === String(optionId)
                    ))
                );
                
                if (addon) {
                    // Check if it's a variation
                    const variation = addon.variations?.find(v => 
                        String(v.id) === String(optionId) || 
                        String(v.databaseId) === String(optionId)
                    );
                    
                    if (variation) {
                        // Handle variable product selection
                        const isRadio = !!(addon.variableType && String(addon.variableType).toLowerCase() === 'radio');
                        if (isRadio) {
                            initSelected[`radio_${addon.id}`] = String(variation.id || variation.databaseId);
                        } else {
                            initSelected[`${addon.id}:${variation.id || variation.databaseId}`] = true;
                        }
                    } else {
                        // Handle simple product selection
                        initSelected[String(addon.id)] = true;
                    }
                }
            }
            
            setSelected(prev => ({ ...prev, ...initSelected }));
        } catch (error) {
            console.error('Failed to initialize selected options from edit session:', error);
        }
    }, [editMode, initialSelectedOptionIds, addOns]);

    // Notify about configuration changes in edit mode
    useEffect(() => {
        if (!editMode || !onConfigurationChange) return;
        
        // Extract currently selected option IDs
        const selectedOptionIds: string[] = [];
        
        Object.entries(selected).forEach(([key, value]) => {
            if (!value) return;
            
            if (key.startsWith('radio_')) {
                // Radio selection: value is the variation ID
                selectedOptionIds.push(String(value));
            } else if (key.includes(':')) {
                // Checkbox with variation: key is "productId:variationId"
                const variationId = key.split(':')[1];
                selectedOptionIds.push(variationId);
            } else {
                // Simple product: key is the product ID
                selectedOptionIds.push(key);
            }
        });
        
        onConfigurationChange(selectedOptionIds);
    }, [selected, editMode, onConfigurationChange]);

    // Notify parent component when selections change
    useEffect(() => {
        if (onSelectionChange && addOns.length > 0) {
            const selectedPayloads = createSelectedPayloads();
            onSelectionChange(selectedPayloads);
        }
    }, [selected, addOns, onSelectionChange]);

    // Helper function to generate unique cart item IDs
    const uuid = React.useCallback(() => 'ci_' + Math.random().toString(36).slice(2, 9), []);

    // Helper function to create selected payloads from current state
    const createSelectedPayloads = React.useCallback(() => {
        const selectedPayloads: any[] = [];
        for (const p of addOns) {
            if (!p) continue;
            const prodId = p.id ?? p.databaseId;
            if (String(p.type).toLowerCase() === 'variable') {
                // For variable products, use variableType enum to decide radio (single) vs checkbox (multiple)
                const isRadio = !!(p.variableType && String(p.variableType).toLowerCase() === 'radio');
                if (isRadio) {
                    // radio: single selected variation per product
                    const sel = selected[`radio_${prodId}`];
                    if (sel) {
                        const v = (p.variations || []).find((x: any) => String(x.databaseId ?? x.id) === String(sel));
                        if (v) selectedPayloads.push({ 
                            cartItemId: uuid(), 
                            productId: prodId, 
                            variationId: String(v.databaseId ?? v.id), 
                            name: `${p.title} - ${v.attributes ? (Array.isArray(v.attributes) ? v.attributes.map((a: any) => a.value).join(' / ') : '') : ''}`.trim(), 
                            price: (function (val) { const s = String(val || ''); const n = Number(s.replace(/[^0-9.\-]+/g, '')); return isNaN(n) ? 0 : n; })(v.price ?? p.price), 
                            sku: v.sku, 
                            quantity: 1 
                        });
                    }
                } else {
                    // checkboxes: multiple variations may be selected
                    for (const v of (p.variations || [])) {
                        const key = `${prodId}:${v.databaseId ?? v.id}`;
                        if (selected[key]) selectedPayloads.push({ 
                            cartItemId: uuid(), 
                            productId: prodId, 
                            variationId: String(v.databaseId ?? v.id), 
                            title: `${p.title} - ${v.attributes ? (Array.isArray(v.attributes) ? v.attributes.map((a: any) => a.value).join(' / ') : '') : ''}`.trim(), 
                            price: v.price ?? p.price, 
                            sku: v.sku 
                        });
                    }
                }
            } else {
                // simple product: checkbox per product
                if (selected[prodId]) selectedPayloads.push({ 
                    cartItemId: uuid(), 
                    productId: prodId, 
                    name: p.title, 
                    price: (function (val) { const s = String(val || ''); const n = Number(s.replace(/[^0-9.\-]+/g, '')); return isNaN(n) ? 0 : n; })(p.price), 
                    sku: p.sku, 
                    quantity: 1 
                });
            }
        }
        return selectedPayloads;
    }, [addOns, selected, uuid]);

    // Calculate current total price for edit mode
    const calculateCurrentTotal = React.useCallback(() => {
        const selectedPayloads = createSelectedPayloads();
        const basePrice = originalPrice || 0;
        const optionsTotal = selectedPayloads.reduce((sum, option) => {
            const price = typeof option.price === 'number' ? option.price : parseFloat(option.price || '0');
            return sum + (price * (option.quantity || 1));
        }, 0);
        return basePrice + optionsTotal;
    }, [createSelectedPayloads, originalPrice]);

    useEffect(() => {
        if ((!relatedIds || relatedIds.length === 0) && (!relatedProducts || relatedProducts.length === 0)) return;
        console.log('ProductOptions resolving related products for ids:', relatedIds);
        let mounted = true;

        // If server provided full related product objects, use them directly.
        if (relatedProducts && Array.isArray(relatedProducts) && relatedProducts.length > 0) {
            // Map server-provided RelatedProduct -> internal AddOnProduct shape
            console.log('ProductOptions using server-provided related products:', relatedProducts);
            const mapped = relatedProducts.map((p: RelatedProduct) => ({
                id: p.databaseId ?? p.id ?? Math.random().toString(36).slice(2, 9),
                databaseId: p.databaseId,
                title: p.name ?? (p.slug || String(p.databaseId ?? p.id)),
                sku: (p as any).sku ?? null,
                type: (String(p.type || '').toLowerCase() === 'variable') ? 'variable' : 'simple',
                variations: Array.isArray(p.variations) ? p.variations.map((v: any) => ({
                    id: v.databaseId ?? v.id,
                    databaseId: v.databaseId ?? v.id,
                    name: v.name ?? null,
                    price: v.price ?? null,
                    sku: v.sku ?? null,
                    attributes: v.attributes ?? [],
                    image: v.image ? (typeof v.image === 'string' ? v.image : v.image.sourceUrl) : null,
                })) : [],
                // Record variableType (enum) and derive soldIndividually from it for backward compatibility
                variableType: (function () {
                    const vt = (p as any).variableType || (p as any).optionType || (p as any).variable_type || null;
                    return vt ? String(vt).toLowerCase() : null;
                })(),
            } as AddOnProduct));

            setAddOns(mapped);
            return () => { mounted = false; };
        }

        // relatedIds may be undefined; guard the call
        const idsToFetch = (relatedIds || []).map(x => x as string | number);
        if (idsToFetch.length === 0) return;

        if (typeof fetchByIds === 'function') {
            setLoading(true);
            setError(null);
            fetchByIds(idsToFetch).then((res) => {
                if (!mounted) return;
                setAddOns(res || []);
            }).catch((err) => {
                if (!mounted) return;
                setError(err.message || 'Failed to load options.');
            }).finally(() => {
                if (mounted) {
                    setLoading(false);
                }
            });
        }
        return () => { mounted = false; };
    }, [relatedIds, relatedProducts, fetchByIds]);

    const toggleCheckbox = (id: string | number) => {
        setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const selectRadio = (groupKey: string, id: string | number) => {
        setSelected(prev => ({ ...prev, [groupKey]: id }));
    };

    const addSelectedToCart = () => {
        // Use the new createSelectedPayloads function for consistency
        const selectedPayloads = createSelectedPayloads();
        
        // In edit mode, call onConfirm with updated selections including price info
        if (editMode && onConfirm) {
            const currentTotal = calculateCurrentTotal();
            // Enhance selectedPayloads with total price information for edit mode
            const enhancedPayloads = selectedPayloads.map(payload => ({
                ...payload,
                totalPrice: currentTotal,
                isEditMode: true
            }));
            try {
                onConfirm(enhancedPayloads);
            } catch (e) {
                console.warn('ProductOptions onConfirm handler failed', e);
            }
            if (typeof onDone === 'function') onDone();
            return;
        }
        // If parent provided and no external handler, dispatch a single parent
        // cart item that contains the selected options in `options`.
        if (!onConfirm) {
            if (parentProductId) {
                const payload: any = { cartItemId: uuid(), productId: parentProductId, quantity: 1 };
                // Attach parent metadata when available so cart UI can render the parent product
                if (typeof parentProduct === 'object' && parentProduct) {
                    const pp: any = parentProduct as any;
                    payload.title = pp.title ?? pp.name ?? pp.productName ?? String(parentProductId);
                    payload.slug = pp.slug ?? String(parentProductId);
                    const parsePrice = (x: any) => {
                        if (x == null) return 0;
                        const s = String(x);
                        const n = Number(s.replace(/[^0-9.\-]+/g, ''));
                        return isNaN(n) ? 0 : n;
                    };
                    const basePrice = parsePrice(pp.price ?? pp.salePrice ?? pp.regularPrice ?? 0);
                    const optionsTotal = selectedPayloads.reduce((sum, option) => {
                        const price = typeof option.price === 'number' ? option.price : parseFloat(option.price || '0');
                        return sum + (price * (option.quantity || 1));
                    }, 0);
                    payload.price = basePrice + optionsTotal; // Include options in total price
                    payload.productPictures = pp.productPictures ?? undefined;
                    payload.featuredImage = pp.featuredImage ?? pp.image ?? undefined;
                    payload.variations = pp.variations ?? undefined;
                    payload.productId = pp.productId ?? parentProductId;
                    payload.affiliate = pp.affiliate ?? false;
                }
                // Debug: log payload being dispatched so issues can be traced
                try {
                    // eslint-disable-next-line no-console
                    console.log('ProductOptions dispatch parent payload', payload);
                } catch (e) { }
                if (selectedPayloads.length > 0) payload.options = selectedPayloads;
                
                // Add to cart using Zustand store
                addToCart({
                    slug: payload.slug,
                    title: payload.title,
                    price: payload.price,
                    quantity: payload.quantity || 1,
                    productPictures: payload.productPictures || [],
                    featuredImage: payload.featuredImage || '',
                    affiliate: payload.affiliate || false,
                    productId: payload.productId || null,
                    options: payload.options || [],
                    // Required ProductSchema fields
                    description: payload.description || '',
                    shortDescription: payload.shortDescription || '',
                    productSpecifications: payload.productSpecifications || ''
                });
            }
            // Navigate to cart page instead of opening mini-cart
            try {
                router.push('/cart');
            } catch (e) {
                try { toggleCartVisibility(); } catch (e) { }
            }
            if (typeof onDone === 'function') onDone();
            return;
        }

        // Otherwise call onConfirm with selected payloads
        try {
            onConfirm(selectedPayloads);
        } catch (e) {
            console.warn('ProductOptions onConfirm handler failed', e);
        }
        if (typeof onDone === 'function') onDone();
    };

    if (loading) {
        return (
            <div className="p-4 border rounded-lg bg-white text-center">
                <p>Loading options...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border rounded-lg bg-red-50 text-red-700 text-center">
                <p>Error loading options: {error}</p>
            </div>
        );
    }

    if ((!relatedIds || relatedIds.length === 0) && (!relatedProducts || relatedProducts.length === 0)) return null;

    return (
        <div className="p-4 border rounded-lg bg-white">
            <h3 className="font-semibold mb-3">Product Options</h3>
            <div className="space-y-3">
                {addOns.map((a) => (
                    <div key={String(a.id)} className="flex items-center space-x-3">
                        {String(a.type).toLowerCase() === 'variable' ? (
                            <div>
                                <p className="font-medium mb-2">{a.title}</p>
                                <div className="space-y-2">
                                    {(() => {
                                        // Determine whether to render as radio (single) or checkboxes (multiple)
                                        const isRadio = !!(a.variableType && String(a.variableType).toLowerCase() === 'radio');
                                        return (a.variations || []).map((v: any) => {
                                            const vid = String(v.databaseId ?? v.id);
                                            const checked = isRadio ? selected[`radio_${a.id}`] === vid : !!selected[`${a.id}:${vid}`];
                                            return (
                                                <label key={vid} className="flex items-center space-x-3 border rounded px-2 py-2 cursor-pointer w-full">
                                                    <input
                                                        type={isRadio ? 'radio' : 'checkbox'}
                                                        name={isRadio ? `radio_${a.id}` : undefined}
                                                        checked={checked}
                                                        onChange={() => {
                                                            if (isRadio) selectRadio(`radio_${a.id}`, vid);
                                                            else toggleCheckbox(`${a.id}:${vid}`);
                                                        }}
                                                    />
                                                    <Image 
                                                        src={String(v.image ? normalizeImageUrl(v.image) : (a.image ? normalizeImageUrl(a.image) : '/placeholder.svg'))} 
                                                        width={32} 
                                                        height={32} 
                                                        alt={v.name || `variation-${vid}`} 
                                                        className="w-8 h-8 object-cover rounded"
                                                    />
                                                    <div className="flex-1 text-sm">
                                                        <div className="font-medium">{v.name || (v.attributes && Array.isArray(v.attributes) ? v.attributes.map((at: any) => at.value).join(' / ') : `Variation ${vid}`)}</div>
                                                        {v.sku ? <div className="text-xs text-gray-500">SKU: {v.sku}</div> : null}
                                                    </div>
                                                    {v.price != null ? (
                                                        <div className="text-sm text-green-600 font-medium price">{`+${v.price}`}</div>
                                                    ) : null}
                                                </label>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <label className="inline-flex items-center space-x-2">
                                <input type="checkbox" checked={!!selected[a.id]} onChange={() => toggleCheckbox(a.id)} />
                                <Image 
                                    src={String(a.image ? normalizeImageUrl(a.image) : '/placeholder.svg')} 
                                    width={40} 
                                    height={40} 
                                    alt={a.title || `addon-${a.id}`} 
                                    className="w-10 h-10 object-cover rounded"
                                />
                                <div>
                                    <div className="font-medium">{a.title}</div>
                                    <div className="text-sm text-gray-600">{a.sku ? `SKU: ${a.sku}` : ''} {a.price != null && !Number.isNaN(Number(a.price)) ? <span className="text-green-600 font-medium">{` • +$${(Number(a.price) / 100).toFixed(2)}`}</span> : ''}</div>
                                </div>
                            </label>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Price Summary for Edit Mode */}
            {editMode && originalPrice && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                        <span>Base Price:</span>
                        <span>${originalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span>Options Total:</span>
                        <span>${((calculateCurrentTotal() - originalPrice) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-lg border-t pt-2 mt-2">
                        <span>New Total:</span>
                        <span>${calculateCurrentTotal().toFixed(2)}</span>
                    </div>
                </div>
            )}
            
            <div className="mt-4 text-right">
                <button 
                    onClick={() => { 
                        console.log('ProductOptions button clicked, selected map:', selected); 
                        addSelectedToCart(); 
                    }} 
                    className="px-6 py-3 bg-[#3fa2a3] text-white rounded-[35px] font-primary font-semibold hover:bg-[#f7a236] transition-all duration-300"
                >
                    {editMode ? 'Save Changes' : 'Add Selected Options'}
                </button>
            </div>
        </div>
    );
};

export default ProductOptions;
