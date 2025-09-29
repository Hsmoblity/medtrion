import React, { useState, useEffect, useRef } from 'react';
import { ConfigurableProductSchema } from 'lib/interfaces';

// Variation interface for the popup
interface Variation {
  id: string;
  databaseId: number;
  name: string;
  price: number; // Price modifier
  sku: string;
  image?: {
    sourceUrl: string;
    altText: string;
  };
  attributes: Array<{
    id: string;
    name: string;
    value: string;
  }>;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
}

interface OptionVariationPopupProps {
  option: ConfigurableProductSchema;
  isOpen: boolean;
  onClose: () => void;
  onAddToConfiguration: (option: ConfigurableProductSchema, variations?: Variation[]) => void;
  isAlreadySelected?: boolean;
}

const OptionVariationPopup: React.FC<OptionVariationPopupProps> = ({
  option,
  isOpen,
  onClose,
  onAddToConfiguration,
  isAlreadySelected = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Mock variations data - in real implementation, this would come from the option data
  const [variations] = useState<Variation[]>([
    {
      id: 'var-1',
      databaseId: 101,
      name: 'Red Leather',
      price: 0,
      sku: 'SEAT-RED-001',
      attributes: [
        { id: 'color', name: 'Color', value: 'Red' },
        { id: 'material', name: 'Material', value: 'Leather' }
      ],
      stockStatus: 'instock'
    },
    {
      id: 'var-2',
      databaseId: 102,
      name: 'Blue Leather',
      price: 0,
      sku: 'SEAT-BLUE-001',
      attributes: [
        { id: 'color', name: 'Color', value: 'Blue' },
        { id: 'material', name: 'Material', value: 'Leather' }
      ],
      stockStatus: 'instock'
    },
    {
      id: 'var-3',
      databaseId: 103,
      name: 'Premium Black',
      price: 50,
      sku: 'SEAT-PREMIUM-001',
      attributes: [
        { id: 'color', name: 'Color', value: 'Black' },
        { id: 'material', name: 'Material', value: 'Premium Leather' }
      ],
      stockStatus: 'instock'
    }
  ]);

  const [selectedVariations, setSelectedVariations] = useState<Variation[]>([]);
  const [selectionType] = useState<'radio' | 'checkbox'>('radio'); // Default to radio for simplicity

  // Calculate total price
  const totalPrice = option.price + selectedVariations.reduce((sum, variation) => sum + variation.price, 0);

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
    onAddToConfiguration(option, selectedVariations);
    onClose();
  };

  const handleCancel = () => {
    setSelectedVariations([]);
    onClose();
  };

  if (!isOpen) return null;

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
          {variations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Variations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {variations.map((variation) => {
                  const isSelected = selectedVariations.some(v => v.id === variation.id);
                  
                  return (
                    <div
                      key={variation.id}
                      onClick={() => handleVariationSelect(variation)}
                      className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                    >
                      {/* Variation Image */}
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {variation.image ? (
                          <img
                            src={variation.image.sourceUrl}
                            alt={variation.image.altText}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Variation Info */}
                      <div className="text-center">
                        <h4 className="font-medium text-gray-900 mb-1">{variation.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {variation.attributes.map(attr => attr.value).join(', ')}
                        </p>
                        <p className="text-lg font-semibold text-blue-600">
                          {variation.price === 0 ? 'Included' : `+$${variation.price}`}
                        </p>
                        
                        {/* Selection Indicator */}
                        <div className="mt-2">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full mx-auto"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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