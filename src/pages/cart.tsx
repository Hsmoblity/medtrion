import React, { useState } from 'react';
import { useCartStore, useCartItems, useCartTotal } from 'stores/cartStore';
import CartPageGroups from 'components/Cart/CartPageGroups';
import { useRouter } from 'next/router';
import { PrimaryButton } from '../components/ui';
import { formatPrice, calculateOrderTotal } from 'lib/utils/priceUtils';

const CartPage = () => {
    const cart = useCartItems();
    const cartTotal = useCartTotal();
    const router = useRouter();
    const [isRedirecting, setRedirecting] = useState(false);

    // Use the robust cart total calculation with proper price handling
    const orderTotal = calculateOrderTotal(cart);
    const subTotal = formatPrice(orderTotal.subtotal);
    const tax = formatPrice(orderTotal.tax);
    const total = formatPrice(orderTotal.total);
    
    // Debug logging for price issues
    console.log('Cart page order summary:', {
      cartItems: cart.length,
      subtotal: orderTotal.subtotal,
      tax: orderTotal.tax,
      total: orderTotal.total,
      formattedSubtotal: subTotal,
      formattedTax: tax,
      formattedTotal: total
    });

    const handleCheckout = async () => {
        // Do not create the order here. Navigate to the payment page and
        // allow the payment page to create the order when user submits
        // the payment form. Keep the UX of redirecting to /payment.
        setRedirecting(true);
        try {
            router.push('/payment');
        } finally {
            setRedirecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                    <nav className="flex text-sm text-gray-500">
                        <a href="/" className="hover:text-gray-700">Home</a>
                        <span className="mx-2">/</span>
                        <span>Cart</span>
                    </nav>
                </div>

                {cart.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items with Product Groups */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Cart Items ({cart.length})
                                    </h2>
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
                                        {isRedirecting ? 'Please wait...' : 'Proceed to Checkout'}
                                    </PrimaryButton>

                                    {/* Continue Shopping */}
                                    <div className="text-center">
                                        <a
                                            href="/#shop"
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Continue Shopping
                                        </a>
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
                                Looks like you haven't added any mobility products to your cart yet.
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
