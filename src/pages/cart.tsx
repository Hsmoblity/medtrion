import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, useCartItems, useCartTotal, useCartHydration } from 'stores/cartStore';
import CartPageGroups from 'components/Cart/CartPageGroups';
import { useRouter } from 'next/router';
import { PrimaryButton } from '../components/ui';
import { formatPrice, calculateOrderTotal } from 'lib/utils/priceUtils';

const CartPage = () => {
    const cart = useCartItems();
    const cartTotal = useCartTotal();
    const isHydrated = useCartHydration(); // Use the new hydration hook
    const cleanupDuplicates = useCartStore(state => state.cleanupDuplicates);
    const cleanupWrongOptions = useCartStore(state => state.cleanupWrongOptions);
    const router = useRouter();
    const [isRedirecting, setRedirecting] = useState(false);

    // Clean up duplicates and wrong options when cart is hydrated
    useEffect(() => {
        if (isHydrated && cart.length > 0) {
            console.log('🔧 Cart page: Running cleanupDuplicates...');
            cleanupDuplicates();
            console.log('🔧 Cart page: Running cleanupWrongOptions...');
            cleanupWrongOptions();
        }
    }, [isHydrated, cart.length, cleanupDuplicates, cleanupWrongOptions]);

    // Use the robust cart total calculation with proper price handling
    const orderTotal = calculateOrderTotal(cart);
    const subTotal = formatPrice(orderTotal.subtotal);
    const tax = formatPrice(orderTotal.tax);
    const total = formatPrice(orderTotal.total);

    const handleCheckout = async () => {
        // Do not create the order here. Navigate to the consultation page and
        // allow the consultation page to collect customer info and submit
        // the consultation request. Keep the UX of redirecting to /consultation.
        setRedirecting(true);
        try {
            router.push('/consultation/google-form');
        } finally {
            setRedirecting(false);
        }
    };

    // Show loading state while cart is hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                    </div>
                    
                    {/* Loading State */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading cart...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                </div>

                {cart.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items with Product Groups */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Cart Items ({cart.length})
                                        </h2>
                                        <button
                                            onClick={() => {
                                                console.log('🔧 Manual cleanup triggered');
                                                cleanupWrongOptions();
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Clean Up Options
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <CartPageGroups />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    {/* Subtotal */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900 font-medium">{subTotal}</span>
                                    </div>

                                    {/* Shipping */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="text-gray-900 font-medium">Calculated at checkout</span>
                                    </div>

                                    {/* Tax */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Tax (8%)</span>
                                        <span className="text-gray-900 font-medium">
                                            {tax}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-200"></div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center text-lg font-semibold">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-gray-900">
                                            {total}
                                        </span>
                                    </div>

                                    {/* Checkout Button */}
                                    <PrimaryButton
                                        disabled={isRedirecting}
                                        loading={isRedirecting}
                                        onClick={handleCheckout}
                                        fullWidth
                                    >
                                        {isRedirecting ? 'Please wait...' : 'Request Consultation'}
                                    </PrimaryButton>

                                    {/* Continue Shopping */}
                                    <div className="text-center">
                                        <Link
                                            href="/#shop"
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Continue Shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
                                <p className="text-sm text-blue-700 mb-3">
                                    Our mobility specialists are here to help you choose the right equipment.
                                </p>
                                <div className="text-sm text-blue-700">
                                    <p>📞 Call: 1-800-790-1635</p>
                                    <p>💬 Live Chat: Available 9AM-6PM EST</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Empty Cart State */
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="mb-6">
                                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
                            <p className="text-gray-600 mb-8">
                                Looks like you haven&apos;t added any mobility products to your cart yet.
                            </p>
                            <PrimaryButton href="/#shop">
                                Start Shopping
                                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </PrimaryButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage;
