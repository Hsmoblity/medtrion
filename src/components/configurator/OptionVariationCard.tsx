import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ConfigurableProductSchema } from 'lib/interfaces';
import { cn } from '../../lib/utils';
import OptionImage from './OptionImage';

// Variation interface
interface Variation {
  id: string;
  databaseId: number;
  name: string;
  price: number; // Price modifier (can be 0, positive, or negative)
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

interface OptionVariationCardProps {
  // Core Props
  variation: Variation;
  option: ConfigurableProductSchema;
  
  // Selection Props
  isSelected: boolean;
  selectionType: 'radio' | 'checkbox';
  disabled?: boolean;
  
  // Display Props
  variant?: 'default' | 'compact' | 'featured';
  size?: 'small' | 'medium' | 'large';
  showPrice?: boolean;
  showAttributes?: boolean;
  showImage?: boolean;
  showStockStatus?: boolean;
  
  // Interaction Props
  onSelect?: (variation: Variation) => void;
  onDeselect?: (variation: Variation) => void;
  onToggle?: (variation: Variation) => void;
  
  // Accessibility Props
  highContrast?: boolean;
  largeText?: boolean;
  reducedMotion?: boolean;
  screenReaderOptimized?: boolean;
  
  // Styling Props
  className?: string;
  selectedClassName?: string;
  disabledClassName?: string;
}

const OptionVariationCard: React.FC<OptionVariationCardProps> = ({
  variation,
  option,
  isSelected,
  selectionType,
  disabled = false,
  variant = 'default',
  size = 'medium',
  showPrice = true,
  showAttributes = true,
  showImage = true,
  showStockStatus = true,
  onSelect,
  onDeselect,
  onToggle,
  highContrast = false,
  largeText = false,
  reducedMotion = false,
  screenReaderOptimized = false,
  className = '',
  selectedClassName = '',
  disabledClassName = ''
}) => {
  // Internal state
  const [internalState, setInternalState] = useState({
    isHovered: false,
    isPressed: false,
    isFocused: false,
    imageError: false,
    imageLoaded: false
  });

  // Refs
  const cardRef = useRef<HTMLDivElement>(null);

  // Price formatting
  const formatVariationPrice = useCallback((price: number): string => {
    if (price === 0) return 'Included';
    if (price > 0) return `+$${price}`;
    return `-$${Math.abs(price)}`;
  }, []);

  const getTotalPrice = useCallback((optionPrice: number, variationPrice: number): number => {
    return optionPrice + variationPrice;
  }, []);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (!disabled && !reducedMotion) {
      setInternalState(prev => ({ ...prev, isHovered: true }));
    }
  }, [disabled, reducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (!disabled && !reducedMotion) {
      setInternalState(prev => ({ ...prev, isHovered: false }));
    }
  }, [disabled, reducedMotion]);

  const handleMouseDown = useCallback(() => {
    if (!disabled) {
      setInternalState(prev => ({ ...prev, isPressed: true }));
    }
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    if (!disabled) {
      setInternalState(prev => ({ ...prev, isPressed: false }));
    }
  }, [disabled]);

  const handleFocus = useCallback(() => {
    if (!disabled) {
      setInternalState(prev => ({ ...prev, isFocused: true }));
    }
  }, [disabled]);

  const handleBlur = useCallback(() => {
    if (!disabled) {
      setInternalState(prev => ({ ...prev, isFocused: false }));
    }
  }, [disabled]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    if (disabled) return;
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (onToggle) {
      onToggle(variation);
    } else if (isSelected && onDeselect) {
      onDeselect(variation);
    } else if (!isSelected && onSelect) {
      onSelect(variation);
    }
  }, [disabled, isSelected, onToggle, onSelect, onDeselect, variation]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event as any);
    }
  }, [handleClick]);

  const handleImageLoad = useCallback(() => {
    setInternalState(prev => ({ ...prev, imageLoaded: true }));
  }, []);

  const handleImageError = useCallback(() => {
    setInternalState(prev => ({ ...prev, imageError: true }));
  }, []);

  // CSS classes
  const cardClasses = useMemo(() => {
    return cn(
      'option-variation-card',
      'relative bg-white rounded-lg border-2 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'cursor-pointer',
      {
        // Selection states
        'border-blue-500 bg-blue-50': isSelected && !disabled,
        'border-gray-200 bg-white': !isSelected && !disabled,
        'border-gray-300 bg-gray-50': disabled,
        
        // Hover states
        'hover:border-gray-300 hover:shadow-md': !disabled && !isSelected,
        'hover:border-blue-600 hover:shadow-lg': !disabled && isSelected,
        
        // Focus states
        'ring-2 ring-blue-500 ring-offset-2': internalState.isFocused,
        
        // Pressed states
        'scale-95': internalState.isPressed,
        
        // High contrast
        'border-4 border-black': highContrast,
        
        // Reduced motion
        'transition-none': reducedMotion,
        
        // Custom classes
        [selectedClassName]: isSelected,
        [disabledClassName]: disabled,
      },
      {
        // Size variants
        'p-3': size === 'small',
        'p-4': size === 'medium',
        'p-6': size === 'large',
        
        // Variant styles
        'min-h-[120px]': variant === 'compact',
        'min-h-[180px]': variant === 'default',
        'min-h-[220px]': variant === 'featured',
      },
      className
    );
  }, [
    isSelected, disabled, internalState.isFocused, internalState.isPressed, 
    internalState.isHovered, highContrast, reducedMotion, size, variant,
    selectedClassName, disabledClassName, className
  ]);

  // ARIA attributes
  const ariaProps = useMemo(() => ({
    role: 'button',
    tabIndex: disabled ? -1 : 0,
    'aria-pressed': isSelected,
    'aria-disabled': disabled,
    'aria-label': `${variation.name}, ${formatVariationPrice(variation.price)}, ${isSelected ? 'selected' : 'not selected'}`,
    'aria-describedby': `variation-${variation.id}-description`
  }), [variation.name, variation.price, variation.id, isSelected, disabled, formatVariationPrice]);

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...ariaProps}
    >
      {/* Selection Status Indicator */}
      <div className="absolute top-2 right-2">
        {isSelected ? (
          <div className={`
            w-6 h-6 bg-blue-500 rounded-full 
            flex items-center justify-center text-white transform 
            transition-all duration-200 shadow-md
            ${reducedMotion ? 'transition-none' : 'scale-100 opacity-100'}
          `}>
            {selectionType === 'radio' ? (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ) : (
          <div className={`
            w-6 h-6 border-2 border-gray-300 rounded-full 
            flex items-center justify-center transform 
            transition-all duration-200 hover:border-gray-400
            ${reducedMotion ? 'transition-none' : 'scale-100 opacity-100'}
            ${selectionType === 'checkbox' ? 'rounded' : 'rounded-full'}
          `}>
            {selectionType === 'checkbox' && (
              <div className="w-2 h-2 bg-transparent rounded-sm"></div>
            )}
          </div>
        )}
      </div>

      {/* Stock Status Indicator */}
      {showStockStatus && variation.stockStatus && variation.stockStatus !== 'instock' && (
        <div className="absolute top-2 left-2">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${variation.stockStatus === 'outofstock' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
            }
          `}>
            {variation.stockStatus === 'outofstock' ? 'Out of Stock' : 'Backorder'}
          </div>
        </div>
      )}

      {/* Image Section */}
      {showImage && (
        <div className={`
          relative mb-3 rounded-md overflow-hidden
          ${variant === 'featured' ? 'h-32' : 'h-24'}
          ${variant === 'compact' ? 'h-16' : ''}
        `}>
          <OptionImage
            src={variation.image?.sourceUrl}
            alt={variation.image?.altText || variation.name}
            placeholderType="option"
            fill
            className="w-full h-full"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1">
        {/* Variation Name */}
        <h4 className={`
          font-semibold text-gray-900 mb-1 leading-tight
          ${largeText ? 'text-lg' : size === 'large' ? 'text-lg' : 'text-base'}
        `}>
          {variation.name}
        </h4>

        {/* Attributes */}
        {showAttributes && variation.attributes.length > 0 && (
          <p className={`
            text-gray-600 mb-2 leading-relaxed
            ${largeText ? 'text-base' : 'text-sm'}
          `}>
            {variation.attributes.map(attr => attr.value).join(', ')}
          </p>
        )}

        {/* SKU */}
        {variation.sku && (
          <p className="text-xs text-gray-500 mb-2">
            SKU: {variation.sku}
          </p>
        )}

        {/* Price */}
        {showPrice && (
          <div className={`
            font-bold text-blue-600
            ${largeText ? 'text-xl' : size === 'large' ? 'text-lg' : 'text-base'}
          `}>
            {formatVariationPrice(variation.price)}
          </div>
        )}
      </div>

      {/* Hidden description for screen readers */}
      <div id={`variation-${variation.id}-description`} className="sr-only">
        {variation.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
        {variation.stockStatus && variation.stockStatus !== 'instock' && 
          `, Stock status: ${variation.stockStatus}`
        }
      </div>
    </div>
  );
};

export default OptionVariationCard;
export type { Variation, OptionVariationCardProps };