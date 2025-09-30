import React, { useState, useEffect } from 'react';
import { ConfiguratorCategory, ConfigurableProductSchema, CompatibilityIssue, SelectedOption } from '../../lib/interfaces/configurator';
import { PrimaryButton } from 'components/ui';
import OptionCard from './OptionCard';
import OptionCardSkeleton from './OptionCardSkeleton';
import styles from './ConfiguratorLayout.module.css';
import { useConfiguratorStore } from '../../stores/configuratorStore';

interface CategoryGroupProps {
  category: ConfiguratorCategory;
  selectedOptions: ConfigurableProductSchema[];
  compatibilityIssues?: CompatibilityIssue[];
  loading?: boolean;
  error?: string;
  collapsed?: boolean;
  className?: string;
  onToggleOption?: (option: ConfigurableProductSchema) => void;
  onViewDetails?: (option: ConfigurableProductSchema) => void;
  onToggleCollapse?: (collapsed: boolean) => void;
  onValidationError?: (error: string | null) => void;
  
  // Enhanced User Flow Props
  showVariationCount?: boolean;
  showRealTimePrice?: boolean;
  onOptionSelect?: (option: ConfigurableProductSchema) => void;
  selectedOptionsWithVariations?: SelectedOption[];
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  selectedOptions,
  compatibilityIssues = [],
  loading = false,
  error,
  collapsed = false,
  className = '',
  onToggleOption,
  onViewDetails,
  onToggleCollapse,
  onValidationError,
  // Enhanced User Flow Props
  showVariationCount = true,
  showRealTimePrice = true,
  onOptionSelect,
  selectedOptionsWithVariations = []
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Enhanced User Flow Integration
  const { openOptionPopup, optionProducts } = useConfiguratorStore();

  // Enhanced helper functions
  const handleOptionClick = (option: ConfigurableProductSchema) => {
    if (option.type === 'VARIABLE' && option.variations && option.variations.length > 0) {
      // Open variation popup for variable options
      openOptionPopup(option);
    } else {
      // Direct selection for simple options
      onOptionSelect?.(option);
      onToggleOption?.(option);
    }
  };

  const isOptionSelected = (optionId: string): boolean => {
    return selectedOptionsWithVariations.some(selected => selected.option.id === optionId);
  };

  const getOptionPrice = (option: ConfigurableProductSchema): number => {
    const selectedOption = selectedOptionsWithVariations.find(selected => selected.option.id === option.id);
    return selectedOption ? selectedOption.totalPrice : parseFloat(option.price?.toString() || option.regularPrice?.toString() || '0');
  };

  const getVariationCount = (option: ConfigurableProductSchema): number => {
    const selectedOption = selectedOptionsWithVariations.find(selected => selected.option.id === option.id);
    return selectedOption ? selectedOption.selectedVariations.length : 0;
  };

