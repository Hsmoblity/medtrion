/**
 * Enhanced price calculation utilities for Model Configurator
 * Handles variation-based pricing and real-time calculations
 */

import { ConfigurableProductSchema, Variation } from '../interfaces/configurator';
import { parsePrice } from './priceUtils';

/**
 * Calculate total price for an option with its selected variations
 * @param option - The base option product
 * @param variations - Array of selected variations
 * @returns Total price including base option price + variation modifiers
 */
export const calculateOptionPrice = (
  option: ConfigurableProductSchema, 
  variations: Variation[]
): number => {
  const basePrice = parsePrice(option.price || option.regularPrice);
  const variationTotal = variations.reduce((sum, v) => sum + parsePrice(v.price), 0);
  return basePrice + variationTotal;
};

/**
 * Calculate total configuration price including base product and all selected options
 * @param baseProduct - The main product
 * @param selectedOptions - Array of selected options with variations
 * @returns Total configuration price
 */
export const calculateConfigurationTotal = (
  baseProduct: ConfigurableProductSchema,
  selectedOptions: Array<{
    option: ConfigurableProductSchema;
    selectedVariations: Variation[];
    totalPrice: number;
  }>
): {
  basePrice: number;
  optionsPrice: number;
  installationPrice: number;
  shippingPrice: number;
  taxAmount: number;
  totalPrice: number;
} => {
  const basePrice = parsePrice(baseProduct.price || baseProduct.regularPrice);
  
  const optionsPrice = selectedOptions.reduce((sum, selectedOption) => {
    return sum + selectedOption.totalPrice;
  }, 0);
  
  // Calculate installation cost (simplified)
  const installationPrice = selectedOptions.some(option => 
    option.option.installationRequired
  ) ? 300 : 0;
  
  // Calculate shipping (simplified)
  const shippingPrice = 50;
  
  // Calculate tax (8% on total before tax)
  const subtotal = basePrice + optionsPrice + installationPrice + shippingPrice;
  const taxAmount = subtotal * 0.08;
  
  const totalPrice = subtotal + taxAmount;

  return {
    basePrice,
    optionsPrice,
    installationPrice,
    shippingPrice,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
};

/**
 * Calculate real-time price preview for option popup
 * @param option - The option being configured
 * @param tempSelections - Temporarily selected variations
 * @returns Price breakdown for preview
 */
export const calculatePricePreview = (
  option: ConfigurableProductSchema,
  tempSelections: Variation[]
): {
  basePrice: number;
  variationsTotal: number;
  totalPrice: number;
  hasVariations: boolean;
} => {
  const basePrice = parsePrice(option.price || option.regularPrice);
  const variationsTotal = tempSelections.reduce((sum, v) => sum + parsePrice(v.price), 0);
  const totalPrice = basePrice + variationsTotal;
  
  return {
    basePrice,
    variationsTotal,
    totalPrice,
    hasVariations: tempSelections.length > 0
  };
};

/**
 * Calculate financing options based on total price
 * @param totalPrice - Total configuration price
 * @returns Array of financing options
 */
export const calculateFinancingOptions = (totalPrice: number) => {
  const options = [];
  
  if (totalPrice >= 1000) {
    options.push({
      id: 'financing-12',
      name: '12 Month Financing',
      monthlyPayment: Math.round((totalPrice / 12) * 100) / 100,
      totalMonths: 12,
      interestRate: 0,
      totalCost: totalPrice
    });
  }
  
  if (totalPrice >= 2000) {
    options.push({
      id: 'financing-24',
      name: '24 Month Financing',
      monthlyPayment: Math.round((totalPrice / 24) * 100) / 100,
      totalMonths: 24,
      interestRate: 0,
      totalCost: totalPrice
    });
  }
  
  return options;
};

/**
 * Calculate insurance estimate based on configuration
 * @param totalPrice - Total configuration price
 * @returns Insurance estimate
 */
export const calculateInsuranceEstimate = (totalPrice: number) => {
  const annualPremium = totalPrice * 0.05; // 5% of total price
  
  return {
    annualPremium: Math.round(annualPremium * 100) / 100,
    monthlyPremium: Math.round((annualPremium / 12) * 100) / 100,
    coverage: 'Comprehensive mobility equipment coverage',
    deductible: 250,
    provider: 'HSM Mobility Insurance'
  };
};
