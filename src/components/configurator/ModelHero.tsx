import React, { useState } from 'react';
import Image from 'next/image';
import { ConfigurableProductSchema, FinancingOption, ConfigurationSummaryData } from '../../lib/interfaces/configurator';
import { parsePrice, formatPrice } from '../../lib/utils/priceUtils';
import { useConfiguratorStore } from '../../stores/configuratorStore';

interface ModelHeroProps {
  model: ConfigurableProductSchema;
  selectedOptionsCount?: number;
  totalPrice?: number;
  basePrice?: number;
  showFinancingBadge?: boolean;
  financingOption?: FinancingOption;
  loading?: boolean;
  error?: string;
  onImageError?: () => void;
  onPriceClick?: () => void;
  onFinancingClick?: () => void;
  
  // Enhanced User Flow Props
  configurationSummary?: ConfigurationSummaryData;
  showProgressIndicator?: boolean;
  showRealTimePrice?: boolean;
  onConfigurationClick?: () => void;
}

const ModelHero: React.FC<ModelHeroProps> = ({
  model,
  selectedOptionsCount = 0,
  totalPrice,
  basePrice,
  showFinancingBadge = false,
  financingOption,
  loading = false,
  error,
  onImageError,
  onPriceClick,
  onFinancingClick,
  // Enhanced User Flow Props
  configurationSummary,
  showProgressIndicator = true,
  showRealTimePrice = true,
  onConfigurationClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Enhanced User Flow Integration
  const { 
    selectedOptionsWithVariations, 
    configurationSummary: storeSummary,
    calculateTotalPrice 
  } = useConfiguratorStore();

  // Use enhanced data if provided, otherwise fall back to store data
  const enhancedSummary = configurationSummary || storeSummary;
  const enhancedSelectedOptions = selectedOptionsWithVariations;
  const enhancedTotalPrice = enhancedSummary?.totalPrice || totalPrice || calculateTotalPrice();
  const enhancedBasePrice = enhancedSummary?.basePrice || basePrice || parsePrice(model.price || model.regularPrice);
  const enhancedOptionsCount = enhancedSelectedOptions.length || selectedOptionsCount;

  // Handle image gallery (assuming model might have multiple images)
  const images = model.image ? [model.image] : [];
  const hasMultipleImages = images.length > 1;

  const handleImageError = () => {
    setImageError(true);
    onImageError?.();
  };

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const formatPriceDisplay = (price: number | string | undefined) => {
    const parsedPrice = parsePrice(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parsedPrice);
  };

  // Fix: Use proper null checking instead of truthy check for totalPrice
  // totalPrice could be 0 which is a valid price, so don't fallback in that case
  const currentPrice = totalPrice !== undefined ? totalPrice : parsePrice(model.regularPrice || model.price);
  const displayBasePrice = basePrice !== undefined ? basePrice : parsePrice(model.regularPrice || model.price);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
            <div className="flex gap-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading model</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery Section */}
          <div className="flex-1">
            <div className="relative group">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {!imageError && images[currentImageIndex] ? (
                  <Image
                    src={images[currentImageIndex].sourceUrl || '/public/Logo.png'}
                    alt={images[currentImageIndex].altText || model.name || 'Product image'}
                    fill
                    className="object-cover transition-opacity duration-300"
                    onError={handleImageError}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Image Navigation */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {hasMultipleImages && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.sourceUrl || '/public/Logo.png'}
                      alt={`${model.name} view ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information Section */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{model.name}</h1>
              
              {/* Feature Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {model.adaCompliant && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    ADA Compliant
                  </span>
                )}
                
                {model.installationRequired && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    Professional Installation
                  </span>
                )}

                {model.safetyRating && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Safety Rating: {model.safetyRating}
                  </span>
                )}

                {showFinancingBadge && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 012-2h2z" />
                    </svg>
                    Financing Available
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            {model.shortDescription && (
              <p className="text-gray-600 mb-6 leading-relaxed">
                {model.shortDescription}
              </p>
            )}

            {/* Phase 2: Enhanced Pricing Section with animations and real-time feedback */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`
                      text-2xl font-bold transition-all duration-500 ease-out relative
                      ${showRealTimePrice ? 'text-green-600 animate-[flash_0.6s_ease-out]' : 'text-gray-900'}
                    `}>
                      {formatPriceDisplay(showRealTimePrice ? enhancedTotalPrice : currentPrice)}
                      
                      {/* Phase 2: Live pricing indicator */}
                      {showRealTimePrice && (
                        <div className="absolute -top-2 -right-6">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </span>
                    {enhancedOptionsCount > 0 && enhancedTotalPrice && enhancedTotalPrice > enhancedBasePrice && (
                      <span className="text-sm text-gray-500 transition-all duration-300 animate-[slideInUp_0.4s_ease-out]">
                        (Base: {formatPriceDisplay(enhancedBasePrice)})
                      </span>
                    )}
                  </div>
                  
                  {enhancedOptionsCount > 0 ? (
                    <p className="text-sm text-gray-600 mt-1 transition-all duration-300 animate-[fadeIn_0.5s_ease-out]">
                      Includes {enhancedOptionsCount} selected option{enhancedOptionsCount !== 1 ? 's' : ''}
                      {showRealTimePrice && enhancedSelectedOptions.some(option => option.selectedVariations.length > 0) && (
                        <span className="ml-2 text-blue-600 animate-pulse">
                          with {enhancedSelectedOptions.reduce((sum, option) => sum + option.selectedVariations.length, 0)} variations
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{showRealTimePrice && (
                        <span className="inline-flex items-center space-x-1 text-xs text-green-600 animate-pulse">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span>Real-time pricing active</span>
                        </span>
                      )}
                      Base product price
                    </p>
                  )}
                </div>

                {(onPriceClick || onConfigurationClick) && (
                  <button
                    onClick={onConfigurationClick || onPriceClick}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {onConfigurationClick ? 'View Configuration' : 'View Breakdown'}
                  </button>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Base Product</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPriceDisplay(showRealTimePrice ? enhancedBasePrice : displayBasePrice)}
                    </span>
                  </div>
                  {(enhancedOptionsCount > 0 && enhancedSummary?.optionsPrice) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Selected Options</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPriceDisplay(enhancedSummary.optionsPrice)}
                      </span>
                    </div>
                  )}
                  {enhancedSummary?.installationPrice && enhancedSummary.installationPrice > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Installation</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPriceDisplay(enhancedSummary.installationPrice)}
                      </span>
                    </div>
                  )}
                  {enhancedSummary?.shippingPrice && enhancedSummary.shippingPrice > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Shipping</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPriceDisplay(enhancedSummary.shippingPrice)}
                      </span>
                    </div>
                  )}
                  {enhancedSummary?.taxAmount && enhancedSummary.taxAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tax</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPriceDisplay(enhancedSummary.taxAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPriceDisplay(showRealTimePrice ? enhancedTotalPrice : currentPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financing Information */}
              {financingOption && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-900">Financing Available</p>
                      <p className="text-lg font-bold text-purple-800">
                        ${financingOption.monthlyPayment}/month
                      </p>
                      <p className="text-xs text-purple-600">
                        {financingOption.termMonths} months at {financingOption.interestRate}% APR
                      </p>
                    </div>
                    {onFinancingClick && (
                      <button
                        onClick={onFinancingClick}
                        className="text-purple-700 hover:text-purple-900 text-sm font-medium"
                      >
                        Learn More
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {showProgressIndicator && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-900">Configuration Progress</h4>
                    <span className="text-sm text-blue-600">
                      {enhancedOptionsCount} option{enhancedOptionsCount !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((enhancedOptionsCount / 5) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {enhancedOptionsCount === 0 
                      ? 'Start by selecting options from the categories below'
                      : enhancedOptionsCount < 3
                      ? 'Great start! Consider adding more options for a complete configuration'
                      : enhancedOptionsCount < 5
                      ? 'Almost there! Add a few more options to complete your configuration'
                      : 'Excellent! Your configuration is complete and ready for purchase'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelHero;