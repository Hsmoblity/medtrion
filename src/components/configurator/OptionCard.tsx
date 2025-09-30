import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ConfigurableProductSchema, CompatibilityIssue, FinancingOption, InsuranceEstimate } from 'lib/interfaces';
import { useConfiguratorStore } from 'stores/configuratorStore';
import { PrimaryButton } from 'components/ui';
import OptionCardDetailsModal from './OptionCardDetailsModal';
import OptionVariationPopup from './OptionVariationPopup';
import OptionImage from './OptionImage';
import RichContent from '../RichContent';
import styles from './OptionCard.module.css';
import { cn } from '../../lib/utils';

interface OptionCardProps {
  // Required Props
  option: ConfigurableProductSchema;
  
  // Configuration Props
  categoryId?: string;
  baseModelId?: number;
  isSelected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  
  // Edit Session Props (ALIGNED WITH STANDARDIZED CART EDIT FLOW)
  editSessionId?: string;
  isEditMode?: boolean;
  originallySelected?: boolean;
  hasChanged?: boolean;
  cartItemId?: string;
  
  // Display Props
  variant?: 'default' | 'compact' | 'featured' | 'accessibility' | 'edit-mode';
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  showDetails?: boolean;
  showPrice?: boolean;
  showFinancing?: boolean;
  showInsurance?: boolean;
  showCompatibility?: boolean;
  showInstallation?: boolean;
  showSafety?: boolean;
  showEditStatus?: boolean;
  
  // Accessibility Props
  highContrast?: boolean;
  largeText?: boolean;
  reducedMotion?: boolean;
  screenReaderOptimized?: boolean;
  
  // Interaction Props
  allowQuickAdd?: boolean;
  allowComparison?: boolean;
  allowSaving?: boolean;
  
  // Data Props
  compatibilityIssues?: CompatibilityIssue[];
  financingOptions?: FinancingOption[];
  insuranceEstimate?: InsuranceEstimate;
  
