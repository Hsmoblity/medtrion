import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ConfigurableProductSchema } from 'lib/interfaces';
import OptionVariationCard, { Variation } from './OptionVariationCard';

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
      price: parseFloat(variation.price || '0'),
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
  onAddToConfiguration: (option: ConfigurableProductSchema, variations?: Variation[]) => void;
  isAlreadySelected?: boolean;
  
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
  variations: overrideVariations,
  onVariationDataError
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Debug logging
  console.log('OptionVariationPopup render:', {
    optionId: option.id,
    optionType: option.type,
    isOpen,
    hasVariations: option.variations?.length > 0,
    variations: option.variations
  });
  
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

  // Calculate total price with real variation data
  const totalPrice = useMemo(() => {
    const basePrice = parseFloat(option.price?.toString() || '0');
    const variationPrice = selectedVariations.reduce((sum, variation) => {
      return sum + (variation.price || 0);
    }, 0);
    return basePrice + variationPrice;
  }, [option.price, selectedVariations]);

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
    // Debug logging
    console.log('Add to Configuration clicked:', {
      optionId: option.id,
      optionName: option.name || option.title,
      selectedVariations: selectedVariations.map(v => ({ id: v.id, name: v.name, price: v.price })),
      selectedVariationsCount: selectedVariations.length,
      totalPrice: totalPrice
    });
    
    onAddToConfiguration(option, selectedVariations);
    onClose();
  };

  const handleCancel = () => {
    setSelectedVariations([]);
    onClose();
  };

  if (!isOpen) {
    console.log('Popup not open, returning null');
    return null;
  }

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === modalRef.current) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {option.name || option.title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close popup"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Option Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Option Details</h3>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Base Price:</span> ${option.price}
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
                <div 
                  className="text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: option.shortDescription || option.description || '' 
                  }}
                />
              </div>
            </div>
          </div>

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
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
                  This option doesn't have any variations to choose from.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <span className="font-medium">${option.price}</span>
              </div>
              {selectedVariations.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Selected Variations:</span>
                  <span className="font-medium">
                    +${selectedVariations.reduce((sum, v) => sum + v.price, 0)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Option Price:</span>
                  <span className="font-bold text-lg text-blue-600">${totalPrice}</span>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isAlreadySelected ? 'Update Configuration' : 'Add to Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionVariationPopup;