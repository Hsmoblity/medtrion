import React, { useState } from 'react';
import Image from 'next/image';
import { ConfigurableProductSchema, FinancingOption } from '../../lib/interfaces/configurator';

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
  onFinancingClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const formatPrice = (price: number | string | undefined) => {
    if (!price) return '$0';
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, '')) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const currentPrice = totalPrice || parseFloat(model.regularPrice || '0');
  const displayBasePrice = basePrice || parseFloat(model.regularPrice || '0');

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

            {/* Pricing Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(currentPrice)}
                    </span>
                    {selectedOptionsCount > 0 && totalPrice && totalPrice > displayBasePrice && (
                      <span className="text-sm text-gray-500">
                        (Base: {formatPrice(displayBasePrice)})
                      </span>
                    )}
                  </div>
                  
                  {selectedOptionsCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Includes {selectedOptionsCount} selected option{selectedOptionsCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {onPriceClick && (
                  <button
                    onClick={onPriceClick}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Breakdown
                  </button>
                )}
              </div>

              {/* Financing Information */}
              {financingOption && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelHero;