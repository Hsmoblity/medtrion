"use client";

import React, { useContext, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CartItemsContext from 'contexts/cartItemsContext';
import ProductOptions from 'components/ProductOptions';
import Types from 'reducers/cart/types';

interface Props {
    product: any;
}

export default function OptionsClientWrapper({ product }: Props) {
    const search = useSearchParams();
    const router = useRouter();
    const cartCtx = useContext(CartItemsContext);
    const cart = cartCtx?.cart || [];
    const dispatch = cartCtx?.dispatch;

    const cartItemId = search?.get ? search.get('cartItemId') : null;

    // Use a simple lookup (no hooks) so we can safely early-return when no cartItemId
    const cartItem = cart.find((c: any) => String(c.cartItemId) === String(cartItemId) || String(c.cartItemId) === String(`ci_fallback_${product?.slug}`));

    // If the server rendered a ProductOptions instance (wrapped in
    // #server-product-options) hide it while we're mounting our client-driven
    // editor to avoid duplicate UI and duplicate add actions. Restore the
    // element's display style on unmount.
    useEffect(() => {
        // Only hide the server-rendered ProductOptions when we're editing an existing
        // cart item (i.e. a cartItemId query param is present). Otherwise leave the
        // server block visible so the product options can be used for new purchases.
        if (!cartItemId) return;
        try {
            const el = document.getElementById('server-product-options');
            if (el) {
                el.style.display = 'none';
            }
            return () => {
                try {
                    if (el) el.style.display = '';
                } catch (e) { /* noop */ }
            };
        } catch (e) { /* noop */ }
    }, [cartItemId]);

    // If we have a cartItemId but the cart item was not found in the store,
    // show a friendly message and ask the user to return to the cart.
    // Keep this effect above the early return so hooks order is stable; the
    // effect itself checks for cartItemId and only schedules a redirect when
    // appropriate.
    useEffect(() => {
        if (cartItemId && !cartItem) {
            try {
                const t = setTimeout(() => { router.push('/cart'); }, 1800);
                return () => clearTimeout(t);
            } catch (e) { /* noop */ }
        }
        return; // no-op cleanup when nothing scheduled
    }, [cartItemId, cartItem, router]);

    // If no cartItemId present, do not render the client editor — allow the
    // server-rendered ProductOptions (inside #server-product-options) to remain visible.
    if (!cartItemId) return null;

    if (!cartItem) {
        return (
            <div className="p-6">Cart item not found. Redirecting you to the cart...</div>
        );
    }

    // onConfirm handler should update the existing cart item with new options
    const onConfirm = async (selectedPayloads: any[]) => {
        if (!dispatch) return;
        try {
            dispatch({ type: Types.updateCartItem, payload: { cartItemId: String((cartItem as any).cartItemId), changes: { options: selectedPayloads } } });
        } catch (e) {
            console.warn('Failed to update cart item from options page', e);
        }
        // Navigate back to cart after saving
        try { router.push('/cart'); } catch (e) { /* noop */ }
    };


    return (
        <div className="py-24 mx-auto p-6 max-w-screen-xl px-5">
            <h2 className="text-lg font-semibold mb-4">Edit options for {cartItem.title}</h2>
            <ProductOptions
                relatedIds={product._related_options}
                relatedProducts={Array.isArray(product._related_options_products) ? product._related_options_products : undefined}
                parentProductId={product.productId}
                parentProduct={cartItem}
                fetchByIds={async (ids: any[]) => {
                    // reuse server fetch when possible by calling existing API route
                    try {
                        const url = `/api/debug/related-products?ids=${ids.join(',')}`;
                        const r = await fetch(url);
                        if (r.ok) {
                            const json = await r.json();
                            return Array.isArray(json.products) ? json.products : (Array.isArray(json) ? json : []);
                        }
                    } catch (e) { }
                    return [];
                }}
                onConfirm={onConfirm}
            />
        </div>
    );
}
