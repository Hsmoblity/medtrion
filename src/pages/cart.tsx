import React, { useContext, useState } from 'react';
import CartItemsContext from 'contexts/cartItemsContext';
import ItemList from 'components/PageLayout/Cart/ItemList';
import { useRouter } from 'next/router';

const CartPage = () => {
    const { cart } = useContext(CartItemsContext);
    const router = useRouter();
    const [isRedirecting, setRedirecting] = useState(false);

    const subTotal = cart.reduce((total: number, item: any) => total + (Number(item.price) * (Number(item.quantity) || 1)), 0).toFixed(2);

    const handleCheckout = async () => {
        setRedirecting(true);
        try {
            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lineItems: cart }),
            });
            if (!res.ok) {
                setRedirecting(false);
                alert('Failed to create order');
                return;
            }
            const data = await res.json();
            const orderId = data?.order?.id || data?.orderId || null;
            if (!orderId) {
                setRedirecting(false);
                alert('Failed to create order');
                return;
            }
            if (data?.skippedStripe) {
                router.push(`/success?wpOrderId=${encodeURIComponent(orderId)}`);
            } else {
                router.push(`/payment?wpOrderId=${encodeURIComponent(orderId)}`);
            }
        } catch (e) {
            console.error(e);
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
