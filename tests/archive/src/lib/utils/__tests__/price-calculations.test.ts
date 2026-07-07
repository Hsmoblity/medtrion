/**
 * Price Calculation Tests
 * 
 * Comprehensive tests to verify the price calculation bug fix
 * and ensure consistent pricing across all components.
 */

import { 
  calculateOptionPrice, 
  calculateConfigurationTotal, 
  validatePriceCalculation,
  getOptionPrice 
} from '../price-calculations';
import { ConfigurableProductSchema, Variation } from '../../interfaces/configurator';

// Mock data for testing
const mockOption: ConfigurableProductSchema = {
  id: '1',
  name: 'Safety Package',
  price: '100.00',
  regularPrice: '120.00',
  salePrice: '100.00',
  sku: 'SAFETY-001',
  shortDescription: 'Enhanced safety features',
  description: 'Comprehensive safety package',
  image: { sourceUrl: '/safety.jpg' },
  attributes: [],
  variations: [],
  installationRequired: false,
  totalPrice: 150.00 // This includes variation costs
};

const mockVariations: Variation[] = [
  {
    id: '1',
    name: 'Extra Safety Rail',
    price: '25.00',
    type: 'checkbox',
    description: 'Additional safety rail'
  },
  {
    id: '2', 
    name: 'Emergency Stop Button',
    price: '25.00',
    type: 'checkbox',
    description: 'Emergency stop functionality'
  }
];

const mockBaseProduct: ConfigurableProductSchema = {
  id: 'base-1',
  name: 'Acorn Stairlift',
  price: '2000.00',
  regularPrice: '2200.00',
  salePrice: '2000.00',
  sku: 'ACORN-180',
  shortDescription: 'Curved stairlift',
  description: 'Premium curved stairlift',
  image: { sourceUrl: '/stairlift.jpg' },
  attributes: [],
  variations: [],
  installationRequired: true
};