  // Validate category requirements
  useEffect(() => {
    if (category.required && category.minSelections) {
      const selectedCount = selectedOptions.length;
      if (selectedCount < category.minSelections) {
        const error = `Please select at least ${category.minSelections} option${category.minSelections > 1 ? 's' : ''} from ${category.name}`;
        setValidationError(error);
        onValidationError?.(error);
      } else {
        setValidationError(null);
        onValidationError?.(null);
      }
    }

    if (category.maxSelections && selectedOptions.length > category.maxSelections) {
      const error = `Maximum ${category.maxSelections} option${category.maxSelections > 1 ? 's' : ''} allowed in ${category.name}`;
      setValidationError(error);
      onValidationError?.(error);
    }
  }, [selectedOptions, category, onValidationError]);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggleCollapse?.(newCollapsed);
  };

  const isOptionSelectedInCategory = (option: ConfigurableProductSchema) => {
    return selectedOptions.some(selected => selected.databaseId === option.databaseId);
  };

  const getOptionCompatibilityIssues = (option: ConfigurableProductSchema) => {
    return compatibilityIssues.filter(issue => 
      issue.affectedOptions.includes(option.databaseId || 0)
    );
  };

  const canSelectMoreOptions = () => {
    if (!category.maxSelections) return true;
    return selectedOptions.length < category.maxSelections;
  };

  const getHeaderIcon = () => {
    if (loading || category.loadingState === 'loading') {
      return (
        <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }

    if (error || validationError) {
      return (
        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }

    if (selectedOptions.length > 0) {
      const isComplete = category.required ? 
        selectedOptions.length >= (category.minSelections || 1) : 
        selectedOptions.length > 0;
      
      return (
        <svg className={`h-5 w-5 ${isComplete ? 'text-green-500' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }

    return category.icon ? (
      <span className="text-xl" role="img" aria-label={`${category.name} icon`}>
        {category.icon}
      </span>
    ) : (
      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    );
  };

  const getProgressText = () => {
    const selectedCount = selectedOptionsWithVariations.length;
    const totalOptions = category.options?.length || 0;
    
    let progressText = '';
    if (category.multiSelect) {
      progressText = `${selectedCount}/${totalOptions} selected`;
    } else {
      progressText = selectedCount > 0 ? '1 selected' : `${totalOptions} options`;
    }
    
    // Add real-time pricing if enabled
    if (showRealTimePrice && selectedOptionsWithVariations.length > 0) {
      const totalPrice = selectedOptionsWithVariations.reduce((sum, option) => sum + option.totalPrice, 0);
      progressText += ` • $${totalPrice.toFixed(2)}`;
    }
    
    return progressText;
  };

  return (
    <div className={`option-cards-container bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-out hover:shadow-lg ${className}`}>
      {/* Phase 2: Enhanced Category Header with better animations */}
      <div className="border-b border-gray-200">
        <button
          onClick={toggleCollapse}
          className="w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-all duration-300 ease-out group"
          aria-expanded={!isCollapsed}
          aria-controls={`category-${category.id}-content`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3 transition-transform duration-300 ease-out group-hover:scale-110">
                {getHeaderIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h3 className="option-cards-title text-lg font-medium text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
                    {category.name}
                  </h3>
                  {category.required && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 transition-all duration-300 hover:bg-red-200 animate-pulse">
                      Required
                    </span>
                  )}
                  {selectedOptionsWithVariations.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full transition-all duration-300 hover:bg-blue-700 hover:scale-110 animate-[fadeIn_0.5s_ease-out]">
                      {selectedOptionsWithVariations.length}
                    </span>
                  )}
                  {showVariationCount && selectedOptionsWithVariations.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-blue-600 bg-blue-100 rounded-full transition-all duration-300 hover:bg-blue-200 hover:scale-105 animate-[slideInUp_0.4s_ease-out]">
                      {selectedOptionsWithVariations.reduce((sum, option) => sum + option.selectedVariations.length, 0)} variations
                    </span>
                  )}
                  {category.required && (
                    <span className="ml-2 text-red-500 text-sm animate-pulse" aria-label="Required">
                      *
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 transition-colors duration-300 group-hover:text-gray-800">
                  {getProgressText()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center ml-4">
              <svg
                className={`h-5 w-5 text-gray-400 transition-all duration-300 ease-out group-hover:text-blue-500 ${
                  isCollapsed ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Phase 2: Enhanced Category Description with fade transition */}
        {category.description && !isCollapsed && (
          <div className="px-6 pb-4 animate-[fadeIn_0.3s_ease-out]">
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        )}

        {/* Validation Error */}
        {(validationError || error) && !isCollapsed && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    {error ? 'Loading Error' : 'Validation Error'}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {error || validationError}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {category.helpText && !isCollapsed && !validationError && !error && (
          <div className="px-6 pb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">{category.helpText}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase 2: Enhanced Category Content with smooth transitions */}
      <div
        id={`category-${category.id}-content`}
        className={`transition-all duration-500 ease-out ${isCollapsed ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}
      >
        <div className="p-6">
          {loading || category.loadingState === 'loading' ? (
            <div className={`option-cards-loading ${styles['option-cards-loading']} animate-[fadeIn_0.5s_ease-out]`}>
              {[...Array(6)].map((_, index) => (
                <OptionCardSkeleton key={index} variant="default" enhanced={true} />
              ))}
            </div>
          ) : error ? (
            <div className={`option-cards-error ${styles['option-cards-error']} animate-[fadeIn_0.3s_ease-out]`}>
              <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                <svg className="mx-auto h-12 w-12 text-red-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-red-900">Failed to load options</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
                <div className="mt-6">
                  <PrimaryButton
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="transition-all duration-300 hover:scale-105"
                  >
                    Try Again
                  </PrimaryButton>
                </div>
              </div>
            </div>
          ) : !category.options || category.options.length === 0 ? (
            <div className={`option-cards-empty ${styles['option-cards-empty']} animate-[fadeIn_0.5s_ease-out]`}>
              <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No options available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are currently no options available in this category.
                </p>
              </div>
            </div>
          ) : (
            <div className={`option-cards-grid ${styles['option-cards-grid']} animate-[fadeIn_0.6s_ease-out]`}>
              {category.options.map((option, index) => {
                const isSelected = isOptionSelected(option.id || option.databaseId?.toString() || '');
                const optionIssues = getOptionCompatibilityIssues(option);
                const isDisabled = !canSelectMoreOptions() && !isSelected;
                const currentPrice = showRealTimePrice ? getOptionPrice(option) : parseFloat(option.price?.toString() || option.regularPrice?.toString() || '0');
                const variationCount = showVariationCount ? getVariationCount(option) : 0;

                return (
                  <div
                    key={option.databaseId}
                    className="animate-[slideInUp_0.4s_ease-out]"
                    style={{
                      // Phase 2: Staggered animation for option cards
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <OptionCard
                      option={option}
                      categoryId={category.id}
                      isSelected={isSelected}
                      disabled={isDisabled}
                      variant="default"
                      size="medium"
                      showPrice={true}
                      showCompatibility={optionIssues.length > 0}
                      compatibilityIssues={optionIssues}
                      onToggle={() => handleOptionClick(option)}
                      onViewDetails={() => onViewDetails?.(option)}
                      className={`option-card transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg ${isSelected ? 'option-card-selected ring-2 ring-blue-500' : ''} ${isDisabled ? 'option-card-disabled opacity-60' : ''}`}
                      // Enhanced User Flow Props
                      currentPrice={currentPrice}
                      variationCount={variationCount}
                      isVariable={option.type === 'VARIABLE'}
                      showVariationCount={showVariationCount}
                      showRealTimePrice={showRealTimePrice}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Selection Limits Info */}
          {!loading && category.options && category.options.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {category.multiSelect && (
                <div className="flex justify-between items-center">
                  <span>
                    {category.minSelections && (
                      <>Minimum: {category.minSelections} • </>
                    )}
                    {category.maxSelections && (
                      <>Maximum: {category.maxSelections} • </>
                    )}
                    Selected: {selectedOptions.length}
                  </span>
                  {selectedOptions.length > 0 && (
                    <button
                      onClick={() => {
                        selectedOptions.forEach(option => onToggleOption?.(option));
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryGroup;