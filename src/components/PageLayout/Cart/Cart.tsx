import React, { useContext, useEffect, useState } from "react";
import CartItemsContext from "contexts/cartItemsContext";
import CartVisibilityContext from "contexts/cartVisibilityContext";
import ItemList from "./ItemList";
import classNames from "classnames";
import { CartProduct } from "lib/interfaces";
import { useRouter } from 'next/router';

const Cart = () => {
  const [isRedirecting, setRedirecting] = useState(false);
  const { cart } = useContext(CartItemsContext);
  const { cartVisibility, toggleCartVisibility } = useContext(
    CartVisibilityContext
  );

  const subTotal = cart
    .reduce((total, item: CartProduct) => {
      return (total +=
        (item.price) *
        (item.quantity ?? 1));
    }, 0)
    .toFixed(2);

  const router = useRouter();

  const handleCheckout = async () => {
    // Create an order page first, then redirect to an intermediate checkout flow
    setRedirecting(true);
    try {
      // Save cart to server-side order endpoint
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineItems: cart }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Create order failed', err);
        alert('Failed to create order. Please try again.');
        setRedirecting(false);
        return;
      }

      const orderData = await res.json();
      const orderId = orderData?.order?.id || orderData?.orderId || null;
      if (!orderId) {
        console.error('Order creation returned no id', orderData);
        alert('Failed to create order. Please try again.');
        setRedirecting(false);
        return;
      }

      // Navigate to payment page which will request Stripe session for this order
      router.push(`/payment?wpOrderId=${encodeURIComponent(orderId)}`);
    } catch (e) {
      console.error('Checkout flow failed', e);
      setRedirecting(false);
    }
  };


  useEffect(() => {
    if (cartVisibility) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [cartVisibility]);

  return (
    <>
      <div
        onClick={toggleCartVisibility}
        className={classNames(
          "fixed w-screen h-screen opacity-30 bg-[#f5ebdf] z-10",
          { hidden: !cartVisibility }
        )}
      ></div>
      <div
        className={classNames(
          "fixed sm:w-96 w-full h-screen right-0 z-10 bg-[#f5ebdf] top-14 overflow-hidden",
          { hidden: !cartVisibility },
          { "flex flex-col items-center justify-center": cart.length === 0 }
        )}
      >
        {cart.length > 0 ? (
          <div className="relative h-full">
            <div className="relative w-full h-2/3 p-5 overflow-y-auto top-0">
              <h4 className="text-3xl text-black font-medium mb-8">My Cart</h4>
              {cart && <ItemList products={cart} />}
            </div>
            <div className="w-full sticky h-80 bg-black -ml-2.5 border-t border-white p-6 pl-8 bottom-0">
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-white text-sm">Subtotal</span>
                <span className="text-white text-sm">${subTotal}</span>
              </div>
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-white text-sm">Taxes</span>
                <span className="text-white text-sm">
                  Calculated at checkout
                </span>
              </div>
              <div className="w-full h-px bg-gray-800 mb-4"></div>
              <div className="flex flex-wrap flex-row justify-between mb-4">
                <span className="text-white text-sm font-semibold">Total</span>
                <span className="text-white text-sm font-semibold">
                  ${subTotal}
                </span>
              </div>
              <button
                disabled={isRedirecting}
                className=" outline-none bg-[#f5ebdf] border-0 py-4 w-full text-sm uppercase hover:bg-gray-300 transition duration-500 ease-in-out"
                onClick={handleCheckout}
              >
                {isRedirecting ? `Please wait...` : `Proceed to Checkout`}
              </button>
            </div>
          </div>
        ) : (
          <h4 className=" text-black font-poppins text-center font-medium mb-8 text-lg">
            Your cart is empty.
          </h4>
        )}
      </div>
    </>
  );
};

export default Cart;
