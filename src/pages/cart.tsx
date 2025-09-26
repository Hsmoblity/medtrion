import React, { useContext, useState } from 'react';
import CartItemsContext from 'contexts/cartItemsContext';
import ItemList from 'components/PageLayout/Cart/ItemList';
import { useRouter } from 'next/router';

const CartPage = () => {
    const { cart } = useContext(CartItemsContext);
    const router = useRouter();
    const [isRedirecting, setRedirecting] = useState(false);

    const subTotal = cart.reduce((total: number, item: any) => {
        const base = Number(item.price || 0) || 0;
        let opts = 0;
        if (item.options && Array.isArray(item.options) && item.options.length > 0) {
            for (const o of item.options) {
                const op = Number(o.price || o.priceModifier || 0) || 0;
                const oq = Number(o.quantity || 1) || 1;
                opts += op * oq;
            }
        }
        return total + ((base + opts) * (Number(item.quantity) || 1));
    }, 0).toFixed(2);

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
        <div className="max-w-6xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
            {cart.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <ItemList products={cart} />
                    </div>
                    <div className="md:col-span-1 border p-4">
                        <div className="mb-4 flex justify-between"><span>Subtotal</span><span>${subTotal}</span></div>
                        <div className="mb-4">Taxes calculated at checkout</div>
                        <button disabled={isRedirecting} onClick={handleCheckout} className="w-full py-3 bg-blue-600 text-white rounded">{isRedirecting ? 'Please wait...' : 'Proceed to Checkout'}</button>
                    </div>
                </div>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    )
}

export default CartPage;
