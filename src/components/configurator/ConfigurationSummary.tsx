import React, { useState } from 'react';
import { useConfiguratorStore } from '../../stores/configuratorStore';
import { ConfigurableProductSchema } from '../../lib/interfaces/configurator';
import AnimatedNumber from './AnimatedNumber';
import { PrimaryButton } from '../ui';

interface ConfigurationSummaryProps {
  loading?: boolean;
  error?: string;
  className?: string;
  onEditConfiguration?: () => void;
  onSaveConfiguration?: () => void;
  onShareConfiguration?: () => void;
  onAddToCart?: () => void;
  onPrintSummary?: () => void;
}

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
  loading = false,
  error,
  className = '',
  onEditConfiguration,
  onSaveConfiguration,
  onShareConfiguration,
  onAddToCart,
  onPrintSummary
}) => {
  const { model: baseModel, selectedOptions: selectedOptionsMap, summary, previousSummary } = useConfiguratorStore();
  const selectedOptions = Object.values(selectedOptionsMap).flat();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Group options by category
  const groupedOptions = selectedOptions.reduce((acc, option) => {
    const category = option.optionType || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  }, {} as Record<string, ConfigurableProductSchema[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md ${className}`}>
        <div className="p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-3/4"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md ${className}`}>
        <div className="p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading configuration</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!baseModel) {
    return null; // or a loading/error state
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuration Summary</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review your selections before adding to cart
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {onPrintSummary && (
              <button
                onClick={onPrintSummary}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            )}
            {onEditConfiguration && (
              <button
                onClick={onEditConfiguration}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Configuration
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Base Model Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Base Model</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              {baseModel.image && (
                <div className="flex-shrink-0">
                  <img
                    src={baseModel.image.sourceUrl}
                    alt={baseModel.image.altText || baseModel.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{baseModel.name}</h3>
                {baseModel.shortDescription && (
                  <p className="text-sm text-gray-600 mt-1">{baseModel.shortDescription}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(summary.basePrice)}
                  </span>
                  {baseModel.adaCompliant && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ADA Compliant
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Options by Category */}
        {Object.keys(groupedOptions).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Options</h2>
            <div className="space-y-4">
              {Object.entries(groupedOptions).map(([category, options]) => {
                const isExpanded = expandedCategories.has(category);
                const categoryTotal = options.reduce((sum, option) => {
                  const price = parseFloat(option.regularPrice || '0');
                  return sum + price;
                }, 0);

                return (
                  <div key={category} className="bg-gray-50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg
                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? 'transform rotate-90' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                          <h3 className="ml-2 text-base font-medium text-gray-900">
                            {category} ({options.length})
                          </h3>
                        </div>
                        <span className="text-base font-semibold text-gray-900">
                          {formatCurrency(categoryTotal)}
                        </span>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 pb-3">
                        <div className="space-y-2">
                          {options.map((option, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{option.name}</h4>
                                {option.shortDescription && (
                                  <p className="text-xs text-gray-600 mt-1">{option.shortDescription}</p>
                                )}
                                <div className="flex items-center mt-1 space-x-2">
                                  {option.installationRequired && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      Installation Required
                                    </span>
                                  )}
                                  {option.adaCompliant && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      ADA Compliant
                                    </span>
                                  )}
                                  {option.safetyRating && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Safety: {option.safetyRating}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(parseFloat(option.regularPrice || '0'))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="mb-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Base Model</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(summary.basePrice)}
              </span>
            </div>
            
            {summary.optionsTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Options</span>
                <AnimatedNumber
                  from={previousSummary?.optionsTotal || 0}
                  to={summary.optionsTotal}
                  prefix="$"
                  className="text-sm font-medium text-gray-900"
                />
              </div>
            )}
            
            {summary.installationCost > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Installation</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(summary.installationCost)}
                </span>
              </div>
            )}
            
            {summary.shippingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(summary.shippingCost)}
                </span>
              </div>
            )}
            
            {summary.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax</span>
                 <AnimatedNumber
                  from={previousSummary?.taxAmount || 0}
                  to={summary.taxAmount}
                  prefix="$"
                  className="text-sm font-medium text-gray-900"
                />
              </div>
            )}
            
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <AnimatedNumber
                  from={previousSummary?.grandTotal || 0}
                  to={summary.grandTotal}
                  prefix="$"
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financing & Insurance Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {summary.financingOptions && summary.financingOptions.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-purple-900 mb-2">Financing</h3>
              {/* ... financing details ... */}
            </div>
          )}

          {summary.insuranceEstimate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-blue-900 mb-2">Insurance</h3>
              {/* ... insurance details ... */}
            </div>
          )}
        </div>

        {/* Delivery Information */}
        {summary.estimatedDelivery && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM8 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9.414l-2 2H19a1 1 0 100-2v-5a1 1 0 10-2 0v5h-5.414l2-2H19a1 1 0 000-2H9.414l2-2H19a1 1 0 100-2H8z" />
              </svg>
              <div>
                <h3 className="text-base font-semibold text-green-900">Delivery Estimate</h3>
                <p className="text-sm text-green-800">{summary.estimatedDelivery}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <PrimaryButton
            onClick={onAddToCart}
            className="flex-1"
          >
            Add to Cart
          </PrimaryButton>
          
          <div className="flex gap-3">
            {onSaveConfiguration && (
              <button
                onClick={onSaveConfiguration}
                className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Save
              </button>
            )}
            
            {onShareConfiguration && (
              <button
                onClick={onShareConfiguration}
                className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationSummary;
