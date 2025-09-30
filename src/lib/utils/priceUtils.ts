/**
 * Price parsing and formatting utilities
 * Handles edge cases like 0 prices, NaN values, and invalid price data
 */

/**
 * Safely parse any price value to a number
 * @param price - The price value to parse (can be string, number, null, undefined, or NaN)
 * @returns A valid number (0 for invalid values)
 */
export const parsePrice = (price: any): number => {
  // Handle null/undefined
  if (price === null || price === undefined) {
    return 0;
  }
  
  // Handle number type
  if (typeof price === 'number') {
    return isNaN(price) ? 0 : price;
  }
  
  // Handle string type
  if (typeof price === 'string') {
    // Remove currency symbols, whitespace, and non-numeric characters except decimal point and minus
    const cleanPrice = price.replace(/[^0-9.\-]/g, '');
    
    // Handle empty string after cleaning
    if (cleanPrice === '' || cleanPrice === '-') {
      return 0;
    }
    
    const parsed = parseFloat(cleanPrice);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Handle other types (boolean, object, etc.)
  return 0;
};

/**
 * Safely format a price value for display
 * @param price - The price value to format
 * @param options - Formatting options
 * @returns Formatted price string (e.g., "$0.00", "$10.50")
 */
export const formatPrice = (price: any, options: {
  showCurrency?: boolean;
  decimals?: number;
  fallback?: string;
} = {}): string => {
  const {
    showCurrency = true,
    decimals = 2,
    fallback = '$0.00'
  } = options;
  
  const parsedPrice = parsePrice(price);
  
  // Handle NaN and invalid values
  if (isNaN(parsedPrice) || !isFinite(parsedPrice)) {
    return fallback;
  }
  
  // Format the price
  const formatted = parsedPrice.toFixed(decimals);
  
  return showCurrency ? `$${formatted}` : formatted;
};

/**
 * Calculate order total with proper price handling
 * @param items - Array of cart items
 * @returns Order total breakdown
 */
export const calculateOrderTotal = (items: Array<{
  price: any;
  quantity?: number;
  options?: Array<{ price?: any; priceModifier?: any }>;
}>): {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
} => {
  let subtotal = 0;
  let itemCount = 0;
  
  items.forEach((item, index) => {
    const basePrice = parsePrice(item.price);
    const quantity = item.quantity || 1;
    
    // Add option prices if any
    let optionPrice = 0;
    if (item.options && Array.isArray(item.options)) {
      optionPrice = item.options.reduce((sum, option) => {
        const optPrice = parsePrice(option.price || option.priceModifier);
        return sum + optPrice;
      }, 0);
    }
    
    const itemTotal = (basePrice + optionPrice) * quantity;
    
    // Validate calculation result
    if (isNaN(itemTotal)) {
      console.warn('Invalid price calculation for item:', {
        index,
        item,
        basePrice,
        optionPrice,
        quantity,
        itemTotal
      });
      return;
    }
    
    subtotal += itemTotal;
    itemCount += quantity;
  });
  
  // Calculate tax (8% tax rate)
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  // Validate final results
  return {
    subtotal: isNaN(subtotal) ? 0 : subtotal,
    tax: isNaN(tax) ? 0 : tax,
    total: isNaN(total) ? 0 : total,
    itemCount
  };
};

/**
 * Validate that a price value is valid
 * @param price - The price value to validate
 * @returns True if the price is valid, false otherwise
 */
export const isValidPrice = (price: any): boolean => {
  const parsed = parsePrice(price);
  return !isNaN(parsed) && isFinite(parsed);
};

/**
 * Debug helper to log price parsing issues
 * @param price - The price value being parsed
 * @param context - Additional context for debugging
 */
export const debugPriceParsing = (price: any, context: string = ''): void => {
  console.log(`Price parsing debug ${context}:`, {
    originalPrice: price,
    type: typeof price,
    parsedPrice: parsePrice(price),
    isValid: isValidPrice(price),
    formatted: formatPrice(price)
  });
};