"use client";

import React, { useEffect, useState, useContext } from 'react';
import CartContext from 'contexts/cartItemsContext';
import CartVisibilityContext from 'contexts/cartVisibilityContext';
import Types from 'reducers/cart/types';
import { normalizeImageUrl } from 'lib/utils/image';
import { ProductSchema } from 'lib/interfaces';
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
}

const ProductOptions: React.FC<Props> = ({ relatedIds, fetchByIds, relatedProducts, parentProductId, parentProduct, onDone, onConfirm }) => {
    const { dispatch } = useContext(CartContext);
    const { toggleCartVisibility } = useContext(CartVisibilityContext);
    const router = useRouter();
    const [addOns, setAddOns] = useState<AddOnProduct[]>([]);
    const [selected, setSelected] = useState<Record<string, any>>({});

    useEffect(() => {
        if ((!relatedIds || relatedIds.length === 0) && (!relatedProducts || relatedProducts.length === 0)) return;
        console.log('ProductOptions resolving related products for ids:', relatedIds);
        let mounted = true;

        // If server provided full related product objects, use them directly.
        if (relatedProducts && Array.isArray(relatedProducts) && relatedProducts.length > 0) {
            // Map server-provided RelatedProduct -> internal AddOnProduct shape
            const mapped = relatedProducts.map((p: RelatedProduct) => ({
                id: p.databaseId ?? p.id ?? Math.random().toString(36).slice(2, 9),
                databaseId: p.databaseId,
                title: p.name ?? (p.slug || String(p.databaseId ?? p.id)),
                price: p.price ?? null,
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
                soldIndividually: (function () {
                    const vt = (p as any).variableType || (p as any).optionType || (p as any).variable_type || null;
                    return vt && typeof vt === 'string' ? String(vt).toLowerCase() === 'radio' : !!p.soldIndividually;
                })(),
                // prefer product image; if missing, try first variation image
                image: (p.image && (typeof p.image === 'string' ? p.image : (p.image as any).sourceUrl)) || (Array.isArray(p.variations) && p.variations[0] && p.variations[0].image ? (typeof p.variations[0].image === 'string' ? p.variations[0].image : p.variations[0].image.sourceUrl) : null),
            } as AddOnProduct));

            setAddOns(mapped);
            return () => { mounted = false; };
        }

        // relatedIds may be undefined; guard the call
        const idsToFetch = (relatedIds || []).map(x => x as string | number);
        if (idsToFetch.length === 0) return;

        if (typeof fetchByIds === 'function') {
            fetchByIds(idsToFetch).then((res) => {
                if (!mounted) return;
                // Expect `res` to be an array of product objects. Keep as-is.
                setAddOns(res || []);
            }).catch(() => { });
        }
        return () => { mounted = false; };
    }, [JSON.stringify(relatedIds), JSON.stringify(relatedProducts || [])]);

    const toggleCheckbox = (id: string | number) => {
        setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const selectRadio = (groupKey: string, id: string | number) => {
        setSelected(prev => ({ ...prev, [groupKey]: id }));
    };

    const addSelectedToCart = () => {
        const uuid = () => 'ci_' + Math.random().toString(36).slice(2, 9);

        // Build a payload array for selected add-ons so they can be attached
        // to the parent cart item as an `options` array. Normalize prices to
        // integer cents to keep storage consistent.
        const toCents = (val: any) => {
            if (val == null) return 0;
            const s = String(val);
            const n = Number(s.replace(/[^0-9.\-]+/g, ''));
            if (isNaN(n)) return 0;
            // If string contained a decimal point, treat as dollars -> cents
            if (s.indexOf('.') !== -1) return Math.round(n * 100);
            // If number looks large (>1000) assume it's already cents
            if (n > 1000) return Math.round(n);
            // Otherwise treat as dollars
            return Math.round(n * 100);
        };

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
                        if (v) selectedPayloads.push({ cartItemId: uuid(), productId: prodId, variationId: String(v.databaseId ?? v.id), name: `${p.title} - ${v.attributes ? (Array.isArray(v.attributes) ? v.attributes.map((a: any) => a.value).join(' / ') : '') : ''}`.trim(), price: (function (val) { const s = String(val || ''); const n = Number(s.replace(/[^0-9.\-]+/g, '')); return isNaN(n) ? 0 : n; })(v.price ?? p.price), sku: v.sku, quantity: 1 });
                    }
                } else {
                    // checkboxes: multiple variations may be selected
                    for (const v of (p.variations || [])) {
                        const key = `${prodId}:${v.databaseId ?? v.id}`;
                        if (selected[key]) selectedPayloads.push({ cartItemId: uuid(), productId: prodId, variationId: String(v.databaseId ?? v.id), title: `${p.title} - ${v.attributes ? (Array.isArray(v.attributes) ? v.attributes.map((a: any) => a.value).join(' / ') : '') : ''}`.trim(), price: v.price ?? p.price, sku: v.sku });
                    }
                }
            } else {
                // simple product: checkbox per product
                if (selected[prodId]) selectedPayloads.push({ cartItemId: uuid(), productId: prodId, name: p.title, price: (function (val) { const s = String(val || ''); const n = Number(s.replace(/[^0-9.\-]+/g, '')); return isNaN(n) ? 0 : n; })(p.price), sku: p.sku, quantity: 1 });
            }
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
                    payload.price = parsePrice(pp.price ?? pp.salePrice ?? pp.regularPrice ?? 0);
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
                dispatch({ type: Types.addToCart, payload });
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
                                                    <img src={v.image ? normalizeImageUrl(v.image) : (a.image ? normalizeImageUrl(a.image) : '/temp.webp')} className="w-8 h-8 object-cover rounded" />
                                                    <div className="flex-1 text-sm">
                                                        <div className="font-medium">{v.name || (v.attributes && Array.isArray(v.attributes) ? v.attributes.map((at: any) => at.value).join(' / ') : `Variation ${vid}`)}</div>
                                                        {v.sku ? <div className="text-xs text-gray-500">SKU: {v.sku}</div> : null}
                                                    </div>
                                                    {v.price != null && !Number.isNaN(Number(v.price)) ? <div className="text-sm text-gray-600">{`$${(Number(v.price) / 100).toFixed(2)}`}</div> : null}
                                                </label>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <label className="inline-flex items-center space-x-2">
                                <input type="checkbox" checked={!!selected[a.id]} onChange={() => toggleCheckbox(a.id)} />
                                <img src={a.image ? normalizeImageUrl(a.image) : '/temp.webp'} className="w-10 h-10 object-cover rounded" />
                                <div>
                                    <div className="font-medium">{a.title}</div>
                                    <div className="text-sm text-gray-600">{a.sku ? `SKU: ${a.sku}` : ''} {a.price != null && !Number.isNaN(Number(a.price)) ? ` • $${(Number(a.price) / 100).toFixed(2)}` : ''}</div>
                                </div>
                            </label>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 text-right">
                <button onClick={() => { console.log('ProductOptions Add Selected Options clicked, selected map:', selected); addSelectedToCart(); }} className="px-4 py-2 bg-black text-white rounded">Add Selected Options</button>
            </div>
        </div>
    );
};

export default ProductOptions;
