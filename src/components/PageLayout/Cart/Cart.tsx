import React, { useEffect, useState } from "react";
import ItemList from "./ItemList";
import classNames from "classnames";
import { useRouter } from 'next/router';
import { useCartStore, useCartTotal, useCartVisibility, useCartItems, useIsHydrated } from "stores/cartStore";
import ProductGroup from "../../Cart/ProductGroup";
import ClientOnly from "components/ClientOnly";

const Cart = () => {
  const [isRedirecting, setRedirecting] = useState(false);
  const cart = useCartItems();
  const cartVisibility = useCartVisibility();
  const toggleCartVisibility = useCartStore(state => state.toggleCartVisibility);
  const subTotal = useCartTotal().toFixed(2);
  const isHydrated = useIsHydrated();

  const router = useRouter();

  const handleCheckout = async () => {
    // Navigate to the payment page and let the payment page create the
    // order when the user confirms (Place Order). This avoids creating
    // orphan orders prematurely.
    setRedirecting(true);
    try {
      router.push('/payment');
    } finally {
      setRedirecting(false);
    }
  };


  // We no longer control a mini-cart drawer via cartVisibility; users navigate
  // to the dedicated `/cart` page. Keep cartVisibility for compatibility but
  // avoid altering document body overflow here.

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="fixed sm:w-96 w-full h-screen right-0 z-10 bg-[#f5ebdf] top-14 overflow-hidden flex flex-col items-center justify-center">
        <div className="text-black font-poppins text-center font-medium text-lg">
          Loading cart...
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => router.push('/cart')}
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
        <ClientOnly fallback={
          <div className="text-black font-poppins text-center font-medium text-lg">
            Loading cart...
          </div>
        }>
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
        </ClientOnly>
      </div>
    </>
  );
};

export default Cart;
