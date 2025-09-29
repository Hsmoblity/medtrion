import React, { createContext, useContext, useState } from "react";

interface CartVisibilityContextProps {
  cartVisibility: boolean;
  toggleCartVisibility: () => void;
}

const CartVisibilityContext = createContext<CartVisibilityContextProps>({
  cartVisibility: false,
  toggleCartVisibility: () => null
});

// CartVisibilityProvider component
export const CartVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartVisibility, setCartVisibility] = useState(false);

  const toggleCartVisibility = () => {
    setCartVisibility(prev => !prev);
  };

  return (
    <CartVisibilityContext.Provider value={{ cartVisibility, toggleCartVisibility }}>
      {children}
    </CartVisibilityContext.Provider>
  );
};

// Hook to use cart visibility context
export const useCartVisibility = () => {
  const context = useContext(CartVisibilityContext);
  if (!context) {
    throw new Error('useCartVisibility must be used within a CartVisibilityProvider');
  }
  return context;
};

export default CartVisibilityContext;
