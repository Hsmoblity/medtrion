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

    const handleCheckout = () => {
    // Navigate to the consultation page and let the consultation page handle the
    // customer information collection and consultation request submission
    if (cart.length > 0) {
  router.push('/consultation/google-form');
    }
  };


  // We no longer control a mini-cart drawer via cartVisibility; users navigate
  // to the dedicated `/cart` page. Keep cartVisibility for compatibility but
  // avoid altering document body overflow here.

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="fixed sm:w-96 w-full h-screen right-0 z-10 bg-white dark:bg-gray-800 top-14 overflow-hidden flex flex-col items-center justify-center">
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
          "fixed w-screen h-screen opacity-30 bg-gray-800 z-10",
          { hidden: !cartVisibility }
        )}
      ></div>
      <div
        className={classNames(
          "fixed sm:w-96 w-full h-screen right-0 z-10 bg-white dark:bg-gray-800 top-14 overflow-hidden",
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
              <div className="w-full sticky h-80 bg-white dark:bg-gray-800 -ml-2.5 border-t border-gray-200 dark:border-gray-700 p-6 pl-8 bottom-0 shadow-lg">
                <div className="flex flex-wrap flex-row justify-between mb-4">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Subtotal</span>
                  <span className="text-gray-900 dark:text-white text-sm">${subTotal}</span>
                </div>
                <div className="flex flex-wrap flex-row justify-between mb-4">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Taxes</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Calculated at checkout
                  </span>
                </div>
                <div className="w-full h-px bg-gray-200 dark:bg-gray-700 mb-4"></div>
                <div className="flex flex-wrap flex-row justify-between mb-4">
                  <span className="text-gray-900 dark:text-white text-sm font-semibold">Total</span>
                  <span className="text-gray-900 dark:text-white text-sm font-semibold">
                    ${subTotal}
                  </span>
                </div>
                <button
                  disabled={isRedirecting}
                  className="outline-none bg-[#3fa2a3] hover:bg-[#f7a236] text-white border-0 py-3 px-6 rounded-[35px] w-full text-sm uppercase font-primary font-semibold transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