describe('Price Calculation Bug Fix Tests', () => {
  
  describe('calculateOptionPrice', () => {
    it('should calculate correct price with variations', () => {
      const result = calculateOptionPrice(mockOption, mockVariations);
      // Base price (100) + variations (25 + 25) = 150
      expect(result).toBe(150);
    });

    it('should calculate correct price without variations', () => {
      const result = calculateOptionPrice(mockOption, []);
      // Base price only = 100
      expect(result).toBe(100);
    });

    it('should handle zero-price variations', () => {
      const zeroPriceVariations: Variation[] = [
        { id: '1', name: 'Free Upgrade', price: '0.00', type: 'radio', description: 'Free upgrade' }
      ];
      const result = calculateOptionPrice(mockOption, zeroPriceVariations);
      expect(result).toBe(100); // Base price only
    });
  });

  describe('getOptionPrice', () => {
    it('should prioritize totalPrice over base price', () => {
      const result = getOptionPrice(mockOption);
      // Should use totalPrice (150) instead of base price (100)
      expect(result).toBe(150);
    });

    it('should fallback to base price when totalPrice is not available', () => {
      const optionWithoutTotalPrice = { ...mockOption, totalPrice: undefined };
      const result = getOptionPrice(optionWithoutTotalPrice);
      // Should fallback to base price (100)
      expect(result).toBe(100);
    });

    it('should handle missing price fields gracefully', () => {
      const optionWithMissingPrices = { 
        ...mockOption, 
        price: undefined, 
        regularPrice: undefined,
        totalPrice: undefined 
      };
      const result = getOptionPrice(optionWithMissingPrices);
      expect(result).toBe(0); // Should handle gracefully
    });
  });

  describe('validatePriceCalculation', () => {
    it('should validate correct price calculation', () => {
      const validation = validatePriceCalculation(mockOption, mockVariations, 150);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should detect missing variation costs', () => {
      // totalPrice equals base price but variations are present
      const validation = validatePriceCalculation(mockOption, mockVariations, 100);
      expect(validation.isValid).toBe(false);
      expect(validation.warnings).toContain(
        expect.stringContaining('variations but totalPrice equals basePrice')
      );
    });

    it('should detect incorrect total price', () => {
      const validation = validatePriceCalculation(mockOption, mockVariations, 200);
      expect(validation.isValid).toBe(false);
      expect(validation.warnings).toContain(
        expect.stringContaining("totalPrice doesn't match expected price")
      );
    });

    it('should handle zero variations correctly', () => {
      const validation = validatePriceCalculation(mockOption, [], 100);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });
  });

  describe('calculateConfigurationTotal', () => {
    it('should calculate correct total with options and variations', () => {
      const selectedOptions = [
        {
          option: mockOption,
          selectedVariations: mockVariations,
          totalPrice: 150 // Base (100) + variations (50)
        }
      ];

      const result = calculateConfigurationTotal(mockBaseProduct, selectedOptions);
      
      expect(result.basePrice).toBe(2000); // Base product price
      expect(result.optionsPrice).toBe(150); // Option with variations
      expect(result.installationPrice).toBe(300); // Installation required
      expect(result.shippingPrice).toBe(0); // Free shipping over $2000
      expect(result.taxAmount).toBe(196); // 8% of (2000 + 150 + 300 + 0)
      expect(result.totalPrice).toBe(2646); // Total including tax
    });

    it('should calculate correct total with multiple options', () => {
      const option2: ConfigurableProductSchema = {
        ...mockOption,
        id: '2',
        name: 'Comfort Package',
        price: '200.00',
        totalPrice: 200.00
      };

      const selectedOptions = [
        {
          option: mockOption,
          selectedVariations: mockVariations,
          totalPrice: 150
        },
        {
          option: option2,
          selectedVariations: [],
          totalPrice: 200
        }
      ];

      const result = calculateConfigurationTotal(mockBaseProduct, selectedOptions);
      
      expect(result.basePrice).toBe(2000);
      expect(result.optionsPrice).toBe(350); // 150 + 200
      expect(result.installationPrice).toBe(300);
      expect(result.shippingPrice).toBe(0); // Free shipping
      expect(result.taxAmount).toBe(212); // 8% of (2000 + 350 + 300)
      expect(result.totalPrice).toBe(2862);
    });

    it('should handle options without installation requirement', () => {
      const optionNoInstall: ConfigurableProductSchema = {
        ...mockOption,
        installationRequired: false
      };

      const selectedOptions = [
        {
          option: optionNoInstall,
          selectedVariations: [],
          totalPrice: 100
        }
      ];

      const result = calculateConfigurationTotal(mockBaseProduct, selectedOptions);
      
      expect(result.installationPrice).toBe(300); // Base product requires installation
      expect(result.optionsPrice).toBe(100);
    });
  });

  describe('Bug Fix Verification', () => {
    it('should ensure totalPrice includes variation costs', () => {
      // This test verifies the core bug fix
      const optionWithVariations = {
        ...mockOption,
        price: '100.00', // Base price
        totalPrice: 150.00 // Should include variation costs
      };

      // Before fix: would use base price (100)
      // After fix: should use totalPrice (150)
      const price = getOptionPrice(optionWithVariations);
      expect(price).toBe(150);
    });

    it('should maintain consistency between OptionVariationPopup and ConfigurationSummary', () => {
      // Simulate OptionVariationPopup calculation
      const popupPrice = calculateOptionPrice(mockOption, mockVariations);
      
      // Simulate ConfigurationSummary calculation using getOptionPrice
      const summaryPrice = getOptionPrice(mockOption);
      
      // Both should be equal (150)
      expect(popupPrice).toBe(summaryPrice);
    });

    it('should handle edge cases correctly', () => {
      // Test with negative variation price (discount)
      const discountVariation: Variation[] = [
        { id: '1', name: 'Discount', price: '-10.00', type: 'radio', description: 'Discount' }
      ];
      
      const result = calculateOptionPrice(mockOption, discountVariation);
      expect(result).toBe(90); // 100 - 10
      
      // Test with zero base price but variation costs
      const zeroBaseOption = { ...mockOption, price: '0.00', totalPrice: 50 };
      const zeroBaseResult = getOptionPrice(zeroBaseOption);
      expect(zeroBaseResult).toBe(50);
    });
  });
});

describe('Integration Tests', () => {
  it('should maintain price consistency across all calculation methods', () => {
    const variations = mockVariations;
    const option = mockOption;
    
    // Method 1: Direct calculation
    const directPrice = calculateOptionPrice(option, variations);
    
    // Method 2: Using getOptionPrice (should match if totalPrice is set correctly)
    const utilityPrice = getOptionPrice(option);
    
    // Method 3: Validation expected price
    const validation = validatePriceCalculation(option, variations, directPrice);
    
    expect(directPrice).toBe(150);
    expect(utilityPrice).toBe(150);
    expect(validation.isValid).toBe(true);
  });

  it('should handle complex configuration scenarios', () => {
    const complexOptions = [
      {
        option: { ...mockOption, id: '1', price: '100.00', totalPrice: 150 },
        selectedVariations: mockVariations,
        totalPrice: 150
      },
      {
        option: { ...mockOption, id: '2', price: '200.00', totalPrice: 200 },
        selectedVariations: [],
        totalPrice: 200
      },
      {
        option: { ...mockOption, id: '3', price: '50.00', totalPrice: 75 },
        selectedVariations: [{ id: '1', name: 'Upgrade', price: '25.00', type: 'radio', description: 'Upgrade' }],
        totalPrice: 75
      }
    ];

    const result = calculateConfigurationTotal(mockBaseProduct, complexOptions);
    
    expect(result.optionsPrice).toBe(425); // 150 + 200 + 75
    expect(result.totalPrice).toBeGreaterThan(2000); // Should be substantial total
  });
});