  // Event Handlers
  onToggle?: (option: ConfigurableProductSchema, categoryId?: string) => void;
  onSelect?: (option: ConfigurableProductSchema, categoryId?: string) => void;
  onDeselect?: (option: ConfigurableProductSchema, categoryId?: string) => void;
  onViewDetails?: (option: ConfigurableProductSchema) => void;
  onQuickAdd?: (option: ConfigurableProductSchema) => void;
  onCompare?: (option: ConfigurableProductSchema) => void;
  onSave?: (option: ConfigurableProductSchema) => void;
  onCheckCompatibility?: (option: ConfigurableProductSchema) => Promise<CompatibilityIssue[]>;
  onCalculateFinancing?: (option: ConfigurableProductSchema) => Promise<FinancingOption[]>;
  onCheckInsurance?: (option: ConfigurableProductSchema) => Promise<InsuranceEstimate>;
  onError?: (option: ConfigurableProductSchema, error: Error) => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  categoryId = '',
  baseModelId,
  isSelected: propIsSelected = false,
  disabled = false,
  loading = false,
  className = '',
  variant = 'default',
  size = 'medium',
  showDetails = true,
  showPrice = true,
  showFinancing = true,
  showInsurance = true,
  showCompatibility = true,
  showInstallation = true,
  showSafety = true,
  highContrast = false,
  largeText = false,
  reducedMotion = false,
  screenReaderOptimized = false,
  allowQuickAdd = true,
  allowComparison = true,
  allowSaving = true,
  compatibilityIssues = [],
  financingOptions = [],
  insuranceEstimate,
  onToggle,
  onSelect,
  onDeselect,
  onViewDetails,
  onQuickAdd,
  onCompare,
  onSave,
  onCheckCompatibility,
  onCalculateFinancing,
  onCheckInsurance,
  onError
}) => {
  // Internal component state
  const [internalState, setInternalState] = useState({
    isHovered: false,
    isPressed: false,
    isFocused: false,
    detailsVisible: false,
    variationPopupVisible: false,
    compatibilityChecking: false,
    financingCalculating: false,
    insuranceChecking: false,
    priceUpdated: false
  });

  // Refs
  const cardRef = useRef<HTMLDivElement>(null);

  // Global configurator state (aligned with ModelConfigurator store structure)
  const {
    model,
    categories,
    selectedOptions,
    compatibilityIssues: storeCompatibilityIssues,
    summary,
    addOption,
    removeOption,
    checkCompatibility,
    isOptionSelected,
    getOptionCompatibilityIssues
  } = useConfiguratorStore();

  // Computed values
  const isSelected = useMemo(() => {
    return isOptionSelected(option.databaseId || 0, categoryId) || propIsSelected;
  }, [isOptionSelected, option.databaseId, categoryId, propIsSelected]);

  const compatibilityStatus = useMemo(() => {
    const issues = getOptionCompatibilityIssues(option.databaseId || 0);
    const propIssues = compatibilityIssues || [];
    const allIssues = [...issues, ...propIssues];

    if (allIssues.some(issue => issue.rule.severity === 'ERROR')) {
      return 'error';
    }
    if (allIssues.some(issue => issue.rule.severity === 'WARNING')) {
      return 'warning';
    }
    if (allIssues.some(issue => issue.rule.severity === 'INFO')) {
      return 'info';
    }
    return 'ok';
  }, [getOptionCompatibilityIssues, option.databaseId, compatibilityIssues]);

  const hasCompatibilityIssues = useMemo(() => {
    return compatibilityStatus !== 'ok';
  }, [compatibilityStatus]);

  const cardClasses = useMemo(() => {
    return cn(
      'option-card', // Base semantic class
      styles.optionCard,
      'bg-white rounded-lg shadow-md border-2 border-gray-200 p-6',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'w-full h-auto min-w-0 max-w-full flex-shrink-0', // Ensure responsive sizing and prevent shrinking
      className, // Include passed className
      {
        [styles.selected]: isSelected,
        [styles.compatibilityWarning]: compatibilityStatus === 'warning',
        [styles.compatibilityError]: compatibilityStatus === 'error',
        [styles.compatibilityInfo]: compatibilityStatus === 'info',
        [styles.disabled]: disabled,
        [styles.loading]: loading,
        [styles.priceUpdated]: internalState.priceUpdated,
        'border-4 border-black': highContrast,
        'transition-none': reducedMotion,
        'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200': isSelected && !disabled,
        'option-card-selected': isSelected,
        'option-card-disabled': disabled,
        'option-card-loading': loading,
      },
      {
        'min-h-[160px] p-4': variant === 'compact' || size === 'small',
        'min-h-[260px] p-8': variant === 'featured' || size === 'large',
        'min-h-[300px] p-10': size === 'extra-large',
        'min-h-[200px] p-6': size === 'medium',
      }
    );
  }, [isSelected, disabled, loading, compatibilityStatus, highContrast, reducedMotion, variant, size, internalState.priceUpdated, className]);

  // Event handlers
  const handleClick = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (disabled || loading) return;
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Check if option has variations (VARIABLE type)
    if (option.type === 'VARIABLE' && option.variations && option.variations.length > 0) {
      setInternalState(prev => ({ ...prev, variationPopupVisible: true }));
      return;
    }
    
    try {
      // Check compatibility before selection
      if (onCheckCompatibility && !isSelected) {
        setInternalState(prev => ({ ...prev, compatibilityChecking: true }));
        const issues = await onCheckCompatibility(option);
        
        if (issues.some(issue => issue.rule.severity === 'ERROR')) {
          onError?.(option, new Error('Compatibility conflict detected'));
          return;
        }
      }
      
      // Toggle selection for SIMPLE options
      if (isSelected) {
        removeOption(option.databaseId || 0, categoryId);
        onDeselect?.(option, categoryId);
      } else {
        addOption(option, categoryId);
        onSelect?.(option, categoryId);
      }
      
      // Emit toggle event
      onToggle?.(option, categoryId);
      
      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'option_toggle', {
          option_id: option.databaseId,
          option_name: option.name || option.title,
          category_id: categoryId,
          is_selected: !isSelected
        });
      }
      
    } catch (error) {
      console.error('Option toggle failed:', error);
      onError?.(option, error as Error);
    } finally {
      setInternalState(prev => ({ ...prev, compatibilityChecking: false }));
    }
  }, [
    disabled, loading, isSelected, option, categoryId, 
    onCheckCompatibility, onError, onDeselect, onSelect, onToggle,
    addOption, removeOption
  ]);

  const handleViewDetails = useCallback(() => {
    setInternalState(prev => ({ ...prev, detailsVisible: true }));
    onViewDetails?.(option);
  }, [option, onViewDetails]);

  const handleViewVariations = useCallback(() => {
    setInternalState(prev => ({ ...prev, variationPopupVisible: true }));
  }, []);

  const handleCloseVariationPopup = useCallback(() => {
    setInternalState(prev => ({ ...prev, variationPopupVisible: false }));
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleClick(event as any);
        break;
      case 'Escape':
        if (internalState.detailsVisible) {
          setInternalState(prev => ({ ...prev, detailsVisible: false }));
        }
        break;
      case 'd':
      case 'D':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleViewDetails();
        }
        break;
    }
  }, [handleClick, internalState.detailsVisible, handleViewDetails]);

  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setInternalState(prev => ({ ...prev, isHovered: true }));
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setInternalState(prev => ({ ...prev, isHovered: false, isPressed: false }));
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!disabled) {
      setInternalState(prev => ({ ...prev, isPressed: true }));
    }
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setInternalState(prev => ({ ...prev, isPressed: false }));
  }, []);

  const handleFocus = useCallback(() => {
    setInternalState(prev => ({ ...prev, isFocused: true }));
  }, []);

  const handleBlur = useCallback(() => {
    setInternalState(prev => ({ ...prev, isFocused: false }));
  }, []);

  // Accessibility announcements
  useEffect(() => {
    if (isSelected && typeof window !== 'undefined') {
      const announcement = `${option.name || option.title} selected for ${categoryId || 'configuration'}`;
      
      // Create or update live region for screen reader announcements
      let liveRegion = document.getElementById('option-announcements');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'option-announcements';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
      }
      
      liveRegion.textContent = announcement;
      
      // Clear announcement after a delay
      setTimeout(() => {
        if (liveRegion) liveRegion.textContent = '';
      }, 1000);
    }
  }, [isSelected, option.name, option.title, categoryId]);

  // Utility functions
  const formatPrice = (price: number | string | undefined): string => {
    if (!price) return '$0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toLocaleString()}`;
  };

  // ARIA props for the card container
  const cardAriaProps = useMemo(() => ({
    'aria-describedby': `${option.databaseId}-description ${option.databaseId}-price`,
    'aria-label': `${option.name || option.title} option card, ${formatPrice(option.price)}${
      option.installationRequired ? ', installation required' : ''
    }${
      option.adaCompliant ? ', ADA compliant' : ''
    }${
      hasCompatibilityIssues ? ', has compatibility warnings' : ''
    }${
      isSelected ? ', currently selected' : ', not selected'
    }`
  }), [
    option, hasCompatibilityIssues, isSelected
  ]);

  return (
    <>
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
        role="article"
        {...cardAriaProps}
      >
        {/* Selection Status Indicator */}
        <div className="absolute top-4 right-4">
          {isSelected ? (
            <div className={`
              w-8 h-8 bg-green-600 rounded-full 
              flex items-center justify-center text-white transform 
              transition-transform duration-200 shadow-lg
              ${reducedMotion ? 'transition-none' : 'scale-100 opacity-100'}
            `}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className={`
              w-8 h-8 bg-gray-200 rounded-full 
              flex items-center justify-center text-gray-500 transform 
              transition-all duration-200 hover:bg-gray-300
              ${reducedMotion ? 'transition-none' : 'scale-100 opacity-100'}
            `}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Compatibility Warning */}
        {hasCompatibilityIssues && showCompatibility && (
          <div className="absolute top-4 left-4">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* Image Section */}
        <div className={`
          relative mb-4 bg-gray-100 rounded-md overflow-hidden
          ${variant === 'featured' ? 'h-48' : 'h-32'}
          ${variant === 'compact' ? 'h-24' : ''}
        `}>
          <OptionImage
            src={option.image?.sourceUrl || option.featuredImage}
            alt={option.image?.altText || `${option.name || option.title} option`}
            placeholderType="option"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1">
          {/* Title */}
          <h3 className={`
            font-semibold text-gray-900 mb-2 leading-relaxed
            ${largeText ? 'text-3xl' : size === 'large' ? 'text-2xl' : 'text-xl'}
          `}>
            {option.name || option.title}
          </h3>

          {/* Description */}
          <RichContent 
            content={option.shortDescription || option.description || ''}
            className={`
              text-gray-700 mb-3 leading-relaxed prose prose-sm max-w-none
              ${largeText ? 'text-xl' : 'text-base'}
            `}
          />

          {/* Price */}
          {showPrice && (
            <div className={`
              font-bold text-blue-600 mb-2
              ${largeText ? 'text-4xl' : size === 'large' ? 'text-3xl' : 'text-2xl'}
            `}>
              {formatPrice(option.price)}
            </div>
          )}

          {/* SKU */}
          {option.sku && (
            <div className="text-xs text-gray-500 mb-2">
              SKU: {option.sku}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {option.adaCompliant && showSafety && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ADA Compliant
              </span>
            )}
            
            {option.safetyRating && showSafety && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Safety: {option.safetyRating}
              </span>
            )}
            
            {option.installationRequired && showInstallation && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Installation Required
              </span>
            )}
            
            {option.financingAvailable && showFinancing && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Financing Available
              </span>
            )}
          </div>

          {/* Financing Preview */}
          {showFinancing && financingOptions.length > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              From ${financingOptions[0].monthlyPayment}/mo
            </div>
          )}

          {/* Insurance Preview */}
          {showInsurance && insuranceEstimate && (
            <div className="text-sm text-green-600 mb-2">
              Insurance may cover up to ${insuranceEstimate.estimatedCoverage}
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {/* Selection Control Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e);
            }}
            disabled={disabled || loading}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200
              flex items-center justify-center gap-2
              ${isSelected 
                ? 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-600 shadow-md' 
                : 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600'
              }
              ${disabled || loading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-lg transform hover:scale-[1.02]'
              }
              ${reducedMotion ? 'transition-none' : ''}
            `}
            aria-label={isSelected ? `Remove ${option.name || option.title} from configuration` : `Add ${option.name || option.title} to configuration`}
          >
            {isSelected ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Selected
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Select
              </>
            )}
          </button>

          {/* View Details Button */}
          {showDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              aria-label={`View details for ${option.name || option.title}`}
            >
              View Details
            </button>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <OptionCardDetailsModal
        option={option}
        isOpen={internalState.detailsVisible}
        onClose={() => setInternalState(prev => ({ ...prev, detailsVisible: false }))}
        financingOptions={financingOptions}
        insuranceEstimate={insuranceEstimate}
      />

      {/* Variation Popup */}
      <OptionVariationPopup
        option={option}
        categoryId={categoryId}
        isOpen={internalState.variationPopupVisible}
        onClose={handleCloseVariationPopup}
        onAddToConfiguration={(option, variations, calculatedTotalPrice) => {
          // Handle adding to configuration with variations
          if (variations && variations.length > 0) {
            // Use the calculated total price from the popup instead of recalculating
            const optionWithVariations = {
              ...option,
              selectedVariations: variations,
              totalPrice: calculatedTotalPrice || parseFloat(option.price?.toString() || '0'), // Fallback to option price if no calculated price
              priceBreakdown: {
                basePrice: parseFloat(option.price?.toString() || '0'),
                variationsTotal: calculatedTotalPrice ? calculatedTotalPrice - parseFloat(option.price?.toString() || '0') : 0,
                combinedTotal: calculatedTotalPrice || parseFloat(option.price?.toString() || '0')
              }
            };
            
            console.log('OptionCard: Adding option with variations to configurator:', {
              optionId: option.id,
              optionName: option.name,
              basePrice: parseFloat(option.price?.toString() || '0'),
              calculatedTotalFromPopup: calculatedTotalPrice,
              finalTotalPrice: optionWithVariations.totalPrice,
              variationsCount: variations.length
            });
            
            // Add directly to the configurator store
            addOption(optionWithVariations, categoryId);
            
            // Call the onToggle prop for any additional handling (if provided)
            // onToggle?.(optionWithVariations, categoryId);
          } else {
            // For SIMPLE options or VARIABLE options without variations
            addOption(option, categoryId);
            // onToggle?.(option, categoryId);
          }
        }}
        isAlreadySelected={isSelected}
        onVariationDataError={(error) => {
          console.error('Variation data error in popup:', error);
          // Handle error appropriately - could show toast notification
          if (onError) {
            onError(option, error);
          }
        }}
      />
    </>
  );
};

export default OptionCard;