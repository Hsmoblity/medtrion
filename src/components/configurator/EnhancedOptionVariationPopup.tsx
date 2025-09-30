import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useConfiguratorStore } from '../../stores/configuratorStore';
import OptionVariationCard, { Variation } from './OptionVariationCard';
import RichContent from '../RichContent';
import { parsePrice } from '../../lib/utils/priceUtils';
import { calculatePricePreview } from '../../lib/utils/price-calculations';

/**
 * Enhanced OptionVariationPopup that integrates with the new store state management
 * This component uses the optionPopup state from the configurator store
 */
const EnhancedOptionVariationPopup: React.FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Get state and actions from the enhanced store
  const {
    optionPopup,
    closeOptionPopup,
    addToConfiguration,
    selectVariation,
    deselectVariation,
    calculateOptionPrice
  } = useConfiguratorStore();

  const [tempSelections, setTempSelections] = useState<Variation[]>([]);
  const [pricePreview, setPricePreview] = useState(0);

  // Initialize temp selections when popup opens
  useEffect(() => {
    if (optionPopup.isOpen && optionPopup.selectedOption) {
      setTempSelections(optionPopup.tempSelections);
      calculatePricePreview();
    }
  }, [optionPopup.isOpen, optionPopup.selectedOption, optionPopup.tempSelections]);

  // Calculate price preview using the enhanced utility
  const calculatePricePreview = useCallback(() => {
    if (!optionPopup.selectedOption) return;
    
    const preview = calculatePricePreview(optionPopup.selectedOption, tempSelections);
    setPricePreview(preview.totalPrice);
  }, [optionPopup.selectedOption, tempSelections]);

  useEffect(() => {
    calculatePricePreview();
  }, [calculatePricePreview]);

  // Handle variation selection
  const handleVariationToggle = (variation: Variation) => {
    const isSelected = tempSelections.some(v => v.id === variation.id);
    
    if (optionPopup.selectionType === 'radio') {
      // Radio selection - only one variation allowed
      setTempSelections(isSelected ? [] : [variation]);
    } else {
      // Checkbox selection - multiple variations allowed
      if (isSelected) {
        setTempSelections(prev => prev.filter(v => v.id !== variation.id));
      } else {
        setTempSelections(prev => [...prev, variation]);
      }
    }
  };

  // Handle add to configuration
  const handleAddToConfiguration = () => {
    if (optionPopup.selectedOption && tempSelections.length > 0) {
      addToConfiguration(optionPopup.selectedOption, tempSelections);
      closeOptionPopup();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    closeOptionPopup();
  };

  // Focus management and keyboard handling
  useEffect(() => {
    if (optionPopup.isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [optionPopup.isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && optionPopup.isOpen) {
        closeOptionPopup();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [optionPopup.isOpen, closeOptionPopup]);

  if (!optionPopup.isOpen || !optionPopup.selectedOption) {
    return null;
  }

  const { selectedOption } = optionPopup;
  const basePrice = parsePrice(selectedOption.price || selectedOption.regularPrice);
  const variationsTotal = tempSelections.reduce((sum, v) => sum + parsePrice(v.price), 0);

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === modalRef.current) {
          closeOptionPopup();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedOption.name || selectedOption.title}
            </h2>
            {optionPopup.isAlreadyInConfiguration && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Edit Mode
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            onClick={handleCancel}
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
                  <span className="font-medium">Base Price:</span> ${basePrice.toFixed(2)}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Type:</span> {selectedOption.optionType || 'Option'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Selection:</span> {optionPopup.selectionType === 'radio' ? 'Single Choice' : 'Multiple Choice'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <RichContent 
                  content={selectedOption.shortDescription || selectedOption.description || ''}
                  className="text-gray-700 prose prose-sm max-w-none"
                />
              </div>
            </div>
          </div>

          {/* Edit Mode Info */}
          {optionPopup.isAlreadyInConfiguration && optionPopup.selectedVariations.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Current Selection</h3>
              <p className="text-blue-700 text-sm">
                Currently selected: {optionPopup.selectedVariations.map(v => v.name).join(', ')}
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Make your changes below and click &quot;Update Configuration&quot; to save.
              </p>
            </div>
          )}

          {/* Variations Section */}
          {selectedOption.variations && selectedOption.variations.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Variations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedOption.variations.map((variation) => {
                  const isSelected = tempSelections.some(v => v.id === variation.id);
                  
                  return (
                    <OptionVariationCard
                      key={variation.id}
                      variation={variation}
                      option={selectedOption}
                      isSelected={isSelected}
                      selectionType={optionPopup.selectionType}
                      onToggle={() => handleVariationToggle(variation)}
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
                onClick={handleCancel}
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
                <span className="font-medium">${basePrice.toFixed(2)}</span>
              </div>
              {tempSelections.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Selected Variations {optionPopup.selectionType === 'radio' ? '(1)' : `(${tempSelections.length})`}:
                  </span>
                  <span className="font-medium">
                    +${variationsTotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Option Price:</span>
                  <span className="font-bold text-lg text-blue-600">${pricePreview.toFixed(2)}</span>
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
            disabled={tempSelections.length === 0}
          >
            {optionPopup.isAlreadyInConfiguration ? 'Update Configuration' : 'Add to Configuration'} 
            (${pricePreview.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOptionVariationPopup;
