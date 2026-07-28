import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ConfigurableProductSchema } from 'lib/interfaces';
import { useConfiguratorStore } from '../../stores/configuratorStore';
import OptionVariationCard, { Variation } from './OptionVariationCard';
import RichContent from '../RichContent';
import { parsePrice } from '../../lib/utils/priceUtils';
import { calculatePricePreview } from '../../lib/utils/price-calculations';

// Variation interface is now imported from OptionVariationCard

// Data validation and mapping functions
const validateVariationData = (variation: any): boolean => {
  return !!(
    variation &&
    variation.id &&
    variation.databaseId &&
    typeof variation.name === 'string' &&
    typeof variation.price === 'number'
  );
};

const determineStockStatus = (variation: any): 'instock' | 'outofstock' | 'onbackorder' => {
  if (variation.stockStatus) {
    return variation.stockStatus;
  }
  
  // Fallback logic based on other fields
  if (variation.stockQuantity !== undefined) {
    return variation.stockQuantity > 0 ? 'instock' : 'outofstock';
  }
  
  return 'instock'; // Default assumption
};

const validateAndMapVariations = (option: ConfigurableProductSchema): Variation[] => {
  if (!option.variations || !Array.isArray(option.variations)) {
    console.warn('OptionVariationPopup: No variations data found for option:', option.id);
    return [];
  }

  return option.variations.map((variation: any) => {
    // Validate required fields
    if (!variation.id || !variation.databaseId) {
      console.error('Invalid variation data:', variation);
      return null;
    }

    return {
      id: variation.id,
      databaseId: variation.databaseId,
      name: variation.name || 'Unnamed Variation',
      price: parsePrice(variation.price),
      sku: variation.sku || '',
      image: variation.image ? {
        sourceUrl: variation.image.sourceUrl || '',
        altText: variation.image.altText || variation.name || 'Variation image'
      } : undefined,
      attributes: variation.attributes || [],
      stockStatus: determineStockStatus(variation)
    };
  }).filter(Boolean) as Variation[]; // Remove null entries
};

interface OptionVariationPopupProps {
  option: ConfigurableProductSchema;
  isOpen: boolean;
  onClose: () => void;
  onAddToConfiguration: (option: ConfigurableProductSchema, variations?: Variation[], totalPrice?: number) => void;
  isAlreadySelected?: boolean;
  categoryId?: string; // Add categoryId to detect edit mode
  
  // NEW: Real data validation
  variations?: Variation[];  // Optional override for specific use cases
  onVariationDataError?: (error: Error) => void;  // Error handling
}

const OptionVariationPopup: React.FC<OptionVariationPopupProps> = ({
  option,
  isOpen,
  onClose,
  onAddToConfiguration,
  isAlreadySelected = false,
  categoryId,
  variations: overrideVariations,
  onVariationDataError
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Get configurator store to check current selections
  const { selectedOptions, isOptionSelected } = useConfiguratorStore();
  
  // Detect if we're in edit mode (option already configured)
  const isEditMode = useMemo(() => {
    if (!categoryId || !option.databaseId) return false;
    return isOptionSelected(option.databaseId, categoryId);
  }, [categoryId, option.databaseId, isOptionSelected]);
  
  // Get current variation selections if in edit mode
  const currentVariations = useMemo(() => {
    if (!isEditMode || !categoryId) return [];
    
    const categoryOptions = selectedOptions[categoryId] || [];
    const existingOption = categoryOptions.find(opt => opt.databaseId === option.databaseId);
    
    if (!existingOption || !existingOption.selectedVariations) return [];
    
    // Convert existing selections to our Variation format
    return existingOption.selectedVariations.map(v => ({
      id: v.id,
      databaseId: v.databaseId || 0,
      name: v.name,
      price: parsePrice(v.price),
      sku: v.sku || '',
      image: v.image,
      attributes: v.attributes || [],
      stockStatus: v.stockStatus || 'instock'
    })) as Variation[];
  }, [isEditMode, categoryId, selectedOptions, option.databaseId]);
  
  // Use real variations data instead of mock data
  const realVariations = useMemo(() => {
    try {
      // Use override variations if provided, otherwise use option variations
      const sourceVariations = overrideVariations || option.variations || [];
      return validateAndMapVariations({ ...option, variations: sourceVariations });
    } catch (error) {
      console.error('Error processing variation data:', error);
      onVariationDataError?.(error as Error);
      return [];
    }
  }, [option, overrideVariations, onVariationDataError]);

  const [selectedVariations, setSelectedVariations] = useState<Variation[]>([]);
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
    retry: (() => void) | null;
  }>({
    hasError: false,
    message: '',
    retry: null
  });
  
  // Initialize selected variations when popup opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && currentVariations.length > 0) {
        // In edit mode, pre-select current variations
        console.log('OptionVariationPopup: Initializing edit mode with current selections:', currentVariations);
        setSelectedVariations(currentVariations);
      } else {
        // In add mode, start with empty selection
        setSelectedVariations([]);
      }
    }
  }, [isOpen, isEditMode, currentVariations]);
  
  // Determine selection type from option data
  const selectionType = useMemo(() => {
    return option.variableType?.toLowerCase() === 'checkbox' ? 'checkbox' : 'radio';
  }, [option.variableType]);

  // Handle variation data errors
  const handleVariationDataError = useCallback((error: Error) => {
    console.error('Variation data error:', error);
    
    // Show user-friendly error message
    setErrorState({
      hasError: true,
      message: 'Unable to load variation options. Please try again.',
      retry: () => {
        // Retry loading variation data
        setErrorState({ hasError: false, message: '', retry: null });
      }
    });
  }, []);

  // Enhanced price calculation with better handling of variation types
  const priceCalculation = useMemo(() => {
    const basePrice = parsePrice(option.price || option.regularPrice);
    
    let variationsTotal = 0;
    
    // Handle different variation types
    if (selectionType === 'radio') {
      // Radio type: Base price + ONE selected variation price
      const selectedVariation = selectedVariations[0];
      if (selectedVariation) {
        variationsTotal = parsePrice(selectedVariation.price);
      }
    } else if (selectionType === 'checkbox') {
      // Checkbox type: Base price + ALL selected variation prices
      variationsTotal = selectedVariations.reduce((sum, variation) => {
        return sum + parsePrice(variation.price);
      }, 0);
    }
    
    const totalPrice = basePrice + variationsTotal;
    
    return {
      basePrice,
      variationsTotal,
      totalPrice,
      hasVariations: selectedVariations.length > 0
    };
  }, [option.price, option.regularPrice, selectedVariations, selectionType]);
  
  // Extract for easier use
  const { basePrice, variationsTotal, totalPrice, hasVariations } = priceCalculation;

  // Focus management and keyboard handling
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleVariationSelect = (variation: Variation) => {
    if (selectionType === 'radio') {
      // Radio selection - only one variation can be selected
      setSelectedVariations([variation]);
    } else {
      // Checkbox selection - multiple variations can be selected
      setSelectedVariations(prev => {
        const isSelected = prev.some(v => v.id === variation.id);
        if (isSelected) {
          return prev.filter(v => v.id !== variation.id);
        } else {
          return [...prev, variation];
        }
      });
    }
  };

  const handleAddToConfiguration = () => {
    // Log for debugging
    console.log('OptionVariationPopup: Adding option with calculated price:', {
      optionId: option.id,
      optionName: option.name,
      basePrice: basePrice,
      variationsTotal: variationsTotal,
      totalPrice: totalPrice,
      selectionType: selectionType,
      selectedVariations: selectedVariations.map(v => ({
        id: v.id,
        name: v.name,
        price: v.price
      }))
    });
    
    // Pass the calculated totalPrice along with option and variations
    onAddToConfiguration(option, selectedVariations, totalPrice);
    onClose();
  };

  const handleCancel = () => {
    setSelectedVariations([]);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      ref={modalRef}
      className={`
        fixed inset-0 bg-black flex items-center justify-center z-50 p-4
        transition-all duration-300 ease-out
        ${isOpen ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-0 backdrop-blur-none'}
      `}
      onClick={(e) => {
        if (e.target === modalRef.current) {
          onClose();
        }
      }}
    >
      {/* Phase 2: Enhanced Modal with sophisticated animations */}
      <div className={`
        bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto
        transition-all duration-500 ease-out transform
        ${isOpen 
          ? 'scale-100 opacity-100 translate-y-0 rotate-0' 
          : 'scale-95 opacity-0 translate-y-4 rotate-1'
        }
        animate-[slideInUp_0.5s_ease-out]
      `}>
        {/* Phase 2: Enhanced Header with gradient and better animations */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3 animate-[fadeIn_0.6s_ease-out]">
            <h2 className="text-2xl font-bold text-gray-900 transition-colors duration-300 hover:text-brand-dark">
              {option.name || option.title}
            </h2>
            {isEditMode && (
              <span className="px-3 py-1 bg-orange-100 text-brand-dark text-sm font-medium rounded-full animate-pulse border border-orange-200">
                Edit Mode
              </span>
            )}
            {/* Phase 2: Variable type indicator */}
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {selectionType === 'radio' ? 'Single Choice' : 'Multiple Choice'}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110 hover:rotate-90 p-2 rounded-full hover:bg-gray-100"
            aria-label="Close popup"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Phase 2: Enhanced Content with staggered animations */}
        <div className="p-6 animate-[fadeIn_0.7s_ease-out]">
          {/* Option Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Option Details</h3>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Base Price:</span> ${basePrice.toFixed(2)}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Type:</span> {option.optionType || 'Option'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Selection:</span> {selectionType === 'radio' ? 'Single Choice' : 'Multiple Choice'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <RichContent 
                  content={option.shortDescription || option.description || ''}
                  className="text-gray-700 prose prose-sm max-w-none"
                />
              </div>
            </div>
          </div>

          {/* Edit Mode Info */}
          {isEditMode && currentVariations.length > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-brand-dark mb-2">Current Selection</h3>
              <p className="text-gray-500 text-sm">
                Currently selected: {currentVariations.map(v => v.name).join(', ')}
              </p>
              <p className="text-brand-primary text-xs mt-1">
                Make your changes below and click &quot;Update Configuration&quot; to save.
              </p>
            </div>
          )}

          {/* Variations Section */}
          {errorState.hasError ? (
            <div className="mb-6 p-6 text-center bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Variations</h3>
                <p className="text-red-700 mb-4">{errorState.message}</p>
                <div className="space-x-3">
                  {errorState.retry && (
                    <button
                      onClick={errorState.retry}
                      className="px-6 py-3 bg-[#f7a236] text-white rounded-[35px] font-primary font-semibold hover:bg-[#3fa2a3] transition-all duration-300"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-[#f7a236] text-white rounded-[35px] font-primary font-semibold hover:bg-[#3fa2a3] transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : realVariations.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Variations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {realVariations.map((variation) => {
                  const isSelected = selectedVariations.some(v => v.id === variation.id);
                  
                  return (
                    <OptionVariationCard
                      key={variation.id}
                      variation={variation}
                      option={option}
                      isSelected={isSelected}
                      selectionType={selectionType}
                      onToggle={handleVariationSelect}
                      variant="compact"
                      size="medium"
                      showPrice={true}
                      showAttributes={true}
                      showImage={true}
                      showStockStatus={true}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-6 text-center bg-gray-50 rounded-lg">
              <div className="text-gray-500 mb-4">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Variations Available</h3>
                <p className="text-gray-600">
                  This option doesn&apos;t have any variations to choose from.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Price Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Price Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Base Option Price:</span>
                <span className="font-medium">${basePrice.toFixed(2)}</span>
              </div>
              {hasVariations && (
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Selected Variations {selectionType === 'radio' ? '(1)' : `(${selectedVariations.length})`}:
                  </span>
                  <span className="font-medium">
                    +${variationsTotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Option Price:</span>
                  <span className="font-bold text-lg text-brand-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToConfiguration}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium"
          >
            {isEditMode ? 'Update Configuration' : 'Add to Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionVariationPopup;