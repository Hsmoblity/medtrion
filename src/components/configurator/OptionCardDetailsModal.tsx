import React, { useEffect, useRef } from 'react';
import { ConfigurableProductSchema, FinancingOption, InsuranceEstimate } from 'lib/interfaces';

interface OptionCardDetailsModalProps {
  option: ConfigurableProductSchema;
  isOpen: boolean;
  onClose: () => void;
  financingOptions?: FinancingOption[];
  insuranceEstimate?: InsuranceEstimate;
}

const OptionCardDetailsModal: React.FC<OptionCardDetailsModalProps> = ({
  option,
  isOpen,
  onClose,
  financingOptions = [],
  insuranceEstimate
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Trap focus within modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements?.[0] as HTMLElement;
          const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    } else {
      document.body.style.overflow = 'unset';
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

  if (!isOpen) return null;

  const formatPrice = (price: number | string | undefined): string => {
    if (!price) return '$0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toLocaleString()}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 
              id="modal-title"
              className="text-2xl font-bold text-gray-900 leading-relaxed"
            >
              {option.name || option.title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Image */}
            {(option.image?.sourceUrl || option.featuredImage) && (
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={option.image?.sourceUrl || option.featuredImage}
                  alt={option.image?.altText || `${option.name || option.title} option`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 font-medium">Price:</span>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(option.price)}
                  </p>
                </div>
                
                {option.sku && (
                  <div>
                    <span className="text-sm text-gray-600 font-medium">SKU:</span>
                    <p className="text-lg text-gray-900">{option.sku}</p>
                  </div>
                )}
                
                {option.warrantyPeriod && (
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Warranty:</span>
                    <p className="text-lg text-gray-900">{option.warrantyPeriod} months</p>
                  </div>
                )}
                
                {option.weightCapacity && (
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Weight Capacity:</span>
                    <p className="text-lg text-gray-900">{option.weightCapacity} lbs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div 
                id="modal-description"
                className="text-gray-700 leading-relaxed"
              >
                {option.shortDescription || option.description}
              </div>
            </div>

            {/* Safety and Compliance */}
            {(option.safetyRating || option.adaCompliant) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Safety & Compliance</h3>
                <div className="flex flex-wrap gap-3">
                  {option.adaCompliant && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      ADA Compliant
                    </span>
                  )}
                  
                  {option.safetyRating && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Safety Rating: {option.safetyRating}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Installation Information */}
            {(option.installationRequired || option.installationTime) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Installation</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Professional Installation Required</p>
                      {option.installationTime && (
                        <p className="text-sm text-yellow-700 mt-1">
                          Estimated installation time: {option.installationTime} hours
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financing Options */}
            {financingOptions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financing Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {financingOptions.slice(0, 2).map((financing) => (
                    <div key={financing.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900">{financing.name}</h4>
                      <p className="text-2xl font-bold text-blue-600 my-2">
                        ${financing.monthlyPayment}/mo
                      </p>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>Term: {financing.termMonths} months</p>
                        <p>APR: {(financing.interestRate * 100).toFixed(1)}%</p>
                        {financing.downPayment > 0 && (
                          <p>Down Payment: ${financing.downPayment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance Information */}
            {insuranceEstimate && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Coverage</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-green-600 font-medium">Estimated Coverage:</span>
                      <p className="text-xl font-bold text-green-700">
                        ${insuranceEstimate.estimatedCoverage}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600 font-medium">Your Cost:</span>
                      <p className="text-xl font-bold text-green-700">
                        ${insuranceEstimate.outOfPocketCost}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-green-600 font-medium">Coverage Types:</span>
                    <p className="text-sm text-green-700">
                      {insuranceEstimate.coverageTypes.join(', ')}
                    </p>
                  </div>
                  {insuranceEstimate.requiresPreApproval && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                      *Pre-approval may be required
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionCardDetailsModal;