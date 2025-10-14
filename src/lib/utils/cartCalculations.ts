import { CartProduct } from '../interfaces';

/**
 * Calculate the total amount for cart items including tax and shipping
 * This function ensures consistent calculation across all payment components
 */
export const calculateCartTotal = (cartItems: CartProduct[]): number => {
  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => {
    const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0) || 0;
    let optionsPrice = 0;
    
    if (item.options && Array.isArray(item.options)) {
      optionsPrice = item.options.reduce((optSum: number, option: any) => {
        const optPrice = Number(option.priceModifier || 0) || 0;
        const optQuantity = Number(option.quantity || 1) || 1;
        return optSum + (optPrice * optQuantity);
      }, 0);
    }
    
    const itemTotal = (basePrice + optionsPrice) * (Number(item.quantity) || 1);
    return total + itemTotal;
  }, 0);

  // Add shipping and tax - consistent with OrderSummaryPanel
  const shipping = 0; // Free shipping for now
  const taxRate = 0.13; // 13% tax rate
  const tax = Math.round((subtotal * taxRate) * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  
  return total;
};

/**
 * Calculate the subtotal for cart items (before tax and shipping)
 */
export const calculateCartSubtotal = (cartItems: CartProduct[]): number => {
  return cartItems.reduce((total, item) => {
    const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0) || 0;
    let optionsPrice = 0;
    
    if (item.options && Array.isArray(item.options)) {
      optionsPrice = item.options.reduce((optSum: number, option: any) => {
        const optPrice = Number(option.priceModifier || 0) || 0;
        const optQuantity = Number(option.quantity || 1) || 1;
        return optSum + (optPrice * optQuantity);
      }, 0);
    }
    
    const itemTotal = (basePrice + optionsPrice) * (Number(item.quantity) || 1);
    return total + itemTotal;
  }, 0);
};

/**
 * Calculate tax amount for a given subtotal
 */
export const calculateTax = (subtotal: number): number => {
  const taxRate = 0.13; // 13% tax rate
  return Math.round((subtotal * taxRate) * 100) / 100;
};

/**
 * Get shipping cost (currently free)
 */
export const getShippingCost = (): number => {
  return 0; // Free shipping for now
};