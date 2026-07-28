"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductOptions from 'components/ProductOptions';
import { useCartItems, useCartStore, useEditStatus } from 'stores/cartStore';
import { useSession } from '../contexts/SessionContext';
import { loadSessionStorage, isSessionExpired } from '../utils/sessionStorage';
import { PrimaryButton } from 'components/ui';
import { extractImageUrl } from '../lib/utils/image';

interface Props {
    product: any;
    editSessionData?: {
        cartItemId: string;
        sessionId: string;
        isEditMode: boolean;
    } | null;
}

export default function OptionsClientWrapper({ product, editSessionData }: Props) {
    const search = useSearchParams();
    const router = useRouter();
    const cart = useCartItems();
    const { stopEditSession, addNotification, getActiveEditSession } = useSession();
    const [isValidSession, setIsValidSession] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionError, setSessionError] = useState<string | null>(null);
    const [currentSelections, setCurrentSelections] = useState<any[]>([]);

    const cartItemId = editSessionData?.cartItemId || (search?.get ? search.get('cartItemId') : null);
    const editStatus = useEditStatus(cartItemId || '');

    // Use a simple lookup (no hooks) so we can safely early-return when no cartItemId
    const cartItem = cart.find((c: any) => String(c.cartItemId) === String(cartItemId) || String(c.cartItemId) === String(`ci_fallback_${product?.slug}`));

    // Validate edit session on mount
    useEffect(() => {
        if (!editSessionData) {
            setIsLoading(false);
            return;
        }

        const validateSession = async () => {
            try {
                const storage = loadSessionStorage();
                const session = storage.editSessions[editSessionData.sessionId];

                if (!session) {
                    setSessionError('Edit session not found. It may have expired.');
                    setIsValidSession(false);
                    return;
                }

                if (isSessionExpired(session)) {
                    setSessionError('Edit session has expired.');
                    // Clean up expired session
                    await stopEditSession(editSessionData.sessionId);
                    setIsValidSession(false);
                    return;
                }

                if (session.cartItemId !== editSessionData.cartItemId) {
                    setSessionError('Edit session does not match the cart item.');
                    setIsValidSession(false);
                    return;
                }

                if (session.productSlug !== product.slug) {
                    setSessionError('Edit session does not match the product.');
                    setIsValidSession(false);
                    return;
                }

                setIsValidSession(true);
                setSessionError(null);
            } catch (error) {
                console.error('Session validation error:', error);
                setSessionError('Failed to validate edit session.');
                setIsValidSession(false);
            } finally {
                setIsLoading(false);
            }
        };

        validateSession();
    }, [editSessionData, product.slug, stopEditSession]);

    // Redirect on session errors
    useEffect(() => {
        if (sessionError && !isLoading) {
            const timer = setTimeout(() => {
                addNotification({
                    type: 'error',
                    message: sessionError
                });
                router.push('/cart');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [sessionError, isLoading, addNotification, router]);

    // Handle save configuration
    const handleSaveConfiguration = async (selectedOptions: any[]) => {
        if (!editSessionData || !cartItem) return;

        try {
            const updateCartItem = useCartStore.getState().updateCartItemSafe;
            const setEditStatus = useCartStore.getState().setEditStatus;

            setEditStatus(cartItemId!, 'saving');

            // Calculate updated price
            const basePrice = typeof product.price === 'number' ? product.price : Number(product.price || 0);
            const optionPrice = selectedOptions.reduce((sum, opt) => {
                // Use price field first, fallback to priceModifier for backward compatibility
                const price = opt.price || opt.priceModifier || 0;
                return sum + (typeof price === 'number' ? price : Number(price));
            }, 0);
            const updatedPrice = basePrice + optionPrice;

            // Update cart item
            const success = updateCartItem(cartItemId!, {
                options: selectedOptions,
                price: updatedPrice
            });

            if (success) {
                // Stop edit session
                await stopEditSession(editSessionData.sessionId, true);
                
                addNotification({
                    type: 'success',
                    message: 'Configuration updated successfully!'
                });

                // Navigate back to cart
                router.push(`/cart?updated=${cartItemId}`);
            } else {
                throw new Error('Failed to update cart item');
            }
        } catch (error) {
            console.error('Save configuration error:', error);
            addNotification({
                type: 'error',
                message: 'Failed to save changes. Please try again.'
            });
            
            if (cartItemId) {
                useCartStore.getState().setEditStatus(cartItemId, 'idle');
            }
        }
    };

    // Handle cancel configuration
    const handleCancelConfiguration = async () => {
        if (!editSessionData) return;

        try {
            await stopEditSession(editSessionData.sessionId, false);
            addNotification({
                type: 'info',
                message: 'Changes cancelled.'
            });
            router.push('/cart');
        } catch (error) {
            console.error('Cancel configuration error:', error);
            router.push('/cart');
        }
    };

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

    // Show loading state during session validation
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Validating edit session...</p>
                </div>
            </div>
        );
    }

    // Show error state for invalid sessions
    if (sessionError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Session Error</h3>
                    <p className="text-red-700 mb-4">{sessionError}</p>
                    <p className="text-sm text-red-600">Redirecting you to the cart...</p>
                </div>
            </div>
        );
    }

    if (!cartItem) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cart Item Not Found</h3>
                    <p className="text-yellow-700 mb-4">The item you&apos;re trying to edit could not be found in your cart.</p>
                    <button 
                        onClick={() => router.push('/cart')}
                        className="px-6 py-3 bg-[#f7a236] text-white rounded-[35px] font-primary font-semibold hover:bg-[#3fa2a3] transition-all duration-300"
                    >
                        Return to Cart
                    </button>
                </div>
            </div>
        );
    }

    // onConfirm handler should update the existing cart item with new options
    const onConfirm = async (selectedPayloads: any[]) => {
        if (!cartItem?.cartItemId) return;
        try {
            const { updateCartItem } = useCartStore.getState();
            updateCartItem(String(cartItem.cartItemId), { options: selectedPayloads });
            
            // Show success message before navigating
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
            successMessage.innerHTML = `
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                Configuration updated successfully!
            `;
            document.body.appendChild(successMessage);
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.parentNode.removeChild(successMessage);
                }
            }, 3000);
            
        } catch (e) {
            console.warn('Failed to update cart item from options page', e);
        }
        
        // Navigate back to cart after saving
        setTimeout(() => {
            try { router.push('/cart'); } catch (e) { /* noop */ }
        }, 1000);
    };


    return (
        <div>
            {/* Edit Session Banner */}
            {editSessionData && isValidSession && (
                <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
                    <div className="max-w-screen-xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-brand-dark">
                                        Editing configuration for &quot;{cartItem.title}&quot;
                                    </h3>
                                    <p className="text-sm text-brand-dark">
                                        Make your changes below, then save or cancel to return to your cart.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancelConfiguration}
                                    className="px-3 py-1 text-sm font-medium text-brand-dark hover:text-brand-dark border border-orange-300 hover:border-orange-400 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <PrimaryButton
                                    size="sm"
                                    onClick={() => handleSaveConfiguration(currentSelections)}
                                    disabled={editStatus === 'saving'}
                                    loading={editStatus === 'saving'}
                                >
                                    {editStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-24 mx-auto p-6 max-w-screen-xl px-5">
                {/* Breadcrumb Navigation */}
                <nav className="mb-4" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        <li>
                            <button 
                                onClick={() => router.push('/cart')}
                                className="hover:text-brand-primary transition-colors duration-200"
                            >
                                Cart
                            </button>
                        </li>
                        <li>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </li>
                        <li className="text-gray-900 font-medium">
                            {editSessionData ? 'Edit Configuration' : 'Choose Options'}
                        </li>
                    </ol>
                </nav>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">
                        {editSessionData ? 'Edit Configuration' : 'Choose Options'}
                    </h2>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                            <img 
                                src={extractImageUrl(cartItem.featuredImage) || '/placeholder.svg'} 
                                alt={cartItem.title}
                                className="w-16 h-16 object-cover rounded"
                            />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-lg font-semibold text-gray-900">{cartItem.title}</h3>
                            <p className="text-sm text-gray-600">
                                {editSessionData ? 'Current configuration' : 'Select your options'}
                            </p>
                            {cartItem.options && cartItem.options.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">Selected options:</p>
                                    <ul className="text-sm text-gray-600 mt-1">
                                        {cartItem.options.slice(0, 3).map((opt: any, idx: number) => (
                                            <li key={idx}>• {opt.name || opt.title || opt.value}</li>
                                        ))}
                                        {cartItem.options.length > 3 && (
                                            <li>• +{cartItem.options.length - 3} more options</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <div className="text-lg font-semibold text-gray-900">
                                ${(() => {
                                    const base = typeof cartItem.price === 'number' ? cartItem.price : Number(cartItem.price || 0);
                                    let opts = 0;
                                    if (cartItem.options && Array.isArray(cartItem.options)) {
                                        for (const o of cartItem.options) {
                                            const op = Number((o as any).priceModifier || 0) || 0;
                                            const oq = Number((o as any).quantity || 1) || 1;
                                            opts += op * oq;
                                        }
                                    }
                                    return (base + opts).toFixed(2);
                                })()}
                            </div>
                            <p className="text-sm text-gray-600">per unit</p>
                        </div>
                    </div>
                </div>
                
                <ProductOptions
                    relatedIds={product._related_options}
                    relatedProducts={Array.isArray(product._related_options_products) ? product._related_options_products : undefined}
                    parentProductId={product.productId}
                    parentProduct={cartItem}
                    initialSelectedOptionIds={editSessionData ? 
                        (cartItem.options || []).map((opt: any) => opt.value || opt.id).filter(Boolean) : 
                        undefined
                    }
                    editMode={!!editSessionData}
                    originalPrice={typeof product.price === 'number' ? product.price : Number(product.price || 0)}
                    onConfigurationChange={editSessionData ? (optionIds) => {
                        // Handle real-time configuration changes
                        console.log('Configuration changed:', optionIds);
                        // Note: We can't directly get the selectedOptions here since this only gives us IDs
                        // The actual selection capture happens via onConfirm or the Save button click
                    } : undefined}
                    onSelectionChange={editSessionData ? (selectedOptions) => {
                        // Update current selections in real-time
                        setCurrentSelections(selectedOptions);
                    } : undefined}
                    fetchByIds={async (ids: any[]) => {
                        // reuse server fetch when possible by calling existing API route
                        const url = `/api/debug/related-products?ids=${ids.join(',')}`;
                        const r = await fetch(url);
                        if (r.ok) {
                            const json = await r.json();
                            return Array.isArray(json.products) ? json.products : (Array.isArray(json) ? json : []);
                        }
                        throw new Error(`Failed to fetch related products: ${r.statusText}`);
                    }}
                    onConfirm={editSessionData ? (selectedOptions) => {
                        // Update current selections and save immediately (for "Add Selected Options" button)
                        setCurrentSelections(selectedOptions);
                        handleSaveConfiguration(selectedOptions);
                    } : undefined}
                />
            </div>
        </div>
    );
}
